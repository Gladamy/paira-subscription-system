// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::process::{Command, Stdio};
use std::sync::{Arc, Mutex};
use std::fs;
use tauri::{State, Emitter, Manager};
use tauri_plugin_shell::ShellExt;
use sha2::{Sha256, Digest};
use reqwest;

#[derive(Default)]
struct BotState {
    process: Arc<Mutex<Option<tauri_plugin_shell::process::CommandChild>>>,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn start_bot(app: tauri::AppHandle, state: State<'_, BotState>) -> Result<String, String> {
    let mut process_guard = state.process.lock().unwrap();
    if process_guard.is_some() {
        return Err("Bot is already running".to_string());
    }

    // Get the resource directory where the bot executable is located
    let resource_dir = app
        .path()
        .resource_dir()
        .map_err(|e| format!("Failed to get resource directory: {}", e))?;

    let bot_exe_path = resource_dir.join("bot.dist").join("bot-x86_64-pc-windows-msvc.exe");

    // Verify the executable exists
    if !bot_exe_path.exists() {
        return Err(format!("Bot executable not found at: {:?}", bot_exe_path));
    }

    // Spawn the bot process directly
    let (mut rx, child) = app
        .shell()
        .command(bot_exe_path.to_string_lossy().to_string())
        .env("PYTHONUNBUFFERED", "1")
        .spawn()
        .map_err(|e| format!("Failed to start bot: {}", e))?;

    let app_handle_stdout = app.clone();
    let app_handle_stderr = app.clone();

    // Spawn async task to handle output
    tauri::async_runtime::spawn(async move {
        while let Some(event) = rx.recv().await {
            match event {
                tauri_plugin_shell::process::CommandEvent::Stdout(line_bytes) => {
                    if let Ok(line) = String::from_utf8(line_bytes) {
                        let _ = app_handle_stdout.emit("bot-log", line);
                    }
                }
                tauri_plugin_shell::process::CommandEvent::Stderr(line_bytes) => {
                    if let Ok(line) = String::from_utf8(line_bytes) {
                        let _ = app_handle_stderr.emit("bot-log", format!("ERROR: {}", line));
                    }
                }
                _ => {}
            }
        }
    });

    *process_guard = Some(child);
    Ok("Bot started successfully".to_string())
}

#[tauri::command]
fn stop_bot(state: State<'_, BotState>) -> Result<String, String> {
    let mut process_guard = state.process.lock().unwrap();
    if let Some(child) = process_guard.take() {
        child.kill().map_err(|e| format!("Failed to stop bot: {}", e))?;
        Ok("Bot stopped".to_string())
    } else {
        Err("Bot is not running".to_string())
    }
}

#[tauri::command]
fn get_bot_status(state: State<'_, BotState>) -> String {
    let process_guard = state.process.lock().unwrap();
    if process_guard.is_some() {
        "Running".to_string()
    } else {
        "Stopped".to_string()
    }
}


#[tauri::command]
fn get_config(app: tauri::AppHandle) -> Result<String, String> {
    let resource_dir = app
        .path()
        .resource_dir()
        .map_err(|e| format!("Failed to get resource directory: {}", e))?;

    let config_path = resource_dir.join("config.json");
    fs::read_to_string(config_path).map_err(|e| format!("Failed to read config: {}", e))
}

#[tauri::command]
fn save_config(app: tauri::AppHandle, config: String) -> Result<(), String> {
    let resource_dir = app
        .path()
        .resource_dir()
        .map_err(|e| format!("Failed to get resource directory: {}", e))?;

    let config_path = resource_dir.join("config.json");
    fs::write(config_path, config).map_err(|e| format!("Failed to save config: {}", e))
}

#[tauri::command]
fn get_hwid() -> Result<String, String> {
    // Try multiple methods to get system identifier
    // Method 1: PowerShell (most reliable on Windows)
    let ps_result = Command::new("powershell")
        .args(&["-Command", "(Get-WmiObject -Class Win32_ComputerSystemProduct).UUID"])
        .output();

    if let Ok(output) = ps_result {
        if output.status.success() {
            let uuid = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if !uuid.is_empty() && uuid != "UUID" {
                let mut hasher = Sha256::new();
                hasher.update(uuid.as_bytes());
                let hash = hasher.finalize();
                return Ok(format!("{:x}", hash));
            }
        }
    }

    // Method 2: WMIC (fallback)
    let wmic_result = Command::new("wmic")
        .args(&["csproduct", "get", "uuid", "/value"])
        .output();

    if let Ok(output) = wmic_result {
        if output.status.success() {
            let output_str = String::from_utf8_lossy(&output.stdout);
            if let Some(uuid_line) = output_str.lines().find(|line| line.starts_with("UUID=")) {
                if let Some(uuid) = uuid_line.split('=').nth(1) {
                    let clean_uuid = uuid.trim();
                    if !clean_uuid.is_empty() {
                        let mut hasher = Sha256::new();
                        hasher.update(clean_uuid.as_bytes());
                        let hash = hasher.finalize();
                        return Ok(format!("{:x}", hash));
                    }
                }
            }
        }
    }

    // Method 3: Use machine GUID from registry (most basic fallback)
    let reg_result = Command::new("reg")
        .args(&["query", "HKLM\\SOFTWARE\\Microsoft\\Cryptography", "/v", "MachineGuid"])
        .output();

    if let Ok(output) = reg_result {
        if output.status.success() {
            let output_str = String::from_utf8_lossy(&output.stdout);
            if let Some(guid_line) = output_str.lines().find(|line| line.contains("MachineGuid")) {
                if let Some(guid) = guid_line.split_whitespace().last() {
                    let mut hasher = Sha256::new();
                    hasher.update(guid.as_bytes());
                    let hash = hasher.finalize();
                    return Ok(format!("{:x}", hash));
                }
            }
        }
    }

    Err("Unable to retrieve system identifier from any available method".to_string())
}

#[tauri::command]
fn get_device_name() -> Result<String, String> {
    // Try PowerShell first
    let ps_result = Command::new("powershell")
        .args(&["-Command", "(Get-WmiObject -Class Win32_ComputerSystem).Name"])
        .output();

    if let Ok(output) = ps_result {
        if output.status.success() {
            let name = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if !name.is_empty() {
                return Ok(name);
            }
        }
    }

    // Fallback to WMIC
    let wmic_result = Command::new("wmic")
        .args(&["computersystem", "get", "name", "/value"])
        .output();

    if let Ok(output) = wmic_result {
        if output.status.success() {
            let output_str = String::from_utf8_lossy(&output.stdout);
            if let Some(name_line) = output_str.lines().find(|line| line.starts_with("Name=")) {
                if let Some(name) = name_line.split('=').nth(1) {
                    let clean_name = name.trim();
                    if !clean_name.is_empty() {
                        return Ok(clean_name.to_string());
                    }
                }
            }
        }
    }

    // Final fallback - use environment variable
    if let Ok(computer_name) = std::env::var("COMPUTERNAME") {
        return Ok(computer_name);
    }

    Ok("Unknown Device".to_string())
}

#[tauri::command]
async fn validate_license(hwid: String, user_token: String) -> Result<serde_json::Value, String> {
    // This is a placeholder for license validation
    // In production, this would call your backend API
    let client = reqwest::Client::new();

    // Placeholder API call - replace with your actual backend URL
    let response = client
        .post("https://your-backend-api.com/api/licenses/validate")
        .header("Authorization", format!("Bearer {}", user_token))
        .json(&serde_json::json!({
            "hwid": hwid
        }))
        .send()
        .await
        .map_err(|e| format!("Network error: {}", e))?;

    if response.status().is_success() {
        let result: serde_json::Value = response.json().await
            .map_err(|e| format!("JSON parse error: {}", e))?;
        Ok(result)
    } else {
        Err(format!("License validation failed: {}", response.status()))
    }
}

#[tauri::command]
async fn check_for_updates() -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    let api_base = std::env::var("API_BASE").unwrap_or_else(|_| "https://api.paira.live".to_string());

    let response = client
        .get(format!("{}/api/updates/latest", api_base))
        .send()
        .await
        .map_err(|e| format!("Network error: {}", e))?;

    if response.status().is_success() {
        let result: serde_json::Value = response.json().await
            .map_err(|e| format!("JSON parse error: {}", e))?;
        Ok(result)
    } else {
        Err(format!("Failed to check for updates: {}", response.status()))
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .manage(BotState::default())
        .invoke_handler(tauri::generate_handler![greet, start_bot, stop_bot, get_bot_status, get_config, save_config, get_hwid, get_device_name, validate_license, check_for_updates])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
