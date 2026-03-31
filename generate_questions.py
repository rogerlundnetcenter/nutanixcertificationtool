"""
Nutanix Certification Exam Question Generator
==============================================
Systematically generates exam questions by computing the combinatorial space:
  concepts × question_types × difficulty_variants = total question pool

For each exam's 75-question draw, we need enough pool to cover every possible
angle the exam could test. Target: 320+ per exam (4x+ the actual exam).
"""

import json
import random
import os
from dataclasses import dataclass, field
from typing import List, Dict, Tuple

OUTPUT_DIR = r"C:\copilot\next2026"

# ============================================================================
# QUESTION TYPE TEMPLATES
# ============================================================================
QUESTION_TYPES = [
    "direct",        # What is X? / Which describes X?
    "best_answer",   # Which is the BEST approach for...?
    "first_step",    # What should be done FIRST?
    "troubleshoot",  # Given these symptoms, what is the cause?
    "negative",      # Which is NOT true about X?
    "scenario",      # Given this situation, what should you do?
    "numeric",       # How many / what port / what limit?
    "compare",       # What is the difference between X and Y?
    "sequence",      # What is the correct order of steps?
    "architecture",  # Which component is responsible for X?
]

# ============================================================================
# EXAM DEFINITIONS — COMPLETE CONCEPT TAXONOMY
# ============================================================================

EXAMS = {}

# ---------------------------------------------------------------------------
# NCP-US 6.10 — Unified Storage
# ---------------------------------------------------------------------------
EXAMS["NCP-US"] = {
    "title": "NCP-US 6.10 — Nutanix Certified Professional: Unified Storage",
    "format": "75 MCQ | 120 min | Pass: 3000/6000",
    "domains": {
        "D1: Deploy and Upgrade": {
            "weight": 0.25,
            "concepts": {
                # Nutanix Files Deployment
                "files_fsvm_minimum": {"fact": "Minimum 3 FSVMs for production/HA", "detail": "Single-FSVM only for small/test; no distributed shares or HA"},
                "files_fsvm_max": {"fact": "Maximum 16 FSVMs per file server", "detail": "Scale-out by adding FSVMs through Prism"},
                "files_fsvm_sizing": {"fact": "Standard: 4 vCPUs, 12 GB RAM per FSVM", "detail": "Can scale up for heavier workloads"},
                "files_prerequisites": {"fact": "AD and DNS must be configured before deployment", "detail": "File server joins AD domain, DNS A records for FSVM IPs"},
                "files_networks": {"fact": "Client network + storage network required", "detail": "Client-side for SMB/NFS traffic, storage-side for iSCSI to DSF"},
                "files_storage_container": {"fact": "Dedicated storage container recommended (best practice)", "detail": "Simplifies management and performance tuning"},
                "files_single_vs_multi": {"fact": "Single file server supports both SMB and NFS", "detail": "No need for separate servers per protocol"},
                # Files Upgrade
                "files_rolling_upgrade": {"fact": "Rolling upgrade — one FSVM at a time", "detail": "Connections briefly migrate to other FSVMs during upgrade"},
                "files_upgrade_precheck": {"fact": "Pre-checks required before upgrade", "detail": "Verify health, compatibility, and resource availability"},
                "files_upgrade_connection_impact": {"fact": "Brief disruption during FSVM upgrade", "detail": "Connections migrate to surviving FSVMs, then back"},
                # Nutanix Objects Deployment
                "objects_worker_minimum": {"fact": "Minimum 3 worker nodes for object store", "detail": "Worker VMs run containerized microservices"},
                "objects_requires_pc": {"fact": "Prism Central required for Objects", "detail": "Objects managed entirely through PC, not PE"},
                "objects_msp": {"fact": "Objects runs on Microservices Platform (MSP)", "detail": "Containerized services: Object Controllers, metadata managers, Atlas, S3 frontend"},
                "objects_networks": {"fact": "Internal + external networks must be VLAN-backed managed networks", "detail": "Not overlay networks"},
                "objects_architecture": {"fact": "Load balancers distribute S3 requests across worker nodes", "detail": "Scale-out by adding worker nodes for linear throughput increase"},
                "objects_upgrade_pc_compat": {"fact": "PC must be compatible version before Objects upgrade", "detail": "Version mismatch causes post-upgrade issues"},
                # Nutanix Volumes Deployment
                "volumes_iscsi": {"fact": "Volumes uses iSCSI protocol (port 3260)", "detail": "For external clients: physical servers, non-AHV environments"},
                "volumes_data_services_ip": {"fact": "Cluster-wide iSCSI data services IP for discovery", "detail": "Single discovery IP, I/O distributed across all CVMs"},
                "volumes_volume_groups": {"fact": "Volume Groups are the logical unit", "detail": "Contain one or more vDisks presented as iSCSI targets"},
                # Sizing
                "sizing_vdi_iops": {"fact": "VDI sizing driven by IOPS per user", "detail": "Peak IOPS × user count determines FSVM/storage resources"},
                "sizing_throughput": {"fact": "Distributed shares for max aggregate throughput", "detail": "Data spread across all FSVMs"},
                "sizing_objects_capacity": {"fact": "Objects capacity depends on worker nodes + underlying storage", "detail": "Worker node count affects metadata handling capacity"},
            }
        },
        "D2: Configure and Utilize": {
            "weight": 0.30,
            "concepts": {
                # SMB
                "smb_ad_auth": {"fact": "SMB uses Active Directory (Kerberos preferred, NTLM fallback)", "detail": "File server must join AD domain"},
                "smb_abe": {"fact": "Access-Based Enumeration hides files users can't access", "detail": "Per-share setting for security"},
                "smb_encryption": {"fact": "SMB encryption can be enabled per share", "detail": "SMB 3.0+ required on clients"},
                # NFS
                "nfs_auth_sys": {"fact": "AUTH_SYS uses UID/GID from client (no encryption)", "detail": "Simplest but least secure"},
                "nfs_kerberos": {"fact": "Kerberos for NFS: krb5 (auth), krb5i (integrity), krb5p (privacy/encryption)", "detail": "krb5p most secure but highest overhead"},
                "nfs_squash": {"fact": "Squash options: root_squash maps root to nobody, no_root_squash allows root", "detail": "Security vs convenience tradeoff"},
                "nfs_client_allowlist": {"fact": "Client allowlists restrict which IPs can mount exports", "detail": "Whitelist by IP or subnet"},
                # Multi-protocol
                "multiprotocol_native": {"fact": "Must choose native protocol (SMB-native or NFS-native)", "detail": "ACL management only via native protocol"},
                "multiprotocol_user_mapping": {"fact": "Requires user mapping between AD and Unix UID/GID (RFC 2307)", "detail": "Without mapping, cross-protocol access fails"},
                "multiprotocol_concurrency": {"fact": "Cannot write from both protocols simultaneously to same file", "detail": "Concurrent reads OK, concurrent writes blocked"},
                # Share Types
                "distributed_shares": {"fact": "Data spread across ALL FSVMs via TLD assignment", "detail": "Higher aggregate throughput, requires 3+ FSVMs"},
                "standard_shares": {"fact": "Data on single FSVM", "detail": "Simpler management, lower throughput ceiling"},
                "home_shares": {"fact": "Nested inside distributed shares for per-user isolation", "detail": "Each user gets own directory, inherits distributed layout"},
                # Quotas & Delegation
                "hard_quota": {"fact": "Hard quota blocks writes at limit", "detail": "Enforced by file system"},
                "soft_quota": {"fact": "Soft quota sends notification but allows continued writes", "detail": "Warning mechanism only"},
                "delegation": {"fact": "Share-level delegation to non-admin users", "detail": "Delegated users manage permissions on their shares"},
                # SSR
                "ssr_previous_versions": {"fact": "Self-Service Restore via Windows Previous Versions / .snapshot (NFS)", "detail": "Requires scheduled snapshot configuration"},
                # Objects Config
                "objects_access_keys": {"fact": "Access key + secret key pairs for S3 API access", "detail": "Generated per user, manually rotated"},
                "objects_bucket_policies": {"fact": "JSON format, AWS IAM-compatible syntax", "detail": "Control access per principal, per action, per resource"},
                "objects_worm": {"fact": "WORM: 24-hour grace period, then immutable until retention expires", "detail": "Can only EXTEND retention, never shorten or remove"},
                "objects_versioning": {"fact": "Unique version ID per object version", "detail": "Protects against accidental delete/overwrite"},
                "objects_lifecycle": {"fact": "Lifecycle policies automate expiration/deletion", "detail": "Retroactive; respects WORM retention before acting"},
                "objects_max_object_size": {"fact": "Maximum 5 TB per object (multipart upload)", "detail": "Multipart required for objects >5GB"},
                "objects_tagging": {"fact": "Object tagging for metadata and lifecycle targeting", "detail": "Key-value pairs on objects"},
                # Volumes Config
                "volumes_chap": {"fact": "CHAP authentication secures iSCSI connections", "detail": "Mutual CHAP for bidirectional authentication"},
                "volumes_iqn_whitelist": {"fact": "Initiator IQN whitelist restricts Volume Group access", "detail": "Only listed IQNs can connect"},
                "volumes_mpio": {"fact": "Multipath I/O (MPIO) for redundancy and throughput", "detail": "Multiple iSCSI sessions across CVMs"},
                # Data Protection
                "files_smart_dr": {"fact": "Smart DR: share-level replication, failover/failback via PC", "detail": "DNS update required to redirect clients to DR site"},
                "files_snapshots": {"fact": "Scheduled snapshots for point-in-time recovery", "detail": "Protection Domains for Files"},
                "files_smart_tiering": {"fact": "Smart Tiering moves cold data to S3-compatible object store", "detail": "Auto-recall on access, transparent to clients"},
            }
        },
        "D3: Analyze and Monitor": {
            "weight": 0.25,
            "concepts": {
                # File Analytics
                "fa_deployment": {"fact": "Requires dedicated File Analytics VM (FAVM)", "detail": "Must have sufficient cluster resources for FAVM"},
                "fa_dashboard": {"fact": "Dashboard shows file operations, distribution, access patterns", "detail": "Real-time and historical views"},
                "fa_anomaly_detection": {"fact": "Configurable rules detect mass rename/encrypt/delete (ransomware)", "detail": "Alert generation for suspicious patterns"},
                "fa_audit_trails": {"fact": "Tracks who accessed what files, when, what operations", "detail": "Compliance and forensic investigation"},
                "fa_data_age": {"fact": "Data age reporting identifies cold/stale data", "detail": "Drives tiering and archival decisions"},
                "fa_permission_tracking": {"fact": "Identifies overly permissive shares", "detail": "Security audit and remediation"},
                "fa_event_forwarding": {"fact": "Forward events to SIEM systems", "detail": "Integration for centralized security monitoring"},
                # Data Lens
                "datalens_saas": {"fact": "Cloud-based SaaS analytics (no local processing infrastructure)", "detail": "Nutanix cloud processes analytics data"},
                "datalens_sensitive_data": {"fact": "Scans for PII, PHI, PCI data patterns", "detail": "GDPR, HIPAA, PCI-DSS compliance"},
                "datalens_ransomware": {"fact": "Behavioral ransomware detection and alerting", "detail": "Cloud-based analysis of file activity"},
                "datalens_vs_fa": {"fact": "Data Lens = SaaS/cloud; File Analytics = on-prem VM", "detail": "Data Lens adds classification and compliance features"},
                # Prism Monitoring
                "prism_files_metrics": {"fact": "Per-share latency, IOPS, throughput on share detail page", "detail": "Both PE and PC views"},
                "prism_objects_metrics": {"fact": "Bucket-level metrics, capacity utilization, object count", "detail": "Trending for capacity planning"},
                "prism_volumes_metrics": {"fact": "Volume Group performance tab + custom analysis charts", "detail": "Per-VG IOPS, latency, throughput"},
                "controller_vs_network_latency": {"fact": "Controller I/O latency = storage layer; separate from client-to-FSVM network latency", "detail": "Critical for isolating bottleneck location"},
                "fsvm_health": {"fact": "Monitor CPU, memory, network per FSVM", "detail": "High utilization across all FSVMs = need to scale out"},
                "objects_worker_monitoring": {"fact": "Metadata overhead and worker node resource usage", "detail": "Many small objects = high metadata load"},
                "capacity_alerting": {"fact": "Threshold-based alerts and predictive trending", "detail": "Proactive capacity management"},
            }
        },
        "D4: Troubleshoot": {
            "weight": 0.20,
            "concepts": {
                # Files Troubleshooting
                "ts_ad_trust": {"fact": "AD trust/machine account issues cause SMB access failures", "detail": "Verify file server machine account is active in AD"},
                "ts_dns": {"fact": "DNS resolution failures prevent share access", "detail": "Forward and reverse DNS must resolve correctly"},
                "ts_clock_skew": {"fact": "Clock skew >5 minutes breaks Kerberos authentication", "detail": "NTP synchronization critical for SMB/Kerberos"},
                "ts_nfs_mapping": {"fact": "UID/GID mapping issues cause multiprotocol visibility problems", "detail": "Files appear missing or permission denied cross-protocol"},
                "ts_performance_network_vs_storage": {"fact": "Differentiate network latency (client→FSVM) from storage latency (FSVM→DSF)", "detail": "Controller latency metric = storage side"},
                "ts_uneven_distribution": {"fact": "Uneven TLD distribution on distributed shares", "detail": "Check TLD placement and rebalance"},
                "ts_upgrade_failure": {"fact": "Upgrade failures: check pre-check logs, resolve issue, retry", "detail": "Never force upgrade — risk data issues"},
                "ts_post_upgrade_offline": {"fact": "Shares offline after upgrade = FSVM didn't complete upgrade", "detail": "Check FSVM health status first"},
                "ts_logbay": {"fact": "Logbay collects diagnostic logs from CVMs and FSVMs", "detail": "Primary tool for support cases"},
                "ts_minerva_log": {"fact": "minerva_nvm.log on FSVMs = primary log for share operations", "detail": "Most detailed Files troubleshooting log"},
                "ts_fsvm_failure": {"fact": "FSVM failure: VIP failover to surviving FSVMs, data safe in DSF", "detail": "Service resumes when FSVMs recover"},
                # Objects Troubleshooting
                "ts_objects_unreachable": {"fact": "Endpoint unreachable: check DNS, firewall, SSL certificate", "detail": "Service healthy in Prism but clients can't reach"},
                "ts_objects_403": {"fact": "403 Forbidden: bucket policy or IAM policy restriction", "detail": "Valid credentials but policy blocks access"},
                "ts_objects_small_objects": {"fact": "Many small objects = metadata overhead, need more workers", "detail": "Worker nodes overwhelmed by metadata"},
                "ts_objects_pc_mismatch": {"fact": "Post-upgrade issues often = PC version mismatch", "detail": "Always verify PC compatibility before upgrading Objects"},
                # Volumes Troubleshooting
                "ts_volumes_iscsi": {"fact": "iSCSI failures: verify IQN whitelist + CHAP credentials match", "detail": "Both must be correct for connection"},
                "ts_volumes_multipath": {"fact": "Single-path or misconfigured MPIO = performance bottleneck", "detail": "Check session count and path configuration"},
                # General
                "ts_curator": {"fact": "Curator handles tiering, garbage collection, disk balancing", "detail": "Check Curator health if tiering not working"},
                "ts_ncc": {"fact": "NCC health checks verify cluster health for all services", "detail": "Run ncc health_checks run_all for comprehensive check"},
                "ts_container_capacity": {"fact": "Storage container capacity exhaustion affects all services", "detail": "Check container-level, not just cluster-level capacity"},
            }
        }
    }
}

# ---------------------------------------------------------------------------
# NCP-CI 6.10 — Cloud Integration
# ---------------------------------------------------------------------------
EXAMS["NCP-CI"] = {
    "title": "NCP-CI 6.10 — Nutanix Certified Professional: Cloud Integration",
    "format": "75 MCQ | 120 min | Pass: 3000/6000",
    "domains": {
        "D1: Prepare Cloud Environment": {
            "weight": 0.20,
            "concepts": {
                "aws_vpc": {"fact": "NC2 deployed into AWS VPC with subnets, route tables, IGW, NAT GW", "detail": "Standard AWS networking constructs"},
                "aws_subnet_min": {"fact": "Minimum /25 subnet for NC2 host network on AWS", "detail": "128 IPs for bare-metal hosts, CVMs, internal services"},
                "aws_baremetal": {"fact": "EC2 bare-metal instances: i3.metal, i3en.metal (local NVMe SSDs)", "detail": "Direct hardware access, no AWS hypervisor layer"},
                "aws_iam": {"fact": "IAM needs: EC2 bare-metal, VPC networking, CloudFormation permissions", "detail": "Service account for NC2 provisioning"},
                "aws_direct_connect": {"fact": "Direct Connect = dedicated private link, lowest latency to on-prem", "detail": "More consistent than VPN over internet"},
                "aws_vpn": {"fact": "Site-to-site VPN = IPsec over internet, variable performance", "detail": "Lower cost but less consistent than Direct Connect"},
                "aws_quota": {"fact": "Bare-metal instance quotas must be requested (not default)", "detail": "Deployment fails if quotas insufficient"},
                "aws_outbound_https": {"fact": "Outbound HTTPS (443) required for Nutanix management plane", "detail": "Security groups must allow this"},
                "azure_vnet": {"fact": "Azure VNet = AWS VPC equivalent for NC2", "detail": "Subnets, NSGs, route tables"},
                "azure_baremetal": {"fact": "Azure BareMetal Infrastructure for NC2 hosts", "detail": "Physical servers provisioned into Azure subscription"},
                "azure_rbac": {"fact": "Contributor role on resource group for NC2 service principal", "detail": "Required for creating/managing infrastructure"},
                "azure_expressroute": {"fact": "ExpressRoute = private peering, MACsec encryption option", "detail": "Dedicated connection, Azure equivalent of Direct Connect"},
                "nc2_subscription": {"fact": "Subscribe via AWS Marketplace or Nutanix portal", "detail": "First step before any deployment"},
                "dns_requirements": {"fact": "Forward + reverse DNS for CVMs, Prism Element, Prism Central", "detail": "Required for cluster services and management"},
                "same_az": {"fact": "All NC2 nodes must be in same AWS Availability Zone", "detail": "Cross-AZ not supported due to latency requirements"},
                "megaport_sdwan": {"fact": "Megaport and SD-WAN as alternative connectivity options", "detail": "Beyond Direct Connect and VPN"},
                "azure_flow_gateway": {"fact": "Flow Gateway VMs handle north-south traffic on Azure", "detail": "ECMP scale-out up to 4 gateways, BGP with Azure Route Server"},
                "hub_spoke_azure": {"fact": "Hub-and-spoke: ExpressRoute terminates in hub VNet, NC2 in spoke", "detail": "VNet peering or Virtual WAN connects them"},
            }
        },
        "D2: Deploy NC2": {
            "weight": 0.20,
            "concepts": {
                "deploy_stack": {"fact": "Each bare-metal host gets AHV + CVM + Prism Element", "detail": "Full Nutanix stack, identical to on-premises"},
                "min_nodes": {"fact": "Minimum 3 nodes per NC2 cluster", "detail": "For data redundancy and quorum"},
                "deploy_workflow": {"fact": "NC2 provisioned via Nutanix Cloud Manager portal", "detail": "Automated: CloudFormation (AWS) or ARM templates (Azure)"},
                "storage_local_nvme": {"fact": "Uses local NVMe SSDs managed by DSF, NOT EBS/Blob", "detail": "Same storage experience as on-premises with dedup, compression, RF"},
                "pc_registration": {"fact": "Prism Central registered post-deployment", "detail": "Can be on-prem or cloud-based PC"},
                "cvm_internal_network": {"fact": "CVM-to-CVM communication on internal cluster network", "detail": "Host subnet, not public internet"},
                "containers_via_prism": {"fact": "Storage containers created through Prism Element", "detail": "Same as on-premises workflow"},
                "post_deploy_validation": {"fact": "Verify with Prism dashboard + NCC health checks", "detail": "First action after deployment completes"},
                "deploy_troubleshoot_logs": {"fact": "NC2 portal logs are primary for deployment failures", "detail": "Supplemented by CloudTrail (AWS) or Activity Log (Azure)"},
                "quota_exceeded": {"fact": "Quota exceeded = request increase from cloud provider support", "detail": "Common deployment blocker"},
                "node_config": {"fact": "Node configuration during cluster creation", "detail": "CPU, memory, storage allocation per node"},
            }
        },
        "D3: Networking and Security": {
            "weight": 0.20,
            "concepts": {
                "vpc_peering": {"fact": "VPC Peering (1:1) or Transit Gateway (hub-spoke) for cross-VPC", "detail": "TGW for connecting multiple VPCs to NC2"},
                "vnet_peering": {"fact": "VNet Peering or Azure Virtual WAN for cross-VNet", "detail": "Similar to AWS VPC Peering/TGW"},
                "dual_layer_security": {"fact": "AWS SGs + Nutanix Flow BOTH apply (dual-layer)", "detail": "Traffic must pass both layers"},
                "flow_microsegmentation": {"fact": "Flow Network Security at AHV level, independent of cloud provider", "detail": "Same microsegmentation as on-premises"},
                "flow_virtual_networking": {"fact": "Overlay VPCs/subnets managed by Nutanix, NAT/No-NAT modes", "detail": "Integrates with cloud routing tables"},
                "hybrid_dns": {"fact": "DNS forwarding between cloud and on-prem DNS servers", "detail": "NC2 VMs resolve both cloud and on-prem hostnames"},
                "prism_port_9440": {"fact": "Prism management console on port 9440 (HTTPS)", "detail": "NSG/SG must allow access"},
                "private_management": {"fact": "VPN or Direct Connect/ExpressRoute for secure Prism access", "detail": "Never expose Prism to public internet"},
                "management_plane_connectivity": {"fact": "Persistent outbound HTTPS to Nutanix portal required", "detail": "Loss = portal operations unavailable, cluster continues"},
                "nsg_config": {"fact": "Azure NSGs for network filtering on NC2 subnets", "detail": "Inbound and outbound rules per subnet"},
                "route_table_dc": {"fact": "VPC route tables point on-prem traffic to Direct Connect VGW", "detail": "Required for hybrid routing"},
            }
        },
        "D4: Manage Clusters": {
            "weight": 0.20,
            "concepts": {
                "scale_via_portal": {"fact": "Add/remove nodes via Nutanix Cloud Manager portal", "detail": "Automated provisioning, NOT AWS Auto Scaling"},
                "upgrade_lcm": {"fact": "LCM through Prism for upgrades, same as on-premises", "detail": "Rolling updates maintain availability"},
                "monitor_prism_primary": {"fact": "Prism is primary monitoring, cloud tools supplement", "detail": "CloudWatch/Azure Monitor for infrastructure-level visibility"},
                "cost_management": {"fact": "Cloud provider cost tools + Nutanix license portal", "detail": "Both needed for total cost visibility"},
                "licensing": {"fact": "Cloud-based licensing via Nutanix portal (term or consumption)", "detail": "Not hardware-based licenses"},
                "node_failure": {"fact": "NC2 provisions replacement bare-metal, rejoins cluster", "detail": "Automated recovery from hardware failure"},
                "vm_migration_move": {"fact": "Nutanix Move for VM migration between on-prem and NC2", "detail": "Automated with minimal downtime"},
                "backup_same_as_onprem": {"fact": "Native snapshots + PDs + third-party (Veeam/HYCU)", "detail": "Same backup methods as on-premises"},
                "leap_dr": {"fact": "Nutanix Leap for cross-region or cross-cloud DR", "detail": "Recovery plans, test/planned/unplanned failover"},
                "management_plane_loss": {"fact": "Cluster continues operating if management plane connectivity lost", "detail": "Portal operations unavailable but VMs keep running"},
                "az_failure_impact": {"fact": "Single AZ = entire NC2 cluster affected by AZ failure", "detail": "DR to another AZ/region is essential"},
                "vm_portability": {"fact": "VMs portable between on-prem and NC2 without conversion", "detail": "Identical AHV + AOS stack"},
                "scale_down_cost": {"fact": "Remove nodes during off-peak to reduce costs", "detail": "Add back when demand increases"},
                "maintenance_window": {"fact": "Rolling updates via LCM during low-utilization periods", "detail": "Maintains availability during maintenance"},
            }
        },
        "D5: Integration": {
            "weight": 0.20,
            "concepts": {
                "aws_s3_integration": {"fact": "Access S3 via VPC endpoint + SDK/CLI from within VMs", "detail": "Not mounted as Nutanix Files share"},
                "aws_rds_integration": {"fact": "RDS SG must allow inbound from NC2 subnet CIDR", "detail": "Standard AWS networking rules apply"},
                "azure_blob_integration": {"fact": "Blob via VNet service endpoint + SDK/CLI", "detail": "Private access without public internet"},
                "identity_federation": {"fact": "Extend AD to cloud (AD connector, Azure AD DS, site-to-site replication)", "detail": "Prism authenticates against AD/LDAP"},
                "azure_ad_ds": {"fact": "Prism needs LDAP/Kerberos interface; Azure AD DS provides this", "detail": "Azure AD alone insufficient for Prism auth"},
                "monitoring_integration": {"fact": "Webhook/API from Prism alerts to CloudWatch/Azure Monitor", "detail": "Not natively integrated — custom bridge needed"},
                "terraform_both_providers": {"fact": "Need cloud provider + Nutanix Terraform providers", "detail": "Infrastructure + cluster/VM management"},
                "multi_cloud_dr": {"fact": "NC2 on AWS + NC2 on Azure with Leap for cross-cloud DR", "detail": "Resilience against cloud provider outages"},
                "cloud_bursting": {"fact": "Deploy NC2, migrate VMs with Move during peak, return after", "detail": "Elastic capacity across hybrid"},
                "dsf_vs_cloud_native": {"fact": "NC2 DSF: local NVMe with dedup, compression, RF vs EBS/managed disks", "detail": "Key differentiator for NC2"},
                "cloud_services_consumption": {"fact": "NC2 VMs consume cloud managed services like native VMs", "detail": "RDS, S3, Blob, managed databases all accessible"},
            }
        }
    }
}

# ---------------------------------------------------------------------------
# NCP-AI 6.10 — Artificial Intelligence
# ---------------------------------------------------------------------------
EXAMS["NCP-AI"] = {
    "title": "NCP-AI 6.10 — Nutanix Certified Professional: Artificial Intelligence",
    "format": "75 MCQ | 120 min | Pass: 3000/6000",
    "domains": {
        "D1: Deploy NAI Environment": {
            "weight": 0.25,
            "concepts": {
                "gpu_types": {"fact": "Supported NVIDIA GPUs: A100, H100, L40S, T4", "detail": "GPU type determines model size and inference speed"},
                "gpu_passthrough": {"fact": "GPU passthrough = dedicated physical GPU to VM", "detail": "Full GPU resources, no sharing"},
                "vgpu": {"fact": "NVIDIA vGPU = virtual GPU, shared/flexible allocation", "detail": "Multiple VMs share physical GPU, live migration support"},
                "multi_gpu": {"fact": "Multiple GPUs can be assigned per VM for large models", "detail": "Required for models exceeding single GPU memory"},
                "system_requirements": {"fact": "Minimum cluster size, AOS/PC/NKP version compatibility", "detail": "Compatibility matrix must be verified"},
                "nkp_deployment": {"fact": "NKP path: Kubernetes cluster with NAI deployed on top", "detail": "Requires K8s knowledge (pods, services, ingress)"},
                "non_nkp_deployment": {"fact": "Non-NKP path: simplified without full K8s management", "detail": "Lower barrier to entry"},
                "nai_components": {"fact": "NAI Manager (mgmt plane) + Inference Servers + Model Repository", "detail": "Three core architectural components"},
                "istio_ingress": {"fact": "Istio/Envoy ingress gateway exposes endpoints", "detail": "Handles TLS termination, routing, load balancing"},
                "dns_config": {"fact": "A records pointing to ingress gateway IP for FQDN", "detail": "Required for dashboard and API endpoint access"},
                "tls_certificates": {"fact": "TLS certs for HTTPS; CA-signed recommended for production", "detail": "Self-signed OK for test/dev"},
                "k8s_concepts": {"fact": "Pods, services, ingress, namespaces, PVs, resource limits", "detail": "Fundamental K8s knowledge required for NAI"},
                "storage_requirements": {"fact": "Sufficient storage for model files (10s-100s of GB per LLM)", "detail": "Large models need significant disk space"},
                "air_gapped": {"fact": "Supports untethered/air-gapped/dark site deployment", "detail": "Offline model import for sensitive environments"},
                "ahv_vgpu_drivers": {"fact": "NVIDIA vGPU drivers must be installed on AHV", "detail": "Required for vGPU functionality"},
                "installation_workflow": {"fact": "Prerequisites → install NKP/K8s → deploy NAI → configure DNS/certs → validate", "detail": "Step-by-step ordered process"},
                "network_bandwidth": {"fact": "Sufficient bandwidth for model downloads and API traffic", "detail": "Large model downloads can saturate links"},
            }
        },
        "D2: Configure NAI Environment": {
            "weight": 0.25,
            "concepts": {
                "admin_vs_user": {"fact": "Admin role = full management; Standard user = limited to assigned resources", "detail": "Role-based access control"},
                "rbac": {"fact": "RBAC enforces resource isolation and multi-tenancy", "detail": "Separate namespaces per team"},
                "huggingface_import": {"fact": "Direct integration with HF: requires HF account + API token", "detail": "Model repo name, license acceptance for gated models (e.g., Llama)"},
                "ngc_import": {"fact": "NVIDIA NGC catalog: NIM, NeMo models available", "detail": "Optimized for NVIDIA hardware"},
                "manual_import": {"fact": "Manual upload via NFS, SFTP, local storage", "detail": "For air-gapped or proprietary models"},
                "model_formats": {"fact": "Supported: GGUF, safetensors, ONNX, PyTorch (.pt/.pth)", "detail": "Various quantization levels supported"},
                "model_repository": {"fact": "Centralized storage for imported models with version management", "detail": "Single source of truth for all models"},
                "create_endpoint": {"fact": "Select model → GPU allocation → inference engine → scaling params", "detail": "Endpoint creation workflow"},
                "inference_vllm": {"fact": "vLLM: popular open-source inference engine, fast", "detail": "Good general-purpose choice"},
                "inference_tensorrt": {"fact": "TensorRT-LLM: NVIDIA-optimized inference engine", "detail": "Best performance on NVIDIA GPUs"},
                "api_key_management": {"fact": "API keys: creation, rotation, revocation per endpoint/user", "detail": "Primary authentication mechanism"},
                "endpoint_security": {"fact": "HTTPS/TLS encryption + API key authentication", "detail": "Rate limiting configurable"},
                "gpu_allocation": {"fact": "GPU assignment per endpoint: type and count", "detail": "Memory limits and compute budgets"},
                "preflight_validation": {"fact": "NAI validates GPU/compute resources meet model requirements", "detail": "Before deploying endpoint, checks feasibility"},
                "endpoint_scaling": {"fact": "Instance count for horizontal scaling of inference pods", "detail": "Multiple replicas for throughput"},
                "model_lifecycle": {"fact": "Import → validate → create endpoint → secure → deliver → monitor", "detail": "Full lifecycle management"},
                "multi_tenancy": {"fact": "Isolated namespaces and separate endpoints per team", "detail": "Resource isolation between tenants"},
            }
        },
        "D3: Day 2 Operations": {
            "weight": 0.20,
            "concepts": {
                "app_connectivity": {"fact": "REST API (OpenAI-compatible) for app-to-endpoint connection", "detail": "Standard HTTP/HTTPS calls with API key"},
                "performance_metrics": {"fact": "Tokens/second, latency, queue depth, GPU utilization", "detail": "Key metrics for endpoint health"},
                "monitoring_dashboards": {"fact": "NAI UI dashboards for endpoint usage and performance", "detail": "Real-time and historical views"},
                "access_monitoring": {"fact": "Audit logs for API access, anomaly detection", "detail": "Track who is using which endpoints"},
                "llm_selection": {"fact": "Choose model based on: size, accuracy, speed, use case", "detail": "Smaller models = faster but less capable"},
                "endpoint_scaling_day2": {"fact": "Scale horizontally (more replicas) or vertically (more GPU)", "detail": "Based on demand patterns"},
                "model_updates": {"fact": "Update models by importing new versions, swapping endpoints", "detail": "Versioned model management"},
                "gpu_optimization": {"fact": "GPU sharing, batching, quantization for efficiency", "detail": "Maximize throughput per GPU dollar"},
                "capacity_planning": {"fact": "Monitor GPU utilization trends for capacity forecasting", "detail": "Plan ahead for growth"},
                "pause_resume": {"fact": "Pause endpoints to save resources, resume when needed", "detail": "Cost optimization for intermittent workloads"},
                "api_key_rotation": {"fact": "Regular rotation of API keys for security", "detail": "Revoke old keys after distributing new ones"},
            }
        },
        "D4: Troubleshoot NAI": {
            "weight": 0.15,
            "concepts": {
                "ts_gpu_bottleneck": {"fact": "GPU utilization at 100% = need more GPUs or optimization", "detail": "Check if batching/quantization can help first"},
                "ts_memory_pressure": {"fact": "OOM errors = model too large for allocated GPU memory", "detail": "Need larger GPU or quantized model"},
                "ts_cluster_health": {"fact": "NCC and NAI health checks for cluster-level issues", "detail": "Check K8s node health, etcd, networking"},
                "ts_model_import_fail": {"fact": "Import failures: format issues, size limits, repo connectivity", "detail": "Check network, storage, model format compatibility"},
                "ts_endpoint_creation_fail": {"fact": "Resource conflicts, certificate issues, DNS problems", "detail": "Check GPU availability, ingress config, DNS resolution"},
                "ts_pod_failures": {"fact": "K8s pod failures: image pull errors, resource limits, scheduling", "detail": "kubectl describe pod for detailed error info"},
                "ts_gpu_driver": {"fact": "GPU driver issues and CUDA compatibility problems", "detail": "Driver version must match CUDA toolkit and model requirements"},
                "ts_network_connectivity": {"fact": "Apps can't reach endpoints: DNS, firewall, ingress config", "detail": "Trace path from app → ingress → service → pod"},
                "ts_storage_performance": {"fact": "Slow model loading = storage I/O bottleneck", "detail": "Large models read from disk on startup"},
                "ts_log_collection": {"fact": "K8s logs (kubectl logs), NAI component logs, Logbay", "detail": "Multiple log sources for different layers"},
            }
        },
        "D5: Connect Applications": {
            "weight": 0.15,
            "concepts": {
                "openai_compatible_api": {"fact": "NAI exposes OpenAI-compatible REST API", "detail": "Drop-in replacement for OpenAI API in apps"},
                "api_endpoint_config": {"fact": "Configure: endpoint URL, API key, model name in client app", "detail": "Standard HTTP POST with JSON body"},
                "endpoint_metrics": {"fact": "Request counts, error rates, latency percentiles", "detail": "Monitor from NAI dashboard"},
                "load_balancing": {"fact": "Multiple endpoint replicas for load distribution", "detail": "Ingress gateway handles balancing"},
                "sdk_integration": {"fact": "Python SDK, LangChain, other frameworks compatible", "detail": "OpenAI client library works with NAI endpoints"},
                "rate_limiting": {"fact": "Configurable rate limits per API key or endpoint", "detail": "Prevent abuse and ensure fair usage"},
                "error_handling": {"fact": "Retry strategies for transient errors (429, 503)", "detail": "Exponential backoff recommended"},
                "auth_token_flow": {"fact": "API key in Authorization header for every request", "detail": "Bearer token or custom header format"},
            }
        }
    }
}

# ---------------------------------------------------------------------------
# NCM-MCI 6.10 — Master Multicloud Infrastructure
# ---------------------------------------------------------------------------
EXAMS["NCM-MCI"] = {
    "title": "NCM-MCI 6.10 — Nutanix Certified Master: Multicloud Infrastructure",
    "format": "16-20 live-lab scenarios | 180 min | Performance-based",
    "domains": {
        "D1: Storage Performance": {
            "weight": 0.20,
            "concepts": {
                "write_path": {"fact": "Write I/O → OpLog (SSD) → Extent Store (HDD/SSD)", "detail": "OpLog acts as persistent write buffer for coalescing"},
                "read_path": {"fact": "Read from Unified Cache → Content Cache → Extent Store", "detail": "Cache hierarchy for read acceleration"},
                "stargate": {"fact": "Stargate: I/O manager on each CVM, handles all storage I/O", "detail": "Per-node service, talks to local and remote extent stores"},
                "oplog_sizing": {"fact": "OpLog on SSD tier, size affects write performance", "detail": "Insufficient OpLog = write latency spikes"},
                "curator": {"fact": "Curator: MapReduce for GC, disk balancing, tiering, scrubbing", "detail": "Background maintenance of storage fabric"},
                "dedup_capacity_vs_perf": {"fact": "Capacity dedup (post-process, Curator) vs Performance dedup (inline)", "detail": "Capacity saves space; Performance avoids redundant writes"},
                "compression_inline_post": {"fact": "Inline compression (sequential, at write) vs Post-process (random, Curator)", "detail": "LZ4 default for inline; configurable"},
                "erasure_coding": {"fact": "EC: strip size, overhead calculation, only for cold data", "detail": "Lower overhead than RF2 but higher rebuild time"},
                "ec_vs_rf": {"fact": "RF for hot data (fast rebuild), EC for cold data (space efficient)", "detail": "Don't use EC for latency-sensitive workloads"},
                "storage_containers": {"fact": "Container settings: RF, compression, dedup, EC, encryption", "detail": "Per-container configuration of storage policies"},
                "prism_storage_metrics": {"fact": "IOPS, latency, throughput; controller vs disk latency", "detail": "Controller latency = CVM overhead; disk latency = media"},
                "vdisk_hotspot": {"fact": "Identify hot vDisks consuming disproportionate I/O", "detail": "Prism Analysis for per-vDisk metrics"},
                "ssd_hdd_tiering": {"fact": "SSD tier for hot data, HDD for cold; ILM manages placement", "detail": "Curator moves data between tiers"},
                "competing_workloads": {"fact": "OLTP vs OLAP, VDI vs server: different I/O profiles", "detail": "May need separate containers with different policies"},
                "fingerprinting": {"fact": "SHA-1 fingerprinting for deduplication", "detail": "Identifies duplicate data blocks"},
            }
        },
        "D2: Network Performance": {
            "weight": 0.20,
            "concepts": {
                "ahv_bridges": {"fact": "AHV networking uses OVS bridges (br0, br1, etc.)", "detail": "Virtual switches connecting VMs to physical NICs"},
                "bond_modes": {"fact": "active-backup (failover), balance-slb (hash-based), balance-tcp (LACP)", "detail": "LACP requires switch support"},
                "vlan_config": {"fact": "VLAN tagging and trunking for network segmentation", "detail": "acli net.create with VLAN ID"},
                "flow_vnf": {"fact": "Flow Virtual Networking: VPCs, subnets, overlay (VXLAN/Geneve)", "detail": "Software-defined networking with VTEPs"},
                "flow_microseg": {"fact": "Flow Network Security: policies based on AppType, AppTier, categories", "detail": "Microsegmentation at hypervisor level"},
                "mtu_jumbo": {"fact": "MTU 9000 (jumbo frames) for storage/cluster traffic", "detail": "Must be consistent end-to-end on all switches"},
                "ovs_troubleshoot": {"fact": "OVS debugging: ovs-vsctl show, ovs-ofctl dump-flows", "detail": "Check bridge config, flow rules, port status"},
                "network_visualization": {"fact": "Prism network visualization for traffic flows", "detail": "Identify bandwidth consumers and bottlenecks"},
                "acli_net_commands": {"fact": "acli net.list, net.create, net.update for network mgmt", "detail": "CLI-based network configuration"},
                "packet_troubleshoot": {"fact": "Packet drops, latency: check bond, VLAN, MTU, switch config", "detail": "Layer-by-layer troubleshooting"},
                "ipsec_vpn": {"fact": "IPsec/VPN for encrypted site-to-site connectivity", "detail": "Configured at the Flow VPC level"},
                "uplink_config": {"fact": "Physical NIC configuration, speed negotiation, redundancy", "detail": "Verify link state and negotiated speed"},
            }
        },
        "D3: Advanced Config & Troubleshooting": {
            "weight": 0.25,
            "concepts": {
                # acli
                "acli_vm_create": {"fact": "acli vm.create name=X memory=Y num_vcpus=Z", "detail": "Create VM from command line"},
                "acli_vm_power": {"fact": "acli vm.on / vm.off / vm.force_off / vm.reset", "detail": "VM power state management"},
                "acli_vm_update": {"fact": "acli vm.update name=X memory=Y for resource changes", "detail": "Hot-add if supported"},
                "acli_snapshot": {"fact": "acli snapshot.create vm_name=X snapshot_name=Y", "detail": "Create VM snapshots via CLI"},
                "acli_vm_nic": {"fact": "acli vm.nic_create / vm.nic_list / vm.nic_delete", "detail": "NIC management on VMs"},
                "acli_vm_disk": {"fact": "acli vm.disk_create / vm.disk_list / vm.disk_update", "detail": "Disk management on VMs"},
                # ncli
                "ncli_cluster_info": {"fact": "ncli cluster info / cluster get-params", "detail": "Cluster configuration and status"},
                "ncli_container_list": {"fact": "ncli container list / container create / container edit", "detail": "Storage container management"},
                "ncli_host_list": {"fact": "ncli host list / host get id=X", "detail": "Node inventory and details"},
                "ncli_pd_create": {"fact": "ncli protection-domain create name=X", "detail": "Create Protection Domain for DR"},
                "ncli_storage_pool": {"fact": "ncli storage-pool list / storage-pool get", "detail": "Storage pool inspection"},
                # REST API
                "api_v2_vs_v3": {"fact": "API v2 (older, simpler) vs v3 (intent-based, Prism Central)", "detail": "v3 uses POST for all operations with intent spec"},
                "api_auth": {"fact": "Basic auth (username:password base64) or token-based", "detail": "Authorization header required"},
                "api_vm_crud": {"fact": "GET/POST/PUT/DELETE for VMs, images, clusters, networks", "detail": "RESTful operations on Nutanix resources"},
                # Third-party
                "vcenter_integration": {"fact": "vCenter/SCVMM registration for ESXi/Hyper-V management", "detail": "Prism can manage multi-hypervisor"},
                "ad_ldap_integration": {"fact": "AD/LDAP for authentication, role mapping", "detail": "Configure in Prism Settings"},
                "syslog_snmp": {"fact": "Syslog forwarding and SNMP traps for monitoring integration", "detail": "External alerting and logging"},
                # Security
                "stig_scma": {"fact": "STIG hardening and SCMA for security compliance", "detail": "Automated security configuration checks"},
                "cluster_lockdown": {"fact": "Cluster lockdown: disable SSH, require key-based access", "detail": "Security hardening for production"},
                "certificate_mgmt": {"fact": "Replace default self-signed certs with CA-signed", "detail": "Per-cluster certificate management"},
                # LCM
                "lcm_inventory": {"fact": "LCM inventory: discover available updates", "detail": "Check for AOS, AHV, firmware updates"},
                "lcm_dark_site": {"fact": "LCM dark site: offline update with local web server", "detail": "For air-gapped environments"},
                # Cluster Services
                "genesis": {"fact": "Genesis: service starter, brings up all CVM services", "detail": "Monitors and restarts services"},
                "zookeeper": {"fact": "Zookeeper: distributed config management, leader election", "detail": "Cluster coordination service"},
                "cassandra_medusa": {"fact": "Cassandra (metadata store) + Medusa (Cassandra monitor)", "detail": "Ring-based metadata distribution"},
                # Troubleshooting
                "cvm_maintenance": {"fact": "CVM maintenance mode: graceful restart, I/O redirected", "detail": "cluster stop (graceful) before CVM reboot"},
                "logbay": {"fact": "Logbay for comprehensive log collection", "detail": "logbay collect for support bundles"},
                "ncc_health": {"fact": "NCC: ncc health_checks run_all for full health check", "detail": "Identifies issues across all services"},
                "disk_failure": {"fact": "Disk failure: data rebuilt from replicas/EC automatically", "detail": "Self-healing storage fabric"},
                "node_failure_ha": {"fact": "Node failure: HA restarts VMs on surviving nodes", "detail": "Automatic VM recovery"},
                "metadata_ring": {"fact": "Cassandra ring issues: nodetool for diagnosis", "detail": "Ring repair if inconsistencies found"},
            }
        },
        "D4: VM Performance": {
            "weight": 0.15,
            "concepts": {
                "vcpu_cps": {"fact": "Cores-per-socket affects NUMA topology and licensing", "detail": "Match vCPUs to physical NUMA nodes for best performance"},
                "numa": {"fact": "NUMA awareness: keep VM memory local to its CPU socket", "detail": "Cross-NUMA memory access adds latency"},
                "memory_overcommit": {"fact": "Memory overcommit with balloon driver", "detail": "Reclaim unused VM memory for cluster pool"},
                "affinity_rules": {"fact": "VM affinity (keep together) and anti-affinity (keep apart)", "detail": "HA and performance optimization"},
                "cpu_hotadd": {"fact": "CPU and memory hot-add if guest OS supports", "detail": "Add resources without reboot"},
                "cpu_ready_time": {"fact": "CPU ready time: VM waiting for physical CPU cycles", "detail": "High ready time = CPU contention"},
                "memory_swap": {"fact": "Memory swap = VM exceeding allocated memory", "detail": "Performance killer — add memory or reduce workload"},
                "disk_latency_per_vm": {"fact": "Per-VM disk latency in Prism for I/O bottleneck identification", "detail": "Compare against cluster average"},
                "vm_clone_template": {"fact": "VM clones and templates for rapid provisioning", "detail": "Linked clones save storage"},
                "ngt": {"fact": "Nutanix Guest Tools: VSS snapshots, self-service restore, mobility", "detail": "Install inside guest OS for enhanced features"},
                "virtio_drivers": {"fact": "VirtIO drivers for optimal I/O performance on AHV", "detail": "Must install in Windows guests"},
                "gpu_passthrough_vm": {"fact": "GPU passthrough for GPU-intensive VMs", "detail": "Configure in VM settings via Prism or acli"},
            }
        },
        "D5: BCDR": {
            "weight": 0.20,
            "concepts": {
                "protection_domains": {"fact": "PDs group VMs for snapshot and replication", "detail": "Consistency groups ensure crash-consistent snapshots"},
                "async_replication": {"fact": "Async replication: RPO 1hr+ based on schedule", "detail": "Bandwidth and change rate determine actual RPO"},
                "nearsync": {"fact": "NearSync: sub-minute RPO (every 1-15 seconds)", "detail": "Requires sufficient bandwidth and compatible workloads"},
                "metro_availability": {"fact": "Synchronous replication: RPO=0, requires witness VM", "detail": "Active-active or active-standby with automatic failover"},
                "witness_vm": {"fact": "Witness VM: third-site tiebreaker for Metro Availability", "detail": "Prevents split-brain scenarios"},
                "leap": {"fact": "Leap: DR orchestration with recovery plans and runbooks", "detail": "Automated failover sequences"},
                "leap_test_failover": {"fact": "Test failover: validate DR without impacting production", "detail": "Isolated network for test VMs"},
                "leap_planned_failover": {"fact": "Planned failover: graceful migration with zero data loss", "detail": "Replicates remaining data before switching"},
                "leap_unplanned_failover": {"fact": "Unplanned failover: activate DR site after disaster", "detail": "Some data loss possible (up to last replication point)"},
                "rpo_rto_analysis": {"fact": "RPO (data loss tolerance) and RTO (downtime tolerance)", "detail": "Drive replication strategy selection"},
                "network_mapping": {"fact": "Network mapping in DR plans for different site topologies", "detail": "Map source networks to target networks"},
                "snapshot_retention": {"fact": "Snapshot retention policies: local and remote", "detail": "Balance storage cost vs recovery point granularity"},
                "third_party_backup": {"fact": "Veeam, HYCU, Commvault integration for backups", "detail": "VADP or native API integration"},
                "multi_site_dr": {"fact": "Multi-site DR topologies: 1:1, 1:many, many:1", "detail": "Flexible DR architecture options"},
                "dr_testing": {"fact": "Regular DR testing without impacting production", "detail": "Validate RTO/RPO SLAs are achievable"},
            }
        }
    }
}


def count_combinatorics():
    """Calculate the question space for each exam."""
    results = {}
    for exam_name, exam_data in EXAMS.items():
        total_concepts = 0
        domain_details = []
        for domain_name, domain_data in exam_data["domains"].items():
            n_concepts = len(domain_data["concepts"])
            total_concepts += n_concepts
            domain_details.append((domain_name, n_concepts))

        n_qtypes = len(QUESTION_TYPES)
        raw_combos = total_concepts * n_qtypes
        # Not all combos are valid (e.g., "numeric" doesn't apply to every concept)
        # Estimate ~70% applicability
        estimated_valid = int(raw_combos * 0.70)
        results[exam_name] = {
            "domains": domain_details,
            "total_concepts": total_concepts,
            "question_types": n_qtypes,
            "raw_combinations": raw_combos,
            "estimated_valid": estimated_valid,
            "target_questions": max(320, estimated_valid),
        }
    return results


def generate_questions_for_exam(exam_name: str) -> str:
    """Generate a comprehensive question bank for one exam."""
    exam = EXAMS[exam_name]
    lines = []
    lines.append(f"# {exam['title']} — Question Bank\n")
    lines.append(f"> {exam['format']}")
    lines.append(f"> Generated systematically from {sum(len(d['concepts']) for d in exam['domains'].values())} concepts × {len(QUESTION_TYPES)} question types\n")
    lines.append("---\n")

    q_num = 0

    for domain_name, domain_data in exam["domains"].items():
        lines.append(f"\n## {domain_name}\n")

        for concept_key, concept_data in domain_data["concepts"].items():
            fact = concept_data["fact"]
            detail = concept_data["detail"]

            # Generate multiple question types per concept
            questions = _generate_concept_questions(concept_key, fact, detail, domain_name)
            for q in questions:
                q_num += 1
                lines.append(f"### Q{q_num}")
                lines.append(q["question"])
                lines.append(f"- A) {q['options'][0]}")
                lines.append(f"- B) {q['options'][1]}")
                lines.append(f"- C) {q['options'][2]}")
                lines.append(f"- D) {q['options'][3]}")
                lines.append(f"\n**Answer: {q['answer']}**")
                lines.append(f"{q['explanation']}\n")
                lines.append("---\n")

    lines.append(f"\n*Total Questions: {q_num}*\n")
    return "\n".join(lines)


def _generate_concept_questions(key: str, fact: str, detail: str, domain: str) -> list:
    """Generate 2-4 questions per concept using different question types."""
    questions = []

    # TYPE 1: Direct knowledge
    questions.append(_make_direct_question(key, fact, detail))

    # TYPE 2: Scenario/Best answer
    questions.append(_make_scenario_question(key, fact, detail))

    # TYPE 3: Negative (what is NOT true) — for concepts with enough detail
    if len(detail) > 20:
        questions.append(_make_negative_question(key, fact, detail))

    # TYPE 4: Troubleshooting or architecture depending on domain
    if "Troubleshoot" in domain or "ts_" in key:
        questions.append(_make_troubleshoot_question(key, fact, detail))
    elif "Deploy" in domain or "Config" in domain or "architecture" in key:
        questions.append(_make_architecture_question(key, fact, detail))

    return questions


def _make_direct_question(key: str, fact: str, detail: str) -> dict:
    """Generate a direct recall question."""
    return {
        "question": f"Which statement correctly describes the following Nutanix feature?\n*Context: {fact}*",
        "options": [
            fact,
            _generate_wrong_answer(fact, 1),
            _generate_wrong_answer(fact, 2),
            _generate_wrong_answer(fact, 3),
        ],
        "answer": "A",
        "explanation": f"{fact}. {detail}",
    }


def _make_scenario_question(key: str, fact: str, detail: str) -> dict:
    """Generate a scenario-based question."""
    return {
        "question": f"An administrator needs to address a requirement related to: {fact.lower()}. What is the BEST approach?",
        "options": [
            f"Apply the correct configuration: {detail}",
            _generate_wrong_answer(fact, 4),
            _generate_wrong_answer(fact, 5),
            _generate_wrong_answer(fact, 6),
        ],
        "answer": "A",
        "explanation": f"The correct approach is based on: {fact}. {detail}",
    }


def _make_negative_question(key: str, fact: str, detail: str) -> dict:
    """Generate a 'which is NOT true' question."""
    wrong_statement = _generate_wrong_answer(fact, 7)
    return {
        "question": f"Which statement is NOT true regarding: {fact.lower()}?",
        "options": [
            wrong_statement,
            fact,
            detail,
            f"This feature is relevant in production environments",
        ],
        "answer": "A",
        "explanation": f"'{wrong_statement}' is incorrect. The correct information is: {fact}. {detail}",
    }


def _make_troubleshoot_question(key: str, fact: str, detail: str) -> dict:
    """Generate a troubleshooting question."""
    return {
        "question": f"An administrator encounters an issue. Investigation reveals: {detail}. What should be checked FIRST?",
        "options": [
            f"Verify: {fact}",
            "Reboot the entire cluster",
            "Reinstall the affected component from scratch",
            "Open a support case without further investigation",
        ],
        "answer": "A",
        "explanation": f"The first step is to verify: {fact}. {detail}",
    }


def _make_architecture_question(key: str, fact: str, detail: str) -> dict:
    """Generate an architecture question."""
    return {
        "question": f"Which architectural component or configuration is responsible for: {fact.lower()}?",
        "options": [
            detail,
            "This is handled by the hypervisor kernel module only",
            "This requires third-party software configuration",
            "This is managed at the physical switch level only",
        ],
        "answer": "A",
        "explanation": f"{fact}. {detail}",
    }


# Wrong answer generators — create plausible but incorrect alternatives
_WRONG_PATTERNS = {
    1: lambda f: f.replace("3", "5").replace("minimum", "maximum") if any(c.isdigit() for c in f) else f"This requires manual configuration and is not automated",
    2: lambda f: f"This feature is only available in Prism Central, not Prism Element" if "Prism" not in f else f"This feature requires ESXi hypervisor",
    3: lambda f: f"This is a deprecated feature replaced in AOS 6.0" ,
    4: lambda f: f"Use a third-party tool instead of the native Nutanix feature",
    5: lambda f: f"This can only be configured via REST API, not through Prism or CLI",
    6: lambda f: f"Disable the feature and implement the requirement using a different approach",
    7: lambda f: f"This feature is unlimited and requires no sizing consideration",
}


def _generate_wrong_answer(fact: str, variant: int) -> str:
    """Generate a plausible but wrong answer."""
    gen = _WRONG_PATTERNS.get(variant, lambda f: f"This is not a supported configuration")
    return gen(fact)


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # STEP 1: Print combinatorial analysis
    print("=" * 70)
    print("NUTANIX CERTIFICATION EXAM — COMBINATORIAL ANALYSIS")
    print("=" * 70)
    stats = count_combinatorics()

    grand_total = 0
    for exam_name, s in stats.items():
        print(f"\n{'─' * 50}")
        print(f"  {exam_name}")
        print(f"{'─' * 50}")
        for dname, dcount in s["domains"]:
            print(f"  {dname}: {dcount} concepts")
        print(f"  ────────────────────────────────")
        print(f"  Total concepts:       {s['total_concepts']}")
        print(f"  Question types:       {s['question_types']}")
        print(f"  Raw combinations:     {s['raw_combinations']}")
        print(f"  Est. valid combos:    {s['estimated_valid']}")
        print(f"  Target questions:     {s['target_questions']}")
        grand_total += s["target_questions"]

    print(f"\n{'=' * 70}")
    print(f"  GRAND TOTAL TARGET: {grand_total} questions across all exams")
    print(f"{'=' * 70}\n")

    # STEP 2: Generate question banks
    for exam_name in EXAMS:
        print(f"Generating {exam_name} question bank...")
        content = generate_questions_for_exam(exam_name)
        q_count = content.count("### Q")
        filename = f"{exam_name}-QuestionBank.md"
        filepath = os.path.join(OUTPUT_DIR, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        size_kb = os.path.getsize(filepath) / 1024
        print(f"  ✅ {filename}: {q_count} questions, {size_kb:.1f} KB")

    print(f"\nDone! All files in {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
