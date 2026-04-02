import { bus } from './EventBus.js';
import { store } from './StateStore.js';

/**
 * StateEngine — Central state management for the simulated Nutanix cluster.
 * All entity CRUD goes through here; views subscribe to change events.
 */
class StateEngine {
    #state = {};
    #initialized = false;

    async init() {
        await store.init();
        const saved = await store.get('clusterState');
        if (saved) {
            this.#state = saved;
        } else {
            this.#state = this.#createSeedState();
            await this.#persist();
        }
        this.#initialized = true;
        bus.emit('state:ready', this.#state);
    }

    get isReady() { return this.#initialized; }

    // ── Generic accessors ──

    getAll(collection) {
        return [...(this.#state[collection] || [])];
    }

    getById(collection, id) {
        return (this.#state[collection] || []).find(e => e.uuid === id) || null;
    }

    async create(collection, entity) {
        if (!entity.uuid) entity.uuid = crypto.randomUUID();
        if (!entity.created_at) entity.created_at = new Date().toISOString();
        entity.updated_at = entity.created_at;

        if (!this.#state[collection]) this.#state[collection] = [];
        this.#state[collection].push(entity);
        await this.#persist();
        bus.emit(`${collection}:created`, entity);
        bus.emit('state:changed', { collection, action: 'create', entity });
        return entity;
    }

    async update(collection, id, changes) {
        const list = this.#state[collection] || [];
        const idx = list.findIndex(e => e.uuid === id);
        if (idx === -1) throw new Error(`${collection}/${id} not found`);

        Object.assign(list[idx], changes, { updated_at: new Date().toISOString() });
        await this.#persist();
        bus.emit(`${collection}:updated`, list[idx]);
        bus.emit('state:changed', { collection, action: 'update', entity: list[idx] });
        return list[idx];
    }

    async remove(collection, id) {
        const list = this.#state[collection] || [];
        const idx = list.findIndex(e => e.uuid === id);
        if (idx === -1) return;

        const removed = list.splice(idx, 1)[0];
        await this.#persist();
        bus.emit(`${collection}:deleted`, removed);
        bus.emit('state:changed', { collection, action: 'delete', entity: removed });
        return removed;
    }

    // ── Cluster info ──

    get cluster() { return this.#state.cluster || {}; }

    get hosts() { return this.getAll('hosts'); }

    // ── Convenience accessors ──

    get vms() { return this.getAll('vms'); }
    get containers() { return this.getAll('containers'); }
    get networks() { return this.getAll('networks'); }
    get images() { return this.getAll('images'); }
    get protectionDomains() { return this.getAll('protection_domains'); }

    // ── Reset ──

    async reset() {
        this.#state = this.#createSeedState();
        await this.#persist();
        bus.emit('state:reset');
        bus.emit('state:ready', this.#state);
    }

    // ── Persistence ──

    async #persist() {
        await store.set('clusterState', this.#state);
    }

    // ── Seed Data ──

    #createSeedState() {
        return {
            cluster: {
                name: 'NTNX-POC-Cluster-01',
                version: 'AOS 6.10.1.2',
                hypervisor: 'AHV 20230302.10015',
                numNodes: 4,
                clusterVIP: '10.42.100.37',
                dataServicesIP: '10.42.100.38',
                ntp: 'pool.ntp.org',
                dns: ['10.42.100.10'],
                timezone: 'America/Los_Angeles',
                rf: 2,
                domain: 'ntnxlab.local',
            },
            hosts: [
                { uuid: 'host-001', name: 'NTNX-A-CVM', ip: '10.42.100.29', ipmi: '10.42.100.33', cpu_cores: 16, memory_gb: 64, ssd_tb: 1.92, hdd_tb: 4.0, status: 'normal' },
                { uuid: 'host-002', name: 'NTNX-B-CVM', ip: '10.42.100.30', ipmi: '10.42.100.34', cpu_cores: 16, memory_gb: 64, ssd_tb: 1.92, hdd_tb: 4.0, status: 'normal' },
                { uuid: 'host-003', name: 'NTNX-C-CVM', ip: '10.42.100.31', ipmi: '10.42.100.35', cpu_cores: 16, memory_gb: 64, ssd_tb: 1.92, hdd_tb: 4.0, status: 'normal' },
                { uuid: 'host-004', name: 'NTNX-D-CVM', ip: '10.42.100.32', ipmi: '10.42.100.36', cpu_cores: 16, memory_gb: 64, ssd_tb: 1.92, hdd_tb: 4.0, status: 'normal' },
            ],
            containers: [
                { uuid: 'ctr-001', name: 'default-container', rf: 2, compression: 'inline', dedup: 'off', erasure_coding: false, capacity_tb: 12.0, used_tb: 3.2 },
                { uuid: 'ctr-002', name: 'SelfServiceContainer', rf: 2, compression: 'inline', dedup: 'off', erasure_coding: false, capacity_tb: 12.0, used_tb: 1.8 },
                { uuid: 'ctr-003', name: 'Gold-Container', rf: 2, compression: 'post_process', dedup: 'post_process', erasure_coding: true, capacity_tb: 12.0, used_tb: 5.1 },
                { uuid: 'ctr-004', name: 'VDI-Container', rf: 2, compression: 'inline', dedup: 'inline', erasure_coding: false, capacity_tb: 12.0, used_tb: 2.4 },
                { uuid: 'ctr-005', name: 'NutanixManagementShare', rf: 2, compression: 'off', dedup: 'off', erasure_coding: false, capacity_tb: 12.0, used_tb: 0.3 },
                { uuid: 'ctr-006', name: 'ISO-Library', rf: 2, compression: 'off', dedup: 'off', erasure_coding: false, capacity_tb: 12.0, used_tb: 0.9 },
            ],
            networks: [
                { uuid: 'net-001', name: 'VM-Network-100', vlan_id: 100, subnet: '10.42.100.0/24', gateway: '10.42.100.1', ipam: true, dns: ['10.42.100.10'], pool_start: '10.42.100.50', pool_end: '10.42.100.200' },
                { uuid: 'net-002', name: 'Production-200', vlan_id: 200, subnet: '10.42.200.0/24', gateway: '10.42.200.1', ipam: true, dns: ['10.42.100.10'], pool_start: '10.42.200.10', pool_end: '10.42.200.250' },
                { uuid: 'net-003', name: 'DMZ-300', vlan_id: 300, subnet: '10.42.300.0/24', gateway: '10.42.300.1', ipam: false, dns: [], pool_start: '', pool_end: '' },
                { uuid: 'net-004', name: 'Backup-400', vlan_id: 400, subnet: '10.42.400.0/24', gateway: '10.42.400.1', ipam: false, dns: [], pool_start: '', pool_end: '' },
            ],
            images: [
                { uuid: 'img-001', name: 'CentOS-8-GenericCloud', type: 'DISK_IMAGE', size_gb: 8, source: 'https://cloud.centos.org/centos/8/x86_64/images/CentOS-8-GenericCloud-8.4.qcow2' },
                { uuid: 'img-002', name: 'Ubuntu-22.04-Server', type: 'DISK_IMAGE', size_gb: 4, source: 'https://cloud-images.ubuntu.com/jammy/current/jammy-server-cloudimg-amd64.img' },
                { uuid: 'img-003', name: 'Windows-Server-2022', type: 'ISO_IMAGE', size_gb: 5.2, source: 'local://iso-library/win2022.iso' },
            ],
            vms: [
                { uuid: 'vm-001', name: 'NTNX-A-CVM', vcpus: 8, memory_gb: 32, power_state: 'on', host_uuid: 'host-001', is_cvm: true, disks: [{ size_gb: 40, container: 'default-container' }], nics: [{ network_uuid: 'net-001', ip: '10.42.100.29' }] },
                { uuid: 'vm-002', name: 'NTNX-B-CVM', vcpus: 8, memory_gb: 32, power_state: 'on', host_uuid: 'host-002', is_cvm: true, disks: [{ size_gb: 40, container: 'default-container' }], nics: [{ network_uuid: 'net-001', ip: '10.42.100.30' }] },
                { uuid: 'vm-003', name: 'NTNX-C-CVM', vcpus: 8, memory_gb: 32, power_state: 'on', host_uuid: 'host-003', is_cvm: true, disks: [{ size_gb: 40, container: 'default-container' }], nics: [{ network_uuid: 'net-001', ip: '10.42.100.31' }] },
                { uuid: 'vm-004', name: 'NTNX-D-CVM', vcpus: 8, memory_gb: 32, power_state: 'on', host_uuid: 'host-004', is_cvm: true, disks: [{ size_gb: 40, container: 'default-container' }], nics: [{ network_uuid: 'net-001', ip: '10.42.100.32' }] },
                { uuid: 'vm-005', name: 'Prism-Central', vcpus: 6, memory_gb: 26, power_state: 'on', host_uuid: 'host-001', is_cvm: false, disks: [{ size_gb: 500, container: 'default-container' }], nics: [{ network_uuid: 'net-001', ip: '10.42.100.39' }] },
                { uuid: 'vm-006', name: 'Web-Server-01', vcpus: 2, memory_gb: 4, power_state: 'on', host_uuid: 'host-002', is_cvm: false, disks: [{ size_gb: 50, container: 'Gold-Container', image: 'CentOS-8-GenericCloud' }], nics: [{ network_uuid: 'net-002', ip: '10.42.200.11' }] },
                { uuid: 'vm-007', name: 'Web-Server-02', vcpus: 2, memory_gb: 4, power_state: 'on', host_uuid: 'host-003', is_cvm: false, disks: [{ size_gb: 50, container: 'Gold-Container', image: 'CentOS-8-GenericCloud' }], nics: [{ network_uuid: 'net-002', ip: '10.42.200.12' }] },
                { uuid: 'vm-008', name: 'App-Server-01', vcpus: 4, memory_gb: 8, power_state: 'on', host_uuid: 'host-004', is_cvm: false, disks: [{ size_gb: 80, container: 'Gold-Container', image: 'Ubuntu-22.04-Server' }], nics: [{ network_uuid: 'net-002', ip: '10.42.200.20' }] },
                { uuid: 'vm-009', name: 'DB-Server-01', vcpus: 4, memory_gb: 16, power_state: 'on', host_uuid: 'host-001', is_cvm: false, disks: [{ size_gb: 200, container: 'Gold-Container', image: 'CentOS-8-GenericCloud' }], nics: [{ network_uuid: 'net-002', ip: '10.42.200.30' }] },
                { uuid: 'vm-010', name: 'AD-Server', vcpus: 2, memory_gb: 4, power_state: 'on', host_uuid: 'host-002', is_cvm: false, disks: [{ size_gb: 60, container: 'default-container', image: 'Windows-Server-2022' }], nics: [{ network_uuid: 'net-001', ip: '10.42.100.10' }] },
                { uuid: 'vm-011', name: 'Test-VM', vcpus: 1, memory_gb: 2, power_state: 'off', host_uuid: 'host-003', is_cvm: false, disks: [{ size_gb: 20, container: 'SelfServiceContainer' }], nics: [{ network_uuid: 'net-001' }] },
            ],
            protection_domains: [
                { uuid: 'pd-001', name: 'DR-WebTier', type: 'async', vms: ['vm-006', 'vm-007'], schedule: { interval: 'hourly', retention_local: 3, retention_remote: 2 }, remote_site: 'DR-Site-01' },
                { uuid: 'pd-002', name: 'DR-Database', type: 'async', vms: ['vm-009'], schedule: { interval: 'every_15_min', retention_local: 4, retention_remote: 3 }, remote_site: 'DR-Site-01' },
                { uuid: 'pd-003', name: 'Metro-Critical', type: 'metro', vms: ['vm-008'], schedule: { interval: 'synchronous' }, remote_site: 'Metro-Site-01' },
            ],
            alerts: [
                { uuid: 'alert-001', severity: 'warning', title: 'Disk usage above 70%', entity: 'Gold-Container', created_at: '2026-04-01T18:30:00Z', resolved: false },
                { uuid: 'alert-002', severity: 'info', title: 'NCC check completed', entity: 'Cluster', created_at: '2026-04-01T20:00:00Z', resolved: true },
            ],
            categories: [
                { uuid: 'cat-001', key: 'AppType', values: ['Web', 'Database', 'App', 'Infrastructure'] },
                { uuid: 'cat-002', key: 'Environment', values: ['Production', 'Development', 'Testing', 'Staging'] },
                { uuid: 'cat-003', key: 'AppTier', values: ['Web', 'App', 'DB'] },
            ],
            flow_policies: [
                { uuid: 'flow-001', name: 'Quarantine-Default', type: 'quarantine', mode: 'applied', target_categories: [], source_categories: [], rules: [{ direction: 'inbound', action: 'deny', ports: [] }, { direction: 'outbound', action: 'deny', ports: [] }] },
                { uuid: 'flow-002', name: 'Isolation-DMZ', type: 'isolation', mode: 'applied', target_categories: [{ key: 'Environment', value: 'Production' }], source_categories: [], rules: [{ direction: 'inbound', action: 'whitelist', ports: ['80', '443'] }] },
                { uuid: 'flow-003', name: 'WebApp-Security', type: 'application', mode: 'monitor', target_categories: [{ key: 'AppType', value: 'Web' }], source_categories: [{ key: 'AppTier', value: 'Web' }], rules: [{ direction: 'inbound', action: 'whitelist', ports: ['80', '443', '22'] }] },
            ],
            protection_policies: [
                { uuid: 'pp-001', name: 'Gold-RPO-1hr', rpo: '1_hour', remote_site: 'DR-Site-01', snapshot_type: 'crash_consistent', categories: [{ key: 'Environment', value: 'Production' }] },
                { uuid: 'pp-002', name: 'Silver-RPO-24hr', rpo: '24_hours', remote_site: 'DR-Site-01', snapshot_type: 'crash_consistent', categories: [{ key: 'Environment', value: 'Development' }] },
            ],
            recovery_plans: [
                { uuid: 'rp-001', name: 'WebTier-Recovery', boot_groups: [{ order: 1, vms: ['vm-010'], delay_seconds: 0 }, { order: 2, vms: ['vm-009'], delay_seconds: 60 }, { order: 3, vms: ['vm-006', 'vm-007'], delay_seconds: 120 }], network_mapping: { source: 'Production-200', target: 'DR-Prod-200' }, pre_script: null, post_script: '/scripts/validate-dns.sh', status: 'ready', last_test: '2026-03-15' },
            ],
            users: [
                { uuid: 'user-001', username: 'admin', email: 'admin@ntnxlab.local', role: 'Cluster Admin', source: 'local', last_login: '2026-04-01' },
                { uuid: 'user-002', username: 'operator', email: 'ops@ntnxlab.local', role: 'Cluster Admin', source: 'local', last_login: '2026-03-28' },
                { uuid: 'user-003', username: 'viewer', email: 'viewer@ntnxlab.local', role: 'Viewer', source: 'local', last_login: null },
                { uuid: 'user-004', username: 'ad-jdoe', email: 'jdoe@ntnxlab.local', role: 'User Admin', source: 'ad', last_login: '2026-03-30' },
            ],
            roles: [
                { uuid: 'role-001', name: 'Cluster Admin', type: 'built_in', permissions: ['VM.Create', 'VM.Delete', 'VM.PowerOps', 'VM.Update', 'Storage.Create', 'Storage.Delete', 'Network.Create', 'Network.Delete', 'Cluster.View', 'Cluster.Update', 'User.Manage', 'Alert.View', 'Alert.Resolve'] },
                { uuid: 'role-002', name: 'User Admin', type: 'built_in', permissions: ['VM.Create', 'VM.Delete', 'VM.PowerOps', 'VM.Update', 'Cluster.View', 'Alert.View', 'Alert.Resolve'] },
                { uuid: 'role-003', name: 'Viewer', type: 'built_in', permissions: ['Cluster.View', 'Alert.View'] },
            ],
            ad_config: [],
            playbooks: [
                { uuid: 'pb-001', name: 'Alert-Notify-Admins', trigger: { type: 'alert', severity: 'critical' }, actions: [{ type: 'email', target: 'admin@ntnxlab.local' }], enabled: true, execution_count: 12, last_run: '2026-03-29' },
                { uuid: 'pb-002', name: 'Auto-Snapshot-Daily', trigger: { type: 'schedule', schedule: 'daily' }, actions: [{ type: 'snapshot', target: 'All Production VMs' }], enabled: true, execution_count: 30, last_run: '2026-04-01' },
            ],
            reports: [],
            fsvms: [
                { uuid: 'fsvm-001', name: 'FSVM-01', ip: '10.42.100.51', vcpus: 4, memory_gb: 12, host_uuid: 'host-001', status: 'healthy' },
                { uuid: 'fsvm-002', name: 'FSVM-02', ip: '10.42.100.52', vcpus: 4, memory_gb: 12, host_uuid: 'host-002', status: 'healthy' },
                { uuid: 'fsvm-003', name: 'FSVM-03', ip: '10.42.100.53', vcpus: 4, memory_gb: 12, host_uuid: 'host-003', status: 'healthy' },
            ],
            file_shares: [
                { uuid: 'share-001', name: 'Engineering', protocol: 'SMB', path: '\\\\NTNX-Files\\Engineering', max_size_gb: 500, ssr_enabled: true, multi_protocol: false },
                { uuid: 'share-002', name: 'HR-Docs', protocol: 'SMB', path: '\\\\NTNX-Files\\HR-Docs', max_size_gb: 100, ssr_enabled: true, multi_protocol: false },
                { uuid: 'share-003', name: 'linux-home', protocol: 'NFS', path: '/export/linux-home', max_size_gb: null, ssr_enabled: false, multi_protocol: false },
            ],
            object_stores: [
                { uuid: 'os-001', name: 'ntnx-objects', capacity_tb: 10, endpoint: 'ntnx-objects.ntnxlab.local', status: 'online' },
            ],
            object_buckets: [
                { uuid: 'bucket-001', name: 'backup-2026', store: 'ntnx-objects', versioning: true, worm_enabled: false, lifecycle: { days: 90, action: 'delete' } },
                { uuid: 'bucket-002', name: 'compliance-archive', store: 'ntnx-objects', versioning: true, worm_enabled: true, lifecycle: null },
            ],
            volume_groups: [
                { uuid: 'vg-001', name: 'SQL-Data-VG', iscsi_target: 'iqn.2025-01.local.ntnxlab:sql-data-vg', disks: [{ index: 0, size_gb: 100, container: 'Gold-Container' }, { index: 1, size_gb: 100, container: 'Gold-Container' }], clients: [{ iqn: 'iqn.2025-01.com.server01:initiator', type: 'external' }], chap_enabled: true, flash_mode: false },
                { uuid: 'vg-002', name: 'Oracle-Log-VG', iscsi_target: 'iqn.2025-01.local.ntnxlab:oracle-log-vg', disks: [{ index: 0, size_gb: 50, container: 'Gold-Container' }], clients: [], chap_enabled: false, flash_mode: true },
            ],
            nc2_clusters: [
                { uuid: 'nc2-001', name: 'NC2-Prod-AWS', provider: 'AWS', region: 'us-east-1', az: 'us-east-1a', instance_type: 'i3.metal', node_count: 4, rf: 'RF2', vpc_cidr: '10.100.0.0/16', subnet_cidr: '10.100.1.0/25', flow_gateway_count: 0, network_mode: 'native', billing: 'PAYG', status: 'running', aos_version: '6.10.1.2', ahv_version: '20230302.10015' },
                { uuid: 'nc2-002', name: 'NC2-DR-Azure', provider: 'Azure', region: 'eastus', az: 'eastus-az1', instance_type: 'BareMetal-AHV', node_count: 3, rf: 'RF2', vpc_cidr: '10.200.0.0/16', subnet_cidr: '10.200.1.0/24', flow_gateway_count: 2, network_mode: 'noNAT', billing: '1yr', status: 'running', aos_version: '6.10.1.2', ahv_version: '20230302.10015' },
            ],
            gpu_devices: [
                { uuid: 'gpu-001', name: 'GPU-Node1-Slot0', model: 'A100', host: 'AHV-Node-01', mode: 'passthrough', mig_partitions: 0, assigned_to: 'NAI-Worker-01' },
                { uuid: 'gpu-002', name: 'GPU-Node1-Slot1', model: 'A100', host: 'AHV-Node-01', mode: 'mig', mig_partitions: 7, assigned_to: null },
                { uuid: 'gpu-003', name: 'GPU-Node2-Slot0', model: 'L40S', host: 'AHV-Node-02', mode: 'passthrough', mig_partitions: 0, assigned_to: 'NAI-Worker-02' },
                { uuid: 'gpu-004', name: 'GPU-Node3-Slot0', model: 'T4', host: 'AHV-Node-03', mode: 'passthrough', mig_partitions: 0, assigned_to: null },
            ],
            nai_endpoints: [
                { uuid: 'nai-001', name: 'llama-prod', model: 'llama-2-7b-chat', engine: 'vllm', format: 'safetensors', gpu_count: 1, replicas: 2, min_replicas: 2, max_replicas: 5, api_key: 'nai-prod-key-001', status: 'running', url: 'https://llama-prod.nai.ntnxlab.local/v1' },
                { uuid: 'nai-002', name: 'codellama-dev', model: 'codellama-34b', engine: 'vllm', format: 'gptq', gpu_count: 1, replicas: 1, min_replicas: 1, max_replicas: 3, api_key: 'nai-dev-key-002', status: 'running', url: 'https://codellama-dev.nai.ntnxlab.local/v1' },
            ],
        };
    }
}

export const state = new StateEngine();
