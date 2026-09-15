# Changelog

All notable changes to this extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-09-15

### Added

- `speckit.zuraffa-migrate.analyze` — census the existing package (public API,
  tests, native surface, dependencies, consumers), decide the target shape,
  write the migration contract.
- `speckit.zuraffa-migrate.plan` — scaffold the target (package or federated
  plugin, fresh or in-place), map every symbol, emit the rewrite feature's
  spec + TDD test list.
- `speckit.zuraffa-migrate.port` — drive the test-first port loop through the
  `zfa tdd` engine and build the compatibility facade.
- `speckit.zuraffa-migrate.verify` — walk the eight parity gates and write a
  verdict with remediation tasks.
- Templates: `migration-contract`, `parity-checklist`.
