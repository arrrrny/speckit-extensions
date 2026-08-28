---
description: "FINAL run — requires locked inventory; for every keep feature in dependency order, invokes __SPECKIT_COMMAND_SPECIFY__ to write a greenfield spec; injects rewrite constraints from config; when tdd: true chains __SPECKIT_COMMAND_TDD_PLAN__ per feature; emits rewrite-plan.md index; idempotent"
---

# TUPEC: Spec

The **final command** — emits greenfield specs for every surviving (`keep`) feature in the locked inventory. This is the point of no return: the inventory must be locked, and specs are written through the host's `__SPECKIT_COMMAND_SPECIFY__` (and optionally `__SPECKIT_COMMAND_TDD_PLAN__`).

## User Input

```text
$ARGUMENTS
```

Required:
- `--lock` — **mandatory flag** to confirm the inventory is finalized and locked. Without this, the command refuses to run.

Optional:
- `--output <path>` / `path=<path>` — path to the NEW project where greenfield specs are written. Overrides `output_path` in config. **Never** a path inside the legacy codebase being scanned.
- `--batch N` — override `spec_batch_size` from config (0 = all at once)
- `--dry-run` — show the execution plan (topological order, specs to emit) without invoking specify
- `--force` — skip the lock confirmation prompt (automated mode only; still requires `--lock` flag)

Examples:
```
speckit.tupec.spec --lock
speckit.tupec.spec --lock --output ~/Developer/forklift-rewrite
speckit.tupec.spec --lock --batch 5
speckit.tupec.spec --lock --dry-run
```

**CRITICAL — specs are never written into the legacy code.** `tupec.scan` only *reads* the legacy project; all generated `specs/` directories and `rewrite-plan.md` are written into the resolved `OUTPUT_PATH` (a separate, new/rewrite project). If `output_path` is unset in config and no `--output` is given, the command **asks the user** for this path before emitting anything.

## Prerequisites

- `.specify/tupec/inventory.json` must exist with `locked: true`.
- If `locked: false`, the command **prompts for confirmation** (interactive) or **refuses** (automated) unless `--lock --force` is given.
- Node.js available.
- Host must have `__SPECKIT_COMMAND_SPECIFY__` available.
- If `tdd: true` in config, `__SPECKIT_COMMAND_TDD_PLAN__` must be available.
- Config loaded from `.specify/extensions/tupec/tupec-config.yml`: `stack`, `constraints[]`, `tdd`, `spec_batch_size`.

## Execution

### 1. Load Inventory & Config

Read `.specify/tupec/inventory.json` and `.specify/extensions/tupec/tupec-config.yml`.

Verify `locked: true`. If false:
- Interactive: Show summary (counts, kept features list) and ask: `Lock inventory and proceed with spec emission? This cannot be undone. (yes/no)` — on `yes`, set `locked: true` and continue; on `no`, abort.
- Automated / `--force`: If `--lock` flag present, set `locked: true` and continue; otherwise refuse with "Inventory not locked. Run with --lock to lock and proceed."

### 1b. Resolve Output Path (where specs are written)

This is the path to the **new/rewrite project** — a directory that is separate from the legacy codebase scanned by `tupec.scan`. Specs are written here, never into the legacy code.

Resolve `OUTPUT_PATH` in this order:
1. `--output <path>` / `path=<path>` argument (if provided).
2. `output_path` in `tupec-config.yml` (if non-empty).
3. **If still unresolved, PROMPT the user**: "Where should the greenfield specs be written? Enter the path to a new or existing project directory (this must NOT be the legacy codebase being rewritten):"

Then normalize and validate:
- Expand `~` and resolve to an absolute path.
- **Safety check**: if `OUTPUT_PATH` is the same as, or nested inside, the legacy `targetPath` recorded in `inventory.json`, refuse with a clear error and re-prompt. We must never write specs into the legacy code.
- If the directory does not exist, create it (interactive: confirm first; automated/`--force`: create silently).
- If `OUTPUT_PATH` is `"self"`, treat it as the current working directory (legacy behavior) — but still warn that this mixes specs with the host project.

Record `OUTPUT_PATH` (absolute) for all subsequent steps. All `specPath` values in `specResults` and `rewrite-plan.md` are written relative to `OUTPUT_PATH`.

### 2. Filter & Sort Features

Select features where `status === "keep"` (includes both `origin: "discovered"` and `origin: "added"`).

**Topological sort** by `dependencies`:
- Build DAG from `dependencies` edges.
- Detect cycles → error with cycle details.
- Sort so dependencies come before dependents.
- If multiple valid orders, prefer: discovered before added, then by ID.

Let `orderedFeatures` be the sorted array.

### 3. Dry Run Mode

If `--dry-run`:
- Print execution plan:
  ```
  Execution Plan (N features, batch size: X)
  1. F001 — HTTP Task API (deps: —)
  2. F002 — Scheduler (deps: F001)
  3. A001 — Zuraffa Auth Integration (deps: F001)
  ...
  ```
- Show config injection: `stack`, `constraints[]`, `tdd`
- Exit without writing specs.

### 4. Prepare Rewrite Constraints Injection

Build `rewriteContext` string to inject into every spec:

```markdown
## Rewrite Constraints (injected by TUPEC)

**Target Stack**: zuraffa (Flutter/Dart clean-architecture framework)
- All specs MUST be realizable using ONLY zuraffa-generated layers:
  - `zfa entity create` — domain entities
  - `zfa make` — use cases, repositories, controllers, endpoints
  - `zfa build` — code generation
- NO hand-rolled architecture, NO legacy patterns carried over.

**Hard Constraints**:
- zuraffa only — no hand-rolled architecture
- no legacy code carried over
- all persistence through zuraffa repositories
- HTTP layer uses zfa-generated endpoints only

**TDD**: Enabled — every spec will be driven through the red-green-refactor loop via __SPECKIT_COMMAND_TDD_PLAN__.
```

If `stack` is empty, omit the "Target Stack" section but keep constraints.

### 5. Batch Processing

If `spec_batch_size > 0` (or `--batch N`), process in batches of that size. Otherwise, process all at once.

For each batch:
- For each feature in batch (in topological order):
  - **Invoke `__SPECKIT_COMMAND_SPECIFY__` from inside `OUTPUT_PATH`** so the spec is written into the new project, never the legacy code:

    ```bash
    cd "<OUTPUT_PATH>" && __SPECKIT_COMMAND_SPECIFY__ "<feature title> — greenfield spec (TUPEC <feature-id>)"
    ```

    The invocation must pass:
  - Feature title, description, evidence (as behavioral evidence only), category, size
  - Dependencies (as references to other specs being written)
  - The `rewriteContext` as additional context/constraints
  - A suggested spec slug: `tupec-<feature-id>-<kebab-title>` (e.g., `tupec-F001-http-task-api`)
  - A suggested branch: `rewrite/tupec-<feature-id>-<kebab-title>`

  **Critical**: The spec must describe the **NEW system only**. It may cite old evidence as *behavioral reference* (e.g., "acceptance criterion: task submission returns 201 with task ID — see old `task_controller.dart:15`"), but must never reference old implementation details as design guidance. The spec file is created under `OUTPUT_PATH/specs/…`, completely outside the legacy codebase.

  - **If `tdd: true`**: After spec is written, immediately invoke `__SPECKIT_COMMAND_TDD_PLAN__` for that feature (also from inside `OUTPUT_PATH`) to derive the test list and make test tasks mandatory.

  - Record result in `specResults[]`: `{ featureId, specPath, branch, status: "success" | "skipped" | "failed", error? }`
    - `specPath` is the **absolute** path under `OUTPUT_PATH` (e.g. `/abs/forklift-rewrite/specs/001-tupec-F001-http-task-api/spec.md`)
    - `skipped`: spec already exists at expected path (idempotent)
    - `failed`: specify or tdd.plan threw; record error, continue to next feature

### 6. Write rewrite-plan.md

After all batches, write **`rewrite-plan.md` into `OUTPUT_PATH`** (the new project root, alongside the emitted `specs/`). This keeps the rewrite index together with the specs so the new project is self-contained and transportable.

```markdown
# Rewrite Plan: <target-project-name>

- **Generated**: 2026-08-26T10:30:00Z
- **Inventory**: <host-project>/.specify/tupec/inventory.json (locked)
- **Output Path**: <OUTPUT_PATH>   ← all specs below live here, NOT in the legacy code
- **Legacy Scanned**: <targetPath from inventory.json>
- **Stack**: zuraffa
- **TDD**: true
- **Features Speced**: 38 / 42 kept
- **Failed**: 0
- **Skipped**: 4

## Spec Map

| Feature | Title | Spec Path (under <OUTPUT_PATH>) | Branch | Status |
|---------|-------|-----------|--------|--------|
| F001 | HTTP Task API | specs/001-tupec-F001-http-task-api/spec.md | rewrite/tupec-F001-http-task-api | success |
| F002 | Scheduler | specs/002-tupec-F002-scheduler/spec.md | rewrite/tupec-F002-scheduler | success |
| A001 | Zuraffa Auth Integration | specs/003-tupec-A001-zuraffa-auth-integration/spec.md | rewrite/tupec-A001-zuraffa-auth-integration | success |
| F007 | Legacy Auth | — | — | skipped (chopped) |
...

## Failed Features

| Feature | Error |
|---------|-------|
| F042 | __SPECKIT_COMMAND_SPECIFY__ exited with code 1: ... |
```

### 7. Update Inventory

- Set `locked: true` (if not already)
- Add `specResults` to inventory.json (new field)
- Append history entry:
```json
{
  "timestamp": "2026-08-26T10:30:00.000Z",
  "action": "spec",
  "specCount": 38,
  "failedCount": 0,
  "skippedCount": 4,
  "stack": "zuraffa",
  "tdd": true,
  "outputPath": "<OUTPUT_PATH>",
  "rewritePlanPath": "<OUTPUT_PATH>/rewrite-plan.md"
}
```

### 8. Regenerate inventory.md

Run `tupec.mjs list` to update human-readable render.

### 9. Report Back

- Path to `rewrite-plan.md` (in `OUTPUT_PATH`, the new project)
- **Where specs live**: `<OUTPUT_PATH>/specs/…` — confirm this is the new project, NOT the legacy codebase
- Counts: speced, skipped, failed
- Any failures listed with feature ID and error
- Next steps:
  - Review `rewrite-plan.md` in the new project
  - For each feature, run implementation via the host's workflow (spec → plan → tasks → implement → TDD loop) — operate from `OUTPUT_PATH` so work lands in the rewrite project
  - The branches in `rewrite-plan.md` are suggested isolation branches for each feature's implementation

## Guardrails

- **Lock is mandatory** — no spec emission without `--lock` (and confirmation if not forced).
- **Idempotent** — skips features where spec already exists at expected path; records as `skipped`.
- **Failure isolation** — one feature's spec failure does not stop others; records failure and continues.
- **Greenfield only** — specs describe the NEW system; old code cited only as behavioral evidence.
- **Constraints injected** — `stack` and `constraints[]` from config embedded in every spec.
- **TDD chaining** — when `tdd: true`, `__SPECKIT_COMMAND_TDD_PLAN__` runs immediately after each spec.
- **Topological order** — dependencies speced before dependents.
- **Audit trail** — full history entry with counts and rewrite-plan path.