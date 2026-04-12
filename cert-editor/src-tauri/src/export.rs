use crate::models::Question;
use std::fs;
use std::path::Path;

pub fn export_to_markdown(
    questions: &[Question],
    output_path: &str,
    cert_id: &str,
) -> anyhow::Result<()> {
    let path = Path::new(output_path);
    
    // Ensure directory exists
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }

    let mut md = String::new();

    // Header
    md.push_str(&format!("# {}\n\n", cert_id));
    md.push_str("Auto-generated question bank\n\n");

    // Group by domain
    let mut current_domain = String::new();
    
    for q in questions {
        // Domain header if changed
        if q.domain != current_domain {
            current_domain = q.domain.clone();
            md.push_str(&format!("## {}\n\n", current_domain));
        }

        // Question header
        let type_marker = if q.q_type == "multi" { " (Select TWO)" } else { "" };
        md.push_str(&format!("### Q{}{}\n\n", q.number, type_marker));

        // Stem
        md.push_str(&format!("{}\n\n", q.stem));

        // Answers
        for ans in &q.answers {
            md.push_str(&format!("- {}. {}\n", ans.letter, ans.text));
        }
        md.push('\n');

        // Correct answer(s)
        let correct: Vec<&str> = q
            .answers
            .iter()
            .filter(|a| a.is_correct)
            .map(|a| a.letter.as_str())
            .collect();
        md.push_str(&format!("**Answer: {}**\n\n", correct.join(", ")));

        // Explanation
        if !q.explanation.is_empty() {
            md.push_str(&format!("{}\n\n", q.explanation));
        }

        // KB references
        if !q.kb_refs.is_empty() {
            md.push_str(&format!("**References:** {}\n\n", q.kb_refs.join(", ")));
        }

        // Separator
        md.push_str("---\n\n");
    }

    fs::write(path, md)?;
    Ok(())
}

pub fn export_all_questions_json(
    questions: &[Question],
    output_path: &str,
) -> anyhow::Result<()> {
    let json = serde_json::to_string_pretty(questions)?;
    fs::write(output_path, json)?;
    Ok(())
}
