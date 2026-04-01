# NCM-MCI Part 4 — Q1-Q25 Disputed Questions Research

**Scope:** Q12, Q13, Q14, Q15, Q16, Q18, Q19, Q23, Q24, Q25
**Date:** 2025-07-15
**Method:** Web search against nutanix.dev, portal.nutanix.com, next.nutanix.com, NutanixBible.com, community forums

---

### Q12: MARKED CORRECT
**Question:** List all VMs via v3 API with pagination
**Marked:** B | **Correct:** B
**Evidence:**
- nutanix.dev API Reference confirms POST to `/api/nutanix/v3/vms/list`
- Body uses `kind`, `length`, `offset` (NOT `limit`/`page`) — confirmed by next.nutanix.com community: https://next.nutanix.com/how-it-works-22/v3-api-list-all-vms-38209
- `sort_order` and `sort_attribute` are optional but valid parameters
- nutanix.dev lab: https://www.nutanix.dev/lab_content/python-api-lab/contents/api_request.html
**Fix needed:** No

---

### Q13: MARKED CORRECT
**Question:** Authenticate to Prism Central v3 API
**Marked:** B | **Correct:** B
**Evidence:**
- Nutanix v3 API uses HTTP Basic Authentication: `Authorization: Basic <base64(username:password)>`
- Bearer tokens (JWT) only supported for Calm/Self-Service APIs, NOT core v3 endpoints
- Confirmed by: nutanixbible.com REST APIs section, nutanix.dev API intro, Tines auth guide
- Source: https://www.nutanixbible.com/pdf/19a-rest-apis.pdf
- Source: https://www.nutanix.dev/lab_content/php-api-lab-v3/contents/intro.html
**Fix needed:** No

---

### Q14: MARKED CORRECT
**Question:** Upload image via v3 API with URL source — `source_uri` vs `source_url`
**Marked:** A | **Correct:** A
**Evidence:**
- Official v3 API documentation uses `source_uri` (NOT `source_url`) under `spec.resources`
- Option A: `{"spec": {"name": "centos8", "resources": {"image_type": "DISK_IMAGE", "source_uri": "http://..."}}, "metadata": {"kind": "image"}}` — correct
- Option D uses `source_url` — incorrect field name
- Source: https://www.nutanix.dev/api_reference/apis/prism_v3.html
**Fix needed:** No

---

### Q15: MARKED CORRECT
**Question:** Assign category value "Production" under key "Environment" via v3 API
**Marked:** B | **Correct:** B
**Evidence:**
- Category values use `PUT /api/nutanix/v3/categories/{name}/{value}` — B has correct path
- URL: `PUT /api/nutanix/v3/categories/Environment/Production`
- Body typically `{}` or `{"description": "..."}` — the `{"value": "Production"}` in B is slightly imprecise but harmless (API ignores unknown fields)
- The PUT method and URL path are the critical distinguishing factors; B is unambiguously the best option
- Source: https://www.nutanix.dev/reference/prism_central/v3/api/categories_createcategoryvalue
- Source: https://www.lets-talk-about.tech/2021/01/nutanix-managing-categories-through-api_19.html
**Fix needed:** No — B is correct. Minor note: body should ideally be `{"value": "Production", "description": ""}` or `{}`, but among the 4 options B is definitively correct.

---

### Q16: ⚠️ NEEDS FIX
**Question:** Filter VM list by category "Environment:Production" via v3 API
**Marked:** D (`"Environment==Production"`) | **Correct:** B (`"categories.Environment==Production"`)
**Evidence:**
- FIQL filter syntax for categories requires the `categories.` prefix with dot notation
- Correct syntax: `"categories.Environment==Production"` — matches option B exactly
- The simpler `"Environment==Production"` (option D) lacks the `categories.` prefix and does NOT work as a category filter — it would try to match a top-level attribute named "Environment"
- Confirmed by multiple sources:
  - Nutanix FIQL filtering community post: https://next.nutanix.com/how-it-works-22/nutanix-rest-api-v3-fiql-filtering-40156
  - nutanix.dev API Reference: https://www.nutanix.dev/api_reference/apis/prism_v3.html
  - Community example: https://next.nutanix.com/how-it-works-22/how-to-use-v3-api-to-get-categories-usage-details-38930
- All three independent sources confirm `categories.<CategoryKey>==<Value>` as the working syntax
**Fix needed:** Yes — Change answer from D to **B**. Update explanation to: "The v3 list API FIQL filter for categories uses dot notation: `categories.CategoryKey==CategoryValue`. The `categories.` prefix is required to scope the filter to category metadata. Without it, the filter would attempt to match a non-existent top-level attribute."

---

### Q18: MARKED CORRECT
**Question:** HTTP 409 Conflict when updating VM via v3 API
**Marked:** B | **Correct:** B
**Evidence:**
- 409 Conflict = `spec_version` mismatch (optimistic concurrency control)
- Error message: "The entity you are trying to update might have been modified. spec version mismatch: specified version X, requested Y"
- Reason code: `SPEC_VERSION_MISMATCH`
- Fix: re-GET entity, use latest spec_version in PUT body, retry
- Source: https://next.nutanix.com/how-it-works-22/i-want-to-update-vm-only-with-categories-but-asking-for-spec-version-40334
- Source: https://www.nutanix.dev/api_reference/apis/prism_v3.html
**Fix needed:** No

---

### Q19: MARKED CORRECT
**Question:** Poll task status after async v3 API operation
**Marked:** A | **Correct:** A
**Evidence:**
- Correct endpoint: `GET /api/nutanix/v3/tasks/{task_uuid}`
- Returns status: PENDING, RUNNING, SUCCEEDED, FAILED
- Standard pattern: operation returns task_uuid → poll GET /tasks/{uuid} until terminal state
- Source: https://www.nutanix.dev/api_reference/apis/prism_v3.html
- Source: https://www.nutanixbible.com/pdf/19a-rest-apis.pdf
**Fix needed:** No

---

### Q23: ⚠️ NEEDS FIX
**Question:** Genesis service crashed — how to restart it
**Marked:** D ("no `genesis restart` command; use `genesis stop && cluster start`") | **Correct:** A (`genesis restart`)
**Evidence:**
- **`genesis restart` IS a valid, documented command.** The official Nutanix AOS Command Reference confirms this:
  - Syntax: `genesis start|stop|restart|status [all|<service1> [<service2> ...]]`
  - AOS 6.5: https://portal.nutanix.com/page/documents/details?targetId=Command-Ref-AOS-v6_5:aut-genesis-crg-auto-r.html
  - AOS 6.7: https://portal.nutanix.com/page/documents/details?targetId=Command-Ref-AOS-v6_7:aut-genesis-crg-auto-r.html
  - AOS 6.8: https://portal.nutanix.com/page/documents/details?targetId=Command-Ref-AOS-v6_8:aut-genesis-crg-auto-r.html
- Option D's claim that "There is no `genesis restart` command" is factually wrong per official documentation
- `genesis restart` is equivalent to stop + start, is the standard method, and is widely used in Nutanix community
- Source: https://it.giffen.cloud/2021/11/01/nutanix-cheat-sheet/
- Source: https://next.nutanix.com/installation-configuration-23/genesis-restart-when-cluster-start-39201
**Fix needed:** Yes — Change answer from D to **A**. Update explanation to: "The `genesis restart` command is the correct way to restart the Genesis service on a CVM. The official AOS Command Reference documents the syntax as `genesis start|stop|restart|status`. While Genesis does have a systemd watchdog for automatic recovery, the direct manual restart command is `genesis restart`. Option D's claim that no `genesis restart` command exists is incorrect per portal.nutanix.com documentation."

---

### Q24: MARKED CORRECT
**Question:** Check Cassandra metadata ring status across all CVMs
**Marked:** C | **Correct:** C
**Evidence:**
- `nodetool -h 0 ring` is the Nutanix-specific convention
- `-h 0` is a Nutanix shorthand for connecting to the local Cassandra (Medusa) instance via JMX
- `-h localhost` (option A) may also work functionally, but `-h 0` is the documented Nutanix convention
- Shows token ring: node status (Up/Down), state (Normal/Leaving/Joining), load, ownership
- Source: https://next.nutanix.com/how-it-works-22/explain-the-function-of-the-command-nodetool-h-0-ring-38955
- Source: https://next.nutanix.com/how-it-works-22/cluster-management-useful-commands-40052
- Source: https://next.nutanix.com/how-it-works-22/checklist-to-verify-cluster-health-status-prior-to-the-restarting-a-cvm-39090
**Fix needed:** No

---

### Q25: MARKED CORRECT
**Question:** Check which CVM services are running on the local CVM
**Marked:** B | **Correct:** B
**Evidence:**
- `genesis status` shows services on the **local CVM only** — exactly what the question asks
- `cluster status` (option A) shows services across **ALL CVMs** in the cluster — broader than asked
- `genesis status` lists individual service states (running/stopped) with PIDs for the specific CVM
- Source: https://techspecs.sirrub.com/2025/04/nutanix-go-to-commands.html
- Source: https://foundinfra.com/?p=67
- Source: https://next.nutanix.com/how-it-works-22/cluster-management-useful-commands-40052
**Fix needed:** No

---

## Summary

| Q# | Status | Marked | Correct | Fix Required |
|----|--------|--------|---------|--------------|
| Q12 | ✅ CORRECT | B | B | No |
| Q13 | ✅ CORRECT | B | B | No |
| Q14 | ✅ CORRECT | A | A | No |
| Q15 | ✅ CORRECT | B | B | No |
| Q16 | ⚠️ **NEEDS FIX** | D | **B** | Yes — `categories.Environment==Production` not `Environment==Production` |
| Q18 | ✅ CORRECT | B | B | No |
| Q19 | ✅ CORRECT | A | A | No |
| Q23 | ⚠️ **NEEDS FIX** | D | **A** | Yes — `genesis restart` IS a valid command per official AOS docs |
| Q24 | ✅ CORRECT | C | C | No |
| Q25 | ✅ CORRECT | B | B | No |

**Total: 8 correct, 2 need fixes (Q16, Q23)**
