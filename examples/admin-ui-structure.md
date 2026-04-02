# Nutanix Prism Central — Admin Center UI Structure

> **Source**: *Prism Central Admin Center Guide* (vpc_7_5), 138 pages

---

## 1. Admin Center Overview (pp. 6–8)

Admin Center is a centralized workspace for common administrative tasks across the Nutanix platform and apps.

### Navigation Bar Items

| Nav Item | Description |
|---|---|
| **My Apps** | Manage deployed Nutanix & Partner apps |
| **Marketplace** | Deploy new Nutanix & Preferred Partner apps |
| **Projects** | Manage projects, users, quotas, environments |
| **IAM** | Identity & Access Management (users, roles, auth policies) |
| **LCM** | Life Cycle Manager (inventory, updates) |
| **Licensing** | Apply and manage licenses |
| **Settings** | Global PC settings (policy engine, SMTP, SNMP, alerts, syslog, NTP, etc.) |

The navigation bar can be **locked open** to persist while switching entities.

### Application Switcher (p. 8)

The Application Switcher sits at the top of Prism Central and allows seamless switching between deployed apps.

**Default apps visible for Prism Admin role:**
- Admin Center
- Infrastructure
- Apps and Marketplace
- Cost Governance
- Security Central

After enabling apps from Marketplace, they also appear in the switcher (Files, Objects, Database Service, Self-Service, Foundation Central, etc.).

**Non-admin users** see apps based on their access policies (e.g., Consumer role sees only Infrastructure + Apps and Marketplace).

---

## 2. Marketplace (pp. 9–32)

### Enabling Marketplace (pp. 9–10)

**Prerequisites:**
- Additional 2 GB RAM (small PC) or 4 GB RAM (large PC)
- Unique Data Service IP configured in Prism Element
- Supported on AHV and ESXi only (not Hyper-V; not x-small PC)

**Steps:** Admin Center → Marketplace → **Enable Marketplace**

### App Categories (Table 1, p. 9)

| Category | Description |
|---|---|
| **Nutanix Apps** | Developed/certified by Nutanix (Self-Service, Files, Objects, Foundation Central, Move, Database Service, Kubernetes, etc.) |
| **Preferred Partner Apps** | Co-developed with partners, pre-seeded (OpenShift, Cisco Intersight Device Connector) |

### Searching/Filtering (p. 11)

- **Search field:** "Search Marketplace" free-text
- **Filters button:** Checkboxes for `Nutanix`, `Preferred_Partners`, or both

### Viewing App Details (p. 11)

Click **Get** on an app tile → App details page shows: overview, version, actions (Deploy)

---

### Nutanix Apps Deployment Wizards (pp. 11–20)

Each app follows a common pattern: **Admin Center → Marketplace → Get → Deploy → confirmation → Deploy**. Variations noted below.

| App | Page | Wizard Specifics |
|---|---|---|
| **Self-Service** | 12 | Integrated into PC, no extra VMs. Click Deploy twice. |
| **Files** | 12–13 | Click Deploy twice. Appears in Application Switcher. |
| **Foundation Central** | 13 | Click Deploy twice. |
| **Nutanix Kubernetes Platform** | 13–14 | Verify OS images before deploying. Click Deploy twice. |
| **Nutanix Objects** | 14–15 | After deploy: Welcome page → Download Creation Checklist → (ESXi: vCenter Registration) → Next → Create Object Store. |
| **Database Service** | 15–16 | Wizard fields: **Application Name**, **Application Description**, **EraService** section (HA config), **NETWORK ADAPTERS (NICs)** dropdown. Multiple instances allowed. |
| **Nutanix Move** | 16–17 | Wizard fields: **Application Name**, **Application Description**, **MoveService** section — vCPUs: 2, Cores per vCPU: 2, Memory: 8 GiB, Disk 2 (SCSI): 50 GiB, NIC selection. Multiple instances allowed. |
| **Power Monitor** | 17 | Click Deploy twice. Post-deploy: configure BMC out-of-band credentials. |
| **Nutanix Central** | 17–18 | Requires LCM inventory + Marketplace Bundle update first. Deploy from Marketplace tile. |
| **Nutanix Infrastructure Manager (NIM)** | 18–19 | No dark-site support. Click Deploy twice. Optional redirect to My Apps. |
| **Data Lens** | 19 | Requires LCM inventory + Marketplace Bundle update first. |
| **Nutanix Cloud Manager (NCM)** | 20 | Requires PC 7.5.1+. Must deploy Nutanix Central first. Shares SMSP cluster. Marketplace Bundle ≥ 4.3.4. |

---

### Preferred Partner App Deployment (pp. 20–32)

#### OpenShift Deployment Wizard (pp. 21–24)

**Prerequisites (p. 21):**
- AHV hypervisor required
- Internet connection (allow `*.docker.io`, `*.quay.io`, `download.nutanix.com`, etc.)
- Two DNS records: `api.<cluster>.<domain>` (API VIP) and `*.apps.<cluster>.<domain>` (Ingress VIP)

**Wizard Steps:**

1. Admin Center → Marketplace → Preferred Partners → **Get** (OpenShift) → **Deploy**
2. **Application Name** (naming rules: alphanumeric/underscore start, spaces/underscores/dashes only)
3. **Profile Variables:**
   - OpenShift minor/patch release version (dropdowns)
   - OpenShift cluster name
   - OpenShift base domain
   - Prism Central FQDN
   - Prism Element FQDN + port (default 9440)
   - Machine Network (CIDR)
   - API VIP + Ingress VIP
   - Pod Network (default `10.128.0.0/14`, host prefix `/23`)
   - Pod addresses per host (subnet prefix length)
   - Service Network (default `172.30.0.0/16`)
   - Control Plane CPU (4–128 vCPUs) + Memory (16384–1048576 MiB)
   - Compute replicas count
   - OpenShift Pull Secret
   - (Optional) HTTP/HTTPS proxy, bypass list
   - (Optional) DEBUG = True/False
4. **Provisioner** section → select NIC
5. **Credentials** section → Password + SSH Private Key
6. Click **Deploy**

#### Cisco Intersight Device Connector (pp. 25–30)

- Qualified on AHV and ESXi
- Creates service account, role, and authorization policy in IAM
- Supports max 25 clusters / 8 nodes each
- Deployment: Admin Center → Marketplace → Preferred Partners → Get → Deploy → configure MSP
- **Dark-site deployment** also supported (separate workflow)
- Upgradable via LCM or My Apps

### Marketplace Application Update via LCM (pp. 31–32)

Steps: Admin Center → LCM → Prism Central Cluster tab → Perform Inventory → select component → Upgrade → Apply Upgrade Plan

---

## 3. My Apps (pp. 33–36)

### Page Sections

| Section | Content |
|---|---|
| **Nutanix Apps** | Tiles for each deployed Nutanix app (Self-Service, Objects, Files, etc.) |
| **Preferred Partner Apps** | Tiles for deployed partner apps (OpenShift, Cisco Intersight) |

### App Details Page

Each app tile has a **Manage** button leading to:
- **Overview tab** — App UUID, name, version, summary
- **Audit tab** — Audit logs of actions performed on the app

### My Apps Permissions (Table 2, p. 34)

| Operation | Prism Central Admin | Project Admin | Developer | Consumer | Operator |
|---|---|---|---|---|---|
| View or open Nutanix Apps | Yes | Yes | Yes | Yes | Yes |
| Search or filter Nutanix Apps | Yes | Yes | Yes | No | No |
| Upgrade Nutanix Apps | Yes | No | No | No | No |

### Register Existing App Instance (p. 34)

Supports registering existing **Database Service** or **Nutanix Move** instances:
1. My Apps → **Register Database Service** / **Register Nutanix Move**
2. Select VM from list (searchable by name, cluster, IP)
3. Click **Register**

### Preferred Partner App Management (pp. 34–36)

- **Delete** Cisco Intersight: Manage → Overview → Delete → type `DELETE` → confirm
- **Upgrade** Cisco Intersight: Manage → Overview → Upgrade → (if no inventory: Redirect to LCM → Perform Inventory → Upgrade) or direct Upgrade

---

## 4. Project Management (pp. 37–76)

### Project Feature Availability (Table 3, pp. 37–38)

| Feature | Self-Service Disabled | Self-Service Enabled |
|---|---|---|
| Multiple AHV clusters & subnets | Yes | Yes |
| View workloads per project | VMs only | VMs + Applications |
| View usage statistics | Yes | Yes |
| Internal project | Yes | Yes |
| Project-level quotas | Yes | Yes |
| VPC Overlay subnets | Yes | Yes |
| Other cloud accounts (ESXi, AWS, Azure, GCP) | No | Yes |
| Account/cluster quotas + ESXi quotas (policy engine) | No | Yes |
| Manage environments | No | Yes |
| Manage tunnels | No | Yes |
| Manage snapshot policies | No | Yes |

### Projects Summary View (Table 4, p. 38)

| Column | Description |
|---|---|
| Name | Project name |
| Status | Project status |
| Infrastructure | Number of on-prem and cloud accounts |
| Users | Number of users |
| Apps | Number of deployed applications |
| VMs | Number of on-prem AHV VMs |
| vCPU | vCPUs used by on-prem AHV |
| Memory | Memory (GiB) used |
| Storage | Storage (GiB) used |
| Cost | Resource cost last 30 days (Showback) |

**Filter pane fields (Table 5):** Name (contains/starts-with/etc.), vCPU Usage range, Memory Usage range, Storage Usage range, VM Count range

**Actions:** Create Project, Export (.csv), column reorder, Delete (via Actions menu)

---

### Project Details View — Tabs (pp. 39–46)

| Tab | Availability | Description |
|---|---|---|
| **Dashboard** | Always | Overview, Workload Summary, Top Workloads, Top Users, Quota Consumption, More Project Features, Expenditure Trends, Environments, Tunnels |
| **Usage** | Always | Graphs: vCPU Usage, Memory Usage, Storage Usage (1 day / 1 week toggle) |
| **Workloads** | Always | Sub-tabs: **VMs** (name, cluster, state, owner, vCPU, memory, storage) + **Apps** (Self-Service only) |
| **Users & Groups** | Always | Columns: Name, User Group, Total VMs, vCPU, Memory, Storage |
| **Infrastructure** | Always | Left pane: account list; Right pane: account details. Add Infrastructure button |
| **Environments** | Self-Service only | Table: Name, Created By, Accounts, Credentials, Ready For. Tile/list toggle |
| **Policies** | Self-Service only | Left-pane tabs: **Quotas** (unified quota view) + **Snapshot** (snapshot policies) |
| **Tunnels** | Self-Service only | Tunnel count inherited from accounts; VPCs associated |

#### Dashboard Tiles (Table 6, pp. 40–43)

| Tile | Content |
|---|---|
| **Overview** | Description, Summary (users, groups, roles, accounts, environments). Edit icon. |
| **Workload Summary** | Total VMs (active/stopped/error), local vs remote count. With SS: + app counts. |
| **Top Workloads** | Max-resource VMs/apps. Filter by vCPU/memory/storage. |
| **Top Users** | Users consuming max resources. Filter by vCPU/memory/storage. |
| **Quota Consumption** | % of vCPU/memory/storage quotas consumed. Update Quotas link. |
| **More Project Features** | Recommendations: Enable Policies, Deploy on cloud, Provision multi-VM apps, Bucket infrastructure. |
| **Project Expenditure Trends** | Hour/day/month graph (requires Showback in Self-Service). Generate Report. |
| **Environments** | Environment usage by compute/memory/storage. |
| **Tunnels** | Tunnel count and VPCs. |

#### Environments Tab (Table 7, p. 43)

| Column | Description |
|---|---|
| Name | Environment name (clickable → config page) |
| Created By | User/role who created it |
| Accounts | Associated accounts |
| Credentials | Number of credentials |
| Ready For | Blueprint creation / application launch readiness |

#### Users & Groups Tab (Table 8, p. 44)

| Column | Description |
|---|---|
| Name | AD name (name@domain) |
| User group | Group membership |
| Total VMs | VMs owned by user |
| vCPU / Memory / Storage | Resources consumed |

#### Workloads Tab — Sub-tabs (Table 9, pp. 45–46)

**VMs sub-tab:** Name, Cluster Name, State (On/Off), Owner, vCPU, Memory, Storage

**Apps sub-tab** (Self-Service only): Name, Source Blueprint, State (Running/Stopped/Error), Owner, Created on, Last Updated at, Cost (30 days)

---

### Creating a Project (pp. 46–48)

1. Admin Center → Projects → **+ Create Project**
2. **Project Name** + **Description**
3. ☑ Enable Directory or Provider Shortlist → select ADs/IDPs
4. **Project Admin** dropdown (auto-adds creator)
5. ☑ **Allow Collaboration** (default on; cannot change after first user saved)
6. Click **Create**
7. Post-create tabs: Users & Groups, Infrastructure, (SS: Environments, Policies)

### Adding Users to a Project (pp. 48–50)

1. Projects → select project → Users & Groups tab → **Add/Edit Users & Groups**
2. Directory Settings icon → select AD/IDP → Save
3. Search users/groups → assign **Role** (Project Admin, Developer, Consumer, Operator)
4. **Save** on project

### Infrastructure in Projects

**Self-Service Disabled (p. 52):** Add local Nutanix account → select clusters + subnets (VLAN & overlay)

**Self-Service Enabled (pp. 50–52):** Add any account configured in Self-Service (Nutanix, VMware/ESXi, AWS, Azure, GCP) → select clusters, subnets, quotas per account

### Environment Configuration (pp. 54–69)

Environments are subsets of a project for blueprint/app-launch. Each environment is configured per provider type:

| Provider | Page | Key Config Fields |
|---|---|---|
| **Nutanix** | 56–58 | VM Name, vCPUs, Cores per vCPU, Memory, Guest Customization (cloud-init/Sysprep), Disks (images/empty), Categories, NICs (VLAN/overlay subnets), Boot Config (legacy/UEFI), Serial Ports |
| **VMware** | 58–61 | VM Name, vCPUs, Cores per vCPU, Memory, Guest Customization, Disks, Controllers (SCSI/SATA), NICs, Boot Config, Tags, Template |
| **AWS** | 61–63 | Instance Name, Instance Type, Region, Availability Zone, Machine Image (AMI), IAM Role, Key Pair, VPC, Security Groups, Boot Disk (Size, Type), Tags |
| **Azure** | 63–67 | Instance Name, Subscription, Location, Resource Group, Hardware Profile, OS Image, OS Disk (Type, Size), Storage Account, Network Profile (VNet, Subnet, Security Group, Public IP), Tags |
| **GCP** | 67–69 | Instance Name, Zone, Machine Type, Network (VPC, Subnet), Boot Disk (Image, Size, Type), Tags, Service Account |

**Credentials:** Multiple credentials supported per environment. Options: Username/Password, SSH Private Key, or both.

**Check Log-in:** Validate credentials against the environment (p. 69).

### Quota Policy (pp. 71–73)

- Unified view on Policies tab → Quotas
- Set limits for: **vCPU**, **Memory (GiB)**, **Storage (GiB)**
- Per-account or project-level quotas
- Requires policy engine enabled for advanced quotas

### Snapshot Policy (pp. 74–75)

Created within Policies tab → Snapshot. Define schedule, retention, target clusters.

---

## 5. Identity and Access Management — IAM (pp. 77–79)

**Access:** Admin Center → **IAM** in nav bar

IAM uses **Attribute-Based Access Control (ABAC)**.

### IAM Page Tabs

| Tab | Content |
|---|---|
| **Identities** | List of local users, imported users, user groups |
| **Imported Users** | Sub-tab under Identities — directory-imported users |
| **User Groups** | Sub-tab under Identities |
| **Roles** | Built-in and custom roles |
| **Authorization Policies** | Role mapping and assignment |

### Identities Tab Actions (Table 10, p. 78)

| Action | How |
|---|---|
| Add a local user | "Add a local user" button |
| Edit a local user | Edit or disable via user row |
| Sort user list (A-Z / Z-A) | Toggle column headers: Name, Username, Type, Email Address, Last Log In, Modified On |
| View imported users | Click Imported Users sub-tab |
| View user groups | Click User Groups sub-tab |
| Filter | Type name or username + Enter |

### Roles Tab (Table 11, p. 78)

| Column | Description |
|---|---|
| Role | Role name |
| Description | Role description |
| Accessible Services | Services the role can access |
| Accessible Entity Types | Entity types the role can access |
| Modified On | Last modification date/time |

**Role Detail Page Actions:**
- **Add Authorization Policy** — attach policy to role
- **Duplicate** — clone role with same permissions
- **Delete** — delete custom role (system roles cannot be deleted)
- **Update** — modify custom role permissions

**Actions Menu (multi-select):** Duplicate, Add Authorization Policy, Update, Delete

### Security Features (p. 77)

- Authentication: local, directory service, or both
- Authorization policies (built-in/custom roles → identities → scope)
- Local user management
- RBAC (Role-Based Access Control)
- SSL certificate import
- SSH access control
- Security policies (Flow Network Security)
- SAML/IDP supported providers (covered in Security Guide)
- CAC authentication workflow

---

## 6. Life Cycle Manager — LCM (p. 80)

**Access:** Admin Center → **LCM** in nav bar (requires Prism Admin role)

LCM tracks software and firmware versions across cluster components.

### Key Functions

| Function | Description |
|---|---|
| **Inventory** | View current software/firmware versions. Perform inventory to discover latest available updates. |
| **Updates** | Select components → upgrade to newer versions. Apply Upgrade Plan. |
| **Pre-checks** | Automated pre-checks before applying updates (covered in LCM Guide). |

### LCM Workflow (from Marketplace Update context, pp. 31–32)

1. Admin Center → LCM → **Prism Central Cluster** tab
2. Select cluster → **Perform Inventory**
3. LCM retrieves latest firmware/software bundles → lists on Inventory page
4. View status on **Operation** tab (right pane)
5. In **Action** column → click **Upgrade**
6. **Select Upgrades** page: shows Installed Version vs Upgrade Version
7. Select component checkbox → **Next**
8. Click **Apply Upgrade Plan**
9. Monitor on **Operation** tab; verify on **Software** tab (right pane)

### LCM Right Pane Tabs

| Tab | Content |
|---|---|
| **Operation** | Status of current inventory/upgrade operations |
| **Software** | Installed and available software versions |

---

## 7. Monitoring Entities — Audits & Tasks (pp. 81–89)

**Access:** Admin Center → Monitoring → Audits / Tasks (also available from Infrastructure app)

### Audits Summary View (Table 12, pp. 82–83)

| Column | Description |
|---|---|
| Action Description | e.g., "deleted VM vm-name" |
| User Name | Who performed the action |
| Entity Affected | Affected entity name |
| Entity Type | VM, host, etc. |
| Operation Type | create, update, delete, power state change |
| Request Time | Timestamp |
| Cluster | Cluster name (clickable) |

**Audit Filters (Table 13, pp. 83–85):**
- User Name, User IP, Cluster, Entity Affected
- Entity Type checkboxes: VM, Storage Container, Catalog Item, Image, Cluster, Host, Disk, GPU, Security Policy, Project, Role, User, Category, VPC, Subnet, Recovery Plan, and 20+ more
- Operation Type checkboxes: Create, Update, Delete, Power State Change, HA, Migrate, Log In, Log Out, Failover, Export, Import, Quarantined, and 30+ more
- Request Time: Last 1 hour, Last 24 hours, Last week, Custom range

**Retention:** 90 days default

### Audit Details View (Table 14, pp. 85–86)

Left pane summary: Action Description, User Name, Entity Affected, Entity Type, Affected Entities, Operation Type, Request Time, User IP, Cluster, Status (Succeeded/Failed)

Right pane: Table of changed attributes and current values.

### Tasks View (Table 15, pp. 86–88)

| Column | Description |
|---|---|
| Task | Operation type + child task count |
| Entity Affected | Entity name/UUID (up to 5 shown) |
| Cluster | Cluster name(s); dash = Prism Central task |
| Status | Canceled, Canceling, Failed, Queued, Running (%), Succeeded, Suspended |
| Initiator | User who initiated |
| Start Time | Date/time |
| Duration | Elapsed time |

**Task Side Panel (on selection):** Overall status, all entities affected (max 300), cluster, initiator, start time, duration, child tasks, sub-steps, errors/warnings

**Task Filters (Table 16, pp. 88–89):** Task name, Entities Affected, Initiator, Cluster, Status checkboxes, Time Range (start/end)

**Actions:** Export to CSV, Save favorite filters, Modify Filters pane

---

## 8. Category Management (pp. 90–93)

| Operation | Description |
|---|---|
| Create | New category with name + values |
| View Details | Category details page |
| Assign | Assign category to entity |
| Update | Modify category name/values |
| Delete | Remove category |

---

## 9. Admin Center Settings (pp. 94–135)

| Setting | Page | Description |
|---|---|---|
| Application Log Archive | 95 | Download log archives |
| Policy Engine | 96–101 | Enable/disable, view VM details, backup/restore DB, upgrade via LCM |
| Pulse Health Monitoring | 102–112 | Enable/disable, mask entity names/IPs, data collection, proxy config |
| HTTP Proxy | 113–116 | Configure proxy + allowlist |
| Name Servers | 117 | DNS configuration |
| NTP Servers | 117 | Time sync |
| SNMP | 118–120 | Configure SNMP traps and users |
| Alert Emails | 121–122 | Email notification setup |
| SMTP Server | 123 | Mail server configuration |
| Syslog Monitoring | 124–128 | Configure syslog modules |
| Default Landing Page | 129 | Set PC default page |
| Language Settings | 129–130 | i18n + L10n |
| NIVA (Intelligent Virtual Agent) | 131 | Tips setting and troubleshooting |
| UI Settings | 132–133 | Prism Central UI customization |
| Welcome Banner | 134 | Login banner configuration |
