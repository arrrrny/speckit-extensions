---
description: "Add a new feature to the inventory (origin: added, ids A001...) with title, description, rationale, category, dependencies; refuses near-duplicates unless confirmed"
---

# TUPEC: Add

Add a new feature to the inventory that the rewrite should have but the current codebase lacks. New features get `origin: "added"` and IDs `A001`, `A002`, … Refuses near-duplicates of existing entries unless the user confirms.

## User Input

```text
$ARGUMENTS
```

Required:
- `--title "..."` or `title="..."` — concise noun phrase (e.g., "Zuraffa Auth Integration")
- `--desc "..."` or `desc="..."` — one-line description of what the feature does
- `--rationale "..."` or `rationale="..."` — why this feature is needed for the rewrite
- `--category "..."` or `category="..."` — one of `api`, `core`, `cli`, `auth`, `config`, `integration`, `observability`, `data`

Optional:
- `--deps F001,F003` or `deps="F001,F003"` — comma-separated list of feature IDs this feature depends on (must exist in inventory)
- `--size S` or `size="M"` — `XS` | `S` | `M` | `L` | `XL` (default: `M`)
- `--force` — skip near-duplicate check and confirmation

Examples:
```
speckit.tupec.add --title "Zuraffa Auth Integration" --desc "Pluggable auth via zuraffa-generated auth layer" --rationale "Replace legacy in-memory auth with proper OAuth/OIDC" --category auth --deps F001
speckit.tupec.add --title "Distributed Task Queue" --desc "Redis-backed queue for horizontal scaling" --rationale "Current in-memory queue doesn't survive restarts" --category core --deps F001,F002 --size L
```

## Prerequisites

- `.specify/tupec/inventory.json` must exist (run `speckit.tupec.scan` first).
- Inventory must **not be locked** (`locked: false`).
- Node.js available for `tupec.mjs add`.

## Execution

### 1. Load Inventory

Read `.specify/tupec/inventory.json`. Parse `features[]`.

### 2. Validate Inputs

- All required fields present and non-empty.
- `category` is one of the allowed values.
- `size` is one of `XS`, `S`, `M`, `L`, `XL` (default `M`).
- Each ID in `deps` exists in `features[]` (any status). If not, error: `Dependency <id> not found in inventory`.

### 3. Near-Duplicate Check

Search existing features (all statuses) for **title similarity**:
- Case-insensitive substring match on `title` (either direction: new title contains existing, or existing contains new)
- Or Jaccard similarity on title words > 0.6 (simple heuristic)

If matches found and not `--force`:
- List matches: `Potential duplicates: F007 "Legacy Auth", A001 "Auth Layer"`
- Ask: `Add anyway? (y/n)` — on `n`, abort.

### 4. Generate New ID

Find highest `A` ID in inventory (e.g., `A003` → next is `A004`). If none, start at `A001`.

### 5. Create Feature Entry

```json
{
  "id": "A004",
  "title": "Zuraffa Auth Integration",
  "description": "Pluggable auth via zuraffa-generated auth layer",
  "evidence": [],
  "category": "auth",
  "size": "M",
  "dependencies": ["F001"],
  "status": "keep",
  "origin": "added",
  "rationale": "Replace legacy in-memory auth with proper OAuth/OIDC",
  "addedAt": "2026-08-26T10:20:00.000Z"
}
```

Notes:
- `evidence` is empty array (no source code evidence for new features)
- `status` is `keep` (added features are kept by default)
- `addedAt` ISO timestamp

### 6. Append to Features

Add to `features[]` array.

### 7. Record History

Append to `history[]`:
```json
{
  "timestamp": "2026-08-26T10:20:00.000Z",
  "action": "add",
  "id": "A004",
  "title": "Zuraffa Auth Integration",
  "category": "auth",
  "dependencies": ["F001"],
  "rationale": "Replace legacy in-memory auth with proper OAuth/OIDC"
}
```

### 8. Regenerate inventory.md

Run `node .specify/extensions/tupec/scripts/tupec.mjs list` to update `inventory.md`.

### 9. Report Back

- New feature ID, title, category
- Dependencies resolved
- Updated counts: keep / chopped / added
- Path to `inventory.md`
- Next steps: `speckit.tupec.list` to review, `speckit.tupec.chop` if needed, `speckit.tupec.spec --lock` when finalized.

## Guardrails

- **Required fields enforced** — title, desc, rationale, category.
- **Dependencies must exist** — no forward references to non-existent IDs.
- **Near-duplicate protection** — prevents accidental duplication; override with `--force`.
- **Lock respected** — refuse if `locked: true`.
- **Added features are `keep` by default** — user must `chop` explicitly if they change their mind.
- **Audit trail** — `rationale` and `addedAt` preserved in feature entry; history entry records the addition.