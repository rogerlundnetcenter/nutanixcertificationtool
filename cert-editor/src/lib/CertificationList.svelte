<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { Certification } from "./types";
  
  export let certifications: Certification[] = [];
  export let selectedCert: Certification | null = null;
  
  const dispatch = createEventDispatcher();
</script>

<div class="cert-list">
  <h3>Certifications</h3>
  <ul>
    {#each certifications as cert}
      <li class:selected={selectedCert?.id === cert.id} on:click={() => dispatch("select", cert)}>
        <div class="cert-code">{cert.code}</div>
        <div class="cert-count">{cert.question_count} questions</div>
      </li>
    {/each}
  </ul>
</div>

<style>
  .cert-list { padding: 16px; border-bottom: 1px solid #333; }
  h3 { font-size: 0.85rem; color: #888; margin-bottom: 12px; text-transform: uppercase; }
  ul { list-style: none; }
  li { padding: 12px; border-radius: 6px; cursor: pointer; transition: background 0.2s; margin-bottom: 4px; }
  li:hover { background: #252540; }
  li.selected { background: #ff2d95; color: white; }
  .cert-code { font-weight: 600; font-size: 0.9rem; }
  .cert-count { font-size: 0.75rem; opacity: 0.8; margin-top: 2px; }
</style>
