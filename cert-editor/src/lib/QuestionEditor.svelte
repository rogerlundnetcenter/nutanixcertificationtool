<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { Question, Answer } from "./types";
  
  export let question: Question;
  export let ollamaConnected: boolean;
  
  const dispatch = createEventDispatcher();
  let isValidating = false;
  
  function addAnswer() {
    const letters = ['A','B','C','D','E','F'];
    if (question.answers.length < 6) {
      question.answers = [...question.answers, { letter: letters[question.answers.length], text: "", is_correct: false }];
    }
  }
  
  function removeAnswer(index: number) {
    question.answers = question.answers.filter((_, i) => i !== index);
  }
  
  function toggleCorrect(index: number) {
    if (question.q_type === 'single') {
      question.answers = question.answers.map((a, i) => ({ ...a, is_correct: i === index }));
    } else {
      question.answers[index].is_correct = !question.answers[index].is_correct;
      question.answers = [...question.answers];
    }
  }
  
  async function validate() {
    isValidating = true;
    dispatch("validate");
    isValidating = false;
  }
</script>

<div class="editor">
  <header>
    <span class="badge" class:draft={question.status==='draft'} class:validated={question.status==='validated'}>
      {question.status}
    </span>
    <h2>Q{question.number} - {question.domain}</h2>
    <div class="actions">
      <button on:click={() => dispatch('save', question)} class="primary">💾 Save</button>
      <button on:click={validate} disabled={!ollamaConnected || isValidating}>
        {isValidating ? '⏳ Validating...' : '✓ Validate'}
      </button>
      {#if question.id}
        <button on:click={() => dispatch('delete')} class="danger">🗑 Delete</button>
      {/if}
    </div>
  </header>
  
  <div class="field">
    <label>Type</label>
    <select bind:value={question.q_type}>
      <option value="single">Single Answer</option>
      <option value="multi">Multi-Select</option>
      <option value="ordering">Ordering</option>
    </select>
  </div>
  
  <div class="field">
    <label>Domain</label>
    <input type="text" bind:value={question.domain} />
  </div>
  
  <div class="field">
    <label>Question Stem</label>
    <textarea bind:value={question.stem} rows="4" placeholder="Enter the question..." />
  </div>
  
  <div class="field">
    <label>Answers <button class="small" on:click={addAnswer}>+ Add</button></label>
    <div class="answers">
      {#each question.answers as answer, i}
        <div class="answer-row">
          <input type="checkbox" checked={answer.is_correct} on:change={() => toggleCorrect(i)} />
          <span class="letter">{answer.letter}.</span>
          <input type="text" bind:value={answer.text} placeholder="Answer text..." />
          <button class="small danger" on:click={() => removeAnswer(i)}>×</button>
        </div>
      {/each}
    </div>
  </div>
  
  <div class="field">
    <label>Explanation</label>
    <textarea bind:value={question.explanation} rows="6" placeholder="Detailed explanation with KB references..." />
  </div>
  
  {#if question.validation_reasoning}
    <div class="validation-box">
      <strong>AI Validation:</strong>
      <pre>{question.validation_reasoning}</pre>
    </div>
  {/if}
</div>

<style>
  .editor { max-width: 800px; }
  header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #333; }
  h2 { flex: 1; margin: 0; font-size: 1.3rem; }
  .badge { padding: 4px 12px; border-radius: 12px; font-size: 0.75rem; text-transform: uppercase; font-weight: 600; background: #888; }
  .badge.draft { background: #ff9500; }
  .badge.validated { background: #57ff14; color: #000; }
  .actions { display: flex; gap: 8px; }
  .field { margin-bottom: 20px; }
  label { display: block; font-size: 0.85rem; color: #888; margin-bottom: 8px; font-weight: 500; }
  input, select, textarea { width: 100%; padding: 12px; background: #1a1a2e; border: 1px solid #333; border-radius: 6px; color: inherit; font-size: 0.95rem; }
  textarea { font-family: inherit; resize: vertical; }
  .answers { display: flex; flex-direction: column; gap: 8px; }
  .answer-row { display: flex; align-items: center; gap: 8px; }
  .answer-row input[type="text"] { flex: 1; }
  .letter { min-width: 24px; color: #00f0ff; font-weight: 600; }
  button.primary { background: #ff2d95; color: white; }
  button.danger { background: #ff4444; color: white; }
  button.small { padding: 4px 10px; font-size: 0.8rem; }
  .validation-box { background: #1a3a3a; padding: 16px; border-radius: 8px; margin-top: 20px; border-left: 3px solid #00f0ff; }
  .validation-box pre { white-space: pre-wrap; font-size: 0.9rem; margin-top: 8px; }
</style>
