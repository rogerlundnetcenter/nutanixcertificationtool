# 🎯 Sprint Plan: .NET MAUI Blazor Certification Wiki

**Branch:** `maui-wiki-editor`  
**Goal:** Cross-platform native editor (Windows .exe + Mac .app) for 8K questions  
**Stack:** .NET 8 MAUI + Blazor Hybrid + SQLite

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
**Goal:** Full question editing with validation

| Task | Owner | Est | Deliverable |
|------|-------|-----|-------------|
| 2.1 Dashboard component | Frontend | 4h | Certification cards with question counts |
| 2.2 Question list view | Frontend | 6h | Sortable/filterable table |
| 2.3 Question editor form | Frontend | 8h | Stem, answers, explanation fields |
| 2.4 Answer management | Frontend | 4h | Add/remove answers, mark correct |
| 2.5 QuestionService CRUD | Backend | 4h | Create, Read, Update, Delete |
| 2.6 Auto-save debounce | Backend | 3h | 2-second auto-save to SQLite |
| 2.7 Form validation | Frontend | 3h | Required fields, at least 1 correct answer |
| 2.8 Integration test | QA | 4h | Full CRUD cycle works end-to-end |

**Sprint 2 Exit Criteria:**
- [ ] Create new question
- [ ] Edit existing question
- [ ] Delete question
- [ ] Auto-save works (no data loss)
- [ ] Form validation prevents bad data

---

### **Sprint 3: Search & Scale (Week 3)**
**Goal:** Handle 8K questions with fast search

| Task | Owner | Est | Deliverable |
|------|-------|-----|-------------|
| 3.1 SQLite FTS5 virtual table | Backend | 4h | Full-text search index |
| 3.2 SearchService | Backend | 4h | Query parser, ranking |
| 3.3 Search UI component | Frontend | 4h | Search bar with filters |
| 3.4 Results highlighting | Frontend | 3h | Match highlighting in stems |
| 3.5 Domain filtering | Frontend | 3h | Dropdown by certification domain |
| 3.6 Pagination | Frontend | 4h | Virtual scrolling for 8K items |
| 3.7 Performance test | QA | 4h | <100ms search on 5K questions |
| 3.8 Stress test data | QA | 2h | Generate 1000 test questions |

**Sprint 3 Exit Criteria:**
- [ ] Search 5,000 questions in <100ms
- [ ] Filter by certification, domain, status
- [ ] Pagination doesn't lag on large sets
- [ ] Virtual scrolling smooth at 8K items

---

### **Sprint 4: WinForms Integration (Week 4)**
**Goal:** Export to Markdown for existing app

| Task | Owner | Est | Deliverable |
|------|-------|-----|-------------|
| 4.1 MarkdownExporter service | Backend | 6h | Convert Question → Markdown |
| 4.2 Match WinForms format exactly | Backend | 4h | Same headers, structure, metadata |
| 4.3 Bulk export UI | Frontend | 4h | "Export All" button per certification |
| 4.4 Selective export UI | Frontend | 3h | Checkbox selection + export |
| 4.5 Export settings | Frontend | 3h | Output path, naming convention |
| 4.6 WinForms compatibility test | QA | 4h | Export → WinForms loads correctly |
| 4.7 Bidirectional sync research | Backend | 3h | Can WinForms changes come back? |
| 4.8 Migration guide | Docs | 2h | Document export workflow |

**Sprint 4 Exit Criteria:**
- [ ] Export generates valid Markdown
- [ ] WinForms app reads exported files
- [ ] Format matches existing exam packs
- [ ] No data loss in round-trip

---

### **Sprint 5: AI Validation (Week 5)**
**Goal:** Ollama integration for quality checks

| Task | Owner | Est | Deliverable |
|------|-------|-----|-------------|
| 5.1 Ollama HTTP client | Backend | 3h | POST to localhost:11434 |
| 5.2 Validation prompt template | Backend | 4h | System prompt for question review |
| 5.3 Response parser | Backend | 3h | Parse JSON from LLM output |
| 5.4 Validation results UI | Frontend | 4h | Display AI feedback inline |
| 5.5 "Validate" button | Frontend | 2h | Trigger validation per question |
| 5.6 Batch validation | Backend | 4h | Queue multiple questions |
| 5.7 Validation history | Backend | 3h | Store results in SQLite |
| 5.8 Model selection UI | Frontend | 2h | Choose llama3.1, mistral, etc. |
| 5.9 Offline handling | Backend | 3h | Graceful when Ollama unavailable |

**Sprint 5 Exit Criteria:**
- [ ] Detects Ollama running
- [ ] Validates single question
- [ ] Shows reasoning/suggestions
- [ ] Works offline (skips validation)
- [ ] Batch validate 10 questions

---

### **Sprint 6: Polish & Deploy (Week 6)**
**Goal:** Production-ready for both platforms

| Task | Owner | Est | Deliverable |
|------|-------|-----|-------------|
| 6.1 Synthwave UI polish | Frontend | 6h | Colors, animations, dark mode |
| 6.2 Keyboard shortcuts | Frontend | 3h | Ctrl+S, Ctrl+N, etc. |
| 6.3 Windows installer (.msi) | DevOps | 4h | WiX or MSIX package |
| 6.4 Mac app bundle (.app) | DevOps | 4h | Signed .app with Info.plist |
| 6.5 Auto-updater | Backend | 4h | Check GitHub releases |
| 6.6 First-run wizard | Frontend | 3h | Welcome, import existing data |
| 6.7 Settings persistence | Backend | 3h | User preferences in SQLite |
| 6.8 Error logging | Backend | 3h | Structured logging to file |
| 6.9 E2E test suite | QA | 6h | Automate critical paths |
| 6.10 User documentation | Docs | 4h | Quick start guide |

**Sprint 6 Exit Criteria:**
- [ ] Windows: `CertStudy.Maui.exe` installs via .msi
- [ ] Mac: `Cert Study Editor.app` opens normally
- [ ] Auto-updater finds new versions
- [ ] First-run wizard imports existing Markdown
- [ ] All critical paths have automated tests

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