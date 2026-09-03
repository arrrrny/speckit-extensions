---
description: "Interview you for vision, mission, milestones and KPIs, scaffold the .business/ source of truth (ZikZak stack seeded by default), and guide you while you write each section."
---

# Business Init

Turn the working memory in your head into one small, reviewable set of Markdown
files under `.business/`. This is the single source of truth the `daily` and
`review` commands read from. It is intentionally boring and text-only — the point
is *focus on generating revenue*, not on tooling.

This command is an **interview, not a form**. For each section it: (1) shows you
the ZikZak-seeded example so you are not starting from a blank page, (2) asks you
to write your own, (3) reflects back what you wrote and offers one sharpening
question before moving on. Do not rush — a vague mission makes every later
alignment check useless.

## User Input

```text
$ARGUMENTS
```

Accept:

- `--product <name>` — override the product name (else `product:` from config, else `ZikZak`).
- `--use-seed` — skip the interview and adopt the bundled ZikZak example files
  from `examples/.business/` verbatim, then let the user edit them. Fastest way
  to start today; pairs with the drop-in folder.
- `--reset` — re-run the interview even if `.business/` already exists. Existing files are renamed `<name>.bak` rather than deleted.
- empty — run the full interview.

## Prerequisites

- Read the bundled stack reference so the seed examples are real. Resolve it
  through spec-kit's template stack (first match wins):
  `.specify/templates/overrides/zikzak-stack.md`, then
  `.specify/extensions/business/templates/zikzak-stack.md`. Read it in full now.
- Config: read `.specify/extensions/business/business-config.yml` if present
  (scaffolded on install); otherwise fall back to the defaults in
  `config-template.yml` (`product: ZikZak`, `currency: USD`,
  `daily_deadline: 14:00`, `stack_reference: zikzak`).

## The files this creates

```text
.business/
├── vision.md          # the 3-5 year destination, written in the "By <date>, <X> will have <outcome>" shape
├── mission.md         # the one thing the product does for the user, every day
├── milestones.md      # dated milestones marching toward the vision, with the NEXT one marked
├── kpis.md            # the measurable levers (scans, shares, CTAs, net profit) + targets
├── revenue-streams.md # how money comes in (tiers, prices) + offers each tier unlocks
├── core-values.md     # the operator's daily motto + manifesto (the non-negotiables)
├── strategy-tactics.md# STRATEGY (the moat) vs TACTICS (the means) — what to protect
└── daily/             # one file per day: <YYYY-MM-DD>.md  (written by speckit.business.daily)
```

## Phase 0 — Seed shortcut (optional)

If `--use-seed` is passed: copy `examples/.business/` (resolved via
`.specify/extensions/business/examples/.business/`) into `.business/`, then print
the closing summary from the "Closing" section below and stop. The user edits the
files in place afterward — no interview needed. This is the fastest path to
"start using it today."

## Interview — go section by section

1. **Show the seed.** Print the ZikZak example verbatim as a starting point.
2. **Ask.** One focused question. Wait for the user's answer — do not invent it.
3. **Reflect + sharpen.** Repeat their answer back in one sentence, then ask the
   single sharpening question that would make the line *decidable* (could a
   stranger tell success from failure?). Only proceed once it is decidable.
4. **Write.** Save the file. Keep their words; do not rewrite into corporate speak.

If the user says "use the seed" / "same as example", adopt the ZikZak text as-is
for that section — that is a valid, non-generic starting point for them.

### Section 1 — Vision

Seed (ZikZak):

> By October 3, ZikZak will have 1,000,000 daily active users, 10,000,000 barcode
> scans, 5,000,000 link shares, 3,000,000 "Ask ZikZak" CTAs, and will generate
> $10,000/month in net profit.

Guide: a vision is a dated, quantified destination. If they give a feeling
("be the go-to price app"), push it to a number and a date. Write
`.business/vision.md` with the date, the user/reach numbers, and the profit
number on separate lines so `review` can parse them.

### Section 2 — Mission

Seed (ZikZak):

> ZikZak finds the best price for anything, the instant a user scans, shares, or
> asks — and routes them there automatically.

Guide: the mission is the *daily user promise*, not the company ambition. It
should fit in two sentences and survive "would I do this even if it made no
money this week?" If it mentions a framework or a metric, that is a vision line
sneaking in — pull it back to the user outcome. Write `.business/mission.md`.

### Section 3 — Milestones

Seed (ZikZak) — note the **NEXT** marker; `daily` reads this to know what
"the next milestone" means:

```markdown
# Milestones (toward the Oct 3 vision)

- [ ] **NEXT** 2026-09-07 — First 1,000 paying users (Pro+Max) live on Auto ZikZak + Price-Match
- [ ] 2026-09-14 — 10,000 DAU, AdMob RPM validated, churn < 5%
- [ ] 2026-09-21 — Price-Match claim flow shipping PDF/screenshot automatically
- [ ] 2026-09-28 — 100,000 DAU, $2K/mo net profit
- [ ] 2026-10-03 — 1,000,000 DAU, $10K/mo net profit (vision)
```

Guide: milestones are dated and countable. Exactly one is marked `NEXT` — that
is the one `daily` will test alignment against. If the user has no milestones
yet, help them derive the first 3-4 from the gap between *today* and the vision
date. Write `.business/milestones.md`.

### Section 4 — KPIs

Seed (ZikZak):

```markdown
# KPIs (targets by 2026-10-03 unless noted)

| KPI | Target | Cadence |
|-----|--------|---------|
| Daily active users | 1,000,000 | daily |
| Barcode scans | 10,000,000 | cumulative |
| Link shares | 5,000,000 | cumulative |
| Ask ZikZak CTAs | 3,000,000 | cumulative |
| Net profit | $10,000 / month | monthly |
```

Guide: KPIs are the *levers* that move the vision. Keep them to the 4-6 that
actually decide the outcome; more than that and none of them get attention.
Write `.business/kpis.md`.

### Section 5 — Revenue streams & offers

Seed (ZikZak), pulled from the stack reference:

```markdown
# Revenue streams

| Stream | Price | Unlocks |
|--------|-------|---------|
| Pro | $0.99/mo | Removes ads; Auto ZikZak (share a link → auto price-scan → route to best offer) |
| Max | $5.99/mo | Everything in Pro + Price-Match |
| AdMob ads | variable | Shown to free users only |

## Offers

### Pro — Auto ZikZak
User shares a link → ZikZak runs the full price scan and auto-routes to the best
offer URL. No manual step.

### Max — Price-Match
User connects e-commerce accounts → last 14 days of orders ingested → constant
price-drop checks → on a drop, notify + present a ready price-match claim
(screenshot + PDF) to send to the merchant.
```

Guide: a revenue stream is *how cash arrives*; an offer is *what the user gets
for paying*. Tie every paid tier to a concrete user-facing capability, not a
feature list. Write `.business/revenue-streams.md`.

### Section 6 — Core values

Seed (ZikZak), bundled in the stack reference:

```markdown
# Core Values

## Daily Motto
I Am Billionaire Ahmet TOK a.k.a ARRRRNY. I Am the owner of ZikZak AI.
I Am Calm. Things Resolve By Itself. ... I value PROCESSES over products.
I value AUTOMATION. I value EXCELLENCE. I value SPEED OF IMPLEMENTATION.
I AUTOMATE 1 process EVERY DAY. I RELEASE on Tuesdays and Fridays.
I pledge to ZikZak AI Manifesto. Left hand at heart, Standing UP, Say IT LOUD.

## Operating Cadence
- Segments; 1 lemon-water bottle each. First segment standing.
- Automate 1 process / day. Release Tue & Fri. Narrate code out loud.
- North-star: DEALS that make people say WTF!

## Manifesto
PROCESSES OVER PRODUCTS. PRINCIPLES OVER POPULARITY. WTF OR NOTHING.
We don't launch — we detonate. Every commit must vaporize assumptions.
```

Guide: core values are the operator's non-negotiables — the daily motto, the
operating cadence (segments, automate-1/day, Tue & Fri releases), and the
manifesto. The `daily` and `review` commands read this to flag a task that looks
productive but violates a value (manual toil vs AUTOMATION, "good enough" vs WTF
OR NOTHING). Adopt the ZikZak text as-is unless the user wants their own. Write
`.business/core-values.md`.

### Section 7 — Strategy vs Tactics

Seed (ZikZak), bundled in the stack reference:

```markdown
# Strategy vs Tactics

## STRATEGY (the moat — protect it)
- Scraping on the user device (not ZikZak servers).
- Delegate all work to the user device.
- Works completely disconnected from the ZikZak server.

## TACTICS (the means — cheapest, swappable)
- TDD. Free AI resource utilization. Any framework/library.

## Red flag: spending STRATEGY to chase a TACTIC
(e.g. moving scraping server-side "just this once").
```

Guide: strategy is the durable, defensible position (device-side scraping,
device-delegated work, fully disconnected operation) — the moat. Tactics are the
interchangeable means (TDD, free AI resources, any framework). The deepest drift
is *spending strategy to chase a tactic* — e.g. pulling work back onto ZikZak
servers for convenience. The `daily` command adds a strategy lens for exactly
this. Adopt the ZikZak text as-is unless the user wants their own. Write
`.business/strategy-tactics.md`.

## Closing

After all five files exist, print a one-screen summary:

- The product name and the vision date.
- The **NEXT** milestone (so they know what "alignment" means tomorrow).
- The revenue bridge in one line (tiers × prices → target profit).
- The exact commands to run next:
  - Each morning: `/speckit.business.daily "<the one task to finish by 2 PM>"`
  - Weekly / when unsure: `/speckit.business.review`

Remind them: the daily log is the real product. Everything else here is just the
compass.

## Guardrails

- Never overwrite an existing `.business/` file unless `--reset` is passed; with
  `--reset`, rename the old file to `<name>.bak` first.
- Keep the user's own wording. Do not "improve" their mission into abstraction.
- The interview is interactive: ask, wait, sharpen, write. Do not fabricate
  answers to skip a section.
- This command writes only under `.business/` and `.specify/extensions/business/`.
  It never touches application source.
