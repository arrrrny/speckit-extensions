# Changelog

## 1.0.0 — 2026-08-31

- Initial release of the Software Business Management extension.
- `speckit.business.init`: interactive interview that scaffolds `.business/`
  (vision, mission, milestones, KPIs, revenue streams + offers), seeded with the
  ZikZak price-comparison stack.
- `speckit.business.daily`: morning ritual that logs the single most important
  task to finish by 2 PM and analyzes its alignment with the mission and NEXT
  milestone, with a sparring-partner voice that trusts the user's instinct.
- `speckit.business.review`: reconciles KPIs vs milestones, surfaces mission
  drift from the daily logs, and prints the next milestone's decisive tasks.
- Bundled `templates/zikzak-stack.md` describing ZikZak's serialized website
  configs, near-automation-ready price pipeline, and Pro/Max/AdMob revenue model.
- Added **core values**: `templates/zikzak-core-values.md` carries ARRRRNY's
  daily motto, the segments / automate-1-process-every-day / Tue & Fri release
  cadence, and the **WTF OR NOTHING** manifesto. `init` scaffolds
  `core-values.md` (Section 6); `daily` adds a values lens + a daily
  "automate today" log line + a `--motto` recital flag; `review` adds a
  values-adherence phase (automate streak, release cadence, value tensions).
- Added **strategy vs tactics**: `templates/zikzak-strategy-tactics.md` defines
  the moat (scraping on the user device, delegating all work to the device,
  working fully disconnected from ZikZak servers = STRATEGY) vs the means (TDD,
  free AI resources, frameworks = TACTICS), and the red flag of *spending
  strategy to chase a tactic*. `init` scaffolds `strategy-tactics.md` (Section 7);
  `daily` adds a strategy lens + a `Strategy check:` log line; `review` adds a
  strategy/tactics-mix phase.
