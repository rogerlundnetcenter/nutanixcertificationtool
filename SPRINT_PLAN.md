# 🎯 Sprint Plan: .NET MAUI Blazor Certification Wiki

**Branch:** `maui-wiki-editor`  
**Goal:** Cross-platform native editor (Windows .exe + Mac .app) for 8K questions  
**Stack:** .NET 8 MAUI + Blazor Hybrid + SQLite

## 🧩 Modular Coding Standards

**Max 500 lines per file** — if a file grows larger, split it.

| File Type | Max Lines | Split Strategy |
|-----------|-----------|----------------|
| `.cs` service | 500 | Split by feature area |
| `.razor` component | 500 | Extract sub-components |
| `.razor.cs` code-behind | 300 | Move logic to service |
| `.css` | N/A | Organize by component |
| `.cshtml` | 200 | Use partials |

**Naming:** `<Feature><Purpose>.<ext>` — e.g., `QuestionEditForm.razor`, `ExportMarkdownCommand.cs`

---

## 📋 Project Structure

```
CertStudy.Maui/
├── CertStudy.Maui.csproj
├── MauiProgram.cs
├── App.xaml / App.xaml.cs
├── MainPage.xaml              # Hosts BlazorWebView
├── wwwroot/
│   ├── index.html
│   └── css/
│       └── app.css
├── Components/                 # Blazor components
│   ├── App.razor
│   ├── Layout/
│   │   ├── MainLayout.razor
│   │   └── NavMenu.razor
│   ├── Pages/
│   │   ├── Dashboard.razor      # Certification overview
│   │   ├── Questions.razor      # Question list/grid
│   │   ├── QuestionEdit.razor   # WYSIWYG editor
│   │   ├── Search.razor         # Full-text search
│   │   └── Settings.razor     # Ollama config, export paths
│   └── _Imports.razor
├── Data/
│   ├── AppDbContext.cs
│   ├── Entities/
│   │   ├── Certification.cs
│   │   ├── Question.cs
│   │   ├── Answer.cs
│   │   └── Domain.cs
│   └── Migrations/
├── Services/
│   ├── QuestionService.cs
│   ├── SearchService.cs         # SQLite FTS5
│   ├── MarkdownExportService.cs # WinForms compatibility
│   ├── OllamaValidationService.cs
│   └── DatabaseInitializer.cs
├── Platforms/
│   ├── Windows/
│   │   ├── Package.appxmanifest
│   │   └── App.xaml
│   ├── MacCatalyst/
│   │   ├── Info.plist
│   │   └── Entitlements.plist
│   └── Android/
│       └── (excluded - not needed)
└── SharedResources/
    └── (fonts, images)
```

---

## 🗓️ Sprint Breakdown

### **Sprint 1: Foundation (Week 1)**
**Goal:** Project scaffold + SQLite + Basic navigation

| Task | Owner | Est | Deliverable |
|------|-------|-----|-------------|
| 1.1 Create MAUI Blazor project | Backend | 2h | `CertStudy.Maui.csproj` builds |
| 1.2 EF Core + SQLite setup | Backend | 4h | `AppDbContext` with migrations |
| 1.3 Entity models | Backend | 3h | Question, Answer, Certification classes |
| 1.4 Database initializer | Backend | 3h | Seed default certifications |
| 1.5 Main layout shell | Frontend | 4h | Sidebar + content area (synthwave theme) |
| 1.6 Navigation routing | Frontend | 3h | Dashboard → Questions → Edit flow |
| 1.7 Integration test | QA | 2h | App launches, shows certification list |

**Sprint 1 Exit Criteria:**
- [ ] `dotnet build -f net8.0-maccatalyst` succeeds
- [ ] `dotnet build -f net8.0-windows10.0.19041` succeeds
- [ ] App launches, shows 4 default certifications
- [ ] SQLite file auto-creates on first run

---

### **Sprint 2: Core CRUD (Week 2)**
**Goal:** Full question editing with validation — **modular components only**

| Task | Owner | Est | Deliverable | Lines |
|------|-------|-----|-------------|-------|
| 2.1 Dashboard component | Frontend | 4h | `Dashboard.razor` | <100 |
| 2.2 Question list view | Frontend | 6h | `QuestionList.razor` + `QuestionListItem.razor` | <150 each |
| 2.3 Question editor shell | Frontend | 4h | `QuestionEdit.razor` (extract to partials) | <200 |
| 2.4 Answer editor sub-component | Frontend | 4h | `AnswerEditor.razor` | <150 |
| 2.5 Domain selector component | Frontend | 3h | `DomainSelector.razor` | <100 |
| 2.6 QuestionService CRUD | Backend | 4h | `QuestionCommandService.cs` | <300 |
| 2.7 Auto-save timer service | Backend | 3h | `AutoSaveTimer.cs` | <150 |
| 2.8 Form validation service | Backend | 3h | `QuestionValidator.cs` | <200 |
| 2.9 Integration test | QA | 4h | Full CRUD cycle works end-to-end | — |

**Modular Deliverables:**
- [ ] `AnswerEditor.razor` — isolated answer management
- [ ] `ValidationDisplay.razor` — reusable validation UI
- [ ] `QuestionValidator.cs` — validation rules separate from UI
- [ ] No file exceeds 500 lines

---

### **Sprint 3: Search & Scale (Week 3)**
**Goal:** Handle 8K questions with fast search — **split services by concern**

| Task | Owner | Est | Deliverable | Lines |
|------|-------|-----|-------------|-------|
| 3.1 FTS5 index setup | Backend | 4h | `Fts5IndexService.cs` | <200 |
| 3.2 Query builder service | Backend | 4h | `SearchQueryBuilder.cs` | <200 |
| 3.3 Search results component | Frontend | 4h | `SearchResults.razor` | <150 |
| 3.4 Highlight component | Frontend | 3h | `HighlightMatch.razor` | <100 |
| 3.5 Filter bar component | Frontend | 3h | `SearchFilters.razor` | <150 |
| 3.6 Virtual scroller | Frontend | 4h | `VirtualQuestionList.razor` | <200 |
| 3.7 Performance test | QA | 4h | <100ms search on 5K questions | — |
| 3.8 Stress test data | QA | 2h | Generate 1000 test questions | — |

**Modular Deliverables:**
- [ ] `Fts5IndexService.cs` — database search only
- [ ] `SearchQueryBuilder.cs` — query construction logic
- [ ] `HighlightMatch.razor` — reusable text highlighting
- [ ] `VirtualQuestionList.razor` — handles large lists
- [ ] All search-related files under 300 lines

---

### **Sprint 4: WinForms Integration (Week 4)**
**Goal:** Export to Markdown for existing app — **separate format handlers**

| Task | Owner | Est | Deliverable | Lines |
|------|-------|-----|-------------|-------|
| 4.1 Markdown format handler | Backend | 4h | `MarkdownFormatter.cs` | <200 |
| 4.2 Question serializer | Backend | 3h | `QuestionSerializer.cs` | <150 |
| 4.3 Export command service | Backend | 3h | `ExportCommand.cs` | <200 |
| 4.4 Bulk export dialog | Frontend | 4h | `BulkExportDialog.razor` | <150 |
| 4.5 Selective export UI | Frontend | 3h | `SelectiveExport.razor` | <150 |
| 4.6 Export settings service | Backend | 2h | `ExportSettingsService.cs` | <150 |
| 4.7 WinForms compatibility test | QA | 4h | Export → WinForms loads correctly | — |
| 4.8 Migration guide | Docs | 2h | Document export workflow | — |

**Modular Deliverables:**
- [ ] `MarkdownFormatter.cs` — only format logic
- [ ] `QuestionSerializer.cs` — JSON ↔ Model only
- [ ] `ExportCommand.cs` — orchestrates, no format logic
- [ ] `ExportSettingsService.cs` — user preferences only

---

### **Sprint 5: AI Validation (Week 5)**
**Goal:** Ollama integration — **isolated client components**

| Task | Owner | Est | Deliverable | Lines |
|------|-------|-----|-------------|-------|
| 5.1 Ollama client | Backend | 3h | `OllamaClient.cs` (extract from existing) | <200 |
| 5.2 Prompt builder service | Backend | 4h | `ValidationPromptBuilder.cs` | <200 |
| 5.3 Response parser | Backend | 3h | `ValidationResponseParser.cs` | <150 |
| 5.4 Validation results component | Frontend | 4h | `ValidationResultCard.razor` | <150 |
| 5.5 Validate button component | Frontend | 2h | `ValidateButton.razor` | <100 |
| 5.6 Batch validation queue | Backend | 4h | `BatchValidationQueue.cs` | <200 |
| 5.7 Validation history store | Backend | 3h | `ValidationHistoryService.cs` | <200 |
| 5.8 Model selector component | Frontend | 2h | `ModelSelector.razor` | <100 |
| 5.9 Offline mode handler | Backend | 3h | `OfflineValidationHandler.cs` | <150 |

**Modular Deliverables:**
- [ ] `OllamaClient.cs` — HTTP only, no prompt logic
- [ ] `ValidationPromptBuilder.cs` — prompt templates only
- [ ] `ValidationResponseParser.cs` — JSON parsing only
- [ ] `ValidationResultCard.razor` — display only

---

### **Sprint 6: Polish & Deploy (Week 6)**
**Goal:** Production-ready for both platforms — **platform-specific handlers**

| Task | Owner | Est | Deliverable | Lines |
|------|-------|-----|-------------|-------|
| 6.1 Synthwave UI polish | Frontend | 6h | `ThemeManager.cs` | <200 |
| 6.2 Keyboard shortcuts | Frontend | 3h | `KeyboardShortcutHandler.razor` | <150 |
| 6.3 Windows installer (.msi) | DevOps | 4h | `WindowsPackageBuilder.cs` | <200 |
| 6.4 Mac app bundle (.app) | DevOps | 4h | `MacBundleBuilder.cs` | <200 |
| 6.5 Auto-updater | Backend | 4h | `UpdateCheckerService.cs` | <200 |
| 6.6 First-run wizard | Frontend | 3h | `FirstRunWizard.razor` | <200 |
| 6.7 Settings persistence | Backend | 3h | `SettingsService.cs` | <200 |
| 6.8 Error logging | Backend | 3h | `ErrorLogger.cs` | <150 |
| 6.9 E2E test suite | QA | 6h | Critical path automation | — |
| 6.10 User documentation | Docs | 4h | Quick start guide | — |

**Modular Deliverables:**
- [ ] `WindowsPackageBuilder.cs` — Windows-only packaging
- [ ] `MacBundleBuilder.cs` — macOS-only bundling
- [ ] `UpdateCheckerService.cs` — version check logic only
- [ ] `SettingsService.cs` — preferences storage only
- [ ] `ThemeManager.cs` — theme state management only
- [ ] `ErrorLogger.cs` — logging abstraction only

---

## 📊 Velocity & Capacity

| Sprint | Points | Focus |
|--------|--------|-------|
| 1 | 21 | Foundation |
| 2 | 34 | Core features |
| 3 | 28 | Performance |
| 4 | 26 | Integration |
| 5 | 29 | AI features |
| 6 | 36 | Polish |
| **Total** | **174** | **6 weeks** |

---

## 🛠️ Tech Stack Details

### Dependencies (NuGet)
```xml
<PackageReference Include="Microsoft.Maui.Controls" Version="8.0.6" />
<PackageReference Include="Microsoft.AspNetCore.Components.WebView.Maui" Version="8.0.6" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Sqlite" Version="8.0.0" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="8.0.0" />
<PackageReference Include="System.Net.Http.Json" Version="8.0.0" />
```

### Build Matrix
```bash
# Windows
# Output: bin/Release/net8.0-windows10.0.19041/win10-x64/CertStudy.Maui.exe
dotnet publish -f net8.0-windows10.0.19041 -c Release \
  -p:WindowsPackageType=None \
  --self-contained true

# Mac
# Output: bin/Release/net8.0-maccatalyst/maccatalyst-arm64/CertStudy.Maui.app
dotnet publish -f net8.0-maccatalyst -c Release \
  -p:MtouchLink=SdkOnly \
  --self-contained true
```

---

## 🎯 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Build time | <2 min | `dotnet build` duration |
| App startup | <3 sec | Time to interactive |
| Search latency | <100ms | FTS5 query time |
| Export 1K questions | <5 sec | Bulk export duration |
| Binary size | <50MB | Single-file executable |
| Test coverage | >80% | Lines covered |

---

## ⚠️ Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| MAUI Mac support unstable | High | Fallback to Blazor Server for Mac |
| SQLite FTS5 not available | Medium | Use LIKE queries + caching |
| Ollama API changes | Low | Abstract behind interface |
| WinForms format drift | Medium | Document format, add tests |
| Large dataset performance | Medium | Pagination + virtualization |

---

## 🚀 Immediate Next Steps

1. **Today:** Scaffold project structure (Sprint 1.1-1.2)
2. **Tomorrow:** Database models + migrations (Sprint 1.3-1.4)
3. **This week:** Basic navigation + certification list (Sprint 1.5-1.7)

Ready to start Sprint 1?