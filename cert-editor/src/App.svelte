<script lang="ts">
  import { onMount } from "svelte";
  import { invoke } from "@tauri-apps/api/tauri";
  import CertificationList from "./lib/CertificationList.svelte";
  import QuestionEditor from "./lib/QuestionEditor.svelte";
  import QuestionList from "./lib/QuestionList.svelte";
  import SearchPanel from "./lib/SearchPanel.svelte";
  import StatusBar from "./lib/StatusBar.svelte";
  import type { Certification, Question } from "./lib/types";

  let certifications: Certification[] = [];
  let selectedCert: Certification | null = null;
  let selectedQuestion: Question | null = null;
  let questions: Question[] = [];
  let ollamaConnected = false;
  let isLoading = true;
  let error: string | null = null;

  onMount(async () => {
    try {
      certifications = await invoke("get_certifications");
      ollamaConnected = await invoke("check_ollama");
    } catch (e) {
      error = e as string;
    } finally {
      isLoading = false;
    }
  });

  async function selectCert(cert: Certification) {
    selectedCert = cert;
    selectedQuestion = null;
    try {
      questions = await invoke("get_questions", { certId: cert.id });
    } catch (e) {
      error = e as string;
    }
  }

  function selectQuestion(question: Question) {
    selectedQuestion = question;
  }

  function handleNewQuestion() {
    if (!selectedCert) return;
    
    // Find next question number
    const nextNum = questions.length > 0 
      ? Math.max(...questions.map(q => q.number)) + 1 
      : 1;
    
    selectedQuestion = {
      id: null,
      cert_id: selectedCert.id,
      domain: "Domain 1",
      number: nextNum,
      q_type: "single",
      stem: "",
      explanation: "",
      difficulty: 3,
      status: "draft",
      answers: [
        { letter: "A", text: "", is_correct: false },
        { letter: "B", text: "", is_correct: false },
        { letter: "C", text: "", is_correct: false },
        { letter: "D", text: "", is_correct: false },
      ],
      kb_refs: [],
      validation_reasoning: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  async function handleSaveQuestion(event: CustomEvent<Question>) {
    const question = event.detail;
    try {
      const saved = await invoke("save_question", { question: {
        id: question.id,
        cert_id: question.cert_id,
        domain: question.domain,
        number: question.number,
        q_type: question.q_type,
        stem: question.stem,
        explanation: question.explanation,
        difficulty: question.difficulty,
        answers: question.answers.map(a => ({
          letter: a.letter,
          text: a.text,
          is_correct: a.is_correct
        })),
        kb_refs: question.kb_refs
      }});
      
      // Refresh list
      if (selectedCert) {
        questions = await invoke("get_questions", { certId: selectedCert.id });
      }
      
      selectedQuestion = saved as Question;
    } catch (e) {
      error = e as string;
    }
  }

  async function handleDeleteQuestion() {
    if (!selectedQuestion?.id) return;
    
    if (!confirm("Delete this question?")) return;
    
    try {
      await invoke("delete_question", { id: selectedQuestion.id });
      questions = questions.filter(q => q.id !== selectedQuestion?.id);
      selectedQuestion = null;
    } catch (e) {
      error = e as string;
    }
  }

  async function handleValidate() {
    if (!selectedQuestion?.id) return;
    
    try {
      const result = await invoke("validate_question", { id: selectedQuestion.id });
      // Refresh to show updated status
      if (selectedCert) {
        questions = await invoke("get_questions", { certId: selectedCert.id });
      }
      if (selectedQuestion?.id) {
        selectedQuestion = await invoke("get_question", { id: selectedQuestion.id });
      }
    } catch (e) {
      error = e as string;
    }
  }

  async function handleExport() {
    if (!selectedCert) return;
    
    const path = prompt("Export path:", `${selectedCert.code}.md`);
    if (!path) return;
    
    try {
      const result = await invoke("export_certification", {
        certId: selectedCert.id,
        outputPath: path
      });
      alert(`Exported to ${result}`);
    } catch (e) {
      error = e as string;
    }
  }
</script>

<main class="app">
  <header class="toolbar">
    <h1>🎯 Cert Study Editor</h1>
    <div class="actions">
      <button on:click={handleNewQuestion} disabled={!selectedCert}>
        + New Question
      </button>
      <button on:click={handleExport} disabled={!selectedCert}>
        📥 Export
      </button>
    </div>
  </header>

  <div class="content">
    <aside class="sidebar">
      <CertificationList 
        {certifications} 
        {selectedCert}
        on:select={(e) => selectCert(e.detail)} 
      />
      
      {#if selectedCert}
        <QuestionList 
          {questions} 
          {selectedQuestion}
          on:select={(e) => selectQuestion(e.detail)}
        />
      {/if}
    </aside>

    <section class="main-panel">
      {#if isLoading}
        <div class="loading">Loading...</div>
      {:else if error}
        <div class="error">{error}</div>
      {:else if selectedQuestion}
        <QuestionEditor 
          question={selectedQuestion}
          {ollamaConnected}
          on:save={handleSaveQuestion}
          on:delete={handleDeleteQuestion}
          on:validate={handleValidate}
        />
      {:else if selectedCert}
        <div class="empty-state">
          <p>Select a question or click "New Question" to start editing</p>
        </div>
      {:else}
        <div class="empty-state">
          <p>Select a certification from the sidebar</p>
        </div>
      {/if}
    </section>
  </div>

  <StatusBar {ollamaConnected} {selectedCert} questionCount={questions.length} />
</main>

<style>
  :global(*) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :global(body) {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: #0f0f1a;
    color: #e0e0ff;
  }

  .app {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    background: #1a1a2e;
    border-bottom: 1px solid #333;
  }

  .toolbar h1 {
    font-size: 1.2rem;
    color: #ff2d95;
  }

  .actions {
    display: flex;
    gap: 10px;
  }

  button {
    padding: 8px 16px;
    background: #00f0ff;
    color: #0f0f1a;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    transition: opacity 0.2s;
  }

  button:hover:not(:disabled) {
    opacity: 0.9;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .content {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .sidebar {
    width: 320px;
    display: flex;
    flex-direction: column;
    background: #16162a;
    border-right: 1px solid #333;
    overflow: hidden;
  }

  .main-panel {
    flex: 1;
    overflow: auto;
    padding: 20px;
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #888;
  }

  .loading, .error {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  .error {
    color: #ff5555;
  }
</style>
