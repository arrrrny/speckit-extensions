---
description: "Mark one or more features as chopped (status: chopped) with a required reason; supports ids, ranges, and fuzzy title match; preserves audit trail and warns on dependency violations"
---

# TUPEC: Chop

Mark one or more features in the inventory as **chopped** — they will not survive the rewrite. The audit trail is preserved (entries are never deleted). Warns when other kept features depend on a chopped one and asks how to resolve.

## User Input

```text
$ARGUMENTS
```

Required:
- One or more feature identifiers (see **Identifier Forms** below)
- `--reason "..."` or `reason="..."` — **required**, non-empty reason for chopping

Optional:
- `--force` — skip dependency warnings and confirmation prompts (automated mode)
- `--dry-run` — show what would be chopped without modifying inventory

Examples:
```
speckit.tupec.chop F007 F010 --reason "Legacy auth replaced; dead code"
speckit.tupec.chop F005-F008 --reason "Entire legacy CLI module"
speckit.tupec.chop "Legacy Auth" --reason "Fuzzy title match"
speckit.tupec.chop F003 --reason "Superseded by A001" --force
```

## Identifier Forms

1. **Exact ID**: `F001`, `A003`
2. **Range**: `F005-F008` (inclusive, both ends must exist and be same prefix)
3. **Fuzzy Title Match**: quoted string `"Legacy Auth"` — matches case-insensitive substring on `title`; if multiple matches, lists all and asks for confirmation (unless `--force`)

## Prerequisites

- `.specify/tupec/inventory.json` must exist (run `speckit.tupec.scan` first).
- Inventory must **not be locked** (`locked: false`). If locked, refuse and instruct to unlock first (not implemented in v1; user must edit JSON manually or re-scan).
- Node.js available for `tupec.mjs chop`.

## Execution

### 1. Load Inventory

Read `.specify/tupec/inventory.json`. Parse `features[]`.

### 2. Resolve Identifiers to Feature Indices

For each user-supplied identifier:
- Exact ID: find feature with matching `id`
- Range: expand to all IDs in range (validate both ends exist, same prefix F/A)
- Fuzzy title: find all features where `title.toLowerCase().includes(query.toLowerCase())`

Collect unique target features. If any identifier resolves to zero features, error with "No features matched: <identifier>".

### 3. Dependency Check (Critical)

For each target feature `T`:
- Find all **kept** features (`status === "keep"`) that have `T.id` in their `dependencies` array.
- If any found and not `--force`:
  - Warn: `Feature <T.id> "<T.title>" is depended on by: <list of dependent feature ids/titles>`
  - Ask: `Chop anyway? This will leave dependent features with broken dependencies. Options: (c)hop anyway, (k)eep <T.id>, (a)bort all`
  - If `keep`: remove `T` from chop list
  - If `abort`: stop entirely, no changes
  - If `chop`: proceed, but record the broken dependency in the history entry

### 4. Confirm (Interactive Mode)

If not `--force` and not `--dry-run`:
- Show summary: `About to chop N feature(s): F007 (Legacy Auth), F010 (Dead gRPC Stub)`
- Show reason
- Ask: `Proceed? (y/n)`
- On `n`: abort

### 5. Apply Chop

For each target feature:
- Set `status: "chopped"`
- Preserve all other fields (audit trail)

### 6. Record History

Append to `history[]`:
```json
{
  "timestamp": "2026-08-26T10:15:00.000Z",
  "action": "chop",
  "ids": ["F007", "F010"],
  "reason": "Legacy auth replaced; dead code",
  "brokenDependencies": ["F003"]  // optional, only if dependencies were broken
}
```

### 7. Regenerate inventory.md

Run `node .specify/extensions/tupec/scripts/tupec.mjs list` (or equivalent render) to update `inventory.md`.

### 8. Report Back

- Chopped feature IDs and titles
- Any broken dependencies introduced (with warning)
- Updated counts: keep / chopped / added
- Path to `inventory.md`
- Next steps: `speckit.tupec.list` to review, `speckit.tupec.add` to add replacements, `speckit.tupec.spec --lock` when finalized.

## Guardrails

- **Never delete entries** — `chopped` is a status, not a removal. Audit trail is sacred.
- **Reason is mandatory** — empty reason = error.
- **Lock respected** — refuse if `locked: true`.
- **Dependency honesty** — always surface broken deps; never silently chop depended-on features.
- **Idempotent** — chopping an already-chopped feature is a no-op (with a note).