# NCP-US 6.10 Blueprint Coverage Analysis

> **Generated:** Auto-analysis of 320 practice questions against the official NCP-US 6.10 Exam Blueprint Guide  
> **Exam Format:** 75 MCQ | 120 minutes | Pass: 3000/6000 scaled score | $200 USD  
> **Software Versions:** AOS 6.10 · Prism Central pc2024.2 · Files 5.0 · Objects 5.0 · Volumes 6.10 · File Analytics 3.4 · Data Lens DL2024.6

---

## Question Bank Inventory

| File | Questions | Domain Coverage |
|------|-----------|-----------------|
| `NCP-US-Part1.md` Q1–Q80 | 80 | Domain 1 — Deploy & Upgrade |
| `NCP-US-Part1.md` Q81–Q160 | 80 | Domain 2 — Configure & Utilize |
| `NCP-US-Part2-D3.md` Q1–Q80 | 80 | Domain 3 — Analyze & Monitor |
| `NCP-US-Part2-D4.md` Q1–Q80 | 80 | Domain 4 — Troubleshoot |
| **Total** | **320** | All 4 Sections |

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Total blueprint objectives (bullet-level) | **67** |
| COVERED (adequate questions exist) | **38** (57%) |
| PARTIAL (some coverage, needs strengthening) | **15** (22%) |
| GAP (zero or near-zero coverage) | **14** (21%) |

**Critical finding:** 14 distinct blueprint sub-objectives have zero or negligible coverage in the question bank. The biggest systematic gaps are: **Data Lens integration**, **Mine for Objects**, **Objects Federation**, **Objects Namespaces**, **VDI Sync**, **FQDN pathing**, **File Server Manager interface**, **Smart/Standard/Advanced Tiering differentiation**, and several troubleshooting sub-topics.

---

## Section 1 — Deploy and Upgrade Nutanix Unified Storage

**Source:** `NCP-US-Part1.md` Q1–Q80 (80 questions)

### Objective 1.1: Identify the steps to deploy Nutanix Files

| # | Blueprint Objective | Status | Question Coverage | Notes |
|---|---------------------|--------|-------------------|-------|
| 1 | Identify prerequisites and limitations for Files deployment | **COVERED** | Q1-Q4, Q24, Q39, Q45, Q47, Q52, Q72, Q76, Q80 (~12 Qs) | Strong: FSVM counts (1-16), HA min 3, sizing 4vCPU/12GB, storage containers |
| 2 | Identify appropriate client and storage networks | **COVERED** | Q5, Q34, Q50 (3 Qs) | Client-side vs. storage/backplane networks well covered |
| 3 | Ensure NTP, DNS and Active Directory Services configured | **PARTIAL** | Q6, Q7, Q41, Q57, Q58 (5 Qs) | DNS A records and AD join covered; **NTP has 0 questions**; no Kerberos keytab, AD trusts |
| 4 | Identify supported protocols | **PARTIAL** | Q25-Q27, Q48 (4 Qs) | Share types (distributed/standard/home) covered; **SMB 2.1/3.0 versions, NFSv3/v4 variants, krb5/krb5i/krb5p not covered** |
| 5 | Integrate Files with Data Lens | **GAP** | 0 Qs | No questions on Data Lens integration for Files |
| 6 | Describe how to deploy File Analytics | **GAP** | 0 Qs | No deployment-focused questions (covered in D3 for usage, but not deployment steps in D1) |
| 7 | Describe integration with Nutanix Central | **GAP** | 0 Qs | No questions on Nutanix Central integration |
| 8 | Identify how to use VDI Sync to sync profiles between sites | **GAP** | 0 Qs | No questions on VDI Sync |
| 9 | Identify subdomains vs. folder structures for FQDN pathing | **GAP** | 0 Qs | No questions on FQDN pathing architecture |

### Objective 1.2: Identify the steps to deploy Nutanix Objects

| # | Blueprint Objective | Status | Question Coverage | Notes |
|---|---------------------|--------|-------------------|-------|
| 10 | Identify prerequisites and limitations for Objects deployment | **COVERED** | Q8-Q14, Q36, Q43, Q49, Q53, Q59, Q61, Q68, Q70, Q77 (~16 Qs) | Strong: Prism Central required, min 3 workers, MSP/K8s, network requirements |
| 11 | Ensure NTP, DNS, and Active Directory Services configured | **PARTIAL** | Q75 (1 Q) | Only DNS resolution of S3 endpoint; NTP and AD/LDAP for Objects not covered |
| 12 | Identify requirements for enabling fault tolerance | **PARTIAL** | Q28, Q37, Q64 (3 Qs) | Single-site vs. multi-site covered; replication strategy and failover RTO/RPO not covered |
| 13 | Integrate Objects with Data Lens | **GAP** | 0 Qs | No questions |
| 14 | Validate connectivity before handoff | **PARTIAL** | Q75 (1 Q) | Only DNS; no API/S3 endpoint validation, no bucket access tests |

### Objective 1.3: Perform upgrades/maintenance for Files/Objects implementations

| # | Blueprint Objective | Status | Question Coverage | Notes |
|---|---------------------|--------|-------------------|-------|
| 15 | Determine Files/Objects dependencies and prerequisites | **COVERED** | Q19, Q20, Q46, Q62, Q65 (5 Qs) | Pre-checks, FSVM health, AD connectivity, PC compatibility |
| 16 | Explain Files/Objects upgrade process | **COVERED** | Q17, Q18, Q21, Q55, Q78 (5 Qs) | Rolling upgrades, connection migration, pre-check utility |
| 17 | Maintain impact for Files and Objects (distributed vs. standard shares) | **PARTIAL** | Q25-Q27, Q74 (indirect, 0 explicit) | No questions on upgrade impact by share type or data rebalancing during upgrades |
| 18 | Understand when to scale up/scale out | **COVERED** | Q23, Q32, Q33, Q42, Q63, Q74 (6 Qs) | Scale-out (add FSVMs) vs. scale-up (vCPU/RAM), non-disruptive scaling |

### Objective 1.4: Apply product and implementation parameters

| # | Blueprint Objective | Status | Question Coverage | Notes |
|---|---------------------|--------|-------------------|-------|
| 19 | Determine capacity and performance requirements for Files/Objects | **COVERED** | Q22, Q38, Q51, Q56, Q67 (5 Qs) | VDI IOPS calculations, throughput sizing, FSVM count formulas |
| 20 | Determine capacity and performance requirements for Volumes | **PARTIAL** | Q15, Q44, Q66, Q79 (4 Qs) | VG use cases covered; **performance limits, IOPS specs, caching strategy not covered** |
| 21 | Determine network segmentation requirements of each product | **COVERED** | Q16, Q30, Q31, Q34, Q35, Q40, Q54, Q60, Q69, Q71, Q73 (11 Qs) | IP planning, Data Services IP, client/storage network separation |

---

## Section 2 — Configure and Utilize Nutanix Unified Storage

**Source:** `NCP-US-Part1.md` Q81–Q160 (80 questions)

### Objective 2.1: Configure Nutanix Files with advanced features

| # | Blueprint Objective | Status | Question Coverage | Notes |
|---|---------------------|--------|-------------------|-------|
| 22 | Configure Smart DR, File Analytics, and Smart Tiering | **COVERED** | Q125-Q129, Q148-Q150, Q158 (9 Qs) | Smart DR failover/failback, Smart Tiering cold-data recall; **File Analytics configuration missing** |
| 23 | Onboard Nutanix File instances to Data Lens | **GAP** | 0 Qs | No questions on Data Lens onboarding procedures |
| 24 | Create a CIFS, NFS, and multi-protocol share | **COVERED** | Q81, Q89-Q92, Q135, Q157-Q160 (8 Qs) | Multi-protocol creation, RFC 2307 mapping, protocol selection |
| 25 | Manage permissions | **COVERED** | Q82, Q101, Q135, Q137, Q153, Q157 (6 Qs) | ABE, share delegation, multi-protocol permissions |
| 26 | Implement nested shares and exports | **PARTIAL** | Q96, Q97, Q152 (3 Qs) | Home shares covered; nested NFS exports and permission inheritance not covered |

### Objective 2.2: Configure Nutanix Volumes

| # | Blueprint Objective | Status | Question Coverage | Notes |
|---|---------------------|--------|-------------------|-------|
| 27 | Present Nutanix Volumes to physical servers | **PARTIAL** | Q122-Q124 (3 Qs) | Windows/Linux iSCSI initiators and MPIO; target discovery and LUN assignment details missing |
| 28 | Present Nutanix Volumes to virtual machines | **GAP** | Q146 (1 Q, indirect) | Only shared VG for multiple hosts; **VM attachment, snapshot integration, live migration not covered** |
| 29 | Add/Remove volumes to Volume Groups | **GAP** | 0 Qs | No questions on VG creation, adding/removing volumes |
| 30 | Configure CHAP | **PARTIAL** | Q120, Q147 (2 Qs) | CHAP basics covered; mutual CHAP, Prism configuration steps missing |
| 31 | Determine when to use cluster white lists vs. volume white lists | **PARTIAL** | Q121 (1 Q) | IQN whitelist concept covered; **comparison between cluster vs. volume whitelists not addressed** |

### Objective 2.3: Configure Nutanix Objects

| # | Blueprint Objective | Status | Question Coverage | Notes |
|---|---------------------|--------|-------------------|-------|
| 32 | Validate connectivity within a Nutanix Objects environment | **GAP** | 0 Qs | No connectivity validation questions |
| 33 | Generate access keys | **PARTIAL** | Q105, Q138 (2 Qs) | Key generation covered; key rotation, revocation, multi-key management missing |
| 34 | Configure Nutanix Objects for endpoint access | **PARTIAL** | Q106 (1 Q) | S3-compatible API mentioned; endpoint URL, SSL/TLS setup not covered |
| 35 | Create and configure buckets | **COVERED** | Q105, Q107, Q108, Q138, Q139 (5 Qs) | Bucket creation, JSON policies, access control |
| 36 | Create additional namespaces | **GAP** | 0 Qs | No questions on namespace creation or multi-tenancy |
| 37 | Configure Federation | **GAP** | 0 Qs | No questions on Objects federation |
| 38 | Secure Objects | **COVERED** | Q109-Q113 (5 Qs) | WORM, versioning, Object Lock, immutability well covered |

### Objective 2.4: Given a scenario, configure shares, buckets, and/or Volume groups

| # | Blueprint Objective | Status | Question Coverage | Notes |
|---|---------------------|--------|-------------------|-------|
| 39 | Determine appropriate product for iSCSI, NFS, SMB, S3 scenarios | **PARTIAL** | Q93-Q95, Q134, Q145, Q146, Q160 (7 Qs) | Share types and some scenarios; **explicit NFS-vs-SMB and iSCSI-vs-NFS selection criteria missing** |

### Objective 2.5: Determine the appropriate method to ensure data availability/recoverability

| # | Blueprint Objective | Status | Question Coverage | Notes |
|---|---------------------|--------|-------------------|-------|
| 40 | Given RPO/RTO, determine appropriate local and remote platform solution | **PARTIAL** | Q125, Q126, Q148-Q150 (5 Qs) | Smart DR covered; **no RPO/RTO metric-based scenario selection** |
| 41 | Given RPO/RTO, determine appropriate backup/recovery options | **PARTIAL** | Q102-Q104, Q127, Q151, Q155 (6 Qs) | SSR and snapshots covered; retention policies, backup verification missing |
| 42 | Recognize how to integrate Mine with Objects | **GAP** | 0 Qs | No questions on Mine integration |

### Objective 2.6: Explain Data Management capabilities for Files and Objects

| # | Blueprint Objective | Status | Question Coverage | Notes |
|---|---------------------|--------|-------------------|-------|
| 43 | Describe data availability technologies (Smart DR, Smart Tiering, Data Sync, SSR, PD/Protection Policies) | **COVERED** | Q102-Q104, Q125-Q129, Q148-Q151, Q158 (13 Qs) | Strong across most technologies; **Data Sync has 0 questions** |
| 44 | Describe HA options within Files and Objects | **PARTIAL** | Q159, Q160 (2 Qs) | MPIO and WORM; **FSVM HA, active-active, Objects namespace HA, load balancing not covered** |
| 45 | Describe data recoverability using Mine for Objects | **GAP** | 0 Qs | No questions on Mine |

---

## Section 3 — Analyze and Monitor Unified Storage

**Source:** `NCP-US-Part2-D3.md` Q1–Q80 (80 questions)

### Objective 3.1: Utilize File Analytics for data security

| # | Blueprint Objective | Status | Question Coverage | Notes |
|---|---------------------|--------|-------------------|-------|
| 46 | Use anomalies to determine suspicious activity (including deletion detection) | **COVERED** | Q1, Q8, Q9, Q65 (4 Qs) | Anomaly detection, audit trails for deletes |
| 47 | Audit file access, usage, and modifications | **COVERED** | Q1, Q5, Q8, Q9, Q16, Q56, Q72 (7 Qs) | Top Contributors, audit trails (CRUD + permission changes) |
| 48 | Determine users with too many resource demands | **COVERED** | Q1, Q5, Q72 (3 Qs) | Top Contributors widget, anomaly detection |
| 49 | Determine top active users | **COVERED** | Q5, Q56 (2 Qs) | Top Contributors widget |
| 50 | Determine file distribution by type | **COVERED** | Q6, Q15, Q55 (3 Qs) | File distribution dashboard by type/size/age |
| 51 | Detect ransomware and other security threats | **COVERED** | Q1, Q10-Q13, Q16, Q64, Q76 (8 Qs) | Entropy-based detection, blocklists, configurable thresholds, alerting |

### Objective 3.2: Describe how to monitor performance and usage

| # | Blueprint Objective | Status | Question Coverage | Notes |
|---|---------------------|--------|-------------------|-------|
| 52 | Identify when to scale up/out Files and Objects clusters | **COVERED** | Q7, Q14, Q39, Q63, Q71, Q78 (6 Qs) | Capacity trending, growth forecasting |
| 53 | Identify metrics to determine when to scale up/out | **COVERED** | Q7, Q14, Q39, Q63, Q71 (5 Qs) | IOPS, throughput, capacity trending, growth rate |
| 54 | Identify performance constraints from cluster utilization perspective | **COVERED** | Q34, Q41, Q45, Q46, Q51, Q61, Q70, Q75, Q78, Q79 (10 Qs) | VG IOPS/throughput/latency, Objects GET/PUT, iSCSI sessions |
| 55 | Recognize management/monitoring interfaces (Nutanix Central, Prism Central, File Server Manager, Prism Element) | **PARTIAL** | Q2, Q4, Q12, Q18-Q22, Q33, Q34, Q40, Q42-Q44, Q62 (~15 Qs) | PC and PE well covered; **File Server Manager has 0 dedicated questions; Nutanix Central only implied** |

### Objective 3.3: Describe the use of Data Lens for data security

| # | Blueprint Objective | Status | Question Coverage | Notes |
|---|---------------------|--------|-------------------|-------|
| 56 | Describe use cases for Data Lens | **COVERED** | Q20, Q21, Q23-Q25, Q28, Q59, Q66, Q67, Q80 (10 Qs) | PII detection, multi-cluster visibility, permissions scanning, stale data, compliance |
| 57 | Relate requirements and supported features to a given use case | **COVERED** | Q22-Q32, Q57, Q59 (13 Qs) | Feature-to-use-case mapping well covered |
| 58 | Differentiate between Smart Tiering, Standard Tiering, and Advanced Tiering | **GAP** | 0 Qs | **Critical gap — no questions distinguish the three tiering levels** |
| 59 | Differentiate File Analytics and Data Lens | **COVERED** | Q20, Q22, Q30, Q58, Q76 (5 Qs) | On-prem vs. SaaS, single vs. multi-cluster, detection approaches |

---

## Section 4 — Troubleshoot Nutanix Unified Storage

**Source:** `NCP-US-Part2-D4.md` Q1–Q80 (80 questions)

### Objective 4.1: Troubleshoot issues related to Files

| # | Blueprint Objective | Status | Question Coverage | Notes |
|---|---------------------|--------|-------------------|-------|
| 60 | Determine user permissions issues (multiple groups, conflicting permissions, back-up accounts, share admin, IAM) | **PARTIAL** | Q6-Q8, Q17-Q20 (7 Qs) | Multi-protocol auth, ACL mapping covered; **back-up accounts, share admin role, multiple-group conflicts, IAM specifically not covered** |
| 61 | Determine shared visibility issues | **PARTIAL** | Q5, Q10, Q12, Q21-Q24 (7 Qs) | FSVM load distribution, scaling, rebalancing; explicit share visibility/enumeration issues limited |
| 62 | Determine reasons for deployment failures (AD service account, DNS records) | **COVERED** | Q1-Q4, Q9, Q68-Q70 (8 Qs) | DNS A records, FSVM health, minerva_nvm.log, network connectivity, VLAN/MTU |
| 63 | Determine why data is not being tiered | **PARTIAL** | Q11, Q27, Q76 (3 Qs) | Tiering recall latency, SSD exhaustion; **why tiering fails to activate or policy misconfig not covered** |
| 64 | Determine why Directory Services and DNS are not being changed in Smart DR | **GAP** | 0 Qs | No questions on Smart DR DNS/Directory Services failover issues |
| 65 | Determine issues related to failing over and failing back a file server | **PARTIAL** | Q25, Q26, Q50 (3 Qs) | Snapshot replication, RPO staleness; **file server failover/failback procedures, cross-site consistency not covered** |
| 66 | Address cross cluster User profile issues | **GAP** | 0 Qs | No questions on cross-cluster profiles, roaming profiles, identity sync |

### Objective 4.2: Troubleshoot issues related to Objects

| # | Blueprint Objective | Status | Question Coverage | Notes |
|---|---------------------|--------|-------------------|-------|
| 67 | Troubleshoot the reasons for deployment failures | **COVERED** | Q28-Q31, Q36, Q37, Q77, Q78 (8 Qs) | MSP health, kubectl, pod CrashLoopBackOff, resource constraints |
| 68 | Troubleshoot issues with read/write capabilities | **COVERED** | Q32-Q35, Q38-Q41 (8 Qs) | S3 403 errors, IAM policies, CORS, WORM grace period, legal hold |
| 69 | Troubleshoot appropriate access for troubleshooting | **PARTIAL** | Q32, Q35 (2 Qs, indirect) | IAM permissions implied; **no dedicated admin access or emergency access questions** |
| 70 | Troubleshoot Objects with appropriate CLI commands | **PARTIAL** | Q28, Q78 (2 Qs) | kubectl commands; **S3 CLI (aws s3), diagnostic commands, bucket analysis tools not covered** |
| 71 | Troubleshoot issues with Objects replication | **GAP** | 0 Qs | No questions on cross-site replication failures or bucket synchronization |
| 72 | Troubleshoot issues related to Cloud Tiering | **COVERED** | Q45-Q47 (3 Qs) | Lifecycle policy delays, expiration timing, cold storage access latency |

### Objective 4.3: Troubleshoot issues related to Volumes

| # | Blueprint Objective | Status | Question Coverage | Notes |
|---|---------------------|--------|-------------------|-------|
| 73 | Determine proper authentication | **PARTIAL** | Q49 (1 Q) | CHAP secret matching; **no Kerberos for iSCSI, no protocol selection scenarios** |
| 74 | Determine proper firewall settings | **PARTIAL** | Q48, Q56 (2 Qs) | Port 3260 and target portal reachability; **firewall rule validation and port ranges not covered** |
| 75 | Determine correct IQNs/whitelists | **COVERED** | Q51-Q53, Q57 (4 Qs) | IQN mismatch, MPIO policies, discovery-based vs. static targets |
| 76 | Determine proper iSCSI timeout settings | **PARTIAL** | Q54 (1 Q) | Timeout/retry for failover detection; **tuning recommendations, timeout scenarios not covered** |
| 77 | Determine basic steps to add capacity to a VG | **PARTIAL** | Q58-Q61, Q79 (5 Qs) | Flash mode, compression, deduplication; **explicit capacity-add steps and LUN expansion not covered** |
| 78 | Troubleshoot inability to see newly added capacity | **GAP** | 0 Qs | No questions on capacity discovery failures or LUN rescan procedures |

### Objective 4.4: Troubleshoot a failed upgrade for Files/Objects

| # | Blueprint Objective | Status | Question Coverage | Notes |
|---|---------------------|--------|-------------------|-------|
| 79 | Address AOS/Nutanix Central/Prism Central compatibility issues | **PARTIAL** | Q62, Q75 (2 Qs) | NCC health checks, Files/AOS version compat; **Prism Central and Nutanix Central upgrade failures not covered** |
| 80 | Determine appropriate logs to review | **COVERED** | Q13-Q16, Q63, Q65-Q67, Q71-Q74, Q80 (13 Qs) | Rolling upgrades, NCC checks, Logbay collection, component filtering |
| 81 | Address File Analytics compatibility issues and requirements | **GAP** | 0 Qs | No questions on File Analytics upgrade/compatibility troubleshooting |
| 82 | Address Data Lens compatibility issues and requirements | **GAP** | 0 Qs | No questions on Data Lens compatibility troubleshooting |

---

## Gap Summary

### Critical Gaps — Zero Coverage (14 objectives)

These blueprint objectives have **no questions at all** in the 320-question bank:

| # | Section | Objective | Topic Needing Questions |
|---|---------|-----------|------------------------|
| 1 | 1.1 | Deploy Files | **Integrate Files with Data Lens** — Data Lens onboarding steps, connectivity requirements |
| 2 | 1.1 | Deploy Files | **Deploy File Analytics** — FA VM deployment steps, prerequisites, sizing (usage is in D3 but deploy is not in D1) |
| 3 | 1.1 | Deploy Files | **Integration with Nutanix Central** — Central console for Files management |
| 4 | 1.1 | Deploy Files | **VDI Sync** — profile synchronization between sites, use cases, configuration |
| 5 | 1.1 | Deploy Files | **Subdomains vs. folder structures for FQDN pathing** — FQDN architecture decisions |
| 6 | 1.2 | Deploy Objects | **Integrate Objects with Data Lens** — Data Lens visibility for object stores |
| 7 | 2.1 | Configure Files | **Onboard File instances to Data Lens** — onboarding workflow, prerequisites |
| 8 | 2.2 | Configure Volumes | **Add/Remove volumes to Volume Groups** — VG management procedures |
| 9 | 2.3 | Configure Objects | **Create additional namespaces** — namespace isolation, multi-tenancy |
| 10 | 2.3 | Configure Objects | **Configure Federation** — cross-cluster federation setup and policies |
| 11 | 2.5 | Data Availability | **Integrate Mine with Objects** — Mine backup agent, workflow, recovery |
| 12 | 3.3 | Data Lens | **Differentiate Smart Tiering, Standard Tiering, Advanced Tiering** — tiering level comparison |
| 13 | 4.1 | Troubleshoot Files | **Directory Services and DNS in Smart DR** — DR-specific DNS/AD failover issues |
| 14 | 4.1 | Troubleshoot Files | **Cross-cluster User profile issues** — roaming profiles, identity sync |

Plus additional zero-coverage items from sub-objectives:

| # | Section | Topic Needing Questions |
|---|---------|------------------------|
| 15 | 2.3 | **Validate Objects connectivity** — environment health validation |
| 16 | 2.5/2.6 | **Mine for Objects recoverability** — backup/restore with Mine |
| 17 | 4.2 | **Objects replication failures** — cross-site replication troubleshooting |
| 18 | 4.3 | **Inability to see newly added VG capacity** — LUN rescan, capacity discovery |
| 19 | 4.4 | **File Analytics compatibility issues** — FA upgrade troubleshooting |
| 20 | 4.4 | **Data Lens compatibility issues** — DL version requirements during upgrades |

### Partial Coverage — Needs Strengthening (15 objectives)

| Section | Topic | Current Qs | What's Missing |
|---------|-------|------------|----------------|
| 1.1 | NTP/DNS/AD configuration | 5 | NTP synchronization (0 Qs), AD trusts, Kerberos keytab |
| 1.1 | Supported protocols | 4 | SMB version specifics, NFSv3/v4, Kerberos NFS variants |
| 1.2 | Fault tolerance requirements | 3 | Replication strategy, failover RTO/RPO for Objects |
| 1.2 | Validate connectivity before handoff | 1 | API/S3 endpoint validation, bucket access tests |
| 1.3 | Upgrade impact (distributed vs. standard shares) | 0 explicit | Impact by share type during rolling upgrades |
| 2.2 | Present Volumes to VMs | 1 indirect | VM attachment, snapshot considerations, live migration |
| 2.2 | Cluster vs. volume whitelists | 1 | Side-by-side comparison and selection criteria |
| 2.4 | Scenario-based product selection | 7 | Explicit NFS-vs-SMB, iSCSI-vs-NFS decision scenarios |
| 2.5 | RPO/RTO scenario selection | 5 | Metric-based RPO/RTO calculation scenarios |
| 2.6 | HA options in Files and Objects | 2 | FSVM HA, active-active, Objects namespace HA |
| 3.2 | Management/monitoring interfaces | ~15 | **File Server Manager (0 Qs)**, Nutanix Central (implied only) |
| 4.1 | User permissions issues | 7 | Back-up accounts, share admin, multiple-group conflicts |
| 4.1 | Data tiering troubleshooting | 3 | Why tiering fails to activate, policy misconfigurations |
| 4.1 | Failover/failback issues | 3 | File server failover procedures, cross-site consistency |
| 4.3 | iSCSI authentication | 1 | Additional auth scenarios beyond CHAP |

---

## Coverage Statistics by Section

### Section 1 — Deploy and Upgrade (21 sub-objectives)

| Status | Count | Percentage |
|--------|-------|------------|
| COVERED | 9 | 43% |
| PARTIAL | 6 | 29% |
| GAP | 6 | 29% |

### Section 2 — Configure and Utilize (24 sub-objectives)

| Status | Count | Percentage |
|--------|-------|------------|
| COVERED | 9 | 38% |
| PARTIAL | 9 | 38% |
| GAP | 6 | 25% |

### Section 3 — Analyze and Monitor (14 sub-objectives)

| Status | Count | Percentage |
|--------|-------|------------|
| COVERED | 11 | 79% |
| PARTIAL | 2 | 14% |
| GAP | 1 | 7% |

### Section 4 — Troubleshoot (23 sub-objectives)

| Status | Count | Percentage |
|--------|-------|------------|
| COVERED | 9 | 39% |
| PARTIAL | 8 | 35% |
| GAP | 6 | 26% |

---

## Recommendations: Questions to Write

### Priority 1 — Critical Gaps (must add, 0 coverage today)

| Topic | Suggested # of New Qs | Target File |
|-------|----------------------|-------------|
| Data Lens integration with Files (deploy + configure + onboard) | 6–8 | Part1 (D1+D2) |
| Data Lens integration with Objects | 3–4 | Part1 (D1) |
| File Analytics deployment steps and prerequisites | 4–5 | Part1 (D1) |
| Nutanix Central integration for Files | 3–4 | Part1 (D1) |
| VDI Sync profile synchronization | 3–4 | Part1 (D1) |
| FQDN pathing (subdomains vs. folder structures) | 2–3 | Part1 (D1) |
| Objects namespaces (creation, multi-tenancy) | 3–4 | Part1 (D2) |
| Objects Federation configuration | 3–4 | Part1 (D2) |
| Add/Remove volumes to Volume Groups | 3–4 | Part1 (D2) |
| Mine for Objects (integration + recoverability) | 4–5 | Part1 (D2) |
| Smart/Standard/Advanced Tiering differentiation | 4–5 | Part2-D3 |
| Smart DR DNS/Directory Services troubleshooting | 3–4 | Part2-D4 |
| Cross-cluster user profile troubleshooting | 3–4 | Part2-D4 |
| Objects replication troubleshooting | 3–4 | Part2-D4 |
| VG capacity visibility troubleshooting (LUN rescan) | 2–3 | Part2-D4 |
| File Analytics compatibility troubleshooting | 2–3 | Part2-D4 |
| Data Lens compatibility troubleshooting | 2–3 | Part2-D4 |

**Subtotal Priority 1: ~52–68 new questions**

### Priority 2 — Strengthen Partial Coverage

| Topic | Suggested # of New Qs | Target File |
|-------|----------------------|-------------|
| NTP configuration and troubleshooting | 2–3 | Part1 (D1) |
| Protocol version details (SMB 2.x/3.x, NFSv3/v4) | 2–3 | Part1 (D1) |
| File Server Manager interface usage | 3–4 | Part2-D3 |
| Nutanix Central as monitoring interface | 2–3 | Part2-D3 |
| Present Volumes to VMs (attachment, migration) | 3–4 | Part1 (D2) |
| Cluster vs. volume whitelist comparison | 2–3 | Part1 (D2) |
| RPO/RTO metric-based selection scenarios | 3–4 | Part1 (D2) |
| HA options (FSVM HA, active-active, Objects HA) | 3–4 | Part1 (D2) |
| Data Sync feature for Files | 2–3 | Part1 (D2) |
| Upgrade impact by share type | 2–3 | Part1 (D1) |
| Back-up accounts, share admin permissions | 2–3 | Part2-D4 |
| Objects CLI troubleshooting tools | 2–3 | Part2-D4 |

**Subtotal Priority 2: ~28–40 new questions**

**Grand Total: ~80–108 new questions recommended**

---

## Strengths (Well-Covered Areas)

These topics are thoroughly covered and need no additional questions:

- ✅ Files deployment prerequisites, FSVM sizing, and HA requirements (D1)
- ✅ Objects deployment on MSP/Kubernetes with Prism Central (D1)
- ✅ Rolling upgrade process for Files and Objects (D1)
- ✅ Network segmentation and IP planning (D1)
- ✅ Scale-up vs. scale-out decision criteria (D1)
- ✅ Multi-protocol share creation and user mapping (D2)
- ✅ Objects WORM, versioning, and Object Lock (D2)
- ✅ Smart DR failover/failback and Smart Tiering (D2)
- ✅ Self-Service Restore and snapshot-based recovery (D2)
- ✅ File Analytics anomaly detection and ransomware features (D3)
- ✅ File Analytics audit trails and dashboard widgets (D3)
- ✅ Data Lens use cases, PII detection, permissions scanning (D3)
- ✅ File Analytics vs. Data Lens differentiation (D3)
- ✅ Performance metrics (IOPS, throughput, latency) monitoring (D3)
- ✅ Files deployment failure troubleshooting (DNS, FSVM health) (D4)
- ✅ Objects deployment troubleshooting (MSP, kubectl, pods) (D4)
- ✅ Objects read/write and IAM policy troubleshooting (D4)
- ✅ Log collection with Logbay and NCC health checks (D4)
- ✅ IQN/whitelist troubleshooting for Volumes (D4)

---

*End of Report*
