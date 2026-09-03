# Software Business Management

Run a software business as a single source of truth in Markdown. The point is
**focus on generating revenue**, not trying yet another shiny framework.

It is built around ZikZak — a price-comparison app whose owner already has
amazingly serialized configs for major websites and a pipeline that is almost
automation-ready — but the files are yours to rewrite for any product.

## The three commands

| Command | When | What it does |
|---------|------|--------------|
| `speckit.business.init` | Once | Interviews you for vision, mission, milestones, KPIs, revenue streams, offers, core values, and strategy-vs-tactics; scaffolds `.business/`. ZikZak stack + ARRRRNY motto/manifesto + device-side moat seeded by default. |
| `speckit.business.daily` | Every morning | Log the ONE task to finish by 2 PM; get an honest alignment read vs mission + next milestone + values + strategy, with room to talk through drift. |
| `speckit.business.review` | Weekly / when unsure | Reconcile KPIs vs milestones, surface mission/values/strategy drift from the logs, print the next milestone's decisive tasks. |

## The morning ritual (the real product)

> If you were allowed to do exactly ONE thing today and nothing else, what would
> it be — and could you have it done by 2 PM?

You run:

```bash
/speckit.business.daily "Ship Auto ZikZak routing for the top 5 merchant configs"
```

It logs the task to `.business/daily/<YYYY-MM-DD>.md` and tells you, plainly,
whether that task is **ALIGNED**, **ADJACENT**, or **DRIFT** against your mission
and your NEXT milestone. It is a sparring partner: it will name drift, but it
trusts your gut and looks for the opportunity in it before judging. It will call
out the classic ZikZak trap — rewriting the pipeline or chasing a new framework
instead of activating and monetizing what already works.

## The source of truth

```text
.business/
├── vision.md          # dated, quantified destination
├── mission.md         # the daily user promise
├── milestones.md      # dated milestones; exactly one marked NEXT
├── kpis.md            # the measurable levers + targets
├── revenue-streams.md # tiers, prices, and what each paid tier unlocks
├── core-values.md     # the operator's daily motto + manifesto
├── strategy-tactics.md# STRATEGY (the moat) vs TACTICS (the means)
└── daily/             # one file per day, written by speckit.business.daily
```

The ZikZak stack reference that seeds `init` and grounds every alignment check
lives at `templates/zikzak-stack.md` — serialized website configs, the
near-automation-ready price pipeline, the Pro / Max / AdMob revenue model, and
the Auto ZikZak + Price-Match offers. The operator's non-negotiables (daily
motto: *I Am Billionaire Ahmet TOK a.k.a ARRRRNY…*, the segments / automate-1-day
cadence, Tue & Fri releases, and the **WTF OR NOTHING** manifesto) live in
`templates/zikzak-core-values.md` and seed `core-values.md`. The moat definition
— scraping on the user device, delegating all work to the device, working fully
disconnected from ZikZak servers (STRATEGY) vs TDD / free AI resources / frameworks
(TACTICS) — lives in `templates/zikzak-strategy-tactics.md` and seeds
`strategy-tactics.md`.

## Install

```bash
specify extension add business
```

Then run `/speckit.business.init` to scaffold `.business/`.

### Start today (zero interview)

If you want the ZikZak example values in place immediately, copy the drop-in
folder and start editing:

```bash
cp -r business/examples/.business ./business   # or run: /speckit.business.init --use-seed
```

That gives you `vision.md`, `mission.md`, `milestones.md`, `kpis.md`,
`revenue-streams.md`, `core-values.md`, and `strategy-tactics.md` pre-filled with
the ZikZak targets, ARRRRNY's motto + manifesto, and the device-side / disconnected
moat, ready to tweak.

## Guardrails

- `init` writes `.business/`. `daily` writes only `.business/daily/`. `review` is
  read-only and writes nothing unless you pass `--save`.
- None of the commands touch your application source. Strategy files
  (`mission.md`, `milestones.md`, `kpis.md`, `revenue-streams.md`,
  `core-values.md`, `strategy-tactics.md`) are read-only to `daily` and `review`;
  if they are wrong, the commands tell you to fix them, they do not rewrite them.
- Alignment is a perspective, not a grade. You can override any classification;
  the commands record your reasoning.
