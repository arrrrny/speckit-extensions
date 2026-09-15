# Parity Checklist — <current-name> → <new-name>

**Template Version**: `zuraffa-migrate-1.0`
Feature: <specs/<NNN>-zuraffa-rewrite> · Contract: <path>

| # | Gate | PASS/FAIL | Evidence | Remediation |
|---|---|---|---|---|
| 1 | API parity — every census symbol exported, facaded, or contracted-broken | | <command output / diff link> | |
| 2 | Behavior parity — suite green, count ≥ baseline <N>, no test deleted without note | | <test tail> | |
| 3 | Layer discipline — `lib/src/domain` imports no ffi/channel/IO | | <grep output> | |
| 4 | DI completeness — every public usecase/repository resolves from fresh container | | <test name> | |
| 5 | Module lifecycle — bootstrap → ready → shutdown ordering; no I/O outside hooks | | <test name> | |
| 6 | Statics — `dart analyze` clean; `zfa build` clean (when codegen present) | | <command output> | |
| 7 | Publish — `dart pub publish --dry-run` clean (per package; federated: all) | | <command output> | |
| 8 | TDD journal — red→green evidence per test-list behavior | | <cycle-log.md> | |

## Verdict

<`MIGRATION VERIFIED` only when all eight gates pass. Otherwise: list the
failing gates and their remediation tasks.>

Signed off: <date + reviewer/agent>
