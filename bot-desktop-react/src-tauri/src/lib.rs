// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::process::{Command, Stdio};
use std::sync::{Arc, Mutex};
use std::fs;
use std::path::PathBuf;
use tauri::{State, Emitter, Manager};
use tauri_plugin_shell::ShellExt;
use sha2::{Sha256, Digest};
use reqwest;
use chrono;

#[derive(Default)]
struct BotState {
    process: Arc<Mutex<Option<tauri_plugin_shell::process::CommandChild>>>,
}

#[tauri::command]
fn setup_desktop_folder(app: tauri::AppHandle) -> Result<String, String> {
    // Get the app data directory to check for first-run marker
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;

    let first_run_marker = app_data_dir.join("first_run_complete");

    // Check if this is the first run
    if first_run_marker.exists() {
        return Ok("Desktop setup already completed".to_string());
    }

    // Get desktop path
    let desktop_path = dirs::desktop_dir()
        .ok_or("Could not find desktop directory")?;

    let paira_folder = desktop_path.join("Paira Bot");

    // Create Paira Bot folder on desktop
    fs::create_dir_all(&paira_folder)
        .map_err(|e| format!("Failed to create desktop folder: {}", e))?;

    // Get the resource directory where all the bot files are located
    let resource_dir = app
        .path()
        .resource_dir()
        .map_err(|e| format!("Failed to get resource directory: {}", e))?;

    println!("Resource directory: {:?}", resource_dir);

    // Copy the entire bot.dist folder (contains Python executable and dependencies)
    let bot_dist_source = resource_dir.join("bot.dist");
    let bot_dist_dest = paira_folder.join("bot.dist");

    if bot_dist_source.exists() {
        println!("Copying bot.dist from {:?} to {:?}", bot_dist_source, bot_dist_dest);
        copy_dir_recursive(&bot_dist_source, &bot_dist_dest)
            .map_err(|e| format!("Failed to copy bot.dist: {}", e))?;
    } else {
        println!("bot.dist not found at {:?}", bot_dist_source);
        // Try alternative locations
        let alt_resource_dir = resource_dir.parent().unwrap_or(&resource_dir);
        let alt_bot_dist = alt_resource_dir.join("bot.dist");
        if alt_bot_dist.exists() {
            println!("Found bot.dist at alternative location: {:?}", alt_bot_dist);
            copy_dir_recursive(&alt_bot_dist, &bot_dist_dest)
                .map_err(|e| format!("Failed to copy bot.dist from alt location: {}", e))?;
        }
    }

    // Copy config.json
    let config_source = resource_dir.join("config.json");
    let config_dest = paira_folder.join("config.json");

    if config_source.exists() {
        println!("Copying config.json from {:?} to {:?}", config_source, config_dest);
        fs::copy(&config_source, &config_dest)
            .map_err(|e| format!("Failed to copy config file: {}", e))?;
    } else {
        println!("config.json not found at {:?}", config_source);
        // Create a default config file
        let default_config = r#"{
  "trading": {
    "enabled": false,
    "max_trades_per_hour": 10,
    "min_profit_margin": 5,
    "auto_sell_enabled": true
  },
  "notifications": {
    "enabled": true,
    "desktop_notifications": true,
    "sound_enabled": false
  },
  "advanced": {
    "debug_mode": false,
    "log_level": "info"
  }
}"#;
        fs::write(&config_dest, default_config)
            .map_err(|e| format!("Failed to create default config file: {}", e))?;
    }

    // Create a batch file to launch the bot directly from the desktop folder
    let bot_exe_path = bot_dist_dest.join("bot-x86_64-pc-windows-msvc.exe");

    let launcher_content = format!(
        r#"@echo off
echo Starting Paira Bot...
cd /d "{}"
start "" "{}"
echo Paira Bot launched from desktop folder!
echo.
echo If the bot doesn't start, make sure all files are in this folder.
pause
"#,
        paira_folder.display(),
        bot_exe_path.display()
    );

    let launcher_path = paira_folder.join("Run Paira Bot.bat");
    fs::write(&launcher_path, launcher_content)
        .map_err(|e| format!("Failed to create launcher: {}", e))?;

    // Create a README file with instructions
    let readme_content = format!(r#"Welcome to Paira Bot!

This folder contains EVERYTHING you need to run Paira Bot directly from your desktop!

📁 Complete Folder Contents:
├── bot.dist/ (Python bot with all dependencies)
│   ├── bot-x86_64-pc-windows-msvc.exe (main bot executable)
│   ├── python313.dll
│   ├── _bz2.pyd
│   └── ... (all Python dependencies)
├── config.json (your configuration file)
├── Run Paira Bot.bat (launcher script)
└── README.txt (this file)

🚀 How to Run the Bot:
1. Make sure you're signed into the desktop app first
2. Double-click "Run Paira Bot.bat"
3. The bot will start with all necessary files from this folder
4. Check the console output for status messages

⚙️ Configuration:
- Edit config.json to customize bot settings
- All changes are saved automatically

📊 Bot Features:
- Automated Roblox trading
- Real-time price tracking
- Profit optimization
- HWID-based licensing

📖 Troubleshooting:
- If bot doesn't start: Check that all files are in this folder
- If config errors: Make sure config.json is present and valid
- If permission errors: Try running as administrator

📞 Support:
Visit: https://paira.live
Support: support@paira.live

Happy Trading! 🎯

---
Folder created: {}
Setup completed: {}
"#, paira_folder.display(), chrono::Utc::now().format("%Y-%m-%d %H:%M:%S UTC"));

    let readme_path = paira_folder.join("README.txt");
    fs::write(&readme_path, readme_content)
        .map_err(|e| format!("Failed to create README file: {}", e))?;

    // Mark first run as complete
    fs::write(&first_run_marker, "completed")
        .map_err(|e| format!("Failed to create first-run marker: {}", e))?;

    Ok(format!("Complete desktop setup finished! All bot files copied to: {}", paira_folder.display()))
}

// Helper function to copy directories recursively
fn copy_dir_recursive(src: &PathBuf, dst: &PathBuf) -> Result<(), String> {
    if !src.exists() {
        return Err(format!("Source directory does not exist: {:?}", src));
    }

    fs::create_dir_all(dst)
        .map_err(|e| format!("Failed to create destination directory: {}", e))?;

    for entry in fs::read_dir(src)
        .map_err(|e| format!("Failed to read source directory: {}", e))? {
        let entry = entry
            .map_err(|e| format!("Failed to read directory entry: {}", e))?;
        let entry_path = entry.path();
        let file_name = entry_path.file_name()
            .ok_or("Failed to get file name")?;
        let dest_path = dst.join(file_name);

        if entry_path.is_dir() {
            copy_dir_recursive(&entry_path, &dest_path)?;
        } else {
            fs::copy(&entry_path, &dest_path)
                .map_err(|e| format!("Failed to copy file {:?} to {:?}: {}", entry_path, dest_path, e))?;
        }
    }

    Ok(())
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
        .invoke_handler(tauri::generate_handler![greet, setup_desktop_folder, start_bot, stop_bot, get_bot_status, get_config, save_config, get_hwid, get_device_name, validate_license, check_for_updates])
        .setup(|app| {
            // Run desktop setup on app startup
            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                match setup_desktop_folder(app_handle) {
                    Ok(message) => println!("Desktop setup: {}", message),
                    Err(error) => eprintln!("Desktop setup failed: {}", error),
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
