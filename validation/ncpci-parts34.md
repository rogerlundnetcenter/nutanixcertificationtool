# NCP-CI 6.10 — Parts 3 & 4 Validation Report

**Validation Date:** 2025-07-17
**Files Validated:**
- `NCP-CI-Part3.md` — 80 Advanced MCQ questions (all domains)
- `NCP-CI-Part4.md` — 80 Mixed-format questions (60 MCQ + 10 Select TWO + 10 Ordering)

---

## 1. Executive Summary

| Metric | Part 3 | Part 4 | Total |
|--------|--------|--------|-------|
| Total Questions | 80 | 80 | **160** |
| ✅ Correct (no issues) | 79 | 70 | **149** |
| ⚠️ Minor Issues (answer correct, explanation imprecise) | 1 | 5 | **6** |
| ❌ Factual Errors (incorrect data in options/explanation) | 0 | 2 | **2** |
| 🔶 Structural Issues | 1 | 1 | **2** |
| **Flagged Questions** | **1** | **7** | **8** |

**Overall Assessment:** Both files are technically strong. Part 3 is near-flawless in content accuracy. Part 4 has two factual errors in option text (IP count math) and several minor explanation imprecisions. Both files suffer from answer-distribution bias favoring option B.

---

## 2. Flagged Questions — Detailed Analysis

### Part 3 Flagged Questions

#### ⚠️ P3-Q18 — Flow Gateway Failure Impact (Minor)
- **Current Answer:** C — "All VM networking traffic is disrupted since Flow Gateway bridges overlay to underlay"
- **Issue:** Slightly overstated. Same-host east-west traffic between VMs on the same AHV host communicates via the local OVS bridge and does **not** traverse Flow Gateway. Only north-south and cross-host east-west traffic is disrupted.
- **Why C is still best answer:** Option B ("Only north-south traffic is affected") is also wrong because it omits cross-host east-west impact. C is the closest correct answer.
- **Recommendation:** Update explanation to: *"VMs lose connectivity to the Azure VNet, disrupting north-south and cross-host east-west traffic. Same-host VM-to-VM traffic on the same OVS bridge is unaffected."*
- **KB Ref:** [NC2 Azure Flow Networking](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Flow-Networking-Guide:flow-networking-overview-c.html)

---

### Part 4 Flagged Questions

#### ❌ P4-Q40 — /25 Subnet IP Count (Factual Error in Option Text)
- **Current Option C:** `/25 (30 usable IPs)` ← **WRONG**
- **Correct Math:** `/25` = 128 addresses − 5 AWS reserved = **123 usable IPs** (or 126 without AWS reservation)
- **Note:** The answer letter (C = /25) is **correct** per Nutanix documentation. The parenthetical IP count is wrong — "30 usable IPs" corresponds to a `/27` subnet, not `/25`.
- **Also:** Option B says `/27 (30 usable IPs)` which IS correct for /27 — creating confusion since two options show "30 usable IPs."
- **Recommendation:** Fix option C to read: `/25 (123 usable IPs on AWS)`
- **KB Ref:** [NC2 AWS Networking Prerequisites](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html)

#### ❌ P4-Q50 — /25 Subnet IP Count (Same Factual Error)
- **Current Option C:** `/25 (30 IPs)` ← **WRONG** (same error as Q40)
- **Correct:** `/25` = 123 usable IPs on AWS
- **Recommendation:** Fix to `/25 (123 usable IPs)`
- **KB Ref:** Same as Q40

#### ⚠️ P4-Q5 — Flow Gateway Purpose Description (Imprecise)
- **Current Answer:** B — "To bridge network connectivity between Azure VNets and on-premises networks"
- **Issue:** Imprecise. Flow Gateway's primary purpose is to bridge the **AHV overlay network to the Azure VNet underlay** — not "between VNets and on-premises." Part 3 Q11 states this correctly.
- **Recommendation:** Reword to: *"To bridge AHV overlay network connectivity to the Azure VNet underlay"*
- **KB Ref:** [NC2 Azure Flow Gateway](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-Azure:nc2-azure-getting-started-c.html)

#### ⚠️ P4-Q14 — Node Hibernation Platform Scope (Imprecise)
- **Current Explanation:** "reducing **AWS/Azure** compute costs"
- **Issue:** Per Nutanix documentation, **node-level hibernation** is an Azure-specific feature. On AWS, cluster-level shutdown is supported but individual node hibernation is not the same — stopping an i3.metal instance results in local NVMe data loss (instance store is ephemeral).
- **Recommendation:** Clarify explanation: *"Node hibernation is primarily an Azure feature. On AWS, cluster-level hibernation with metadata backup to S3 achieves similar cost savings."*
- **KB Ref:** [NC2 Azure Node Hibernation](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-Azure:nc2-azure-getting-started-c.html)

#### ⚠️ P4-Q22 — Move vs Leap Terminology Conflation (Minor)
- **Current Answer:** B — "Perform test failover in an isolated network"
- **Issue:** "Test failover" is Leap DR terminology. For Nutanix **Move** migrations, the correct term is "test migration" or "validation in isolated network." The answer is functionally correct but uses Leap terminology in a Move context.
- **Recommendation:** Reword to: *"Perform test migration/cutover in an isolated network"*
- **KB Ref:** [Nutanix Move Guide](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Move-v4_8:top-nutanix-move-overview-c.html)

#### ⚠️ P4-Q60 — RPO vs RTO Conflation (Conceptual)
- **Current Explanation:** "RPO must be <15 minutes to support 15-minute RTO"
- **Issue:** RPO (data loss tolerance) and RTO (recovery time) are **independent metrics**. A low RPO does not guarantee a low RTO. You could have 1-minute RPO but 2-hour RTO if failover is slow. The correct statement is: *"Continuous replication via Leap enables fast failover with both low RPO and low RTO."*
- **Answer C is still the best choice** — continuous replication is indeed required for <15 min RTO.
- **Recommendation:** Rewrite explanation: *"Achieving <15 min RTO requires continuous replication (Leap) so recovery points are recent and failover can execute rapidly. RPO and RTO are independent but both require frequent replication."*
- **KB Ref:** [Leap DR Guide](https://portal.nutanix.com/page/documents/details?targetId=Leap-DR-Guide:leap-leap-overview.html)

#### ⚠️ P4-Q27 — NKP Support on NC2 (Unverified)
- **Current Answer:** C — "Both NKE and NKP"
- **Issue:** NKE (Nutanix Kubernetes Engine, formerly Karbon) is documented for NC2. **NKP** (Nutanix Kubernetes Platform) is a newer product — its NC2 support should be verified against current release notes.
- **Risk Level:** Low — NKP is designed to work on any Nutanix cluster, but explicit NC2 certification should be confirmed.
- **Recommendation:** Verify NKP NC2 compatibility in [NKP Release Notes](https://portal.nutanix.com/page/documents/list?type=software&filterByKeyword=NKP)

---

## 3. Answer Distribution Analysis (Structural Quality)

### 🔶 Part 3 — Severe B-Bias

| Answer | Count | Percentage |
|--------|-------|-----------|
| A | 2 | 2.5% |
| **B** | **64** | **80.0%** |
| C | 14 | 17.5% |
| D | 0 | 0.0% |

**Issue:** 80% of answers are B — this is unrealistic for a certification exam and allows test-takers to guess B for high accuracy. Real Nutanix exams distribute answers roughly equally.

### 🔶 Part 4 — Moderate B-Bias

**MCQ (Q1–Q60):**

| Answer | Count | Percentage |
|--------|-------|-----------|
| A | 4 | 6.7% |
| **B** | **37** | **61.7%** |
| C | 17 | 28.3% |
| D | 2 | 3.3% |

**Select TWO (Q61–Q70):** B appears in 9 of 10 answer pairs.

**Ordering (Q71–Q80):** A appears in 7 of 10 answers.

**Recommendation:** Redistribute answers to achieve ~25% per option across all question types. Swap correct/incorrect option positions without changing content.

---

## 4. Technical Accuracy Summary by Domain

### Part 3 Domains

| Domain | Questions | Correct | Issues | Notes |
|--------|-----------|---------|--------|-------|
| D1: AWS vs Azure | Q1–Q10 | 10/10 | 0 | Excellent coverage of platform differences |
| D2: Networking | Q11–Q20 | 9/10 | 1 (Q18 minor) | Flow Gateway failure nuance |
| D3: Storage | Q21–Q30 | 10/10 | 0 | DSF, RF, EC, CVM all accurate |
| D4: Licensing & Cost | Q31–Q40 | 10/10 | 0 | Subscription, hibernation, TCO correct |
| D5: DR & Migration | Q41–Q50 | 10/10 | 0 | Leap, Move, protection domains accurate |
| D6: Troubleshooting | Q51–Q60 | 10/10 | 0 | IAM, capacity, quorum, Curator correct |
| D7: Prism Central | Q61–Q70 | 10/10 | 0 | Categories, Calm, alerts, analysis correct |
| D8: Security | Q71–Q80 | 10/10 | 0 | Flow, encryption, SAML, KMIP correct |

### Part 4 Domains

| Section | Questions | Correct | Issues | Notes |
|---------|-----------|---------|--------|-------|
| MCQ: Infrastructure | Q1–Q20 | 17/20 | 3 (Q5,Q14,Q22) | Minor explanations |
| MCQ: Operations | Q21–Q40 | 18/20 | 2 (Q27,Q40) | NKP verify; IP math error |
| MCQ: Advanced | Q41–Q60 | 19/20 | 1 (Q50,Q60) | IP math; RPO/RTO conflation |
| Select TWO | Q61–Q70 | 10/10 | 0 | All answer pairs accurate |
| Ordering | Q71–Q80 | 10/10 | 0 | Sequences logically sound |

---

## 5. KB Mapping Table

### Part 3 — Question-to-KB Mapping

| Q# | Topic | Domain | KB Reference URL |
|----|-------|--------|------------------|
| 1 | AWS i3.metal instance type | AWS Infra | [NC2 AWS Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html) |
| 2 | Azure BareMetal Infrastructure | Azure Infra | [NC2 Azure Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-Azure:nc2-azure-getting-started-c.html) |
| 3 | AWS VPC delegated subnets | AWS Networking | [NC2 AWS Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html) |
| 4 | Azure VNet delegated subnets | Azure Networking | [NC2 Azure Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-Azure:nc2-azure-getting-started-c.html) |
| 5 | AWS Direct Connect | AWS Connectivity | [AWS Direct Connect Docs](https://docs.aws.amazon.com/directconnect/) |
| 6 | Azure ExpressRoute | Azure Connectivity | [Azure ExpressRoute Docs](https://learn.microsoft.com/en-us/azure/expressroute/) |
| 7 | Flow Gateway Azure vs AWS | Platform Differences | [NC2 Azure Flow Networking](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Flow-Networking-Guide:flow-networking-overview-c.html) |
| 8 | AHV on bare-metal | Hypervisor | [NC2 AWS](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html) / [NC2 Azure](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-Azure:nc2-azure-getting-started-c.html) |
| 9 | AWS ELB integration | AWS Networking | [AWS ELB Docs](https://docs.aws.amazon.com/elasticloadbalancing/) |
| 10 | Prism Central deployment | Management | [Prism Central Guide](https://portal.nutanix.com/page/documents/details?targetId=Prism-Central-Next-Release:pcenter-what-is-prism-central-c.html) |
| 11 | Flow Gateway overlay bridging | Azure Networking | [Flow Networking Guide](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Flow-Networking-Guide:flow-networking-overview-c.html) |
| 12 | AWS Transit Gateway | AWS Networking | [AWS TGW Docs](https://docs.aws.amazon.com/vpc/latest/tgw/) |
| 13 | VPC Peering non-transitive | AWS Networking | [AWS VPC Peering](https://docs.aws.amazon.com/vpc/latest/peering/) |
| 14 | ECMP routing | Networking | [Flow Networking Guide](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Flow-Networking-Guide:flow-networking-overview-c.html) |
| 15 | AWS NAT Gateway | AWS Networking | [AWS NAT Gateway](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html) |
| 16 | Split-horizon DNS | DNS/Networking | [NC2 AWS Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html) |
| 17 | AWS AHV VPC bridge | AWS Networking | [NC2 AWS Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html) |
| 18 | Flow Gateway failure impact | Azure Networking | [Flow Networking Guide](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Flow-Networking-Guide:flow-networking-overview-c.html) |
| 19 | AWS Site-to-Site VPN | AWS Connectivity | [AWS VPN](https://docs.aws.amazon.com/vpn/latest/s2svpn/) |
| 20 | Azure UDRs and NSGs | Azure Networking | [NC2 Azure Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-Azure:nc2-azure-getting-started-c.html) |
| 21–30 | DSF Storage (NVMe, RF, EC, CVM) | Storage | [NC2 AWS Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html) |
| 31–40 | Licensing, Hibernation, Cost | Licensing | [NC2 Licensing](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html) |
| 41–50 | Leap DR, Nutanix Move | DR/Migration | [Leap DR Guide](https://portal.nutanix.com/page/documents/details?targetId=Leap-DR-Guide:leap-leap-overview.html) |
| 51–60 | Troubleshooting (IAM, capacity, quorum) | Troubleshooting | [NC2 AWS](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html) / [NC2 Azure](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-Azure:nc2-azure-getting-started-c.html) |
| 61–70 | Prism Central multi-cloud | Management | [Prism Central Guide](https://portal.nutanix.com/page/documents/details?targetId=Prism-Central-Next-Release:pcenter-what-is-prism-central-c.html) |
| 71–80 | Flow Security, Encryption, SAML, KMIP | Security | [Flow Networking Guide](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Flow-Networking-Guide:flow-networking-overview-c.html) |

### Part 4 — Question-to-KB Mapping

| Q# | Topic | Format | KB Reference URL |
|----|-------|--------|------------------|
| 1 | /25 minimum subnet (AWS) | MCQ | [NC2 AWS Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html) |
| 2 | S3 metadata backup | MCQ | [NC2 AWS Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html) |
| 3 | AWS Direct Connect purpose | MCQ | [AWS Direct Connect](https://docs.aws.amazon.com/directconnect/) |
| 4 | Security group ports (9440/2049/3260) | MCQ | [NC2 AWS Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html) |
| 5 | Flow Gateway (Azure) | MCQ | [Flow Networking Guide](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Flow-Networking-Guide:flow-networking-overview-c.html) |
| 6 | Azure delegated subnet /24 | MCQ | [NC2 Azure Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-Azure:nc2-azure-getting-started-c.html) |
| 7 | BGP + Azure Route Server | MCQ | [NC2 Azure Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-Azure:nc2-azure-getting-started-c.html) |
| 8 | ECMP max 4 gateways | MCQ | [Flow Networking Guide](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Flow-Networking-Guide:flow-networking-overview-c.html) |
| 9 | my.nutanix.com portal | MCQ | [NC2 AWS Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html) |
| 10 | Minimum 3 nodes | MCQ | [NC2 AWS Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html) |
| 11 | AOS + AHV stack | MCQ | [NC2 AWS Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html) |
| 12 | Foundation NOT needed | MCQ | [NC2 AWS Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html) |
| 13 | Subscription licensing | MCQ | [NC2 Licensing](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html) |
| 14 | Node hibernation | MCQ | [NC2 Azure Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-Azure:nc2-azure-getting-started-c.html) |
| 15 | IAM minimum permissions | MCQ | [NC2 AWS Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html) |
| 16 | Same AZ requirement | MCQ | [NC2 AWS Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html) |
| 17 | Local NVMe storage | MCQ | [NC2 AWS Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html) |
| 18 | Transit Gateway + Direct Connect | MCQ | [AWS Transit Gateway](https://docs.aws.amazon.com/vpc/latest/tgw/) |
| 19 | Split-horizon DNS | MCQ | [NC2 AWS Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html) |
| 20 | BGP VPN failover | MCQ | [AWS VPN](https://docs.aws.amazon.com/vpn/latest/s2svpn/) |
| 21 | Leap replication | MCQ | [Leap DR Guide](https://portal.nutanix.com/page/documents/details?targetId=Leap-DR-Guide:leap-leap-overview.html) |
| 22 | Move test migration | MCQ | [Nutanix Move Guide](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Move-v4_8:top-nutanix-move-overview-c.html) |
| 23 | Reverse replication / failback | MCQ | [Leap DR Guide](https://portal.nutanix.com/page/documents/details?targetId=Leap-DR-Guide:leap-leap-overview.html) |
| 24 | Prism Central unified management | MCQ | [Prism Central Guide](https://portal.nutanix.com/page/documents/details?targetId=Prism-Central-Next-Release:pcenter-what-is-prism-central-c.html) |
| 25 | Categories across environments | MCQ | [Prism Central Guide](https://portal.nutanix.com/page/documents/details?targetId=Prism-Central-Next-Release:pcenter-what-is-prism-central-c.html) |
| 26 | Calm blueprints on NC2 | MCQ | [Calm Admin Guide](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Calm-Admin-Operations-Guide-v3_8_0:nuc-nucalm-overview.html) |
| 27 | NKE/NKP on NC2 | MCQ | [NKE Guide](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Kubernetes-Engine-v2_10:top-overview.html) |
| 28 | Insufficient EC2 capacity | MCQ | [NC2 AWS Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html) |
| 29 | Azure delegated subnet errors | MCQ | [NC2 Azure Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-Azure:nc2-azure-getting-started-c.html) |
| 30 | Node failure recovery | MCQ | [NC2 AWS Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html) |
| 31 | Storage scaling (add nodes) | MCQ | [NC2 AWS Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html) |
| 32 | IAM EC2+S3 permissions | MCQ | [NC2 AWS Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html) |
| 33 | S3 metadata backup | MCQ | [NC2 AWS Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html) |
| 34 | Batch migration | MCQ | [Nutanix Move Guide](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Move-v4_8:top-nutanix-move-overview-c.html) |
| 35 | Direct Connect Private VIF | MCQ | [AWS Direct Connect](https://docs.aws.amazon.com/directconnect/) |
| 36 | Security group port blocking | MCQ | [NC2 AWS Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html) |
| 37 | Node hibernation cost savings | MCQ | [NC2 Azure Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-Azure:nc2-azure-getting-started-c.html) |
| 38 | Reserved Instances savings | MCQ | [AWS Pricing](https://aws.amazon.com/ec2/pricing/reserved-instances/) |
| 39 | Flow microsegmentation | MCQ | [Flow Networking Guide](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Flow-Networking-Guide:flow-networking-overview-c.html) |
| 40 | /25 subnet sizing | MCQ | [NC2 AWS Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html) |
| 41 | Azure NSG ports | MCQ | [NC2 Azure Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-Azure:nc2-azure-getting-started-c.html) |
| 42 | Transit Gateway multi-VPC | MCQ | [AWS Transit Gateway](https://docs.aws.amazon.com/vpc/latest/tgw/) |
| 43 | Prism Central secure access | MCQ | [Prism Central Guide](https://portal.nutanix.com/page/documents/details?targetId=Prism-Central-Next-Release:pcenter-what-is-prism-central-c.html) |
| 44 | 3-node cluster node failure | MCQ | [NC2 AWS Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html) |
| 45 | Leap automated failover | MCQ | [Leap DR Guide](https://portal.nutanix.com/page/documents/details?targetId=Leap-DR-Guide:leap-leap-overview.html) |
| 46 | Prism Central consistent policies | MCQ | [Prism Central Guide](https://portal.nutanix.com/page/documents/details?targetId=Prism-Central-Next-Release:pcenter-what-is-prism-central-c.html) |
| 47 | IPSec over Direct Connect | MCQ | [AWS Direct Connect Encryption](https://docs.aws.amazon.com/directconnect/) |
| 48 | Azure BareMetal capacity errors | MCQ | [NC2 Azure Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-Azure:nc2-azure-getting-started-c.html) |
| 49 | S3 backup validation | MCQ | [NC2 AWS Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html) |
| 50 | Subnet IP calculation | MCQ | [NC2 AWS Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html) |
| 51 | RPO definition | MCQ | [Leap DR Guide](https://portal.nutanix.com/page/documents/details?targetId=Leap-DR-Guide:leap-leap-overview.html) |
| 52 | Direct Connect latency | MCQ | [AWS Direct Connect](https://docs.aws.amazon.com/directconnect/) |
| 53 | DNS + security group troubleshooting | MCQ | [NC2 AWS Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html) |
| 54 | Backup failure diagnostics | MCQ | [NC2 AWS Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html) |
| 55 | Flow Gateway HA (min 2) | MCQ | [Flow Networking Guide](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Flow-Networking-Guide:flow-networking-overview-c.html) |
| 56 | Test failover isolation | MCQ | [Leap DR Guide](https://portal.nutanix.com/page/documents/details?targetId=Leap-DR-Guide:leap-leap-overview.html) |
| 57 | Prism Central replication via Leap | MCQ | [Leap DR Guide](https://portal.nutanix.com/page/documents/details?targetId=Leap-DR-Guide:leap-leap-overview.html) |
| 58 | High CPU = scaling need | MCQ | [NC2 AWS Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html) |
| 59 | DR test network isolation | MCQ | [Leap DR Guide](https://portal.nutanix.com/page/documents/details?targetId=Leap-DR-Guide:leap-leap-overview.html) |
| 60 | Continuous replication for low RTO | MCQ | [Leap DR Guide](https://portal.nutanix.com/page/documents/details?targetId=Leap-DR-Guide:leap-leap-overview.html) |
| 61 | Migration prerequisites | Select TWO | [NC2 AWS Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html) |
| 62 | Hybrid connectivity | Select TWO | [AWS Direct Connect](https://docs.aws.amazon.com/directconnect/) / [AWS TGW](https://docs.aws.amazon.com/vpc/latest/tgw/) |
| 63 | Deployment failure types | Select TWO | [NC2 AWS](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html) / [NC2 Azure](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-Azure:nc2-azure-getting-started-c.html) |
| 64 | Flow on Azure components | Select TWO | [Flow Networking Guide](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Flow-Networking-Guide:flow-networking-overview-c.html) |
| 65 | Leap failover essentials | Select TWO | [Leap DR Guide](https://portal.nutanix.com/page/documents/details?targetId=Leap-DR-Guide:leap-leap-overview.html) |
| 66 | Security controls | Select TWO | [NC2 AWS Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html) |
| 67 | Move pre-cutover validation | Select TWO | [Nutanix Move Guide](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Move-v4_8:top-nutanix-move-overview-c.html) |
| 68 | Cost optimization | Select TWO | [NC2 Azure Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-Azure:nc2-azure-getting-started-c.html) |
| 69 | Prism Central capabilities | Select TWO | [Prism Central Guide](https://portal.nutanix.com/page/documents/details?targetId=Prism-Central-Next-Release:pcenter-what-is-prism-central-c.html) |
| 70 | Node failure recovery | Select TWO | [NC2 AWS Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html) |
| 71 | NC2 AWS deployment sequence | Ordering | [NC2 AWS Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html) |
| 72 | VM migration sequence (Move) | Ordering | [Nutanix Move Guide](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Move-v4_8:top-nutanix-move-overview-c.html) |
| 73 | NC2 Azure deployment sequence | Ordering | [NC2 Azure Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-Azure:nc2-azure-getting-started-c.html) |
| 74 | Hybrid DR setup sequence | Ordering | [Leap DR Guide](https://portal.nutanix.com/page/documents/details?targetId=Leap-DR-Guide:leap-leap-overview.html) |
| 75 | Node failure recovery sequence | Ordering | [NC2 AWS Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html) |
| 76 | Storage scaling sequence | Ordering | [NC2 AWS Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html) |
| 77 | Flow microsegmentation rollout | Ordering | [Flow Networking Guide](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Flow-Networking-Guide:flow-networking-overview-c.html) |
| 78 | Deployment troubleshooting sequence | Ordering | [NC2 AWS](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html) / [NC2 Azure](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-Azure:nc2-azure-getting-started-c.html) |
| 79 | Prism Central connectivity setup | Ordering | [Prism Central Guide](https://portal.nutanix.com/page/documents/details?targetId=Prism-Central-Next-Release:pcenter-what-is-prism-central-c.html) |
| 80 | Metadata backup automation | Ordering | [NC2 AWS Getting Started](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html) |

---

## 6. Key Technical Facts Verification

| Fact | Expected | Part 3 | Part 4 | Status |
|------|----------|--------|--------|--------|
| AWS instance: i3.metal | i3.metal | Q1 ✅ | Q2,Q17 ✅ | Consistent |
| Azure: BareMetal Infrastructure | BareMetal | Q2 ✅ | Q5,Q6 ✅ | Consistent |
| Subnet minimum: /25 (AWS) | /25 | — | Q1,Q40,Q50 ✅ | Correct answer, Q40/Q50 IP math wrong |
| Subnet minimum: /24 (Azure delegated) | /24 | Q4 (implied) | Q6 ✅ | Consistent |
| Same AZ requirement (AWS) | Required | — | Q16 ✅ | Correct |
| Foundation not required | Not needed | — | Q12 ✅ | Correct |
| ECMP max 4 paths | 4 | Q14 (implied) | Q8 ✅ | Correct |
| BGP + Route Server (Azure) | Required | Q7 (implied) | Q7 ✅ | Correct |
| Subscription licensing | Subscription | Q31 ✅ | Q13 ✅ | Consistent |
| Node Hibernation | Azure feature | Q32 ✅ | Q14 ⚠️ | Q14 says AWS/Azure |
| Flow Gateway | Azure networking | Q7,Q11 ✅ | Q5 ⚠️ | Q5 explanation imprecise |
| Leap cross-cloud DR | Supported | Q41 ✅ | Q21,Q45 ✅ | Consistent |
| Prism Central unified mgmt | Supported | Q61 ✅ | Q24 ✅ | Consistent |
| All-flash / NVMe storage | Required | Q21 ✅ | Q17 ✅ | Consistent |

---

## 7. Recommendations

### Critical Fixes (Before Use)
1. **P4-Q40/Q50:** Fix option text — change `/25 (30 usable IPs)` → `/25 (123 usable IPs)` or `/25 (126 usable IPs)`
2. **P4-Q60:** Rewrite explanation to clearly distinguish RPO from RTO as independent metrics

### Recommended Improvements
3. **P3-Q18:** Add nuance to explanation about same-host traffic surviving Flow Gateway failure
4. **P4-Q5:** Align Flow Gateway description with Part 3 Q11 (overlay-to-underlay bridging)
5. **P4-Q14:** Clarify node hibernation is primarily an Azure feature
6. **P4-Q22:** Use "test migration" instead of "test failover" when discussing Nutanix Move
7. **P4-Q27:** Verify NKP NC2 support against current release documentation

### Structural Improvements
8. **Both Parts:** Redistribute answer options to achieve ~25% per letter. Part 3 has 80% B answers; Part 4 MCQ has 62% B answers. Swap option positions without changing content.

---

## 8. Cross-File Consistency Check

| Topic | Part 3 Reference | Part 4 Reference | Consistent? |
|-------|-------------------|-------------------|-------------|
| Flow Gateway purpose | Q7,Q11 (overlay↔underlay) | Q5 (VNet↔on-prem) | ⚠️ Part 4 less precise |
| /25 subnet requirement | Not directly tested | Q1,Q40,Q50 | ✅ (answer correct, text error) |
| Node failure recovery | Q53 (remove+replace) | Q30,Q70 (destroy+provision) | ✅ Consistent |
| Leap DR capabilities | Q41–Q50 (comprehensive) | Q21,Q45,Q60 | ✅ Consistent |
| Prism Central scope | Q61–Q70 | Q24,Q46,Q69 | ✅ Consistent |
| Security group ports | Implied | Q4,Q41 (9440/2049/3260) | ✅ Consistent |
| Hibernation scope | Q32 (general) | Q14,Q37 (AWS/Azure) | ⚠️ Part 4 broader than documented |

---

*Validation performed against Nutanix NC2 documentation, AWS/Azure cloud documentation, and NCP-CI 6.10 exam objectives.*
