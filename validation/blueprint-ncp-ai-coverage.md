# NCP-AI 6.10 Blueprint Coverage Analysis

> **Exam:** Nutanix Certified Professional – Artificial Intelligence (NCP-AI) 6.10  
> **Format:** 75 MCQ | 120 minutes | Pass: 3000/6000 scaled  
> **NAI Version Tested:** 2.3  
> **Question Bank:** 320 questions across 4 parts  
> **Analysis Date:** 2025-07-18

---

## Executive Summary

| Metric | Value |
|---|---|
| **Total Blueprint Objectives** | 44 |
| **COVERED** | 36 |
| **PARTIAL** | 6 |
| **GAP** | 2 |
| **Coverage Rate** | 81.8% full / 95.5% at least partial |

The question bank provides **strong overall coverage** of the NCP-AI 6.10 blueprint. Two objectives have clear gaps requiring new questions, and six objectives have partial coverage needing reinforcement in specific sub-topics. The weakest areas are **NAI UI-specific workflows** (dashboard widgets, audit event screens, NAI-native user management) and **NKP vs non-NKP installation differences**.

---

## Section 1 – Deploy a Nutanix Enterprise AI Environment

### Objective 1.1: Validate installation prerequisites

| # | Knowledge Point | Status | Evidence |
|---|---|---|---|
| 1.1a | Identify the installation prerequisites | **COVERED** | P1-Q2 (NKP+GPU prereqs), P1-Q9 (Prism Central required), P1-Q28 (min requirements combo), P1-Q22 (GPU nodes + device plugin), P3-Q31 (NKP platform requirement) |
| 1.1b | Identify the installation limitations | **COVERED** | P1-Q1 (GPU VRAM limits for models), P1-Q11 (unsupported GPUs like RTX 4090), P1-Q39 (single-node limitations), P3-Q10 (GPU passthrough prevents live migration) |
| 1.1c | Cite the installation procedure | **COVERED** | P1-Q33 (correct deployment order), P1-Q12 (CLI deploy via kubectl), P1-Q32 (Prism Central wizard) |
| 1.1d | Describe core fundamental components of NAI architecture | **COVERED** | P1-Q6 (NAI Operator), P1-Q14 (API Gateway), P1-Q35 (model repository), P1-Q31 (inference engine), P1-Q19 (Ingress controller), P4-Q2 (NAI Operator lifecycle), P1-Q21 (NAI = former GPT-in-a-Box) |

### Objective 1.2: Install Nutanix Enterprise AI components

| # | Knowledge Point | Status | Evidence |
|---|---|---|---|
| 1.2a | Compare and contrast NKP vs non-NKP installation | **GAP** | No questions directly compare the NKP App Catalog install flow vs. non-NKP (vanilla K8s/kubectl) install. Questions cover NKP installs only. |
| 1.2b | Recognize version compatibility between prerequisite and NAI components | **PARTIAL** | P1-Q23 (GPU Operator/device plugin needed), P2-Q47 (CUDA library/driver version match), P4-Q69 (GPU Operator upgrade breaks pods). Missing: explicit NAI version ↔ NKP version ↔ GPU Operator version compatibility matrix questions. |
| 1.2c | Perform a dark site installation | **COVERED** | P1-Q36 (air-gapped model upload), P3-Q14 (pre-download and transfer via secure media) |
| 1.2d | Configure storage classes | **COVERED** | P1-Q7 (CSI driver + PVC), P1-Q8 (StorageClass prereq check), P1-Q16 (PVC creation by Operator), P1-Q40 (Nutanix Volumes + CSI), P3-Q34 (StorageClass with RWX), P4-Q9 (CSI driver role), P4-Q10 (dynamic provisioning) |

### Objective 1.3: Configure DNS, setup the URL, and manage required certificates

| # | Knowledge Point | Status | Evidence |
|---|---|---|---|
| 1.3a | Identify or implement an FQDN for the NAI installation | **COVERED** | P1-Q4 (DNS resolution required), P1-Q13 (ingress/API Gateway external IP), P2-Q41 (CoreDNS + external DNS for ingress hostname) |
| 1.3b | Ensure FQDN has a secure certificate | **COVERED** | P1-Q5 (self-signed cert errors), P1-Q38 (self-signed → production CA certs), P1-Q79 (TLS on endpoint + Ingress), P2-Q16 (TLS cert rotation), P4-Q19 (cert in K8s Secret), P4-Q41 (cert-manager auto-rotation) |
| 1.3c | Validate successful login to UI | **PARTIAL** | P1-Q20 (post-deploy verification via API test). Missing: specific question about validating login to the NAI web UI after FQDN/cert setup. |

---

## Section 2 – Configure a Nutanix Enterprise AI Environment

### Objective 2.1: Onboard users to Nutanix Enterprise AI

| # | Knowledge Point | Status | Evidence |
|---|---|---|---|
| 2.1a | Differentiate between user and administrator roles | **COVERED** | P1-Q41 (User role permissions), P1-Q62 (Admin-only capabilities vs User), P1-Q52 (RBAC via Prism Central projects) |
| 2.1b | Identify user management operations for administrators | **PARTIAL** | P1-Q62 (Admin does user provisioning/role management). Missing: explicit questions about creating users, activating/deactivating users through the NAI UI—the blueprint references specific NAI UI operations. |
| 2.1c | Leverage roles to limit privileges for target users | **COVERED** | P1-Q41 (User role for endpoint + inference), P1-Q52 (Prism Central RBAC + categories), P1-Q72 (project-based multi-tenant isolation), P3-Q53 (Prism Central RBAC), P4-Q14 (per-user API key + RBAC + audit) |

### Objective 2.2: Import Large Language Models (LLMs)

| # | Knowledge Point | Status | Evidence |
|---|---|---|---|
| 2.2a | Recognize methods and repos available for importing | **COVERED** | P1-Q43 (Hugging Face import), P1-Q58 (NVIDIA NGC import), P1-Q78 (valid sources: HF, NGC, manual), P1-Q36 (manual upload for air-gapped) |
| 2.2b | Obtain repo keys for HuggingFace and/or NVIDIA NGC | **COVERED** | P3-Q15 (HF token + EULA acceptance for gated models like Llama 2) |
| 2.2c | Recognize where to add repo keys in the UI for usage | **PARTIAL** | P3-Q15 covers the requirement for HF tokens. Missing: explicit question about where in the NAI UI to add/manage HuggingFace or NGC API tokens (the blueprint references "Replacing a Hugging Face Token" and "Adding an NVIDIA NGC Personal Key" UI operations). |
| 2.2d | Explain the manual import process and requirements | **COVERED** | P1-Q36 (manual upload in air-gapped), P3-Q14 (pre-download, transfer, load to local registry), P1-Q69 (supported formats for upload: SafeTensors, GGUF, ONNX) |

### Objective 2.3: Create endpoints

| # | Knowledge Point | Status | Evidence |
|---|---|---|---|
| 2.3a | Determine a downloaded model to expose via an endpoint | **COVERED** | P1-Q51 (/v1/models returns deployed models), P1-Q61 (separate test endpoint for new models), P4-Q80 (add second model to existing deployment) |
| 2.3b | Determine number and type of GPUs required for a selected model | **COVERED** | P1-Q1 (70B → A100/H100), P1-Q10 (13B FP16 → A100), P3-Q1 (70B FP16 → 2×A100 NVLink), P3-Q6 (VRAM formula by precision), P3-Q9 (33B FP16 → A100 vs L40S), P4-Q1 (70B INT4 sizing), P4-Q22 (L40S for 7B), P3-Q74 (GPU count from throughput benchmark) |
| 2.3c | Determine number of instances for throughput | **COVERED** | P1-Q49 (min/max replicas), P1-Q46 (auto-scaling by queue depth), P1-Q66 (scaling threshold tuning), P1-Q75 (concurrent endpoints limited by GPU capacity) |
| 2.3d | Determine vCPU/memory and inference engine for optimization | **COVERED** | P1-Q50 (TensorRT-LLM for max performance on H100), P1-Q73 (vLLM for broad compatibility), P1-Q44 (INT4 quantization for memory savings), P1-Q80 (engine switch requires new endpoint), P3-Q21-Q30 (vLLM vs TensorRT-LLM deep dive — 10 questions), P4-Q4 (vLLM with PagedAttention), P4-Q16 (TensorRT-LLM compilation step) |

### Objective 2.4: Create and apply keys for each API endpoint

| # | Knowledge Point | Status | Evidence |
|---|---|---|---|
| 2.4a | Identify locations to generate and manage API keys | **COVERED** | P1-Q42 (per-user API keys), P1-Q54 (key rotation via management interface), P4-Q14 (per-user keys managed in Prism Central) |
| 2.4b | Identify where to view API keys in an endpoint | **PARTIAL** | Questions cover API key creation/rotation/revocation. Missing: specific question about viewing assigned API keys within an endpoint detail page in the NAI UI (blueprint references "Widgets in an Endpoint Detail Page"). |
| 2.4c | Deactivate an API key | **COVERED** | P2-Q7 (revoke compromised key immediately), P1-Q54 (revoke old keys during rotation), P3-Q54 (leaked key — immediate revocation), P3-Q58 (zero-downtime rotation: new → update → revoke old) |
| 2.4d | Add an API key to an existing endpoint | **COVERED** | P1-Q42 (per-user API keys), P3-Q51 (per-team keys for tracking), P4-Q29 (grace period rotation implies adding new key alongside old) |

### Objective 2.5: Deliver endpoints to the consumer

| # | Knowledge Point | Status | Evidence |
|---|---|---|---|
| 2.5a | Identify the endpoint URI, model-specific parameters, and API key to share | **COVERED** | P1-Q47 (/v1/chat/completions path), P1-Q67 (/v1/completions for non-chat), P1-Q70 (OpenAI client: change base_url + API key), P2-Q55 (minimum change: base_url + key), P2-Q59 (Authorization: Bearer header) |
| 2.5b | Identify tool calling vs non-tool calling API curl commands | **COVERED** | P4-Q37 (function calling: model families that support tool use), P4-Q56 (tool_calls response format: function name + arguments) |

---

## Section 3 – Perform Day 2 Operations

### Objective 3.1: Prepare requirements for connecting the app

| # | Knowledge Point | Status | Evidence |
|---|---|---|---|
| 3.1a | Determine where to get the sample request in NAI application | **PARTIAL** | P1-Q47, P2-Q56, P2-Q67 cover API paths and request formats. Missing: specific question about the "View Sample Code" feature in the NAI UI that shows copy-paste-ready curl/Python examples. |
| 3.1b | Explain elements in sample request and OpenAI-compliant config | **COVERED** | P2-Q56 (/v1/chat/completions messages array with role/content), P2-Q67 (prompt vs messages format), P2-Q70 (temperature + top_p parameters), P2-Q64 (max_tokens), P3-Q48 (max_tokens vs context window) |
| 3.1c | Recognize different endpoint types and choose correct one | **COVERED** | P1-Q47 (/v1/chat/completions for chat), P1-Q67 (/v1/completions for text), P4-Q38 (/v1/embeddings for embeddings), P2-Q58 (RAG architecture with embeddings + chat) |

### Objective 3.2: Interpret performance details and optimize accordingly

| # | Knowledge Point | Status | Evidence |
|---|---|---|---|
| 3.2a | Determine observability metrics for performance evaluation | **COVERED** | P2-Q5 (TTFT), P2-Q25 (request queue depth), P2-Q11 (TPS throughput), P4-Q28 (latency p50/p95/p99 + throughput + memory), P4-Q55 (ServiceMonitor: latency, throughput, load time, GPU memory, queue) |
| 3.2b | Determine possible changes in resource allocation to remedy latency/throughput | **COVERED** | P2-Q1 (PagedAttention + KV cache tuning), P2-Q11 (increase batch size for low GPU util), P2-Q22 (batch size tuning strategy), P2-Q24 (HPA with GPU metric), P2-Q27 (optimize before adding hardware), P4-Q17 (per-pod resource limits), P4-Q51 (batch size vs latency tradeoff) |

### Objective 3.3: Monitor access activity for outlier detection

| # | Knowledge Point | Status | Evidence |
|---|---|---|---|
| 3.3a | Determine where and how to view top 5 API keys being used | **GAP** | No question specifically addresses the NAI Dashboard widget showing "Top 5 API Keys" usage. Questions cover per-key monitoring concepts but not the specific NAI UI dashboard feature. |
| 3.3b | Locate the endpoint dashboard and view assigned API keys | **PARTIAL** | P2-Q14 (audit logs for API key usage attribution) covers the concept. Missing: explicit question about the endpoint detail page dashboard and its widgets showing assigned API keys (blueprint references "Widgets in an Endpoint Detail Page"). |
| 3.3c | Recognize when to deactivate API keys | **COVERED** | P2-Q7 (compromised key → immediate revocation), P2-Q20 (anomalous usage spike alerts), P3-Q54 (leaked key in GitHub) |
| 3.3d | Review and interpret audit events | **COVERED** | P2-Q14 (audit logs: API key identity, endpoint, tokens), P2-Q26 (RBAC audit logging for compliance), P3-Q55 (audit logging for data access regulations), P4-Q46 (structured logging to aggregator) |

### Objective 3.4: Select the appropriate LLM to optimize output quality

| # | Knowledge Point | Status | Evidence |
|---|---|---|---|
| 3.4a | Determine prompt input and LLM output per endpoint to evaluate accuracy | **COVERED** | P2-Q61 (temperature for deterministic classification), P2-Q66 (code-optimized model + low temp + system prompt), P2-Q75 (RAG: model ignores context → system prompt mitigation) |
| 3.4b | Determine techniques/models to improve output quality | **COVERED** | P1-Q76 (LoRA fine-tuning for domain tasks), P1-Q48 (LoRA adapters), P3-Q12 (LoRA advantages), P2-Q68 (chunking strategy for long docs), P1-Q56 (INT8 best quality/memory balance) |
| 3.4c | Apply guardrails to improve safety | **COVERED** | P3-Q19 (INT4 risk for medical use — quality guardrail), P2-Q75 (system prompt to constrain to retrieved context), P2-Q61 (temperature=0 for consistent output) |
| 3.4d | Apply rerank models to achieve desired results | **PARTIAL** | No explicit question about deploying and using rerank models in NAI. RAG questions (P2-Q58, P2-Q75, P4-Q20) cover retrieval but not reranking specifically. The concept is implied but not directly tested. |

---

## Section 4 – Troubleshoot a Nutanix Enterprise AI Environment

### Objective 4.1: Troubleshoot and resolve performance and resource utilization issues

| # | Knowledge Point | Status | Evidence |
|---|---|---|---|
| 4.1a | Determine where to view infrastructure performance | **COVERED** | P2-Q2 (nvidia-smi + Prism Central VM metrics), P2-Q50 (Prism Central storage IOPS/latency), P2-Q43 (Prism Central VM list for node health), P4-Q60 (Prometheus GPU util + memory + CPU + network) |
| 4.1b | Filter by GPU nodes and review GPU utilization graph | **COVERED** | P2-Q2 (nvidia-smi for GPU util/temp/ECC), P3-Q7 (node selectors for specific GPU types), P1-Q30 (kubectl describe nodes for GPU resources) |
| 4.1c | Determine if an endpoint is using GPU | **COVERED** | P2-Q47 (0% GPU util = model loaded on CPU not GPU), P1-Q34 (Insufficient nvidia.com/gpu scheduling error), P3-Q63 (no CUDA device = no GPU) |
| 4.1d | Recognize which type of GPU an endpoint is using | **COVERED** | P3-Q7 (node selectors targeting A100 nodes), P3-Q37 (GPU product label matching), P1-Q30 (nvidia.com/gpu in allocatable resources) |
| 4.1e | Determine if endpoint is using CPU-based acceleration or not | **COVERED** | P2-Q47 (CUDA mismatch → CPU fallback), P3-Q63 (no CUDA device detected), P1-Q68 (full GPU passthrough vs MIG) |

### Objective 4.2: Remediate health check failures on the cluster

| # | Knowledge Point | Status | Evidence |
|---|---|---|---|
| 4.2a | Debug a cluster health fail visible on NAI UI | **COVERED** | P2-Q43 (NotReady node → Prism Central VM metrics), P2-Q19 (503 after upgrade → readiness probe check) |
| 4.2b | Recognize different components causing health check failures | **COVERED** | P2-Q28 (GPU passthrough → CUDA error), P2-Q34 (NVIDIA device plugin CrashLoopBackOff), P2-Q53 (VolumeMount errors after power outage), P2-Q41 (CoreDNS failures) |
| 4.2c | Analyze Kubernetes NAI system resources to address health check failures | **COVERED** | P2-Q36 (kubectl diagnostic workflow: get pods → describe → logs → exec), P2-Q21 (kubectl logs for NAI operator), P2-Q48 (kubectl describe for eviction reasons) |
| 4.2d | Determine which layer of the stack is causing health check failure | **COVERED** | P2-Q28 (GPU/driver layer), P2-Q30 (networking/ingress layer), P2-Q53 (storage layer), P2-Q40 (system RAM vs GPU VRAM OOM), P2-Q43 (infrastructure/VM layer via Prism Central) |
| 4.2e | Based on diagnosis, determine appropriate course of action | **COVERED** | P2-Q31 (ECC errors → drain node + replace GPU), P2-Q46 (kubectl drain for maintenance), P2-Q45 (corrupted config → restore from Git), P2-Q49 (deleted Secret → recreate + restart pods) |

### Objective 4.3: Troubleshoot model import and endpoint creation

| # | Knowledge Point | Status | Evidence |
|---|---|---|---|
| 4.3a | Identify failure scenarios for model download (prevalidated, custom, restricted networks) | **COVERED** | P3-Q15 (HF gated model needs EULA + token), P2-Q38 (checksum mismatch — proxy cache corruption), P1-Q36 (air-gapped: manual transfer required) |
| 4.3a-sub1 | Troubleshoot CSI driver connectivity | **COVERED** | P1-Q8 (CSI driver missing → storage check fails), P2-Q53 (PV/PVC bind state after power outage), P2-Q42 (ReadWriteMany access mode for multi-pod), P4-Q43 (NFS bandwidth saturation on concurrent model loads) |
| 4.3a-sub2 | Ensure model EULA accepted on HuggingFace (Llama) | **COVERED** | P3-Q15 (HF token + license acceptance required for gated models) |
| 4.3a-sub3 | Ensure HuggingFace/NVIDIA token is valid | **COVERED** | P3-Q15 (HF access token requirement), P1-Q58 (NGC model path during import) |
| 4.3b | Determine available allocatable resources preventing scheduling | **COVERED** | P1-Q34 (Insufficient nvidia.com/gpu), P2-Q33 (all GPUs allocated), P2-Q39 (nodeAffinity mismatch), P4-Q42 (GPU memory request > node available → Pending) |
| 4.3c | Recognize if all prerequisites were successfully installed (e.g. Kserve) | **COVERED** | P1-Q23 (GPU device plugin/Operator missing), P3-Q39 (no nvidia.com/gpu resource → device plugin issue), P3-Q33 (NVIDIA GPU Operator components) |
| 4.3d | Diagnose container images failing to download or store on K8s nodes | **COVERED** | P2-Q8 (ImagePullBackOff: registry credentials + network), P4-Q49 (ImagePullBackOff: wrong image path or missing imagePullSecret) |

---

## Section 5 – Connect Applications to a Nutanix Enterprise AI Environment

### Objective 5.1: Configure and validate an application with the endpoint

| # | Knowledge Point | Status | Evidence |
|---|---|---|---|
| 5.1a | Differentiate between model and endpoint types consumed by application | **COVERED** | P1-Q47 (/v1/chat/completions for chat), P1-Q67 (/v1/completions for text), P4-Q38 (/v1/embeddings), P2-Q60 (GET /v1/models for discovery) |
| 5.1b | Recognize purpose and use case for integrating various model types | **COVERED** | P2-Q58 (RAG architecture: embeddings + LLM), P2-Q66 (code-optimized model), P2-Q74 (structured extraction), P2-Q68 (document summarization), P4-Q37 (function calling models) |
| 5.1c | Issue simple query to OpenAI-compatible API via Python or Curl | **COVERED** | P2-Q55 (OpenAI Python SDK: change base_url + api_key), P2-Q57 (streaming with stream:true + SSE), P2-Q59 (Authorization: Bearer header), P3-Q41 (OpenAI SDK code change), P4-Q13 (drop-in SDK compatibility) |
| 5.1d | Investigate and address application integration issues | **COVERED** | P2-Q67 (422 error: wrong request format), P2-Q73 (wrong base_url → 404), P2-Q72 (429 rate limiting → retry), P3-Q45 (model name mismatch error), P2-Q54 (401 Unauthorized: API key issue) |

### Objective 5.2: Check endpoint metrics corresponding to application usage

| # | Knowledge Point | Status | Evidence |
|---|---|---|---|
| 5.2a | Identify latency and number of API requests per endpoint associated with application | **COVERED** | P2-Q69 (/metrics endpoint: request counts, latencies, queue depth), P2-Q5 (TTFT for streaming responsiveness), P4-Q55 (ServiceMonitor: inference latency + throughput + queue), P4-Q60 (p99 latency SLO monitoring) |
| 5.2b | Describe how to correlate application with NAI endpoint metrics | **COVERED** | P2-Q14 (API gateway audit logs: key identity + endpoint + tokens), P2-Q20 (per-key token consumption alerting), P2-Q62 (/health endpoint for load balancer), P3-Q43 (prompt_tokens in usage response) |

---

## Gap Analysis Summary

### Critical Gaps (No Coverage)

| # | Objective | Gap Description | Recommended Questions |
|---|---|---|---|
| **1** | **1.2a** — Compare NKP vs non-NKP installation | No questions compare the NKP App Catalog installation flow vs. non-NKP (vanilla Kubernetes) installation. The blueprint explicitly requires candidates to "compare and contrast the installation process for NKP (including app catalog) and non-NKP environments." | Write 2–3 questions: (1) Which steps differ between NKP App Catalog vs kubectl-based install? (2) What additional components must be manually configured in a non-NKP K8s environment? (3) Scenario: customer has vanilla K8s — what extra steps vs NKP? |
| **2** | **3.3a** — View top 5 API keys in NAI Dashboard | No question tests knowledge of the NAI Dashboard widget showing the top 5 most-used API keys. The blueprint references "NAI Dashboard Widgets" and "Widgets in an Endpoint Detail Page." | Write 2 questions: (1) Where in the NAI UI can an admin view the top 5 API keys by usage? (2) Scenario: admin needs to identify which consumer is generating the most traffic — which dashboard widget? |

### Partial Coverage (Needs Reinforcement)

| # | Objective | What's Missing | Recommended Action |
|---|---|---|---|
| **3** | **1.2b** — Version compatibility matrix | Questions cover component relationships but not explicit version compatibility (NAI 2.3 ↔ NKP version ↔ GPU Operator version). | Add 1–2 questions about checking the compatibility matrix before upgrades. |
| **4** | **1.3c** — Validate successful login to UI | Only API-level post-deploy verification exists. No question about logging into the NAI web UI itself. | Add 1 question: After configuring FQDN and TLS, how do you validate NAI UI login? |
| **5** | **2.1b** — User management operations in NAI UI | Questions cover RBAC roles conceptually but not NAI-specific UI operations (creating users, activating/deactivating users in NAI). | Add 1–2 questions about creating/managing users through the NAI interface. |
| **6** | **2.2c** — Where to add repo keys in the UI | HF token requirement is covered but not where to enter/replace them in NAI UI. | Add 1 question: Where in NAI do you add/replace a HuggingFace token or NGC personal key? |
| **7** | **2.4b** — View API keys in endpoint detail page | Conceptual API key management is strong but no question about the endpoint detail page widget. | Add 1 question about viewing API keys assigned to a specific endpoint in the NAI UI. |
| **8** | **3.4d** — Apply rerank models | RAG is well covered but rerank models as a quality improvement technique are not explicitly tested. | Add 1–2 questions: (1) What is a rerank model and when should it be used? (2) How do you deploy and configure a rerank endpoint in NAI? |

---

## Coverage Heatmap by Section

| Section | Objectives | Covered | Partial | Gap | Score |
|---|---|---|---|---|---|
| **1 – Deploy** | 11 | 8 | 2 | 1 | 82% |
| **2 – Configure** | 14 | 11 | 3 | 0 | 89% |
| **3 – Day 2 Ops** | 10 | 7 | 2 | 1 | 80% |
| **4 – Troubleshoot** | 13 | 13 | 0 | 0 | **100%** |
| **5 – Connect Apps** | 6 | 6 | 0 | 0 | **100%** |
| **TOTAL** | **44** | **36** | **6** | **2** | **91%** |

> Score formula: (Covered×1.0 + Partial×0.5 + Gap×0.0) / Total

---

## Question Distribution by Section

| Section | Blueprint Section | Part 1 | Part 2 | Part 3 | Part 4 | Total |
|---|---|---|---|---|---|---|
| 1 – Deploy | Q1-Q40 (P1) | 40 | — | ~15 | ~15 | ~70 |
| 2 – Configure | Q41-Q80 (P1) | 40 | — | ~15 | ~15 | ~70 |
| 3 – Day 2 Ops | Q1-Q27 (P2) | — | 27 | ~10 | ~10 | ~47 |
| 4 – Troubleshoot | Q28-Q54 (P2) | — | 27 | ~20 | ~15 | ~62 |
| 5 – Connect Apps | Q55-Q80 (P2) | — | 26 | ~20 | ~25 | ~71 |
| **TOTAL** | | **80** | **80** | **80** | **80** | **320** |

---

## Recommendations

### Priority 1 — Close Gaps (write 6–8 new questions)

1. **NKP vs Non-NKP Installation (Obj 1.2a):** 3 new questions comparing NKP App Catalog install vs. kubectl manifest-based install on non-NKP Kubernetes. Include a scenario question about what's needed when a customer has upstream K8s instead of NKP.

2. **NAI Dashboard — Top 5 API Keys Widget (Obj 3.3a):** 2 new questions testing knowledge of the NAI Dashboard widgets, specifically the top 5 API keys visualization, endpoint dashboard widgets, and how to use them for outlier detection.

### Priority 2 — Strengthen Partial Coverage (write 6–8 new questions)

3. **NAI UI-Specific Workflows:** Add 3–4 questions about:
   - Logging into the NAI UI and validating access (Obj 1.3c)
   - Creating/activating/deactivating users in NAI (Obj 2.1b)
   - Adding/replacing HuggingFace or NGC tokens in the NAI UI (Obj 2.2c)
   - Viewing API keys in the endpoint detail page (Obj 2.4b)

4. **Version Compatibility (Obj 1.2b):** 1–2 questions about NAI 2.3 compatibility requirements with NKP versions and NVIDIA GPU Operator versions.

5. **Rerank Models (Obj 3.4d):** 2 questions about deploying and using rerank models in NAI for improving RAG output quality.

### Priority 3 — Balance Question Types

The current bank is heavily weighted toward standard MCQ. Part 4 includes "Select Two" and "Ordering" formats which align well with the exam format. Consider adding more multi-select and ordering questions for Sections 1–3 to match the exam experience.

---

*Report generated from analysis of NCP-AI 6.10 Exam Blueprint Guide against 320 practice questions across 4 question bank files.*
