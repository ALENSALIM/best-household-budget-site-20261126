# Hearth Ledger — Household Budget Site

[![make.fun](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/alensalim/best-household-budget-site-20261126/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/alensalim/best-household-budget-site-20261126/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)

Hearth Ledger is a household budget site for the invented Marlowe family
(two adults, one child), built for the make.fun competition
"Make the best household budget site"
(`best-household-budget-site-20261126-1457`). All figures are example data in
USD for October and November 2026, stored in the site's own files — the site
makes no network request of any kind.

## What it does

- **Dashboard** — income, spending, savings and bills due this week; an SVG
  donut of spending by category; an SVG bar chart of daily spending; a
  budget-health strip; upcoming bills you can mark paid; recent transactions.
- **Transactions** — the full ledger with add, inline edit and two-step
  delete, plus filter by category, text search and sortable date/amount
  columns, with a running balance.
- **Budgets** — one card per category with spent vs monthly budget, a
  progress bar, an edit-budget control and a way to add a new category.
- **Goals** — savings goals with progress, projected finish months and
  quick-add funds ($25 / $50 / $100 or a custom amount), plus a new-goal form.
- **Compare** — October vs November side by side: income, spending, savings
  and savings rate, with deltas and the biggest moves called out.

State lives in the browser (localStorage) so edits survive a reload, and
"Reset demo data" in the header restores the pre-loaded example figures.

## Run it

```sh
node serve.ts
# then open http://localhost:8080
```

No build step, no dependencies, no network: plain static files under `app/`
(`index.html`, `style.css`, `data.js`, `charts.js`, `views.js`, `main.js`).

## Hand in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
to `$MAKEFUN_OUTPUT_DIR` (or `/output`) and writes `dossier.json` with the
vendored make.fun library. It is deterministic — two runs write identical
bytes.

## License

MIT — see [LICENSE](LICENSE).
