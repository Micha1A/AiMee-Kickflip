mod crypto;
mod llm;

use std::fs;
use serde::Serialize;

#[derive(Serialize)]
struct CommandResponse {
    success: bool,
    message: String,
    container_size: Option<usize>,
    payload_size: Option<usize>,
}

#[tauri::command]
async fn encrypt_file(
    input_path: String,
    output_path: String,
    password: String,
    use_llm: bool,
    api_key: String,
    model: String,
) -> Result<CommandResponse, String> {
    let data = fs::read(&input_path).map_err(|e| e.to_string())?;
    let encrypted = crypto::encrypt_aes192(&data, &password);
    let needed = crypto::TARGET_SIZE - (2 + encrypted.len());
    let noise = if use_llm && !api_key.is_empty() {
        llm::get_llm_noise(needed, &api_key, &model).await
    } else {
        llm::get_pure_entropy(needed)
    };
    let container = crypto::wrap_in_kyber_shell(&encrypted, &noise)?;
    fs::write(&output_path, &container).map_err(|e| e.to_string())?;
    Ok(CommandResponse { 
        success: true, 
        message: "Encryption successful".into(), 
        container_size: Some(container.len()), 
        payload_size: Some(encrypted.len()) 
    })
}

#[tauri::command]
async fn decrypt_file(input_path: String, output_path: String, password: String, _use_llm: bool, _api_key: String, _model: String) -> Result<CommandResponse, String> {
    let container = fs::read(&input_path).map_err(|e| e.to_string())?;
    let encrypted = crypto::unwrap_kyber_shell(&container)?;
    let decrypted = crypto::decrypt_aes192(&encrypted, &password)?;
    fs::write(&output_path, &decrypted).map_err(|e| e.to_string())?;
    Ok(CommandResponse { 
        success: true, 
        message: "Decryption successful".into(), 
        container_size: Some(container.len()), 
        payload_size: Some(decrypted.len()) 
    })
}

#[tauri::command]
fn get_decrypted_content(path: String) -> Result<String, String> {
    let bytes = fs::read(&path).map_err(|e| e.to_string())?;
    String::from_utf8(bytes).map_err(|_| "Binary content".into())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            encrypt_file, 
            decrypt_file,
            get_decrypted_content
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}