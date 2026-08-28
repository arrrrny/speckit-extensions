# Changelog

## 1.1.0 - 2026-08-28

- **Specs are no longer written into the legacy codebase.** `tupec.spec` now emits all `specs/…` and `rewrite-plan.md` into a dedicated **new/rewrite project** resolved via `output_path` (config), `--output <path>` (flag), or an interactive prompt. Refuses to write into the scanned `targetPath`.
- Added `output_path` config key (empty → prompted at spec time; supports absolute/`~/` paths or `"self"`).
- `rewrite-plan.md` now lives inside `output_path` alongside the specs, so the new project is self-contained and transportable; `inventory.json`/`inventory.md` remain in the host project's `.specify/tupec/`.

## 1.0.0 - 2026-08-26

- Initial release: feature inventory scan, chop/add iteration, locked inventory, greenfield spec emission with TDD chaining.
- Node script `tupec.mjs` for deterministic inventory mutations (init, list, add, chop, lock, set-spec).
- Configurable scan depth (quick/normal/exhaustive), target stack (e.g., zuraffa), hard constraints, TDD chaining, and spec batch size.