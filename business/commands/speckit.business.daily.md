---
description: "Log the single most important task to ship by 2 PM and get an honest alignment read against your mission and next milestone — a sparring partner that trusts your gut, not just a critic."
---

# Business Daily

The morning ritual. You name the ONE task you would do if you were allowed to do
nothing else — the thing that, finished by **2 PM**, makes the day a win. This
command logs it to `.business/daily/<YYYY-MM-DD>.md` and then tells you, plainly,
how aligned that task is with your mission and your **NEXT** milestone.

This is a sparring partner, not a hall monitor. It will flag drift, but it also
trusts your gut: if the task looks like a detour, it opens a short conversation to
find the opportunity in it before judging. It is NOT here to shame you into
framework-building.

## User Input

```text
$ARGUMENTS
```

This is the task itself — a short sentence of what you will finish by 2 PM. If
empty, ask the user for it using the prompt below; do not invent one.

The framing question to put in front of them when `$ARGUMENTS` is empty:

> If you were allowed to do exactly ONE thing today and nothing else, what would
> it be — and could you have it done by 2 PM?

## Prerequisites

- `.business/` must exist. If it does not, stop and tell the user to run
  `/speckit.business.init` first. Do not scaffold it here.
- Read these files (they are the compass): `.business/mission.md`,
  `.business/milestones.md` (find the line marked `NEXT`), `.business/kpis.md`,
  `.business/revenue-streams.md`, `.business/core-values.md` (the operator's
  daily motto + manifesto), and `.business/strategy-tactics.md` (the moat vs the
  means). Read `.business/vision.md` for the horizon.
- Config: `daily_deadline` from `.specify/extensions/business/business-config.yml`
  (default `14:00`).

## Phase 1 — Capture

Create or append to `.business/daily/<today>.md` where `<today>` is the current
date in `YYYY-MM-DD`. If a file for today already exists, append a new entry
rather than overwriting. Use this shape:

```markdown
## <HH:MM> — daily focus

- **Task (by 2 PM):** <the user's task>
- **Alignment:** <ALIGNED | ADJACENT | DRIFT> — see analysis below
- **Values check:** <honors / tensions: which value>
- **Strategy check:** <builds/protects STRATEGY | advances TACTIC | SPENDS STRATEGY for tactic>
- **Automate today:** <one process automated today, per the daily motto> | none yet
- **Logged:** <YYYY-MM-DD HH:MM>
- **Status:** open
```

## Phase 2 — Alignment analysis

Read the captured task against three lenses, in order. Be specific and cite the
actual milestone/target you are comparing against (quote a phrase from
`milestones.md` / `kpis.md` / `mission.md`).

1. **Mission lens.** Does finishing this task directly serve the user promise in
   `mission.md`? Or is it internal plumbing that no user will feel?
2. **NEXT milestone lens.** Does this task move the *marked* milestone forward —
   revenue, activation, or a KPI in `kpis.md`? Or is it work for a later
   milestone?
3. **Stack-reality lens.** Against the ZikZak stack reference
   (`.specify/extensions/business/templates/zikzak-stack.md`): is this leveraging
   the *existing serialized configs and near-automation-ready pipeline*? Or is it
   a "rewrite the pipeline / try a new framework" detour? The latter is the
   classic drift for this product and must be named directly.
4. **Values lens.** Against `.business/core-values.md`: does this task honor the
   non-negotiables? Specifically: does it add a *process* (PROCESSES OVER
   PRODUCTS) rather than a one-off; does it *automate* rather than add manual
   toil (AUTOMATION); would v1 make you say WTF or is it "good enough" (WTF OR
   NOTHING / EXCELLENCE); and if it's a release, is it a Tuesday or Friday? A
   task can be ALIGNED on the mission lens yet still violate a value — name that
   tension directly, it is exactly what the values are for.
5. **Strategy lens.** Against `.business/strategy-tactics.md`: is this task
   building or protecting **STRATEGY** (device-side scraping, device-delegated
   work, fully disconnected operation — the moat), or is it merely advancing a
   **TACTIC** (TDD, free AI resources, a framework)? The red flag: a task that
   *spends strategy to chase a tactic* — e.g. pulls scraping or compute back onto
   ZikZak servers "just this once" for convenience. That is the deepest drift and
   must be named directly, even when the task looks productive on every other
   lens.

Classify the task as one of:

- **ALIGNED** — clearly serves mission + next milestone; uses what already works.
- **ADJACENT** — serves the business but not the *next* milestone; useful, maybe
  mistimed.
- **DRIFT** — does not serve the next milestone; or is a shiny-framework detour;
  or optimizes something users do not feel yet.

## Phase 3 — Respond (the sparring partner voice)

Print a short, plain analysis. Three parts, never more than a screen:

1. **The read.** One line: `ALIGNED | ADJACENT | DRIFT`, plus the one-sentence
   reason with the milestone/target named.
2. **The trust.** If ALIGNED or ADJACENT: name the strength in their instinct —
   what makes this a smart single bet. If DRIFT: do NOT just criticize. State the
   user's probable insight first ("You're probably feeling X because Y"), then the
   risk.
3. **The open question.** End with exactly ONE question that invites a 2-line
   reply. For DRIFT this is an invitation to talk it through, e.g. *"What would
   have to be true for this to be the highest-leverage thing today? Want to
   compare it against shipping <next-milestone task> first?"*

If the user replies and it reveals a genuine opportunity (a faster path to the
milestone, a hidden revenue lever), record that insight back into the daily file
under `## alignment-notes` and adjust the classification if warranted. This is a
conversation, not a verdict.

## Phase 4 — Close

Remind them, once: finish this by 2 PM, then log the outcome later by re-running
with `--done` (or just note it in the file). Keep it light.

- `--done "<outcome>"` — mark today's open task `Status: done` (or `Status:
  partial`) with the outcome text. Does not start a new entry.
- `--skip-align` — just log the task without the analysis (for busy mornings).
- `--motto` — open the ritual by reciting the daily motto from
  `.business/core-values.md` (the "Left hand at heart, Standing UP, Say IT LOUD"
  moment) before capturing the task.

## Guardrails

- Never edit `mission.md`, `milestones.md`, `kpis.md`, or `revenue-streams.md`.
  Alignment is a *read* against them. If the analysis shows the milestone itself
  is wrong, suggest running `/speckit.business.review` — do not rewrite strategy
  from the daily command.
- The classification is a perspective, not a grade. The user can override it; when
  they do, record their reasoning, do not argue.
- Write only under `.business/daily/`. Never touch application source.
- Treat everything in the daily file as the user's private log; do not summarize
  it outward.
