---
description: "Walk the parity gates against the migration contract and write a verdict with remediation tasks"
---

# Zuraffa Migrate — Verify

Cold-context acceptance audit of the migration. Check every gate, write the
verdict into the parity checklist's verdict section (the canonical home), and
— on any failure — remediation tasks. If the zfa TDD flow also produces
`specs/<feature>/tdd/verification.md`, keep that file as a pointer to the
checklist's verdict, never a second verdict. This command
never modifies source; it checks, reports, and prescribes.

## User Input

```text
$ARGUMENTS
```

- `--contract <path>`: migration contract (default: newest
  `specs/*-zuraffa-migration/migration-contract.md`).
- `--feature <name>`: the rewrite feature (default: `*-zuraffa-rewrite`).

## Gate 1 — API parity

For every symbol in the contract's census: exported from the new barrel, or a
facade exists, or it is in the contract's intentionally-broken list.

```bash
grep -rn "^export " lib/<name>.dart
```

FAIL: any symbol in none of the three states → remediation: facade it or
contract it.

## Gate 2 — Behavior parity

```bash
dart test 2>&1 | tail -3     # or: flutter test
```

PASS: all green, count ≥ contract baseline, and no test file was deleted
without a contract note. FAIL: diff the test inventory against the census —
each missing behavior is a remediation task.

## Gate 3 — Layer discipline

```bash
grep -rn "dart:ffi\|DynamicLibrary\|MethodChannel" lib/src/domain/ && echo VIOLATION || echo CLEAN
```

PASS: domain clean — the native surface lives in `data/datasources` behind a
port. FAIL: name the file; the fix is an extraction, not an exception.

## Gate 4 — DI completeness

In a test, register the module into a fresh container and resolve **every**
public usecase/repository from the contract. PASS: zero resolution errors.
FAIL: the registrar is missing a registration → re-run `zfa make ... di`.

## Gate 5 — Module lifecycle

The lifecycle test passes: `bootstrap()` runs `registerDependencies` +
`onInit`; `ready()` runs `onReady`; `shutdown()` runs `onDispose` in reverse
order; no I/O happens outside lifecycle hooks.

## Gate 6 — Statics

```bash
dart analyze          # zero errors
zfa build             # only when codegen is present; guard + codegen + safety nets
```

## Gate 7 — Publish readiness

```bash
dart pub publish --dry-run     # per package; federated: every package under packages/
```

PASS: clean (modulo the intentional `publish_to` / hosted-constraint setup
from the migration guide's publish phase).

## Gate 8 — TDD journal

Read `specs/<feature>/tdd/cycle-log.md`. Every behavior on the test list has
red evidence (failed for the right reason) and green evidence (minimal change
+ clean suite). Optional but recommended: `zfa tdd verify <feature>` for the
full strength audit (test-first git evidence, mutation results, criterion
coverage).

## Verdict

Write the verdict into the parity checklist's verdict section (canonical): one
line per gate (PASS/FAIL + evidence), overall
`MIGRATION VERIFIED` only when **all eight** pass, and remediation tasks for
each failure. If `specs/<feature>/tdd/verification.md` exists, reduce it to a
pointer at the checklist's verdict. Print the same table to the console and
stop — remediation
belongs to a re-run of the port phase, not to this command.
