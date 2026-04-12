// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;
mod models;
mod ollama;
mod export;

use tauri::{Manager, State};
use std::sync::Arc;
use tokio::sync::Mutex;

pub struct AppState {
    db: Arc<Mutex<db::Database>>,
    ollama_url: String,
}

#[tauri::command]
async fn get_certifications(state: State<'_, AppState>) -> Result<Vec<models::Certification>, String> {
    let db = state.db.lock().await;
    db.get_certifications().await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_questions(
    state: State<'_, AppState>,
    cert_id: String,
) -> Result<Vec<models::Question>, String> {
    let db = state.db.lock().await;
    db.get_questions(&cert_id).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_question(
    state: State<'_, AppState>,
    id: i64,
) -> Result<Option<models::Question>, String> {
    let db = state.db.lock().await;
    db.get_question(id).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn save_question(
    state: State<'_, AppState>,
    question: models::QuestionInput,
) -> Result<models::Question, String> {
    let db = state.db.lock().await;
    db.save_question(question).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn delete_question(
    state: State<'_, AppState>,
    id: i64,
) -> Result<(), String> {
    let db = state.db.lock().await;
    db.delete_question(id).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn validate_question(
    state: State<'_, AppState>,
    id: i64,
) -> Result<models::ValidationResult, String> {
    let db = state.db.lock().await;
    let question = db.get_question(id).await.map_err(|e| e.to_string())?;
    
    if let Some(q) = question {
        let ollama_client = ollama::OllamaClient::new(&state.ollama_url);
        let result = ollama_client.validate(&q).await.map_err(|e| e.to_string())?;
        
        // Update validation status
        db.update_validation_status(id, &result.status, &result.reasoning).await
            .map_err(|e| e.to_string())?;
        
        Ok(result)
    } else {
        Err("Question not found".to_string())
    }
}

#[tauri::command]
async fn export_certification(
    state: State<'_, AppState>,
    cert_id: String,
    output_path: String,
) -> Result<String, String> {
    let db = state.db.lock().await;
    let questions = db.get_questions(&cert_id).await.map_err(|e| e.to_string())?;
    
    export::export_to_markdown(&questions, &output_path, &cert_id)
        .map_err(|e| e.to_string())?;
    
    Ok(output_path)
}

#[tauri::command]
async fn search_questions(
    state: State<'_, AppState>,
    query: String,
    cert_id: Option<String>,
) -> Result<Vec<models::Question>, String> {
    let db = state.db.lock().await;
    db.search_questions(&query, cert_id.as_deref()).await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn check_ollama(state: State<'_, AppState>) -> Result<bool, String> {
    let client = ollama::OllamaClient::new(&state.ollama_url);
    client.is_available().await.map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let app_dir = app.path_resolver().app_data_dir()
                .expect("Failed to get app data directory");
            
            std::fs::create_dir_all(&app_dir).ok();
            
            let db_path = app_dir.join("cert_study.db");
            let rt = tokio::runtime::Runtime::new().unwrap();
            let db = rt.block_on(db::Database::new(&db_path)).unwrap();
            
            app.manage(AppState {
                db: Arc::new(Mutex::new(db)),
                ollama_url: "http://localhost:11434".to_string(),
            });
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_certifications,
            get_questions,
            get_question,
            save_question,
            delete_question,
            validate_question,
            export_certification,
            search_questions,
            check_ollama,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
