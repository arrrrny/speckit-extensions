---
description: "Deep analysis pass — exhaustively walks the target project to produce a complete, numbered feature inventory (inventory.md + inventory.json); explicitly FORBIDDEN from writing specs or code"
---

# TUPEC: Scan

Perform an extremely deep analysis of an existing codebase and produce a **feature inventory** — a complete, exhaustive, numbered list of every feature/capability the project has — **WITHOUT writing any specs or code**.

## User Input

```text
$ARGUMENTS
```

The user input is an optional target path (default: repository root / current working directory). Accept forms:
- Bare path: `~/Developer/forklift`
- `path=~/Developer/forklift` or `--path ~/Developer/forklift`
- Nothing: use repo root (current working directory)

## Prerequisites

- Node.js available (for `tupec/scripts/tupec.mjs init`).
- Ensure `.specify/tupec/` directory exists (created by `tupec.mjs init`).
- Read `.specify/extensions/tupec/tupec-config.yml` for `scan_depth` (quick | normal | exhaustive), `inventory_path`.

## Safety: FORBIDDEN Actions

This command is **explicitly FORBIDDEN** from:
- Writing any spec files (`spec.md`, `plan.md`, `tasks.md`, etc.)
- Writing any implementation code
- Invoking `__SPECKIT_COMMAND_SPECIFY__`, `__SPECKIT_COMMAND_IMPLEMENT__`, or any TDD commands
- Modifying source files in the target project

It ONLY reads the target project and writes `.specify/tupec/inventory.json` + `.specify/tupec/inventory.md`.

## Execution

### 1. Resolve Target Path

Set `TARGET_PATH` from user input or default to `process.cwd()`. Normalize to absolute path. Verify it exists and is a directory.

### 2. Initialize Inventory State

Run `node .specify/extensions/tupec/scripts/tupec.mjs init` (or the installed script path) to create/ensure:
- `.specify/tupec/inventory.json` with `version: 1`, empty `features: []`, `history: []`, `locked: false`, `scanDepth` from config.
- `.specify/tupec/inventory.md` (rendered from JSON).

### 3. Perform Exhaustive Analysis

Walk `TARGET_PATH` according to `scan_depth`:

#### `quick` — Entrypoints & Main Routes
- Package manifests (`pubspec.yaml`, `package.json`, `Cargo.toml`, `go.mod`, `pyproject.toml`)
- Main entrypoints (`main.dart`, `main.ts`, `main.go`, `cmd/*.go`, `src/main.rs`)
- Top-level routing / CLI definitions

#### `normal` — + Routes, DB, Config, Integrations, Auth
- HTTP routes / controllers / handlers
- CLI command definitions
- Database schemas / migrations / entity definitions
- Config / env keys (`.env*`, `config.*`, `settings.*`)
- Third-party integrations (SDK clients, API wrappers)
- Auth / authz (guards, middleware, token handling)

#### `exhaustive` — + Background Jobs, Observability, Scripts, Tests-as-Spec, Dead Code, Unmapped
- Background jobs / workers / queues / cron
- Observability: logging, metrics, tracing, health checks
- Scripts (`scripts/`, `tools/`, `bin/`, `Makefile`, `justfile`, `Taskfile.yml`)
- Tests as behavioral spec: acceptance tests, integration tests, contract tests
- Dead code detection: unreferenced exports, unreachable routes, unused config keys
- **Unmapped areas**: code regions that cannot be classified into a feature (record honestly)

For each discovered capability, produce a feature entry:

```json
{
  "id": "F001",
  "title": "HTTP Task API",
  "description": "REST endpoints for task submission, status polling, and result retrieval",
  "evidence": [
    "lib/src/api/task_routes.dart:42",
    "lib/src/api/task_controller.dart:15-80",
    "test/api/task_api_test.dart:1"
  ],
  "category": "api",
  "size": "L",
  "dependencies": [],
  "status": "keep",
  "origin": "discovered"
}
```

**Field rules:**
- `id`: Stable sequential `F001`, `F002`, … (never reused, never renumbered)
- `title`: Concise noun phrase, unique-ish
- `description`: One line, what the capability does
- `evidence`: Array of `path/to/file.ext:line` or `path/to/file.ext:start-end` pointing to source evidence
- `category`: One of `api`, `core`, `cli`, `auth`, `config`, `integration`, `observability`, `data`, `dead`, `unmapped`
- `size`: `XS` | `S` | `M` | `L` | `XL` (rough effort proxy)
- `dependencies`: Array of feature `id`s this feature depends on (e.g., `["F001", "F003"]`)
- `status`: `keep` (default), `chopped`, `added`
- `origin`: `discovered` (from scan), `added` (from `tupec.add`)

Record **unmapped** areas separately in `inventory.json` under `unmapped: []` with `path`, `reason` (e.g., "orphaned utility", "generic helper", "cannot classify").

Mark any ambiguous findings with `[NEEDS CLARIFICATION]` in the description or evidence note.

### 4. Write Inventory Files

**`inventory.json`** — Machine state:
```json
{
  "version": 1,
  "locked": false,
  "scanDepth": "exhaustive",
  "targetPath": "/absolute/path/to/project",
  "scannedAt": "2026-08-26T10:00:00.000Z",
  "features": [ /* ... */ ],
  "unmapped": [ /* ... */ ],
  "history": [
    { "timestamp": "2026-08-26T10:00:00.000Z", "action": "scan", "details": "Scanned /path/to/project at depth exhaustive; found 42 features, 3 unmapped" }
  ],
  "configSnapshot": { "scan_depth": "exhaustive", "stack": "", "constraints": [], "tdd": true, "spec_batch_size": 0 }
}
```

**`inventory.md`** — Human-readable render:
```markdown
# Feature Inventory: <target-project-name>

- **Scanned**: 2026-08-26T10:00:00Z
- **Depth**: exhaustive
- **Target**: /absolute/path/to/project
- **Features**: 42 (keep: 38, chopped: 0, added: 0)
- **Unmapped**: 3
- **Locked**: false

## Features

### F001 — HTTP Task API [L, api, keep, discovered]
REST endpoints for task submission, status polling, and result retrieval
- Evidence: `lib/src/api/task_routes.dart:42`, `lib/src/api/task_controller.dart:15-80`
- Dependencies: —

### F002 — Scheduler [M, core, keep, discovered]
Cron-like scheduler for recurring task execution
- Evidence: `lib/src/scheduler/scheduler.dart:10`, `lib/src/scheduler/job_store.dart:1`
- Dependencies: F001

...
### F042 — [NEEDS CLARIFICATION] Orphaned Utility Module [XS, unmapped, keep, discovered]
Generic helper functions with no clear feature ownership
- Evidence: `lib/src/utils/helpers.dart:1-200`
- Dependencies: —

## Unmapped Areas

- `lib/src/legacy/compat.dart:1-50` — Legacy compatibility shim, no clear feature
- `scripts/old-deploy.sh` — Deprecated deploy script, not in use
```

### 5. Append History

Add a history entry: `{ "timestamp": "...", "action": "scan", "details": "Scanned X at depth Y; found N features, M unmapped" }`.

### 6. Report Back

- Path to `inventory.md` and `inventory.json`
- Counts: total, keep, chopped, added, unmapped
- Top categories breakdown
- Note any `[NEEDS CLARIFICATION]` items
- Next steps: `speckit.tupec.list` to review, `speckit.tupec.chop` / `speckit.tupec.add` to iterate, `speckit.tupec.spec --lock` when finalized.

## Guardrails

- **Never write specs or code** — this is analysis only.
- **Never overwrite** an existing `inventory.json` without confirmation (interactive) or refuse (automated). If inventory exists and `locked: true`, refuse and instruct to use `tupec.chop`/`tupec.add` instead.
- **Honesty over completeness** — mark `[NEEDS CLARIFICATION]` rather than guessing.
- **Audit trail** — every scan appends to `history`; never mutate prior history entries.
- **Idempotent-ish** — re-running scan on same path at same depth should produce stable IDs for previously discovered features (match by evidence paths); new features get new IDs.