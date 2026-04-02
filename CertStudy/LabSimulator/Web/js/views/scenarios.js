import { BaseView } from './BaseView.js';
import { state } from '../core/StateEngine.js';
import { bus } from '../core/EventBus.js';
import { toast } from '../components/Toast.js';

/**
 * Guided Lab Scenarios — JSON-driven lab exercises across all 4 exams.
 * Each scenario has objectives, hints, and state validation.
 */

const SCENARIOS = [
    // NCM-MCI (4 scenarios)
    {
        id: 'mci-01', exam: 'NCM-MCI', title: 'Create and Power On a VM',
        difficulty: 'Beginner', time: '10 min',
        description: 'Create a VM with specific resources, attach a disk from an image, configure networking, and power it on.',
        objectives: [
            { id: 'obj-1', text: 'Create a VM named "Lab-WebServer" with 2 vCPUs and 4 GB RAM', validate: () => state.getAll('vms').some(v => v.name === 'Lab-WebServer') },
            { id: 'obj-2', text: 'Attach a disk cloned from the CentOS-8 image', validate: () => state.getAll('vms').find(v => v.name === 'Lab-WebServer')?.disks?.some(d => d.image === 'CentOS-8') },
            { id: 'obj-3', text: 'Connect the VM to the VM-100 network', validate: () => state.getAll('vms').find(v => v.name === 'Lab-WebServer')?.nics?.some(n => n.subnet === 'VM-100') },
            { id: 'obj-4', text: 'Power on the VM', validate: () => state.getAll('vms').find(v => v.name === 'Lab-WebServer')?.power_state === 'on' },
        ],
        hints: ['Navigate to PE → VMs', 'Click "+ Create VM"', 'Use the 4-step wizard: General → Disks → NICs → Review'],
        context: 'pe', startRoute: '/pe/vms',
    },
    {
        id: 'mci-02', exam: 'NCM-MCI', title: 'Configure Data Protection',
        difficulty: 'Intermediate', time: '15 min',
        description: 'Create a protection domain, add VMs, and configure a replication schedule.',
        objectives: [
            { id: 'obj-1', text: 'Create a Protection Domain named "PD-Lab-DR"', validate: () => state.getAll('protection_domains').some(p => p.name === 'PD-Lab-DR') },
            { id: 'obj-2', text: 'Add at least 1 VM to the protection domain', validate: () => { const pd = state.getAll('protection_domains').find(p => p.name === 'PD-Lab-DR'); return pd?.vms?.length > 0; } },
            { id: 'obj-3', text: 'Configure an hourly replication schedule', validate: () => { const pd = state.getAll('protection_domains').find(p => p.name === 'PD-Lab-DR'); return pd?.schedule === 'hourly'; } },
        ],
        hints: ['Navigate to PE → Data Protection', 'Click "+ Create Protection Domain"', 'Add VMs and set schedule to hourly'],
        context: 'pe', startRoute: '/pe/protection',
    },
    {
        id: 'mci-03', exam: 'NCM-MCI', title: 'Create a Flow Security Policy',
        difficulty: 'Intermediate', time: '15 min',
        description: 'Create an Application security policy using categories to control traffic between tiers.',
        objectives: [
            { id: 'obj-1', text: 'Create a category value "Lab-App" under AppType', validate: () => { const cats = state.getAll('categories'); const at = cats.find(c => c.key === 'AppType'); return at?.values?.includes('Lab-App'); } },
            { id: 'obj-2', text: 'Create a Flow policy named "Lab-AppPolicy"', validate: () => state.getAll('flow_policies').some(p => p.name === 'Lab-AppPolicy') },
        ],
        hints: ['First create the category in PC → Categories', 'Then create the policy in PC → Flow'],
        context: 'pc', startRoute: '/pc/categories',
    },
    {
        id: 'mci-04', exam: 'NCM-MCI', title: 'Use the CLI to Manage VMs',
        difficulty: 'Advanced', time: '10 min',
        description: 'Use acli and ncli commands to list and manage cluster resources.',
        objectives: [
            { id: 'obj-1', text: 'Open the CLI terminal', validate: () => true },
            { id: 'obj-2', text: 'List all VMs using acli', validate: () => true },
            { id: 'obj-3', text: 'Check cluster status using ncli', validate: () => true },
        ],
        hints: ['Open CLI from PE hamburger menu', 'Type: acli vm.list', 'Type: ncli cluster get-params'],
        context: 'pe', startRoute: '/pe/cli',
    },
    // NCP-US (3 scenarios)
    {
        id: 'us-01', exam: 'NCP-US', title: 'Deploy Nutanix Files',
        difficulty: 'Intermediate', time: '15 min',
        description: 'Deploy FSVMs and create an SMB file share with Self-Service Restore.',
        objectives: [
            { id: 'obj-1', text: 'Deploy at least 3 FSVMs (minimum required)', validate: () => state.getAll('fsvms').length >= 3 },
            { id: 'obj-2', text: 'Create an SMB share named "Lab-Share"', validate: () => state.getAll('file_shares').some(s => s.name === 'Lab-Share' && s.protocol === 'SMB') },
        ],
        hints: ['Navigate to PC → Files', 'Deploy 3 FSVMs first (minimum)', 'Then create the SMB share'],
        context: 'pc', startRoute: '/pc/files',
    },
    {
        id: 'us-02', exam: 'NCP-US', title: 'Create WORM-Enabled Bucket',
        difficulty: 'Advanced', time: '10 min',
        description: 'Create an Object Store bucket with WORM compliance (irreversible!).',
        objectives: [
            { id: 'obj-1', text: 'Create a bucket named "compliance-lab" with WORM enabled', validate: () => state.getAll('object_buckets').some(b => b.name === 'compliance-lab' && b.worm_enabled) },
        ],
        hints: ['Navigate to PC → Objects', 'Create bucket → enable WORM', '⚠️ WORM is IRREVERSIBLE — read the warning!'],
        context: 'pc', startRoute: '/pc/objects',
    },
    {
        id: 'us-03', exam: 'NCP-US', title: 'Configure Volume Group with iSCSI',
        difficulty: 'Intermediate', time: '15 min',
        description: 'Create a Volume Group with iSCSI target and enable CHAP authentication.',
        objectives: [
            { id: 'obj-1', text: 'Create a Volume Group named "Lab-VG"', validate: () => state.getAll('volume_groups').some(v => v.name === 'Lab-VG') },
            { id: 'obj-2', text: 'Enable CHAP authentication', validate: () => state.getAll('volume_groups').find(v => v.name === 'Lab-VG')?.chap_enabled },
        ],
        hints: ['Navigate to PC → Volumes', 'Create volume group with CHAP', 'iSCSI uses port 3260 (NOT 3261!)'],
        context: 'pc', startRoute: '/pc/volumes',
    },
    // NCP-CI (4 scenarios)
    {
        id: 'ci-01', exam: 'NCP-CI', title: 'Deploy NC2 Cluster on AWS',
        difficulty: 'Intermediate', time: '15 min',
        description: 'Deploy an NC2 cluster using i3.metal instances in a single AZ.',
        objectives: [
            { id: 'obj-1', text: 'Deploy an NC2 cluster on AWS with i3.metal instances', validate: () => state.getAll('nc2_clusters').some(c => c.provider === 'AWS' && c.instance_type === 'i3.metal' && c.name !== 'NC2-Prod-AWS') },
        ],
        hints: ['Navigate to PC → NC2 Console → Deploy', 'Select AWS → choose i3.metal', 'r5.metal won\'t work (EBS only, no NVMe)'],
        context: 'pc', startRoute: '/pc/nc2-deploy',
    },
    {
        id: 'ci-02', exam: 'NCP-CI', title: 'Deploy NC2 on Azure with Flow Gateway',
        difficulty: 'Advanced', time: '15 min',
        description: 'Deploy an Azure NC2 cluster with Flow Gateways in noNAT mode.',
        objectives: [
            { id: 'obj-1', text: 'Deploy an NC2 cluster on Azure with /24 subnet', validate: () => state.getAll('nc2_clusters').some(c => c.provider === 'Azure' && c.name !== 'NC2-DR-Azure') },
            { id: 'obj-2', text: 'Ensure at least 2 Flow Gateways configured', validate: () => { const c = state.getAll('nc2_clusters').find(c => c.provider === 'Azure' && c.name !== 'NC2-DR-Azure'); return c?.flow_gateway_count >= 2; } },
        ],
        hints: ['Select Azure provider', 'Minimum /24 subnet (not /25)', 'noNAT is recommended — and irreversible!'],
        context: 'pc', startRoute: '/pc/nc2-deploy',
    },
    {
        id: 'ci-03', exam: 'NCP-CI', title: 'Hibernate and Resume NC2 Cluster',
        difficulty: 'Beginner', time: '5 min',
        description: 'Hibernate a running NC2 cluster and then resume it.',
        objectives: [
            { id: 'obj-1', text: 'Hibernate a running NC2 cluster', validate: () => state.getAll('nc2_clusters').some(c => c.status === 'hibernated') },
            { id: 'obj-2', text: 'Resume the hibernated cluster', validate: () => !state.getAll('nc2_clusters').some(c => c.status === 'hibernated') },
        ],
        hints: ['Go to NC2 Console', 'Select a running cluster → Hibernate', 'Then select it again → Resume'],
        context: 'pc', startRoute: '/pc/nc2-console',
    },
    {
        id: 'ci-04', exam: 'NCP-CI', title: 'Validate Instance Type Selection',
        difficulty: 'Beginner', time: '5 min',
        description: 'Attempt to deploy with invalid instance types and observe the validation errors.',
        objectives: [
            { id: 'obj-1', text: 'Open the AWS deploy wizard and observe instance type options', validate: () => true },
        ],
        hints: ['Try selecting r5.metal — it should show a warning', 't3.xlarge is virtualized — won\'t work', 'Only i3.metal and i3en.metal are valid'],
        context: 'pc', startRoute: '/pc/nc2-deploy',
    },
    // NCP-AI (4 scenarios)
    {
        id: 'ai-01', exam: 'NCP-AI', title: 'Configure GPU with MIG',
        difficulty: 'Intermediate', time: '10 min',
        description: 'Add an A100 GPU and enable MIG mode. Try enabling MIG on a T4 (should fail).',
        objectives: [
            { id: 'obj-1', text: 'Add an A100 GPU in MIG mode', validate: () => state.getAll('gpu_devices').some(g => g.model === 'A100' && g.mode === 'mig' && g.name !== 'GPU-Node1-Slot1') },
        ],
        hints: ['Navigate to PC → GPU Config', 'Add an A100 → select MIG mode', 'Try MIG on T4/L40S — it should be rejected'],
        context: 'pc', startRoute: '/pc/gpu',
    },
    {
        id: 'ai-02', exam: 'NCP-AI', title: 'Deploy NAI Inference Endpoint',
        difficulty: 'Advanced', time: '15 min',
        description: 'Create an NAI endpoint with vLLM engine and test the API.',
        objectives: [
            { id: 'obj-1', text: 'Create an NAI endpoint named "lab-endpoint"', validate: () => state.getAll('nai_endpoints').some(e => e.name === 'lab-endpoint') },
        ],
        hints: ['Navigate to PC → NAI Endpoints', 'Select vLLM engine (broader support)', 'Don\'t use GGUF format — it\'s not supported!'],
        context: 'pc', startRoute: '/pc/nai',
    },
    {
        id: 'ai-03', exam: 'NCP-AI', title: 'Calculate VRAM for 70B Model',
        difficulty: 'Intermediate', time: '5 min',
        description: 'Use the VRAM calculator to determine GPU requirements for a 70B parameter model.',
        objectives: [
            { id: 'obj-1', text: 'Calculate VRAM for 70B FP16 model (should show ~140GB weights)', validate: () => true },
        ],
        hints: ['Navigate to PC → NAI Tools → VRAM Calculator', 'Select 70B FP16 preset', 'Note: needs 2× A100 with NVLink, T4 is not viable'],
        context: 'pc', startRoute: '/pc/nai-tools',
    },
    {
        id: 'ai-04', exam: 'NCP-AI', title: 'Test NAI API Explorer',
        difficulty: 'Intermediate', time: '10 min',
        description: 'Send requests to the API explorer and observe error handling for common mistakes.',
        objectives: [
            { id: 'obj-1', text: 'Send a successful /v1/chat/completions request', validate: () => true },
            { id: 'obj-2', text: 'Observe 422 error by sending "prompt" to /chat/completions', validate: () => true },
        ],
        hints: ['Go to NAI Tools → API Explorer', 'Send the default request (should succeed)', 'Change body to use "prompt" instead of "messages" to see the 422 error'],
        context: 'pc', startRoute: '/pc/nai-tools',
    },

    // ═══ Sprint 11 — New Scenarios ═══

    // Multi-Cluster & Calm
    {
        id: 'mc-01', exam: 'NCM-MCI', title: 'Register a Remote Cluster',
        difficulty: 'Beginner', time: '5 min',
        description: 'Register a new Prism Element cluster to Prism Central for multi-cluster management.',
        objectives: [
            { id: 'obj-1', text: 'Register a new cluster named "NTNX-Lab-Remote"', validate: () => state.getAll('registered_clusters').some(c => c.name === 'NTNX-Lab-Remote') },
        ],
        hints: ['Navigate to PC → Clusters', 'Click "+ Register Cluster"', 'Enter name "NTNX-Lab-Remote" and a valid IP'],
        context: 'pc', startRoute: '/pc/clusters',
    },
    {
        id: 'mc-02', exam: 'NCM-MCI', title: 'Create a Calm Blueprint',
        difficulty: 'Intermediate', time: '10 min',
        description: 'Create a multi-VM blueprint in Calm with web, app, and database tiers.',
        objectives: [
            { id: 'obj-1', text: 'Create a blueprint named "Lab-3Tier"', validate: () => state.getAll('blueprints').some(b => b.name === 'Lab-3Tier') },
            { id: 'obj-2', text: 'Blueprint has at least 2 services', validate: () => { const bp = state.getAll('blueprints').find(b => b.name === 'Lab-3Tier'); return bp?.services?.length >= 2; } },
        ],
        hints: ['Navigate to PC → Calm / Marketplace', 'Click "+ Create Blueprint"', 'In Services step, enter: WebServer, Database'],
        context: 'pc', startRoute: '/pc/calm',
    },
    {
        id: 'mc-03', exam: 'NCM-MCI', title: 'Launch App from Blueprint',
        difficulty: 'Intermediate', time: '10 min',
        description: 'Launch a running application from an existing Calm blueprint.',
        objectives: [
            { id: 'obj-1', text: 'Launch an application from any blueprint', validate: () => state.getAll('applications').length > 2 },
        ],
        hints: ['Go to Calm → Blueprints tab', 'Use the row action "Launch" on any blueprint', 'Check the Applications tab to confirm'],
        context: 'pc', startRoute: '/pc/calm',
    },
    {
        id: 'mc-04', exam: 'NCM-MCI', title: 'Clone Marketplace Item',
        difficulty: 'Beginner', time: '5 min',
        description: 'Clone a pre-built application from the Calm Marketplace to your blueprints.',
        objectives: [
            { id: 'obj-1', text: 'Clone any Marketplace item to Blueprints', validate: () => state.getAll('blueprints').some(b => b.source === 'marketplace') },
        ],
        hints: ['Go to Calm → Marketplace tab', 'Click "Clone to Blueprints" on any item', 'The clone appears in your Blueprints tab as draft'],
        context: 'pc', startRoute: '/pc/calm',
    },

    // Advanced CLI scenarios
    {
        id: 'cli-01', exam: 'NCM-MCI', title: 'CLI Mastery — Storage & Network',
        difficulty: 'Advanced', time: '15 min',
        description: 'Use NCLI to create storage containers and ACLI to manage networks from the command line.',
        objectives: [
            { id: 'obj-1', text: 'Create a container named "CLI-Container" using ncli', validate: () => state.getAll('containers').some(c => c.name === 'CLI-Container') },
            { id: 'obj-2', text: 'Create a network named "CLI-Net" using acli', validate: () => state.getAll('networks').some(n => n.name === 'CLI-Net') },
        ],
        hints: ['Open PE → CLI Terminal', 'Type: ncli container create name=CLI-Container rf=2', 'Type: acli net.create name=CLI-Net vlan=500'],
        context: 'pe', startRoute: '/pe/cli',
    },
    {
        id: 'cli-02', exam: 'NCM-MCI', title: 'CLI — Calm and Lifecycle',
        difficulty: 'Advanced', time: '10 min',
        description: 'Use the calm CLI to list blueprints and nuclei to check upgrade inventory.',
        objectives: [
            { id: 'obj-1', text: 'List blueprints using the calm CLI', validate: () => true },
            { id: 'obj-2', text: 'Check upgrade inventory with nuclei', validate: () => true },
        ],
        hints: ['Open PE → CLI Terminal', 'Type: calm blueprint list', 'Type: nuclei inventory'],
        context: 'pe', startRoute: '/pe/cli',
    },

    // NCP-US expanded
    {
        id: 'us-04', exam: 'NCP-US', title: 'Create NFS Export for Linux',
        difficulty: 'Intermediate', time: '10 min',
        description: 'Create an NFS file share and understand multi-protocol considerations.',
        objectives: [
            { id: 'obj-1', text: 'Create an NFS share named "lab-nfs"', validate: () => state.getAll('file_shares').some(s => s.name === 'lab-nfs' && s.protocol === 'NFS') },
        ],
        hints: ['Navigate to PC → Files', 'Create a share with protocol NFS', 'NFS uses AUTH_SYS by default — LDAP required for multi-protocol'],
        context: 'pc', startRoute: '/pc/files',
    },
    {
        id: 'us-05', exam: 'NCP-US', title: 'Verify FSVM Deployment Requirements',
        difficulty: 'Beginner', time: '5 min',
        description: 'Check that minimum FSVM requirements (3 FSVMs, 12GB RAM each) are met.',
        objectives: [
            { id: 'obj-1', text: 'Verify at least 3 FSVMs are deployed', validate: () => state.getAll('fsvms').length >= 3 },
            { id: 'obj-2', text: 'Verify each FSVM has at least 12 GB RAM', validate: () => state.getAll('fsvms').every(f => f.memory_gb >= 12) },
        ],
        hints: ['Navigate to PC → Files', 'Check the FSVMs section', 'Minimum: 3 FSVMs, 4 vCPUs, 12 GB RAM each'],
        context: 'pc', startRoute: '/pc/files',
    },

    // Audit / Operations
    {
        id: 'ops-01', exam: 'NCM-MCI', title: 'Review Audit Trail',
        difficulty: 'Beginner', time: '5 min',
        description: 'Perform some actions, then check the Audit Log to see recorded events.',
        objectives: [
            { id: 'obj-1', text: 'Create any entity (VM, container, blueprint, etc.)', validate: () => state.getAll('audit_log').some(l => l.action === 'create') },
            { id: 'obj-2', text: 'View the audit log page', validate: () => true },
        ],
        hints: ['First, create something (e.g., a VM)', 'Then navigate to PC → Audit Log', 'You should see the create event recorded'],
        context: 'pc', startRoute: '/pc/audit',
    },
];

export class ScenariosView extends BaseView {
    #activeScenario = null;

    async render() {
        const el = document.createElement('div');
        el.className = 'view';

        // Group by exam
        const exams = ['NCM-MCI', 'NCP-US', 'NCP-CI', 'NCP-AI'];
        const grouped = {};
        exams.forEach(e => grouped[e] = SCENARIOS.filter(s => s.exam === e));

        el.innerHTML = `
            <div class="page-title">
                <h1>🧪 Guided Lab Scenarios</h1>
            </div>

            <div class="text-secondary text-sm" style="margin-bottom:var(--space-xl);">
                Complete hands-on lab exercises to practice for certification exams.
                Each scenario validates your actions against the simulator state.
            </div>

            <div id="scenario-list">
                ${exams.map(exam => `
                    <div class="card" style="margin-bottom:var(--space-lg);">
                        <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;">
                            ${exam}
                            <span class="text-secondary text-sm">${grouped[exam].length} scenarios</span>
                        </div>
                        <div class="card-body" style="padding:0;">
                            ${grouped[exam].map(s => `
                                <div class="scenario-item" data-id="${s.id}" style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid var(--border-light);cursor:pointer;transition:background 0.15s;">
                                    <div>
                                        <strong>${s.title}</strong>
                                        <div class="text-secondary text-sm">${s.description}</div>
                                    </div>
                                    <div style="display:flex;gap:12px;align-items:center;">
                                        <span class="text-secondary text-sm">${s.time}</span>
                                        <span class="status-badge ${s.difficulty === 'Beginner' ? 'good' : s.difficulty === 'Intermediate' ? 'warning' : 'critical'}"><span class="dot"></span>${s.difficulty}</span>
                                        <button class="btn btn-sm btn-primary start-scenario-btn" data-id="${s.id}">Start</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>

            <div id="active-scenario" style="display:none;"></div>
        `;

        return el;
    }

    afterRender() {
        document.querySelectorAll('.start-scenario-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.#startScenario(btn.dataset.id);
            });
        });

        document.querySelectorAll('.scenario-item').forEach(item => {
            item.addEventListener('mouseenter', () => item.style.background = 'var(--bg-secondary)');
            item.addEventListener('mouseleave', () => item.style.background = '');
        });
    }

    destroy() {}

    #startScenario(id) {
        const scenario = SCENARIOS.find(s => s.id === id);
        if (!scenario) return;

        this.#activeScenario = scenario;
        const listDiv = document.getElementById('scenario-list');
        const activeDiv = document.getElementById('active-scenario');
        if (!listDiv || !activeDiv) return;

        listDiv.style.display = 'none';
        activeDiv.style.display = '';

        this.#renderActiveScenario(activeDiv, scenario);
    }

    #renderActiveScenario(container, scenario) {
        const results = scenario.objectives.map(obj => ({
            ...obj,
            passed: false,
        }));

        // Try initial validation
        try {
            results.forEach(r => { r.passed = r.validate(); });
        } catch { /* ignore validation errors on initial render */ }

        container.innerHTML = `
            <div class="card" style="margin-bottom:var(--space-lg);">
                <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <span class="status-badge info"><span class="dot"></span>${scenario.exam}</span>
                        <strong style="margin-left:8px;">${scenario.title}</strong>
                    </div>
                    <div style="display:flex;gap:8px;">
                        <button class="btn btn-sm btn-secondary" id="check-btn">✓ Check Progress</button>
                        <button class="btn btn-sm btn-secondary" id="hints-btn">💡 Show Hints</button>
                        <button class="btn btn-sm btn-secondary" id="navigate-btn">🔗 Go to View</button>
                        <button class="btn btn-sm btn-secondary" id="back-btn">← Back to Scenarios</button>
                    </div>
                </div>
                <div class="card-body">
                    <p>${scenario.description}</p>
                    <p class="text-secondary text-sm">⏱️ Estimated time: ${scenario.time} | Difficulty: ${scenario.difficulty}</p>
                </div>
            </div>

            <div class="card" style="margin-bottom:var(--space-lg);">
                <div class="card-header">Objectives</div>
                <div class="card-body" id="objectives-list">
                    ${results.map(r => `
                        <div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--border-light);" id="obj-${r.id}">
                            <span style="font-size:20px;">${r.passed ? '✅' : '⬜'}</span>
                            <span>${r.text}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="card" id="hints-panel" style="display:none;">
                <div class="card-header">💡 Hints</div>
                <div class="card-body">
                    <ol style="padding-left:20px;">
                        ${scenario.hints.map(h => `<li style="margin-bottom:8px;">${h}</li>`).join('')}
                    </ol>
                </div>
            </div>

            <div class="card" id="result-panel" style="display:none;">
                <div class="card-body" style="text-align:center;padding:32px;">
                    <div style="font-size:48px;" id="result-icon">🎉</div>
                    <h2 id="result-title">Scenario Complete!</h2>
                    <p id="result-message" class="text-secondary"></p>
                </div>
            </div>
        `;

        document.getElementById('back-btn')?.addEventListener('click', () => {
            container.style.display = 'none';
            document.getElementById('scenario-list').style.display = '';
        });

        document.getElementById('hints-btn')?.addEventListener('click', () => {
            const panel = document.getElementById('hints-panel');
            if (panel) panel.style.display = panel.style.display === 'none' ? '' : 'none';
        });

        document.getElementById('navigate-btn')?.addEventListener('click', () => {
            window.location.hash = `#${scenario.startRoute}`;
        });

        document.getElementById('check-btn')?.addEventListener('click', () => {
            let allPassed = true;
            scenario.objectives.forEach(obj => {
                let passed = false;
                try { passed = obj.validate(); } catch { passed = false; }
                const el = document.getElementById(`obj-${obj.id}`);
                if (el) {
                    const icon = el.querySelector('span');
                    if (icon) icon.textContent = passed ? '✅' : '❌';
                }
                if (!passed) allPassed = false;
            });

            const resultPanel = document.getElementById('result-panel');
            if (resultPanel) {
                resultPanel.style.display = '';
                if (allPassed) {
                    document.getElementById('result-icon').textContent = '🎉';
                    document.getElementById('result-title').textContent = 'All Objectives Complete!';
                    document.getElementById('result-message').textContent = `Great job! You've completed "${scenario.title}".`;
                    toast.success(`Scenario "${scenario.title}" completed!`);
                } else {
                    document.getElementById('result-icon').textContent = '🔄';
                    document.getElementById('result-title').textContent = 'Not Yet Complete';
                    document.getElementById('result-message').textContent = 'Some objectives are not met. Use the hints and navigate to the relevant view to complete them.';
                }
            }
        });
    }
}
