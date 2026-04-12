# Cert Study Editor

Cross-platform desktop app for editing Nutanix certification questions. No technical knowledge required.

## Features

- 🖱️ **Click to run** — No terminal, no commands
- 💾 **Built-in database** — SQLite, no PostgreSQL setup
- 🤖 **AI Validation** — Connects to Ollama (local) to validate answers
- 📝 **WYSIWYG Editor** — Easy question editing with preview
- 🔍 **Search** — Full-text search across all questions
- 📥 **Export** — Generate Markdown files for the WinForms study app

## Download Pre-built

| Platform | Download | Size |
|----------|----------|------|
| Windows | `cert-editor_1.0.0_x64.msi` | ~8 MB |
| macOS | `cert-editor_1.0.0_x64.dmg` | ~8 MB |

## Quick Start

### 1. Install
- **Windows**: Run the `.msi`, click through installer
- **Mac**: Open `.dmg`, drag to Applications

### 2. Launch
Double-click **Cert Study Editor** — it just works.

### 3. (Optional) Connect Ollama for AI validation

If you want AI-powered question validation:

**Windows:**
1. Install Ollama from https://ollama.com
2. Open PowerShell, run:
   ```powershell
   ollama pull llama3.1
   ```
3. Keep Ollama running in background

**Mac:**
1. Install Ollama: `brew install ollama`
2. Pull model: `ollama pull llama3.1`
3. Start Ollama: `ollama serve`

The editor auto-detects Ollama. You'll see "Ollama Connected" in the status bar.

## Build from Source

### Prerequisites
- [Rust](https://rustup.rs/) (1.70+)
- [Node.js](https://nodejs.org/) (18+)

### Commands
```bash
cd cert-editor

# Install dependencies
npm install
cd src-tauri && cargo fetch && cd ..

# Dev mode (hot reload)
npm run tauri dev

# Build release
npm run tauri build
```

Output:
- Windows: `src-tauri/target/release/bundle/msi/*.msi`
- Mac: `src-tauri/target/release/bundle/dmg/*.dmg`

## Architecture

```
┌─────────────────────────────────────────┐
│  Tauri App (Rust + WebView)             │
│  ┌─────────────────────────────────────┐│
│  │ Svelte UI (Question Editor)       ││
│  │ • Forms, validation, search       ││
│  └─────────────────────────────────────┘│
│  ┌─────────────────────────────────────┐│
│  │ Rust Backend                        ││
│  │ • SQLite (embedded)               ││
│  │ • Ollama client (HTTP)            ││
│  │ • Export to Markdown               ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

## Data Storage

Database location:
- **Windows**: `%APPDATA%\com.certstudy.editor\cert_study.db`
- **Mac**: `~/Library/Application Support/com.certstudy.editor/cert_study.db`
- **Linux**: `~/.local/share/cert_study.db`

## Development

### Project Structure
```
cert-editor/
├── src-tauri/           # Rust backend
│   ├── src/
│   │   ├── main.rs      # Entry + Tauri commands
│   │   ├── db.rs        # SQLite operations
│   │   ├── models.rs    # Data types
│   │   ├── ollama.rs    # AI validation client
│   │   └── export.rs    # Markdown export
│   ├── Cargo.toml
│   └── tauri.conf.json
├── src/                 # Frontend (Svelte)
│   ├── App.svelte       # Main layout
│   └── lib/
│       ├── CertificationList.svelte
│       ├── QuestionList.svelte
│       ├── QuestionEditor.svelte
│       └── types.ts
└── package.json
```

### Adding Commands
1. Add handler in `src-tauri/src/main.rs`:
   ```rust
   #[tauri::command]
   async fn my_command(state: State<'_, AppState>) -> Result<String, String> {
       // implementation
   }
   ```
2. Register in `main()`:
   ```rust
   .invoke_handler(tauri::generate_handler![..., my_command])
   ```
3. Call from frontend:
   ```typescript
   import { invoke } from "@tauri-apps/api/tauri";
   const result = await invoke("my_command");
   ```

## License

BSD-3-Clause
