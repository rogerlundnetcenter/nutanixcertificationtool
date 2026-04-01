# NCP-CI 6.10 Blueprint Coverage Analysis

> **Generated:** 2025-07-14
> **Exam Bank:** NCP-CI-Part1.md through NCP-CI-Part4.md (320 questions total)
> **Blueprints:** NCP-CI-AWS 6.10 + NCP-CI-Azure 6.10

---

## Exam Overview

| Attribute | NCP-CI-AWS 6.10 | NCP-CI-Azure 6.10 |
|---|---|---|
| Questions | 75 MCQ | 75 MCQ |
| Time | 120 minutes | 120 minutes |
| Pass Score | 3000 / 6000 (scaled) | 3000 / 6000 (scaled) |
| AOS Version | 6.10 | 6.10 |
| Prism Central | pc2024.2 | pc2024.2 |
| Cost | $200 USD | $200 USD |
| Cert Validity | 3 years | 3 years |

### Key Architectural Differences

| Feature | NC2 on AWS | NC2 on Azure |
|---|---|---|
| Host Type | i3.metal / i3en.metal (local NVMe) | Azure BareMetal Infrastructure |
| Host Subnet | /25 minimum in VPC | /24 delegated subnet in VNet |
| Overlay→Underlay | AHV VPC bridge integration (no gateway) | **Flow Gateway VMs** (up to 4 ECMP) |
| Private Link | AWS Direct Connect + VGW | Azure ExpressRoute + Route Server |
| Dynamic Routing | BGP on Direct Connect VIF | BGP via Azure Route Server with Flow GW |
| Metadata Backup | Amazon S3 | Azure Blob Storage |
| Security Filtering | AWS Security Groups | Azure NSGs + UDRs |
| Monitoring | Amazon CloudWatch + Datadog | Azure Monitor + Datadog |
| Deployment Prereq | IAM role (EC2/VPC/EBS/S3), CloudFormation | App Registration, Allowlisting subscription, Resource Providers |

---

## Section 1 – Planning Deployment

### Objective 1.1 – Prepare the Cloud Environment

| Knowledge Item | Applicability | Coverage | Questions |
|---|---|---|---|
| Determine the cloud provider to use | COMMON | ✅ COVERED | P1-Q73, P3-Q1–Q7 |
| Determine cloud region(s) | COMMON | ✅ COVERED | P1-Q28, P1-Q62, P3-Q52, P4-Q16 |
| Determine appropriate AWS organization/account | AWS-SPECIFIC | ✅ COVERED | P1-Q12 (cross-account IAM), P1-Q3 (IAM) |
| Determine appropriate Azure organization/account | AZURE-SPECIFIC | ✅ COVERED | P1-Q22 (Azure AD RBAC), P1-Q23 (Resource Groups), P1-Q40 (service principal) |
| Determine the node type to use | COMMON | ✅ COVERED | P1-Q4 (i3en.metal), P1-Q14, P1-Q25, P1-Q38, P3-Q1 (i3.metal), P3-Q2 (BareMetal), P1-Q78 (r5.metal fail) |
| **AWS: EC2 instance tenancy types, managed policies** | AWS-SPECIFIC | ⚠️ PARTIAL | Instance types covered extensively; EC2 tenancy types (dedicated vs default) not explicitly tested; AWS Managed Policies for NC2 not directly tested |
| **Azure: Resource Providers registration, Allowlisting subscription** | AZURE-SPECIFIC | ⚠️ PARTIAL | Allowlisting mentioned in P4-Q29 (delegated subnet); explicit Resource Provider registration steps and allowlisting validation not covered |
| **Heterogeneous cluster node pairing** | AWS-SPECIFIC | ⚠️ PARTIAL | Only mentioned obliquely in P2-Q28 context (node types); no question specifically on heterogeneous cluster rules/pairing matrix |

### Objective 1.2 – Subscribe to the NC2 Service

| Knowledge Item | Applicability | Coverage | Questions |
|---|---|---|---|
| my.nutanix.com authentication methods/types/orgs | COMMON | ✅ COVERED | P1-Q41, P1-Q65, P4-Q9 |
| NC2 organization naming convention & cloud accounts | COMMON | ⚠️ PARTIAL | my.nutanix.com portal covered; organization naming convention specifics not tested |
| Apply applicable RBAC roles | COMMON | ✅ COVERED | P1-Q22 (Azure AD RBAC), P1-Q12 (cross-account IAM), P3-Q75 (AD RBAC), P3-Q76 (least privilege) |
| Compare subscription plan options | COMMON | ✅ COVERED | P3-Q31 (subscription model), P3-Q35 (subscription tiers), P1-Q50, P2-Q44, P4-Q13 |
| **AWS: PAYG subscriptions, usage metering, license capacity reservation** | AWS-SPECIFIC | ⚠️ PARTIAL | Subscription model and billing covered (P3-Q37, P2-Q44); PAYG vs term specifics and metering details not explicitly tested |
| **Azure: Custom Role creation, Azure VPN Gateway pricing** | AZURE-SPECIFIC | 🔴 GAP | No question on creating Azure Custom Roles for NC2; no question on Azure VPN Gateway pricing considerations |

### Objective 1.3 – Determine Implementation Requirements

| Knowledge Item | Applicability | Coverage | Questions |
|---|---|---|---|
| Outline redundancy/resiliency requirements | COMMON | ✅ COVERED | P1-Q42 (min 3 nodes), P1-Q66 (RF2 fault tolerance), P3-Q24 (RF2 min), P3-Q25 (node failure) |
| Evaluate deployment use cases | COMMON | ✅ COVERED | P1-Q9 (dev/test hibernation), P1-Q30 (cost optimization), P3-Q36 (cost patterns) |
| Compare Nutanix compatibility matrix | COMMON | ⚠️ PARTIAL | AOS/AHV versions mentioned; no question explicitly on checking the compatibility matrix tool |
| Implement NC2 integrations with provider services | COMMON | ✅ COVERED | P3-Q9 (AWS ELB), P2-Q57 (Calm), P2-Q58 (NKE/NKP) |
| Determine allowed client access methods | COMMON | ✅ COVERED | P1-Q7 (port 9440), P2-Q16 (SSH), P2-Q60 (AD/LDAP), P3-Q74 (SAML SSO) |
| **AWS: API Key Management for NC2** | AWS-SPECIFIC | 🔴 GAP | No question on NC2 API key management (creating/rotating API keys in the NC2 Console) |
| **Azure: NC2 on Azure Encryption, outbound communication** | AZURE-SPECIFIC | ⚠️ PARTIAL | Encryption covered generically (P3-Q72, Q73); Azure-specific encryption (customer-managed keys in Azure) not explicitly tested; outbound communication requirements not specifically tested |

### Objective 1.4 – Identify Networking Requirements

| Knowledge Item | Applicability | Coverage | Questions |
|---|---|---|---|
| On-prem connectivity – VPN | COMMON | ✅ COVERED | P1-Q15 (VPN backup), P2-Q14 (S2S VPN), P3-Q19 (S2S VPN+VGW), P4-Q20 (BGP VPN failover) |
| On-prem connectivity – Direct Connect | AWS-SPECIFIC | ✅ COVERED | P1-Q5, P1-Q6 (BGP), P1-Q16 (LAG), P1-Q35, P2-Q25, P4-Q35, P4-Q52 |
| On-prem connectivity – ExpressRoute | AZURE-SPECIFIC | ✅ COVERED | P1-Q19, P1-Q20 (Global Reach), P1-Q37, P2-Q11–Q12, P3-Q6, P3-Q78 |
| On-prem connectivity – SDWAN, Megaport | COMMON | 🔴 GAP | No questions specifically on SDWAN or Megaport connectivity options for NC2 |
| CIDR ranges for VPC/subnets/VM Networks (AWS) | AWS-SPECIFIC | ✅ COVERED | P1-Q1 (/25 min), P1-Q27 (/16 VPC), P4-Q1, P4-Q40, P4-Q50 |
| CIDR ranges for VNets/delegated subnets/Flow VM Networks (Azure) | AZURE-SPECIFIC | ✅ COVERED | P1-Q17 (delegated subnet), P1-Q29, P1-Q32, P4-Q6, P4-Q29 |
| **Azure: NAT, noNAT, L2 stretch network types** | AZURE-SPECIFIC | ⚠️ PARTIAL | NAT Gateway covered (P2-Q5, P3-Q15); L2 stretch and noNAT explicitly listed in blueprint but no dedicated question on choosing between NAT/noNAT/L2 stretch modes |
| **AWS: VPC Endpoints for S3, Gateway Endpoints** | AWS-SPECIFIC | 🔴 GAP | No question on configuring S3 VPC endpoints or Gateway endpoints for NC2 |

---

## Section 2 – Deploying the Environment

### Objective 2.1 – Deploy the Cloud Cluster

| Knowledge Item | Applicability | Coverage | Questions |
|---|---|---|---|
| Identify number of clusters, nodes, node types | COMMON | ✅ COVERED | P1-Q42 (min 3), P1-Q4, P3-Q1–Q2, P4-Q10, P4-Q11 |
| Define deployment types | COMMON | ✅ COVERED | P1-Q41 (NC2 Console wizard), P1-Q47 (no Foundation), P1-Q60 (unique steps), P4-Q12 |
| Identify Prism Central supported topologies | COMMON | ✅ COVERED | P1-Q43 (PC registration), P1-Q63, P3-Q10 (PC as VM on cluster), P3-Q61 |
| Describe AWS network configuration | AWS-SPECIFIC | ✅ COVERED | P1-Q8 (dedicated VPC), P1-Q36 (route tables), P2-Q3 (VPC peering), P2-Q4 (Transit GW) |
| **Describe Flow Gateway configuration** | AZURE-SPECIFIC | ✅ COVERED | P2-Q7 (Flow GW purpose), P2-Q8 (max 4 ECMP), P2-Q9 (Route Server BGP), P2-Q23, P3-Q11, P3-Q18, P4-Q5, P4-Q55, P4-Q64, P4-Q73 |
| Identify management networking type | COMMON | ✅ COVERED | P1-Q7 (port 9440), P2-Q1 (Prism management), P4-Q43 |

### Objective 2.2 – Configure Cloud Provider Networking

| Knowledge Item | Applicability | Coverage | Questions |
|---|---|---|---|
| Configure VPC resources (AWS) | AWS-SPECIFIC | ✅ COVERED | P1-Q8, P1-Q27, P1-Q28, P1-Q36, P2-Q3–Q5 |
| Configure VNet resources (Azure) | AZURE-SPECIFIC | ✅ COVERED | P1-Q17, P1-Q29, P3-Q20 (UDRs), P4-Q29, P4-Q73 |
| Configure outbound public internet connectivity | COMMON | ✅ COVERED | P2-Q5 (NAT Gateway), P3-Q15 (AWS NAT GW), P3-Q54 (troubleshoot internet) |
| Configure VPN/Direct Connect/peering (AWS) | AWS-SPECIFIC | ✅ COVERED | P1-Q5, P1-Q15–Q16, P2-Q14, P2-Q20, P2-Q25, P4-Q18, P4-Q42, P4-Q62 |
| Configure VPN/ExpressRoute/peering (Azure) | AZURE-SPECIFIC | ✅ COVERED | P1-Q19–Q20, P2-Q10 (VNet peering), P2-Q22, P3-Q6, P4-Q47 |
| **Azure: Bare Metal Infrastructure Networking Constraints** | AZURE-SPECIFIC | ⚠️ PARTIAL | Delegated subnet covered; specific BareMetal networking constraints (e.g., no NSG on delegated subnet, routing limitations) not explicitly tested |

### Objective 2.3 – Troubleshoot Cluster Deployment Issues

| Knowledge Item | Applicability | Coverage | Questions |
|---|---|---|---|
| Verify cloud account quota/permissions/policies – AWS (CloudFormation, IAM) | AWS-SPECIFIC | ✅ COVERED | P1-Q13, P1-Q44, P1-Q52, P1-Q69, P3-Q51–Q52, P4-Q28, P4-Q32, P4-Q63 |
| Verify cloud account quota/permissions/policies – Azure (Allowlisting, secret expiration, IAM) | AZURE-SPECIFIC | ⚠️ PARTIAL | Allowlisting mentioned (P4-Q29); **secret expiration** (App Registration client secret) not tested; Azure-specific deployment troubleshooting less covered than AWS |
| Verify NC2 portal permissions and configurations | COMMON | ✅ COVERED | P1-Q65 (my.nutanix.com account required), P1-Q44 |
| **AWS: CloudFormation stack updates, network validation** | AWS-SPECIFIC | 🔴 GAP | No question on CloudFormation stacks used by NC2 deployment or updating stack configurations |
| **AWS: Troubleshooting failed due to shared subnets** | AWS-SPECIFIC | 🔴 GAP | No question on shared subnet deployment failures |
| **Azure: Support Log Bundle Collection** | AZURE-SPECIFIC | 🔴 GAP | No question on collecting NC2 support log bundles for Azure troubleshooting |
| **Azure: Adding Azure Cloud Account to NC2, App Registration** | AZURE-SPECIFIC | 🔴 GAP | No question on the App Registration creation process or adding an Azure cloud account to the NC2 Console |
| **Azure: Validating Allowlisting** | AZURE-SPECIFIC | 🔴 GAP | No question on validating Azure subscription allowlisting status |

---

## Section 3 – Configuring the Environment

### Objective 3.1 – Configure Cloud Networking and Security (AWS) / Modify Cloud Networking Security (Azure)

| Knowledge Item | Applicability | Coverage | Questions |
|---|---|---|---|
| Determine access to cluster management | COMMON | ✅ COVERED | P1-Q7, P2-Q1, P2-Q16 (SSH), P2-Q19, P4-Q43 |
| Modify access to workloads on NC2 cluster | COMMON | ✅ COVERED | P2-Q2 (iSCSI), P2-Q5 (NAT GW), P2-Q6 (Flow), P2-Q17, P1-Q39, P4-Q41 |
| **AWS: SSH access to cluster, custom security groups** | AWS-SPECIFIC | ✅ COVERED | P2-Q16 (SSH port 22), P1-Q39 (SG remediation), P1-Q31 (ports) |
| **AWS: Ports and Endpoint Requirements** | AWS-SPECIFIC | ✅ COVERED | P4-Q4, P1-Q7, P1-Q10, P1-Q26, P1-Q31 |
| **Azure: Nutanix Flow Virtual Networking, Creating User VPC, Configuring ERP** | AZURE-SPECIFIC | ⚠️ PARTIAL | Flow Gateway and VPC concepts covered; **ERP (External Routing Policy) configuration** in User VPC not explicitly tested |

### Objective 3.2 – Configure Nutanix Networking (AZURE-SPECIFIC)

| Knowledge Item | Applicability | Coverage | Questions |
|---|---|---|---|
| Flow Gateway scalability | AZURE-SPECIFIC | ✅ COVERED | P2-Q8 (max 4 ECMP), P4-Q55 (min 2 for HA) |
| UDR in Azure, Flow, and applicable subnets | AZURE-SPECIFIC | ✅ COVERED | P3-Q20 (UDRs + NSG rules) |
| NAT / no NAT | AZURE-SPECIFIC | ⚠️ PARTIAL | NAT Gateway concept covered; **NAT vs noNAT overlay network modes** in Flow not explicitly tested |
| L2 stretch | AZURE-SPECIFIC | 🔴 GAP | No question on L2 subnet extension for NC2 on Azure |
| Floating IPs | AZURE-SPECIFIC | 🔴 GAP | No question on requesting/configuring Floating IPs for NAT subnets in Azure |
| Security Groups (Flow) | AZURE-SPECIFIC | ✅ COVERED | P2-Q6, P2-Q13 (NSGs + Flow interaction), P2-Q21, P2-Q26, P2-Q27, P3-Q71, P3-Q77 |
| **Flow Gateway HA** | AZURE-SPECIFIC | ⚠️ PARTIAL | Covered via ECMP (P2-Q8); dedicated HA failover mechanics not deeply tested |
| **VPC Management, Transit VPC ERP** | AZURE-SPECIFIC | 🔴 GAP | No question on Transit VPC ERP configuration or VPC management workflows in Azure |
| **Controlling North-South Traffic** | AZURE-SPECIFIC | ⚠️ PARTIAL | Covered conceptually (P2-Q7, P3-Q14 ECMP); specific north-south traffic control policies not tested |
| **Migrating to Scaled-Out Flow Gateway** | AZURE-SPECIFIC | 🔴 GAP | No question on migrating from single to scaled-out Flow Gateway deployment |
| **Scaling Up/Down Flow Gateway VMs** | AZURE-SPECIFIC | 🔴 GAP | No question on the process of scaling Flow Gateway VMs up or down |

### Objective 3.2 (AWS) / 3.3 (Azure) – Troubleshoot Connectivity Issues

| Knowledge Item | Applicability | Coverage | Questions |
|---|---|---|---|
| Verify initial cluster connectivity | COMMON | ✅ COVERED | P1-Q54 (Prism inaccessible), P1-Q71 (VIP unreachable), P3-Q57 (PC unreachable) |
| Verify User VM connectivity (ports, SGs, ACLs, routing) | COMMON | ✅ COVERED | P1-Q58 (DNS), P2-Q3 (CIDR overlap), P2-Q24 (live migration), P3-Q54 (internet), P4-Q36, P4-Q53 |
| **AWS: Load Balancer for internet access, multicast support** | AWS-SPECIFIC | 🔴 GAP | No question on deploying a Load Balancer to allow internet access; no question on multicast network support |
| **AWS: CloudAPIEndpointUnreachable errors** | AWS-SPECIFIC | 🔴 GAP | No question specifically on troubleshooting CloudAPIEndpointUnreachable errors |
| **AWS: EC2 Instance IP Addressing** | AWS-SPECIFIC | ⚠️ PARTIAL | Subnet sizing and IP allocation covered; EC2-specific IP addressing behaviors not explicitly tested |
| **Azure: Configuring connectivity for User VMs with NAT** | AZURE-SPECIFIC | ⚠️ PARTIAL | NAT Gateway covered generically; Azure-specific User VM NAT connectivity configuration not tested |
| **Azure: Request Floating IPs for NAT Subnets** | AZURE-SPECIFIC | 🔴 GAP | No question on requesting Floating IPs (same gap as 3.2) |

---

## Section 4 – Managing the Environment

### Objective 4.1 – Identify Management Tasks for Nodes and Clusters

| Knowledge Item | Applicability | Coverage | Questions |
|---|---|---|---|
| Identify cluster capacity and node types | COMMON | ✅ COVERED | P2-Q36 (local NVMe only), P2-Q43 (add nodes for capacity), P3-Q63 (capacity runway), P4-Q31 |
| Heterogeneous cluster node pairing (AWS) | AWS-SPECIFIC | ⚠️ PARTIAL | Different instance types mentioned (i3.metal, i3en.metal); no specific question on heterogeneous pairing rules |
| Identify node scale-out/scale-up triggers | COMMON | ✅ COVERED | P1-Q59 (scale out), P2-Q28 (expand via NC2), P2-Q43, P2-Q50 (min 3), P4-Q31, P4-Q58, P4-Q76 |
| Describe the node management process | COMMON | ✅ COVERED | P1-Q48–Q49 (node replacement), P1-Q64, P2-Q38–Q39, P2-Q42, P3-Q53, P4-Q30, P4-Q70, P4-Q75 |
| Define the environment upgrade process | COMMON | ✅ COVERED | P2-Q31 (LCM), P2-Q32 (NC2 Console updates), P2-Q45 (rolling upgrade), P2-Q53, P2-Q71 |
| **Node hibernation and resume** | COMMON | ✅ COVERED | P1-Q9, P2-Q29–Q30, P2-Q47–Q48, P3-Q32, P4-Q14, P4-Q37 |
| **Azure: Migrating to scaled-out Flow Gateway** | AZURE-SPECIFIC | 🔴 GAP | (Same gap as Section 3.2) |
| **Azure: Scaling Flow Gateway VMs** | AZURE-SPECIFIC | 🔴 GAP | (Same gap as Section 3.2) |
| **Azure: Azure Events in NC2** | AZURE-SPECIFIC | 🔴 GAP | No question on Azure-specific events appearing in the NC2 Console |
| **Azure: Terminating a Cluster** | AZURE-SPECIFIC | 🔴 GAP | No question on the cluster termination process on Azure |
| **Azure: Prepare to Upgrade a Cluster** | AZURE-SPECIFIC | ⚠️ PARTIAL | LCM upgrade process covered generically; Azure-specific pre-upgrade steps not tested |
| **AWS: Adding Users from the NC2 Console** | AWS-SPECIFIC | ⚠️ PARTIAL | NC2 Console usage covered; specific user management within the NC2 Console not tested |
| **AWS: Local User Management** | AWS-SPECIFIC | ⚠️ PARTIAL | AD/LDAP covered; local user management specifics not tested |

### Objective 4.2 – Monitor Cluster and Cloud Resource Health

| Knowledge Item | Applicability | Coverage | Questions |
|---|---|---|---|
| Identify alerting options | COMMON | ✅ COVERED | P2-Q34 (Prism + CloudWatch), P2-Q35 (NC2 Console + Azure Monitor), P2-Q49, P3-Q66 |
| Describe alert email configuration options | COMMON | ⚠️ PARTIAL | Alert monitoring covered; **SMTP server configuration for Prism Central** and **email alert configuration** not explicitly tested |
| Identify syslog monitoring options – AWS CloudWatch | AWS-SPECIFIC | ✅ COVERED | P2-Q34, P2-Q46 (CloudWatch bare-metal metrics) |
| Identify syslog monitoring options – Azure Monitor | AZURE-SPECIFIC | ✅ COVERED | P2-Q35 (Azure Monitor) |
| Identify syslog monitoring options – Datadog | COMMON | 🔴 GAP | No question on Datadog integration with NC2 |
| Identify syslog monitoring options – modules, severity levels | COMMON | 🔴 GAP | No question on syslog module configuration or severity level filtering |
| Describe the cluster support process | COMMON | ⚠️ PARTIAL | NCC health checks covered (P2-Q37, P2-Q48); Nutanix Technical Support process and escalation path not explicitly tested |
| **AWS: AWS Events in NC2** | AWS-SPECIFIC | ✅ COVERED | P2-Q42 (instance retirement event) |
| **Azure: VPC Flow Logs** | AZURE-SPECIFIC | 🔴 GAP | No question on VPC Flow Logs for monitoring in Azure |
| **Azure: Configuring Health Checks** | AZURE-SPECIFIC | 🔴 GAP | No question on configuring health checks for NC2 on Azure |

### Objective 4.3 – Perform Cluster Backup and Recovery (AWS-SPECIFIC — Note: Azure blueprint does NOT list a 4.3)

| Knowledge Item | Applicability | Coverage | Questions |
|---|---|---|---|
| Configure Nutanix Disaster Recovery | COMMON | ✅ COVERED | P2-Q59 (Leap), P2-Q66 (async replication), P2-Q67 (failback), P3-Q41–Q49, P4-Q21, P4-Q45, P4-Q51, P4-Q65 |
| Determine required RPO/RTO | COMMON | ✅ COVERED | P3-Q45 (NearSync 1-min RPO), P4-Q51 (RPO definition), P4-Q60 (RTO <15 min) |
| Configure cluster and VM backup | COMMON | ✅ COVERED | P1-Q11 (S3 metadata), P1-Q34, P2-Q40 (S3 recovery), P2-Q41 (Blob), P1-Q79, P4-Q33, P4-Q49, P4-Q80 |
| **Cluster Protect Configuration/Prerequisites** | AWS-SPECIFIC | 🔴 GAP | No question on Cluster Protect feature, its prerequisites, or CLI commands |
| **Protecting Prism Central Configuration** | COMMON | ⚠️ PARTIAL | PC replication via Leap touched on (P4-Q57); dedicated Prism Central protection configuration not tested |
| **Native Encryption of Replication Traffic** | COMMON | ⚠️ PARTIAL | Encryption in transit between CVMs covered (P3-Q73); native encryption of DR replication traffic specifically not tested |
| **Failover and Failback Operations** | COMMON | ✅ COVERED | P2-Q67, P3-Q43, P3-Q48, P4-Q23 |
| **Integration with Third-Party Backup Solutions** | COMMON | 🔴 GAP | No question on integrating third-party backup solutions (Veeam, Commvault, etc.) with NC2 |

---

## Summary Statistics

### NCP-CI-AWS 6.10 Exam

| Section | Objectives | Fully Covered | Partial | Gap | Coverage % |
|---|---|---|---|---|---|
| 1 – Planning | 4 objectives (17 knowledge items) | 10 | 4 | 3 | 59% fully / 82% at least partial |
| 2 – Deploying | 3 objectives (11 knowledge items) | 7 | 0 | 4 | 64% fully / 64% at least partial |
| 3 – Configuring | 2 objectives (8 knowledge items) | 5 | 1 | 2 | 63% fully / 75% at least partial |
| 4 – Managing | 3 objectives (16 knowledge items) | 8 | 4 | 4 | 50% fully / 75% at least partial |
| **AWS TOTAL** | **12 objectives (52 items)** | **30** | **9** | **13** | **58% fully / 75% partial+** |

### NCP-CI-Azure 6.10 Exam

| Section | Objectives | Fully Covered | Partial | Gap | Coverage % |
|---|---|---|---|---|---|
| 1 – Planning | 4 objectives (18 knowledge items) | 10 | 5 | 3 | 56% fully / 83% at least partial |
| 2 – Deploying | 3 objectives (12 knowledge items) | 7 | 1 | 4 | 58% fully / 67% at least partial |
| 3 – Configuring | 3 objectives (15 knowledge items) | 5 | 4 | 6 | 33% fully / 60% at least partial |
| 4 – Managing | 2 objectives (12 knowledge items) | 5 | 2 | 5 | 42% fully / 58% at least partial |
| **AZURE TOTAL** | **12 objectives (57 items)** | **27** | **12** | **18** | **47% fully / 68% partial+** |

---

## Critical Gaps Requiring New Questions

### HIGH PRIORITY — Gaps appearing in BOTH exams

| # | Topic | Why Critical |
|---|---|---|
| 1 | **SDWAN and Megaport connectivity** | Listed in both blueprints under 1.4; zero questions |
| 2 | **Syslog module configuration and severity levels** | Listed in both 4.2; zero questions on syslog modules |
| 3 | **Datadog integration** | Listed in both 4.2; zero questions |
| 4 | **SMTP / alert email configuration** | Listed in both 4.2; no question on configuring SMTP or alert emails in Prism Central |
| 5 | **Third-party backup integration** | Listed in both blueprints' references; zero questions on Veeam/Commvault with NC2 |
| 6 | **Cluster Protect** | Listed in AWS 4.3 references; config, prerequisites, CLI not covered |
| 7 | **NC2 API key management** | Listed in both 1.1/1.3 references; zero questions |

### HIGH PRIORITY — AWS-Specific Gaps

| # | Topic | Blueprint Ref | Details |
|---|---|---|---|
| 8 | **AWS VPC Endpoints for S3 / Gateway Endpoints** | 1.4, 2.2 | No question on configuring S3 VPC endpoints to avoid internet-routed S3 traffic |
| 9 | **CloudFormation stacks for NC2** | 2.3 | No question on NC2's use of CloudFormation or updating stack configurations |
| 10 | **Shared subnet deployment failures** | 2.3 | No question on troubleshooting shared subnet issues |
| 11 | **CloudAPIEndpointUnreachable errors** | 3.2 | No question on this specific NC2 error |
| 12 | **Load Balancer for internet access** | 3.2 | No question on deploying ALB/NLB for NC2 workload internet access |
| 13 | **Multicast network support** | 3.2 | No question on multicast support status/limitations |

### HIGH PRIORITY — Azure-Specific Gaps

| # | Topic | Blueprint Ref | Details |
|---|---|---|---|
| 14 | **L2 subnet extension** | 3.2 | No question on L2 stretch configuration for Azure |
| 15 | **Floating IPs for NAT subnets** | 3.2, 3.3 | No question on requesting/managing Floating IPs |
| 16 | **Transit VPC ERP configuration** | 3.2 | No question on ERP in Transit VPC |
| 17 | **ERP (External Routing Policy) in User VPC** | 3.1 | No question on configuring ERP |
| 18 | **Migrating to scaled-out Flow Gateway** | 3.2, 4.1 | No question on migration process |
| 19 | **Scaling Flow Gateway VMs up/down** | 3.2, 4.1 | No question on the scaling procedure |
| 20 | **Azure Custom Role creation** | 1.2 | No question on creating custom RBAC roles in Azure for NC2 |
| 21 | **App Registration for NC2** | 2.3 | No question on creating the App Registration or managing client secrets |
| 22 | **Validating Azure subscription allowlisting** | 2.3 | No question on verification steps |
| 23 | **Azure Events in NC2** | 4.1 | No question on Azure-specific events |
| 24 | **VPC Flow Logs** | 4.2 | No question on VPC flow log configuration for monitoring |
| 25 | **Azure Health Check configuration** | 4.2 | No question on configuring health checks |
| 26 | **Cluster Termination on Azure** | 4.1 | No question on the termination workflow |
| 27 | **Support Log Bundle Collection** | 2.3 | No question on collecting support bundles |

### MEDIUM PRIORITY — Partial Coverage Needs Strengthening

| # | Topic | Current State | Recommendation |
|---|---|---|---|
| 28 | **EC2 instance tenancy types** | Instance types well-covered; tenancy (dedicated/default/host) not tested | Add 1–2 questions on tenancy types and their impact on NC2 |
| 29 | **Heterogeneous cluster node pairing** | Different node types mentioned; pairing rules not tested | Add 1–2 questions on valid heterogeneous node combinations |
| 30 | **PAYG vs term subscription specifics** | Generic subscription covered; PAYG details missing | Add 1–2 questions on PAYG billing mechanics and metering |
| 31 | **NAT vs noNAT overlay modes (Azure)** | NAT Gateway covered; Azure Flow overlay modes not tested | Add 2–3 questions on choosing between NAT/noNAT/L2 modes |
| 32 | **Azure secret expiration troubleshooting** | App Registration covered; secret lifecycle not tested | Add 1 question on troubleshooting expired client secrets |
| 33 | **BareMetal networking constraints** | Delegated subnet covered; specific constraints not tested | Add 1–2 questions on BareMetal network limitations |
| 34 | **Nutanix Technical Support process** | NCC covered; escalation path not tested | Add 1 question on support process and log collection |
| 35 | **Prism Central configuration protection** | Leap for PC briefly touched; dedicated configuration not tested | Add 1–2 questions on protecting PC config data |
| 36 | **North-South traffic control in Azure** | Conceptually covered; specific policy config not tested | Add 1–2 questions on configuring north-south traffic policies |

---

## Coverage Strengths

The question bank excels in these areas (well over 10 questions each):

| Topic Area | Approx. Question Count | Notes |
|---|---|---|
| AWS instance types (i3.metal) & local NVMe storage | 20+ | Extremely well-covered from multiple angles |
| Security Groups / NSGs / port requirements | 20+ | Ports 9440, 2049, 3260 thoroughly tested |
| NC2 deployment workflow (my.nutanix.com, no Foundation) | 15+ | Comprehensive coverage |
| Direct Connect / ExpressRoute connectivity | 15+ | Both platforms well-covered |
| Node management (replacement, scaling, hibernation) | 15+ | Excellent operational coverage |
| Prism Central unified management | 15+ | Well-covered across all parts |
| Flow microsegmentation | 12+ | Good coverage of policy types and enforcement |
| Leap DR / Nutanix Move migration | 15+ | Comprehensive DR and migration coverage |
| Flow Gateway (Azure) | 10+ | Good coverage of purpose, ECMP, BGP |
| Licensing / cost optimization | 10+ | Subscription model, hibernation, RI well-covered |
| Troubleshooting (IAM, quota, connectivity) | 12+ | Good troubleshooting scenario coverage |

---

## Recommended Action Plan

### Phase 1 — Close Critical Common Gaps (7 questions)
1. SDWAN connectivity option for NC2 hybrid (1 Q)
2. Megaport as connectivity partner (1 Q)
3. Syslog module configuration + severity levels (2 Q)
4. Datadog monitoring integration (1 Q)
5. SMTP / alert email configuration in Prism Central (1 Q)
6. Third-party backup solution integration (1 Q)

### Phase 2 — Close AWS-Specific Gaps (6 questions)
7. S3 VPC Endpoint / Gateway Endpoint configuration (1 Q)
8. CloudFormation stack used by NC2 (1 Q)
9. CloudAPIEndpointUnreachable troubleshooting (1 Q)
10. Cluster Protect configuration and CLI (2 Q)
11. NC2 API key management (1 Q)

### Phase 3 — Close Azure-Specific Gaps (14 questions)
12. L2 subnet extension configuration (2 Q)
13. Floating IPs for NAT subnets (1 Q)
14. ERP configuration in User VPC and Transit VPC (2 Q)
15. Migrating to scaled-out Flow Gateway + scaling up/down (2 Q)
16. Azure Custom Role creation for NC2 (1 Q)
17. App Registration + client secret management (2 Q)
18. Azure subscription allowlisting validation (1 Q)
19. Azure Events in NC2 Console (1 Q)
20. VPC Flow Logs + Health Check configuration (1 Q)
21. Cluster termination workflow (1 Q)

### Phase 4 — Strengthen Partial Coverage (8 questions)
22. EC2 tenancy types (1 Q)
23. Heterogeneous cluster pairing rules (1 Q)
24. PAYG metering specifics (1 Q)
25. NAT vs noNAT vs L2 stretch mode selection (2 Q)
26. Azure secret expiration troubleshooting (1 Q)
27. North-South traffic control policies (1 Q)
28. Nutanix support process and log bundle collection (1 Q)

**Total new questions recommended: ~35**

---

## Notes

- The question bank has **320 total questions** across 4 files, providing excellent depth for the most commonly tested topics
- **AWS coverage is stronger than Azure coverage** — Azure Section 3 (Flow networking) has the most gaps
- The Azure exam has an extra objective (3.2 Configure Nutanix Networking) that has no AWS equivalent, reflecting Flow Gateway complexity
- The AWS exam has an extra objective (4.3 Backup and Recovery) not present in the Azure blueprint
- Many questions serve **dual purpose** — covering both AWS and Azure concepts in a single question (especially in Part 3 and Part 4)
- Part 4 includes ordering/sequence questions (Q71–Q80) which provide excellent coverage of deployment and operational workflows

---

*End of NCP-CI 6.10 Blueprint Coverage Report*
