---
description: "Reconcile KPIs vs milestones, surface mission drift from the daily logs, and print the next milestone's decisive tasks."
---

# Business Review

A weekly (or whenever-you're-unsure) reality check. It reads the `.business/`
source of truth plus every daily log, reconciles where you actually are against
the vision, and tells you the few tasks that would most move the **NEXT**
milestone. It is the strategic counterpart to the daily command: daily asks "is
this one task aligned?", review asks "are we still on the path at all?"

## User Input

```text
$ARGUMENTS
```

Accept:

- `--since <YYYY-MM-DD>` — only consider daily logs from this date forward
  (else the last 14 days, or all if fewer exist).
- `--milestone` — focus the report on a specific milestone instead of the NEXT one.
- empty — full review against the NEXT milestone.

## Prerequisites

- `.business/` must exist; if not, stop and tell the user to run
  `/speckit.business.init`. Read `vision.md`, `mission.md`, `milestones.md`,
  `kpis.md`, `revenue-streams.md`, `core-values.md`, and `strategy-tactics.md`.
  Read every `.business/daily/*.md` log.
- Stack reference for the revenue-bridge sanity check:
  `.specify/extensions/business/templates/zikzak-stack.md`.

## Phase 1 — Milestone position

Find the `NEXT` milestone (or the one named with `--milestone`). Report:

- Days remaining until its date (vs today).
- What "done" looks like for it, restated from `kpis.md` / `milestones.md`.
- Whether any *preceding* milestone is still open — if so, that is the real
  blocker and the report says so plainly.

## Phase 2 — KPI reconciliation

For each KPI in `kpis.md`, compare target vs the latest evidence in the daily
logs (or note "no evidence logged" rather than guessing a number). Be honest
about absence of data — a KPI with no logging is itself a finding. Flag any KPI
whose current trajectory cannot mathematically reach target by its date.

## Phase 3 — Revenue bridge sanity check

Using `revenue-streams.md` prices and the profit target in `vision.md` (ZikZak:
$10K/mo net), check the mix is at least possible:

- Paid tiers ($0.99 / $5.99) need a subscriber count; AdMob needs impressions ×
  RPM. If the logged KPIs (DAU, scans, shares) imply a subscriber/impression base
  that cannot clear the profit target, say exactly that and name the missing lever
  (more paying conversion, higher RPM, or a higher-priced tier).
- Do not invent RPM or conversion — if unknown, mark it `INPUT NEEDED` and tell
  the user the one number to go find.

## Phase 4 — Mission drift scan

Read the daily logs' `Alignment:` classifications. Report:

- % ALIGNED / ADJACENT / DRIFT over the window.
- The recurring DRIFT theme, if any (the classic one for this product: pipeline
  rewrites / new frameworks instead of activation + monetization).
- Any `alignment-notes` insight the user surfaced that contradicts the current
  milestones — elevate it: "Your note on <date> suggests <X>; if true, milestone
  <n> may be mis-scoped."

## Phase 4.5 — Values adherence

Read `.business/core-values.md` and the daily logs' `Values check:` and
`Automate today:` lines. Report:

- **Automate-1/day streak** — how many of the window's days logged a process
  automated. The motto pledges one every day; a zero or gap is a finding, not a
  footnote.
- **Release cadence** — did logged releases/shipping land on Tuesday or Friday?
  Off-cadence ships are noted against "RELEASE on Tuesdays and Fridays."
- **Value tensions** — any task the logs flagged as `tensions:` a value
  (manual toil vs AUTOMATION, "good enough" vs WTF OR NOTHING, one-off vs
  PROCESSES OVER PRODUCTS). Surface the recurring one.

## Phase 4.6 — Strategy / tactics mix

Read `.business/strategy-tactics.md` and the daily logs' `Strategy check:` lines.
Report:

- Whether the window's tasks are **accumulating moat** (building/protecting
  STRATEGY: device-side scraping, device-delegated work, disconnected operation)
  or merely running TACTICS (TDD, free AI resources, frameworks).
- Any **SPENDS STRATEGY for tactic** flag — pulling work back onto ZikZak servers
  or a central pipeline under the guise of convenience. This is the deepest drift;
  call it out by date and task.
- The net trend: moat up, or slowly centralizing onto servers?

## Phase 5 — The decisive few

End with the 3-5 tasks that would most move the NEXT milestone this week,
derived from the gaps above (not from a generic checklist). For each: the gap it
closes and the KPI it lifts. This is the hand-off back to `speckit.business.daily`
— these become candidate "one task by 2 PM" entries.

## Output shape

Keep it to one screen where possible: milestone position → KPI table → revenue
bridge verdict → drift scan → values adherence → strategy/tactics mix → decisive
few. Lead with the blocker, not the progress.

## Guardrails

- Read-only against the strategy files and logs. Never edit `mission.md`,
  `milestones.md`, `kpis.md`, `revenue-streams.md`, `core-values.md`, or
  `strategy-tactics.md`. If the review shows they are wrong, say so and recommend
  `/speckit.business.init --reset` or a manual edit — do not rewrite strategy
  from here.
- Never fabricate KPI numbers. `no evidence logged` and `INPUT NEEDED` are valid,
  expected outputs.
- Write nothing except an optional short `<YYYY-MM-DD>-review.md` summary under
  `.business/` when the user asks with `--save`.
