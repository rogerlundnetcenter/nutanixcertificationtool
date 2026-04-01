# NCM-MCI 6.10 Blueprint Coverage Analysis

**Exam:** Nutanix Certified Master – Multicloud Infrastructure (NCM-MCI) 6.10
**Blueprint Version:** 6.10 (17 scenarios, 180 minutes, live lab)
**Question Bank:** NCM-MCI-Part1.md through NCM-MCI-Part4.md (320 total questions)
**Analysis Date:** 2026-04-01
**Analyst:** Automated Blueprint Gap Analysis

---

## Executive Summary

| Metric | Count | Percentage |
|--------|-------|------------|
| **Total Blueprint Objectives** | 73 | 100% |
| **COVERED** (fully addressed) | 28 | 38.4% |
| **PARTIAL** (some coverage, needs strengthening) | 14 | 19.2% |
| **GAP** (no coverage, needs new questions) | 31 | 42.5% |

### ⚠️ Critical Finding
Only **38.4%** of blueprint objectives are fully covered. The question bank is heavily weighted toward storage internals (DSF, OpLog, Curator) and API mechanics, but has **significant gaps** in live-lab procedural tasks — particularly in:
- **Prism Central reporting/analysis creation** (Obj 1.4)
- **Cluster resiliency & Rebuild Capacity Reservation** (Obj 2.4)
- **SYSLOG troubleshooting** (Obj 3.3)
- **Data-in-Transit Encryption & VM-specific encryption** (Obj 3.5)
- **RF1 containers & Load-Balanced Volume Groups** (Obj 4.1)
- **NVD validation** (Obj 4.2)
- **Recovery plan network/IP mapping & Metro AHV troubleshooting** (Obj 5.2/5.3)

---

## Detailed Coverage by Section

---

## Section 1 — Monitoring & Troubleshooting

### Objective 1.1 — Use Prism Analysis Tools to Identify Performance Issues

| # | Knowledge Item | Status | Evidence / Gap Detail |
|---|----------------|--------|----------------------|
| 1.1.1 | Utilize performance graphs to look for anomalies | ✅ COVERED | Part1 Q5 (VM I/O storm isolation), Part3 Q4 (vDisk latency), Q20 (per-core CPU), Q47 (peak/off-peak latency) |
| 1.1.2 | Correlate events with issues observed with metric or entity charts | 🟡 PARTIAL | Questions cover metric reading but none explicitly test correlating Prism *events* with *metric charts* in a timeline view |
| 1.1.3 | Given a scenario, create analysis graphs to diagnose a problem | 🔴 GAP | No question asks the candidate to **create** an analysis chart/graph in Prism Central's Analysis page. Live lab likely requires adding entities/metrics to a custom chart. |
| 1.1.4 | Utilize Prism Central to identify resource constraints | ✅ COVERED | Part3 Q7 (capacity planning, CPU ceiling), Q59 (right-sizing from 30-day data) |
| 1.1.5 | Given a scenario, review the MSSQL Instance Details to identify and resolve an issue | 🔴 GAP | **Zero questions** address the Prism Central MSSQL monitoring dashboard or SQL Instance Details page. This is a new 6.10 objective. |

**Needed questions for gaps:**
- Scenario: "Use Prism Central > Analysis to create a chart showing VM latency vs. host CPU. Which entities and metrics do you add?"
- Scenario: "A SQL Server VM reports high query latency. Using Prism Central > MSSQL Instance Details, which metric indicates the bottleneck?"

---

### Objective 1.2 — Perform Health Check and Collect Logs

| # | Knowledge Item | Status | Evidence / Gap Detail |
|---|----------------|--------|----------------------|
| 1.2.1 | Utilize Prism to collect system logs capturing an event | 🟡 PARTIAL | Part4 Q40 covers `logbay collect` CLI but no question tests log collection **through the Prism UI** with time-range/event filters |
| 1.2.2 | Proceed with the log gathering using CLI | ✅ COVERED | Part2 Q71 (`logbay collect`), Part4 Q40 (`logbay collect`), Part2 Q69 (`allssh`), Part4 Q31-Q39 (log paths) |
| 1.2.3 | Review audit logs and troubleshoot cluster configuration issues | 🔴 GAP | No question about Prism audit trail / audit log review for configuration change tracking |
| 1.2.4 | Given a problem description, utilize the NCC CLI to run the appropriate check(s) | ✅ COVERED | Part1 Q6, Q17, Q39; Part2 Q20, Q59; Part4 Q56, Q73, Q76 |
| 1.2.5 | Use CLI commands to extract cluster configuration information | ✅ COVERED | Part2 Q17 (`zeus_config_printer`), Q30 (`cluster status`), Q36 (`ncli host ls`), Q63 (DNS config) |

**Needed questions for gaps:**
- Scenario: "A configuration change broke cluster connectivity. Using Prism > Audit, identify which setting was modified and by whom."
- Scenario: "Collect logs from Prism Element covering the last 2 hours for a Stargate crash event. What steps do you follow in the Prism UI?"

---

### Objective 1.3 — Interpret Alerts and Take Appropriate Actions for Remediation

| # | Knowledge Item | Status | Evidence / Gap Detail |
|---|----------------|--------|----------------------|
| 1.3.1 | Identify components impacted and conduct root cause analysis | ✅ COVERED | Part2 Q24, Q45 (alert filtering); Part1 Q17, Q29 (NCC FAIL → root cause); Part4 Q21-Q30 (service troubleshooting) |
| 1.3.2 | Given an issue, use the KB article to provide a resolution | 🔴 GAP | No question requires the candidate to locate and apply a Nutanix KB article. The live lab provides KB PDFs (e.g., NCC Health Check_backup_schedule_check.pdf). |

**Needed questions for gaps:**
- Scenario: "NCC reports `backup_schedule_check` FAIL. Using the provided KB article, identify the root cause and apply the documented fix."

---

### Objective 1.4 — Create Reports and Custom Metrics to Monitor the Environment

| # | Knowledge Item | Status | Evidence / Gap Detail |
|---|----------------|--------|----------------------|
| 1.4.1 | Given a scenario, select the correct entity and metrics to add to a graph | 🟡 PARTIAL | Some questions identify which metrics to check, but none test the actual selection of entities/metrics in the Prism report builder UI |
| 1.4.2 | Given a scenario, create a custom alert when a threshold is passed | 🔴 GAP | **Zero questions** about creating custom alert policies with threshold triggers in Prism Central |
| 1.4.3 | Given a scenario, create reports to monitor workload inefficiencies (e.g., Latency) | 🔴 GAP | **Zero questions** about creating Prism Central reports (report configuration, scheduling, email delivery) |
| 1.4.4 | Evaluate cluster performance using reports | 🔴 GAP | No question asks the candidate to interpret a generated Prism report for capacity/performance evaluation |

**Needed questions for gaps:**
- Scenario: "Create a custom alert in Prism Central that triggers when any VM exceeds 20ms storage latency for 5 consecutive minutes."
- Scenario: "Create a Prism Central report showing top 10 VMs by latency, scheduled weekly."
- Scenario: "Review the generated capacity report. Which cluster needs immediate attention?"

---

## Section 2 — Optimize & Scale

### Objective 2.1 — Utilize Runway Scenario to Evaluate Workload Changes

| # | Knowledge Item | Status | Evidence / Gap Detail |
|---|----------------|--------|----------------------|
| 2.1.1 | Review and analyze current and potential resource needs through the planning dashboard | 🟡 PARTIAL | Part3 Q7 (capacity analysis) touches this but doesn't specifically test the Planning Dashboard/Runway feature |
| 2.1.2 | Given a scenario, provide a cluster rightsizing for a greenfield deployment | 🔴 GAP | No question about using Runway/Sizer for a new deployment scenario |
| 2.1.3 | Given a scenario, plan for a future cluster expansion | 🔴 GAP | No question about creating a Runway scenario to model adding nodes or workloads |

**Needed questions for gaps:**
- Scenario: "Using the Planning Dashboard, a cluster shows 60-day CPU runway. Create a scenario adding 50 VDI desktops and determine if expansion is needed."
- Scenario: "A greenfield deployment requires hosting 200 VMs. Using the planning tools, determine the minimum node count."

---

### Objective 2.2 — Implement Workload-Based Best Practices

| # | Knowledge Item | Status | Evidence / Gap Detail |
|---|----------------|--------|----------------------|
| 2.2.1 | Locate, read, and understand workload-specific BPG and Technotes | 🔴 GAP | No question tests navigating or interpreting a provided BPG/Technote document. Live lab provides BP-2015-Microsoft-SQL-Server.pdf and TN-2164-Windows-11-on-AHV.pdf on the desktop. |
| 2.2.2 | Identify the preferred values for a workload based upon a supplied BPG | 🟡 PARTIAL | Part1 Q3, Q34 reference SQL workloads but don't present a BPG document extract for the candidate to reference |
| 2.2.3 | Configure appropriate settings for a given EUC workload (e.g., vGPU, container, etc.) | 🔴 GAP | **Zero questions** about vGPU profile configuration, EUC-specific container settings, or Citrix/Horizon optimizations |
| 2.2.4 | Identify VM settings for optimal performance according to SQL Server BPG | 🟡 PARTIAL | Some questions reference SQL but none present the actual BPG-recommended values (e.g., vCPU per SQL instance, memory reservation, disk layout) |
| 2.2.5 | Identify optimal settings for VM and Storage Container for a given scenario | ✅ COVERED | Part1 Q8, Q16, Q34; Part3 Q22, Q46 |

**Needed questions for gaps:**
- Scenario: "Using the provided SQL Server BPG document, configure the VM with the recommended vCPU, memory, and disk layout for a 4-socket database server."
- Scenario: "Configure a VM for Windows 11 VDI with vGPU profile T4-2Q based on the provided Technote."

---

### Objective 2.3 — Utilize APIs to Automate Management Tasks

| # | Knowledge Item | Status | Evidence / Gap Detail |
|---|----------------|--------|----------------------|
| 2.3.1 | Manage cluster at scale conducting CRUD operations using APIs | ✅ COVERED | Part2 Q3, Q16, Q25, Q29, Q35, Q37, Q41, Q53; Part4 Q11-Q20 (extensive API coverage) |
| 2.3.2 | Conduct API-based information gathering and export | ✅ COVERED | Part2 Q37, Q48, Q57, Q77 (list, filter, pagination) |

**Status: Fully covered.** API section is the strongest area in the question bank.

---

### Objective 2.4 — Utilize Playbook for Making a Call to a REST API Endpoint / Cluster Resiliency

| # | Knowledge Item | Status | Evidence / Gap Detail |
|---|----------------|--------|----------------------|
| 2.4.1 | Configure cluster policies and features for availability and resiliency | 🟡 PARTIAL | Part3 Q8 (Metro Avail) touches high availability but doesn't cover general cluster resiliency configuration |
| 2.4.2 | Configure cluster resiliency to meet application requirements | 🔴 GAP | No question about setting cluster resiliency levels (e.g., node/block awareness) |
| 2.4.3 | Use "Rebuild Capacity Reservation" to enhance self-healing | 🔴 GAP | **Zero questions** about Rebuild Capacity Reservation feature |
| 2.4.4 | Set Cluster Resiliency Preference for failure event vs. planned outage | 🔴 GAP | **Zero questions** about Cluster Resiliency Preference settings |

**Additionally:** The objective title references **X-Play Playbooks for REST API calls** — no question covers creating a Playbook that calls a REST API endpoint.

**Needed questions for gaps:**
- Scenario: "Configure Rebuild Capacity Reservation to ensure the cluster can rebuild data after a single node failure."
- Scenario: "Set Cluster Resiliency Preference to prioritize VM availability during an unplanned node failure."
- Scenario: "Create an X-Play playbook that triggers a REST API call to an external monitoring system when a VM alert occurs."

---

### Objective 2.5 — Create/Configure VMs Based on Workload Requirements

| # | Knowledge Item | Status | Evidence / Gap Detail |
|---|----------------|--------|----------------------|
| 2.5.1 | Given a scenario, configure advanced VM settings | ✅ COVERED | Part2 Q5, Q7, Q34, Q46, Q68; Part3 Q6, Q31, Q38; Part4 Q1-Q10 |
| 2.5.2 | Adjust VM configuration to meet high-intensity workload requirements | ✅ COVERED | Part3 Q2 (NUMA), Q22 (SCSI vs virtio), Q46 (vNIC optimization), Q51 (NUMA performance) |
| 2.5.3 | Evaluate optimal storage configuration for a business-critical application | ✅ COVERED | Part1 Q3, Q8, Q16, Q34 |
| 2.5.4 | Use X-Play to monitor and optimize VM performance | 🔴 GAP | **Zero questions** about X-Play (playbooks) for automated VM performance monitoring/optimization |

**Needed questions for gaps:**
- Scenario: "Create an X-Play playbook that monitors VM CPU usage and automatically adds vCPUs when utilization exceeds 90% for 15 minutes."

---

## Section 3 — Security

### Objective 3.1 — Perform Advanced Cluster Configuration incl. Security and Hardening

| # | Knowledge Item | Status | Evidence / Gap Detail |
|---|----------------|--------|----------------------|
| 3.1.1 | Configure SCMA and AIDE as determined by security requirements | 🟡 PARTIAL | SCMA is well covered (Part2 Q27, Q66; Part4 Q73, Q76). **AIDE (Advanced Intrusion Detection Environment) has zero coverage.** |
| 3.1.2 | Implement hardening mechanisms from the Nutanix security guide | ✅ COVERED | Part2 Q27 (STIG), Part4 Q71-Q73 (lockdown, SSH keys, SCMA) |
| 3.1.3 | Given a scenario, create an appropriate RBAC structure | ✅ COVERED | Part4 Q79 (custom role + project assignment) |
| 3.1.4 | Configure cluster lockdown mode | ✅ COVERED | Part2 Q6 (Prism UI), Part4 Q71 (CLI), Q72 (SSH key), Q78 (verify status) |
| 3.1.5 | Given a scenario, configure network segmentation for a cluster | 🟡 PARTIAL | Flow VPC/overlay is covered but **no question about CVM/hypervisor backplane network segmentation** (VLAN separation between management, storage, and VM traffic) |

**Needed questions for gaps:**
- Scenario: "Enable AIDE file integrity monitoring on all CVMs and schedule a daily baseline scan."
- Scenario: "Implement network segmentation separating CVM management traffic from VM production traffic using separate VLANs."

---

### Objective 3.2 — Implement Flow Virtual Networking and Flow Network Security

| # | Knowledge Item | Status | Evidence / Gap Detail |
|---|----------------|--------|----------------------|
| 3.2.1 | Implement VPCs and gateways | ✅ COVERED | Part1 Q49, Q50, Q51, Q67, Q75 |
| 3.2.2 | Given a scenario, implement multi-tenancy and overlay networks | ✅ COVERED | Part1 Q49, Q64, Q67 |
| 3.2.3 | Protect a multi-tiered application using Flow Security Policies | ✅ COVERED | Part1 Q52-Q58, Q69, Q79 |
| 3.2.4 | Apply security policies based on user group membership using a VDI Policy | 🔴 GAP | **Zero questions** about VDI-specific security policies that apply rules based on AD user group membership |

**Needed questions for gaps:**
- Scenario: "Create a VDI security policy in Flow that restricts desktop VMs to only access resources matching the user's AD group membership (e.g., Finance users only reach Finance servers)."

---

### Objective 3.3 — Configure SYSLOG for Advanced Log Management

| # | Knowledge Item | Status | Evidence / Gap Detail |
|---|----------------|--------|----------------------|
| 3.3.1 | Given a set of parameters, configure a remote SYSLOG server | ✅ COVERED | Part2 Q15 (Prism > Settings > Syslog Server, IP, port, protocol) |
| 3.3.2 | Given a scenario, export logs for a specific service at a desired severity to a SYSLOG server | 🔴 GAP | No question about configuring **per-module/per-severity** syslog export (e.g., only Stargate WARN+ messages to a specific SIEM) |
| 3.3.3 | Identify why SYSLOG messages are not being sent to a configured server | 🔴 GAP | **Zero troubleshooting questions** for syslog delivery failures (firewall, protocol mismatch, certificate issues) |

**Needed questions for gaps:**
- Scenario: "Configure syslog to export only Stargate WARNING and above messages to 10.0.1.50 over TCP/TLS on port 6514."
- Scenario: "Syslog is configured but the SIEM server receives no messages. What are the three most likely causes and how do you diagnose each?"

---

### Objective 3.4 — Implement Authentication According to Best Practices

| # | Knowledge Item | Status | Evidence / Gap Detail |
|---|----------------|--------|----------------------|
| 3.4.1 | Replace self-signed certificates with customer's CA signed | ✅ COVERED | Part2 Q28, Part4 Q74, Q80 |
| 3.4.2 | Given a scenario, select the proper IAM authentication methods (AD, SAML, Local) and conduct configuration steps | 🔴 GAP | **Zero questions** about configuring Active Directory, SAML IDP, or selecting between authentication methods. This is a high-priority gap for a live-lab exam. |
| 3.4.3 | Given a scenario, create a custom role with required permissions | ✅ COVERED | Part4 Q79 |
| 3.4.4 | Manage accounts and passwords according to provided requirements | 🔴 GAP | No question about password policies, account lockout, default password changes, or user account lifecycle management |

**Needed questions for gaps:**
- Scenario: "Configure Prism Central to authenticate against Active Directory (LDAP). Add the domain, configure the service account, and map an AD group to a Prism role."
- Scenario: "Configure SAML authentication with an external IDP for SSO to Prism Central."
- Scenario: "Change the default admin password on all CVMs and configure a password complexity policy."

---

### Objective 3.5 — Implement Encryption, Including KMS

| # | Knowledge Item | Status | Evidence / Gap Detail |
|---|----------------|--------|----------------------|
| 3.5.1 | Configure Data-at-Rest Encryption | ✅ COVERED | Part2 Q18, Q31, Q44, Q58, Q79; Part4 Q75, Q77 |
| 3.5.2 | Configure Data-in-Transit Encryption | 🔴 GAP | **Zero questions** about enabling data-in-transit encryption (encrypting CVM-to-CVM replication and I/O traffic). The blueprint references this as a distinct objective. |
| 3.5.3 | Encrypt the storage of specific VMs within the environment | 🔴 GAP | **Zero questions** about Storage Policy Based Encryption for selectively encrypting individual VM storage. The blueprint reference doc is "Managing Storage Policies" and "Storage Policy Based Encryption." |

**Needed questions for gaps:**
- Scenario: "Enable data-in-transit encryption between CVMs in the cluster. What prerequisites must be met?"
- Scenario: "Create a storage policy that encrypts only VMs tagged with 'Compliance:PCI' category, leaving other VMs unencrypted."

---

## Section 4 — Design & Architecture

### Objective 4.1 — Configure Nutanix Products and Features to Meet Business Needs

| # | Knowledge Item | Status | Evidence / Gap Detail |
|---|----------------|--------|----------------------|
| 4.1.1 | Identify the need for an RF1 container and apply the correct configuration | 🔴 GAP | **Zero questions** about RF1 (Replication Factor 1) containers — when to use them, how to create, and trade-offs |
| 4.1.2 | Identify the need for Load-Balanced Volume Groups, configure them, and enable the feature | 🔴 GAP | **Zero questions** about Load-Balanced Volume Groups (multi-pathing, iSCSI load balancing across CVMs). The blueprint explicitly references "Enabling Load Balancing of vDisks in a Volume Group." |
| 4.1.3 | Given a workload, ensure appropriate storage efficiency settings are enabled | ✅ COVERED | Part1 Q3, Q8, Q9, Q13, Q16, Q19, Q20, Q35, Q36 |

**Needed questions for gaps:**
- Scenario: "A workload requires a scratch/temp container with no replication overhead. Create an RF1 container and explain when this is appropriate."
- Scenario: "Configure a Load-Balanced Volume Group for an iSCSI-connected Oracle RAC database. Enable vDisk load balancing across CVMs."

---

### Objective 4.2 — Align Cluster Configuration to Nutanix Validated Design (NVD)

| # | Knowledge Item | Status | Evidence / Gap Detail |
|---|----------------|--------|----------------------|
| 4.2.1 | Validate the CVM and Hypervisor VLAN configurations | 🔴 GAP | No question about validating CVM/hypervisor VLAN assignments against NVD specifications |
| 4.2.2 | For a given workload type, validate CVM resource configurations | 🟡 PARTIAL | Part3 Q11 (CVM RAM sizing) touches this, but no question references NVD-recommended CVM specs for specific workload types |
| 4.2.3 | For a given workload type, validate CPU oversubscription ratio | ✅ COVERED | Part3 Q7 (CPU oversubscription ceiling), Q34 (CPU ready time threshold) |
| 4.2.4 | For a given scenario, validate cluster high availability configuration | 🔴 GAP | **Zero questions** about validating HA configuration (HA reservation, admission control, segment awareness) against NVD requirements |

**Needed questions for gaps:**
- Scenario: "Given the NVD-2031 document, validate that Cluster-A's CVM VLAN and hypervisor VLAN configurations match the design. Identify any deviations."
- Scenario: "Using the NVD, verify that CVM resources (vCPU, RAM) are correctly sized for the SQL Server workload. What changes are needed?"
- Scenario: "Validate that the cluster HA configuration provides N+1 redundancy per the NVD. What setting needs adjustment?"

---

## Section 5 — Business Continuity

### Objective 5.1 — Create Protection Policies Based on RPO and RTO Requirements

| # | Knowledge Item | Status | Evidence / Gap Detail |
|---|----------------|--------|----------------------|
| 5.1.1 | Configure appropriate protection mechanism for multi-tiered application with RPO/RTO | ✅ COVERED | Part3 Q8 (Metro/Sync), Q13 (RPO calculation), Q41 (frequency vs RPO); Part4 Q61-Q63, Q70 (NearSync) |
| 5.1.2 | Troubleshoot a given Protection Policy/Protection Domain | 🟡 PARTIAL | Part3 Q28 (replication capacity), Q48 (replication not happening), Q52 (seeding stuck); lacks troubleshooting of protection *policies* (PC-managed) vs protection *domains* (PE-managed) |
| 5.1.3 | Troubleshoot protection policy with automatic assignment of target clusters | 🔴 GAP | **Zero questions** about automatic target cluster assignment in protection policies and troubleshooting when auto-assignment fails |

**Needed questions for gaps:**
- Scenario: "A protection policy is configured with automatic target cluster assignment, but new VMs are not being assigned to the correct target. Diagnose and fix the issue."

---

### Objective 5.2 — Create Recovery Plans Based Upon Application Requirements

| # | Knowledge Item | Status | Evidence / Gap Detail |
|---|----------------|--------|----------------------|
| 5.2.1 | Given a scenario, create a recovery plan for a 3-tiered application | ✅ COVERED | Part3 Q9, Q24, Q39, Q72, Q80 |
| 5.2.2 | Create a recovery plan which uses a custom script for application reconfiguration | ✅ COVERED | Part3 Q29 (pre-failover script), Q43 (post-boot script) |
| 5.2.3 | Create recovery plans and add/remove stages based on application requirements | ✅ COVERED | Part3 Q56 (parallel boot groups), Q80 (boot group priority sequence) |
| 5.2.4 | Create/modify recovery plans incl. network and IP mapping based on specific requirements | 🔴 GAP | **Zero questions** about configuring **network mapping** (source VLAN → target VLAN) and **IP address mapping** (production IP → DR IP) in recovery plans. This is a critical live-lab skill. |
| 5.2.5 | Create/Update a RP Configuration from Async/NearSync to a Sync configuration | 🔴 GAP | **Zero questions** about migrating a recovery plan from async to NearSync or synchronous replication |
| 5.2.6 | Troubleshoot and resolve recovery plan issues | 🟡 PARTIAL | Some troubleshooting context exists (Part3 Q43, Q48) but no dedicated RP troubleshooting scenario |

**Needed questions for gaps:**
- Scenario: "Configure the recovery plan network mapping: Production VLAN 100 (10.1.1.0/24) maps to DR VLAN 200 (10.2.1.0/24). Assign static IP mappings for the database VM."
- Scenario: "Convert a protection configuration from Async (1-hour RPO) to Synchronous (zero RPO) for a critical application. What are the prerequisites and steps?"

---

### Objective 5.3 — Execute Disaster Recovery, Including Troubleshooting

| # | Knowledge Item | Status | Evidence / Gap Detail |
|---|----------------|--------|----------------------|
| 5.3.1 | When performing an RP test and encountering errors, fix errors to achieve test | 🟡 PARTIAL | Part3 Q19, Part4 Q67 cover test failover process but don't present error-fixing scenarios |
| 5.3.2 | When performing an RP failover and encountering errors on a VM IP configuration, fix issues and validate RP | 🔴 GAP | **Zero questions** about fixing VM IP configuration issues during failover (wrong IP assigned, network mapping error, gateway unreachable) |
| 5.3.3 | Given a scenario where a RP fails, troubleshoot and resolve the issue | 🟡 PARTIAL | General troubleshooting is covered but no specific "RP failed — here's the error — fix it" scenario |
| 5.3.4 | Given a scenario, identify and resolve Metro AHV configuration issues | 🔴 GAP | **Zero questions** about Metro Availability troubleshooting (witness VM, metro stretch issues, split-brain scenarios, latency problems) |

**Needed questions for gaps:**
- Scenario: "During a test failover, VMs boot but receive the wrong IP addresses. The recovery plan network mapping shows the correct configuration. Diagnose and fix the issue."
- Scenario: "Metro Availability between two clusters reports 'Metro Disabled' after a network event. The witness VM is unreachable. Identify the root cause and restore Metro."
- Scenario: "A recovery plan failover fails with error 'VM network not found on target cluster.' What steps resolve this?"

---

## Gap Priority Matrix

### 🔴 Critical Gaps (High exam weight, zero coverage)

| Priority | Objective | Gap Description | Est. Questions Needed |
|----------|-----------|-----------------|----------------------|
| P1 | 1.1.5 | MSSQL Instance Details in Prism Central | 2-3 |
| P1 | 1.4.2-4 | Custom alerts, reports, report evaluation | 4-5 |
| P1 | 2.4.2-4 | Rebuild Capacity Reservation, Cluster Resiliency Preference | 3-4 |
| P1 | 3.4.2 | AD/SAML/Local IAM authentication configuration | 3-4 |
| P1 | 3.5.2-3 | Data-in-Transit Encryption, VM-specific storage policy encryption | 3-4 |
| P1 | 4.1.1-2 | RF1 containers, Load-Balanced Volume Groups | 3-4 |
| P1 | 5.2.4 | Recovery plan network/IP mapping | 2-3 |
| P1 | 5.3.4 | Metro AHV troubleshooting | 2-3 |

### 🟡 Important Gaps (Moderate weight, partial or no coverage)

| Priority | Objective | Gap Description | Est. Questions Needed |
|----------|-----------|-----------------|----------------------|
| P2 | 1.1.3 | Creating analysis graphs in Prism Central | 2 |
| P2 | 1.2.3 | Audit log review | 1-2 |
| P2 | 1.3.2 | KB article-based resolution | 2 |
| P2 | 2.1.2-3 | Runway scenarios for greenfield/expansion | 2-3 |
| P2 | 2.2.1,3 | BPG document usage, vGPU/EUC configuration | 3-4 |
| P2 | 2.5.4 | X-Play for VM performance | 2 |
| P2 | 3.1.1 | AIDE configuration | 1-2 |
| P2 | 3.2.4 | VDI security policy by user group | 2 |
| P2 | 3.3.2-3 | Per-service syslog export, syslog troubleshooting | 2-3 |
| P2 | 3.4.4 | Account/password management | 1-2 |
| P2 | 4.2.1,4 | NVD VLAN validation, HA validation | 2-3 |
| P2 | 5.1.3 | Auto-assignment of target clusters | 1-2 |
| P2 | 5.2.5 | Async → Sync migration | 1-2 |
| P2 | 5.3.2 | VM IP config errors during failover | 2 |

---

## Summary Statistics

### Coverage by Section

| Section | Objectives | Covered | Partial | Gap | Coverage % |
|---------|-----------|---------|---------|-----|------------|
| 1 – Monitoring & Troubleshooting | 16 | 5 | 3 | 8 | 31.3% |
| 2 – Optimize & Scale | 18 | 7 | 4 | 7 | 38.9% |
| 3 – Security | 19 | 9 | 3 | 7 | 47.4% |
| 4 – Design & Architecture | 7 | 2 | 1 | 4 | 28.6% |
| 5 – Business Continuity | 13 | 5 | 3 | 5 | 38.5% |
| **TOTAL** | **73** | **28** | **14** | **31** | **38.4%** |

### Estimated New Questions Needed

| Gap Category | Estimated Questions |
|-------------|-------------------|
| P1 Critical Gaps | 22-30 |
| P2 Important Gaps | 22-30 |
| **Total new questions needed** | **44-60** |

---

## Recommendations

1. **Immediate Priority:** Write scenario-based questions for all P1 gaps. These represent likely live-lab tasks with zero coverage.

2. **Live-Lab Emphasis:** The current question bank is MCQ-heavy. The actual exam is 17 live-lab scenarios. Questions should be rewritten as procedural/scenario tasks:
   - "Open Prism Central and create..." instead of "Which option is correct..."
   - "SSH to the CVM and run..." with expected output validation
   - "Using the provided BPG document, configure..." referencing actual PDF content

3. **Section 4 (Design & Architecture) is the weakest** at 28.6% coverage. RF1 containers, Load-Balanced Volume Groups, and NVD validation are completely missing.

4. **X-Play/Playbooks** appear in two objectives (2.4 and 2.5) but have zero questions. This is a distinctive 6.10 feature that differentiates NCM from NCP.

5. **Metro Availability** troubleshooting (Obj 5.3.4) is a critical gap — Metro scenarios are common in the live lab and involve witness VM management, split-brain resolution, and latency diagnostics.

6. **BPG/Technote Reference Questions:** The live lab provides specific PDFs on the desktop. Questions should simulate referencing these documents to extract configuration values.

---

*End of Blueprint Coverage Analysis*
