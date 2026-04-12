use sqlx::{sqlite::SqlitePoolOptions, Pool, Sqlite};
use std::path::Path;

use crate::models::*;

pub struct Database {
    pool: Pool<Sqlite>,
}

impl Database {
    pub async fn new(db_path: &Path) -> anyhow::Result<Self> {
        let pool = SqlitePoolOptions::new()
            .max_connections(5)
            .connect(&format!("sqlite:{}", db_path.display()))
            .await?;

        // Initialize schema
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS certifications (
                id TEXT PRIMARY KEY,
                code TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                version TEXT,
                question_count INTEGER DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cert_id TEXT NOT NULL,
                domain TEXT NOT NULL,
                number INTEGER NOT NULL,
                q_type TEXT DEFAULT 'single',
                stem TEXT NOT NULL,
                explanation TEXT,
                difficulty INTEGER DEFAULT 3,
                status TEXT DEFAULT 'draft',
                kb_refs TEXT,  -- JSON array
                validation_reasoning TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(cert_id, number)
            );

            CREATE TABLE IF NOT EXISTS answers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                question_id INTEGER NOT NULL,
                letter TEXT NOT NULL,
                text TEXT NOT NULL,
                is_correct INTEGER DEFAULT 0,
                FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_questions_cert ON questions(cert_id);
            CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);
            CREATE INDEX IF NOT EXISTS idx_answers_question ON answers(question_id);
            "#,
        )
        .execute(&pool)
        .await?;

        // Insert default certifications
        let certs = vec![
            ("ncp-us-610", "NCP-US-6.10", "Nutanix Certified Professional - Unified Storage", "6.10"),
            ("ncp-ci-610", "NCP-CI-6.10", "Nutanix Certified Professional - Cloud Integration", "6.10"),
            ("ncp-ai-610", "NCP-AI-6.10", "Nutanix Certified Professional - AI Infrastructure", "6.10"),
            ("ncm-mci-610", "NCM-MCI-6.10", "Nutanix Certified Master - Multicloud Infrastructure", "6.10"),
        ];

        for (id, code, name, version) in certs {
            sqlx::query(
                "INSERT OR IGNORE INTO certifications (id, code, name, version) VALUES (?1, ?2, ?3, ?4)"
            )
            .bind(id)
            .bind(code)
            .bind(name)
            .bind(version)
            .execute(&pool)
            .await?;
        }

        Ok(Self { pool })
    }

    pub async fn get_certifications(&self) -> anyhow::Result<Vec<Certification>> {
        let rows = sqlx::query_as!(
            Certification,
            r#"
            SELECT 
                c.id as "id!",
                c.code as "code!",
                c.name as "name!",
                c.version as "version!",
                COUNT(q.id) as "question_count!"
            FROM certifications c
            LEFT JOIN questions q ON q.cert_id = c.id
            GROUP BY c.id
            ORDER BY c.code
            "#
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(rows)
    }

    pub async fn get_questions(&self, cert_id: &str) -> anyhow::Result<Vec<Question>> {
        let rows = sqlx::query!(
            r#"
            SELECT 
                q.id, q.cert_id, q.domain, q.number, q.q_type,
                q.stem, q.explanation, q.difficulty, q.status,
                q.kb_refs, q.validation_reasoning,
                q.created_at, q.updated_at
            FROM questions q
            WHERE q.cert_id = ?1
            ORDER BY q.number
            "#,
            cert_id
        )
        .fetch_all(&self.pool)
        .await?;

        let mut questions = Vec::new();
        for row in rows {
            let answers = self.get_answers(row.id).await?;
            let kb_refs: Vec<String> = serde_json::from_str(&row.kb_refs.unwrap_or_default())
                .unwrap_or_default();

            questions.push(Question {
                id: row.id,
                cert_id: row.cert_id,
                domain: row.domain,
                number: row.number,
                q_type: row.q_type,
                stem: row.stem,
                explanation: row.explanation.unwrap_or_default(),
                difficulty: row.difficulty,
                status: row.status,
                answers,
                kb_refs,
                validation_reasoning: row.validation_reasoning,
                created_at: row.created_at,
                updated_at: row.updated_at,
            });
        }

        Ok(questions)
    }

    pub async fn get_question(&self, id: i64) -> anyhow::Result<Option<Question>> {
        let row = sqlx::query!(
            r#"
            SELECT 
                q.id, q.cert_id, q.domain, q.number, q.q_type,
                q.stem, q.explanation, q.difficulty, q.status,
                q.kb_refs, q.validation_reasoning,
                q.created_at, q.updated_at
            FROM questions q
            WHERE q.id = ?1
            "#,
            id
        )
        .fetch_optional(&self.pool)
        .await?;

        if let Some(row) = row {
            let answers = self.get_answers(row.id).await?;
            let kb_refs: Vec<String> = serde_json::from_str(&row.kb_refs.unwrap_or_default())
                .unwrap_or_default();

            Ok(Some(Question {
                id: row.id,
                cert_id: row.cert_id,
                domain: row.domain,
                number: row.number,
                q_type: row.q_type,
                stem: row.stem,
                explanation: row.explanation.unwrap_or_default(),
                difficulty: row.difficulty,
                status: row.status,
                answers,
                kb_refs,
                validation_reasoning: row.validation_reasoning,
                created_at: row.created_at,
                updated_at: row.updated_at,
            }))
        } else {
            Ok(None)
        }
    }

    async fn get_answers(&self, question_id: i64) -> anyhow::Result<Vec<Answer>> {
        let answers = sqlx::query_as!(
            Answer,
            r#"
            SELECT 
                letter as "letter!",
                text as "text!",
                is_correct as "is_correct: bool"
            FROM answers
            WHERE question_id = ?1
            ORDER BY 
                CASE letter
                    WHEN 'A' THEN 1
                    WHEN 'B' THEN 2
                    WHEN 'C' THEN 3
                    WHEN 'D' THEN 4
                    WHEN 'E' THEN 5
                    WHEN 'F' THEN 6
                    ELSE 99
                END
            "#,
            question_id
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(answers)
    }

    pub async fn save_question(&self, input: QuestionInput) -> anyhow::Result<Question> {
        let kb_refs_json = serde_json::to_string(&input.kb_refs)?;

        let id = if let Some(existing_id) = input.id {
            // Update
            sqlx::query!(
                r#"
                UPDATE questions SET
                    cert_id = ?1,
                    domain = ?2,
                    number = ?3,
                    q_type = ?4,
                    stem = ?5,
                    explanation = ?6,
                    difficulty = ?7,
                    kb_refs = ?8,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?9
                "#,
                input.cert_id,
                input.domain,
                input.number,
                input.q_type,
                input.stem,
                input.explanation,
                input.difficulty,
                kb_refs_json,
                existing_id
            )
            .execute(&self.pool)
            .await?;

            // Delete old answers
            sqlx::query!("DELETE FROM answers WHERE question_id = ?1", existing_id)
                .execute(&self.pool)
                .await?;

            existing_id
        } else {
            // Insert
            let result = sqlx::query!(
                r#"
                INSERT INTO questions 
                (cert_id, domain, number, q_type, stem, explanation, difficulty, kb_refs)
                VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
                "#,
                input.cert_id,
                input.domain,
                input.number,
                input.q_type,
                input.stem,
                input.explanation,
                input.difficulty,
                kb_refs_json,
            )
            .execute(&self.pool)
            .await?;

            result.last_insert_rowid()
        };

        // Insert new answers
        for ans in &input.answers {
            sqlx::query!(
                "INSERT INTO answers (question_id, letter, text, is_correct) VALUES (?1, ?2, ?3, ?4)",
                id,
                ans.letter,
                ans.text,
                ans.is_correct
            )
            .execute(&self.pool)
            .await?;
        }

        self.get_question(id).await?.ok_or_else(|| anyhow::anyhow!("Failed to retrieve saved question"))
    }

    pub async fn delete_question(&self, id: i64) -> anyhow::Result<()> {
        sqlx::query!("DELETE FROM questions WHERE id = ?1", id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    pub async fn update_validation_status(
        &self,
        id: i64,
        status: &str,
        reasoning: &str,
    ) -> anyhow::Result<()> {
        sqlx::query!(
            "UPDATE questions SET status = ?1, validation_reasoning = ?2, updated_at = CURRENT_TIMESTAMP WHERE id = ?3",
            status,
            reasoning,
            id
        )
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    pub async fn search_questions(
        &self,
        query: &str,
        cert_id: Option<&str>,
    ) -> anyhow::Result<Vec<Question>> {
        let sql = if let Some(cert) = cert_id {
            r#"
            SELECT 
                q.id, q.cert_id, q.domain, q.number, q.q_type,
                q.stem, q.explanation, q.difficulty, q.status,
                q.kb_refs, q.validation_reasoning,
                q.created_at, q.updated_at
            FROM questions q
            WHERE q.stem LIKE ?1 AND q.cert_id = ?2
            ORDER BY q.number
            "#
        } else {
            r#"
            SELECT 
                q.id, q.cert_id, q.domain, q.number, q.q_type,
                q.stem, q.explanation, q.difficulty, q.status,
                q.kb_refs, q.validation_reasoning,
                q.created_at, q.updated_at
            FROM questions q
            WHERE q.stem LIKE ?1
            ORDER BY q.number
            "#
        };

        let search_pattern = format!("%{}%", query);
        
        let rows = if let Some(cert) = cert_id {
            sqlx::query!(sql, search_pattern, cert)
                .fetch_all(&self.pool)
                .await?
        } else {
            sqlx::query!(sql, search_pattern)
                .fetch_all(&self.pool)
                .await?
        };

        let mut questions = Vec::new();
        for row in rows {
            let answers = self.get_answers(row.id).await?;
            let kb_refs: Vec<String> = serde_json::from_str(&row.kb_refs.unwrap_or_default())
                .unwrap_or_default();

            questions.push(Question {
                id: row.id,
                cert_id: row.cert_id,
                domain: row.domain,
                number: row.number,
                q_type: row.q_type,
                stem: row.stem,
                explanation: row.explanation.unwrap_or_default(),
                difficulty: row.difficulty,
                status: row.status,
                answers,
                kb_refs,
                validation_reasoning: row.validation_reasoning,
                created_at: row.created_at,
                updated_at: row.updated_at,
            });
        }

        Ok(questions)
    }
}
