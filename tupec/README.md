# TUPEC — Total Rewrite Feature Inventory

Turn a legacy codebase into a greenfield rewrite plan. TUPEC performs an **extremely deep analysis** to produce a complete, exhaustive, numbered feature inventory — then lets you **chop** what shouldn't survive, **add** what the rewrite needs, and finally **emit greenfield specs** for every surviving feature through the TDD cycle.

## The Three-Round Loop

```
scan → chop/add (iterate until satisfied) → spec --lock
```

1. **`speckit.tupec.scan`** — Deep analysis pass. Walks the target project exhaustively: entrypoints, routes/CLI surfaces, HTTP endpoints, DB schemas/migrations, background jobs, config/env keys, integrations, auth, observability, scripts, tests-as-spec, dead code. Produces `.specify/tupec/inventory.md` (human) + `.specify/tupec/inventory.json` (machine). **Never writes specs or code.**

2. **`speckit.tupec.chop` / `speckit.tupec.add`** — Iterate on the inventory. `chop` marks features `chopped` (audit trail preserved). `add` introduces new features (`A001...`). `speckit.tupec.list` shows the current state with dependency warnings.

3. **`speckit.tupec.spec --lock`** — FINAL run. Requires locked inventory. For every `keep` feature in dependency order, invokes `__SPECKIT_COMMAND_SPECIFY__` to write a greenfield spec (describing the NEW system only). Injects rewrite constraints from config. When `tdd: true`, chains `__SPECKIT_COMMAND_TDD_PLAN__` per feature. Emits `.specify/tupec/rewrite-plan.md` mapping feature id → spec path → branch. Idempotent: skips already-speced features, records failures.

## Command Reference

| Command | Purpose |
|---------|---------|
| `speckit.tupec.scan [path]` | Exhaustive analysis → inventory.md + inventory.json |
| `speckit.tupec.chop <ids...> --reason "..."` | Mark features chopped (preserves audit trail) |
| `speckit.tupec.add --title "..." --desc "..." --rationale "..." --category "..." [--deps F001,F002]` | Add new feature (origin: added, id A001...) |
| `speckit.tupec.list [--json]` | Render inventory: kept/chopped/added, counts, deps, lock state |
| `speckit.tupec.spec --lock` | Emit greenfield specs for all kept features via specify + TDD |

All commands operate on `.specify/tupec/inventory.json` via `tupec/scripts/tupec.mjs` (deterministic subcommands: `init`, `list`, `add`, `chop`, `lock`, `set-spec`).

## Configuration Reference

`.specify/extensions/tupec/tupec-config.yml` (from `config-template.yml`):

```yaml
inventory_path: ".specify/tupec/"
scan_depth: "exhaustive"        # quick | normal | exhaustive
stack: ""                       # e.g., "zuraffa" — injected as hard constraint
constraints: []                 # free-form hard constraints per spec
tdd: true                       # chain __SPECKIT_COMMAND_TDD_PLAN__ per feature
spec_batch_size: 0              # 0 = all at once
```

### Stack: zuraffa

When `stack: zuraffa` is set, `tupec.spec` requires every emitted spec to be realizable **only** with zuraffa-generated clean-architecture layers:
- `zfa entity create` — domain entities
- `zfa make` — use cases, repositories, controllers
- `zfa build` — code generation

No hand-rolled architecture, no legacy patterns carried over.

## State File Layout

```
.specify/tupec/
├── inventory.json      # Machine state: features[], history[], locked, configSnapshot
├── inventory.md        # Human-readable render of inventory.json
├── rewrite-plan.md     # Emitted by tupec.spec: feature id → spec path → branch
└── history/            # (optional) timestamped snapshots
```

### `inventory.json` Schema (simplified)

```json
{
  "version": 1,
  "locked": false,
  "scanDepth": "exhaustive",
  "features": [
    {
      "id": "F001",
      "title": "HTTP Task API",
      "description": "REST endpoints for task submission, status, results",
      "evidence": ["lib/src/api/task_routes.dart:42", "lib/src/api/task_controller.dart:15"],
      "category": "api",
      "size": "M",
      "dependencies": [],
      "status": "keep",
      "origin": "discovered"
    }
  ],
  "history": [
    { "timestamp": "2026-08-26T10:00:00Z", "action": "scan", "details": "..." },
    { "timestamp": "2026-08-26T10:15:00Z", "action": "chop", "ids": ["F007"], "reason": "Legacy auth" }
  ]
}
```

## Worked Example: Rewriting `forklift` with zuraffa

> **Illustrative only** — feature names below are representative, not extracted from the actual forklift codebase.

**Context:** `~/Developer/forklift` is a Dart orchestrator repo (2-level agentic workflow orchestrator):
- HTTP task API, scheduler, worker registry, terminal adapter
- `pallet` shared tmux terminal CLI + MCP server

### 1. Scan

```bash
speckit.tupec.scan ~/Developer/forklift
```

Produces ~30–50 features (`F001`–`F050`), e.g.:
- `F001` HTTP Task API (api, L)
- `F002` Scheduler (core, M)
- `F003` Worker Registry (core, M)
- `F004` Terminal Adapter (integration, M)
- `F005` Pallet CLI (cli, M)
- `F006` Pallet MCP Server (integration, S)
- `F007` Legacy In-Memory Auth (auth, S) — marked `[NEEDS CLARIFICATION]`
- `F008` File-based Config Loader (config, S)
- `F009` Structured Logging (observability, S)
- `F010` Dead: Unused gRPC Stub (dead, XS) — category `dead`

### 2. Chop & Add

```bash
# Chop legacy auth, dead code
speckit.tupec.chop F007 F010 --reason "Legacy auth replaced by zuraffa auth; dead code"

# Add new capabilities the rewrite needs
speckit.tupec.add \
  --title "Zuraffa Auth Integration" \
  --desc "Pluggable auth via zuraffa-generated auth layer" \
  --rationale "Replace legacy in-memory auth with proper OAuth/OIDC" \
  --category auth \
  --deps F001

speckit.tupec.add \
  --title "Distributed Task Queue" \
  --desc "Redis-backed queue for horizontal scaling" \
  --rationale "Current in-memory queue doesn't survive restarts" \
  --category core \
  --deps F001,F002

# Review
speckit.tupec.list
```

### 3. Lock & Spec

Configure for zuraffa rewrite:

```yaml
# .specify/extensions/tupec/tupec-config.yml
stack: "zuraffa"
constraints:
  - "zuraffa only — no hand-rolled architecture"
  - "no legacy code carried over"
  - "all persistence through zuraffa repositories"
  - "HTTP layer uses zfa-generated endpoints only"
tdd: true
spec_batch_size: 0
```

Final run:

```bash
speckit.tupec.spec --lock
```

This will:
1. Lock the inventory (confirmation prompt with summary)
2. Topologically sort kept features by `dependencies`
3. For each feature, invoke `__SPECKIT_COMMAND_SPECIFY__` with injected constraints
4. Chain `__SPECKIT_COMMAND_TDD_PLAN__` per feature (test list first)
5. Write `.specify/tupec/rewrite-plan.md`:

```markdown
# Rewrite Plan: forklift → zuraffa

| Feature | Spec Path | Branch |
|---------|-----------|--------|
| F001 | specs/001-http-task-api/spec.md | rewrite/F001-http-task-api |
| F002 | specs/002-scheduler/spec.md | rewrite/F002-scheduler |
| F003 | specs/003-worker-registry/spec.md | rewrite/F003-worker-registry |
| A001 | specs/004-zuraffa-auth/spec.md | rewrite/A001-zuraffa-auth |
| A002 | specs/005-distributed-queue/spec.md | rewrite/A002-distributed-queue |
...
```

Each spec describes the **new system only** — behavioral evidence from the old codebase is cited, but implementation details are never carried forward.

## Install

```bash
specify extension add tupec
```

Registers `speckit.tupec.*` commands and copies `config-template.yml` to `.specify/extensions/tupec/tupec-config.yml`.

## Requirements

- Spec Kit `>=0.9.0`
- Node.js (for `tupec/scripts/tupec.mjs`)
- TDD extension (optional, enabled via `tdd: true` in config)