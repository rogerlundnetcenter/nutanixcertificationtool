# NCP-AI KB Audit Report
**Generated:** 2026-03-31 15:16:06**
**Audited:** All 320 NCP-AI certification exam questions (Parts 1-4)

---

## Coverage Summary

| Metric | Value |
|--------|-------|
| **Total Questions** | 320 |
| **Matched to ReferenceService** | 317 |
| **Orphan Questions** | 3 |
| **Coverage %** | 99.06% |

### Coverage by Topic Area

| Topic | Keyword Match | Questions Covered |
|-------|----------------|-------------------|
| GPU Support (A100/H100/L40S/T4/vGPU) | GPU, A100, H100, L40S, T4, VRAM, GDDR6, HBM, CUDA | ✅ 45+ questions |
| NAI/Kubernetes/Operators | NAI, NKP, Kubernetes, operator, pod, container, deployment | ✅ 65+ questions |
| Model Management | model, HuggingFace, NGC, quantiz, FP16, INT8, INT4, LoRA | ✅ 55+ questions |
| API & Integration | API, OpenAI, endpoint, chat, completion, token, streaming | ✅ 35+ questions |
| Inference Engines | vLLM, TensorRT, serving, engine, batch | ✅ 42+ questions |
| RAG | RAG, retrieval, vector, embedding, context | ✅ 30+ questions |

---

## Orphan Questions (3 Total) — Gaps in ReferenceService Coverage

These 3 questions don't match any existing NCP-AI keyword group in ReferenceService.cs. They cover important topics that should be added.

### Q63 — Part 1 (Configuration/Timeout Management)

**Question:** An engineer needs to configure a timeout for long-running inference requests that process large prompts. Where is this setting configured?

**Analysis:**
- **Topic:** Request timeout configuration, inference server settings
- **Related Keywords:** timeout, inference, configuration, request, latency
- **ReferenceService Gap:** No explicit "timeout" or "configuration" entry
- **Suggested Keywords to Add:** timeout, configuration, request timeout, long-running, inference timeout
- **KB Reference:** Should link to vLLM/TensorRT configuration documentation

**Recommendation:**
Add new ReferenceService entry:
\\\csharp
(new[] { "timeout", "configuration", "request", "long-running", "inference timeout", "max_tokens" },
 "⚙️ Inference Configuration\n• Request timeout settings for long-running inference\n• max_tokens parameter limits response length\n• Temperature, top_p for response quality\n• Streaming vs. batch configurations\n• Server-side timeout policies\n• Client-side timeout handling"),
\\\

---

### Q175 — Part 3 (Model Access & Gating)

**Question:** When downloading gated models (like Llama 2) from Hugging Face, what is required?

**Analysis:**
- **Topic:** Model licensing, gated model access, authentication, Hugging Face Hub
- **Related Keywords:** gated model, HuggingFace, authentication, access token, license, llama
- **ReferenceService Gap:** Current "HuggingFace" entry doesn't mention gated models or authentication
- **Suggested Keywords to Add:** gated model, access token, authentication, license, huggingface hub, llama
- **KB Reference:** Should link to Hugging Face model access documentation

**Recommendation:**
Update or enhance ReferenceService entry for Model Management:
\\\csharp
(new[] { "model", "HuggingFace", "gated", "access token", "license", "authentication", "llama", "NGC" },
 "🧠 Model Management & Access\n• Sources: HuggingFace, NVIDIA NGC, manual upload\n• Gated models (Llama 2, etc.) require HuggingFace token\n• Model access control and licensing\n• Quantization: FP16 → INT8 → INT4 (smaller = faster)\n• LoRA: Low-Rank Adaptation fine-tuning\n• Model size determines GPU requirements\n• 7B params ≈ 14GB FP16 / 7GB INT8 / 3.5GB INT4"),
\\\

---

### Q234 — Part 3 (Capacity Planning & GPU Calculation)

**Question:** How should an architect calculate the number of GPUs needed for a target concurrent user count?

**Analysis:**
- **Topic:** Capacity planning, GPU provisioning, throughput calculation, scaling
- **Related Keywords:** capacity planning, GPU calculation, concurrent users, throughput, scaling, provisioning
- **ReferenceService Gap:** No explicit entry for capacity planning or GPU provisioning calculations
- **Suggested Keywords to Add:** capacity, planning, concurrent, throughput, GPU count, scaling, provisioning
- **KB Reference:** Should link to NAI sizing documentation and GPU capacity planning guide

**Recommendation:**
Add new ReferenceService entry:
\\\csharp
(new[] { "capacity", "planning", "GPU count", "concurrent", "throughput", "scaling", "provisioning" },
 "📊 Capacity Planning & GPU Sizing\n• GPU count calculation: (concurrent_users × avg_tokens_per_request) / GPU_throughput\n• Throughput varies by model size, quantization, and batch size\n• vLLM continuous batching improves GPU utilization\n• Concurrent user limits depend on context window and model\n• Over-provision for peak load and failover redundancy\n• Monitor GPU memory and utilization for scaling decisions"),
\\\

---

## KB URL Validation

**Status:** ✅ **All URLs validated and accessible**

### Sample KB URLs from Validation Reports

| URL | Topic | Status |
|-----|-------|--------|
| https://portal.nutanix.com/page/documents/details?targetId=Nutanix-AI-v1_0:top-nutanix-ai-overview.html | Nutanix AI Overview | ✅ Active |
| https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Enterprise-AI-v2_2:top-nai-requirements-c.html | NAI Requirements | ✅ Active |
| https://portal.nutanix.com/page/documents/details?targetId=AHV-Admin-Guide-v6_10:ahv-gpu-passthrough-c.html | GPU Passthrough | ✅ Active |
| https://vllm.ai/ | vLLM Official | ✅ Active |
| https://portal.nutanix.com/page/documents/details?targetId=NKP-Guide:nkp-cluster-setup-c.html | NKP Setup | ✅ Active |
| https://huggingface.co/ | Hugging Face Hub | ✅ Active |
| https://www.nvidia.com/en-us/data-center/tensorrt/ | TensorRT Official | ✅ Active |

**Total KB URLs Found:** 87 unique URLs across validation reports

---

## ReferenceService Recommendations

### Summary of Required Changes

1. **Add Timeout/Configuration Entry** (Q63)
   - Keywords: timeout, configuration, request, long-running, inference timeout, max_tokens
   - Content: Configuration parameters for inference requests

2. **Enhance Model Management Entry** (Q175)
   - Add keywords: gated, access token, license, authentication, llama, huggingface hub
   - Clarify: Gated model access requirements

3. **Add Capacity Planning Entry** (Q234)
   - Keywords: capacity, planning, GPU count, concurrent, throughput, scaling, provisioning
   - Content: GPU sizing formulas and capacity planning

### C# Code Snippets for New Entries

**Entry 1: Request Configuration & Timeout (for Q63)**
\\\csharp
(new[] { "timeout", "configuration", "request", "long-running", "inference timeout", "max_tokens", "parameter" },
 "⚙️ Inference Configuration & Timeout\n• Request timeout settings for long-running inference\n• max_tokens parameter limits response length\n• Temperature & top_p control response quality\n• Streaming vs. batch request modes\n• Server-side timeout policies\n• Client-side connection timeout handling\n• vLLM: Configure via --max-model-len and timeout params\n• TensorRT-LLM: timeout in engine configuration"),
\\\

**Entry 2: Enhanced Model Management (replace existing, for Q175)**
\\\csharp
(new[] { "model", "HuggingFace", "gated", "access token", "authentication", "license", "llama", "NGC", "quantiz", "FP16", "INT8", "INT4", "LoRA", "fine-tun" },
 "🧠 Model Management & Access\n• Model Sources: HuggingFace, NVIDIA NGC, manual upload\n• Gated Models (Llama 2, Falcon): Require HuggingFace token authentication\n• HF_TOKEN environment variable for gated model access\n• Model licensing: Open vs. restricted (commercial use)\n• Quantization: FP16 → INT8 → INT4 (smaller = faster)\n• LoRA: Low-Rank Adaptation fine-tuning\n• Model size vs. GPU requirements: 7B ≈ 14GB FP16 / 7GB INT8 / 3.5GB INT4\n• Model card verification for requirements & capabilities"),
\\\

**Entry 3: Capacity Planning & GPU Sizing (for Q234)**
\\\csharp
(new[] { "capacity", "planning", "GPU count", "concurrent", "throughput", "scaling", "provisioning", "sizing" },
 "📊 Capacity Planning & GPU Sizing\n• GPU Count Formula: (concurrent_users × avg_latency_ms) / (GPU_throughput_ms per request)\n• Throughput varies by: model size, quantization level, batch size, context window\n• vLLM continuous batching increases GPU utilization vs. sequential\n• Concurrent user limits depend on: memory, context window, request queue\n• Provisioning: Over-provision for peak load + failover redundancy (20-30%)\n• Monitoring: Track GPU memory, utilization, token throughput\n• Scaling: Horizontal (more GPUs) vs. vertical (larger GPUs)\n• Cost optimization: Balance model size, quantization, and GPU type"),
\\\

---

## Audit Summary & Recommendations

### Current State: ✅ **EXCELLENT COVERAGE (99.06%)**

**Strengths:**
- ✅ 317 of 320 questions map to existing ReferenceService keywords
- ✅ All major NCP-AI topics covered (GPU, NAI, models, API, inference, RAG)
- ✅ 87 KB URLs validated and accessible in validation reports
- ✅ Keyword matching robust for core certification domains

**Gaps (3 questions):**
1. Q63: Timeout/configuration management for inference requests
2. Q175: Gated model access and authentication via Hugging Face
3. Q234: Capacity planning and GPU sizing calculations

### Actions to Achieve 100% Coverage

**Priority: HIGH** — Implement these 3 new/updated ReferenceService entries:

1. ✏️ **New Entry: Request Configuration & Timeout**
   - Add to ReferenceService.cs NCP-AI section
   - Keywords: timeout, configuration, request, long-running, inference timeout, max_tokens
   - Covers Q63

2. ✏️ **Enhanced Entry: Model Management with Gating**
   - Replace existing model/HuggingFace entry
   - Add keywords: gated, access token, authentication, llama
   - Covers Q175

3. ✏️ **New Entry: Capacity Planning & GPU Sizing**
   - Add to ReferenceService.cs NCP-AI section
   - Keywords: capacity, planning, GPU count, concurrent, throughput, scaling
   - Covers Q234

**Timeline:** 15 minutes (3 simple C# entry additions)

**Validation:** After update, re-run keyword matching to confirm 100% coverage

---

## Conclusion

**KB Coverage Audit: PASSED** ✅
- Current Coverage: **99.06%** (317/320)
- Target Coverage: **100.00%**
- Gap Remediation: **3 ReferenceService entries** (simple additions)
- KB URLs: **All valid & accessible** (87 unique)

**Next Steps:**
1. Add the 3 recommended ReferenceService entries (provided in C# format above)
2. Re-run validation to confirm 100% coverage
3. Update ReferenceService.GetReferenceForQuestion() if needed for new keywords
4. Consider KB URL mapping for each question (optional enhancement)

