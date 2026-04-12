<script lang="ts">
  import { invoke } from "@tauri-apps/api/tauri";
  import { createEventDispatcher } from "svelte";
  import type { Question } from "./types";
  
  let query = "";
  let results: Question[] = [];
  let isSearching = false;
  
  const dispatch = createEventDispatcher();
  
  async function search() {
    if (!query.trim()) return;
    isSearching = true;
    results = await invoke("search_questions", { query });
    isSearching = false;
  }
</script>

<div class="search-panel">
  <div class="search-box">
    <input type="text" bind:value={query} placeholder="Search questions..." on:keypress={(e) => e.key === 'Enter' && search()} />
    <button on:click={search} disabled={isSearching}>{isSearching ? '...' : '🔍'}</button>
  </div>
  
  {#if results.length > 0}
    <div class="results">
      {#each results as q}
        <div class="result-item" on:click={() => dispatch('select', q)}>
          <span class="cert">{q.cert_id}</span>
          <span class="q-num">Q{q.number}</span>
          <p>{q.stem.substring(0, 60)}...</p>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .search-panel { padding: 16px; border-bottom: 1px solid #333; }
  .search-box { display: flex; gap: 8px; }
  .search-box input { flex: 1; }
  .results { margin-top: 12px; max-height: 200px; overflow: auto; }
  .result-item { padding: 10px; background: #1a1a2e; border-radius: 6px; margin-bottom: 8px; cursor: pointer; }
  .result-item:hover { background: #252540; }
  .cert { font-size: 0.75rem; color: #ff2d95; font-weight: 600; }
  .q-num { font-size: 0.75rem; color: #00f0ff; margin-left: 8px; }
  .result-item p { margin-top: 4px; font-size: 0.85rem; color: #aaa; }
</style>
