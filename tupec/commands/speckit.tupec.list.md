---
description: "Render current inventory: kept / chopped / added, counts, dependency warnings, lock state; supports --json output"
---

# TUPEC: List

Render the current feature inventory in human-readable or JSON format. Shows kept / chopped / added counts, dependency warnings (kept features depending on chopped ones), and lock state.

## User Input

```text
$ARGUMENTS
```

Optional:
- `--json` — output machine-readable JSON to stdout (instead of human markdown)
- `--status keep|chopped|added` — filter by status (can repeat)
- `--category api|core|cli|auth|config|integration|observability|data|dead|unmapped` — filter by category (can repeat)

Examples:
```
speckit.tupec.list
speckit.tupec.list --json
speckit.tupec.list --status keep --category api
speckit.tupec.list --status chopped,added
```

## Prerequisites

- `.specify/tupec/inventory.json` must exist (run `speckit.tupec.scan` first).

## Execution

### 1. Load Inventory

Read `.specify/tupec/inventory.json`. Parse `features[]`, `locked`, `scanDepth`, `scannedAt`, `targetPath`, `history[]`, `unmapped[]`, `configSnapshot`.

### 2. Apply Filters

If `--status` or `--category` provided, filter `features[]` accordingly (OR within same flag, AND across flags).

### 3. Compute Statistics

- `total`: filtered features length
- `keep`: count where `status === "keep"`
- `chopped`: count where `status === "chopped"`
- `added`: count where `origin === "added"` (note: added features have status `keep` by default)
- `byCategory`: object with counts per category
- `bySize`: object with counts per size
- `brokenDependencies`: array of `{ featureId, featureTitle, missingDepId, missingDepTitle }` where a kept feature depends on a chopped feature

### 4. Output

#### Human Mode (default)

```markdown
# Feature Inventory: <target-project-name>

- **Scanned**: 2026-08-26T10:00:00Z
- **Depth**: exhaustive
- **Target**: /absolute/path/to/project
- **Features**: 42 (keep: 38, chopped: 2, added: 4)
- **Unmapped**: 3
- **Locked**: false

## Summary

| Status   | Count |
|----------|-------|
| keep     | 38    |
| chopped  | 2     |
| added    | 4     |

## By Category

| Category         | Count |
|------------------|-------|
| api              | 8     |
| core             | 12    |
| cli              | 4     |
| auth             | 3     |
| config           | 2     |
| integration      | 5     |
| observability    | 3     |
| data             | 3     |
| dead             | 1     |
| unmapped         | 1     |

## Dependency Warnings

⚠️ **2 kept features depend on chopped features:**

- **F003** "Worker Registry" → depends on **F007** "Legacy Auth" (chopped)
- **F005** "Pallet CLI" → depends on **F010** "Dead gRPC Stub" (chopped)

## Features

### Kept (38)

#### F001 — HTTP Task API [L, api, keep, discovered]
REST endpoints for task submission, status polling, and result retrieval
- Evidence: `lib/src/api/task_routes.dart:42`, `lib/src/api/task_controller.dart:15-80`
- Dependencies: —

#### F002 — Scheduler [M, core, keep, discovered]
Cron-like scheduler for recurring task execution
- Evidence: `lib/src/scheduler/scheduler.dart:10`, `lib/src/scheduler/job_store.dart:1`
- Dependencies: F001

...

#### A001 — Zuraffa Auth Integration [M, auth, keep, added]
Pluggable auth via zuraffa-generated auth layer
- Rationale: Replace legacy in-memory auth with proper OAuth/OIDC
- Dependencies: F001

### Chopped (2)

#### F007 — Legacy In-Memory Auth [S, auth, chopped, discovered]
Simple in-memory token store for development
- Evidence: `lib/src/auth/memory_auth.dart:1`
- Dependencies: —
- **Chopped**: 2026-08-26T10:15:00Z — "Legacy auth replaced by zuraffa auth"

#### F010 — Dead gRPC Stub [XS, dead, chopped, discovered]
Unused gRPC service definition
- Evidence: `proto/legacy.proto:1`
- Dependencies: —
- **Chopped**: 2026-08-26T10:15:00Z — "Dead code"

### Added (4)

#### A001 — Zuraffa Auth Integration [M, auth, keep, added]
Pluggable auth via zuraffa-generated auth layer
- Rationale: Replace legacy in-memory auth with proper OAuth/OIDC
- Dependencies: F001
- Added: 2026-08-26T10:20:00Z

...

## Unmapped Areas

- `lib/src/legacy/compat.dart:1-50` — Legacy compatibility shim, no clear feature
- `scripts/old-deploy.sh` — Deprecated deploy script, not in use

## History (last 5)

- 2026-08-26T10:20:00Z — add: A001 "Zuraffa Auth Integration" (auth, deps: F001)
- 2026-08-26T10:15:00Z — chop: F007, F010 — "Legacy auth replaced; dead code"
- 2026-08-26T10:00:00Z — scan: Scanned /path/to/project at depth exhaustive; found 42 features, 3 unmapped
```

#### JSON Mode (`--json`)

```json
{
  "meta": {
    "scannedAt": "2026-08-26T10:00:00.000Z",
    "scanDepth": "exhaustive",
    "targetPath": "/absolute/path/to/project",
    "locked": false,
    "unmappedCount": 3
  },
  "counts": {
    "total": 42,
    "keep": 38,
    "chopped": 2,
    "added": 4,
    "byCategory": { "api": 8, "core": 12, "...": "..." },
    "bySize": { "XS": 2, "S": 5, "M": 15, "L": 15, "XL": 5 }
  },
  "brokenDependencies": [
    { "featureId": "F003", "featureTitle": "Worker Registry", "missingDepId": "F007", "missingDepTitle": "Legacy Auth" },
    { "featureId": "F005", "featureTitle": "Pallet CLI", "missingDepId": "F010", "missingDepTitle": "Dead gRPC Stub" }
  ],
  "features": [ /* filtered feature objects */ ],
  "unmapped": [ /* unmapped array */ ],
  "history": [ /* last 10 history entries */ ]
}
```

### 5. Report Back

- Human mode: renders to terminal (via the command output)
- JSON mode: prints JSON to stdout (for piping)
- Always shows lock state and dependency warnings prominently

## Guardrails

- **Read-only** — never modifies inventory.
- **Honest about broken deps** — always surfaces kept→chopped dependencies.
- **Lock state prominent** — `Locked: true/false` at top.
- **History trimmed** — shows last 10 entries in human mode; full in JSON.