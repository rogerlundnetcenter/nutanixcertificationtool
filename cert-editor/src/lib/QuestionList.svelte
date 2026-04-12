<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { Question } from "./types";
  
  export let questions: Question[] = [];
  export let selectedQuestion: Question | null = null;
  
  const dispatch = createEventDispatcher();
  
  function getStatusColor(status: string): string {
    return { draft: '#888', validated: '#57ff14', rejected: '#ff5555' }[status] || '#888';
  }
</script>

<div class="question-list">
  <h3>Questions ({questions.length})</h3>
  <ul>
    {#each questions as q}
      <li class:selected={selectedQuestion?.id === q.id} on:click={() => dispatch("select", q)}>
        <span class="number">Q{q.number}</span>
        <span class="status" style="background: {getStatusColor(q.status)}"></span>
        <span class="preview">{q.stem.substring(0, 40)}...</span>
      </li>
    {/each}
  </ul>
</div>

<style>
  .question-list { flex: 1; overflow: auto; padding: 16px; }
  h3 { font-size: 0.85rem; color: #888; margin-bottom: 12px; text-transform: uppercase; }
  ul { list-style: none; }
  li { display: flex; align-items: center; gap: 8px; padding: 10px; border-radius: 4px; cursor: pointer; font-size: 0.85rem; }
  li:hover { background: #252540; }
  li.selected { background: #1a3a5c; }
  .number { font-weight: 600; min-width: 40px; color: #00f0ff; }
  .status { width: 8px; height: 8px; border-radius: 50%; }
  .preview { color: #aaa; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>
