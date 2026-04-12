<script lang="ts">
  export let ollamaConnected: boolean;
  export let selectedCert: { code: string } | null;
  export let questionCount: number;
</script>

<footer class="status-bar">
  <div class="left">
    <span class:connected={ollamaConnected} class:disconnected={!ollamaConnected}>
      {ollamaConnected ? '● Ollama Connected' : '○ Ollama Offline'}
    </span>
  </div>
  <div class="center">
    {#if selectedCert}
      {selectedCert.code} — {questionCount} questions
    {:else}
      No certification selected
    {/if}
  </div>
  <div class="right">Cert Study Editor v1.0</div>
</footer>

<style>
  .status-bar { display: flex; justify-content: space-between; align-items: center; padding: 8px 20px; background: #1a1a2e; border-top: 1px solid #333; font-size: 0.8rem; color: #888; }
  .connected { color: #57ff14; }
  .disconnected { color: #ff5555; }
</style>
