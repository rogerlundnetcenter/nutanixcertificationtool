# Nutanix Certification Question Validation - Web Search Verification

## TL;DR

> **Smart-focus validation of 1,280 Nutanix certification questions using web search + KB cross-reference**
> 
> **Deliverables**:
> - Deep validation of ~40 flagged questions (Phase 1)
> - Spot-check validation of 40 random questions (10 per exam) (Phase 2)
> - Quick reference guide for memorization (Phase 3)
> - Patch files for all discrepancies (human review required)
> - Validation reports with source URLs
> 
> **Estimated Effort**: Large (~15-20 hours total vs 107 hours for full re-validation)
> **Parallel Execution**: YES - 4 exam tracks running in parallel
> **Critical Path**: Phase 1 (flagged questions) → Phase 2 (spot check) → Phase 3 (reference guide) → Final QA
> **User Decisions**: Option A (smart focus), Option A (patch files), Option A (standard hierarchy)

---

## Context

### Original Request
User wants to validate all 1,280 Nutanix certification exam questions via web search to ensure accuracy before memorization for upcoming exam (less than 1 week timeline).

### Repository Discovery
- **Total questions**: 1,280 across 4 exams (NCP-US, NCP-CI, NCP-AI, NCM-MCI)
- **Format**: Markdown files with stem, options, marked answer, explanation
- **Existing validation**: 51 validation files in `/validation/` directory
- **Current accuracy**: 96.9% already validated
- **Flagged questions**: ~40 questions (3.1%) needing review
- **Tools**: `validate_answers.py` CLI for batch parsing

### Key Findings from Metis Consultation
1. **Timeline conflict**: Full validation would require 107 hours (impossible in <1 week)
2. **Smart focus viable**: Target the 40 flagged questions + spot check 40 more
3. **Auto-update risk**: High risk of AI hallucination overwriting correct answers
4. **Source hierarchy needed**: Official Docs > KB > Test Prep

### User Decisions (Confirmed)
- **Scope**: Option A - Smart focus (40 flagged + 40 spot check, not all 1,280)
- **Updates**: Option A - Generate patch files (manual review, not auto-apply)
- **Hierarchy**: Option A - Standard (Official Docs > KB > Test Prep)

---

## Work Objectives

### Core Objective
Validate and correct the ~40 flagged questions with deep web search verification, plus spot-check 40 additional questions, generating patches for all discrepancies and creating a memorization-ready reference guide.

### Concrete Deliverables
1. **Phase 1**: Deep validation of ~40 flagged questions with 2+ source citations per question
2. **Phase 2**: Spot-check of 40 random questions (10 per exam)
3. **Phase 3**: Quick reference guide with high-confidence questions ranked
4. **Patches**: `.patch` files for all discrepancies requiring human review
5. **Reports**: Validation reports per batch with source URLs and confidence scores

### Definition of Done
- [ ] All 40 flagged questions validated with source URLs
- [ ] All 40 spot-check questions validated with source URLs  
- [ ] Patch files generated for all discrepancies (>0 answer changes)
- [ ] Quick reference guide compiled with high-confidence questions
- [ ] Final validation report with statistics (validated/total, accuracy %)

### Must Have (Non-Negotiable)
- 2+ authoritative sources per answer change
- Source URLs documented for every validation
- Patch files for human review (no auto-apply)
- Version context for all AOS-specific answers
- Final QA verification of all patches

### Must NOT Have (Guardrails from Metis)
- ❌ Auto-updating markdown files without review
- ❌ Single-source validation for answer changes
- ❌ Paywall bypass (ethical/legal risk)
- ❌ Re-validating questions already marked "VERIFIED" at 96.9% confidence
- ❌ Modifying question stems (only answers and explanations)
- ❌ Creating new questions or removing existing ones

---

## Verification Strategy

### Test Infrastructure Assessment
- **Test framework**: Python scripts only (validate_answers.py)
- **Automated tests**: NO - validation is web search + human review
- **QA approach**: Agent-executed verification using web search tools

### QA Policy
Every task MUST include agent-executed QA scenarios:

- **Web search validation**: Use `websearch_web_search_exa` to find authoritative sources
- **Documentation retrieval**: Use `webfetch` to retrieve KB articles and official docs
- **Source verification**: Verify URLs are from nutanix.com domains or reputable test prep
- **Cross-reference**: Validate answer against 2+ independent sources
- **Patch verification**: Read generated patch files to confirm format correctness

### QA Scenario Requirements
- **Minimum**: 1 happy-path validation per question
- **Evidence**: Save source URLs and snippets to `.sisyphus/evidence/`
- **Negative scenarios**: Verify what happens when sources conflict
- **Specificity**: Use exact Nutanix product versions (e.g., "AOS 6.10")

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Phase 1 - Flagged Questions - Start Immediately):
├── Task 1: Load and parse existing validation reports [quick]
├── Task 2: Identify the ~40 flagged questions across all exams [quick]
├── Task 3: Batch flagged questions into 4 groups (10 per exam) [quick]
├── Task 4: NCP-US flagged questions validation (10 Q) [deep]
├── Task 5: NCP-CI flagged questions validation (10 Q) [deep]
├── Task 6: NCP-AI flagged questions validation (10 Q) [deep]
└── Task 7: NCM-MCI flagged questions validation (10 Q) [deep]

Wave 2 (Phase 1 - Analysis & Patching - After Wave 1):
├── Task 8: Compile validation results and identify discrepancies [unspecified-high]
├── Task 9: Generate patch files for NCP-US discrepancies [unspecified-high]
├── Task 10: Generate patch files for NCP-CI discrepancies [unspecified-high]
├── Task 11: Generate patch files for NCP-AI discrepancies [unspecified-high]
└── Task 12: Generate patch files for NCM-MCI discrepancies [unspecified-high]

Wave 3 (Phase 2 - Spot Check - Parallel with Wave 2):
├── Task 13: Random sample selection (10 per exam = 40 total) [quick]
├── Task 14: NCP-US spot-check validation (10 Q) [unspecified-high]
├── Task 15: NCP-CI spot-check validation (10 Q) [unspecified-high]
├── Task 16: NCP-AI spot-check validation (10 Q) [unspecified-high]
└── Task 17: NCM-MCI spot-check validation (10 Q) [unspecified-high]

Wave 4 (Phase 3 - Reference Guide - After Waves 2-3):
├── Task 18: Compile high-confidence question list [unspecified-high]
├── Task 19: Generate quick reference guide (memorization format) [writing]
├── Task 20: Create source URL index [unspecified-high]
└── Task 21: Build final validation report with statistics [unspecified-high]

Wave FINAL (After ALL tasks - 4 parallel reviews, then user okay):
├── Task F1: Plan compliance audit (oracle) - Verify all flagged questions validated
├── Task F2: Patch file review (unspecified-high) - Check patch format and completeness
├── Task F3: Source verification (unspecified-high) - Verify all source URLs are valid
└── Task F4: Statistics validation (deep) - Verify accuracy calculations
-> Present results -> Get explicit user okay

Critical Path: Task 1-3 → Task 4-7 (parallel) → Task 8 → Task 9-12 (parallel) → Task 18-21 → F1-F4 → user okay
Parallel Speedup: ~60% faster than sequential
Max Concurrent: 7 (Wave 1 + Wave 3 overlap possible)
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| 1-3 | — | 4-7 |
| 4-7 | 1-3 | 8 |
| 8 | 4-7 | 9-12, 13 |
| 9-12 | 8 | — |
| 13 | 8 | 14-17 |
| 14-17 | 13 | 18 |
| 18-21 | 9-12, 14-17 | F1-F4 |
| F1-F4 | 18-21 | — |

### Agent Dispatch Summary

- **Wave 1**: **7 tasks** → T1-T3 `quick`, T4-T7 `deep`
- **Wave 2**: **5 tasks** → T8-T12 `unspecified-high`
- **Wave 3**: **5 tasks** → T13 `quick`, T14-T17 `unspecified-high`
- **Wave 4**: **4 tasks** → T18-T21 `unspecified-high`/`writing`
- **FINAL**: **4 tasks** → F1 `oracle`, F2-F4 `unspecified-high`/`deep`

---

- [ ] 1. Load and Parse Existing Validation Reports

  **What to do**:
  - Read all files in `/validation/` directory
  - Parse validation reports to identify flagged questions
  - Extract question IDs, marked answers, and validation status
  - Create a master list of ~40 flagged questions needing review
  - Read `validation/INDEX.md` for validation methodology

  **Must NOT do**:
  - ❌ Re-validate questions marked "VERIFIED" at 96.9%+
  - ❌ Modify existing validation files
  - ❌ Create new validation methodology (use existing)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: File reading and parsing only, no complex logic
  - **Skills**: []
    - No specialized skills needed for file parsing

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1 starter)
  - **Parallel Group**: Wave 1 (with Tasks 2-3)
  - **Blocks**: Tasks 4-7
  - **Blocked By**: None (can start immediately)

  **References**:
  - `validation/INDEX.md` - Validation methodology overview
  - `validation/llm-val-*.log` - LLM validation logs per exam
  - `validation/kb-100-*.md` - KB coverage verification reports
  - `validate_answers.py` - Question parsing patterns

  **Acceptance Criteria**:
  - [ ] All `/validation/*.md` and `/validation/*.log` files read
  - [ ] Master list of flagged questions created (~40 items)
  - [ ] Each flagged question has: exam code, question number, current marked answer, validation status
  - [ ] List saved to `.sisyphus/evidence/flagged-questions.json`

  **QA Scenarios**:
  ```
  Scenario: Parse validation reports correctly
    Tool: Bash (python script)
    Preconditions: Repository cloned, validation/ directory exists
    Steps:
      1. Run: python3 -c "import json; print(json.dumps([f for f in __import__('os').listdir('validation/') if f.endswith('.md') or f.endswith('.log')], indent=2))"
      2. Verify: At least 40 flagged questions identified
      3. Verify: Each has exam, number, answer, status fields
    Expected Result: JSON file created with ~40 flagged questions
    Evidence: .sisyphus/evidence/task-1-flagged-questions.json
  ```

  **Evidence to Capture**:
  - [ ] Screenshot or file listing of validation/ directory
  - [ ] flagged-questions.json with complete question list

  **Commit**: NO (working files only)

---

- [ ] 2. Identify and Categorize Flagged Questions by Exam

  **What to do**:
  - Take the master list from Task 1
  - Categorize flagged questions by exam (NCP-US, NCP-CI, NCP-AI, NCM-MCI)
  - Sort by question number within each exam
  - Determine batch assignments (aim for ~10 per exam)
  - Identify any exams with more/less than 10 flagged questions

  **Must NOT do**:
  - ❌ Create new categories beyond the 4 existing exams
  - ❌ Re-order questions within existing structure
  - ❌ Skip exams that might have 0 flagged questions

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Data organization and categorization only
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1)
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: Tasks 4-7
  - **Blocked By**: Task 1

  **References**:
  - `.sisyphus/evidence/flagged-questions.json` (from Task 1)
  - Question files: `NCP-US-Part*.md`, `NCP-CI-Part*.md`, `NCP-AI-Part*.md`, `NCM-MCI-Part*.md`

  **Acceptance Criteria**:
  - [ ] Questions categorized by 4 exams
  - [ ] Each exam has question count documented
  - [ ] Batching plan created (which questions in which batch)
  - [ ] Output saved to `.sisyphus/evidence/question-batches.json`

  **QA Scenarios**:
  ```
  Scenario: Categorize flagged questions
    Tool: Bash (jq or python)
    Preconditions: Task 1 completed, flagged-questions.json exists
    Steps:
      1. Read flagged-questions.json
      2. Group by "exam" field
      3. Count per exam
      4. Verify: All 4 exams represented
    Expected Result: question-batches.json with exam categories and counts
    Evidence: .sisyphus/evidence/task-2-question-batches.json
  ```

  **Evidence to Capture**:
  - [ ] question-batches.json showing distribution

  **Commit**: NO

---

- [ ] 3. Prepare Batch Configuration and Validation Templates

  **What to do**:
  - Create batch configuration files for each exam
  - Define validation template structure (what data to collect per question)
  - Set up output directory structure for evidence and patches
  - Create validation tracking spreadsheet/JSON template

  **Must NOT do**:
  - ❌ Modify the actual question markdown files yet
  - ❌ Start web searches before batches are configured

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1)
  - **Parallel Group**: Wave 1 (with Tasks 1-2)
  - **Blocks**: Tasks 4-7
  - **Blocked By**: Task 2

  **References**:
  - `validate_answers.py:115-127` - Question format for validation
  - `.sisyphus/evidence/question-batches.json` (from Task 2)

  **Acceptance Criteria**:
  - [ ] Batch config files created: `.sisyphus/config/batch-*.json`
  - [ ] Validation template defined (fields: question, options, marked_answer, sources[], verdict, confidence)
  - [ ] Output directories created: `.sisyphus/evidence/`, `.sisyphus/patches/`
  - [ ] Tracking template ready for validation results

  **QA Scenarios**:
  ```
  Scenario: Verify batch configuration
    Tool: Bash (ls and cat)
    Preconditions: Directories created
    Steps:
      1. List: ls -la .sisyphus/config/
      2. Verify: batch-*.json files exist for each exam
      3. Verify: Directories evidence/ and patches/ exist
    Expected Result: All config files and directories in place
    Evidence: .sisyphus/evidence/task-3-config-check.txt
  ```

  **Evidence to Capture**:
  - [ ] Directory listing screenshot
  - [ ] Sample batch config file content

  **Commit**: NO

---

- [ ] 4. Validate NCP-US Flagged Questions (Deep Web Search)

  **What to do**:
  - Process ~10 flagged NCP-US questions
  - For each question:
    1. Read question stem, options, marked answer from markdown
    2. Search web for authoritative sources using `websearch_web_search_exa`
    3. Search Nutanix KB and official documentation
    4. Verify marked answer against 2+ independent sources
    5. Document source URLs and relevant snippets
    6. Determine if answer is correct or needs correction
    7. Record confidence level (HIGH/MEDIUM/LOW)
  - Handle multi-select questions (format: "Answer: A, C")

  **Must NOT do**:
  - ❌ Use only test prep sites (must have official doc or KB backup)
  - ❌ Accept single-source validation
  - ❌ Modify question files directly
  - ❌ Skip questions that are hard to validate

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Requires careful research, source evaluation, and cross-referencing
  - **Skills**: []
    - Uses web search and web fetch tools directly

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1 - with Tasks 5-7)
  - **Parallel Group**: Wave 1 validation batch
  - **Blocks**: Task 8 (compilation)
  - **Blocked By**: Tasks 1-3

  **References**:
  - Question file: `NCP-US-Part1.md`, `NCP-US-Part2-D3.md`, `NCP-US-Part2-D4.md`
  - Nutanix official docs: https://www.nutanixbible.com/, https://portal.nutanix.com/
  - Search query examples: "nutanix files minimum fsvm", "nutanix objects worker nodes"

  **Acceptance Criteria**:
  - [ ] All ~10 NCP-US flagged questions validated
  - [ ] Each question has 2+ source URLs documented
  - [ ] Validation verdict recorded (CORRECT/NEEDS_CORRECTION/UNCERTAIN)
  - [ ] Confidence level assigned
  - [ ] Results saved to `.sisyphus/evidence/ncp-us-validation.json`

  **QA Scenarios**:
  ```
  Scenario: Validate single question with web search
    Tool: websearch_web_search_exa
    Preconditions: Question text available
    Steps:
      1. Search: "nutanix [question topic] official documentation"
      2. Search: "nutanix [question topic] KB article"
      3. Fetch: Use webfetch on top 2 results
      4. Compare: Verify marked answer against sources
      5. Document: Record URLs and relevant text
    Expected Result: Question validated with 2+ sources
    Evidence: .sisyphus/evidence/ncp-us-validation.json

  Scenario: Handle multi-select question
    Tool: websearch_web_search_exa
    Preconditions: Multi-select format detected ("Answer: A, C")
    Steps:
      1. Validate each marked answer option separately
      2. Verify all required options are marked
      3. Check for any extra incorrect options marked
    Expected Result: All selected options validated
    Evidence: .sisyphus/evidence/ncp-us-validation.json (multi-select field)
  ```

  **Evidence to Capture**:
  - [ ] ncp-us-validation.json with all questions
  - [ ] Source URL snippets saved

  **Commit**: NO

---

- [ ] 5. Validate NCP-CI Flagged Questions (Deep Web Search)

  **What to do**:
  - Same process as Task 4, but for NCP-CI exam questions
  - Process ~10 flagged NCP-CI questions
  - Focus on Cloud Integration topics (AWS, Azure, GCP integration with Nutanix)

  **Must NOT do**:
  - ❌ Same as Task 4 restrictions

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1 - with Tasks 4, 6-7)
  - **Parallel Group**: Wave 1 validation batch
  - **Blocks**: Task 8
  - **Blocked By**: Tasks 1-3

  **References**:
  - Question files: `NCP-CI-Part1.md` through `NCP-CI-Part4.md`
  - Cloud topics: NC2 (Nutanix Cloud Clusters), CSP integrations

  **Acceptance Criteria**:
  - [ ] All ~10 NCP-CI flagged questions validated
  - [ ] 2+ sources per question
  - [ ] Results in `.sisyphus/evidence/ncp-ci-validation.json`

  **QA Scenarios**:
  ```
  Scenario: Validate cloud integration question
    Tool: websearch_web_search_exa
    Preconditions: NC2/AWS/Azure question
    Steps:
      1. Search: "nutanix nc2 aws requirements"
      2. Search: "nutanix cloud integration official docs"
      3. Verify answer against deployment guides
    Expected Result: Cloud-specific question validated
    Evidence: .sisyphus/evidence/ncp-ci-validation.json
  ```

  **Evidence to Capture**:
  - [ ] ncp-ci-validation.json

  **Commit**: NO

---

- [ ] 6. Validate NCP-AI Flagged Questions (Deep Web Search)

  **What to do**:
  - Same process as Task 4, but for NCP-AI exam questions
  - Process ~10 flagged NCP-AI questions
  - Focus on AI Infrastructure topics (GPU, ML workloads, GPT-in-a-Box)

  **Must NOT do**:
  - ❌ Same as Task 4 restrictions

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1 - with Tasks 4-5, 7)
  - **Parallel Group**: Wave 1 validation batch
  - **Blocks**: Task 8
  - **Blocked By**: Tasks 1-3

  **References**:
  - Question files: `NCP-AI-Part1.md` through `NCP-AI-Part4.md`
  - AI topics: GPT-in-a-Box, GPU passthrough, ML cluster sizing

  **Acceptance Criteria**:
  - [ ] All ~10 NCP-AI flagged questions validated
  - [ ] 2+ sources per question
  - [ ] Results in `.sisyphus/evidence/ncp-ai-validation.json`

  **QA Scenarios**:
  ```
  Scenario: Validate AI infrastructure question
    Tool: websearch_web_search_exa
    Preconditions: GPU/ML workload question
    Steps:
      1. Search: "nutanix gpt-in-a-box requirements"
      2. Search: "nutanix gpu passthrough configuration"
    Expected Result: AI-specific question validated
    Evidence: .sisyphus/evidence/ncp-ai-validation.json
  ```

  **Evidence to Capture**:
  - [ ] ncp-ai-validation.json

  **Commit**: NO

---

- [ ] 7. Validate NCM-MCI Flagged Questions (Deep Web Search)

  **What to do**:
  - Same process as Task 4, but for NCM-MCI exam questions
  - Process ~10 flagged NCM-MCI questions
  - Focus on Master-level Multicloud Infrastructure topics

  **Must NOT do**:
  - ❌ Same as Task 4 restrictions

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1 - with Tasks 4-6)
  - **Parallel Group**: Wave 1 validation batch
  - **Blocks**: Task 8
  - **Blocked By**: Tasks 1-3

  **References**:
  - Question files: `NCM-MCI-Part1.md` through `NCM-MCI-Part4.md`
  - Master topics: Advanced troubleshooting, multi-cluster management

  **Acceptance Criteria**:
  - [ ] All ~10 NCM-MCI flagged questions validated
  - [ ] 2+ sources per question
  - [ ] Results in `.sisyphus/evidence/ncm-mci-validation.json`

  **QA Scenarios**:
  ```
  Scenario: Validate master-level infrastructure question
    Tool: websearch_web_search_exa
    Preconditions: Multi-cluster or advanced scenario
    Steps:
      1. Search: "nutanix multicluster management best practices"
      2. Search: "nutanix advanced troubleshooting guide"
    Expected Result: Master-level question validated
    Evidence: .sisyphus/evidence/ncm-mci-validation.json
  ```

  **Evidence to Capture**:
  - [ ] ncm-mci-validation.json

  **Commit**: NO

---

- [ ] 8. Compile Validation Results and Identify Discrepancies

  **What to do**:
  - Aggregate all validation results from Tasks 4-7
  - Compare marked answers against validated answers
  - Identify discrepancies (wrong answers, outdated info)
  - Calculate confidence scores and validation statistics
  - Generate discrepancy report with question details and sources

  **Must NOT do**:
  - ❌ Make judgment calls without source evidence
  - ❌ Skip discrepancies that are hard to resolve
  - ❌ Modify question files yet

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Data analysis and comparison across 4 exam validation files
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (Wave 2 starter - requires Wave 1 completion)
  - **Parallel Group**: Wave 2
  - **Blocks**: Tasks 9-12 (patch generation)
  - **Blocked By**: Tasks 4-7

  **References**:
  - `.sisyphus/evidence/ncp-us-validation.json`
  - `.sisyphus/evidence/ncp-ci-validation.json`
  - `.sisyphus/evidence/ncp-ai-validation.json`
  - `.sisyphus/evidence/ncm-mci-validation.json`

  **Acceptance Criteria**:
  - [ ] All 4 validation JSON files loaded and parsed
  - [ ] Discrepancy count calculated (questions needing correction)
  - [ ] Each discrepancy has: question ref, current answer, correct answer, sources[], confidence
  - [ ] Summary statistics generated (total validated, discrepancies found, % accuracy)
  - [ ] Results saved to `.sisyphus/evidence/discrepancy-report.json`

  **QA Scenarios**:
  ```
  Scenario: Compile and identify discrepancies
    Tool: Bash (python script)
    Preconditions: All 4 validation JSON files exist
    Steps:
      1. Load each validation JSON
      2. Compare "marked_answer" vs "validated_answer"
      3. Flag mismatches as discrepancies
      4. Calculate stats: total questions, discrepancies, accuracy %
    Expected Result: discrepancy-report.json with all discrepancies listed
    Evidence: .sisyphus/evidence/task-8-discrepancy-report.json
  ```

  **Evidence to Capture**:
  - [ ] discrepancy-report.json
  - [ ] Summary statistics screenshot

  **Commit**: NO

---

- [ ] 9. Generate Patch Files for NCP-US Discrepancies

  **What to do**:
  - Read discrepancy report for NCP-US questions
  - For each discrepancy, generate a `.patch` file
  - Patch format: unified diff showing current vs corrected answer
  - Include source URLs in patch comment header
  - Save patches to `.sisyphus/patches/ncp-us/`

  **Must NOT do**:
  - ❌ Apply patches automatically (human review required)
  - ❌ Generate patches for questions without discrepancies
  - ❌ Include patches without source documentation

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 2 - with Tasks 10-12)
  - **Parallel Group**: Wave 2 patch generation
  - **Blocks**: None (patches are independent)
  - **Blocked By**: Task 8

  **References**:
  - `.sisyphus/evidence/discrepancy-report.json`
  - Question files: `NCP-US-Part*.md`
  - Patch format: unified diff (diff -u)

  **Acceptance Criteria**:
  - [ ] All NCP-US discrepancies have corresponding .patch files
  - [ ] Each patch includes: question reference, current answer, corrected answer, sources
  - [ ] Patches saved to `.sisyphus/patches/ncp-us/`
  - [ ] Patch count matches discrepancy count from report

  **QA Scenarios**:
  ```
  Scenario: Generate single patch file
    Tool: Bash (diff)
    Preconditions: Discrepancy identified for Q5 in NCP-US-Part1.md
    Steps:
      1. Read original question from markdown
      2. Create corrected version with new answer
      3. Generate diff: diff -u original.md corrected.md > q5.patch
      4. Add header with source URLs
    Expected Result: q5.patch file created with correct diff format
    Evidence: .sisyphus/patches/ncp-us/q5.patch

  Scenario: Verify patch count matches discrepancies
    Tool: Bash (ls, wc)
    Preconditions: Task 8 completed
    Steps:
      1. Count: ls .sisyphus/patches/ncp-us/*.patch | wc -l
      2. Compare to discrepancy count from report
    Expected Result: Patch count equals NCP-US discrepancy count
    Evidence: .sisyphus/evidence/task-9-patch-count.txt
  ```

  **Evidence to Capture**:
  - [ ] Sample patch file content
  - [ ] Patch count verification

  **Commit**: NO

---

- [ ] 10. Generate Patch Files for NCP-CI Discrepancies

  **What to do**:
  - Same as Task 9, but for NCP-CI discrepancies
  - Generate patches to `.sisyphus/patches/ncp-ci/`

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 2 - with Tasks 9, 11-12)
  - **Parallel Group**: Wave 2 patch generation
  - **Blocked By**: Task 8

  **Acceptance Criteria**:
  - [ ] All NCP-CI discrepancies have .patch files in `.sisyphus/patches/ncp-ci/`

  **QA Scenarios**:
  ```
  Scenario: Verify NCP-CI patch generation
    Tool: Bash (ls)
    Steps:
      1. List: ls .sisyphus/patches/ncp-ci/
      2. Verify: Each discrepancy has matching patch file
    Expected Result: All patches generated
    Evidence: .sisyphus/evidence/task-10-ncp-ci-patches.txt
  ```

  **Commit**: NO

---

- [ ] 11. Generate Patch Files for NCP-AI Discrepancies

  **What to do**:
  - Same as Task 9, but for NCP-AI discrepancies
  - Generate patches to `.sisyphus/patches/ncp-ai/`

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 2 - with Tasks 9-10, 12)
  - **Parallel Group**: Wave 2 patch generation
  - **Blocked By**: Task 8

  **Acceptance Criteria**:
  - [ ] All NCP-AI discrepancies have .patch files in `.sisyphus/patches/ncp-ai/`

  **QA Scenarios**:
  ```
  Scenario: Verify NCP-AI patch generation
    Tool: Bash (ls)
    Steps:
      1. List patches in ncp-ai directory
      2. Count and verify against discrepancy report
    Expected Result: All patches present
    Evidence: .sisyphus/evidence/task-11-ncp-ai-patches.txt
  ```

  **Commit**: NO

---

- [ ] 12. Generate Patch Files for NCM-MCI Discrepancies

  **What to do**:
  - Same as Task 9, but for NCM-MCI discrepancies
  - Generate patches to `.sisyphus/patches/ncm-mci/`

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 2 - with Tasks 9-11)
  - **Parallel Group**: Wave 2 patch generation
  - **Blocked By**: Task 8

  **Acceptance Criteria**:
  - [ ] All NCM-MCI discrepancies have .patch files in `.sisyphus/patches/ncm-mci/`

  **QA Scenarios**:
  ```
  Scenario: Verify NCM-MCI patch generation
    Tool: Bash (ls and wc)
    Steps:
      1. List all patch directories
      2. Count total patches across all exams
      3. Verify: Total matches total discrepancy count
    Expected Result: All patches generated, counts match
    Evidence: .sisyphus/evidence/task-12-all-patches-summary.txt
  ```

  **Commit**: NO

---

- [ ] 13. Select Random Sample for Spot-Check Validation

  **What to do**:
  - Randomly select 10 questions per exam (40 total) for spot-check
  - Use random selection (not the flagged questions already validated)
  - Ensure coverage across all domains within each exam
  - Record selected question numbers and source files

  **Must NOT do**:
  - ❌ Select questions already in the flagged list (Phase 1)
  - ❌ Select questions marked "VERIFIED" at 96.9%+ in existing reports
  - ❌ Manually pick "interesting" questions (must be random)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 3 starter, can overlap with Wave 2)
  - **Parallel Group**: Wave 3
  - **Blocks**: Tasks 14-17
  - **Blocked By**: Task 8 (to avoid overlap with Phase 1)

  **References**:
  - Question files: All `NCP-*.md` and `NCM-*.md` files
  - Flagged questions list (to exclude)

  **Acceptance Criteria**:
  - [ ] 10 questions selected per exam (40 total)
  - [ ] Random selection method documented
  - [ ] No overlap with Phase 1 flagged questions
  - [ ] Selection saved to `.sisyphus/config/spot-check-sample.json`

  **QA Scenarios**:
  ```
  Scenario: Random question selection
    Tool: Bash (python random)
    Preconditions: Question files available, flagged list available
    Steps:
      1. Get total question count per exam
      2. Use random.sample() to select 10 indices per exam
      3. Verify selected questions not in flagged list
      4. Save selection with file references
    Expected Result: spot-check-sample.json with 40 random questions
    Evidence: .sisyphus/config/task-13-spot-check-sample.json
  ```

  **Evidence to Capture**:
  - [ ] spot-check-sample.json
  - [ ] Random selection methodology note

  **Commit**: NO

---

- [ ] 14. Validate NCP-US Spot-Check Questions

  **What to do**:
  - Validate 10 randomly selected NCP-US questions
  - Same web search process as Phase 1, but for spot-check sample
  - Faster validation (1-2 sources sufficient, focus on answer correctness)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 3 - with Tasks 15-17)
  - **Parallel Group**: Wave 3 spot-check batch
  - **Blocks**: Task 18
  - **Blocked By**: Task 13

  **Acceptance Criteria**:
  - [ ] 10 NCP-US spot-check questions validated
  - [ ] Results in `.sisyphus/evidence/ncp-us-spotcheck.json`

  **QA Scenarios**:
  ```
  Scenario: Spot-check validation
    Tool: websearch_web_search_exa
    Steps:
      1. Read question from sample
      2. Search for 1-2 authoritative sources
      3. Verify answer correctness
      4. Record result with confidence
    Expected Result: 10 questions validated
    Evidence: .sisyphus/evidence/ncp-us-spotcheck.json
  ```

  **Commit**: NO

---

- [ ] 15. Validate NCP-CI Spot-Check Questions

  **What to do**:
  - Same as Task 14, for NCP-CI spot-check sample (10 questions)

  **Acceptance Criteria**:
  - [ ] 10 NCP-CI spot-check questions validated
  - [ ] Results in `.sisyphus/evidence/ncp-ci-spotcheck.json`

  **Commit**: NO

---

- [ ] 16. Validate NCP-AI Spot-Check Questions

  **What to do**:
  - Same as Task 14, for NCP-AI spot-check sample (10 questions)

  **Acceptance Criteria**:
  - [ ] 10 NCP-AI spot-check questions validated
  - [ ] Results in `.sisyphus/evidence/ncp-ai-spotcheck.json`

  **Commit**: NO

---

- [ ] 17. Validate NCM-MCI Spot-Check Questions

  **What to do**:
  - Same as Task 14, for NCM-MCI spot-check sample (10 questions)

  **Acceptance Criteria**:
  - [ ] 10 NCM-MCI spot-check questions validated
  - [ ] Results in `.sisyphus/evidence/ncm-mci-spotcheck.json`

  **Commit**: NO

---

- [ ] 18. Compile High-Confidence Question List

  **What to do**:
  - Aggregate all validated questions from Phase 1 and Phase 2
  - Calculate overall confidence scores
  - Identify high-confidence questions (2+ sources, agreement)
  - Create ranked list for memorization priority
  - Flag any remaining uncertain questions

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (Wave 4 starter)
  - **Parallel Group**: Wave 4
  - **Blocks**: Tasks 19-21
  - **Blocked By**: Tasks 9-12, 14-17

  **Acceptance Criteria**:
  - [ ] All validation data aggregated from Phase 1 and 2
  - [ ] High-confidence list created (validated + spot-check)
  - [ ] Confidence scoring methodology documented
  - [ ] Results saved to `.sisyphus/evidence/high-confidence-questions.json`

  **QA Scenarios**:
  ```
  Scenario: Compile confidence data
    Tool: Bash (python)
    Steps:
      1. Load all validation JSONs
      2. Calculate confidence per question (source count, agreement)
      3. Rank by confidence score
      4. Export high-confidence list
    Expected Result: high-confidence-questions.json with rankings
    Evidence: .sisyphus/evidence/task-18-confidence-list.json
  ```

  **Commit**: NO

---

- [ ] 19. Generate Quick Reference Guide for Memorization

  **What to do**:
  - Create a study guide optimized for rapid memorization
  - Format: condensed questions and answers (no full explanations)
  - Group by exam and domain
  - Include only high-confidence questions
  - Add quick-reference tables (port numbers, requirements, limits)

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: Creating documentation/study materials
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (Wave 4, depends on Task 18)
  - **Parallel Group**: Wave 4
  - **Blocked By**: Task 18

  **Acceptance Criteria**:
  - [ ] Quick reference guide created: `.sisyphus/output/quick-reference-guide.md`
  - [ ] Questions grouped by exam and domain
  - [ ] Condensed format (question stem + correct answer only)
  - [ ] Quick-reference tables for technical specs
  - [ ] Printable format (markdown, can convert to PDF)

  **QA Scenarios**:
  ```
  Scenario: Verify reference guide format
    Tool: Bash (head, cat)
    Steps:
      1. Read first 50 lines of quick-reference-guide.md
      2. Verify: Questions are condensed
      3. Verify: Grouped by exam/domain
      4. Check for quick-reference tables
    Expected Result: Well-formatted study guide
    Evidence: .sisyphus/output/task-19-reference-guide-preview.txt
  ```

  **Commit**: NO

---

- [ ] 20. Create Source URL Index

  **What to do**:
  - Compile all source URLs from validation process
  - Create an index mapping questions to their authoritative sources
  - Group by topic/concept for easy lookup
  - Export as markdown and JSON

  **Acceptance Criteria**:
  - [ ] Source index created: `.sisyphus/output/source-index.md`
  - [ ] JSON version: `.sisyphus/output/source-index.json`
  - [ ] URLs grouped by topic
  - [ ] Each entry has: question ref, sources[], topic tags

  **Commit**: NO

---

- [ ] 21. Build Final Validation Report with Statistics

  **What to do**:
  - Generate comprehensive final report
  - Include: total validated, discrepancies found, corrections made, accuracy %
  - List all patch files with summaries
  - Provide memorization recommendations
  - Export as markdown

  **Acceptance Criteria**:
  - [ ] Final report: `.sisyphus/output/VALIDATION-REPORT.md`
  - [ ] Statistics: total questions, flagged count, validated count, discrepancies, accuracy
  - [ ] Patch file index with summaries
  - [ ] Memorization guide recommendations
  - [ ] Next steps for user (how to apply patches)

  **Commit**: NO

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
  
  **What to do**:
  - Read the plan end-to-end
  - For each "Must Have": verify implementation exists (read file, check evidence)
  - For each "Must NOT Have": search evidence for forbidden patterns
  - Verify all 40 flagged questions were validated
  - Check evidence files exist in `.sisyphus/evidence/`
  - Compare deliverables against plan
  
  **Output Format**:
  ```
  Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | Evidence [N files] | VERDICT: APPROVE/REJECT
  ```
  
  **QA Scenarios**:
  ```
  Scenario: Verify all flagged questions validated
    Tool: Bash (jq, cat)
    Steps:
      1. Count: cat .sisyphus/evidence/ncp-us-validation.json | jq '. | length'
      2. Repeat for all 4 exams
      3. Verify: Total >= 40 (or actual flagged count)
    Expected Result: All flagged questions have validation records
    Evidence: .sisyphus/evidence/f1-compliance-report.txt
  ```
  
  **Commit**: NO

---

- [ ] F2. **Patch File Review** — `unspecified-high`
  
  **What to do**:
  - Review all generated patch files for format correctness
  - Verify patch files contain valid unified diff format
  - Check that each patch has source URL documentation
  - Verify patches don't modify question stems (only answers/explanations)
  - Count patches and compare to discrepancy report
  
  **Output Format**:
  ```
  Patches [N generated] | Format [PASS/FAIL] | Sources [N documented] | Coverage [N/N exams] | VERDICT
  ```
  
  **QA Scenarios**:
  ```
  Scenario: Verify patch format
    Tool: Bash (head, file)
    Steps:
      1. Sample: head -20 .sisyphus/patches/ncp-us/*.patch
      2. Verify: Contains "---" and "+++" (diff headers)
      3. Verify: Contains source URLs in comments
    Expected Result: All patches valid unified diff format
    Evidence: .sisyphus/evidence/f2-patch-review.txt
  ```
  
  **Commit**: NO

---

- [ ] F3. **Source Verification** — `unspecified-high`
  
  **What to do**:
  - Verify all documented source URLs are valid and accessible
  - Check URLs are from authoritative domains (nutanix.com, nutanixbible.com)
  - Verify no paywalled sources (per guardrails)
  - Cross-check that source count matches validation records
  
  **Output Format**:
  ```
  URLs [N total] | Valid [N] | Invalid [N] | Authoritative [N] | Paywalled [N] | VERDICT
  ```
  
  **QA Scenarios**:
  ```
  Scenario: Sample source URL validation
    Tool: Bash (curl -I or webfetch)
    Steps:
      1. Extract 10 random URLs from source-index.json
      2. Check: curl -I <url> and verify 200 OK
      3. Verify: Domain is nutanix.com or official
    Expected Result: All sampled URLs valid and authoritative
    Evidence: .sisyphus/evidence/f3-source-check.txt
  ```
  
  **Commit**: NO

---

- [ ] F4. **Statistics Validation** — `deep`
  
  **What to do**:
  - Verify accuracy calculations are correct
  - Cross-check counts: flagged questions, validated, discrepancies, patches
  - Validate confidence scoring methodology
  - Verify final report statistics match actual data
  
  **Output Format**:
  ```
  Totals [PASS/FAIL] | Discrepancies [PASS/FAIL] | Accuracy [X%] | Confidence [PASS/FAIL] | VERDICT
  ```
  
  **QA Scenarios**:
  ```
  Scenario: Verify final statistics
    Tool: Bash (python, jq)
    Steps:
      1. Load: final validation report
      2. Load: all validation JSON files
      3. Calculate: Should match reported statistics
      4. Verify: Accuracy % calculation is correct
    Expected Result: All statistics verified and accurate
    Evidence: .sisyphus/evidence/f4-stats-validation.txt
  ```
  
  **Commit**: NO

---

> **After F1-F4 complete: Present consolidated results to user and get explicit "okay" before marking complete.**

---

## Commit Strategy

- **Phase 1 complete**: NO commits (working files in .sisyphus/)
- **Phase 2 complete**: NO commits (patch files ready for review)
- **Phase 3 complete**: NO commits (reference guide in output/)
- **Final verification**: NO commits (reports ready)
- **User applies patches**: User manually applies .patch files after review
- **Post-validation commit**: Optional - If user applies patches, single commit with all corrections
  - Message: `fix(validation): correct answers based on web search validation`
  - Files: All updated `NCP-*.md` and `NCM-*.md` files

---

## Success Criteria

### Verification Commands

```bash
# Verify flagged questions were validated
python3 -c "import json; data=json.load(open('.sisyphus/evidence/discrepancy-report.json')); print(f'Flagged: {data[\"total_flagged\"]}, Validated: {data[\"total_validated\"]}')"

# Verify patch files exist
count=$(find .sisyphus/patches -name '*.patch' | wc -l); echo "Total patches: $count"

# Verify validation report exists
if [ -f ".sisyphus/output/VALIDATION-REPORT.md" ]; then echo "Report: EXISTS"; else echo "Report: MISSING"; fi

# Verify quick reference guide exists  
if [ -f ".sisyphus/output/quick-reference-guide.md" ]; then echo "Guide: EXISTS"; else echo "Guide: MISSING"; fi
```

### Final Checklist
- [ ] All ~40 flagged questions validated (Phase 1)
- [ ] All 40 spot-check questions validated (Phase 2)
- [ ] Patch files generated for all discrepancies (>0 patches)
- [ ] Quick reference guide created for memorization
- [ ] Source URL index compiled
- [ ] Final validation report with statistics generated
- [ ] Final verification wave (F1-F4) all APPROVE
- [ ] User explicit "okay" received

---

## Notes for Executor

1. **Timeline Reality**: This plan focuses on ~80 questions (40 flagged + 40 spot-check) rather than all 1,280. This makes the timeline achievable (~15-20 hours vs 107 hours).

2. **Web Search Rate Limiting**: Use reasonable delays between searches. If rate-limited, implement exponential backoff.

3. **Patch Files**: These are for human review. DO NOT apply them automatically. User must review and apply manually.

4. **Source Quality**: Prioritize nutanix.com and nutanixbible.com. Test prep sites can corroborate but shouldn't be primary sources.

5. **Evidence Files**: Save everything to `.sisyphus/evidence/` for audit trail and reproducibility.

6. **Multi-Select Questions**: Pay special attention to format. These have "Answer: A, C" format and all selected options must be validated.

7. **Version Context**: Note AOS versions when answers are version-specific. This helps user understand context.

8. **User Review Required**: Final verification must present results to user and get explicit approval before completing work.

