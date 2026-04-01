# NCM-MCI 6.10 Live Lab Gap Research

> **Purpose**: Comprehensive technical reference for 10 NCM-MCI 6.10 exam topics requiring hands-on lab proficiency.
> **Generated**: Web research compilation — CLI commands, Prism UI steps, and key technical facts.

---

## Table of Contents

1. [MSSQL Instance Details in Prism Central](#1-mssql-instance-details-in-prism-central)
2. [Rebuild Capacity Reservation](#2-rebuild-capacity-reservation)
3. [X-Play Playbooks with REST API Calls](#3-x-play-playbooks-with-rest-api-calls)
4. [AIDE (Advanced Intrusion Detection Environment)](#4-aide-advanced-intrusion-detection-environment)
5. [VDI Security Policies in Flow](#5-vdi-security-policies-in-flow)
6. [Data-in-Transit Encryption](#6-data-in-transit-encryption)
7. [Cluster Resiliency Preference](#7-cluster-resiliency-preference)
8. [RF1 Containers](#8-rf1-containers)
9. [Recovery Plan Network/IP Mapping in Leap](#9-recovery-plan-networkip-mapping-in-leap)
10. [Load-Balanced Volume Groups](#10-load-balanced-volume-groups)

---

## 1. MSSQL Instance Details in Prism Central

### What It Is
Prism Central provides a dedicated **Application Instance Details** page for registered Microsoft SQL Server instances. This is part of the **Application Monitoring** (Intelligent Operations) feature and provides agentless, deep visibility into SQL Server health.

### Navigation Path
```
Prism Central → Operations → Integrations → SQL Server Instances → [Select Instance]
```

### Tabs & Information Available

| Tab | Content |
|-----|---------|
| **Summary** | Host VM IP, SQL version, database count, instance/host/VM name, VM alert count |
| **Alerts** | Time-based alert graphs (24h / 7d), alert severity drill-down |
| **Anomalies** | ML-detected anomalies in CPU, memory, I/O, networking, disk usage |
| **Events** | System events timeline for the instance |
| **Databases** | Per-database listing with IOPS, space availability %, log file used %, free space |
| **Queries** | Top queries by avg execution time, execution count, last execution, duration |
| **Metrics** | Up to 16 custom SQL performance metrics |

### Key SQL Server Metrics Displayed

- **CPU Usage (%)**
- **Total Server Memory (MB)**
- **Target Server Memory (MB)**
- **Available Physical Memory**
- **Buffer Cache Hit Ratio (%)** — should be >95% for good performance
- **Number of Active Connections**
- **IOPS Rate** (per database)
- **Log File Used (%)**
- **Effective Free Space**

### Troubleshooting SQL Performance via Prism Central

1. **Check Anomalies tab** — ML-based detection flags unusual resource consumption
2. **Review Queries tab** — Identify slow-running queries by average execution time
3. **Examine Metrics tab** — Look for buffer cache hit ratio drops, memory pressure, high IOPS
4. **Check Alerts** — VM-level alerts may indicate underlying infrastructure issues (disk latency, CPU contention)
5. **Database tab** — Log file growth or low free space can cause performance degradation

### Integration with NDB (formerly Era)
- NDB provides additional DBaaS capabilities: provisioning, patching, backup/restore, cloning
- Database Groups allow managing multiple databases under one Time Machine entity
- SLA policies can be assigned per database or group

### Lab Exam Tips
- Know how to navigate to the SQL instance details page
- Be prepared to interpret buffer cache hit ratio and memory metrics
- Understand the difference between Prism Central monitoring vs NDB management

---

## 2. Rebuild Capacity Reservation

### What It Is
Rebuild Capacity Reservation **reserves a portion of cluster storage** specifically for rebuilding data after a node/block/rack failure. Without it, a nearly-full cluster cannot self-heal after losing a node.

### Why It Matters
- Ensures enough free space exists to replicate data from a failed node across remaining healthy nodes
- Prevents write outages when the cluster is near capacity and a failure occurs
- The cluster **refuses new writes** once resilient capacity is reached (safety measure)

### Prerequisites
- Cluster must have **3+ nodes**
- Must use a **single default storage pool** (no additional pools)
- Must use **RF2 or RF3** (not RF1)

### Configuration via Prism Element

```
Prism Element → Settings (gear icon) → Rebuild Capacity Reservation → Enable
```

**Steps:**
1. Log in to **Prism Element** (not Prism Central)
2. Click the **gear icon** → **Rebuild Capacity Reservation**
3. Toggle to **Enable**
4. System auto-calculates the required reserve based on failure domain settings (node/block/rack)
5. Monitor **Resilient Capacity** and **Used Capacity** in the storage summary panel

### How the Reservation Is Calculated
- Based on the configured failure domain (node, block, or rack)
- Reserves enough space to re-replicate the data equivalent of one failure domain unit
- Subtracted from total usable capacity shown in dashboard

### Alert Behavior
- **Warning alerts** when storage usage approaches resilient capacity threshold
- **Critical alerts** when at the limit
- **Writes are blocked** beyond the resilient capacity limit

### Best Practices
- **Keep enabled** — disabling increases risk of unrecoverable failures when storage is nearly full
- Combine with **AHV VM HA Reservation** for compute capacity protection
- Monitor resilient capacity bar regularly
- Plan capacity expansion before hitting thresholds

### Limitations
- Not available for 1- or 2-node clusters
- Cannot use multiple storage pools with this feature enabled
- Changing failure domain requires temporarily disabling the reservation

### Lab Exam Tips
- Know the exact Prism Element path to enable this setting
- Understand that it works at the **Prism Element** level, not Prism Central
- Be able to explain the relationship between failure domains and reservation size

---

## 3. X-Play Playbooks with REST API Calls

### What It Is
X-Play is Nutanix's low-code automation engine in Prism Central. Playbooks define **Triggers** (when to act) and **Actions** (what to do), including making REST API calls to external or internal endpoints.

### Navigation Path
```
Prism Central → Operations → Playbooks → + Create Playbook
```

### Available Trigger Types

| Trigger | Description |
|---------|-------------|
| **Alert** | Fires when a specific Prism Central alert is raised |
| **Event** | Responds to system events (VM creation, deletion, power state change) |
| **Manual** | Admin-initiated from the Prism Central UI |
| **Time/Schedule** | Runs at defined intervals or specific times (cron-like) |
| **Webhook** | External system calls a generated HTTP POST URL to trigger the playbook |

### Configuring a REST API Action

**Step-by-step in X-Play UI:**

1. Create a new playbook or edit existing
2. Select/configure a **Trigger** (e.g., Alert trigger)
3. Click **Add Action**
4. Select **REST API** from the action list
5. Configure the following fields:

| Field | Description | Example |
|-------|-------------|---------|
| **Method** | HTTP verb | `POST`, `GET`, `PUT`, `DELETE` |
| **URL** | Target endpoint | `https://api.servicenow.com/api/now/table/incident` |
| **Headers** | Key-value pairs | `Authorization: Bearer <token>`, `Content-Type: application/json` |
| **Parameters** | Query string params | `?sysparm_limit=10` |
| **Body** | JSON payload (POST/PUT) | `{"short_description": "{{trigger[0].source_entity_info.name}}"}` |

### Using Dynamic Variables
X-Play provides trigger context variables you can embed in URL, headers, or body:

```
{{trigger[0].source_entity_info.name}}     — Entity name that triggered the playbook
{{trigger[0].cluster_entity_info.name}}     — Cluster name
{{trigger[0].creation_time}}                — Event/alert creation timestamp
{{trigger[0].source_entity_info.uuid}}      — Entity UUID
```

### Example: Send Alert to External System

```
Trigger: Alert → "VM CPU Usage Critical"
Action:  REST API
  Method: POST
  URL:    https://hooks.slack.com/services/T00/B00/xxx
  Headers:
    Content-Type: application/json
  Body:
    {
      "text": "Alert: {{trigger[0].alert_entity_info.name}} on {{trigger[0].cluster_entity_info.name}}"
    }
```

### Common Use Cases
- **ServiceNow** — Auto-create incident tickets on critical alerts
- **Slack/Teams** — Send notification messages
- **Ansible Tower** — Trigger automation workflows
- **PagerDuty** — Escalate alerts to on-call engineers
- **Custom webhooks** — Call any REST-compatible endpoint

### Security Notes
- Use API tokens or basic auth in headers
- Store credentials carefully (X-Play does not have a native secrets manager)
- Use HTTPS endpoints only in production

### Lab Exam Tips
- Practice creating a playbook end-to-end: select trigger → add REST API action → configure method/URL/headers/body
- Know the available trigger types
- Understand how to use `{{trigger[0]...}}` variables in the body/URL
- Be prepared to troubleshoot a playbook that isn't firing (check trigger conditions, entity scope)

---

## 4. AIDE (Advanced Intrusion Detection Environment)

### What It Is
AIDE is a file and directory integrity checker that provides **host-based intrusion detection**. On Nutanix, it monitors critical system files on CVMs and AHV hosts for unauthorized modifications.

### How It Works
1. First run builds a **baseline database** (snapshot of all monitored file attributes)
2. Subsequent runs compare current state against baseline
3. Discrepancies (new files, modified files, deleted files) are logged and reported
4. Runs on a configurable schedule (cron-based)

### Key CLI Commands

**Check current security configuration:**
```bash
ncli cluster get-hypervisor-security-config
```

**Enable AIDE:**
```bash
ncli cluster edit-hypervisor-security-params enable-aide=true
```

**Set AIDE schedule:**
```bash
ncli cluster edit-hypervisor-security-params schedule=daily
```
Options: `hourly`, `daily`, `weekly`, `monthly`

**Enable additional security hardening:**
```bash
# High-strength passwords
ncli cluster edit-hypervisor-security-params enable-high-strength-password=true

# SSH login banner
ncli cluster edit-hypervisor-security-params enable-banner=true

# Disable core dumps
ncli cluster edit-hypervisor-security-params enable-core=false
```

### What Happens When AIDE Is Enabled
- Activates on **both AHV hosts and CVMs**
- Cron job is automatically configured with the specified schedule
- Initial database build occurs on first run
- Results logged to files on each CVM/AHV node
- No additional packages or appliances needed — built into Nutanix

### Full Hardening Command (All Security Parameters)
```bash
ncli cluster edit-hypervisor-security-params \
  enable-aide=true \
  schedule=daily \
  enable-high-strength-password=true \
  enable-banner=true \
  enable-core=false
```

### Where to Find AIDE Logs
- Log files are stored on each individual CVM/AHV node
- Check `/var/log/aide/` or similar paths on the CVM
- Results show added, removed, and changed files with attribute details

### Lab Exam Tips
- **Know the exact ncli commands** — `get-hypervisor-security-config` and `edit-hypervisor-security-params`
- Remember AIDE is enabled at the **cluster level**, not per-node
- Know the schedule options: hourly, daily, weekly, monthly
- Understand that AIDE is part of Nutanix's **STIG/hardening** capabilities
- No manual package installation required

---

## 5. VDI Security Policies in Flow

### What It Is
Flow's **VDI Policy** is an identity-based microsegmentation feature that uses Active Directory (AD) user groups to dynamically apply network security policies to VDI virtual machines based on who is logged in.

### How It Works
1. **AD Integration** — AD domain is connected to Prism Central; user groups are imported as categories
2. **ID Firewall** — When a user logs into a domain-joined VDI VM, Nutanix detects the login event
3. **Dynamic Policy** — Security rules matching the user's AD group(s) are applied to that VM's network traffic
4. **Union of Rules** — If user belongs to multiple AD groups, all corresponding rules are applied collectively

### Configuration Steps

**Step 1: Configure AD Integration**
```
Prism Central → Administration → Directory Service → Connect to AD
```
- Use service account with read permissions
- **Important**: Use LDAP port 389 (LDAPS not supported for ID Firewall)
- Import AD user groups as Prism Central categories (key: `ADGroup`)

**Step 2: Create VDI Security Policy**
```
Prism Central → Network & Security → Security Policies → Create Security Policy
→ Select "Secure VDI Groups (VDI Policy)"
```

**Step 3: Configure Policy**
1. Name the policy
2. Select VMs to include (filter by VM name or include all)
3. Optionally set a **default ADGroup** for VMs without active user logins
4. Define **inbound rules** per AD group (which sources can reach VDI VMs in each group)
5. Define **outbound rules** per AD group (what VDI VMs in each group can access)
6. Traffic between different AD group categories is **blocked by default** unless explicitly allowed

**Step 4: Apply Policy**
- Choose **Monitor** mode first (logs but doesn't block)
- After validation, switch to **Apply** mode (active enforcement)

### Important Behaviors & Limitations
- **One user per VM** — Nutanix recommends only one concurrent user login per VDI VM for predictable enforcement
- **Logoff not detected** — Previous user's policies persist until a new logon event occurs
- **Credential caching** — Must be **disabled** in Windows VDI VMs; if caching is enabled, logons during DC outages are invisible to Flow
- **LDAP only** — Port 389; LDAPS (636) is not supported for ID Firewall

### Best Practices
- Define policies per department or business unit, not overly broad
- Keep VDI policy rules as simple as possible
- Use Monitor mode extensively before applying
- Export policies regularly for backup/rollback
- Test with a pilot group of VMs first

### Lab Exam Tips
- Know the end-to-end flow: AD integration → import groups as categories → create VDI policy → apply
- Remember the LDAP port 389 requirement (no LDAPS)
- Understand that policies follow the **user**, not the VM
- Know that credential caching must be disabled
- Be prepared to create a VDI policy from scratch in the UI

---

## 6. Data-in-Transit Encryption

### What It Is
Encrypts **intra-cluster and cross-cluster network traffic** between Nutanix services (primarily Stargate CVM-to-CVM communication) to protect data moving across the network.

### What Traffic IS Encrypted

| Traffic Type | Encrypted? |
|-------------|:----------:|
| Stargate CVM-to-CVM (storage I/O) | ✅ Yes |
| Stargate backplane (when segmented) | ✅ Yes |
| Replication traffic (async/sync, cross-cluster) | ✅ Yes |

### What Traffic is NOT Encrypted

| Traffic Type | Encrypted? |
|-------------|:----------:|
| RDMA traffic | ❌ No |
| Guest VM to remote CVM disk I/O | ❌ No |
| Volume Group connections to remote CVM | ❌ No |

### How to Enable — Prism Central UI

```
Prism Central → Infrastructure → Hardware → Clusters
→ Select cluster → Actions → Enable Data-In-Transit Encryption → Confirm
```

**Steps:**
1. Log in to **Prism Central** as admin
2. Navigate to **Infrastructure → Hardware → Clusters**
3. Select the target cluster
4. Click **Actions** dropdown
5. Select **Enable Data-In-Transit Encryption**
6. Click **Enable** to confirm

### CLI / API Notes
- As of AOS 6.10, enabling data-in-transit encryption is **primarily a Prism Central GUI operation**
- No direct `ncli` command documented for this specific feature
- Can be automated via **Prism Central REST API v3** (programmatic alternative to CLI):
  ```
  PUT /api/nutanix/v3/clusters/{uuid}
  ```
- Check current encryption status via API or Prism Central dashboard

### Prerequisites & Requirements
- **License**: Requires **Ultimate** license or **Pro + Security add-on**
- Cluster must be running supported AOS version (6.6+)
- All nodes must be able to communicate via TLS
- Does NOT require backplane network segmentation (but recommended for defense-in-depth)

### Relationship to Other Encryption Features
- **Data-at-Rest Encryption** (software/hardware) — Protects stored data on disks
- **Data-in-Transit Encryption** — Protects data moving between nodes
- Both can be enabled simultaneously for comprehensive encryption coverage

### Lab Exam Tips
- Know the Prism Central navigation path to enable this
- Understand which traffic types are and are NOT encrypted
- Remember that RDMA traffic is excluded
- Know the licensing requirement (Ultimate or Pro + add-on)
- Be prepared to verify encryption status after enabling

---

## 7. Cluster Resiliency Preference

### What It Is
Controls how the Nutanix cluster responds to node/component unavailability — specifically whether it **immediately** begins rebuilding data or **smartly** waits to determine if the outage is planned maintenance vs an actual failure.

### Options

| Preference | Behavior |
|-----------|----------|
| **Smart** (recommended) | Differentiates between planned maintenance and actual failures. Delays rebuild for planned outages; triggers immediate rebuild for true failures. |
| **Immediate** | Always starts data rebuild immediately regardless of cause. Maximum resilience but wastes resources if the node returns quickly. |

### Planned vs Unplanned Behavior

**With "Smart" preference:**
- **Planned maintenance** (e.g., rolling upgrade, node reboot) → Rebuild is **deferred** because the node is expected to return. Avoids unnecessary data movement.
- **Unplanned failure** (e.g., hardware crash, power loss) → Rebuild starts **immediately** to restore data redundancy ASAP.

**With "Immediate" preference:**
- **Both planned and unplanned** → Rebuild starts **immediately** in all cases. Simple but potentially wasteful during maintenance windows.

### CLI Command

```bash
# Set resiliency preference to Smart
ncli cluster set-resiliency-preference desired-resiliency-preference=smart

# Set resiliency preference to Immediate
ncli cluster set-resiliency-preference desired-resiliency-preference=immediate

# View current setting
ncli cluster get-resiliency-preference
```

### Failure Domains / Availability Domains
The resiliency preference works in conjunction with the configured failure domain:

| Failure Domain | Tolerance Level | Supported Since |
|---------------|----------------|-----------------|
| **Node** (host) | Single node failure | Always |
| **Block** (chassis) | Entire block/chassis failure | AOS 4.5+ |
| **Rack** | Full rack failure | AOS 5.9+ |

### Prism Element Configuration
```
Prism Element → Settings → Redundancy Configuration
```
- Set the desired failure domain (node/block/rack)
- Configure the number of failures to tolerate

### Relationship to DR (Disaster Recovery)
This setting is about **intra-cluster** resiliency (not cross-site DR):
- **Planned Failover** (DR) = Clean transition between sites, zero data loss
- **Unplanned Failover** (DR) = Triggered when primary is unavailable, potential RPO-based data loss
- These are configured separately in Prism Central via Recovery Plans

### Best Practices
- Use **Smart** in most environments (especially enterprise)
- Use **Immediate** only if you have strict RPO requirements and prefer maximum resilience over efficiency
- Align failure domain with physical infrastructure (rack awareness for multi-rack deployments)

### Lab Exam Tips
- **Know the ncli command**: `ncli cluster set-resiliency-preference desired-resiliency-preference=smart`
- Understand the behavioral difference between Smart and Immediate
- Know the three failure domain levels: node, block, rack
- Be prepared to explain when Smart defers rebuilds vs when it doesn't

---

## 8. RF1 Containers

### What It Is
A storage container with **Replication Factor 1** — stores only a **single copy** of data with **no Nutanix-level redundancy**. If a node or disk fails, data in an RF1 container is **lost**.

### When to Use RF1

| Use Case | Rationale |
|----------|-----------|
| **Applications with built-in redundancy** | Hadoop HDFS, Cassandra, MongoDB replica sets — app handles data protection |
| **Dev/Test environments** | Data loss acceptable; maximize available capacity |
| **Temporary/cache data** | Scratch data, build artifacts, ephemeral workloads |
| **Big data workloads** | Cloudera/HDP DataNodes where HDFS provides 3x replication natively |

### When NOT to Use RF1
- ❌ OS disks or boot volumes
- ❌ Non-redundant application data
- ❌ Any workload where data loss is unacceptable
- ❌ Production databases without application-level replication

### Creating an RF1 Container — Prism Element

```
Prism Element → Storage → Storage Container → + Storage Container
```

**Steps:**
1. Log in to **Prism Element**
2. Navigate to **Storage** dashboard
3. Click **+ Storage Container**
4. Enter container **Name** (observe hypervisor character limits)
5. Select **Storage Pool**
6. Expand **Advanced Settings**
7. Set **Replication Factor** to **1**
8. Configure optional features (compression, deduplication, erasure coding)
9. Click **Save**

### CLI Command (ncli)
```bash
# Create RF1 container
ncli container create name=<container_name> rf=1 sp-name=<storage_pool_name>

# Example
ncli container create name=hadoop-data rf=1 sp-name=default-storage-pool-xxxxx

# Verify
ncli container ls
```

### Automation
```hcl
# Terraform example
resource "nutanix_storage_containers_v2" "rf1_container" {
  name               = "hadoop-data"
  replication_factor = 1
  cluster_ext_id     = var.cluster_uuid
}
```

### Best Practice: Mixed RF Strategy
- **RF2 container** — OS disks, configuration data, critical workloads
- **RF1 container** — Application data where the app provides its own redundancy
- Assign VMs' vDisks to appropriate containers based on data criticality

### Impact on Capacity
- RF1 effectively **doubles usable capacity** compared to RF2 (no replica overhead)
- RF2 = ~50% usable, RF3 = ~33% usable, RF1 = ~100% usable

### Lab Exam Tips
- Know how to create via both Prism Element UI and ncli CLI
- Understand the appropriate use cases (app-level redundancy, dev/test)
- Know that RF1 + rebuild capacity reservation is NOT supported
- Be prepared to explain why you would choose RF1 for a given scenario

---

## 9. Recovery Plan Network/IP Mapping in Leap

### What It Is
When failing over VMs to a DR site using Nutanix Leap, **network mapping** ensures VMs connect to the correct subnets, and **IP mapping** allows static IP addresses to be changed automatically to match the DR site's addressing scheme.

### Key Concepts

| Concept | Description |
|---------|-------------|
| **Network Mapping** | Maps primary site subnets/VLANs to recovery site subnets/VLANs |
| **Custom IP Mapping** | Per-VM static IP address assignment at the recovery site |
| **NGT Requirement** | Nutanix Guest Tools must be installed for in-guest IP changes |
| **Protection Policy** | Category-based policies that define replication (async/nearsync) |

### Configuration Steps

**Step 1: Create Protection Policy**
```
Prism Central → Data Protection → Protection Policies → Create Protection Policy
```
- Assign categories to VMs
- Define replication schedule (Async, NearSync)
- Select primary and recovery clusters

**Step 2: Create Recovery Plan**
```
Prism Central → Data Protection → Recovery Plans → Create Recovery Plan
```

**Step 3: Configure Network Mapping**
1. In the recovery plan, go to **Network Settings**
2. Map each **primary subnet** to a corresponding **recovery subnet**
3. Both subnets must exist on their respective clusters
4. Gateway IPs and prefix lengths should be consistent

**Step 4: Configure Custom IP Mapping**
1. In the recovery plan, navigate to **Advanced Settings → Custom IP Mapping**
2. For each eligible VM, specify:
   - New static IP address for the DR site
   - Gateway (if different)
   - Subnet mask
3. Only VMs with **NGT installed**, **static IP configured**, and **VNIC in a mapped subnet** are eligible

**Step 5: Configure VM Boot Order (Stages)**
1. Add power-on stages to control boot sequence
2. **Stage 1**: Domain Controllers, DNS servers
3. **Stage 2**: Application servers
4. **Stage 3**: Web/frontend servers
5. Add delay between stages for service readiness

### DNS/AD Considerations
- **DNS is NOT automatically updated** by Leap — requires custom scripts
- **NGT custom scripts** can automate DNS server address changes on recovered VMs
  - Windows: Place `vm_recovery.bat` or `.ps1` scripts in NGT script folder
  - Linux: Place shell scripts in the corresponding NGT folder
- **AD Domain Controllers** should be in the earliest power-on stage
- If DC IPs change at DR site, update DNS records and client configurations via scripts

### Example PowerShell Script for DNS Update (via NGT)
```powershell
# vm_recovery.ps1 — placed in NGT scripts folder
$adapter = Get-NetAdapter | Where-Object {$_.Status -eq "Up"}
Set-DnsClientServerAddress -InterfaceIndex $adapter.ifIndex -ServerAddresses "10.20.30.4","10.20.30.5"
```

### Best Practices
- Use **categories** for protection policy assignment (not individual VMs)
- Ensure **storage container names match** between primary and recovery sites
- Install **NGT on all VMs** that need IP customization
- **Test failover** (isolated test) before relying on production DR
- Use **Async replication** unless you have very low latency between sites (NearSync requires <5ms RTT)

### Lab Exam Tips
- Know how to create a full recovery plan: protection policy → recovery plan → network mapping → IP mapping → boot stages
- Understand the NGT requirement for in-guest IP changes
- Know that DNS changes require custom scripts (not automatic)
- Be prepared to configure boot order with AD/DNS servers first
- Understand the difference between planned and unplanned failover execution

---

## 10. Load-Balanced Volume Groups

### What It Is
Volume Groups (VGs) provide **iSCSI block storage** from the Nutanix cluster to external clients (bare metal servers, VMs, containers). **Load Balancing** distributes vDisk ownership across all CVMs in the cluster, preventing any single CVM from becoming a bottleneck.

### How Load Balancing Works
- Without load balancing: all disks in a VG are owned by a single CVM
- With load balancing: vDisks are **distributed across all CVMs** in the cluster
- IO is served by the owning CVM for each vDisk
- Automatic failover on CVM/node failure (10-20 second resumption)

### Prerequisites
- **Data Services IP** must be configured on the cluster (cluster-wide virtual IP for iSCSI discovery)
- Network segmentation/VLAN for iSCSI traffic recommended

### Configuration Steps — Prism Element

**Step 1: Set Data Services IP**
```
Prism Element → Settings → Cluster Details → Data Services IP → Set IP address
```

**Step 2: Create Volume Group**
```
Prism Element → Storage → Volume Groups → + Volume Group
```

1. Enter VG **Name**
2. Check **Enable external client access** (for iSCSI to bare metal/external hosts)
3. Check **Enable load balancing** (distributes vDisks across CVMs)
4. Add **Disks** (one or more vDisks/LUNs) — for best distribution, add at least one disk per node
5. Configure **iSCSI Initiator Whitelist** — add IQNs of allowed external clients
6. (Optional) Configure **CHAP authentication** for security
7. Click **Save**

### CLI Command (acli)
```bash
# Create load-balanced volume group
acli vg.create <vg_name> load_balance_vm_attachments=true

# Add a disk to the VG
acli vg.disk_create <vg_name> create_size=100G container=<container_name>

# Add iSCSI initiator (external client whitelist)
acli vg.iscsi_client_add <vg_name> <client_iqn>

# Enable CHAP
acli vg.update <vg_name> enable_chap=true chap_secret=<secret>

# List volume groups
acli vg.list
acli vg.get <vg_name>
```

### Connecting External Clients (iSCSI)
1. On the client, configure iSCSI initiator (Windows iSCSI Initiator / Linux open-iscsi)
2. Point discovery to the **Data Services IP** of the Nutanix cluster
3. Authenticate with CHAP credentials if configured
4. Discover and log in to the iSCSI targets
5. Format and mount the presented LUNs

### Use Cases

| Use Case | Description |
|----------|-------------|
| **Clustered Applications** | Oracle RAC, Microsoft WSFC, Linux HA clusters needing shared storage with SCSI-3 PR |
| **Bare Metal Servers** | Physical servers consuming Nutanix storage via iSCSI |
| **High-IO Workloads** | Databases or transactional apps requiring distributed IO |
| **Kubernetes PVs** | Persistent block storage via Nutanix CSI driver |
| **External Platforms** | OpenStack, containers, or non-Nutanix hypervisors needing block storage |

### Best Practices
- Use **Data Services IP** for all iSCSI connections (abstracts node changes, failover, load balancing)
- Add **at least one vDisk per Nutanix node** for optimal load distribution
- Enable **one-way CHAP** for security
- Place hosts and Data Services IP on the **same subnet** to avoid routing latency
- **Do NOT use** VGs as iSCSI datastores for ESXi or Hyper-V (not supported)
- **MPIO** not required but supported for backward compatibility

### Performance Considerations
- Load balancing prevents single-CVM bottleneck
- More vDisks = better distribution across CVMs
- Configure RSS (Receive Side Scaling) on client NICs for high throughput
- IO failover on node failure: ~10-20 seconds

### Lab Exam Tips
- Know how to configure Data Services IP (prerequisite)
- Practice creating a VG with load balancing enabled via both UI and CLI
- Understand the iSCSI initiator whitelist and CHAP configuration
- Know the `acli vg.create` command with `load_balance_vm_attachments=true`
- Be prepared to connect an external client to the VG via iSCSI
- Understand why you would use load-balanced VGs vs regular VGs

---

## Quick Reference: Key CLI Commands Summary

```bash
# AIDE
ncli cluster get-hypervisor-security-config
ncli cluster edit-hypervisor-security-params enable-aide=true
ncli cluster edit-hypervisor-security-params schedule=daily

# Cluster Resiliency
ncli cluster set-resiliency-preference desired-resiliency-preference=smart
ncli cluster get-resiliency-preference

# RF1 Container
ncli container create name=mycontainer rf=1 sp-name=default-storage-pool-xxxxx

# Volume Groups
acli vg.create myvg load_balance_vm_attachments=true
acli vg.disk_create myvg create_size=100G container=default
acli vg.iscsi_client_add myvg iqn.2025-01.com.client:initiator01

# Security Hardening
ncli cluster edit-hypervisor-security-params enable-high-strength-password=true
ncli cluster edit-hypervisor-security-params enable-banner=true
```

---

## Quick Reference: Prism Navigation Paths

| Feature | Path |
|---------|------|
| SQL Instance Details | PC → Operations → Integrations → SQL Server → [Instance] |
| Rebuild Capacity | PE → Settings → Rebuild Capacity Reservation |
| X-Play Playbooks | PC → Operations → Playbooks → + Create |
| VDI Security Policy | PC → Network & Security → Security Policies → Create → VDI Policy |
| Data-in-Transit Encryption | PC → Infrastructure → Hardware → Clusters → Actions → Enable |
| Recovery Plans | PC → Data Protection → Recovery Plans → Create |
| Volume Groups | PE → Storage → Volume Groups → + Volume Group |
| Storage Containers (RF1) | PE → Storage → Storage Container → + Storage Container |

> **PC** = Prism Central, **PE** = Prism Element

---

*Research compiled from Nutanix official documentation, community resources, and technical guides. Verify specific command syntax against your AOS/PC version.*
