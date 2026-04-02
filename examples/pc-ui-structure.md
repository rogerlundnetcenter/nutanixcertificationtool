# Prism Central UI Structure & Navigation Reference

> **Source:** Prism-Central-Guide-vpc_7_3.pdf (635 pages)
> **Purpose:** Comprehensive UI structure details for building a Prism Central simulator

---

## 1. Application Switcher (p47–50)

The Application Switcher is the top-level navigation mechanism. It organizes apps into **module groups**:

### Platform Services
| App | Description |
|-----|-------------|
| **Admin Center** | Admin tasks, IAM, categories, marketplace, UI settings |
| **Apps and Marketplace** | Redirects to Admin Center → Marketplace view |

### Cloud Infrastructure
| App | Description |
|-----|-------------|
| **Infrastructure** | Core PC app — VMs, clusters, storage, networking, DR, dashboards |
| **Kubernetes Management** | (formerly Karbon) K8s cluster provisioning |
| **Foundation Central** | Remote cluster creation & node reimaging |

### Cloud Manager (NCM)
| App | Description |
|-----|-------------|
| **Intelligent Operations** | (formerly Prism Pro/Ultimate) Capacity planning, anomalies, playbooks, reports |
| **NCM Self-Service** | (formerly Calm) App automation, LCM, multi-cloud provisioning |
| **Cost Governance** | (formerly Beam) TCO model, spend governance |
| **Security Central** | (formerly Flow Security Central) Multi-cloud security posture |

### Unified Storage
| App | Description |
|-----|-------------|
| **Files** | Scale-out file storage (NFS/SMB) |
| **Objects** | S3-compatible object storage |

### Database Services
| App | Description |
|-----|-------------|
| **Move** | Cross-hypervisor VM migration |
| **Database Service** | (NDB) Database provisioning & lifecycle |

**Notes:**
- New deployments show: Admin Center, Infrastructure, Apps and Marketplace, Cost Governance, Security Central for admin users
- Non-admin users see apps based on access policies
- The Application Switcher uses a Domain Manager container; fallback URLs exist if it's unreachable
- You **cannot** add custom applications to the Application Switcher

---

## 2. Prism Central Landing Page (p42–46)

### Top Bar Icons (left to right on the far right)
| Icon | Shortcut | Description |
|------|----------|-------------|
| Search | `f` | Global search field (context-sensitive) |
| Alerts | — | Bell icon; shows alert messages |
| Tasks | `p` | Shows running/completed tasks (last 48 hrs); blue=normal, yellow=warning, red=failure |
| Settings | `s` | Opens Infrastructure Settings page |
| Help | `h` | Help menu with online docs, support portal, community links |
| User Menu | `u` | Shows logged-in username; dropdown for password, profile, sign out, REST API Explorer, About |
| Intelligent Assist | — | Bottom-right corner; contextual recommendations/tips |
| Navigation (hamburger) | — | Opens/closes left sidebar Navigation Bar |

### Keyboard Shortcuts (p610)
| Key | Action |
|-----|--------|
| `s` | Settings Menu |
| `f` | Spotlight / Search bar |
| `u` | User Menu |
| `h` | Help menu |
| `p` | Recent tasks |
| Arrow keys | Navigate menu options |

### User Menu Dropdown Options (p46–47)
- Change Password
- Update Profile
- Download Cmdlets Installer
- Download nCLI
- REST API Explorer
- About Nutanix (shows AOS version info)
- Nothing To Do? (easter egg game)
- Sign Out
- Adjust Contrast (Chrome only: Normal / High)

---

## 3. Navigation Bar — Infrastructure App (p69–72)

The left sidebar Navigation Bar is toggled by the hamburger icon. Can be **locked** open or **unlocked** (auto-collapse). Entities can be **bookmarked** for quick access (star icon beside entity name). Bookmarks appear below Dashboard in the nav bar.

### Full Navigation Structure

```
📊 Dashboard
⭐ Bookmarks (user-defined)

📦 Compute & Storage
  ├── VMs
  ├── Templates
  ├── OVAs
  ├── Images
  ├── Catalog Items
  ├── Storage Containers
  ├── Volume Groups
  ├── Storage Policies
  └── vCenter Datastores

🌐 Network & Security
  ├── Subnets
  ├── Virtual Private Clouds
  ├── Floating IPs
  ├── Connectivity
  │     ├── Gateways (tab)
  │     ├── VPN Connections (tab)
  │     ├── Subnet Extensions (tab)
  │     └── BGP Sessions (tab)
  ├── Security Policies
  └── Security Dashboard

🛡️ Data Protection
  ├── Protection Summary
  ├── Protection Policies
  ├── Recovery Plans
  ├── VM Recovery Points
  ├── VG Recovery Points
  └── Consistency Groups

🖥️ Hardware
  ├── Clusters
  ├── Hosts
  ├── Disks
  └── GPUs

📋 Activity
  ├── Alerts
  ├── Events
  ├── Audits
  └── Tasks

⚙️ Operations
  ├── Analysis
  ├── Discovery (App Discovery)
  ├── Monitoring Configurations
  ├── Operations Policies
  ├── Planning
  ├── Playbooks
  ├── Reports
  └── Settings & Configurations

👥 Administration
  ├── LCM
  ├── Projects
  ├── Roles
  ├── Users
  └── Availability Zones

⚙️ Prism Central Settings
```

**Note:** Starting pc.2023.3, Operations entities (Analysis, Planning, Playbooks, Reports, etc.) moved to the **Intelligent Operations** app. They still appear in the Infrastructure nav bar but link to the IO app. Categories management moved to Admin Center in pc.7.3.

---

## 4. Main Dashboard — Infrastructure (p84–106)

### Dashboard Layout
- Widgets arranged in **rows of 4 tiles per row**
- Options: **Main Dashboard** tab, custom dashboard tabs, **Manage Dashboard**, **Reset Dashboard**, **Generate Report**, **Add Widget**
- **Data Density** toggle: Light / Comfortable (spacing between elements)

### Default Widgets (left→right, top→bottom)
| Widget | Description |
|--------|-------------|
| **Alerts** | Colored bar graph of alerts by severity; period dropdown (Last 1 hour, Last 24 hours, Last week) |
| **Cluster Quick Access** | List of managed clusters; click opens Prism Element in new tab |
| **Cluster Storage** | Storage + data resiliency per cluster; ordered by resiliency status (critical → OK) |
| **Cluster Latency** | Total R/W IO latency average for highest-latency clusters |
| **Cluster Memory Usage** | Memory % in use for highest-usage clusters |
| **Cluster CPU Usage** | CPU % in use for highest-usage clusters |
| **Controller IOPS** | Total R/W controller IOPS for highest-volume clusters |
| **Power Usage** | Accumulated power consumption over selected period |
| **Cluster Runway** | Storage, CPU, memory runway estimates (days until capacity) |
| **VM Efficiency** | Count of overprovisioned, inactive, constrained, bully VMs |
| **Tasks** | List of recent tasks with status |
| **Plays** | Playbook runs: completed, failed, paused counts |
| **Reports** | Total reports and scheduled reports count |
| **Data Discovery Status** | DR protection summary & recovery plans |
| **Security** | Security Dashboard summary; "View All Issues" link |

### Available Widget Types for Add Widget (p102–106)

#### Custom Widgets
| Widget | Parameters |
|--------|------------|
| **Custom Alerts Widget** | Widget Name, Select a Cluster (All/specific), Choose Size (1x1, 2x1, 2x2, 2x3, 2x4, 4x4), Severity (Critical/Warning/Info), Entity (Cluster/Storage/VM/Hardware/DR) |
| **Top Lists Widget** | Widget Name, Select a Cluster, Choose Size (2x1, 2x2, 2x3), Entity (Host/VM), Metric (IOPS/Memory Usage/CPU Usage/Bandwidth/Latency) |
| **Custom Chart Widget** | Widget Name, Entity Type (Host/Disk/Storage Pool/Storage Container/VM/Virtual Disk), Entity (specific), Metric (from entity metrics) |
| **Cluster Info Widget** | Widget Name, Select a Cluster — shows alerts, anomalies, runway, inefficient VMs |
| **Storage Over-provisioning** | Storage Over-provisioning Ratio threshold |

#### Virtual Infrastructure Widgets
- VM Efficiency (no params)

#### Hardware Widgets
- Cluster CPU Usage, Cluster Latency, Cluster Memory Usage, Cluster Quick Access, Cluster Runway, Cluster Storage, Controller IOPS, Impacted Cluster, Performance

#### Activity Widgets
- Tasks

#### Operations Widgets
- Plays, Reports, Discovered Apps

#### DR Widgets
- Data Discovery Status

#### Security Widgets
- Security

### Widget Features
- **Resize:** Drag bottom handle; multiples of half default length (0.5x, 1x, 1.5x, 2x, 2.5x)
- **Drill-down:** Click chart data → expanded time-series view; hover for point details
- **Full View** link at bottom of drill-down → entity details page
- **Add To Analysis** link → adds chart to Analysis dashboard
- **Period selection:** Most widgets have dropdown: Last 1 hour, Last 24 hours, Last week

### Generate Report (p96–98)
- **Download** as PDF or CSV
- **Email** to recipients
- **Save as Report Configuration** for scheduled reporting

---

## 5. VM Management in Prism Central (p107–135)

### VMs Page Tabs (p108)
The VMs page has **6 tabs on the left side**:
1. **Summary** — widgets: Highlighted Entities, Alerts, Anomalies
2. **List** — tabular VM list (default view when navigating to Compute > VMs)
3. **Policies** — VM-Host Affinity, VM-VM Anti-Affinity, NGT Policies
4. **Alerts** — VM-related alerts
5. **Events** — VM-related events
6. **Metrics** — Performance metrics across VMs

**Non-Nutanix VMs:** Dropdown "Non-Nutanix environment" shows ESXi VMs with subset of fields (name, node name, hypervisor, memory, IP addresses, power state, cluster name).

### VM List Tab — Columns by View Type (p109–115)

#### View by: General (default)
| Column | Values |
|--------|--------|
| Name | VM name (clickable → details) |
| Power State | On / Off |
| vCPUs | Integer |
| Memory Capacity | xx GiB |
| IP Addresses | IPv4/IPv6 |
| Cluster | Cluster name |
| Hypervisor | AHV / ESXi |
| Guest OS | OS name |
| NGT Status | Installed / Not Installed |
| Project | Project name |
| Owner | Username |

#### View by: Performance
| Column | Values |
|--------|--------|
| Name | VM name |
| Memory Overcommit | State |
| Memory Usage % | Percentage |
| CPU Usage % | Percentage |
| Read IOPS | Integer |
| Write IOPS | Integer |
| IO Bandwidth | MBps/KBps |
| IO Latency | ms |
| Cluster | Cluster name |

#### View by: Anomalous Behavior
| Column | Values |
|--------|--------|
| Name | VM name |
| Anomaly Count | Integer (Memory, I/O, CPU, Networking, Disk) |
| Anomaly Reporting | Enabled / Disabled |

#### View by: Efficiency
| Column | Values |
|--------|--------|
| Name | VM name |
| Efficiency | Overprovisioned / Inactive / Constrained / Bully / Normal |
| Efficiency Reason | Text description |
| Project | Project name |
| Owner | Username |
| Cluster | Cluster name |

#### View by: GPU
| Column | Values |
|--------|--------|
| Name | VM name |
| GPU Board | Board/type name |
| GPU Configuration | Passthrough / vGPU profile |
| GPU Usage % | Percentage |
| GPU Framebuffer Usage % | Percentage |

#### View by: Categories
| Column | Values |
|--------|--------|
| Name | VM name |
| Categories | Category key:value mapped to VM |

#### View by: Data Protection
| Column | Values |
|--------|--------|
| Name | VM name |
| Consistency Group | Group name |
| Protection Status | Protected / Unprotected |
| Sync Status | In Sync / Out of Sync |
| Protection Type | Async / NearSync / Sync |
| Protection Policy | Policy name |
| Recovery Plans | Plan name(s) |

#### View by: Storage Configuration
| Column | Values |
|--------|--------|
| Name | VM name |
| Replication Factor | 1/2/3 |
| Encryption | On/Off/Inherit from Cluster |
| Compression | On/Off/Inherit from Cluster |
| Throttled IOPS | Value |
| Throttled Throughput | Value |
| Storage Policy | Policy name |
| Compliance State | Compliant / Non-compliant |
| Cluster | Cluster name |

#### Additional Columns Available (for custom views)
- AZ Name, Cluster UUID, Constrained Level, Total IOPS, Read IO Bandwidth, Read IO Latency, Write IO Bandwidth, Write IO Latency, Creation Time, Description, Disk Capacity, Disk Usage %, Disk Usage, Efficiency Reason, Health, Host Name, Host IP, Host UUID, Total IOPS, Is CVM, NIC Count, Network Bytes Received/Sent, Network Packets Received/Sent, NGT Status, NGT Communication Status, NGT Transport Type, NGT Installed, Overprovisioned Type/Level, Power State, Services Enabled, Shared Data Usage, Snapshot Storage, Working Set Size (Total/Read/Write), SR-IOV NIC, VM Type, VPC Name

### VM List Tab — Actions Dropdown (p115–116, 150–160)
- **Create VM** — launches Create VM wizard
- **Create VM from Catalog Item** — (Self Service users)
- **Update** — opens Update VM dialog
- **Delete** — confirm deletion
- **Clone** — clone a VM
- **Manage Categories** — assign categories
- **Manage Ownership** — assign to project/user
- **Power On / Power Off / Power Cycle / Reset**
- **Pause / Resume**
- **Guest Shutdown / Guest Reboot**
- **Launch Console** — opens VNC console in new tab
- **Assign to Recovery Plan**
- **Migrate** — within cluster or cross-cluster live migration
- **Add to Catalog**
- **Install NGT / Manage NGT / Upgrade NGT / Remove NGT**
- **Enable Nutanix Guest Agent / Enable VSS / Enable SSR**

### VM List Tab — Filter Pane Fields (p116–121)
| Filter | Type |
|--------|------|
| Labels | Dropdown (select labels) |
| Name | Condition + string (Contains/Doesn't contain/Starts with/Ends with/Equal to) |
| IP Address | String |
| Description | Condition + string |
| Cluster | Dropdown (cluster names) |
| Hypervisor | Checkbox (AHV / ESXi) |
| Power State | Checkbox (On / Off) |
| VM Type | Checkbox (User VM / CVM) |
| vCPUs | Range (From/To) |
| Memory Capacity | Range (From/To GiB/TiB) |
| Guest OS | String |
| NGT Status | Checkbox |
| Project | Dropdown |
| Owner | String |
| Health | Checkbox (Critical/Warning/Good) |
| CPU Usage | Range % |
| Memory Usage | Range % |
| IOPS | Range |
| IO Latency | Range (ms) |
| IO Bandwidth | Range |
| Efficiency | Checkbox (Overprovisioned/Inactive/Constrained/Bully) |
| Categories | Dropdown |
| Protection Status | Checkbox |
| Protection Type | Checkbox |

### Group by Options (p58)
Cluster, Hypervisor, Power State, vCPU, Health, Type, Name

### VM Details Page — Tabs (p121–135)
| Tab | Content |
|-----|---------|
| **Summary** | Widgets: Details, Policies & Management, Performance, Compute, Storage, Infrastructure, External Devices, Guest Tools |
| **Console** | VNC console window |
| **Recovery Points** | List of recovery points / snapshots |
| **Alerts** | VM-specific alerts |
| **Events** | VM-specific events |
| **Metrics** | Performance metrics with time charts |
| **Disks** | Disk list: Type, Size, Storage Container, Bus Type |
| **Categories** | Assigned categories key:value pairs |
| **Hardware** | Hardware details |
| **NICs** | NIC list: Name, Network, MAC, IP, VLAN, Type |
| **Apps & Relationships** | Associated applications and entity relationships |

### VM Details — Summary Tab Widgets (p122–127)

**Details Widget:** VM Name, Description, VM UUID, Project, Cluster, Host, Hypervisor, Status, Creation Time, Protection Status, AZ Name, GPU(s)

**Policies & Management Widget:** Categories, Labels, Owner, Affinity Policies

**Performance Widget:** CPU Usage %, Memory Usage %, IOPS (R/W), IO Bandwidth (R/W), IO Latency (R/W)

**Compute Widget:** vCPUs, Cores per vCPU, Memory, Memory Overcommit

**Storage Widget:** Total Disk Size, Used Storage, Snapshot Storage, Storage Policy, Compression, Replication Factor, Encryption, IOPS Throttle, Throughput Throttle

**Infrastructure Widget:** Cluster, Host, Hypervisor, AZ

**External Devices Widget:** GPU info (Board, Profile, Usage)

**Guest Tools Widget:** NGT Version, Communication Status, VSS/SSR status

### Create VM Wizard (AHV) — Steps (p138–149)
1. **Configuration:** Name, Description, Cluster, vCPUs, Cores per vCPU, Memory
2. **Resources:**
   - Disks: Type (Disk/CD-ROM), Operation (Allocate/Clone from Image/Clone from Volume Group), Bus Type (SCSI/IDE/PCI/SATA), Size
   - NICs: Subnet, VLAN, IPAM, IP Address, Connected/Disconnected
   - GPU: Profile selection
3. **Management:**
   - Categories assignment
   - Timezone
   - Guest Customization: Cloud-init (Linux) / Sysprep (Windows)
   - Script Type: Custom Script / Guided Script
   - Boot Configuration: Legacy BIOS / UEFI / Secure Boot

---

## 6. Hardware Entities

### Clusters Summary View (p403–413)

**Tabs:** Summary, List, Alerts, Events, Metrics

#### Clusters List Columns
| Column | Values |
|--------|--------|
| Name | Cluster name (clickable → details) |
| Upgrade Status | Available / Up to date / Downloading / In Progress |
| AOS Version | Version string |
| Cluster VIP | Virtual IP address |
| Number of Nodes | Integer |
| Storage Capacity | xxx TiB |
| Current Redundancy Status | OK / Critical / Warning |
| Desired Redundancy Factor | RF value |
| Hypervisor Types | AHV / ESXi / Mixed |
| Encryption | Enabled / Disabled |
| Long-Term Support | Yes / No |

#### Cluster Details Page — Tabs
| Tab | Content |
|-----|---------|
| **Summary** | Properties widget (Name, UUID, VIP, ISCSI IP, NTP servers, DNS, timezone), Usage widget, Alert/Anomaly widgets |
| **Alerts** | Cluster-specific alerts |
| **Events** | Cluster-specific events |
| **Metrics** | CPU Usage, Memory Usage, Storage Usage, IOPS, IO Bandwidth, IO Latency |
| **Hosts** | Hosts in this cluster |
| **VMs** | VMs running on this cluster |
| **Settings Profiles** | Applied settings profiles |

### Hosts Summary View (p424–432)

**Tabs:** Summary, List, Alerts, Events, Metrics

#### Hosts List Columns
| Column | Values |
|--------|--------|
| Name | Host name (clickable → details) |
| IP Address | Host IP |
| CVM IP Address | Controller VM IP |
| Hypervisor | AHV / ESXi |
| Cluster | Cluster name |
| Number of VMs | Integer |
| CPU Model | Model name |
| CPU Capacity | GHz |
| CPU Usage % | Percentage |
| Memory Capacity | GiB |
| Memory Usage % | Percentage |
| Disk Count | Integer |
| Boot Drive | Drive info |
| Serial Number | S/N |
| Block Model | Hardware model |

#### Host Details Page — Tabs
| Tab | Content |
|-----|---------|
| **Summary** | Properties (Name, Hypervisor, CPU, Memory, Serial, Block Model, IPMI IP), Usage, Alerts, Anomalies |
| **Alerts** | Host-specific alerts |
| **Events** | Host-specific events |
| **Metrics** | CPU, Memory, IO metrics |
| **VMs** | VMs on this host |
| **Disks** | Disks in this host |

### Disks Summary View (p444–449)

**Tabs:** Summary, List, Alerts, Metrics

#### Disks List Columns
| Column | Values |
|--------|--------|
| Serial Number | Disk serial |
| Disk Status | Normal / Failed / Online mounting |
| Storage Tier | SSD / HDD / NVMe |
| Disk Size | TiB |
| Host Name | Host |
| Cluster | Cluster name |
| IOPS | Integer |
| IO Bandwidth | MBps |
| IO Latency | ms |
| Storage Pool | Pool name |

### GPUs Summary View (p450–452)

#### GPUs List Columns
| Column | Values |
|--------|--------|
| Name | GPU name |
| Mode | Passthrough / vGPU |
| Cluster | Cluster name |
| Host | Host name |
| GPU Type | Type name |
| Vendor | NVIDIA / AMD |
| Assigned VMs | VM names |

---

## 7. Storage Entities

### Storage Containers Summary View (p281–286)

**Tabs:** Summary, List, Alerts, Events, Metrics

#### Summary Tab Widgets
- **Highlighted Entities** — top containers by: IO Latency, IOPS, Bandwidth
- **Alerts** — by interval: Last week, Last 24 hours, Last 1 hour
- **Anomalies** — by interval

#### List Tab Columns (General view)
| Column | Values |
|--------|--------|
| Name | Container name (clickable) |
| Free Space (Physical) | GiB/TiB |
| Physical Usage | GiB/TiB (with usage bar) |
| Cluster Fault Tolerance | 1N/1D, 1N&1D, 2N/2D |
| Replication Factor | Integer (1-3) |
| Compression | On / Off |
| Capacity Deduplication | On / Off |
| Erasure Coding | On / Off |
| IOPS | Integer |
| IO Bandwidth | MBps/KBps |
| IO Latency | ms |

#### List Tab Columns (Optimization view)
| Column | Values |
|--------|--------|
| Name | Container name |
| Data Reduction Ratio | xx:1 |
| Data Reduction Savings | GiB/TiB |
| Compression Delay | xx min |
| Effective Free Space | GiB/TiB |
| Overall Efficiency | xx:1 |

### Volume Groups Summary View (p311–316)

**Tabs:** Summary, List, Alerts, Metrics

#### Volume Groups List Columns
| Column | Values |
|--------|--------|
| Name | VG name (clickable) |
| Target Prefix | iSCSI target prefix |
| Created Time | Date/time |
| Cluster | Cluster name |
| Total Capacity | GiB/TiB |
| Attachment Type | Direct / iSCSI |

---

## 8. Network & Security Entities (p347–399)

### Subnets Summary View (p357–360)
| Column | Values |
|--------|--------|
| Name | Subnet name |
| Type | VLAN / Overlay |
| VLAN ID | Integer |
| IP Prefix | CIDR |
| Virtual Switch | VS name |
| Cluster | Cluster name |
| VPC | VPC name (overlay only) |
| IP Pool | IP range |
| Gateway | Gateway IP |

### Virtual Private Clouds Summary View (p362–367)
| Column | Values |
|--------|--------|
| Name | VPC name (clickable → details) |
| Externally Routable IPs | IP ranges |
| Subnets | Count |
| VMs | Count |

### Floating IPs Summary View (p381)
| Column | Values |
|--------|--------|
| Floating IP | IP address |
| State | Assigned / Unassigned |
| VPC | VPC name |
| Associated VM | VM name |

### Security Policies Summary View (p523–527)

**Tabs:** Policies, Services, Addresses

#### Policies Tab Columns
| Column | Values |
|--------|--------|
| Name | Policy name |
| Type | Application / Quarantine / Isolation / VDI |
| Purpose | Description text |
| Policy | High-level boxed visual |
| Status | **Enforced** / **Monitoring** |
| Last Modified | Timestamp |

**Actions:** Update, Delete, Enforce (if monitoring), Monitor (if enforced)

#### Services Tab Columns
| Column | Values |
|--------|--------|
| Name | Service name |
| Description | Text |
| Services | Protocol-Port (e.g., TCP 1027) |
| Policies | Attached policy names |

#### Addresses Tab Columns
| Column | Values |
|--------|--------|
| Name | Address group name |
| Description | Text |
| Subnets | Subnet IP(s) |
| Policies | Attached policy names |

#### Security Policy Detail View (p527)
- **Toggle: Show Blocked Traffic** (when Enforced)
- **Toggle: Show Discovered Traffic** (when Monitoring)
- Visual policy diagram showing sources → rules → destinations
- Actions: Update, Delete, Enforce/Monitor toggle

#### Filter Pane (p526)
| Filter | Values |
|--------|--------|
| Name | Condition + string |
| Type | Checkbox: Application, Quarantine, Isolation, VDI |
| Status | Checkbox: Enforced, Monitoring |

---

## 9. Data Protection & Recovery (p400)

All DR entity pages reference the **Nutanix Disaster Recovery Guide** for detailed content. The PC Infrastructure app provides these entity views:

### Navigation Items
| Entity | Description |
|--------|-------------|
| **Protection Summary** | DR overview dashboard, health monitoring, DR report generation |
| **Protection Policies** | Configurable policies for recovery point creation & replication to recovery AZs |
| **Recovery Plans** | Orchestrated recovery of protected entities to different clusters/AZs |
| **VM Recovery Points** | VM-level recovery points/snapshots |
| **VG Recovery Points** | Volume Group recovery points |
| **Consistency Groups** | Groups of VMs/VGs that are snapshotted together |

### Availability Zones (p481)
- DR works with physically isolated locations called **Availability Zones (AZs)**
- Configured under Administration > Availability Zones
- Used in protection policies and recovery plans for failover targets

### Dashboard Widget: Data Discovery Status
- Shows Protection Summary and Recovery Plans
- If no recovery plan exists, shows "How to setup?" link

---

## 10. Activity Entities

### Alerts (p472)
- Documented in separate Prism Central Alerts and Events Reference Guide
- Accessible via Activity > Alerts

### Events (p472)
- Documented in separate Prism Central Alerts and Events Reference Guide
- Accessible via Activity > Events

### Audits Summary View (p473–475)

**Columns:**
| Column | Values |
|--------|--------|
| Action Description | Description of action |
| User Name | Who performed it |
| Entity Type | VM, Storage Container, Catalog Item, Image, Cluster, Host, Disk, GPU, Security Policy, NGT Policy, Project, Role, User, Category, Availability Zone, Protection Policy, Recovery Plan, Recoverable Entity, Report |
| Operation Type | Create, Update, Delete, Power State Change |
| Request Time | Date/time |
| Cluster | Cluster name |

**Filter Pane:**
| Filter | Values |
|--------|--------|
| User IP | IP address(es) |
| Cluster | Cluster name |
| Entity Type | Checkboxes for entity types above |
| Operation Type | Create, Update, Delete, Power State Change |
| Request Time | Interval (custom from/to) |

**Retention:** 4 weeks default

### Tasks View (p476–479)

**Columns:**
| Column | Values |
|--------|--------|
| Task | Task name/description |
| Entity Affected | Entity name or UUID (up to 5 shown) |
| Cluster | Cluster name(s); dash for PC-level tasks |
| Status | Canceled, Canceling, Failed, Queued, Running (with %), Succeeded, Suspended |
| Initiator | Username |
| Start Time | Date/time |
| Duration | xx seconds/minutes/hours/days |

**Side panel on task select:** Overall status, all entities affected (max 300), cluster, initiator, duration, child tasks, sub-steps, errors/warnings

**Filter Pane:**
| Filter | Condition |
|--------|-----------|
| Task | Contains/Equal to/Not Equal to/Doesn't contain/Starts with/Ends with |
| Entities Affected | Same conditions |
| Initiator | Same conditions |
| Cluster | Dropdown |
| Status | Checkboxes: Canceled, Canceling, Failed, Queued, Running, Suspended, Succeeded |
| Time Range | Start and End date/time |

**Features:** Export to CSV, filter bookmarking

---

## 11. Operations Entities (p480)

Starting pc.2023.3, moved to **Intelligent Operations** app (separate UI). Still accessible from Infrastructure nav bar:

| Entity | Purpose |
|--------|---------|
| **Analysis** | Performance analysis dashboard, custom metric charts |
| **App Discovery** | Discover applications running in environment |
| **Monitoring Configurations** | Monitoring integrations setup |
| **Operations Policies** | Automated operations policy management |
| **Planning** | Capacity runway, what-if scenarios, resource planning |
| **Playbooks** | X-Play automation: triggers → actions |
| **Reports** | Report generation, templates, scheduling |
| **Settings & Configurations** | IO-specific settings |

> **Full documentation in Intelligent Operations Guide** (separate document)

---

## 12. Administration Entities (p481)

| Entity | Description |
|--------|-------------|
| **Users** | User management — see Security Guide |
| **Roles** | Role management, RBAC — see Security Guide |
| **Projects** | Self-service project management — see Admin Center Guide |
| **LCM** | Life Cycle Manager for firmware/software updates |
| **Availability Zones** | DR availability zone configuration |

**Note:** Category management moved to Admin Center in pc.7.3 (see Admin Center Guide).

---

## 13. Policies in Infrastructure (p482–549)

### VM Policies

#### VM-Host Affinity Policies (p482–492)
**Summary View Columns:**
| Column | Values |
|--------|--------|
| Name | Policy name |
| Description | Text |
| Compliance | Compliant / Non-compliant |
| VM Count | Integer |
| Host Count | Integer |

**Details View Tabs:** Summary, VMs, Hosts, Alerts

#### VM-VM Anti-Affinity Policies (p493–503)
**Summary View Columns:**
| Column | Values |
|--------|--------|
| Name | Policy name |
| Description | Text |
| Compliance | Compliant / Non-compliant |
| VM Count | Integer |

#### NGT Policies (p504–506)
**Summary View Columns:** Name, Description, Status

### Image Policies

#### Image Placement Policies (p509–516)
Uses **categories** to associate images with target clusters.

**Summary View Columns:**
| Column | Values |
|--------|--------|
| Name | Policy name |
| Enforcement State | Active / Suspended |
| Cluster Categories | Category values |
| Image Categories | Category values |

#### Bandwidth Throttling Policies (p517–522)
**Summary View Columns:**
| Column | Values |
|--------|--------|
| Name | Policy name |
| Bandwidth | Value + unit |
| Schedule | Schedule description |

### Storage Policies (p528–549)
**Summary View Columns:**
| Column | Values |
|--------|--------|
| Name | Policy name |
| Replication Factor | 1/2/3 |
| Encryption | On/Off |
| Compression | Inline/Post-process/None |
| QoS | IOPS/Throughput values |
| Categories | Associated categories |
| Compliance | Compliant / Non-compliant |

**Default Storage Policy:** Auto-created on pc.2024.1; manages RF, encryption, compression, QoS for entities via categories.

---

## 14. Images Management (p249–278)

### Images Summary View — Tabs
1. **List** — image table
2. **Policies** — Placement Policies, Bandwidth Throttling Policies

### Images List Columns (p251)
| Column | Values |
|--------|--------|
| Name | Image name (clickable → details) |
| Description | Text |
| Type | ISO / Disk |
| Size | MB / GB |
| Creator | Username (e.g., admin) |

### Image Details View — Tabs
| Tab | Content |
|-----|---------|
| **Summary** | Info widget (same as list columns) |
| **Location** | Clusters containing image: Name, AOS Version, Hypervisor, Host Count, VM Count |
| **Policies** | Placement and Bandwidth policies applying to this image |

### Image Sources
- Workstation upload
- Remote Server URL
- VM Disk

### Actions
- Update, Delete, Add Image to Catalog, Manage Categories, Download Image

---

## 15. Search Functionality (p73–83)

### Search Basics
- **Context-sensitive:** Auto-populates based on current page (e.g., "Dashboard" on landing, "VMs" on VM page)
- **Access:** Click search field, or press `/` key, or press `f` shortcut
- Case insensitive
- **Bookmark** filtered pages with Star icon → adds to Navigation Bar Bookmarks

### Search Results Dropdown Options
When typing "VM":
- **Category Value** → Category page with VM-related entries
- **VM Type=User VM** → Filtered Summary for user VMs
- **[blank]** → Unfiltered Summary for any user VM
- **VM Type=User VM > List** → List page of user VMs
- **VM Type=User VM > Alerts** → Alerts page of user VMs
- **Search in Prism** → Full search results across PC

### Query Syntax Forms
| Pattern | Example |
|---------|---------|
| `entity` | `vms`, `cluster`, `disk` |
| `entity metric` | `vm iops`, `vm cpu` |
| `entity attribute metric` | `node failure alerts` |
| `metric operator value` | `"block model"=1050` |
| `complex expression` | `clusters hypervisor=AHV "cpu usage" < 30` (implied AND) |
| `action expression` | `<vm_name> launch console`, `create vm` |

### Filter Operators
| Operator | Description |
|----------|-------------|
| `~` | Contains |
| `!~` | Does not contain |
| `=x*` | Starts with |
| `=*x` | Ends with |
| `=` | Equal to |
| `!=` | Not equal to |
| `>` | Greater than |
| `>=` | Greater than or equal to |
| `<` | Less than |
| `<=` | Less than or equal to |
| `=[10 to 30]` | Range |

### Search Keywords
| Category | Keywords |
|----------|----------|
| **Entities** | vm, cluster, node, container, disk |
| **General metrics** | cpu usage, memory usage, disk usage, free physical storage, iops, read iops, write iops, io bandwidth, io latency, memory capacity |
| **Cluster fields** | cluster name, ip address, version, number of hosts, cpu count, memory capacity, runway, storage runway, cpu runway, memory runway |
| **VM fields** | vm name, ip address, host ip, virtual cpus count, power state, reserved memory, os, virtual hardware version |
| **Disk fields** | serial, tier, mode, iops |
| **Container fields** | container name, rf, on disk deduplication, perf-tier deduplication, compression, erasure coding |
| **Node fields** | host name, ip address, service vm, hypervisor name, cpu capacity, cpu model, cpu sockets count, cpu cores count, cpu thread count, serial number, block model |
| **Alert keywords** | alert, alert title, severity (critical/warning/info), categories (capacity/performance/configuration/availability/system indicator), disposition (resolved/unresolved/acknowledged/unacknowledged) |
| **VM actions** | clone, migrate, delete, power on, power off, suspend, create vm, launch console, create network config, resume, snapshot, update, configure vm host affinity |
| **Cluster actions** | launch prism element, unregister |

### Example Queries
```
clusters running out of cpu
clusters hypervisor = AHV "cpu usage" < 30
VMs "Power State"=On List
<vm_name> launch console
<cluster_name> launch prism element
create vm
vm os=Linux
containers Rf > 2
disks tier=ssd
Alerts "Create Time"="08-Nov-2018 9:46 AM to 08-Nov-2018 10:46 AM" Severity=Critical
```

---

## 16. Settings — Infrastructure Application (p51–53)

### Settings Categories & Tasks

#### General
| Setting | Description |
|---------|-------------|
| Entity Sync | Force sync entities with availability zones |
| Licensing | Redirects to Admin Center licensing page |
| Nutanix DRaaS | Connect to DRaaS domain |
| Prism Central Management | View PC info, scale out PC |
| Upgrade Prism Central | Upgrade PC VM to newer version |
| Witness | Configure witness service for 2-node clusters |

#### Setup
| Setting | Description |
|---------|-------------|
| Enable Nutanix Disaster Recovery | Enable DRaaS capability |
| Project Manager Management | Redirects to Admin Center IAM settings |
| OOB Management Credentials | Out-of-Band management credentials |
| vCenter Registration | Register/unregister clusters with vCenter |

#### Network
| Setting | Description |
|---------|-------------|
| Advanced Networking | Enable advanced networking for AHV clusters |

#### Flow
| Setting | Description |
|---------|-------------|
| ID Based Security | Active Directory config for identity-based security policies |
| Flow Microsegmentation | Enable/disable Flow microsegmentation feature |

#### Authentication
| Setting | Description |
|---------|-------------|
| Local User Management | Local user management |
| User and Roles | User/role configuration |
| Role Mapping | Map directory groups to roles |

#### More Settings
Redirects to Admin Center application settings.

---

## 17. Prism Self Service (p552–563)

### User Roles
1. **Self-service administrator** — Sets up infrastructure, creates projects, manages admins
2. **Project manager** — Manages day-to-day project operations (delegated by admin)
3. **Project user** — Creates/manages VMs within project scope (custom self-service GUI)

### Self Service VM Creation Workflow
1. Navigate to Compute > VMs
2. Click **Create VM from Catalog Item** (appears for project managers/members with permissions)
3. Select **Catalog Type:** VM Template or Image
4. Select **Catalog Item** from list
5. Click **Begin**
6. **Configuration step:** Name, Project, Cluster, Number of VMs, vCPUs, Cores per vCPU, Memory
7. **Resources step:** Disks (+ New Disk / + New CDROM), NICs (Attach to Subnet), Boot Config (Legacy BIOS/UEFI/Secure Boot)
8. **Management step:** Guest Customization (Cloud-init for Linux / Sysprep for Windows), Script Type, Configuration Method

---

## 18. Entity Page Common Patterns (p57–62)

### Standard Entity Page Layout
Every entity page follows a common structure:
- **Entity tabs** across the top (vary by entity)
- **Actions dropdown** for selected items
- **Group by** dropdown
- **View by** dropdown (General, Performance, Anomalous Behavior, Efficiency, GPU, Data Protection, Storage Configuration, + Add custom)
- **Modify Filters** button (far right) → opens Filter Pane
- **Query/filter field** showing active filters
- **Table/list** of entities
- **Export** button for CSV download (max 1000 rows)
- **Rows per page:** 10, 20 (default), 30, 40, 50, 60
- **Label** icon for custom groupings (VMs and Clusters only, super admin/Prism admin only)

### View Options
- **Grid** (tabular) — default; click column header to sort
- **Tiles** — card view with sort dropdown
- **Circles** — bubble/circle visualization with sort dropdown

### Custom View Creation
1. Click View by → **+ Add custom**
2. Enter custom view name
3. Select up to 10 entity properties (Name always included)
4. Reorder with up/down arrows
5. Click Save
- Custom views are **per-user** (not visible to other users)

---

## 19. Compute Entity Sub-pages

### VM Templates (p202–215)
**Summary View Columns:** Name, Template Version, Source VM, Cluster, Created By, Created Time
**Details View Tabs:** Summary, Version History, VMs

### Kubernetes Clusters (p216–224)
**Summary View Columns:** Name, Status, K8s Version, Cluster, Node Count, Worker Count
**Details View Tabs:** Summary, Nodes, Storage, Add-ons

### OVAs (p225–248)
**Summary View Columns:** Name, Size, Disk Count, NIC Count, Created Time
**Actions:** Deploy as VM, Download, Rename, Delete, Export VM as OVA

### Catalog Items (p274–278)
**Summary View Columns:** Name, Type (Image/VM Template), Description, Source
**Actions:** Add Catalog Item, Delete

---

## 20. Connectivity Sub-pages (p382–398)

Under Network & Security > Connectivity:

### Gateways Summary (p383)
| Column | Values |
|--------|--------|
| Name | Gateway name |
| Type | Local/Transit |
| VPC | VPC name |
| Status | Active/Inactive |

### VPN Connections Summary (p386)
| Column | Values |
|--------|--------|
| Name | Connection name |
| Gateway | Gateway name |
| Remote Gateway | Remote gateway IP |
| Status | Connected/Disconnected |
| VPC | VPC name |

### Subnet Extensions Summary (p390)
| Column | Values |
|--------|--------|
| Name | Extension name |
| Subnet | Subnet name |
| Remote Cluster | Cluster name |

### BGP Sessions Summary (p395)
| Column | Values |
|--------|--------|
| Name | Session name |
| Remote ASN | ASN number |
| Local IP | IP |
| Remote IP | IP |
| Status | Established/Idle |

---

## 21. Virtual Switches (p347–357)

### Virtual Switches Summary View
| Column | Values |
|--------|--------|
| Name | Switch name |
| MTU | Integer |
| Bond Mode | active-backup / balance-slb / balance-tcp / LACP |
| Description | Text |
| Uplinks | NIC list |

### Virtual Switch Details — Tabs
| Tab | Content |
|-----|---------|
| **Summary** | Properties, Configuration, Connected Subnets, Hosts |
| **Alerts** | Switch-specific alerts |

---

## 22. Traffic Mirroring (p368–380)

### Summary View Columns
| Column | Values |
|--------|--------|
| Name | Session name |
| State | Active / Disabled |
| Source | Source config |
| Destination | Destination config |

### Actions
- Create, Update, Enable, Disable, Delete

---

## 23. NIC Management (p453–471)

### NICs Page — Tabs
1. **NIC List** tab
2. **NIC Profile** tab

### NIC List Columns
| Column | Values |
|--------|--------|
| NIC Name | Port name |
| NIC Family | Family/model |
| Host | Host name |
| Cluster | Cluster name |
| MAC Address | MAC |
| Link Speed | Gbps |
| Status | Up / Down |

### NIC Profile Columns
| Column | Values |
|--------|--------|
| Name | Profile name |
| NIC Family | Family |
| Capabilities | SR-IOV / Network Offload |
| NIC Port Count | Integer |

---

## Key Terminology Reference

| Term | Meaning |
|------|---------|
| **PC** | Prism Central (multi-cluster management) |
| **PE** | Prism Element (single-cluster management) |
| **AHV** | Acropolis Hypervisor (Nutanix native) |
| **CVM** | Controller VM (storage controller per host) |
| **NGT** | Nutanix Guest Tools |
| **AZ** | Availability Zone |
| **NCM** | Nutanix Cloud Manager |
| **RF** | Replication Factor |
| **QoS** | Quality of Service |
| **VG** | Volume Group |
| **VPC** | Virtual Private Cloud |
| **IPAM** | IP Address Management |
| **LCM** | Life Cycle Manager |
| **RBAC** | Role-Based Access Control |
| **IAM** | Identity and Access Management |
| **DR** | Disaster Recovery |
| **DRaaS** | Disaster Recovery as a Service |
| **IO** | Intelligent Operations |
| **SSR** | Self-Service Restore |
| **VSS** | Volume Shadow Copy Service |
| **CCLM** | Cross-Cluster Live Migration |
