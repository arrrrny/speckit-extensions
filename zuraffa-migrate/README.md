# zuraffa-migrate

A [Spec Kit](https://github.com/specify/spec-kit) extension that converts an
**existing** Dart/Flutter package into a **Zuraffa-native package** or
**federated plugin** — rebuilt test-first with the `zfa` TDD engine.

Brownfield migration as a contract, not a vibe: inventory the package, decide
the shape, map every symbol, port test-first through the `zfa tdd` red-green
engine, and pass eight parity gates before calling it done.

## Install

```bash
specify extension add zuraffa-migrate
```

## The pipeline

| Command | Phase | Output |
|---|---|---|
| `/speckit.zuraffa-migrate.analyze` | Census + shape decision | `specs/<NNN>-zuraffa-migration/migration-contract.md` |
| `/speckit.zuraffa-migrate.plan` | Scaffold + mapping + spec | scaffolded target, `specs/<NNN>-zuraffa-rewrite/spec.md` + test-list, parity checklist |
| `/speckit.zuraffa-migrate.port` | Test-first port loop | migrated code, compatibility facade, TDD journal with red→green evidence |
| `/speckit.zuraffa-migrate.verify` | Parity gates | verdict file + remediation tasks |

Two templates ship with the extension: the **migration contract** (API /
behavior / native / dependency / consumer census + mapping decisions) and the
**parity checklist** (the eight gates).

## Shape decision in one line

FFI, logic, CLI, parsing → **package** (`zfa package create`). Platform
channels and native APIs → **federated plugin**
(`zfa package create-plugin`). FFI is *not* a platform channel — the bridge is
a datasource behind a port, not a platform adapter.

## Worked example

[dart_curl](https://github.com/arrrrny/dart_curl) — pure-Dart FFI HTTP client
with curl-impersonation + CLI — was migrated with exactly this pipeline (see
the repo's `zuraffa-rewrite` PR for the journal and parity evidence).

## References

- Migration guide: https://github.com/arrrrny/zuraffa/blob/master/docs/package_migration_guide.md
- Writing Zuraffa Packages (greenfield): https://github.com/arrrrny/zuraffa/blob/master/docs/writing_zuraffa_packages.md
- ZFA TDD Guide: https://github.com/arrrrny/zuraffa/blob/master/docs/zfa-tdd-guide.md
- Reference repos: `zuraffa_session` (package), `zuraffa_auth` / `zuraffa_permissions` (federated)

## License

MIT — see [LICENSE](LICENSE).
