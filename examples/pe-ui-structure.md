# Prism Element (PE) Web Console — UI Structure Reference

> Extracted from: **Web Console Guide — Prism v7.3** (402 pages)
> Purpose: Comprehensive reference for building a PE simulator that matches the real UI.

---

## 1. Main Navigation Structure (p.57–62)

### 1.1 Top Menu Bar (Main Menu)

The main menu bar spans the top of the screen and contains (left to right):

| Position | Element | Description |
|----------|---------|-------------|
| Far left | **View Dropdown** | Hamburger/dropdown to select the current page |
| Left | **Health icon** (heart) | Green/yellow/red — click opens Health dashboard |
| Left | **Alerts icon** (bell) | Shows count of unresolved alerts; click opens dropdown |
| Left | **Tasks icon** (circle) | Shows running task count; click opens Tasks page |
| Center | **Cluster name + details** | Shows cluster name, FQDN, hypervisor, version, encryption state |
| Right | **Search** (magnifying glass) | Spotlight search — shortcut: `f` or `/` |
| Right | **Gear icon** | Opens Settings page |
| Right | **Help icon** (?) | Help menu dropdown |
| Far right | **User icon** + username | User menu dropdown |

### 1.2 View Dropdown Options (Left-side page selector)

These are the primary navigation pages accessible from the dropdown:

1. **Home** — Main dashboard (p.63)
2. **Health** — Health monitoring dashboard (p.256)
3. **VM** — Virtual machine dashboard (p.264)
4. **Storage** — Storage dashboard (p.121)
5. **Network** — Network visualizer *(AHV only)* (p.177)
6. **Hardware** — Hardware dashboard (p.185)
7. **File Server** — File server dashboard
8. **Data Protection** — Data protection dashboard (p.255)
9. **Analysis** — Performance monitoring charts (p.334)
10. **Alerts** — Alerts and events (p.348)
11. **Tasks** — Task status (p.349)
12. **LCM** — Life Cycle Manager (p.79)
13. **Settings** — Settings page (p.60)

### 1.3 Keyboard Shortcuts (p.67–68)

**Global shortcuts:**

| Key | Action |
|-----|--------|
| `m` | Main Menu (view dropdown) |
| `s` | Settings Menu |
| `f` or `/` | Spotlight (search bar) |
| `u` | User Menu |
| `a` | Alerts menu |
| `h` | Help menu (?) |
| `p` | Recent tasks |

**Dashboard sub-page shortcuts** (when on Storage, Hardware, etc.):

| Key | Action |
|-----|--------|
| `o` | Overview View |
| `d` | Diagram View |
| `t` | Table View |

### 1.4 Help Menu Options (p.59)

| Option | Description |
|--------|-------------|
| Help with this page | Context-sensitive online help |
| Health Tutorial | Guided tour of health features |
| General Help | Opens online help introduction |
| Online Documentation | Overview/getting-started docs |
| Support Portal | Opens Nutanix support portal |
| Nutanix Next Community | Opens community site |

### 1.5 User Menu Options (p.59–60)

| Option | Description |
|--------|-------------|
| Update Profile | Update username and email |
| Change Password | Change password |
| REST API Explorer | Opens API explorer in new tab |
| Download nCLI | Downloads nCLI zip file |
| Download Cmdlets Installer | Downloads PowerShell cmdlets installer |
| Download Prism Central | Links to Prism Central download |
| About Nutanix | Shows AOS version, NCC version, LCM version |
| Nothing To Do? | Opens a game |
| Sign Out | Logs out |

---

## 2. Settings Page (p.60–63)

Accessed via gear icon or Settings in view dropdown. Left sidebar with categories, right pane shows selected setting.

### Settings Menu Categories and Items

#### General
| Setting | Description | Page |
|---------|-------------|------|
| Cluster Details | View/modify cluster name, FQDN, virtual IP, iSCSI data services IP | p.74 |
| Configure CVM | Increase Controller VM memory size | p.104 |
| Convert Cluster | Convert ESXi ↔ AHV | p.369 |
| Expand Cluster | Add new nodes | p.201 |
| Image Configuration *(AHV only)* | Import and manage image files for VM creation | p.295 |
| Licensing | Install or update cluster license | p.74 |
| Reboot *(AHV)* | Gracefully restart nodes (rolling reboot) | p.105 |
| Remote Support | Enable/disable Nutanix remote support access | p.394 |
| Upgrade Software | Upgrade AOS, hypervisor, or other components | p.78 |
| vCenter Registration *(ESXi only)* | Register/unregister cluster with vCenter | p.366 |

#### Setup
| Setting | Description | Page |
|---------|-------------|------|
| Connect to Citrix Cloud *(AHV/XenServer)* | Connect to Citrix Workspace Cloud | p.330 |
| Prism Central Registration | Register cluster with Prism Central | — |
| Pulse | Enable/disable cluster telemetry to Nutanix support | p.387 |
| Rack Configuration | Configure fault tolerance domains (node/block/rack) | p.35 |

#### Network
| Setting | Description | Page |
|---------|-------------|------|
| HTTP Proxy | Configure HTTP proxy | p.395 |
| Name Servers | Configure DNS name servers | p.353 |
| Network Configuration *(AHV only)* | Manage virtual networks and subnets | p.153 |
| Network Switch | Configure physical network switch SNMP monitoring | p.170 |
| NTP Servers | Configure NTP time servers | p.354 |
| SNMP | Enable and configure SNMP for the cluster | p.355 |

#### Security
| Setting | Description | Page |
|---------|-------------|------|
| Cluster Lockdown | Manage SSH public keys for cluster access | — |
| Data at Rest Encryption *(SEDs only)* | Configure encryption key management | — |
| Filesystem Whitelists | Specify NFS whitelist addresses | p.352 |
| SSL Certificate | Create or manage SSL certificates | — |

#### Users and Roles
| Setting | Description | Page |
|---------|-------------|------|
| Authentication | Configure directory-based authentication | — |
| Local User Management | Add, update, delete local user accounts | — |
| Role Mapping | Configure role mappings for authentication | — |

#### Email and Alerts
| Setting | Description | Page |
|---------|-------------|------|
| Alert Email Configuration | Enable/disable alert emails | — |
| Alert Policies | Configure alert thresholds and event types | — |
| Banner Page | Configure welcome/login banner | p.365 |
| SMTP Server | Configure SMTP email server | p.355 |

#### Data Resiliency
| Setting | Description | Page |
|---------|-------------|------|
| Configure Witness *(ESXi/AHV)* | Add witness VM for metro availability / 2-node clusters | — |
| Degraded Node Settings | Enable/disable degraded node detection | p.45 |
| Manage VM High Availability *(AHV only)* | Enable HA reservations for guest VMs | p.304 |
| Cluster Fault Tolerance | Increase cluster fault tolerance level | p.76 |

#### Appearance
| Setting | Description | Page |
|---------|-------------|------|
| Language Settings | Select Prism UI language | p.376 |
| UI Settings | Configure background themes, disable login screen | p.71 |
| Welcome Banner | Configure pre-login welcome banner message | p.365 |

---

## 3. Home Dashboard (p.63–68)

The Home dashboard is the default landing page. It provides a three-column layout with cluster-wide metrics.

### 3.1 Dashboard Widgets (Table 19, p.64–65)

| Widget | Description | Position |
|--------|-------------|----------|
| **Hypervisor Summary** | Hypervisor name and version | Top-left |
| **Prism Central** | Registration status + link to PC instance | Top-left |
| **Storage Summary** | Physical storage utilization bar (GiB/TiB), resilient capacity. Has "View Details" link and gear icon for threshold config | Left |
| **VMs** | Total VM count by state: On, Off, Suspended | Left |
| **Hardware Summary** | Number of hosts, blocks, block model numbers | Left |
| **Cluster-wide Controller IOPS** | Rolling time-series chart of IOPS | Center-left |
| **Cluster-wide Controller IO B/W** | Rolling time-series chart of bandwidth (MBps/KBps) | Center-left |
| **Cluster-wide Controller Latency** | Rolling time-series chart of avg I/O latency (ms) | Center-left |
| **Cluster CPU Usage** | Current CPU utilization % + total capacity (GHz) | Left |
| **Cluster Memory Usage** | Reserved memory % + total capacity (GiB) | Left |
| **Health** | Health status (good/warning/critical) for VMs, hosts, disks | Center |
| **Cluster Resiliency / Fault Tolerance Status** | Current failure domain, fault tolerance status, rebuild progress | Center |
| **Critical Alerts** | Most recent unresolved critical alerts | Right |
| **Warning Alerts** | Most recent unresolved warning alerts | Right |
| **Info Alerts** | Summary of informational alerts | Right |
| **Events** | Summary of recent events | Right |

### 3.2 Cluster Resiliency States (p.65–66)

- **OK** (green): Cluster can tolerate failures at configured domain
- **Warning** (yellow): Not fault tolerant at configured domain but tolerant at lower domain
- **Critical** (red): Fault tolerance level is 0
- **Computing**: New fault tolerance level being calculated

Clicking the widget opens a dialog with:
- **Failures Tolerable** column: 0, 1, or 2 simultaneous failures per component type
- **Rebuild Progress** indicator: Shows data rebuild %, ETA, phases (Rebuilding Data → Data Rebuild Complete → Aborted)

---

## 4. VM Management Pages (p.264–295)

### 4.1 VM Dashboard Menu Bar

| Element | Description |
|---------|-------------|
| **Overview** button | Shows VM Overview dashboard |
| **Table** button | Shows VM table list |
| **Create VM** button *(AHV/ESXi)* | Opens Create VM dialog |
| **Network Config** button *(AHV)* | Opens network configuration |
| **Include Controller VMs** checkbox | Toggles CVM visibility in table |
| **Search box** | Filter VMs by name |
| **Gear icon** → Export CSV / Export JSON | Export VM table data |
| Page selector | 10 VMs per page, with left/right arrows |

### 4.2 VM Overview View Widgets (p.265)

| Widget | Description |
|--------|-------------|
| Hypervisor Summary | Hypervisor name + version |
| VM Summary | Total VMs by state: On, Off, Suspended |
| CPU | Provisioned vCPUs + reserved CPU capacity (GHz) |
| Memory | Provisioned + reserved memory (GBs) |
| Top User VMs by Controller IOPS | Bar chart — top 10 VMs |
| Top User VMs by Controller IO Latency | Bar chart — top 10 VMs |
| Top User VMs by Memory Usage | Bar chart — top 10 VMs |
| Top User VMs by CPU Usage | Bar chart — top 10 VMs |
| VM Critical Alerts | 5 most recent unresolved critical alerts |
| VM Warning Alerts | 5 most recent unresolved warning alerts |
| VM Events | 10 most recent VM events |

### 4.3 VM Table View — Column Headers (p.266–267)

| Column | Values |
|--------|--------|
| VM Name | (name) |
| ID | (UUID) |
| Host | (host name) |
| IP Addresses | (IP address) |
| Cores | (number) |
| Memory Capacity | xxx MB/GB |
| Storage | used / total (e.g. "1.9 GiB / 5 GiB") |
| CPU Usage | 0–100% |
| Memory Usage | 0–100% |
| [Controller] Read IOPS | (number) |
| [Controller] Write IOPS | (number) |
| [Controller] IO Bandwidth | xxx MBps/KBps |
| [Controller] Avg IO Latency | xxx ms |
| Backup and Recovery Capable | Yes/No |
| Flash Mode | Yes/No |

### 4.4 VM Detail View (when VM selected) (p.267–270)

**Detail Fields (left column):**

| Field | Values |
|-------|--------|
| Name | (VM name) |
| Host | (host name) |
| Host IP | (IP address) |
| Guest OS | (OS name) |
| Memory | xxx MB/GB |
| Reserved Memory | xxx MB/GB |
| Assigned Memory *(Hyper-V)* | xxx MB/GB |
| Cores | (number) |
| Reserved CPU | xxx GHz |
| Disk Capacity | xxx GB/TB |
| Network Adapters | (count) |
| IP Addresses | (IP address) |
| Storage Container | (name) |
| Virtual Disks | (number) |
| NGT Enabled | Yes/No |
| NGT Mounted | Yes/No |
| GPU Configuration *(AHV)* | Comma-separated GPU models |

**Action Links (right of Summary line):**

- Manage NGT
- Launch Console
- Power on / Power Off Actions
- Take Snapshot
- Migrate
- Pause / Resume *(not supported on AHV)*
- Clone
- Update
- Delete *(VM must be powered off)*

**Detail Tabs:**

*Standard VM:*
1. VM Performance
2. Virtual Disks
3. VM NICs
4. VM Alerts
5. VM Events
6. I/O Metrics
7. Console

*Acropolis managed VM (AHV):*
1. VM Performance
2. Virtual Disks
3. VM NICs
4. VM Snapshots
5. VM Tasks
6. I/O Metrics
7. Console

### 4.5 VM Performance Tab Graphs

- Hypervisor CPU Usage (%)
- Controller Avg I/O Latency
- Memory Usage (%) — VM, Hypervisor
- Controller Read IOPS / Write IOPS
- Controller IO Bandwidth (read/write KBps)

### 4.6 I/O Metrics Tab

- Avg I/O latency graph (reads + writes over time)
- Performance distribution: bar chart for read/write size (bytes) and latency (ms)
- Read source breakdown: HDD, SSD, DRAM (pie chart)
- Random vs sequential read/write (pie chart)

### 4.7 Console Tab

- Language selector button (keyboard mapping)
- Send CtrlAltDel button
- Take Screenshot button
- New Window button (same as Launch Console)

### 4.8 Create VM Dialog — Fields (AHV) (p.274–279)

**Main fields:**

| Field | Description |
|-------|-------------|
| Name | VM name |
| Description | Optional description |
| Timezone | Dropdown — use UTC for Linux |
| Use this VM as an agent VM | Checkbox — agent VMs don't migrate |
| vCPU(s) | Number of virtual CPUs |
| Number of Cores per vCPU | Cores per vCPU |
| Memory | Amount in GiB |

**GPU section** *(GPU-enabled clusters)*:
- **Add GPU** button → Add GPU dialog
  - GPU Mode: **Passthrough** or **virtual GPU**
  - For vGPU: select GRID license, then vGPU profile

**Boot Configuration:**
- Legacy BIOS
- UEFI (with optional: Secure Boot, Windows Defender Credential Guard)

**Disks section** — **Add New Disk** button → Add Disk dialog:

| Field | Options |
|-------|---------|
| Type | DISK, CD-ROM |
| Operation | Clone from ADSF file, Empty CD-ROM, Allocate on Storage Container, Clone from Image Service |
| Bus Type | SCSI, SATA, PCI, IDE (for DISK); IDE, SATA (for CD-ROM) |
| ADSF Path | Path to file on cluster |
| Image | Select from image service |
| Storage Container | Dropdown of containers |
| Logical Size (GiB) | Disk size |
| Index | Next Available (default) |

**NICs section** — **Add New NIC** button → Create NIC dialog:

| Field | Description |
|-------|-------------|
| Subnet Name | Select VLAN from dropdown |
| Network Connection State | Connected / Disconnected |
| Private IP Assignment | Read-only: Network Address/Prefix, Free IPs (Subnet), Free IPs (Pool) |
| Assignment Type | Assign with DHCP (for IPAM-enabled networks) |

**Additional options:**
- **Set Affinity** → Select host(s) for VM-host affinity
- **Custom Script** checkbox → Cloud-init (Linux) or Sysprep (Windows)
  - ADSF path, Upload a file, or Type/paste script
  - Source File ADSF Path + Destination Path in VM (for file copy)

**Buttons:** Save, Cancel

### 4.9 Create VM Dialog — Fields (ESXi) (p.290–291)

| Field | Description |
|-------|-------------|
| Name | VM name |
| Description | Optional |
| vCPU(s) | Number of virtual CPUs |
| Number of Cores per vCPU | Cores per vCPU |
| Memory | Amount in GiB |
| Disks | Add New Disk (Clone from Image Service, Allocate on Storage Container) |
| Network Adapters (NIC) | Add New NIC → select Subnet Name |

---

## 5. Storage Pages (p.121–148)

### 5.1 Storage Dashboard Views

The Storage page has three views: **Overview**, **Diagram**, **Table**.

Action button: **+ Storage Container** (creates new container)

### 5.2 Storage Overview Widgets (p.121–123)

| Widget | Description |
|--------|-------------|
| Storage Summary | Physical storage utilization bar + resilient capacity. "View Details" link. Gear icon for threshold config. |
| Storage Containers | Count of containers, VMs, and hosts with mounted containers |
| Capacity Optimization | Data reduction ratio, savings (compression, dedup, erasure coding), overall efficiency |
| Cluster-wide Controller IOPS | Time-series chart |
| Cluster-wide Controller IO B/W | Time-series chart (MBps/KBps) |
| Cluster-wide Controller Latency | Time-series chart (ms) |
| Cache Deduplication | *(Not supported in AOS 6.6+)* |
| Storage Critical Alerts | 5 most recent unresolved critical alerts |
| Storage Warning Alerts | 5 most recent unresolved warning alerts |
| Storage Events | 10 most recent storage events |
| Storage Over-provisioning | Over-provisioning ratio |

**Storage Details Page** (from "View Details"):
- Resiliency status and physical storage info per node
- Parameters: Total Usage, Available Capacity breakdown (Used Capacity, Recovery Points, Recycle Bin, Others)

### 5.3 Storage Diagram View (p.124–127)

**Top section:** Cascading diagram — Cluster bar → Storage Pool bars → Storage Container bars
- Click cluster → shows storage pools
- Click pool → shows containers in that pool
- Edit (pencil) and Delete (X) icons per entity

**Bottom section:** Summary with detail column + tabs

**Storage Container Detail Fields (p.124–126):**

| Field | Values |
|-------|--------|
| Name | (name) |
| Replication Factor | 1, 2, 3 |
| Protection Domain | (name) |
| Datastore | (name) |
| VMs | (number) |
| Free Space (Physical) | xxx GB/TB |
| Used (Physical) | xxx GB/TB |
| Max Capacity | xxx TB |
| Reserved | xxx GB/TB |
| Data Reduction Ratio | x.xx : 1 |
| Data Reduction Savings | xxx GB/TB |
| Effective Free | xxx GB/TB |
| Overall Efficiency | ratio |
| Compression | Off/On |
| Capacity Deduplication | Off/On |
| Erasure Coding | On/Off |
| Filesystem Whitelists | None/On/Off |

**Storage Container Tabs:**
1. Storage Container Usage
2. Storage Container Performance
3. Storage Container Alerts
4. Storage Container Events

**Storage Pool Detail Fields (p.126):**

| Field | Values |
|-------|--------|
| Name | (name) |
| Free (Physical) | xxx GB/TB |
| Used (Physical) | xxx GB/TB |
| Capacity (Physical) | xxx TB |
| Disk Count | (number) |

**Storage Pool Tabs:**
1. Storage Pool Usage
2. Storage Pool Performance
3. Storage Pool Alerts
4. Storage Pool Events

**Cluster Summary Tabs** (nothing selected):
1. Usage Summary
2. Performance Summary
3. Storage Alerts
4. Storage Events

**Usage Tab** graphs: Cluster-wide Usage Summary (time-series), Tier-wise Usage (pie chart: DAS-SATA, SSD-SATA, SSD-PCIe)

**Performance Tab** graphs: IOPS, I/O Bandwidth, I/O Latency

### 5.4 Storage Table View (p.128–135)

Three tabs in the table view: **Volume Group**, **Storage Container**, **Storage Pool**

#### Volume Group Table Columns (p.128–129)

| Column | Values |
|--------|--------|
| Name | (name) |
| Disks | (number) |
| Controller IOPS | (number) |
| Controller IO B/W | xxx MBps/KBps |
| Controller IO Latency | xxx ms |

**Volume Group Detail Fields:**

| Field | Values |
|-------|--------|
| Name | (name) |
| Number of Virtual Disks | 0–256 |
| Total Size | xxx GB/TB |
| Flash Mode | Yes/No |
| Shared | Yes/No |
| Initiators | None or list of names |
| Storage Container | (name) |
| Target IQN Prefix | (IQN string) |

**Volume Group Action Links:** Update, Delete

**Volume Group Tabs:**
1. Performance Metrics
2. Virtual Disks
3. Volume Group Tasks
4. Volume Group Alerts
5. Volume Group Events

#### Storage Container Table Columns (p.130–131)

| Column | Values |
|--------|--------|
| Name | (name) |
| Encrypted | Yes/No |
| Replication Factor | 1, 2, 3 |
| Compression | Off/On |
| Capacity Deduplication | On/Off |
| Erasure Coding | On/Off |
| Free Capacity (Physical) | xxx GB/TB |
| Used Capacity (Physical) | xxx GB/TB |
| Reserved Capacity (Physical) | xxx GB/TB |
| Max Capacity (Physical) | xxx TB |
| Controller IOPS | (number) |
| Controller IO B/W | xxx MBps/KBps |
| Controller IO Latency | xxx ms |

**Storage Container Detail Fields:**

| Field | Values |
|-------|--------|
| Name | (name) |
| Encrypted | Yes/No |
| Protection Domain | (name) |
| VMs | (number) |
| Free Capacity (Physical) | xxx GB/TB |
| Used (Physical) | xxx GB/TB |
| Snapshot | xxx GB/TB |
| Max Capacity | xxx TB |
| Reserved | xxx GB/TB |
| Replication Factor | 1, 2, 3 |
| Compression | Off/On |
| Data Reduction Ratio | x.xx : 1 |
| Data Reduction Savings | xxx GB/TB |
| Effective Free | xxx GB/TB |
| Overall Efficiency | xxx GB/TB |
| Capacity Deduplication | On/Off |
| Filesystem Allowlists | None/On/Off |
| Erasure Coding | On/Off |

**Storage Container Action Links:** Update, Delete

**Storage Container Tabs:**
1. Storage Container Breakdown
2. Storage Container Usage
3. Storage Container Performance
4. Storage Container Alerts
5. Storage Container Events

#### Storage Pool Table Columns (p.132–134)

| Column | Values |
|--------|--------|
| Name | (name) |
| Disks | (number) |
| Free (Physical) | xxx GB/TB |
| Used (Physical) | xxx GB/TB |
| Capacity (Physical) | xxx TB |
| Controller IOPS | (number) |
| Controller IO B/W | xxx MBps/KBps |
| Controller IO Latency | xxx ms |

**Storage Pool Detail Fields:**
- Same as diagram view Storage Pool fields

**Storage Pool Action Links:** Update

**Storage Pool Tabs:**
1. Storage Pool Usage
2. Storage Pool Performance
3. Storage Pool Alerts
4. Storage Pool Events

### 5.5 Create Storage Container Wizard (p.135–139)

**Dialog: "Create Storage Container"**

| Field | Description |
|-------|-------------|
| Name | Container name |
| Storage Pool | Dropdown selection |
| Max Capacity (Physical) | Read-only — free space in selected pool |
| *(vSphere)* NFS Datastore | Mount on all ESXi hosts / Mount on specific hosts |
| *(Hyper-V)* Default store | Make default on all/particular hosts |

**Advanced Settings** (expandable section):

| Field | Description |
|-------|-------------|
| Cluster Fault Tolerance | Read-only |
| Replication Factor | Dropdown: 1, 2, or 3 |
| Reserved Capacity (Logical) | Amount in GiB |
| Reserved Capacity (Physical) | Read-only calculated field |
| Advertised Capacity (Logical) | Max storage size in GiB |
| Advertised Capacity (Physical) | Read-only calculated field |
| Compression | Checkbox (default: selected). Delay (In Minutes) field — 0 = inline, 60 = post-process recommended |
| Deduplication > Capacity | Checkbox for post-process dedup on HDD |
| Erasure Coding | Checkbox to enable EC |

**Buttons:** Save, Cancel

### 5.6 Volume Group Create Dialog (p.145)

| Field | Description |
|-------|-------------|
| Name | Volume group name |
| Flash Mode | Enable/disable |
| Description | Optional |
| Add New Disk | Type: new disk or clone. Size, Storage Container |
| Initiator IQN | iSCSI initiator |
| Load Balancing | Checkbox for VM-attached disks |

---

## 6. Network Pages (p.153–184)

### 6.1 Network Configuration Page

Accessed via: VM → Network Config, or Settings → Network → Network Configuration

**Three tabs:**
1. **Subnets** — List of configured virtual networks
2. **Internal Interfaces** — List of LAN interfaces
3. **Virtual Switch** — List of virtual switches

#### Subnets Tab Columns (p.153–154)

| Column | Values |
|--------|--------|
| Subnet Name | (name) |
| Virtual Switch | vs0, vs1, etc. |
| VLAN ID | (number) |
| Used IP Addresses | (number) |
| Free IPs in Subnets | (number) |
| Free IPs in Pool | (number) |
| Actions | Edit / Delete |

#### Internal Interfaces Tab Columns

| Column | Values |
|--------|--------|
| Descriptive Name | (LAN name) |
| Subnet (Gateway IP / Prefix Length) | IP/prefix |
| Features | (features) |
| Interface | eth0, eth1, etc. |
| Virtual Switch | vs0, vs1, etc. |
| Bridge | br0, br1, etc. |
| MTU (bytes) | Default: 1500 |
| Bond Type | Active-Backup, etc. |

#### Virtual Switch Tab

Lists configured virtual switches. Action: **+ Create VS** button.

### 6.2 Create Subnet Dialog (p.165–167)

| Field | Description |
|-------|-------------|
| Subnet Name | Name for the subnet/network |
| Virtual Switch | Select from dropdown |
| VLAN ID | Number (0 = native VLAN) |
| Enable IP Address Management | Checkbox to enable IPAM (shows additional fields) |
| Network IP Prefix | Gateway IP / CIDR (e.g. 10.1.1.0/24) |
| Gateway IP Address | Default gateway IP |
| DHCP Settings | Checkbox (shows domain fields) |
| Domain Name Servers | Comma-separated DNS servers |
| Domain Search | Comma-separated domains |
| Domain Name | VLAN domain name |
| TFTP Server Name | For PXE boot |
| Boot File Name | Boot file from TFTP server |
| **Create Pool** | Button → Add IP Pool dialog |
| → Start Address | Starting IP of pool range |
| → End Address | Ending IP of pool range |
| Override DHCP server | Checkbox → DHCP Server IP Address field |

**Buttons:** Save, Cancel

### 6.3 Create Virtual Switch Dialog (p.154–156)

**General tab:**

| Field | Description |
|-------|-------------|
| Virtual Switch Name | Name |
| Description | Description |
| Physical NIC MTU (bytes) | 1500–9000 |
| Configuration Method | Standard (Recommended) or Quick |

**Uplink Configuration tab:**

| Field | Description |
|-------|-------------|
| Bond Type | Active-Backup, Active-Active with MAC pinning, Active-Active (LACP), No Uplink Bond |
| Select Hosts | Host selection |
| Select Uplink Ports | Connected and Unconnected / Only Connected |
| Uplink Port Speeds | 1G, 10G, All Speeds |
| Host Port table | Per-host port selection checkboxes |

**Bond Types (p.156):**

| Bond Type | Max VM NIC Throughput | Max Host Throughput |
|-----------|----------------------|---------------------|
| Active-Backup *(default, recommended)* | 10 Gb | 10 Gb |
| Active-Active with MAC pinning (balance-slb) | 10 Gb | 20 Gb |
| Active-Active (LACP balance-tcp) | 20 Gb | 20 Gb |
| No Uplink Bond | — | — |

**Buttons:** Create, Cancel

### 6.4 Network Visualization (p.177–184)

*(AHV only)* — Accessed via Network view dropdown.

**Layout:**
- **Virtual Switches Pane** (left): Checkboxes for each VS + "Other" (CVMs)
- **Topology View** (main area): Interactive diagram showing VMs → Hosts → Switches

**Topology entities:**
- Virtual Switch (VS) — color-coded
- VMs — filterable, groupable
- Hosts — with filter
- Switches — first-hop physical switches with filter

**Interaction features:**
- Click VM → VM NIC Information (vNIC name, MAC, IP, network, virtual switch, bandwidth, packet stats)
- Click Host → Host Information (host NICs, uplink bonds, traffic stats)
- Click Switch → Switch details + port details
- Customize topology view (group by, filter)

---

## 7. Hardware Pages (p.185–200)

### 7.1 Hardware Dashboard Views

Three views: **Overview**, **Diagram**, **Table**

Action buttons:
- **Add NVMe Devices** *(if supported)*
- **Expand Cluster**
- **Repair Host Boot Device**

### 7.2 Hardware Overview Widgets (p.185–186)

| Widget | Description |
|--------|-------------|
| Hardware Summary | Number of hosts, blocks, platform model number |
| Hosts | Count by discovered/monitored + undiscovered nodes |
| Disks | Total count by tier (SSD-PCIe, SSD-SATA, DAS-SATA, HDD) |
| CPU | Total CPU capacity (GHz) |
| Memory | Total memory (GBs) |
| Top Hosts by Disk IOPS | Bar chart — top 10 |
| Top Hosts by Disk IO Bandwidth | Bar chart — top 10 |
| Top Hosts by Memory Usage | Bar chart — top 10 |
| Top Hosts by CPU Usage | Bar chart — top 10 |
| Hardware Critical Alerts | 5 most recent unresolved critical alerts |
| Hardware Warning Alerts | 5 most recent unresolved warning alerts |
| Hardware Events | 10 most recent hardware events |

### 7.3 Hardware Diagram View (p.186–193)

**Top section:** Interactive block diagram showing physical chassis layout with nodes and disks.

**Clicking a Host** → Host Details:

| Field | Values |
|-------|--------|
| Host Name | (name) |
| Host Type | Hyperconverged / Storage-only |
| Hypervisor IP | (IP) |
| Controller VM IP | (IP) |
| IPMI IP | (IP) |
| Node Serial | (serial) |
| Block Serial | (serial) |
| Block Model | (model) |
| Storage Capacity | xxx GB/TB |
| Disks | Count by tier |
| Memory | xxx MB/GB |
| CPU Capacity | xxx GHz |
| CPU Model | (model name) |
| No. of CPU Cores | (number) |
| No. of Sockets | (number) |
| No. of VMs | (number) |
| Oplog Disk % | 0–100% |
| Oplog Disk Size | xxx GB |
| Monitored | Yes/No |
| Hypervisor | (name + version) |
| Secure Boot Enabled | Yes/No |

**Host Action Links:**
- Turn On LED / Turn Off LED
- Enter Maintenance Mode
- Repair Boot Disk Drive

**Host Tabs:**
1. Host Performance
2. Host Usage
3. Host NICs
4. Host Alerts
5. Host Events

**Clicking a Disk** → Disk Details:

| Field | Values |
|-------|--------|
| ID | (number) |
| Serial Number | (serial) |
| Model | (model) |
| Storage Tier | SSD-PCIe / SSD-SATA / DAS-SATA |
| Used (Physical) | xxx GB/TB |
| Capacity (Physical) | xxx GB/TB |
| Hypervisor | (IP) |
| Storage Pool | (name) |
| Status | Normal / Data migration initiated / Marked for removal / Detachable |
| Mode | online / offline |
| Self Encryption Drive | present / not present |
| Password Protection Mode *(SED)* | protected / not protected |

**Disk Action Links:**
- Turn On LED / Turn Off LED
- Remove Disk

**Disk Tabs:**
1. Disk Usage
2. Disk Performance
3. Disk Alerts
4. Disk Events

**Cluster Summary** (nothing selected):

Fields: Blocks, Hosts, Total Memory, Total CPU Capacity, Disks (by tier), Network Switches, GPUs (AHV)

Tabs: Performance Summary, Hardware Alerts, Hardware Events

### 7.4 Hardware Table View (p.194–200)

Three tabs: **Host**, **Disk**, **Switch**

#### Host Table Columns (p.194–196)

| Column | Values |
|--------|--------|
| Host Name | (name) |
| Host IP | (IP) |
| CVM IP | (IP) |
| Hypervisor | ESXi/AHV/Hyper-V |
| CPU Usage | 0–100% |
| CPU Capacity | xxx GHz |
| Memory Usage | 0–100% |
| Memory Capacity | xxx MiB/GiB |
| Total Disk Usage | xxx MiB/GiB/TiB of xxx |
| Disk Usage | xx % |
| Disk IOPS | (number) |
| Disk IO B/W | xxx MBps/KBps |
| Disk IO Latency | xxx ms |

**Host Detail Fields (lower):** Same as diagram view host details + Datastores, Secure Boot Enabled

**Host Action Links:** Turn On/Off LED, Enter Maintenance Mode, Repair Host Boot Device

**Host Tabs:** Host Performance, Host Usage, Host NICs, Host Alerts, Host Events

#### Disk Table Columns (p.196–198)

| Column | Values |
|--------|--------|
| Disk ID | (number) |
| Serial Number | (serial) |
| Host Name | (name) |
| Hypervisor IP | (IP) |
| Tier | SSD-PCIe / SSD-SATA / DAS-SATA |
| Status | online / offline |
| Disk Usage | 0–100% of xxx GB/TB |
| Disk IOPS | (number) |
| Disk IO B/W | xxx MBps/KBps |
| Disk Avg IO Latency | xxx ms |

**Disk Detail Fields (lower):** Same as diagram view disk details

**Disk Action Links:** Turn On/Off LED, Remove Disk

**Disk Tabs:** Disk Usage, Disk Performance, Disk Alerts, Disk Events

#### Switch Table Columns (p.198–200)

| Column | Values |
|--------|--------|
| Switch Name | (name) |
| Switch Management IP | (IP) |
| Vendor | (vendor name) |
| Physical Switch Interfaces | (count) |

**Switch Detail Fields:**
- Switch Name, Management IP Address, Description, Vendor

**Switch Tabs:**
1. Physical Switch Interfaces
2. Switch Alerts
3. Switch Events

---

## 8. Health / Alerts Pages (p.256–263, 348–351)

### 8.1 Health Dashboard Layout (p.256–259)

**Three-column layout:**

**Left column — Entity tabs:**
- VMs
- Hosts
- Disks
- Storage Pools
- Storage Containers
- Cluster Services
- Protection Domains *(when configured)*
- Remote Sites *(when configured)*

Each tab shows: total count + count per health state

**Middle column:** Detailed health info for selected entity. Two sub-views: Diagram view and Table view.

**Right column — Three tabs:**
1. **Summary** — Summarized health checks by status and type
2. **Checks** — Individual health checks with filtering:
   - Filter by Status: Passed, Failed, Warning, Error, Off, All
   - Filter by Type: Scheduled, Not Scheduled, Event Triggered, All
   - Filter by Entity Type: VM, Host, Disk, Storage Pool, Storage Container, Cluster Service, All
3. **Actions** — Manage Checks, Run Checks, Collect Logs

### 8.2 Health Check Management (p.259–260)

When managing a check:
- **Left column:** List of health checks (selectable)
- **Middle column:** Check description, schedule, history
- **Right column:** Cause, resolution, impact

**Per-check actions:**
- **Run Check** button
- **Turn Check Off / Turn Check On** toggle
- **Alert Policy** — configure severity thresholds (Info, Critical, Warning), Auto Resolve toggle
- **Parameters** — check-specific thresholds (e.g., CPU utilization %)
- **Schedule** dropdown — interval from 1 minute to 1 day

### 8.3 NCC Configuration (p.260–261)

**Set NCC Frequency** (from Actions dropdown):
- Every 4 hours
- Every Day (+ Start Time)
- Every Week (+ Day + Start Time)

**Run NCC** (from Actions dropdown):
- Sends NCC checks; use Tasks page to monitor progress

**Collect Logs** (from Actions dropdown):
- Log Collector dialog with per-host checkboxes
- Options: All Logs, CVM Logs, Hypervisor Logs, Cluster Logs

### 8.4 Alerts Page (p.348)

The Alerts page displays alert and event messages. Accessible from:
- Alerts in view dropdown
- Bell icon in main menu

*Note: Detailed Alerts page structure is in the separate "Prism Element Alerts and Events Reference Guide."*

### 8.5 Tasks Page (p.349–351)

**Task Status Dashboard fields:**
- Task, Status, Start Time, Complete Time, Progress, Message
- Filters: Status (Succeeded, Running, Failed, Queued), Entity Type

---

## 9. Data Protection Pages (p.255)

The Data Protection page in PE is a gateway to protection domain management. Detailed DR configuration is in the separate *Protection Domain-Based Disaster Recovery with Prism Element* guide.

**Key concepts referenced:**
- **Protection Domains** — groupings of VMs/files for backup
- **Protection Strategies** — one-to-one, one-to-many replication
- **Asynchronous Replication** — ≥1 hour RPO
- **Synchronous Replication** — Metro Availability (ESXi/Hyper-V 2016), Sync replication (ESXi/Hyper-V 2012)
- **Cloud Connect** — Async backup to AWS

**Expected Data Protection Dashboard tabs** (from Health dashboard entity references):
- Protection Domains
- Remote Sites
- Snapshots / Schedules

---

## 10. Analysis Dashboard (p.334–347)

### 10.1 Analysis Screen Layout

**Three panes:**
1. **Left pane — Chart definitions:** List of user-created charts with checkboxes to enable/disable
2. **Middle pane — Chart monitors:** Time-series graphs for enabled charts + Alerts & Events histogram
3. **Right pane — Alerts and Events:** Messages during selected time interval

### 10.2 Controls

- **New** dropdown → **New Entity Chart**, **New Metric Chart**
- **Range** dropdown: 3 hour, 6 hour, 1 day, 1 week, WTD, 1 month
- Time scrubber (translucent bar top, solid blue bar bottom)
- Per-chart: Edit (pencil), Delete (X), Export (CSV/JSON), Chart link URL

### 10.3 Entity Chart Creation (p.336)

| Field | Description |
|-------|-------------|
| Chart Title | Name |
| Entity Type | host, disk, storage pool, storage container, virtual machine, volume group, remote site, protection domain, replication link, virtual disk, cluster |
| Entity | Name (search/autocomplete) |
| Metric | Select from dropdown (multiple allowed) |

### 10.4 Metric Chart Creation (p.336)

| Field | Description |
|-------|-------------|
| Chart Title | Name |
| Metric | Single metric from dropdown |
| Entity Type | host, cluster |
| Entity | Name (search/autocomplete, multiple allowed) |

### 10.5 Available Metrics (p.337–346)

**Memory / Cache Metrics:**
- Content Cache Hit Rate (%), Hits, Lookups, Reference Count
- Content Cache Logical Memory Usage, Logical SSD Usage
- Content Cache Physical Memory Usage, Physical SSD Usage
- Deduplication Fingerprints Cleared, Written

**Disk I/O Metrics** (entities: Host, Cluster, Disk, Storage Pool):
- Disk I/O Bandwidth (total, read, write)
- Disk I/O Latency
- Disk IOPS (total, read, write)

**GPU Metrics** (entity: VM):
- GPU Framebuffer Usage, GPU Usage, GPU Video Decoder Usage, GPU Video Encoder Usage

**Hypervisor Metrics:**
- Hypervisor CPU Ready Time (%) — VM
- Hypervisor CPU Usage (%) — Host, Cluster, VM
- Hypervisor I/O Bandwidth (total, read, write) — Host, Cluster, VM
- Hypervisor I/O Latency (total, read, write) — Host, Cluster, VM
- Hypervisor IOPS (total, read, write) — Host, Cluster, VM
- Hypervisor Memory Usage (%) — Host, Cluster
- Hypervisor Free Physical Memory — Host, Cluster

**Controller Metrics** (entities vary: Host, Cluster, VM, Storage Container, Volume Group):
- Controller I/O Bandwidth (total, read, write)
- Controller I/O Latency (total, read, write)
- Controller IOPS (total, read, write)
- Controller I/O Size (total, read, write)

**Network Metrics:**
- Network - Received Bytes, Transmitted Bytes — Host, Cluster, VM

**Storage Metrics:**
- Storage Capacity, Free Storage, Used Storage — Host, Cluster, Storage Pool
- Snapshot Usage — Storage Container
- Storage Tier Usage — Storage Pool

**Replication Metrics:**
- Replication Received/Transmitted Bandwidth — Cluster
- Replication Num Received/Transmitted Bytes — Cluster

---

## 11. Common UI Patterns

### 11.1 Table View Pattern (used across VM, Storage, Hardware)

All table views share this layout:
- **Top section:** Sortable table with column headers, one row per entity
- **Bottom section (Summary):**
  - Left: Detail fields for selected entity
  - Right: Set of tabs (Performance, Usage, Alerts, Events, etc.)
  - Action links appear on the Summary line (Update, Delete, etc.)

### 11.2 Overview View Pattern

All overview views share:
- Summary cards/widgets (counts, status)
- Top-N bar charts for busiest entities
- Performance time-series charts (IOPS, Bandwidth, Latency)
- Critical Alerts, Warning Alerts, Events panels

### 11.3 Diagram View Pattern (Storage, Hardware)

- Interactive visual diagram (blocks/nodes/disks or storage pools/containers)
- Click to select → details appear below
- Summary section with detail fields + tabs

### 11.4 Standard Tab Sets

| Context | Tabs |
|---------|------|
| Storage Container (Table) | Breakdown, Usage, Performance, Alerts, Events |
| Storage Container (Diagram) | Usage, Performance, Alerts, Events |
| Storage Pool | Usage, Performance, Alerts, Events |
| Volume Group | Performance Metrics, Virtual Disks, Tasks, Alerts, Events |
| Host | Performance, Usage, NICs, Alerts, Events |
| Disk | Usage, Performance, Alerts, Events |
| VM (Standard) | Performance, Virtual Disks, NICs, Alerts, Events, I/O Metrics, Console |
| VM (AHV) | Performance, Virtual Disks, NICs, Snapshots, Tasks, I/O Metrics, Console |
| Switch | Physical Switch Interfaces, Alerts, Events |

### 11.5 Common Modal/Dialog Patterns

- **Create/Update dialogs:** Form fields with Save/Cancel buttons
- **Advanced Settings:** Collapsible/expandable section within create dialogs
- **Confirmation dialogs:** "Are you sure?" with Yes/No or Delete/Cancel
- **Alert Policy dialogs:** Severity checkboxes + threshold fields + Auto Resolve toggle

### 11.6 Data Retention

- Prism Element retains alerts, events, and raw metric values for **90 days**

---

## 12. Page Reference Index

| Page | PDF Page(s) | Views |
|------|-------------|-------|
| Home Dashboard | 63–68 | Single view |
| Health Dashboard | 256–263 | Entity tabs + Checks/Summary/Actions |
| VM Dashboard | 264–295 | Overview, Table |
| Storage Dashboard | 121–148 | Overview, Diagram, Table |
| Network (Visualization) | 177–184 | Topology view |
| Network Configuration | 153–169 | Subnets, Internal Interfaces, Virtual Switch tabs |
| Hardware Dashboard | 185–200 | Overview, Diagram, Table |
| Data Protection | 255 | (references separate guide) |
| Analysis Dashboard | 334–347 | Charts + Monitors |
| Alerts | 348 | (references separate guide) |
| Tasks | 349–351 | Task list with filters |
| Settings | 60–63 | Category sidebar + settings pane |
