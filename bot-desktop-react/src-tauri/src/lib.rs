// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::process::{Command, Stdio};
use std::sync::{Arc, Mutex};
use std::thread;
use std::io::{BufRead, BufReader};
use std::fs;
use tauri::{State, Emitter};
use sha2::{Sha256, Digest};
use reqwest;

#[derive(Default)]
struct BotState {
    process: Arc<Mutex<Option<std::process::Child>>>,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn start_bot(app: tauri::AppHandle, state: State<BotState>) -> Result<String, String> {
    let mut process_guard = state.process.lock().unwrap();
    if process_guard.is_some() {
        return Err("Bot is already running".to_string());
    }

    // Run python bot.py in the parent directory
    let mut child = Command::new("python")
        .arg("bot.py")
        .current_dir("../../")
        .env("PYTHONUNBUFFERED", "1")
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to start bot: {}", e))?;

    let stdout = child.stdout.take().unwrap();
    let stderr = child.stderr.take().unwrap();
    let app_handle_stdout = app.clone();
    let app_handle_stderr = app.clone();

    // Spawn thread to read stdout
    thread::spawn(move || {
        let reader = BufReader::new(stdout);
        for line in reader.lines() {
            if let Ok(line) = line {
                let _ = app_handle_stdout.emit("bot-log", line);
            }
        }
    });

    // Spawn thread to read stderr
    thread::spawn(move || {
        let reader = BufReader::new(stderr);
        for line in reader.lines() {
            if let Ok(line) = line {
                let _ = app_handle_stderr.emit("bot-log", format!("ERROR: {}", line));
            }
        }
    });

    *process_guard = Some(child);
    Ok("Bot started".to_string())
}

#[tauri::command]
fn stop_bot(state: State<BotState>) -> Result<String, String> {
    let mut process_guard = state.process.lock().unwrap();
    if let Some(mut child) = process_guard.take() {
        child.kill().map_err(|e| format!("Failed to stop bot: {}", e))?;
        Ok("Bot stopped".to_string())
    } else {
        Err("Bot is not running".to_string())
    }
}

#[tauri::command]
fn get_bot_status(state: State<BotState>) -> String {
    let process_guard = state.process.lock().unwrap();
    if process_guard.is_some() {
        "Running".to_string()
    } else {
        "Stopped".to_string()
    }
}


#[tauri::command]
fn get_config() -> Result<String, String> {
    fs::read_to_string("../../config.json").map_err(|e| format!("Failed to read config: {}", e))
}

#[tauri::command]
fn save_config(config: String) -> Result<(), String> {
    fs::write("../../config.json", config).map_err(|e| format!("Failed to save config: {}", e))
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .manage(BotState::default())
        .invoke_handler(tauri::generate_handler![greet, start_bot, stop_bot, get_bot_status, get_config, save_config, get_hwid, get_device_name, validate_license])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
