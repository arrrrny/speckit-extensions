---
description: "Census an existing Dart/Flutter package (public API, tests, native surface, deps, consumers), decide the target zuraffa shape, and write the migration contract"
---

# Zuraffa Migrate — Analyze

Inventory the existing package so the migration is a contract, not a vibe.
This command is **read-only on the source**: it writes exactly one artifact,
`specs/<NNN>-zuraffa-migration/migration-contract.md`, from the
`migration-contract` template.

## User Input

```text
$ARGUMENTS
```

- First argument: path to the package to migrate (default: current directory).
- `--name <new-name>`: the target package name if it differs (rebrand case).

## Step 0 — Preconditions

```bash
pkg="${1:-$PWD}"
zfa --version 2>/dev/null && echo ZFA_OK || echo ZFA_MISSING
test -f "$pkg/pubspec.yaml" && echo PUBSPEC_OK || echo NOT_A_DART_PACKAGE
```

ZFA_MISSING → fix: install the zfa CLI first; this extension is a coordinator,
the engine is `zfa`.

## Step 1 — Public API census (the parity contract)

Enumerate every exported symbol from the barrel(s):

```bash
grep -rn "^export " lib/ | sed 's/export //'
```

For each exported symbol, record: name, kind (class / function / enum /
extension / constant), and its public members (one line each). Symbols that
are only re-exports of dependencies get marked `passthrough` — they are not
yours to migrate.

## Step 2 — Behavior census (tests are the contract)

```bash
find test -name "*_test.dart" | sort
dart test 2>&1 | tail -5      # or: flutter test
```

Record the **baseline**: every test file, what behavior(s) it pins, and the
passing count. This number may never regress during migration. A behavior not
pinned by a test is a spec question — list it under "Unpinned behaviors" in
the contract and write the missing test during the port phase.

## Step 3 — Native/platform census

```bash
grep -rn "MethodChannel\|EventChannel\|pigeon\|dart:ffi\|DynamicLibrary" lib/ bin/ | head -40
```

Classify each hit: `ffi` (dlopen'd native library), `channel` (platform
channel), `asset`, `build-script`. This decides the shape in Step 5.

## Step 4 — Dependency + consumer census

```bash
cat pubspec.yaml
grep -rln "package:<current_name>/" ../ --include="*.dart" | grep -v "/<current_name>/" | head
gh search code "package:<current_name>/" --limit 50   # consumers outside sibling checkouts
```

List dependencies and which ones become zuraffa-native equivalents (hand DI →
container, errors → AppFailure). List every consumer repo — sibling checkouts
from the grep plus the `gh search` hits (consumers checked out elsewhere or in
other orgs) — and the symbols they
actually import — the facade promise (§ Phase 4 of the migration guide) is
made to them, not to the export list.

## Step 5 — Shape decision

Apply the decision table (never scaffold a federated monorepo for a package
whose only native touch is FFI):

| Census says | Target shape |
|---|---|
| No `package:flutter/` imports, no channels (FFI/logic/CLI ok) | **Zuraffa package** — `zfa package create <name>` |
| Channels / native platform APIs | **Federated plugin** — `zfa package create-plugin <name>` |
| Pure core + thin Flutter wrapper | Package for the core now; wrapper migrates later as sibling |

Record the decision **with the census evidence that forced it**. For a
federated plugin target, also record the target platform list in the
contract's shape decision (§6) — the plan phase copies it verbatim into
`zfa package create-plugin --platforms`.

## Step 6 — Mapping decisions

Walk the Step-1 symbol list and assign every symbol a zuraffa shape (service →
port + usecases; structs → entities; streams → StreamUseCase; init/dispose →
module lifecycle; singletons → DI; errors → AppFailure; CLI → thin bin shell).
Any symbol you cannot classify: STOP — write the question into the contract's
"Open questions" section. Unresolved mapping decisions must not survive into
the plan phase.

## Step 7 — Write the contract

Write `specs/<NNN>-zuraffa-migration/migration-contract.md` from the
`migration-contract` template, fill every section, and print a summary table:
shape, symbol count, mapped count, open questions, baseline test count.

PASS: contract exists, every symbol has a decision or an open question, shape
justified. FAIL: any census section empty → re-run that step.
