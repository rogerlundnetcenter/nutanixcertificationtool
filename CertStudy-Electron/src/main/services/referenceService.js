// referenceService.js — Port of C# CertStudy.Services.ReferenceService
// Provides contextual reference cards and KB links for exam questions
// based on keyword matching against question text and answer options.
// Pure Node.js module — no Electron dependencies.

'use strict';

// ─── Reference Card Data ────────────────────────────────────────────────────
// Each exam code maps to an array of { keywords: string[], reference: string }.

/** @type {Object<string, {keywords: string[], reference: string}[]>} */
const REFERENCE_DATA = Object.freeze({

  // ──── NCP-US ────
  'NCP-US': [
    {
      keywords: ['FSVM', 'File Server', 'Files', 'file server VM'],
      reference:
        '📁 Nutanix Files\n• Min 3 FSVMs for production HA\n• Max 16 FSVMs per file server\n• Each FSVM: 4 vCPU / 12 GB RAM default\n• Requires client-side + storage network\n• Log: minerva_nvm.log\n• Rolling upgrades (one FSVM at a time)\n• Supports SMB and NFS protocols\n• TLD (Top-Level Directory) distribution across FSVMs',
    },
    {
      keywords: ['Objects', 'bucket', 'S3', 'WORM', 'lifecycle'],
      reference:
        '🪣 Nutanix Objects\n• Runs on Microservices Platform (MSP)\n• Min 3 worker nodes\n• S3-compatible API\n• WORM: 24-hour grace period for compliance\n• Lifecycle policies are retroactive\n• Versioning at bucket level\n• Multi-cluster support via Prism Central',
    },
    {
      keywords: ['Volumes', 'iSCSI', 'VG', 'volume group', 'CHAP', 'MPIO'],
      reference:
        '💾 Nutanix Volumes\n• iSCSI block storage\n• CHAP authentication supported\n• VG load balancing via acli\n• MPIO multipath for Windows/Linux\n• External client access via Data Services IP\n• Max 64 disks per VG\n• Supports live migration of VGs',
    },
    {
      keywords: ['Data Lens', 'Analytics', 'audit', 'File Analytics'],
      reference:
        '📊 Data Lens & File Analytics\n• Data Lens: SaaS cloud-based, multi-cluster\n• File Analytics: on-prem VM, per file server\n• Audit trails for file access\n• Anomaly detection (ransomware)\n• Dashboard for capacity & usage trends\n• Data age analysis\n• Permission reporting',
    },
    {
      keywords: ['share', 'SMB', 'NFS', 'export', 'TLD', 'DFS', 'tiering'],
      reference:
        '📂 Shares & Exports\n• SMB: Standard & Distributed shares\n• Distributed = TLD sharding across FSVMs\n• NFS: Nested mount points supported\n• DFS namespace for Windows integration\n• Home directory support\n• SSR (Self-Service Restore) snapshots\n• Quotas at share/user level\n• Smart Tiering: Move cold data to S3-compatible object storage',
    },
    {
      keywords: ['snapshot', 'replication', 'protection', 'DR', 'recovery'],
      reference:
        '🔄 Data Protection (Files/Objects)\n• Snapshot-based replication\n• SmartDR for Files failover\n• RPO configurable per share\n• Active-passive replication\n• Planned & unplanned failover\n• Reverse replication on failback',
    },
    {
      keywords: ['upgrade', 'LCM', 'deploy', 'provision'],
      reference:
        '⬆️ Deployment & Upgrades\n• LCM (Life Cycle Manager) for upgrades\n• Rolling upgrades minimize downtime\n• Pre-upgrade checks automatic\n• Foundation for initial deployment\n• 1-click upgrades via Prism',
    },
    {
      keywords: ['DNS', 'A record', 'VIP', 'virtual IP', 'FSVM VIP', 'name resolution', 'client access', 'hostname'],
      reference:
        '🌐 Files Networking & DNS\n• Each FSVM requires DNS A record for client access\n• File server VIP must have valid DNS A record\n• DNS resolution critical for SMB share access\n• FSVM client-side IP must be resolvable by clients\n• A records map FSVM hostname → IP addresses\n• Multiple FSVMs load-balance via DNS round-robin\n• Intermittent access failures often due to missing DNS entries',
    },
    {
      keywords: ['Active Directory', 'Kerberos', 'computer account', 'domain', 'NTLM', 'AD', 'domain joined', 'password sync', 'authentication'],
      reference:
        '🔐 Files Active Directory & Kerberos\n• File server must be domain-joined to Active Directory\n• Computer account in AD required for Kerberos auth\n• Computer account password must be synchronized\n• Missing/deleted AD account causes auth failures\n• Kerberos requires both user AND computer account\n• NTLM fallback if Kerberos unavailable\n• Verify computer account exists and password is synced',
    },
    {
      keywords: ['NTLMv1', 'NTLMv2', 'SMB signing', 'CIFS', 'legacy', 'signing negotiation'],
      reference:
        '🔒 SMB Authentication & Signing\n• NTLMv2 preferred over legacy NTLMv1\n• Legacy clients (Windows 7) may only support NTLMv1\n• SMB signing ensures message integrity\n• SMB signing required: disables legacy NTLM\n• Linux CIFS clients may need signing explicitly enabled\n• Verify NTLM authentication level on both server and client',
    },
    {
      keywords: ['afs info', 'afs command', 'AFS CLI', 'FSVM flavor', 'FSVM status', 'FSVM diagnostics', 'AFS'],
      reference:
        "📁 FSVM Diagnostics & CLI\n• 'afs info.list': Get FSVM deployment information\n• 'afs info' subcommands: FSVM status and configuration\n• Use AFS CLI for FSVM diagnostics via SSH\n• FSVM must be powered on and SSH accessible\n• Prism health checks validate minerva_nvm service\n• minerva_nvm.log: Primary source for service errors",
    },
    {
      keywords: ['NCC', 'ncc log_collector', 'logbay', 'diagnostic', 'logs', 'support bundle', 'debug'],
      reference:
        '🔧 NCC Diagnostic Tools\n• NCC (Nutanix Cluster Check): Diagnostic utility\n• \'ncc log_collector run_all\': Generate diagnostic bundle\n• logbay: Centralized log collection and upload\n• Diagnostic bundles required for support portal\n• Log files essential for root cause analysis\n• Regular log collection prevents data loss',
    },
  ],

  // ──── NCP-CI ────
  'NCP-CI': [
    {
      keywords: ['AWS', 'i3', 'VPC', 'Direct Connect', 'NVMe', 'EC2'],
      reference:
        '☁️ NC2 on AWS\n• Uses i3.metal bare-metal instances\n• VPC requires /25 subnet minimum\n• All nodes must be in same AZ\n• Direct Connect for hybrid connectivity\n• Local NVMe storage (NOT EBS)\n• Foundation not needed\n• No nested virtualization',
    },
    {
      keywords: ['Azure', 'BareMetal', 'delegated', 'Route Server', 'ECMP', 'BGP'],
      reference:
        '☁️ NC2 on Azure\n• Uses Azure BareMetal infrastructure\n• Delegated subnet required\n• Flow Gateway VMs for routing\n• ECMP max 4 paths\n• BGP peering with Azure Route Server\n• ExpressRoute for hybrid connectivity',
    },
    {
      keywords: ['NC2', 'cloud', 'hybrid', 'subscription', 'license', 'hibernate'],
      reference:
        '🌐 Nutanix Cloud Clusters (NC2)\n• Runs full AOS + AHV stack\n• Foundation NOT needed (pre-imaged)\n• Subscription-based licensing\n• Node hibernation to save costs\n• Prism Central for management\n• Same Nutanix features as on-prem',
    },
    {
      keywords: ['Leap', 'failover', 'recovery', 'DR', 'Move', 'migration'],
      reference:
        '🔄 DR & Migration\n• Leap spans on-prem ↔ NC2\n• Nutanix Move for VM migration\n• Planned failover: graceful, no data loss\n• Unplanned failover: immediate, possible RPO gap\n• Recovery plans define VM order & networks',
    },
    {
      keywords: ['Flow', 'networking', 'VPN', 'subnet', 'gateway'],
      reference:
        '🌐 Cloud Networking\n• Flow Virtual Networking for overlay\n• VPN Gateway for site-to-site\n• VTEP tunnels between sites\n• Subnet extension for DR\n• Network segmentation policies',
    },
    {
      keywords: ['cost', 'TCO', 'billing', 'node', 'scale'],
      reference:
        '💰 Cost & Scaling\n• Per-node subscription pricing\n• Hibernate nodes to reduce costs\n• Scale out/in based on demand\n• No upfront hardware purchase\n• Metered billing options',
    },
  ],

  // ──── NCP-AI ────
  'NCP-AI': [
    {
      keywords: ['GPU', 'A100', 'H100', 'L40S', 'T4', 'passthrough', 'vGPU'],
      reference:
        '🎮 GPU Support\n• A100: 80GB HBM2e — training & large inference\n• H100: 80GB HBM3 — latest gen, highest perf\n• L40S: 48GB GDDR6 — inference optimized\n• T4: 16GB GDDR6 — entry-level inference\n• GPU passthrough via AHV\n• vGPU profiles for sharing\n• NVIDIA driver required in guest VM',
    },
    {
      keywords: ['NAI', 'NKP', 'Kubernetes', 'operator', 'inference'],
      reference:
        '🤖 Nutanix AI (NAI)\n• Runs on NKP (Nutanix Kubernetes Platform)\n• NAI Operator manages lifecycle\n• Inference endpoints auto-scaled\n• Model serving via containers\n• Supports vLLM and TensorRT-LLM engines\n• Health checks and auto-recovery',
    },
    {
      keywords: ['model', 'HuggingFace', 'NGC', 'quantiz', 'FP16', 'INT8', 'INT4', 'LoRA', 'fine-tun', 'gated', 'access token', 'license', 'llama'],
      reference:
        '🧠 Model Management & Access\n• Sources: HuggingFace, NVIDIA NGC, manual upload\n• Gated models (Llama 2, etc.) require HuggingFace access token\n• Model licensing and access control via Hub\n• Quantization: FP16 → INT8 → INT4 (smaller = faster)\n• LoRA: Low-Rank Adaptation fine-tuning\n• Model size determines GPU requirements\n• 7B params ≈ 14GB FP16 / 7GB INT8 / 3.5GB INT4',
    },
    {
      keywords: ['API', 'OpenAI', 'endpoint', 'chat', 'completion', 'token', 'SSE', 'streaming'],
      reference:
        '🔌 API & Integration\n• OpenAI-compatible REST API\n• Endpoint: /v1/chat/completions\n• Bearer token authentication\n• SSE (Server-Sent Events) for streaming\n• Temperature, top_p, max_tokens params\n• System/user/assistant message roles',
    },
    {
      keywords: ['vLLM', 'TensorRT', 'serving', 'engine', 'batch'],
      reference:
        '⚡ Inference Engines\n• vLLM: Open-source, PagedAttention\n• TensorRT-LLM: NVIDIA optimized\n• Continuous batching for throughput\n• KV-cache management\n• Tensor parallelism across GPUs',
    },
    {
      keywords: ['RAG', 'retrieval', 'vector', 'embedding', 'context'],
      reference:
        '📚 RAG (Retrieval-Augmented Generation)\n• Combines search with generation\n• Vector embeddings for similarity\n• Context window augmentation\n• Reduces hallucination\n• Enterprise knowledge integration',
    },
    {
      keywords: ['timeout', 'configuration', 'request timeout', 'long-running', 'inference timeout', 'max_tokens', 'settings'],
      reference:
        '⚙️ Inference Configuration\n• Request timeout for long-running inference\n• max_tokens parameter limits response length\n• Temperature, top_p for response quality tuning\n• Streaming vs batch configurations\n• Server-side timeout policies in NAI config\n• Client-side timeout handling best practices',
    },
    {
      keywords: ['capacity', 'planning', 'GPU count', 'concurrent', 'throughput', 'scaling', 'provisioning', 'sizing'],
      reference:
        '📊 Capacity Planning & GPU Sizing\n• GPU count = (concurrent_users × avg_tokens) / GPU_throughput\n• Throughput varies by model size, quantization, batch size\n• vLLM continuous batching improves GPU utilization\n• Concurrent user limits depend on context window\n• Over-provision for peak load and failover\n• Monitor GPU memory and utilization for scaling',
    },
  ],

  // ──── NCM-MCI ────
  'NCM-MCI': [
    {
      keywords: ['DSF', 'OpLog', 'Unified Cache', 'Curator', 'EC-X', 'Stargate', 'extent'],
      reference:
        '💿 Distributed Storage Fabric (DSF)\n• OpLog: SSD-based write buffer (coalescing)\n• Unified Cache: single-tier read cache\n• Curator: background garbage collection, EC\n• EC-X: Erasure Coding (space efficient vs RF)\n• Stargate: I/O manager (port 2009)\n• Extent store on SSD/HDD tiers\n• Data locality: keep data on same node as VM',
    },
    {
      keywords: ['AHV', 'bridge', 'bond', 'LACP', 'active-backup', 'balance-slb', 'OVS'],
      reference:
        '🌐 AHV Networking\n• OVS (Open vSwitch) based\n• Bond modes: active-backup, balance-slb, LACP\n• Default: active-backup (no switch config)\n• balance-slb: TX load balancing\n• LACP: requires switch support, best throughput\n• br0 = management bridge\n• br1+ = VM network bridges',
    },
    {
      keywords: ['acli', 'ncli', 'genesis', 'zeus', 'CLI'],
      reference:
        '⌨️ CLI Reference\n• acli: AHV management (vm.*, net.*)\n• ncli: cluster management (cluster/container/host)\n• genesis: service lifecycle manager\n• zeus_config_printer: Zookeeper config dump\n• nuclei: Prism Central CLI\n• All run from any CVM via SSH',
    },
    {
      keywords: ['Stargate', 'Prism', 'Curator', 'Medusa', 'Cassandra', 'port', 'service'],
      reference:
        '🔧 Core Services & Ports\n• Stargate: 2009 (I/O path)\n• Prism: 9080 (web UI)\n• Curator: 2010 (background tasks)\n• Medusa/Cassandra: metadata store\n• Zookeeper: cluster config consensus\n• Genesis: service auto-restart\n• Cerebro: replication manager',
    },
    {
      keywords: ['Async', 'NearSync', 'Sync', 'RPO', 'Leap', 'BCDR', 'recovery', 'protection', 'replicate'],
      reference:
        '🔄 BCDR Tiers\n• Async: RPO 1 hour+ (snapshot-based)\n• NearSync: RPO 1–15 min (journal-based)\n• Sync: Zero RPO (write acknowledged both sites)\n• Leap: orchestrated DR recovery plans\n• Metro Availability: active-active stretch\n• Witness VM for split-brain protection',
    },
    {
      keywords: ['Flow', 'microseg', 'VPC', 'security', 'policy'],
      reference:
        '🛡️ Flow Networking\n• Microsegmentation: app-centric policies\n• VPC: isolated virtual networks\n• Categories for policy grouping\n• AppType, AppTier, Environment categories\n• Monitor → Apply mode transition\n• Visualization for traffic analysis',
    },
    {
      keywords: ['LCM', 'upgrade', 'Foundation', 'imaging', 'AOS'],
      reference:
        '⬆️ Lifecycle & Imaging\n• LCM: one-click upgrades (AOS, AHV, firmware)\n• Foundation: initial node imaging\n• Pre-upgrade checks automated\n• Rolling upgrades for zero downtime\n• Compatibility matrix enforcement',
    },
    {
      keywords: ['Prism Central', 'Prism Element', 'PC', 'PE', 'category', 'alert'],
      reference:
        '🖥️ Prism Management\n• Prism Element (PE): per-cluster management\n• Prism Central (PC): multi-cluster management\n• Categories for tagging/grouping\n• Custom dashboards and reports\n• Alert policies and SNMP\n• Role-Based Access Control (RBAC)\n• Analysis dashboard for capacity planning',
    },
    {
      keywords: ['VM', 'vCPU', 'memory', 'NUMA', 'affinity', 'vMotion', 'live migration', 'CPU ready', 'memory ballooning', 'overcommit', 'NGT', 'VSS', 'vDisk', 'affinity rule'],
      reference:
        '🖥️ VM Performance & Configuration\n• CPU ready time >10%: VM vCPU contention\n• NUMA: Keep vCPUs & memory local to socket\n• Memory ballooning: Host reclaiming VM memory; indicates overcommit\n• vMotion: Live VM migration between hosts\n• VM affinity: Hard (enforce) vs Soft (prefer)\n• NGT VSS: Application-consistent Windows snapshots\n• vDisk: Per-disk IOPS & latency tuning\n• Overcommit ratio: Typical 2:1 CPU',
    },
    {
      keywords: ['v3 API', 'REST', 'v2.0 API', 'HTTP', 'POST', 'GET', 'PUT', 'DELETE', 'endpoint', 'JSON', 'pagination', 'offset', 'sort_order', 'sort_attribute'],
      reference:
        '🔌 Nutanix REST API v3\n• Intent-based v3 API uses POST for all list operations\n• POST /api/nutanix/v3/vms: create VM\n• GET /api/nutanix/v3/vms/{uuid}: get details\n• PUT /api/nutanix/v3/vms/{uuid}: update VM\n• Pagination: {kind, length, offset, sort_order, sort_attribute}\n• v2.0 API: legacy, uses REST conventions (GET for list)\n• Bearer token auth: Authorization: Bearer {token}',
    },
    {
      keywords: ['performance tuning', 'latency', 'IOPS', 'throughput', 'optimization', 'capacity planning', 'CPU runway', 'storage runway', 'QoS', 'hot vDisk'],
      reference:
        '⚡ Performance Tuning & Capacity\n• CPU ready time: Prism > Dashboard > Host CPU\n• Per-vDisk latency: Prism > Storage > Volume Groups\n• Capacity runway: Prism > Analysis > CPU/Storage forecast\n• QoS per-container: Throttle IOPS to protect workloads\n• Workload isolation: Separate containers for OLTP vs VDI\n• Safe CPU alloc: Physical cores × utilization ÷ overcommit ratio',
    },
    {
      keywords: ['deduplication', 'compression', 'inline', 'post-process', 'EC savings', 'storage container', 'RF2', 'RF3', 'replication factor', 'ILM', 'tiering', 'shadow clone', 'data reduction'],
      reference:
        '💾 Storage Advanced Features\n• Dedup: Fingerprint-based, works with compression\n• Inline compression: Real-time (LZ4), low latency\n• Post-process compression: Delayed, higher ratio\n• EC-X: Space efficient (1.3:1 vs RF2 2:1)\n• RF2 = 2x space, 1 fault; RF3 = 3x space, 2 fault\n• ILM: Auto-move cold data to HDD tier\n• Shadow Clones: VDI read-only cache (>30% read ops)',
    },
    {
      keywords: ['metrics', 'monitoring', 'dashboard', 'health check', 'NCC', 'statistics', 'alerting', 'SNMP', 'cache hit rate', 'replication lag'],
      reference:
        '📊 Metrics & Monitoring\n• Prism dashboards: CPU, memory, storage, latency, IOPS\n• Cache hit rate: Unified Cache hits ÷ total reads\n• NCC health checks: run filtered by category\n• Pending snapshots: Leap > Protection Domains > Job Status\n• Replication lag: snapshot creation vs replication rate\n• Data reduction ratio: Prism > Storage > Containers',
    },
    {
      keywords: ['STIG', 'hardening', 'compliance', 'SCMA', 'encryption', 'SSH', 'key-based auth', 'cluster lockdown', 'password policy', 'RBAC', 'audit'],
      reference:
        '🛡️ Security & Hardening\n• Cluster lockdown: Enforce key-based SSH via Prism > Security\n• STIG compliance: Nutanix STIG/CIS benchmarks\n• Encryption: Data at rest (containers) + in transit (TLS)\n• RBAC: Role-based access via Prism > Administration > Roles\n• Audit logging: Track admin actions and file access\n• Password policies: Min length, complexity, expiration',
    },
    {
      keywords: ['X-Ray', 'benchmark', 'workload simulation', 'stress test', 'performance baseline'],
      reference:
        '📈 X-Ray Benchmarking\n• X-Ray: Official Nutanix workload simulation tool\n• Workloads: VDI, OLTP, OLAP, web tier\n• Baseline: Before/after optimization comparison\n• Output: IOPS, latency, throughput reports\n• Portal: x-ray.nutanix.com',
    },
  ],
});

// ─── KB / Documentation Link Mappings ───────────────────────────────────────
// Each exam code maps to an array of { keywords, title, url }.

/** @type {Object<string, {keywords: string[], title: string, url: string}[]>} */
const KB_LINKS = Object.freeze({

  // ──── NCP-US ────
  'NCP-US': [
    {
      keywords: ['FSVM', 'file server', 'files', 'SMB', 'NFS', 'share', 'minerva', 'TLD', 'distributed', 'export', 'home directory', 'SSR', 'self-service'],
      title: 'Nutanix Files Administration Guide',
      url: 'https://portal.nutanix.com/page/documents/details?targetId=Files-v4_5:fil-files-administration-c.html',
    },
    {
      keywords: ['Objects', 'bucket', 'S3', 'WORM', 'lifecycle', 'object store', 'MSP', 'versioning'],
      title: 'Nutanix Objects Guide',
      url: 'https://portal.nutanix.com/page/documents/details?targetId=Objects-v4_3:top-objects-guide-c.html',
    },
    {
      keywords: ['Volumes', 'iSCSI', 'VG', 'volume group', 'CHAP', 'MPIO', 'block storage', 'data services IP'],
      title: 'Nutanix Volumes Guide',
      url: 'https://portal.nutanix.com/page/documents/details?targetId=Volumes-Guide-v4_7:vol-volumes-overview-c.html',
    },
    {
      keywords: ['Data Lens', 'data lens', 'SaaS', 'cloud analytics', 'multi-cluster analytics'],
      title: 'Nutanix Data Lens Guide',
      url: 'https://portal.nutanix.com/page/documents/details?targetId=Data-Lens:top-data-lens-overview.html',
    },
    {
      keywords: ['File Analytics', 'analytics', 'audit', 'anomaly', 'ransomware', 'dashboard', 'permission', 'data age'],
      title: 'Nutanix File Analytics Guide',
      url: 'https://portal.nutanix.com/page/documents/details?targetId=File-Analytics-v3_2:ana-file-analytics-overview-c.html',
    },
    {
      keywords: ['snapshot', 'replication', 'protection', 'DR', 'recovery', 'SmartDR', 'failover', 'RPO'],
      title: 'Nutanix Files Administration — Data Protection',
      url: 'https://portal.nutanix.com/page/documents/details?targetId=Files-v4_5:fil-files-administration-c.html',
    },
    {
      keywords: ['upgrade', 'LCM', 'deploy', 'provision', 'foundation'],
      title: 'Nutanix Files Administration — Deployment',
      url: 'https://portal.nutanix.com/page/documents/details?targetId=Files-v4_5:fil-files-administration-c.html',
    },
  ],

  // ──── NCP-CI ────
  'NCP-CI': [
    {
      keywords: ['AWS', 'i3', 'VPC', 'Direct Connect', 'NVMe', 'EC2', 'bare metal', 'NC2 AWS'],
      title: 'NC2 on AWS — Getting Started',
      url: 'https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html',
    },
    {
      keywords: ['Azure', 'BareMetal', 'delegated', 'Route Server', 'ECMP', 'BGP', 'ExpressRoute', 'NC2 Azure'],
      title: 'NC2 on Azure — Getting Started',
      url: 'https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-Azure:nc2-azure-getting-started-c.html',
    },
    {
      keywords: ['Move', 'migration', 'migrate', 'V2V', 'VM migration', 'cutover'],
      title: 'Nutanix Move Guide',
      url: 'https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Move-v4_9:top-nutanix-move-overview.html',
    },
    {
      keywords: ['Flow', 'networking', 'VPN', 'subnet', 'gateway', 'overlay', 'VTEP', 'virtual networking'],
      title: 'Flow Virtual Networking Guide',
      url: 'https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Flow-Networking-Guide:flow-networking-overview-c.html',
    },
    {
      keywords: ['NC2', 'cloud cluster', 'hybrid', 'subscription', 'license', 'hibernate', 'cloud clusters'],
      title: 'NC2 on AWS — Cloud Clusters Overview',
      url: 'https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html',
    },
    {
      keywords: ['Leap', 'failover', 'recovery', 'DR', 'disaster', 'protection', 'recovery plan'],
      title: 'NC2 on AWS — Disaster Recovery',
      url: 'https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html',
    },
    {
      keywords: ['cost', 'TCO', 'billing', 'node', 'scale', 'pricing', 'metered'],
      title: 'NC2 on AWS — Licensing & Scaling',
      url: 'https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-AWS:aws-aws-getting-started-c.html',
    },
  ],

  // ──── NCP-AI ────
  'NCP-AI': [
    {
      keywords: ['NAI', 'GPT-in-a-Box', 'inference', 'AI', 'model serving', 'endpoint'],
      title: 'Nutanix AI (NAI) Overview',
      url: 'https://portal.nutanix.com/page/documents/details?targetId=Nutanix-AI-v1_0:top-nutanix-ai-overview.html',
    },
    {
      keywords: ['NKP', 'Kubernetes', 'operator', 'platform', 'cluster', 'kubectl'],
      title: 'Nutanix Kubernetes Platform (NKP) Guide',
      url: 'https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Kubernetes-Platform-v2_11:top-overview.html',
    },
    {
      keywords: ['GPU', 'A100', 'H100', 'L40S', 'T4', 'passthrough', 'vGPU', 'NVIDIA', 'graphics'],
      title: 'AHV GPU Passthrough Guide',
      url: 'https://portal.nutanix.com/page/documents/details?targetId=AHV-Admin-Guide-v6_10:ahv-gpu-passthrough-c.html',
    },
    {
      keywords: ['model', 'HuggingFace', 'NGC', 'quantiz', 'FP16', 'INT8', 'INT4', 'LoRA', 'fine-tun', 'training'],
      title: 'Nutanix AI — Model Management',
      url: 'https://portal.nutanix.com/page/documents/details?targetId=Nutanix-AI-v1_0:top-nutanix-ai-overview.html',
    },
    {
      keywords: ['vLLM', 'TensorRT', 'serving', 'engine', 'batch', 'PagedAttention'],
      title: 'Nutanix AI — Inference Engines',
      url: 'https://portal.nutanix.com/page/documents/details?targetId=Nutanix-AI-v1_0:top-nutanix-ai-overview.html',
    },
    {
      keywords: ['RAG', 'retrieval', 'vector', 'embedding', 'context', 'hallucination'],
      title: 'Nutanix AI — RAG Overview',
      url: 'https://portal.nutanix.com/page/documents/details?targetId=Nutanix-AI-v1_0:top-nutanix-ai-overview.html',
    },
    {
      keywords: ['API', 'OpenAI', 'endpoint', 'chat', 'completion', 'token', 'SSE', 'streaming', 'REST'],
      title: 'Nutanix AI — API Reference',
      url: 'https://portal.nutanix.com/page/documents/details?targetId=Nutanix-AI-v1_0:top-nutanix-ai-overview.html',
    },
  ],

  // ──── NCM-MCI ────
  'NCM-MCI': [
    {
      keywords: ['Prism Central', 'Prism Element', 'PC', 'PE', 'dashboard', 'category', 'alert', 'RBAC', 'Prism'],
      title: 'Prism Web Console Guide',
      url: 'https://portal.nutanix.com/page/documents/details?targetId=Prism-Central-Guide-vpc_2024_3:mul-welcome-pc-c.html',
    },
    {
      keywords: ['acli', 'ncli', 'CLI', 'command', 'nuclei', 'zeus_config'],
      title: 'AOS CLI Reference',
      url: 'https://portal.nutanix.com/page/documents/details?targetId=Command-Ref-AOS-v6_10:man-acli-ref-r.html',
    },
    {
      keywords: ['AHV', 'bridge', 'bond', 'LACP', 'active-backup', 'balance-slb', 'OVS', 'hypervisor'],
      title: 'AHV Administration Guide',
      url: 'https://portal.nutanix.com/page/documents/details?targetId=AHV-Admin-Guide-v6_10:ahv-ahv-admin-c.html',
    },
    {
      keywords: ['Flow', 'microseg', 'security', 'policy', 'AppType', 'AppTier', 'microsegmentation'],
      title: 'Flow Security Guide',
      url: 'https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Flow-Security-Guide:flow-microseg-overview-c.html',
    },
    {
      keywords: ['Leap', 'DR', 'disaster', 'BCDR', 'recovery', 'protection', 'replicate', 'Metro', 'witness'],
      title: 'Leap Disaster Recovery Guide',
      url: 'https://portal.nutanix.com/page/documents/details?targetId=Leap-DR-Guide:leap-leap-overview.html',
    },
    {
      keywords: ['DSF', 'OpLog', 'Unified Cache', 'Curator', 'EC-X', 'Stargate', 'extent', 'storage fabric'],
      title: 'The Nutanix Bible',
      url: 'https://www.nutanixbible.com/',
    },
    {
      keywords: ['genesis', 'Medusa', 'Cassandra', 'Zookeeper', 'Cerebro', 'port', 'service', 'architecture'],
      title: 'The Nutanix Bible',
      url: 'https://www.nutanixbible.com/',
    },
    {
      keywords: ['LCM', 'upgrade', 'Foundation', 'imaging', 'AOS', 'firmware'],
      title: 'Prism Web Console — LCM',
      url: 'https://portal.nutanix.com/page/documents/details?targetId=Prism-Central-Guide-vpc_2024_3:mul-welcome-pc-c.html',
    },
    {
      keywords: ['Async', 'NearSync', 'Sync', 'RPO', 'snapshot', 'replication'],
      title: 'Leap Disaster Recovery — Protection Policies',
      url: 'https://portal.nutanix.com/page/documents/details?targetId=Leap-DR-Guide:leap-leap-overview.html',
    },
    {
      keywords: ['v3 API', 'REST', 'v2.0', 'HTTP', 'POST', 'GET', 'endpoint', 'pagination', 'JSON', 'bearer token'],
      title: 'Nutanix v3 REST API Documentation',
      url: 'https://portal.nutanix.com/page/documents/details?targetId=API-Ref-v3:api-api-overview.html',
    },
    {
      keywords: ['VM', 'vCPU', 'NUMA', 'memory', 'CPU ready', 'ballooning', 'affinity', 'vMotion', 'NGT', 'VSS'],
      title: 'AHV VM Management Guide',
      url: 'https://portal.nutanix.com/page/documents/details?targetId=AHV-Admin-Guide-v6_10:ahv-vm-mgmt-c.html',
    },
    {
      keywords: ['capacity planning', 'CPU runway', 'storage runway', 'overcommit', 'IOPS', 'latency', 'throughput', 'metrics'],
      title: 'Prism — Capacity Planning',
      url: 'https://portal.nutanix.com/page/documents/details?targetId=Prism-Central-Guide-vpc_2024_3:mul-dashboard-capacity-c.html',
    },
    {
      keywords: ['X-Ray', 'benchmark', 'workload simulation', 'performance baseline'],
      title: 'Nutanix X-Ray Benchmarking',
      url: 'https://x-ray.nutanix.com/',
    },
    {
      keywords: ['STIG', 'hardening', 'SSH', 'cluster lockdown', 'compliance', 'SCMA', 'encryption'],
      title: 'Security Hardening Best Practices',
      url: 'https://portal.nutanix.com/page/documents/details?targetId=Security-Best-Practices:sec-security-hardening-c.html',
    },
    {
      keywords: ['deduplication', 'compression', 'EC savings', 'shadow clone', 'ILM', 'data reduction', 'RF2', 'RF3'],
      title: 'Nutanix Bible — Storage Features',
      url: 'https://www.nutanixbible.com/',
    },
    {
      keywords: ['NCC', 'health check', 'monitoring', 'alerting', 'diagnostic'],
      title: 'Prism — Health & Monitoring',
      url: 'https://portal.nutanix.com/page/documents/details?targetId=Prism-Central-Guide-vpc_2024_3:mul-health-monitoring-c.html',
    },
  ],
});

// ─── General Resources ──────────────────────────────────────────────────────

/** @type {{title: string, url: string}[]} */
const GENERAL_RESOURCES = Object.freeze([
  { title: 'Nutanix University', url: 'https://www.nutanix.com/university' },
  { title: 'Nutanix Community (NEXT)', url: 'https://next.nutanix.com/' },
  { title: 'Nutanix Portal KB Search', url: 'https://portal.nutanix.com/page/kbs/list' },
]);

// ─── Internal Helpers ───────────────────────────────────────────────────────

/**
 * Build a single search string from a question's text and options,
 * normalised to lower-case for case-insensitive matching.
 *
 * @param {{questionText: string, options: {text: string}[]}} question
 * @returns {string}
 */
function buildSearchText(question) {
  const stem = (question.questionText || '').toLowerCase();
  const opts = (question.options || []).map((o) => o.text).join(' ').toLowerCase();
  return stem + ' ' + opts;
}

/**
 * Score each entry by counting how many of its keywords appear in the
 * search text (case-insensitive). Returns entries with score > 0,
 * sorted descending by score.
 *
 * @template T
 * @param {{keywords: string[]}[]} entries
 * @param {string} searchText — already lower-cased
 * @returns {{score: number, entry: Object}[]}
 */
function scoreEntries(entries, searchText) {
  /** @type {{score: number, entry: Object}[]} */
  const scored = [];
  for (const entry of entries) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (searchText.includes(kw.toLowerCase())) {
        score++;
      }
    }
    if (score > 0) {
      scored.push({ score, entry });
    }
  }
  scored.sort((a, b) => b.score - a.score);
  return scored;
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Returns up to 2 contextual reference cards for a question, matched by
 * keyword overlap with the question stem and options. Cards are returned
 * highest-score-first.
 *
 * Mirrors C# `ReferenceService.GetReferenceForQuestion`.
 *
 * @param {{examCode: string, questionText: string, options: {text: string}[]}} question
 * @returns {string} Joined reference text (empty string if no match)
 */
function getReferenceForQuestion(question) {
  const entries = REFERENCE_DATA[question.examCode];
  if (!entries) return '';

  const searchText = buildSearchText(question);
  const scored = scoreEntries(entries, searchText);

  if (scored.length === 0) return '';

  return scored
    .slice(0, 2)
    .map((s) => s.entry.reference)
    .join('\n\n');
}

/**
 * Returns KB / documentation links relevant to a question, scored by
 * keyword match count, de-duplicated by URL (highest-scored entry wins).
 *
 * Mirrors C# `ReferenceService.GetKBLinksForQuestion`.
 *
 * @param {{examCode: string, questionText: string, options: {text: string}[]}} question
 * @returns {{title: string, url: string}[]}
 */
function getKBLinksForQuestion(question) {
  const entries = KB_LINKS[question.examCode];
  if (!entries) return [];

  const searchText = buildSearchText(question);
  const scored = scoreEntries(entries, searchText);

  // Deduplicate by URL, keeping the highest-scored entry per URL
  /** @type {Set<string>} */
  const seen = new Set();
  /** @type {{title: string, url: string}[]} */
  const results = [];

  for (const { entry } of scored) {
    if (!seen.has(entry.url)) {
      seen.add(entry.url);
      results.push({ title: entry.title, url: entry.url });
    }
  }

  return results;
}

/**
 * Returns the static list of general study resources.
 *
 * Mirrors C# `ReferenceService.GetGeneralResources`.
 *
 * @returns {{title: string, url: string}[]}
 */
function getGeneralResources() {
  return [...GENERAL_RESOURCES];
}

// ─── Exports ────────────────────────────────────────────────────────────────

module.exports = {
  getReferenceForQuestion,
  getKBLinksForQuestion,
  getGeneralResources,
  // Expose data for testing
  _REFERENCE_DATA: REFERENCE_DATA,
  _KB_LINKS: KB_LINKS,
};
