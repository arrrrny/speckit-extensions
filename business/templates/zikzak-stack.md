# ZikZak — Stack Reference (seeded by the business extension)

This is the living description of ZikZak's current technical and product reality,
used by `speckit.business.init` to seed the business source of truth and by
`speckit.business.daily` / `speckit.business.review` to ground every alignment
judgement in what is *actually* buildable today. Edit it to keep it honest.

## What ZikZak is

A **price comparison app**. The user pastes / shares a product link (or scans a
barcode), and ZikZak finds the best offer across merchants and routes them there.

Three core user actions the business is built around (these are the KPI levers):

- **Barcode scan** — open the camera, scan, get the best price. (Top-of-funnel,
  highest volume action.)
- **Link share** — share a product URL into ZikZak, it returns the best offer.
  (The viral / sharing loop.)
- **Ask ZikZak** CTA — an in-app / embedded call-to-action that asks ZikZak to
  compare a thing. (The branded engagement moment.)

## Current technical strengths

The single biggest asset, and the reason revenue is close, not hypothetical:

- **Amazingly serialized configs for major websites.** The scraping / offer
  extraction for the big merchants is already captured as structured,
  serialized config — not ad-hoc code per site. This is the moat: adding a
  merchant is configuration, not engineering.
- **The whole pipeline is almost automation-ready.** Ingestion → normalization →
  price comparison → best-offer routing is wired end to end and close to running
  unattended.

> Strategic implication: the bottleneck is NOT "build more scrapers." It is
> **activation + monetization** of a pipeline that already mostly works. Any
> daily task that drifts into "rewrite the pipeline / try a new framework" is a
> red flag the daily command is tuned to catch.

## Revenue streams

| Stream | Price | Notes |
|--------|-------|-------|
| Pro membership | $0.99/mo | Removes ads; unlocks **Auto ZikZak**. |
| Max membership | $5.99/mo | Adds the **Price-Match** feature on top of Pro. |
| AdMob ads | variable | Shown to free users; removed by Pro. |

### Offers (what each paid tier unlocks)

**Pro — Auto ZikZak**
When a user shares a link, ZikZak does the whole price scan automatically and
routes them to the best offer URL with no extra taps. Monetization hook: removes
ads AND saves the user the manual scan step.

**Max — Price-Match**
When the user connects their e-commerce accounts, ZikZak ingests the **last 14
days of orders** and constantly checks whether any of those items have dropped in
price elsewhere. On a price drop it notifies the user and presents a complete
**price-match claim** — screenshot + PDF — ready to send to the merchant.
Monetization hook: the highest willingness-to-pay cohort; the recurring "you got
money back" moment drives retention.

## Math the review command uses

Targets the business is currently steering toward (Oct 3 horizon):

- 1,000,000 daily active users
- 10,000,000 barcode scans
- 5,000,000 link shares
- 3,000,000 "Ask ZikZak" CTAs
- $10,000 / month net profit

Rough revenue bridge for the review command to sanity-check against:

- Pro @ $0.99/mo and Max @ $5.99/mo are the recurring base.
- AdMob fills the gap for free users; its RPM is an input the user supplies.
- $10K/mo net ≈ needs a specific blend of paid subscribers + ad impressions;
  the review command will flag when the KPI mix cannot mathematically hit $10K.
