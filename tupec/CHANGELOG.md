# Changelog

## 1.1.1 - 2026-08-28

- Add `topo` subcommand to `tupec.mjs`: detects dependency cycles in `keep` features (self-references and loops) and prints a complete dependency-first topological order. Used by `tupec.spec` so the agent no longer hand-rolls fragile sort scripts.
- Fix `tupec.mjs init` crash: `fs` was imported from `node:fs/promises` but `ensureDir()` called the sync `fs.mkdirSync` (which does not exist there); now imports `mkdirSync` from `node:fs`.

## 1.1.0 - 2026-08-28

- **Specs are no longer written into the legacy codebase.** `tupec.spec` now emits all `specs/…` and `rewrite-plan.md` into a dedicated **new/rewrite project** resolved via `output_path` (config), `--output <path>` (flag), or an interactive prompt. Refuses to write into the scanned `targetPath`.
- Added `output_path` config key (empty → prompted at spec time; supports absolute/`~/` paths or `"self"`).
- `rewrite-plan.md` now lives inside `output_path` alongside the specs, so the new project is self-contained and transportable; `inventory.json`/`inventory.md` remain in the host project's `.specify/tupec/`.

## 1.0.0 - 2026-08-26

- Initial release: feature inventory scan, chop/add iteration, locked inventory, greenfield spec emission with TDD chaining.
- Node script `tupec.mjs` for deterministic inventory mutations (init, list, add, chop, lock, set-spec).
- Configurable scan depth (quick/normal/exhaustive), target stack (e.g., zuraffa), hard constraints, TDD chaining, and spec batch size.