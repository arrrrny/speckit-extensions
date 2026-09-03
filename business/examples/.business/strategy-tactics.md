# Strategy vs Tactics

## STRATEGY (the moat — protect it, do not trade for a tactic)

- **Scraping on the user device.** Price data is gathered on the user's device,
  not ZikZak's servers. No central crawl infra to host/scale/defend.
- **Delegate all work to the user device.** Extraction, matching, compute happen
  client-side. ZikZak stays light.
- **Works completely disconnected from the ZikZak server.** Serverless-by-design,
  resilient, near-free to run. Disconnection is a feature.

Strategic test: does this task pull work back onto ZikZak servers / a central
pipeline we must host? If yes → erodes strategy. Flag it.

## TACTICS (the means — use the cheapest, swap freely)

- **TDD** — ships correct code fast. Interchangeable with any test-first loop.
- **Free AI resource utilization** — keeps cost at zero. Swap the moment cheaper.
- **Any framework / library / toolchain** — pure tactic. Don't fall in love.

Tactical test: is this the cheapest means to the strategy, swappable tomorrow
without touching the moat? If it is load-bearing on strategy, it is not a tactic.

## The red flag

Spending STRATEGY to chase a TACTIC — e.g. moving scraping server-side "just this
once" for convenience. That is the deepest drift; the daily command names it.
