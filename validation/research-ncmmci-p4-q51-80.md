# NCM-MCI Part 4 (Q51–Q80) — Disputed Question Research

> **Research date:** 2025-07-17
> **Scope:** 16 DISAGREE questions from Part 4 — CLI/API/Troubleshooting
> **Method:** Web search against Nutanix official docs, community, CLI references, NutanixBible

---

## Summary of Findings

| Q# | Verdict | Action |
|----|---------|--------|
| Q51 | NEEDS FIX | `ncli disk ls` and `ncli disk list` are equivalent aliases — both A and B work; but B is also valid |
| Q54 | MARKED CORRECT | Auto-rebuild is accurate |
| Q55 | MARKED CORRECT | `curator_cli display_data_reduction_report` confirmed |
| Q56 | NEEDS FIX | NCC check path may not include `hardware_checks` intermediate level |
| Q58 | MARKED CORRECT | Prism UI / nuclei approach confirmed |
| Q59 | MARKED CORRECT | `ncli pd list-snapshots` confirmed |
| Q61 | NEEDS FIX | Correct command is `ncli pd add-hourly-schedule`, not `ncli pd add-schedule` |
| Q62 | NEEDS FIX | Correct parameter is `address-list=`, not `address=`; no `username`/`password` params |
| Q64 | NEEDS FIX | `ncli pd migrate` requires `remote-site=` parameter |
| Q66 | MARKED CORRECT | Manual reverse replication setup is correct for legacy PD |
| Q67 | MARKED CORRECT | Manual procedure is correct for legacy PD-based DR |
| Q68 | NEEDS FIX | Better command is `ncli pd ls-repl-status`, not just `ncli pd ls` |
| Q69 | MARKED CORRECT | `ncli pd remove-snapshot` confirmed as valid command |
| Q72 | MARKED CORRECT | `ncli cluster add-public-key name=... file-path=...` confirmed |
| Q76 | MARKED CORRECT | `ncc health_checks security_checks` confirmed |
| Q78 | MARKED CORRECT | `ncli cluster get-params | grep ssh` is valid approach |

---

## Detailed Analysis

---

### Q51: NEEDS FIX (minor — answer is acceptable but explanation is wrong)
**Question:** Which command lists all disks and their current status?
**Marked:** A (`ncli disk ls`) | **Correct:** A or B (both valid)
**Evidence:** Nutanix AOS 5.17 Command Reference (portal.nutanix.com) confirms `ls` is an alias for `list` in all ncli subcommands including `disk`. Multiple sources (BinaryVikings.io, labrepo.com, Nutanix community) confirm `ncli disk list` and `ncli disk ls` are interchangeable.
- https://portal.nutanix.com/page/documents/details?targetId=Command-Ref-AOS-v5_17:acl-ncli-disk-auto-r.html
- https://binaryvikings.io/?p=431
- https://labrepo.com/how-to-verify-and-correct-disk-tiering-in-a-nutanix-ce-cluster/

**Fix needed:** Yes — The explanation states "The short form `ls` is used instead of `list` for the disk subcommand" implying `list` doesn't work. In reality, BOTH `ncli disk ls` and `ncli disk list` are valid. The answer A is acceptable as correct since both A and B are technically valid, but the explanation should note that `ls` is simply an alias for `list`. Option B (`ncli disk list`) would also be correct. For exam purposes, A is a fine answer but the explanation is misleading.

**Recommendation:** Keep A as the answer but fix the explanation to: "Both `ncli disk ls` and `ncli disk list` are valid — `ls` is a standard alias for `list` in ncli. Both commands list all physical disks with their status, tier, storage pool, and capacity."

---

### Q54: MARKED CORRECT
**Question:** What happens when an SSD disk fails in an RF2 cluster?
**Marked:** B | **Correct:** B
**Evidence:** Nutanix's distributed storage architecture automatically triggers self-healing (re-replication) when a disk fails. The Curator service detects under-protected data and re-replicates blocks to other healthy disks across the cluster, restoring RF2 compliance without manual intervention.
- https://www.nutanix.com/products/nutanix-cloud-infrastructure/distributed-storage
- https://www.nutanix.dev/2022/08/03/nutanix-benefit-1-dynamically-distributed-storage/
- https://www.joshodgers.com/2018/05/30/nutanix-resiliency-part-1-node-failure-rebuild-performance/
- https://portal.nutanix.com/page/documents/details?targetId=Web-Console-Guide-Prism-v6_7:arc-node-failure-c.html

**Fix needed:** No. Answer B is correct. The cluster automatically rebuilds data to maintain RF2 redundancy.

---

### Q55: MARKED CORRECT
**Question:** Which command checks the actual dedup ratio and savings?
**Marked:** C (`curator_cli display_data_reduction_report`) | **Correct:** C
**Evidence:** Confirmed by Nutanix Community and multiple admin guides. The `curator_cli display_data_reduction_report` command provides detailed breakdown of deduplication, compression, and erasure coding savings at the container level.
- https://next.nutanix.com/installation-configuration-23/can-i-view-data-reduction-ratio-per-vdisk-or-per-vm-instead-of-the-whole-storage-container-40430
- https://www.systemsengineer.cloud/tag/data-reduction/

**Fix needed:** No. Answer C is correct.

---

### Q56: NEEDS FIX (nuance — the command path syntax is uncertain)
**Question:** Which tool provides SSD wear level (endurance) information?
**Marked:** C (`ncc health_checks hardware_checks disk_checks ssd_wear_check`) | **Correct:** C (concept correct, exact path may vary)
**Evidence:** NCC does have an SSD wear check, but the exact path hierarchy varies by NCC version. Some versions use `ncc health_checks disk_checks ssd_wear_check` (without `hardware_checks`), while others nest it under `hardware_checks`. The check name `ssd_wear_check` is confirmed, but the intermediate module path is version-dependent.
- https://portal.nutanix.com/page/documents/details?targetId=NCC-Guide-NCC-v5_2:ncc-ncc-learn-more-r.html
- https://kirands-nutanixhyperconvergence.blogspot.com/2018/03/ncc-health-checks.html
- https://support.lenovo.com/us/en/solutions/ht509920

**Fix needed:** Minor. The answer C is the best option among the four choices. The concept is correct — NCC's SSD wear check is the proper tool. However, the exact full path `health_checks hardware_checks disk_checks ssd_wear_check` may not be 100% exact for all NCC versions. The alternative path `ncc health_checks disk_checks ssd_wear_check` is also documented. For exam purposes, C remains the best answer.

**Recommendation:** Keep C. Add a note to the explanation that the exact check path may vary by NCC version but the check concept is correct. Running `ncc --list_checks` shows available checks.

---

### Q58: MARKED CORRECT
**Question:** How to identify which VMs consume the most storage in a container?
**Marked:** B (Prism Storage > Container > VM Usage view or `nuclei vm.list`) | **Correct:** B
**Evidence:** There is no direct ncli or acli command that sorts VMs by storage usage within a container. The Prism web interface provides a Storage > Container view showing per-VM disk usage. Programmatically, `acli vm.get <vm>` shows disk details per VM, and `ncli vdisk list ctr-id=<id>` lists virtual disks in a container, but neither provides a sorted per-VM storage ranking natively.
- https://juliendumur.fr/en/maxi-best-of-nutanix-cli-checking-vms/
- https://next.nutanix.com/how-it-works-22/get-all-vm-s-of-storage-container-in-cvm-with-acli-39517
- https://dpcvirtualtips.com/vm-acropolis-command-line-interface-acli-overview/

**Fix needed:** No. Answer B is the most effective approach among the options.

---

### Q59: MARKED CORRECT
**Question:** Which command lists all snapshots for a protection domain?
**Marked:** A (`ncli pd list-snapshots name=<pd-name>`) | **Correct:** A
**Evidence:** Confirmed in Nutanix AOS 6.0 and 5.1 Command References. The `ncli pd list-snapshots` (or alias `list-snaps`) command lists all snapshots associated with a protection domain.
- https://portal.nutanix.com/page/documents/details?targetId=Command-Ref-AOS-v6_0:acl-ncli-protection-domain-auto-r.html
- https://portal.nutanix.com/page/documents/details?targetId=Command-Ref-AOS-v51:acl-ncli-protection-domain-auto-r.html
- https://next.nutanix.com/nutanix-disaster-recovery-29/wait-don-t-delete-that-snapshot-37024

**Fix needed:** No. Answer A is correct. The alias `ls-snaps` (option C) would also work, but `list-snapshots` is the full command form and option A is properly formatted.

---

### Q61: NEEDS FIX
**Question:** Which sequence of commands creates a PD with an hourly replication schedule?
**Marked:** A (`ncli pd create name=PD-HR type=async` then `ncli pd add-schedule name=PD-HR interval=60`) | **Correct:** Closest to A conceptually, but command syntax is wrong
**Evidence:** The actual command for adding an hourly schedule is `ncli pd add-hourly-schedule`, NOT `ncli pd add-schedule`. There is no generic `add-schedule` subcommand. The correct hourly schedule command is:
```
ncli pd add-hourly-schedule name=PD-HR every-nth-hour=1 retention=<N>
```
The parameter is `every-nth-hour=`, not `interval=60`.
- https://portal.nutanix.com/page/documents/details?targetId=Command-Ref-AOS-v6_7:acl-ncli-protection-domain-auto-r.html
- https://portal.nutanix.com/page/documents/details?targetId=Command-Ref-AOS-v511:acl-ncli-protection-domain-auto-r.html
- https://next.nutanix.com/nutanix-disaster-recovery-29/protection-domain-scheduling-options-33527

**Fix needed:** Yes. None of the options have the exactly correct syntax. Option A is the closest (two-step process is correct), but the second command should be `ncli pd add-hourly-schedule name=PD-HR every-nth-hour=1`. Since this is a multiple-choice exam and A is the best available option (correct two-step approach, correct PD create syntax), keep A but fix the explanation.

**Recommendation:** Keep A as best available answer. Fix explanation to: "Protection domain creation and schedule configuration are separate operations. The actual schedule command is `ncli pd add-hourly-schedule` (not `add-schedule`) with `every-nth-hour=` parameter. Among the given options, A correctly reflects the two-step process."

---

### Q62: NEEDS FIX
**Question:** Which command on Cluster-A initiates pairing with Cluster-B?
**Marked:** A (`ncli remote-site create name=ClusterB address=<ClusterB-VIP> username=admin password=<pass>`) | **Correct:** A is the closest but has syntax errors
**Evidence:** The actual `ncli remote-site create` command uses `address-list=` (not `address=`) and does NOT accept `username=` or `password=` parameters. Correct syntax:
```
ncli remote-site create name=ClusterB address-list=<CVM-IP1>,<CVM-IP2>
```
Authentication is handled at the ncli session level, not as parameters to remote-site create. The `address-list` takes CVM IPs (not the cluster VIP).
- https://portal.nutanix.com/docs/Command-Ref-AOS-v7_3:acl-ncli-remote-site-auto-r.html
- https://portal.nutanix.com/page/documents/details?targetId=Command_Reference-NOS_v4_1:man_ncli_remote-site_auto_r.html

**Fix needed:** Yes. Option A is still the best answer among the choices (it uses the correct base command `ncli remote-site create`), but the parameters are wrong. The actual parameters are `address-list=` not `address=`, and there are no inline `username`/`password` parameters.

**Recommendation:** Keep A as best available answer. Fix explanation to: "The `ncli remote-site create` command establishes a remote site pairing. The actual parameter is `address-list=` (comma-separated CVM IPs), not `address=`. Authentication credentials (`username`/`password`) are NOT part of the remote-site create command — they are handled at the ncli session level. Among the given options, A is the closest to the correct command structure."

---

### Q64: NEEDS FIX (minor parameter omission)
**Question:** Correct sequence for planned failover of PD-Finance?
**Marked:** A (`ncli pd migrate name=PD-Finance`) | **Correct:** A (but missing `remote-site=` parameter)
**Evidence:** The `ncli pd migrate` command requires a `remote-site=` parameter specifying the destination. Full syntax:
```
ncli pd migrate name=PD-Finance remote-site=<remote-site-name>
```
The concept is correct — `pd migrate` performs a planned failover with final replication before cutover.
- https://portal.nutanix.com/page/documents/details?targetId=Command-Ref-AOS-v6_7:acl-ncli-protection-domain-auto-r.html
- https://portal.nutanix.com/page/documents/details?targetId=Prism-Element-Data-Protection-Guide-v6_7:wc-protection-domain-failover-c.html
- https://www.nutanix.dev/code_samples/script-to-activate-deactive-migrate-multiple-pds/

**Fix needed:** Yes (minor). Option A correctly identifies `ncli pd migrate` as the planned failover command, but the syntax shown is incomplete — it's missing `remote-site=ClusterB`. The answer is still the best choice among the four options.

**Recommendation:** Keep A. Fix explanation to: "A planned (graceful) failover uses `ncli pd migrate name=PD-Finance remote-site=<remote-site-name>` on the primary cluster. The `remote-site=` parameter is required to specify the target. This performs a final replication, deactivates VMs on primary, and activates them on the remote site."

---

### Q66: MARKED CORRECT
**Question:** Procedure for setting up reverse replication after failover?
**Marked:** B (configure recovered primary as remote site, update PD schedule) | **Correct:** B
**Evidence:** For legacy PD-based DR (Prism Element), reverse replication is NOT automatic. After failover, you must manually configure the recovered primary as a remote site on the DR cluster and set up a new replication schedule pointing back to the primary. Prism Central policy-driven DR automates this, but the question context is PD-based.
- https://next.nutanix.com/nutanix-disaster-recovery-29/reverse-replication-for-faster-failback-44584
- https://next.nutanix.com/nutanix-disaster-recovery-29/nutanix-data-protection-failover-failback-question-41840
- https://portal.nutanix.com/page/documents/details?targetId=Prism-Element-Data-Protection-Guide-v6_7:wc-protection-domain-failover-c.html

**Fix needed:** No. Answer B correctly describes the manual reverse replication setup process for PD-based DR.

---

### Q67: MARKED CORRECT
**Question:** How to perform a test failover to verify DR readiness?
**Marked:** C (manual multi-step process on isolated network) | **Correct:** C (for legacy PD-based DR)
**Evidence:** For legacy Protection Domains, there is no automated `test-failover` command. The correct approach is the manual process: identify latest replicated snapshot, create isolated test network, restore VMs from snapshot, validate, then clean up. Prism Central's Recovery Plans DO support automated test failover, but the question is in the context of PD-based DR.
- https://next.nutanix.com/nutanix-disaster-recovery-29/how-to-test-nutanix-dr-setup-37138
- https://portal.nutanix.com/page/documents/details?targetId=Disaster-Recovery-DRaaS-Guide-vpc_2024_1:ecd-ecdr-dr-test-failover-c.html
- https://mikedent.io/post/2025/10/testing-nutanix-disaster-recovery/

**Fix needed:** No. Answer C correctly describes the manual test failover procedure for PD-based DR. The explanation could note that Prism Central Recovery Plans offer automated test failover, but for the exam context (PD-based), C is correct.

---

### Q68: NEEDS FIX (better answer exists)
**Question:** Which command checks replication status and last successful replication time?
**Marked:** B (`ncli pd ls name=PD-Finance`) | **Correct:** B is acceptable, but D (`cerebro_cli show_replication_status`) is also valid
**Evidence:** `ncli pd ls name=PD-Finance` does show PD details including replication schedules. However, for specifically checking replication status (in-progress replications, completion %, last success), the more targeted command is `ncli pd ls-repl-status`. Option D (`cerebro_cli show_replication_status`) would also provide replication status details since Cerebro manages replication.

However, re-reading the options:
- B: `ncli pd ls name=PD-Finance` — shows PD details including schedule info and replication state
- D: `cerebro_cli show_replication_status` — shows live replication status

For "last successful replication time", `ncli pd ls` does include this. For "replication status", both B and D work.

- https://portal.nutanix.com/page/documents/details?targetId=Command-Ref-AOS-v6_7:acl-ncli-protection-domain-auto-r.html
- https://mikedent.io/post/2025/12/nutanix-dr-monitoring/

**Fix needed:** Minor. B is acceptable — `ncli pd ls name=PD-Finance` does display replication schedule details and last successful replication timestamps. The dedicated replication status command is `ncli pd ls-repl-status`, but that's not among the options. Between B and D, B is the better choice since it shows both configuration and last replication time in one command, while `cerebro_cli` is a lower-level tool.

**Recommendation:** Keep B. The explanation is adequate. Add note that `ncli pd ls-repl-status` is the dedicated replication status command, and the Cerebro service page (port 2020) provides real-time replication metrics.

---

### Q69: MARKED CORRECT
**Question:** Which command expires/deletes old PD snapshots?
**Marked:** A (`ncli pd remove-snapshot name=PD-Finance snapshot-id=<id>`) | **Correct:** A
**Evidence:** The `ncli pd remove-snapshot` command immediately removes a snapshot. The alternative `ncli pd expire-snapshot` marks for policy-based cleanup. Both commands exist and use `name=` and `snapshot-id=` parameters. For the question's context (administrator actively freeing storage), `remove-snapshot` (immediate deletion) is the appropriate choice.
- https://portal.nutanix.com/page/documents/details?targetId=Command-Ref-AOS-v5_20:acl-ncli-snapshot-auto-r.html
- https://nutanix.blogspot.com/2013/09/nutanix-dr-troubleshooting.html
- https://www.nutanixbible.com/pdf/19b-cli.pdf

**Fix needed:** No. Answer A is correct. `ncli pd remove-snapshot` immediately deletes the specified snapshot.

---

### Q72: MARKED CORRECT
**Question:** Which command adds an SSH public key before enabling lockdown?
**Marked:** A (`ncli cluster add-public-key name=admin-key file-path=/home/nutanix/.ssh/id_rsa.pub`) | **Correct:** A
**Evidence:** The `ncli cluster add-public-key` command with `name=` and `file-path=` parameters is confirmed in the Nutanix Security Guide (v6.10) and multiple admin walkthroughs. This must be done before enabling cluster lockdown.
- https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Security-Guide-v6_10:sec-security-management-ncli-c.html
- https://www.virtualramblings.com/create-and-install-ssh-keys-for-cluster-lockdown/
- https://juliendumur.fr/en/nutanix-ahv-ssh-keys-and-cluster-lockdown/

**Fix needed:** No. Answer A is correct.

---

### Q76: MARKED CORRECT
**Question:** Which NCC command provides a comprehensive security report?
**Marked:** C (`ncc health_checks security_checks`) | **Correct:** C
**Evidence:** Running `ncc health_checks security_checks` executes all security-related NCC checks as a group. This is the correct module-level command to run all security checks including SCMA compliance, SSL certificate checks, lockdown status, etc.
- https://portal.nutanix.com/page/documents/details?targetId=NCC-Guide-NCC-v5_0:ncc-ncc-checks-run-c.html
- https://portal.nutanix.com/page/documents/details?targetId=NCC-Guide-NCC-v5_2:ncc-ncc-learn-more-r.html
- https://kirands-nutanixhyperconvergence.blogspot.com/2018/03/ncc-health-checks.html

**Fix needed:** No. Answer C is correct.

---

### Q78: MARKED CORRECT
**Question:** Which command checks if SSH password authentication is disabled (lockdown status)?
**Marked:** A (`ncli cluster get-params | grep ssh`) | **Correct:** A
**Evidence:** `ncli cluster get-params` displays all cluster-level configurable parameters, and grepping for SSH-related parameters reveals the lockdown state (e.g., `Enable Remote Login with Password` being true/false). This is the recommended administrative verification method.
- https://portal.nutanix.com/page/documents/details?targetId=Command-Ref-AOS-v6_10:acl-ncli-cluster-auto-r.html
- https://dpcvirtualtips.com/nutanix-command-line-interface-ncli-overview/
- https://en.vmik.net/2024/01/ntnx-lockdown-mode-and-key-access/
- https://juliendumur.fr/en/nutanix-ahv-ssh-keys-and-cluster-lockdown/

**Fix needed:** No. Answer A is correct. The parameter shown in output relates to remote login with password, which is the lockdown indicator.

---

## Corrections Summary

### Questions Needing Explanation Fixes Only (answer letter stays same):
| Q# | Issue | Fix |
|----|-------|-----|
| Q51 | Explanation incorrectly implies `ncli disk list` doesn't work | Both `ls` and `list` are valid aliases |
| Q56 | NCC check path may not include `hardware_checks` in all versions | Note version variability |
| Q61 | `ncli pd add-schedule` doesn't exist | Correct command is `ncli pd add-hourly-schedule` with `every-nth-hour=` |
| Q62 | Wrong parameters: `address=`, `username=`, `password=` | Correct: `address-list=`, no auth params |
| Q64 | Missing required `remote-site=` parameter | Add `remote-site=<name>` to syntax |
| Q68 | `ncli pd ls` works but `ls-repl-status` is more targeted | Note dedicated replication status command |

### Questions Confirmed Correct (no changes needed):
Q54, Q55, Q58, Q59, Q66, Q67, Q69, Q72, Q76, Q78

---

## Key Nutanix CLI Reference URLs

- AOS 6.7 PD Commands: https://portal.nutanix.com/page/documents/details?targetId=Command-Ref-AOS-v6_7:acl-ncli-protection-domain-auto-r.html
- AOS 7.3 Remote Site: https://portal.nutanix.com/docs/Command-Ref-AOS-v7_3:acl-ncli-remote-site-auto-r.html
- AOS 6.10 Cluster Commands: https://portal.nutanix.com/page/documents/details?targetId=Command-Ref-AOS-v6_10:acl-ncli-cluster-auto-r.html
- Security Guide v6.10: https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Security-Guide-v6_10:sec-security-management-ncli-c.html
- NCC 5.2 Health Checks: https://portal.nutanix.com/page/documents/details?targetId=NCC-Guide-NCC-v5_2:ncc-ncc-learn-more-r.html
- DR Failover/Failback Guide: https://portal.nutanix.com/page/documents/details?targetId=Prism-Element-Data-Protection-Guide-v6_7:wc-protection-domain-failover-c.html
