# ZikZak AI — Strategy vs Tactics (seeded by the business extension)

The operator splits the world into **STRATEGY** (the durable, defensible
position) and **TACTICS** (the means used to get there). The `business` commands
read this to keep work honest: tactics are interchangeable and should be the
cheapest available; strategy is the moat and must not be traded away for a
tactic. A task that burns strategy to chase a tactic is the deepest kind of
drift.

## What is STRATEGY (the moat — protect it)

- **Scraping on the user device.** The price data is gathered *on the user's
  device*, not ZikZak's servers. This is a structural advantage: no central
  crawl infrastructure to host, scale, or get blocked at scale, and the user's
  own IP/context does the fetching.
- **Delegating all work to the user device.** Compute, extraction, and matching
  happen client-side. ZikZak stays light.
- **Ability to work completely disconnected from the ZikZak server.** The app
  must function with no server round-trip — serverless-by-design, resilient, and
  cheap to run. Disconnection is a feature, not a fallback.

> Strategic test for any task: *does this pull work back onto ZikZak servers, or
> onto a central pipeline we have to host?* If yes, it erodes strategy — flag it.

## What is TACTICS (the means — use the cheapest)

- **TDD** — a tactic for shipping correct code fast. Interchangeable with any
  disciplined test-first loop; adopt it, don't marry it.
- **Free AI resource utilization** — a tactic for keeping cost at zero. Use free
  tiers / local models / credits; swap them the moment a cheaper one appears.
- **Any specific framework, library, or toolchain** — pure tactic. The classic
  drift trap: falling in love with a tactic (a new framework) and forgetting the
  strategy (device-side, disconnected, delegated).

> Tactical test for any task: *is this the cheapest available means to the
> strategy, and could it be swapped tomorrow without touching the moat?* If it is
> load-bearing on the strategy, it is not a tactic — reclassify it.

## How the commands use this

- `daily` adds a **strategy lens**: classify the task as building/protecting
  STRATEGY, advancing a TACTIC, or — the red flag — **spending strategy to chase
  a tactic** (e.g. moving scraping server-side "just this once").
- `review` reports the strategy/tactics mix: are we accumulating moat, or slowly
  centralizing onto servers under the guise of convenience?
- `init` scaffolds `strategy-tactics.md` so the line is written down, not implied.
