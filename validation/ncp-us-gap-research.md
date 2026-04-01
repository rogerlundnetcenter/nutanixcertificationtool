# NCP-US 6.10 (Unified Storage) — Gap Research

> **Purpose:** Deep-dive reference for 10 exam-relevant topics sourced via web research.
> **Generated:** 2025-07-15

---

## 1. Nutanix Data Lens

### What Is It?
Nutanix Data Lens is a **data security and analytics SaaS platform** for unstructured data. It provides ransomware resilience, global data visibility, compliance auditing, and data lifecycle management for Nutanix Files, Nutanix Objects, and third-party storage (AWS S3, Isilon in tech preview).

### Key Capabilities
| Capability | Details |
|---|---|
| **Ransomware Detection** | Signature-based + behavioral analysis; detects & responds within ~20 min; 1-click recovery to last-known-good snapshot |
| **Global Audit & Visibility** | Tracks user behaviour, permissions, anomalous activity across all connected clusters from a single console |
| **Data Lifecycle / Tiering** | Identifies cold data; automates tiering to Nutanix Objects, AWS S3, Azure Blob via Smart Tiering policies |
| **Risk Scoring & Reporting** | Root-cause analysis, trend visualisation, customizable reports; integrates with SOC tools (CrowdStrike Falcon, NGSIEM) |
| **Compliance** | NIST-compliant; supports GDPR / HIPAA monitoring and reporting |

### Integration Points
- **Files:** Monitors activity, permission changes, operational auditing, ransomware protection on SMB/NFS shares.
- **Objects:** Extends threat detection, data exfiltration monitoring, and analytics to S3-compatible Nutanix Objects and AWS S3 buckets.
- **Third-Party:** Isilon file servers (tech preview); centralises analytics across all connected storage.

### Deployment Models
| Model | Notes |
|---|---|
| **Cloud SaaS** | Recommended; rapid updates, global multi-site management, unlimited scale |
| **On-Premises** | For strict data residency / security requirements; supports "dark site" (air-gapped) deployments |

### Exam Tips
- Data Lens is the **successor to File Analytics** (FA is EOL Jan 2027).
- Data Lens provides **Advanced Smart Tiering** capabilities (richer than standard tiering through Files Console alone).
- SaaS model can manage unlimited files/objects/clusters with no performance bottleneck.

---

## 2. Nutanix Mine for Objects

### What Is It?
Nutanix Mine is a **secondary storage / integrated backup appliance** solution. It combines Nutanix HCI with leading backup software, delivered as a turnkey deployment. When paired with **Nutanix Objects**, it provides S3-compatible backup targets with WORM/immutability for ransomware protection.

### Supported Backup Vendors

| Vendor | Integration Highlights |
|---|---|
| **HYCU** | Default Mine engine; agentless; fully integrated into Prism; no extra agents; leverages Nutanix APIs directly |
| **Veeam** | Nutanix Objects as S3 Capacity Tier in Scale-Out Backup Repository; WORM immutability support |
| **Commvault** | Plug-in auto-discovers Nutanix clusters; backup scheduling, monitoring, restore from Objects via Command Center |
| **Rubrik** | Agentless backups for AHV & Files; policy-driven management; immutability, RBAC, encryption, threat analytics |
| **Acronis** | Cyber Protect for Nutanix VMs; direct-to-Objects backup; malware protection and policy management |

### How It Works with Objects
1. Deploy Nutanix Objects on a cluster → create S3-compatible buckets.
2. Configure the backup vendor to target Objects endpoint (URL, access key, secret key, bucket name).
3. Enable **WORM / Object Lock** for immutability where supported.
4. Manage via Prism Central for unified policy and monitoring.

### Key Configuration Notes
- Objects bucket must have **versioning enabled** and **object lock disabled** (unless explicitly configuring WORM).
- Bucket owner needs read/write, lifecycle, and tagging permissions.
- Do **not** manually override lifecycle policies that Nutanix sets on the target bucket.

---

## 3. Objects Federation

### What Is It?
Objects Federation groups **multiple Nutanix object stores** (each on separate clusters) under a **single global namespace**. Applications and users see one unified S3-compatible endpoint regardless of the physical location of data.

### Architecture
- **Core Members:** 3–5 clusters recommended; run metadata tracking and coordinate bucket CRUD operations.
- **Bucket Names:** Must be **globally unique** within the federation.
- **Configuration:** Via **Prism Central** — add object store members to the federation, select core members.
- **Policy:** Bucket policies, replication rules, WORM, and lifecycle management apply across the federation.

### Use Cases
| Use Case | Description |
|---|---|
| **Geo-Distributed Access** | Offices in multiple geographies access all object data from one S3 namespace |
| **Extreme Scalability** | Spans dozens of clusters, hundreds of PB; for data lakes, media repos, analytics |
| **Linear IO Scaling** | Adding clusters linearly scales IO performance |
| **Business Continuity / DR** | Combined with streaming replication for object-level redundancy and failover |
| **Seamless Migration** | Buckets can be created, migrated, deleted centrally without client disruption |

### Federation vs. Multi-Cluster (Non-Federated)
| Aspect | Multi-Cluster Standalone | Federated |
|---|---|---|
| Namespace | Per-object-store | Single global namespace |
| Bucket Location | Each bucket lives on one store | Unified view; seamless cross-site |
| Management | Separate per store | Centralised via Prism Central |

---

## 4. Objects Namespaces vs. Buckets

### Buckets
- **Fundamental S3-compatible containers** within a single Nutanix object store.
- Granularity: hold objects/files directly.
- Configure: access permissions, lifecycle policies, WORM, versioning, replication, tagging.
- Managed via Prism Central or S3 APIs.

### Namespaces (Global / Federated Namespaces)
- Introduced with **Objects 4.0+**.
- An **architectural overlay** that consolidates buckets across **multiple** Nutanix object stores into one logical view.
- Enforces global uniqueness of bucket names.
- Manages metadata routing — directs S3 requests to the correct underlying object store.

### Summary Comparison

| Feature | Bucket | Namespace (Global/Federated) |
|---|---|---|
| **Level** | Local container within an object store | Global organisational overlay across stores |
| **Granularity** | Objects/files | Set of buckets across object stores |
| **Main Uses** | Policy management, access control, retention, tagging | Consolidation, global access, cross-site management |
| **Config Focus** | Lifecycle, replication, WORM, access | Federation membership, routing, metadata sync |

### Exam Tip
A namespace is **not** a replacement for a bucket — buckets still hold data. The namespace is the **federation layer** that unifies bucket visibility and access across sites.

---

## 5. Smart Tiering vs. Standard Tiering vs. Advanced Tiering (Files)

### Overview
All three refer to moving **cold / infrequently accessed** file data from Nutanix Files to lower-cost object storage (Nutanix Objects, AWS S3, Azure Blob, Wasabi, etc.). The file server retains metadata stubs for transparent recall.

### Comparison Table

| Aspect | Standard Tiering | Smart Tiering | Advanced Tiering (Data Lens) |
|---|---|---|---|
| **Policy Scope** | Share-level; basic filters | Share-level; basic filters | Central management; global policies across clusters |
| **Analytics & Reporting** | No | No | Yes — via Data Lens SaaS |
| **Data Classification** | Age, size, capacity threshold | Age, size, capacity threshold | Hot / Warm / Cold + access patterns |
| **Management Interface** | Files Console | Files Console | Data Lens SaaS **and** Files Console |
| **Recall Options** | Manual / scheduled | Manual / scheduled | Enhanced automatic + manual |
| **Minimum Version** | Files 4.x+ | Files 4.x+ | Files 4.x+ **with Data Lens enabled** |
| **Cloud Targets** | S3-compliant, Azure Blob | Same | Same |

### Configuration Steps (Standard / Smart)
1. **Enable tiering:** Data Management → Tiering on file server.
2. **Add tiering location:** Choose storage type, provide endpoint, access keys, bucket/container.
3. **Create tiering policy:** Set age/size filters, schedule, capacity thresholds.

### Configuration Steps (Advanced — Data Lens)
1. **Enable Data Lens** for your environment (SaaS or on-prem).
2. Use Data Lens GUI to create advanced tiering policies with richer classification.
3. Policies consider access patterns, multi-cluster coordination, and reporting.

### Key Requirements
- Target S3 bucket must have **versioning enabled** and **object lock disabled**.
- Bucket owner needs appropriate permissions (read/write, lifecycle, tagging).
- Do not manually override lifecycle policies that Nutanix sets on the target bucket.
- Tiering does **not** free Nutanix Files licenses — metadata and management remain on the cluster.

---

## 6. VDI Sync (Files Feature)

### What Is It?
VDI Sync is a Nutanix Files feature (introduced in **Files 5.0+**) that enables **bi-directional, near-real-time replication** of VDI user profile data across file server clusters at different sites.

### How It Works
1. User profiles stored on **distributed shares** in Nutanix Files.
2. VDI Sync policy replicates distributed share data across multiple Files clusters over WAN.
3. When a user logs in at **any** site, their profile is **local** — LAN-speed access, no latency.
4. Changes replicate bi-directionally to maintain consistency.

### Data Protection & Conflict Management
- **User-level locks** prevent data corruption and profile update conflicts.
- **Simultaneous login detection:** If a user logs in at two sites, VDI Sync logs them out of both until admin resolves.
- **Admin actions:** "Resolve failure" or "Allow user connections" to address conflicts quickly.

### Use Cases
- **Seamless Profile Roaming:** Users move between branches / DR sites and always get fast, consistent profiles.
- **FSLogix / Citrix UPM:** Synchronises profile containers across sites.
- **Disaster Recovery:** Profile data is always ready at all sites — no lengthy failover sync.

### Management
- Configured and monitored via **Prism Central**.
- Operates independently of File Analytics / Data Lens (which are per-site analytics).
- Pairs with Citrix Profile Management for enhanced profile handling.

### Exam Tip
VDI Sync works on **distributed shares** only, and is specifically for multi-site VDI profile replication — not general file replication (that's Smart DR).

---

## 7. FQDN-Based Pathing in Files

### What Is It?
Nutanix Files automatically creates **DNS records and computer accounts** when a file server cluster is deployed. Clients access shares via FQDNs (e.g., `\\fileserver.example.com\share`) rather than IP addresses.

### How It Works
- DNS entries created for:
  - The overall **file server namespace** (cluster-level FQDN)
  - Individual **FSVMs** (File Server VMs)
- DNS can resolve to the active FSVM during failover → **high availability**.
- Both SMB and NFS clients reference the same FQDN/DNS alias.

### Configuration Steps
1. **Directory Services Integration:** Join file server cluster to Active Directory (required for SMB; optional LDAP for NFS).
2. **DNS Setup:** Ensure DNS supports **dynamic updates** for FSVM FQDNs. Files registers records automatically.
3. **User Mapping (multi-protocol):** Configure Windows ↔ UNIX user mapping for correct permissions.
4. **Share/Export Creation:** Create SMB, NFS, or multi-protocol shares — each addressable via FQDN.

### Best Practices
- Use **round-robin DNS** or similar mechanisms for the file server FQDN to maximise uptime.
- Separate **client and storage networks** for FSVMs (performance and isolation).
- Distributed/nested shares may have specific multi-protocol limitations — check version docs.

### Exam Tip
FQDN-based pathing is critical for **Smart DR failover** — DNS redirection allows transparent client access cutover to the recovery site.

---

## 8. Nutanix Central

### What Is It?
Nutanix Central is the **next-generation unified management platform** — a "single pane of glass" that sits **above** multiple Prism Central instances to provide global visibility across hybrid and multi-cloud Nutanix deployments.

### Key Capabilities
| Capability | Details |
|---|---|
| **Multi-Domain Management** | Manages multiple Prism Central domains; consolidated cluster metrics, capacity, alerts, health |
| **Service-Centric** | RBAC-based access; traverse all registered Nutanix domains and services |
| **Enterprise Marketplace** | Single marketplace for Nutanix and third-party apps across domains |
| **Federated IAM** | Global identity/access management, global projects, consolidated fleet/license management |
| **Deployment Options** | Cloud SaaS **and** on-premises (for data sovereignty / compliance) |

### Nutanix Central vs. Prism Central

| Aspect | Prism Central | Nutanix Central |
|---|---|---|
| **Scope** | Multi-cluster within one domain | Multi-domain (manages multiple PCs) |
| **Storage Management** | Cluster / multi-cluster level | Global visibility, policy, reporting across all domains |
| **Target Org Size** | Single site / region | Large / globally distributed enterprises |
| **Relationship** | Subordinate domain | Sits above PCs as a global control plane |

### Storage Management Relevance
- Prism Central: manages storage containers, volume groups, policies at the cluster level.
- Nutanix Central: provides **global** storage visibility, policy governance, and capacity planning across all registered Prism Central domains.

### Exam Tip
Nutanix Central is **not** a 1:1 replacement for Prism Central — it **augments** and manages multiple PC deployments. Over time, it is positioned to become the primary management console.

---

## 9. Smart DR — DNS / Active Directory Troubleshooting

### Common Issues and Resolutions

| Problem | Cause | Resolution |
|---|---|---|
| **Short AD/DNS disruption after failover** | Latency updating DNS/AD entries (~1 min) | Pre-configure DNS and AD details on recovery site before failover |
| **DNS server IPs not updating on VMs** | Nutanix DR does not natively update VM DNS settings | Use **NGT (Nutanix Guest Tools)** + post-failover PowerShell scripts to update DNS server settings |
| **Client remount failures (NFS/SMB)** | DNS/AD unavailable or stale after failover | Automate client redirection; for NFS, plan mandatory remounts; for SMB, ensure AD/DNS re-established first |
| **FSMO role confusion** | Improper transfer/seizure during DR | Planned: **transfer** FSMO roles. Unplanned: **seize** if original DCs unreachable beyond tombstone lifetime |
| **AD replication failure** | Stale DNS, DC connectivity issues post-failover | Use `repadmin` diagnostics; correct DNS; force replication |
| **Manual network change delays** | Lack of in-guest automation | Automate all guest OS changes (DNS, IP, service restarts) via NGT scripts |

### Key Procedures

#### Automating DNS Changes in Recovery Plans
1. Create a **PowerShell script** to update DNS server addresses on Windows VMs.
2. Package the script with **NGT** (Nutanix Guest Tools).
3. Add the script as a **post-failover step** in the Nutanix Recovery Plan.
4. Test via planned failover to validate.

#### AD Domain Controller Failover
- **Planned:** Transfer all FSMO roles to DR-site DCs before failover.
- **Unplanned:** If primary DCs unreachable and recovery exceeds tombstone lifetime, seize FSMO roles at DR site.
- Always follow Microsoft AD DR best practices to avoid lingering objects or USN rollback.

### Best Practices
- **Pre-configure** DNS/AD at the DR site.
- **Automate** in-guest changes via NGT or external automation (PowerShell/Ansible).
- **Test frequently** — execute planned failover/failback including AD/DNS validation.
- Use both Nutanix tools **and** native Windows utilities (`repadmin`, `dcdiag`, `nslookup`).

---

## 10. File Analytics vs. Data Lens

### Relationship
**Data Lens is the successor to File Analytics.** File Analytics was on-premises only; Data Lens is primarily SaaS with expanded capabilities.

### Timeline
- **File Analytics (FA):** Final supported release is **v3.4.x**. Supported until **January 31, 2027**, then deprecated.
- **Data Lens (DL):** Actively developed; recommended for all new deployments.

### Key Differences

| Feature | File Analytics | Data Lens |
|---|---|---|
| **Deployment** | On-premises (with Files) | SaaS/cloud-first (+ new on-prem option) |
| **Scope** | Single or limited Nutanix clusters | Multiple clusters, hybrid/multi-cloud |
| **Security** | Basic analytics + anomaly detection | Advanced ransomware detection, compliance dashboards |
| **Recovery** | Snapshot-based rollback | 1-click ransomware recovery, automated alerting |
| **Storage Support** | Nutanix Files only | Files + Objects + AWS S3 + Isilon (tech preview) |
| **Tiering** | Standard tiering only | Advanced Smart Tiering with richer classification |
| **EOL Status** | EOL by Jan 2027 | Active development |

### Migration Path
> **There is NO in-place upgrade from File Analytics to Data Lens.**

The technologies are architecturally different. Migration steps:

1. **Assess** current FA dashboards and reports.
2. **Engage** Nutanix account team for licensing and migration options.
3. **Deploy** Data Lens (SaaS recommended; on-prem available).
4. **Configure** Data Lens to integrate with existing Nutanix Files clusters.
5. **Validate** security and compliance posture using new DL dashboards.

### Important Notes
- **No historical data migration** from FA to DL (different backends).
- Data Lens provides a **superset** of FA capabilities — everything FA did, plus more.
- For the NCP-US exam, focus on understanding **why** the transition is happening and **how** Data Lens improves on FA.

---

## Quick-Reference: Sources

| Topic | Key Sources |
|---|---|
| Data Lens | [nutanix.com/products/data-lens](https://www.nutanix.com/products/data-lens), [TN-2188](https://portal.nutanix.com/page/documents/solutions/details?targetId=TN-2188-Nutanix-Data-Lens) |
| Mine for Objects | [Mine User Guide](https://portal.nutanix.com/docs/Mine-With-Hycu-User-Guide-v3_0), Veeam/Commvault/Rubrik/Acronis docs |
| Objects Federation | [nutanix.dev Global Namespaces](https://www.nutanix.dev/2023/07/10/simplifying-access-to-geo-distributed-object-data-using-global-namespaces/), [TN-2106](https://portal.nutanix.com/page/documents/solutions/details?targetId=TN-2106-Nutanix-Objects) |
| Objects Namespaces | [Nutanix Objects Buckets](https://portal.nutanix.com/page/documents/solutions/details?targetId=TN-2106-Nutanix-Objects:nutanix-objects-buckets.html) |
| Smart Tiering | [Files 5.1 Tiering Policy](https://portal.nutanix.com/page/documents/details?targetId=Files-v5_1:fil-fs-tiering-policy-create-t.html), [Files 5.3 Requirements](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Files-v5_3:fil-fs-tiering-requirements-r.html) |
| VDI Sync | [Files 5.0 VDI Sync](https://portal.nutanix.com/page/documents/details?targetId=Files-Manager-v5_0:fil-files-vdi-sync-c.html) |
| FQDN Pathing | [Nutanix Bible — Files](https://www.nutanixbible.com/pdf/11b-book-of-storage-services-files.pdf) |
| Nutanix Central | [nutanix.com/products/nutanixcentral](https://www.nutanix.com/products/nutanixcentral) |
| Smart DR DNS/AD | [Files 5.2 Smart DR Failover](https://portal.nutanix.com/docs/Nutanix-Files-Manager-v5_2:fil-fm-dr-failver-c.html), [AD Protection in DRaaS](https://portal.nutanix.com/docs/Disaster-Recovery-DRaaS-Guide-vpc_7_3:ecd-ecdr-draas-protection-ad-c.html) |
| FA vs Data Lens | [FA EOL Blog](https://rajpatel.co/?p=898), [Data Lens Datasheet](https://www.nutanix.com/library/datasheets/nutanix-data-lens) |
