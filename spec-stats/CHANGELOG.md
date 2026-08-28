# Changelog

## 1.0.0 - 2026-08-26

- Initial release: spec portfolio dashboard with stage, progress, health, last-updated
- Four commands: `report` (main generator), `open` (unfinished specs), `not-green` (health issues), `runs` (on-demand test execution)
- Deterministic Node.js ESM scanner + renderer (`spec-stats.mjs`) with subcommands: `scan`, `render`, `report`, `open`, `not-green`, `record-run`
- Stage detection pipeline: specified → planned → tasked → test-listed → implementing → complete
- Task progress from tasks.md (accepts [x]/[X]), checklist progress from checklists/*.md
- Health from tdd/cycle-log.md evidence (green/red/unknown — never claims green without evidence)
- Last updated from filesystem mtime + optional git log (commit date + short sha)
- Active feature marker from .specify/feature.json, branch presence detection
- Bugs (.specify/bugs/*), Chores (.specify/chores/*), TUPEC inventory line support
- Configurable output, sort, inclusions, stale threshold, runs history limit, emoji
- stats.json machine snapshot + runs.json bounded history