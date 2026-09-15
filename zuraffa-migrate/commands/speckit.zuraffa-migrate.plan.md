---
description: "Scaffold the zuraffa target shape, map every symbol, and emit the rewrite feature's spec.md + TDD test-list from the migration contract"
---

# Zuraffa Migrate — Plan

Turn the migration contract (from `speckit.zuraffa-migrate.analyze`) into a
scaffolded target and an executable spec. Output: scaffold in place, a spec
the zfa TDD engine can ingest, and a test list with one behavior per parity
criterion.

## User Input

```text
$ARGUMENTS
```

- `--contract <path>`: migration contract (default: newest
  `specs/*-zuraffa-migration/migration-contract.md`).
- `--in-place`: migrate inside the existing repo on a branch
  (`zuraffa-rewrite`) instead of a fresh scaffold directory.

## Step 0 — Preconditions

```bash
contract="$(ls -t specs/*-zuraffa-migration/migration-contract.md 2>/dev/null | head -1)"
test -n "$contract" && echo CONTRACT_OK || echo CONTRACT_MISSING
```

CONTRACT_MISSING → fix: run `/speckit.zuraffa-migrate.analyze` first. An open
question in the contract blocks this command; resolve it or get a decision
recorded.

## Step 1 — Scaffold the target shape

Fresh scaffold (new repo or rebrand):

```bash
# package shape
zfa package create <name> --description "<original description>, zuraffa-native" --dry-run
zfa package create <name> --description "<original description>, zuraffa-native"

# federated shape
zfa package create-plugin <name> --description "..." --repo <owner>/<name> --platforms <platforms-from-contract>
```

Always `--dry-run` first and diff the preview against the contract's census —
surprises belong in the contract, not in the working tree.

In-place migration (`--in-place`, the dart_curl approach):

```bash
git checkout -b zuraffa-rewrite
```

Recreate the scaffold's load-bearing files by hand (`zfa package create`
refuses non-empty directories): `zfa.yaml` with `package_mode: true`,
`build.yaml` (zorphy + json_serializable builders), the
`lib/src/{domain,data,module,di}` skeleton, and add `zuraffa` +
`zorphy_annotation` to dependencies (`build_runner` + generators to
dev_dependencies). Copy the exact file shapes from a scratch scaffold in
`/tmp`.

## Step 2 — Symbol-by-symbol mapping plan

From the contract, emit a mapping table into the spec's Architecture section:
every old symbol → its zuraffa shape → its file path in the new layout. The
layer rule is non-negotiable: `lib/src/domain` never imports `dart:ffi`,
`dart:io` (beyond pure types), or channel code — the native surface lives in
`data/datasources` behind an abstract port.

## Step 3 — Author the spec

Write `specs/<NNN>-zuraffa-rewrite/spec.md` for the rewrite feature: overview
= the migration contract's parity promise; functional requirements = one per
mapped behavior group; key entities = the mapped domain types; external
dependencies & contracts = the native seam (FFI library / channel) as an
injected port with its fake.

If the zuraffa extension is installed, author from its spec template — the
rewrite spec inherits the domain-contract sections.

## Step 4 — Derive the TDD test list

```bash
zfa tdd init        # idempotent baseline: test/, dart_test.yaml, tdd profile
zfa tdd plan <NNN>-zuraffa-rewrite
```

The test list must cover, at minimum: (a) every ported behavior from the
contract's baseline census, (b) module lifecycle (bootstrap → ready →
shutdown), (c) registrar completeness (every public usecase resolvable),
(d) facade parity for each promised symbol, (e) the native seam's fake.

## Step 5 — Emit the parity checklist

Write `specs/<NNN>-zuraffa-migration/parity-checklist.md` from the
`parity-checklist` template, prefilled from the contract.

PASS: scaffold analyzes clean (`dart analyze`), spec + test-list exist,
test-list covers (a)–(e), checklist written. FAIL: name the missing piece.
