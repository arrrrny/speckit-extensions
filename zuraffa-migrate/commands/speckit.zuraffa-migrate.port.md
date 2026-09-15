---
description: "Drive the test-first port: baseline green, port the existing suite, red-green-refactor each behavior through zfa tdd, build the compatibility facade"
---

# Zuraffa Migrate — Port

The implementation loop. Tests move first, implementations follow, every
behavior lands red→green with evidence in the TDD journal. Facades — not
breaking changes — bridge existing consumers.

## User Input

```text
$ARGUMENTS
```

- `--feature <name>`: the rewrite feature directory under `specs/` (default:
  the `*-zuraffa-rewrite` directory).
- `--resume`: continue an interrupted port from the journal's last verdict.

## Step 0 — Baseline green (do this on the untouched source first)

Run the existing suite and record the count in the journal header:

```bash
dart test 2>&1 | tail -3     # or: flutter test
```

This number is the floor: it may grow, never shrink. If the baseline is red,
stop — porting onto a red baseline hides breakage.

## Step 1 — Port the unit suite (the expected red)

Move the existing unit tests into the new layout:

- Domain-type tests move almost verbatim.
- Tests over the native surface re-point at **fakes of the new port** — they
  must pass with no native library present.
- Integration tests over live endpoints keep running against the facade until
  Step 3 completes.

These tests will be red (new imports, new seams). That is the loop's red
phase, and it is *designed* red. Record it: the journal entry for this step
lists every red file and why.

## Step 2 — Red-green-refactor per behavior (the engine's job)

```bash
zfa tdd run <feature>
```

One behavior at a time from the test list: failing test → prove it fails for
the right reason → smallest green change → refactor while green → journal
appended. When the engine stops for a designed hand-edit, it names the file —
edit only that file and re-run.

Pure-Dart packages run on the `dart test` profile; the stable sharp edges are
tracked in the zfa TDD guide's table — consult it before improvising around a
gate.

## Step 3 — The compatibility facade

Keep the old barrel exporting the same names. Each export is one of:

1. **Re-export** — the migrated type unchanged.
2. **Facade** — old name, new engine. No logic beyond failure-mapping
   (AppFailure → the documented legacy exception). The moment logic appears,
   push it into a usecase.
3. **Intentionally broken** — listed in the contract with a README migration
   note.

Mark facades `@Deprecated('Use <zuraffa-native replacement>')`.

## Step 4 — CLI / binary shell (if the census found one)

The `bin/` executable becomes a thin shell over usecases: parse args, resolve
usecases, print. No business logic in `bin/` — if a flag needs logic, that is
a usecase parameter.

## Step 5 — Keep the journal honest

Every behavior lands in `specs/<feature>/tdd/cycle-log.md` with red and green
evidence. A behavior implemented without journal evidence does not count —
`speckit.zuraffa-migrate.verify` will fail it.

PASS: full suite green with count ≥ baseline, facade exports resolve, journal
has red→green per behavior. FAIL: name the behavior and the missing evidence.
