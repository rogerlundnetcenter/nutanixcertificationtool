// blueprintService.js — Port of C# CertStudy.Services.BlueprintService
// Provides exam blueprint data, question-to-objective mapping, and coverage calculation.
// Data sourced from official Nutanix exam blueprint PDFs.
// Pure Node.js module — no Electron dependencies.

'use strict';

const {
  Blueprint,
  BlueprintSection,
  BlueprintObjective,
  CoverageResult,
  SectionCoverage,
  ExamCodes,
  normalizeExamCode,
} = require('../../shared/models.js');

// ─── Blueprint registry (populated at module load) ──────────────────────────

/** @type {Map<string, Blueprint>} */
const _blueprints = new Map();

// ─── Blueprint initialisation ───────────────────────────────────────────────

/** Helper — builds a BlueprintObjective from a plain descriptor. */
function obj(id, title, knowledge, keywords) {
  return new BlueprintObjective({ id, title, knowledge, keywords });
}

/** Helper — builds a BlueprintSection from a plain descriptor. */
function sec(examCode, sectionNumber, name, objectives) {
  return new BlueprintSection({ examCode, sectionNumber, name, objectives });
}

function initNcpAi() {
  const code = ExamCodes.NCP_AI;
  _blueprints.set(code, new Blueprint({
    examCode: code,
    examName: 'Nutanix Certified Professional – Artificial Intelligence',
    questionCount: 75,
    timeLimitMinutes: 120,
    passingScore: '3000/6000',
    sections: [
      sec(code, 1, 'Deploy a Nutanix Enterprise AI Environment', [
        obj('1.1', 'Validate installation prerequisites',
          ['Prerequisites', 'Limitations', 'Install procedure', 'Core components'],
          ['prerequisite', 'GPU', 'NKP', 'install', 'deploy', 'NAI', 'GPT-in-a-Box', 'VRAM', 'passthrough', 'Operator', 'API Gateway']),
        obj('1.2', 'Install NAI components',
          ['NKP vs non-NKP install', 'Version compatibility', 'Dark site', 'Storage classes'],
          ['NKP', 'kubectl', 'air-gap', 'dark site', 'CSI', 'StorageClass', 'PVC', 'GPU Operator', 'device plugin']),
        obj('1.3', 'Configure DNS, URL, and certificates',
          ['FQDN', 'TLS certificates', 'Validate login'],
          ['FQDN', 'DNS', 'certificate', 'TLS', 'ingress', 'self-signed', 'cert-manager']),
      ]),
      sec(code, 2, 'Configure a Nutanix Enterprise AI Environment', [
        obj('2.1', 'Onboard users to NAI',
          ['User vs admin roles', 'User management', 'RBAC'],
          ['user', 'admin', 'role', 'RBAC', 'project', 'multi-tenant', 'onboard']),
        obj('2.2', 'Import Large Language Models',
          ['Import methods', 'Repo keys', 'Manual import'],
          ['HuggingFace', 'NGC', 'import', 'model', 'SafeTensors', 'GGUF', 'ONNX', 'air-gap', 'token']),
        obj('2.3', 'Create endpoints',
          ['Model selection', 'GPU sizing', 'Instance scaling', 'Inference engine'],
          ['endpoint', 'vLLM', 'TensorRT', 'GPU', 'replica', 'auto-scal', 'inference', 'A100', 'H100', 'L40S', 'quantiz']),
        obj('2.4', 'Create and apply API keys',
          ['Generate keys', 'View keys', 'Deactivate', 'Add to endpoint'],
          ['API key', 'revoke', 'rotate', 'deactivate', 'Bearer']),
        obj('2.5', 'Deliver endpoints to consumer',
          ['Endpoint URI', 'Tool calling', 'curl commands'],
          ['completions', 'chat', 'curl', 'base_url', 'tool_call', 'function']),
      ]),
      sec(code, 3, 'Perform Day 2 Operations', [
        obj('3.1', 'Prepare requirements for connecting apps',
          ['Sample request', 'OpenAI-compliant config', 'Endpoint types'],
          ['sample', 'OpenAI', 'v1/chat', 'v1/completions', 'v1/embeddings', 'temperature', 'max_tokens']),
        obj('3.2', 'Interpret performance and optimize',
          ['Observability metrics', 'Resource allocation'],
          ['TTFT', 'throughput', 'latency', 'batch size', 'PagedAttention', 'KV cache', 'HPA', 'queue depth']),
        obj('3.3', 'Monitor access activity for outlier detection',
          ['Top 5 API keys', 'Endpoint dashboard', 'Deactivate keys', 'Audit events'],
          ['audit', 'outlier', 'anomal', 'dashboard', 'Top 5', 'usage spike']),
        obj('3.4', 'Select appropriate LLM for output quality',
          ['Prompt evaluation', 'Quality techniques', 'Guardrails', 'Rerank models'],
          ['LoRA', 'fine-tun', 'rerank', 'guardrail', 'RAG', 'chunking', 'temperature']),
      ]),
      sec(code, 4, 'Troubleshoot a Nutanix Enterprise AI Environment', [
        obj('4.1', 'Troubleshoot performance and resource utilization',
          ['Infrastructure metrics', 'GPU filtering', 'GPU type', 'CPU fallback'],
          ['nvidia-smi', 'GPU util', 'Prism Central', 'node selector', 'CPU fallback', 'CUDA']),
        obj('4.2', 'Remediate health check failures',
          ['Cluster health', 'Component failures', 'K8s resources', 'Stack layer', 'Course of action'],
          ['NotReady', 'CrashLoopBackOff', 'ImagePullBackOff', 'kubectl', 'health check', 'readiness probe']),
        obj('4.3', 'Troubleshoot model import and endpoint creation',
          ['Download failures', 'CSI driver', 'EULA', 'Token', 'Scheduling', 'Prerequisites', 'Container images'],
          ['model import', 'download fail', 'Insufficient', 'Pending', 'scheduling', 'imagePullSecret']),
      ]),
      sec(code, 5, 'Connect Applications to NAI', [
        obj('5.1', 'Configure and validate application with endpoint',
          ['Model vs endpoint types', 'Test endpoint', 'Validate response'],
          ['application', 'connect', 'validate', 'response', '200', 'streaming']),
        obj('5.2', 'Configure RAG architecture',
          ['RAG pipeline', 'Vector DB', 'Embeddings', 'Context window'],
          ['RAG', 'vector', 'embedding', 'retriev', 'context window', 'chunk']),
      ]),
    ],
  }));
}

function initNcpUs() {
  const code = ExamCodes.NCP_US;
  _blueprints.set(code, new Blueprint({
    examCode: code,
    examName: 'Nutanix Certified Professional – Unified Storage',
    questionCount: 75,
    timeLimitMinutes: 120,
    passingScore: '3000/6000',
    sections: [
      sec(code, 1, 'Configure and Manage Nutanix Files', [
        obj('1.1', 'Deploy and configure Nutanix Files',
          ['FSVM sizing', 'File server creation', 'DNS/AD', 'Network config'],
          ['FSVM', 'File Server', 'Files', 'SMB', 'NFS', 'DNS', 'Active Directory', '3 FSVM', 'minerva']),
        obj('1.2', 'Create and manage shares',
          ['Share types', 'Permissions', 'Multi-protocol', 'Distributed shares'],
          ['share', 'SMB share', 'NFS export', 'permission', 'distributed', 'standard', 'multi-protocol', 'mixed mode']),
        obj('1.3', 'Configure Files data protection',
          ['Snapshots', 'Smart DR', 'Replication', 'Failover'],
          ['snapshot', 'Smart DR', 'replicat', 'failover', 'failback', 'RPO', 'file server']),
        obj('1.4', 'Configure Files tiering and optimization',
          ['Smart Tiering', 'Standard Tiering', 'Advanced Tiering'],
          ['tier', 'Smart Tier', 'cold data', 'capacity tier', 'performance tier']),
        obj('1.5', 'Monitor Files with Data Lens',
          ['Data Lens', 'File Analytics', 'Audit', 'Anomaly detection'],
          ['Data Lens', 'File Analytics', 'audit', 'anomal', 'ransomware', 'analytics']),
      ]),
      sec(code, 2, 'Configure and Manage Nutanix Objects', [
        obj('2.1', 'Deploy and configure Nutanix Objects',
          ['Object store', 'Workers', 'MSP', 'Networking'],
          ['Object', 'object store', 'worker', 'MSP', 'S3', 'bucket', 'endpoint']),
        obj('2.2', 'Manage buckets and access',
          ['Bucket policies', 'IAM', 'Access keys', 'Versioning'],
          ['bucket', 'IAM', 'access key', 'policy', 'versioning', 'lifecycle']),
        obj('2.3', 'Configure WORM and compliance',
          ['WORM', 'Object Lock', 'Legal hold', 'Retention'],
          ['WORM', 'immutab', 'Object Lock', 'retention', 'legal hold', 'compliance']),
        obj('2.4', 'Configure Objects data protection',
          ['Replication', 'Federation', 'Mine', 'Namespaces'],
          ['replicat', 'federation', 'Mine', 'namespace', 'cross-site', 'backup']),
        obj('2.5', 'Monitor Objects with Data Lens',
          ['Data Lens for Objects', 'Usage analytics'],
          ['Data Lens', 'Object', 'usage', 'analytics', 'dashboard']),
      ]),
      sec(code, 3, 'Configure and Manage Nutanix Volumes', [
        obj('3.1', 'Deploy and configure Volume Groups',
          ['Volume Groups', 'iSCSI', 'Targets', 'LUNs'],
          ['Volume Group', 'iSCSI', 'target', 'LUN', 'initiator', '3260', 'CHAP']),
        obj('3.2', 'Configure Volumes for external access',
          ['External clients', 'Multipathing', 'Load balancing'],
          ['external', 'client', 'multipath', 'load balanc', 'MPIO', 'iSCSI client']),
        obj('3.3', 'Manage Volumes data protection',
          ['VG snapshots', 'Cloning', 'Replication'],
          ['snapshot', 'clone', 'replicat', 'Volume Group', 'consistency group']),
      ]),
      sec(code, 4, 'Troubleshoot Unified Storage', [
        obj('4.1', 'Troubleshoot Files issues',
          ['FSVM health', 'Share access', 'Performance', 'DR issues'],
          ['troubleshoot', 'FSVM', 'share access', 'permission denied', 'minerva_nvm', 'Smart DR']),
        obj('4.2', 'Troubleshoot Objects issues',
          ['Object store health', 'S3 API errors', 'Performance'],
          ['troubleshoot', 'Object', 'S3', '403', 'NoSuchBucket', 'worker']),
        obj('4.3', 'Troubleshoot Volumes issues',
          ['iSCSI connectivity', 'Multipathing', 'Performance'],
          ['troubleshoot', 'iSCSI', 'Volume Group', 'path', 'timeout', 'initiator']),
      ]),
    ],
  }));
}

function initNcpCi() {
  const code = ExamCodes.NCP_CI;
  _blueprints.set(code, new Blueprint({
    examCode: code,
    examName: 'Nutanix Certified Professional – Cloud Integration',
    questionCount: 75,
    timeLimitMinutes: 120,
    passingScore: '3000/6000',
    sections: [
      sec(code, 1, 'Planning Deployment', [
        obj('1.1', 'Prepare the cloud environment',
          ['Cloud provider', 'Region', 'Account', 'Node type', 'Tenancy'],
          ['AWS', 'Azure', 'region', 'i3.metal', 'i3en.metal', 'BareMetal', 'IAM', 'service principal', 'Resource Provider']),
        obj('1.2', 'Subscribe to NC2 service',
          ['my.nutanix.com', 'RBAC', 'Subscription plans'],
          ['my.nutanix.com', 'subscription', 'PAYG', 'license', 'NC2 Console']),
        obj('1.3', 'Determine implementation requirements',
          ['Redundancy', 'Use cases', 'Compatibility', 'Integrations'],
          ['RF2', 'redundancy', 'compatibility', 'hibernat', 'Calm', 'NKE']),
        obj('1.4', 'Identify networking requirements',
          ['VPN', 'Direct Connect', 'ExpressRoute', 'SDWAN', 'CIDR'],
          ['VPN', 'Direct Connect', 'ExpressRoute', 'BGP', 'CIDR', '/25', 'delegated subnet', 'Megaport', 'SDWAN', 'VPC Endpoint']),
      ]),
      sec(code, 2, 'Deploying the Environment', [
        obj('2.1', 'Deploy the cloud cluster',
          ['Cluster sizing', 'Deployment types', 'PC topology', 'Flow Gateway'],
          ['deploy', 'cluster', 'node', 'Prism Central', 'Flow Gateway', 'ECMP', 'Route Server', 'L2 stretch', 'Floating IP']),
        obj('2.2', 'Configure cluster networking',
          ['VPC peering', 'Transit Gateway', 'Route tables', 'NSG'],
          ['VPC peering', 'Transit Gateway', 'route table', 'NSG', 'Security Group', 'subnet']),
        obj('2.3', 'Configure workloads on NC2',
          ['VM migration', 'Categories', 'Hibernation'],
          ['migrate', 'category', 'hibernat', 'pause', 'workload']),
        obj('2.4', 'Manage cluster lifecycle',
          ['Scale', 'Upgrade', 'Node add/remove'],
          ['scale', 'upgrade', 'node add', 'node remove', 'expand', 'lifecycle']),
      ]),
      sec(code, 3, 'Day 2 Operations & Data Protection', [
        obj('3.1', 'Monitor and manage NC2 clusters',
          ['Alerts', 'Syslog', 'Datadog', 'SMTP'],
          ['alert', 'syslog', 'Datadog', 'SMTP', 'monitor', 'CloudWatch', 'Azure Monitor']),
        obj('3.2', 'Configure data protection',
          ['Leap', 'DR', 'Backup', 'Cluster Protect'],
          ['Leap', 'DR', 'recovery plan', 'backup', 'Cluster Protect', 'async', 'sync', 'replicat']),
        obj('3.3', 'Troubleshoot NC2 issues',
          ['Networking', 'Connectivity', 'Performance'],
          ['troubleshoot', 'connectivity', 'delegated subnet', 'NSG', 'Flow Gateway', 'latency']),
      ]),
    ],
  }));
}

function initNcmMci() {
  const code = ExamCodes.NCM_MCI;
  _blueprints.set(code, new Blueprint({
    examCode: code,
    examName: 'Nutanix Certified Master – Multicloud Infrastructure',
    questionCount: 17,
    timeLimitMinutes: 180,
    passingScore: '3000/6000 (Live Lab)',
    sections: [
      sec(code, 1, 'Monitoring & Troubleshooting', [
        obj('1.1', 'Use Prism Analysis Tools to Identify Performance Issues',
          ['Performance graphs', 'Correlate events', 'Create analysis graphs', 'Resource constraints', 'MSSQL Instance Details'],
          ['analysis', 'performance graph', 'anomal', 'MSSQL', 'SQL Server', 'CPU', 'latency', 'metric', 'entity chart']),
        obj('1.2', 'Perform Health Check and Collect Logs',
          ['Prism log collection', 'CLI log gathering', 'Audit logs', 'NCC checks', 'Cluster config'],
          ['logbay', 'NCC', 'health check', 'audit', 'log collect', 'allssh', 'zeus_config', 'cluster status']),
        obj('1.3', 'Interpret Alerts and Take Appropriate Actions',
          ['Root cause analysis', 'KB article resolution'],
          ['alert', 'root cause', 'KB', 'knowledge base', 'remediat']),
        obj('1.4', 'Create Reports and Custom Metrics',
          ['Entity/metric selection', 'Custom alerts', 'Report creation', 'Report evaluation'],
          ['report', 'custom alert', 'threshold', 'schedule', 'dashboard', 'metric']),
      ]),
      sec(code, 2, 'Optimize & Scale', [
        obj('2.1', 'Utilize Runway Scenario for Workload Changes',
          ['Planning Dashboard', 'Greenfield sizing', 'Cluster expansion'],
          ['Runway', 'planning', 'capacity', 'sizing', 'greenfield', 'expansion', 'forecast']),
        obj('2.2', 'Implement Workload-Based Best Practices',
          ['BPG documents', 'EUC/vGPU config', 'SQL Server BPG', 'Container settings'],
          ['BPG', 'best practice', 'vGPU', 'EUC', 'VDI', 'SQL Server', 'Technote', 'workload']),
        obj('2.3', 'Utilize APIs for Management Tasks',
          ['CRUD operations', 'API data gathering'],
          ['API', 'v3', 'REST', 'CRUD', 'POST', 'GET', 'filter', 'pagination', 'nuclei']),
        obj('2.4', 'Cluster Resiliency and X-Play',
          ['Cluster policies', 'Resiliency', 'Rebuild Capacity', 'X-Play REST API'],
          ['resiliency', 'Rebuild Capacity', 'X-Play', 'playbook', 'REST', 'node awareness', 'block awareness']),
        obj('2.5', 'Create/Configure VMs for Workloads',
          ['Advanced VM settings', 'High-intensity workloads', 'Storage config', 'X-Play monitoring'],
          ['VM', 'NUMA', 'vCPU', 'memory', 'SCSI', 'virtio', 'vNIC', 'affinity']),
      ]),
      sec(code, 3, 'Security', [
        obj('3.1', 'Advanced Cluster Security and Hardening',
          ['SCMA', 'AIDE', 'Hardening', 'RBAC', 'Lockdown', 'Network segmentation'],
          ['SCMA', 'AIDE', 'STIG', 'lockdown', 'SSH', 'harden', 'security', 'RBAC', 'custom role', 'segmentation']),
        obj('3.2', 'Flow Virtual Networking and Security',
          ['VPCs', 'Gateways', 'Multi-tenancy', 'App policies', 'VDI policies'],
          ['Flow', 'VPC', 'microseg', 'security policy', 'VDI policy', 'isolation', 'quarantine', 'overlay']),
        obj('3.3', 'Configure SYSLOG for Log Management',
          ['Remote syslog', 'Per-module export', 'Troubleshoot syslog'],
          ['syslog', 'SIEM', 'remote log', 'severity', 'module', 'UDP', 'TCP', 'TLS']),
        obj('3.4', 'Implement Authentication Best Practices',
          ['Certificates', 'AD/SAML/Local auth', 'Custom roles', 'Account management'],
          ['certificate', 'CA', 'Active Directory', 'SAML', 'SSO', 'IDP', 'LDAP', 'password', 'account']),
        obj('3.5', 'Implement Encryption Including KMS',
          ['Data-at-Rest', 'Data-in-Transit', 'VM-specific encryption'],
          ['encrypt', 'KMS', 'Data-at-Rest', 'Data-in-Transit', 'storage policy', 'key management']),
      ]),
      sec(code, 4, 'Design & Architecture', [
        obj('4.1', 'Configure Products and Features for Business Needs',
          ['RF1 containers', 'Load-Balanced Volume Groups', 'Storage efficiency'],
          ['RF1', 'RF=1', 'Load-Balanced', 'Volume Group', 'compression', 'dedup', 'erasure coding', 'storage efficiency']),
        obj('4.2', 'Align Configuration to NVD',
          ['VLAN validation', 'CVM resources', 'CPU oversubscription', 'HA validation'],
          ['NVD', 'validated design', 'VLAN', 'CVM', 'oversubscription', 'HA', 'admission control']),
      ]),
      sec(code, 5, 'Business Continuity', [
        obj('5.1', 'Create Protection Policies Based on RPO/RTO',
          ['Protection mechanisms', 'Troubleshoot PD/PP', 'Auto target assignment'],
          ['protection', 'RPO', 'RTO', 'protection domain', 'protection policy', 'NearSync', 'Metro', 'async', 'sync']),
        obj('5.2', 'Create Recovery Plans for Applications',
          ['Recovery plan creation', 'Scripts', 'Stages', 'Network/IP mapping', 'Async to sync conversion'],
          ['recovery plan', 'failover', 'failback', 'stage', 'boot group', 'network mapping', 'IP mapping', 'script']),
        obj('5.3', 'Execute DR Including Troubleshooting',
          ['RP test errors', 'VM IP issues', 'RP failure', 'Metro AHV troubleshooting'],
          ['DR', 'disaster recovery', 'test failover', 'Metro', 'witness', 'split-brain', 'VM network not found']),
      ]),
    ],
  }));
}

// Populate the registry on first load
initNcpAi();
initNcpUs();
initNcpCi();
initNcmMci();

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Returns the exam blueprint for a given exam code.
 * Uses {@link normalizeExamCode} for safe lookup (avoids the C# `.Contains("AI")` bug).
 *
 * @param {string} examCode — Raw or canonical exam code
 * @returns {Blueprint|null} The blueprint, or null if unrecognised
 */
function getBlueprint(examCode) {
  const normalised = normalizeExamCode(examCode);
  if (normalised) return _blueprints.get(normalised) ?? null;
  return _blueprints.get(examCode) ?? null;
}

/**
 * Calculates how many questions map to each objective using keyword matching.
 *
 * @param {string} examCode — Exam code to look up
 * @param {string[]} questionTexts — Array of question text strings
 * @returns {CoverageResult} Full coverage result with per-section breakdown
 */
function calculateCoverage(examCode, questionTexts) {
  const bp = getBlueprint(examCode);
  if (!bp) {
    return new CoverageResult({ examCode });
  }

  /** @type {Object<string, number>} objectiveId → question count */
  const objectiveCounts = {};
  const sectionBreakdown = [];
  let totalObjectives = 0;
  let totalCovered = 0;

  for (const section of bp.sections) {
    let sectionQuestionCount = 0;
    let sectionCovered = 0;

    for (const objective of section.objectives) {
      let count = 0;
      for (const q of questionTexts) {
        const qLower = q.toLowerCase();
        if (objective.keywords.some(kw => qLower.includes(kw.toLowerCase()))) {
          count++;
        }
      }
      objectiveCounts[objective.id] = count;
      totalObjectives++;
      if (count > 0) {
        totalCovered++;
        sectionCovered++;
      }
      sectionQuestionCount += count;
    }

    const sectionTotal = section.objectives.length;
    sectionBreakdown.push(new SectionCoverage({
      sectionName: section.name,
      totalObjectives: sectionTotal,
      coveredObjectives: sectionCovered,
      questionCount: sectionQuestionCount,
      coveragePercent: sectionTotal > 0
        ? Math.round((sectionCovered / sectionTotal) * 100)
        : 0,
    }));
  }

  const overallPercent = totalObjectives > 0
    ? Math.round((totalCovered / totalObjectives) * 100)
    : 0;

  return new CoverageResult({
    examCode: bp.examCode,
    overallPercent,
    totalObjectives,
    coveredObjectives: totalCovered,
    sectionBreakdown,
    objectiveCounts,
  });
}

/**
 * Gets the blueprint objectives that match a specific question text.
 * Matching is case-insensitive keyword containment.
 *
 * @param {string} examCode — Exam code to look up
 * @param {string} questionText — The question stem to match
 * @returns {Array<{objId: string, objTitle: string}>} Matched objectives
 */
function getObjectivesForQuestion(examCode, questionText) {
  const bp = getBlueprint(examCode);
  if (!bp) return [];

  const qLower = questionText.toLowerCase();
  const matches = [];

  for (const section of bp.sections) {
    for (const objective of section.objectives) {
      if (objective.keywords.some(kw => qLower.includes(kw.toLowerCase()))) {
        matches.push({ objId: objective.id, objTitle: objective.title });
      }
    }
  }

  return matches;
}

/**
 * Returns all supported exam codes that have a loaded blueprint.
 * @returns {string[]}
 */
function getSupportedExamCodes() {
  return [..._blueprints.keys()];
}

module.exports = {
  getBlueprint,
  calculateCoverage,
  getObjectivesForQuestion,
  getSupportedExamCodes,
  _blueprints, // exposed for testing
};
