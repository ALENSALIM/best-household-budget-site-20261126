// views.js — the five page renderers for Hearth Ledger.
// Each renderer takes the app state and returns an HTML string for #view.
// All figures come from the state (which starts as the data in data.js), so
// every total, chart and bar on every page always agrees with the ledger.

import { donutChart, barChart } from './charts.js';

export function esc(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function money(n) {
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function catById(state, id) {
  return state.categories.find((c) => c.id === id) || { id, name: id, color: '#9a8a7a' };
}

export function monthRows(state, month) {
  return state.transactions.filter((t) => t.month === month);
}

export function monthTotals(state, month) {
  const rows = monthRows(state, month);
  const income = rows.filter((t) => t.kind === 'income').reduce((s, t) => s + t.amount, 0);
  const spent = rows.filter((t) => t.kind === 'expense').reduce((s, t) => s + t.amount, 0);
  const saved = income - spent;
  const rate = income > 0 ? (saved / income) * 100 : 0;
  const byCat = {};
  for (const t of rows.filter((t) => t.kind === 'expense')) byCat[t.category] = (byCat[t.category] || 0) + t.amount;
  return { income, spent, saved, rate, byCat };
}

export function dailySpending(state, month, days) {
  const out = new Array(days).fill(0);
  for (const t of monthRows(state, month)) {
    if (t.kind !== 'expense') continue;
    const day = Number(t.date.slice(8, 10));
    if (day >= 1 && day <= days) out[day - 1] += t.amount;
  }
  return out;
}

function monthLabel(state, month) {
  const found = state.months.find((m) => m.id === month);
  return found ? found.label : month;
}

function prettyDate(iso) {
  const [, m, d] = iso.split('-').map(Number);
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${names[m - 1]} ${d}`;
}

function pct(spent, budget) {
  return budget > 0 ? (spent / budget) * 100 : 0;
}

function healthClass(p) {
  return p < 80 ? 'ok' : p <= 100 ? 'warn' : 'over';
}

// ---------- Dashboard ----------

export function renderDashboard(state) {
  const m = state.month;
  const t = monthTotals(state, m);
  const days = state.months.find((x) => x.id === m).days;
  const daily = dailySpending(state, m, days);
  const biggest = daily.indexOf(Math.max(...daily)) + 1;
  const segments = state.categories
    .map((c) => ({ label: c.name, value: t.byCat[c.id] || 0, color: c.color }))
    .filter((s) => s.value > 0);
  const billsDue = state.bills.filter((b) => !b.paid).reduce((s, b) => s + b.amount, 0);
  const recent = monthRows(state, m)
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 6);

  const legend = segments
    .map(
      (s) =>
        `<li><span class="dot" style="background:${s.color}"></span><span class="legend-name">${esc(s.label)}</span><span class="legend-amt">${money(s.value)} · ${((s.value / t.spent) * 100).toFixed(1)}%</span></li>`,
    )
    .join('\n          ');

  const health = state.categories
    .map((c) => {
      const spent = t.byCat[c.id] || 0;
      const budget = state.budgets[c.id] || 0;
      const p = pct(spent, budget);
      return `<div class="health-row"><span class="health-name">${esc(c.name)}</span><div class="bar-track"><div class="bar-fill ${healthClass(p)}" style="width:${Math.min(p, 100).toFixed(1)}%"></div></div><span class="health-amt">${money(spent)} / ${money(budget)}</span></div>`;
    })
    .join('\n          ');

  const bills = state.bills
    .map((b) => {
      const due = prettyDate(b.due) + ', 2026';
      return `<li class="bill ${b.paid ? 'paid' : ''}"><span class="bill-name">${esc(b.name)}</span><span class="bill-due">Due ${due}</span><span class="bill-amt">${money(b.amount)}</span>${b.paid ? '<span class="paid-badge">✓ Paid</span>' : `<button type="button" data-action="pay-bill" data-id="${b.id}">Mark paid</button>`}</li>`;
    })
    .join('\n          ');

  const recentRows = recent
    .map((r) => {
      const c = catById(state, r.category);
      const sign = r.kind === 'income' ? '+' : '−';
      return `<li><a href="#/transactions" class="recent-link"><span class="dot" style="background:${r.kind === 'income' ? '#1d4d3b' : c.color}"></span><span class="recent-desc">${esc(r.desc)}</span><span class="recent-date">${prettyDate(r.date)}</span><span class="recent-amt ${r.kind}">${sign}${money(r.amount)}</span></a></li>`;
    })
    .join('\n          ');

  return `
  <section class="page-head">
    <h1>Your month at a glance</h1>
    <p class="lede">The Marlowe Family · ${monthLabel(state, m)} — every dollar below comes from the family ledger.</p>
  </section>

  <section class="stats" aria-label="Month totals">
    <div class="stat"><span class="stat-label">Income</span><span class="stat-value">${money(t.income)}</span><span class="stat-note">Payroll, freelance &amp; benefit</span></div>
    <div class="stat"><span class="stat-label">Spent</span><span class="stat-value">${money(t.spent)}</span><span class="stat-note">Across ${state.categories.length} categories</span></div>
    <div class="stat"><span class="stat-label">Saved</span><span class="stat-value">${money(t.saved)}</span><span class="stat-note">${t.rate.toFixed(1)}% savings rate</span></div>
    <div class="stat"><span class="stat-label">Bills due this week</span><span class="stat-value" id="bills-due-stat">${money(billsDue)}</span><span class="stat-note">${state.bills.filter((b) => !b.paid).length} of ${state.bills.length} bills still open</span></div>
  </section>

  <div class="dash-grid">
    <section class="card chart-card">
      <h2>Spending by category</h2>
      ${donutChart(segments)}
      <ul class="legend">${legend}</ul>
    </section>

    <section class="card chart-card">
      <h2>Daily spending — ${monthLabel(state, m)}</h2>
      ${barChart(daily)}
      <p class="chart-note">Biggest day: ${prettyDate(m + '-' + String(biggest).padStart(2, '0'))} at ${money(daily[biggest - 1])} — rent day, as always.</p>
    </section>
  </div>

  <section class="card">
    <h2>Budget health</h2>
    <div class="health">${health}</div>
    <p class="chart-note">Green is under 80% of budget, amber 80–100%, red over budget. Dining out is the one to watch this month.</p>
  </section>

  <div class="dash-grid">
    <section class="card">
      <h2>Upcoming bills</h2>
      <ul class="bills">${bills}</ul>
    </section>

    <section class="card">
      <h2>Recent transactions</h2>
      <ul class="recent">${recentRows}</ul>
      <p class="more-link"><a href="#/transactions">See the full ledger →</a></p>
    </section>
  </div>`;
}

// ---------- Transactions ----------

export function renderTransactions(state, ui) {
  const m = state.month;
  let rows = monthRows(state, m).slice();
  if (ui.filterCat && ui.filterCat !== 'all') rows = rows.filter((t) => t.category === ui.filterCat);
  if (ui.search) {
    const q = ui.search.toLowerCase();
    rows = rows.filter((t) => t.desc.toLowerCase().includes(q));
  }
  const dir = ui.sortDir === 'asc' ? 1 : -1;
  rows.sort((a, b) => {
    if (ui.sortKey === 'amount') return (a.amount - b.amount) * dir;
    return (a.date < b.date ? -1 : a.date > b.date ? 1 : 0) * dir;
  });
  const balance = rows.reduce((s, t) => s + (t.kind === 'income' ? t.amount : -t.amount), 0);
  const catOptions = state.categories
    .map((c) => `<option value="${c.id}" ${ui.filterCat === c.id ? 'selected' : ''}>${esc(c.name)}</option>`)
    .join('\n        ');

  const body = rows
    .map((t) => {
      if (ui.editingId === t.id) {
        return `<tr class="editing"><td colspan="5">
          <form data-form="edit-tx" data-id="${t.id}" class="edit-form">
            <label>Date <input type="date" name="date" value="${t.date}" required></label>
            <label>Description <input type="text" name="desc" value="${esc(t.desc)}" required></label>
            <label>Category <select name="category">${state.categories.map((c) => `<option value="${c.id}" ${t.category === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>
            <label>Amount <input type="number" name="amount" step="0.01" min="0.01" value="${t.amount.toFixed(2)}" required></label>
            <label>Type <select name="kind"><option value="expense" ${t.kind === 'expense' ? 'selected' : ''}>Expense</option><option value="income" ${t.kind === 'income' ? 'selected' : ''}>Income</option></select></label>
            <button type="submit">Save</button>
            <button type="button" data-action="cancel-edit">Cancel</button>
          </form></td></tr>`;
      }
      const c = catById(state, t.category);
      const confirmCell =
        ui.confirmDeleteId === t.id
          ? `<button type="button" data-action="confirm-delete" data-id="${t.id}" class="danger">Sure?</button> <button type="button" data-action="cancel-delete">Keep it</button>`
          : `<button type="button" data-action="edit-tx" data-id="${t.id}">Edit</button> <button type="button" data-action="delete-tx" data-id="${t.id}" class="danger">Delete</button>`;
      return `<tr>
        <td>${prettyDate(t.date)}</td>
        <td><span class="dot" style="background:${t.kind === 'income' ? '#1d4d3b' : c.color}"></span> ${esc(t.desc)}</td>
        <td>${t.kind === 'income' ? 'Income' : esc(c.name)}</td>
        <td class="num ${t.kind}">${t.kind === 'income' ? '+' : '−'}${money(t.amount)}</td>
        <td class="row-actions">${confirmCell}</td>
      </tr>`;
    })
    .join('\n        ');

  const empty =
    rows.length === 0
      ? `<p class="empty">No transactions match — <button type="button" data-action="clear-filter">clear the filter</button> to see the whole month again.</p>`
      : '';

  return `
  <section class="page-head">
    <h1>Transactions</h1>
    <p class="lede">${monthLabel(state, m)} · ${rows.length} shown · running balance ${money(balance)}</p>
  </section>

  <section class="card">
    <h2>Add a transaction</h2>
    <form data-form="add-tx" class="add-form">
      <label>Date <input type="date" name="date" value="${m}-26" required></label>
      <label>Description <input type="text" name="desc" placeholder="e.g. Weekly shop at Whole Foods" required></label>
      <label>Category <select name="category">${state.categories.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></label>
      <label>Amount <input type="number" name="amount" step="0.01" min="0.01" placeholder="0.00" required></label>
      <label>Type <select name="kind"><option value="expense">Expense</option><option value="income">Income</option></select></label>
      <button type="submit">Add transaction</button>
    </form>
  </section>

  <section class="card">
    <div class="filter-row">
      <label>Category
        <select data-input="filter-cat">
          <option value="all" ${!ui.filterCat || ui.filterCat === 'all' ? 'selected' : ''}>All categories</option>
          <option value="income" ${ui.filterCat === 'income' ? 'selected' : ''}>Income</option>
          ${catOptions}
        </select>
      </label>
      <label>Search
        <input type="search" data-input="search" value="${esc(ui.search || '')}" placeholder="Search descriptions…">
      </label>
    </div>
    ${empty}
    <div class="table-wrap"><table class="ledger">
      <thead><tr>
        <th><button type="button" data-action="sort" data-key="date">Date ${ui.sortKey === 'date' ? (ui.sortDir === 'asc' ? '↑' : '↓') : ''}</button></th>
        <th>Description</th><th>Category</th>
        <th><button type="button" data-action="sort" data-key="amount">Amount ${ui.sortKey === 'amount' ? (ui.sortDir === 'asc' ? '↑' : '↓') : ''}</button></th>
        <th></th>
      </tr></thead>
      <tbody>${body}</tbody>
    </table></div>
    <p class="chart-note">Showing ${rows.length} of ${monthRows(state, m).length} ${monthLabel(state, m)} transactions. Edits save to this browser and survive a reload.</p>
  </section>`;
}

// ---------- Budgets ----------

export function renderBudgets(state, ui) {
  const m = state.month;
  const t = monthTotals(state, m);
  const totalBudget = state.categories.reduce((s, c) => s + (state.budgets[c.id] || 0), 0);
  const left = totalBudget - t.spent;
  const cards = state.categories
    .map((c) => {
      const spent = t.byCat[c.id] || 0;
      const budget = state.budgets[c.id] || 0;
      const p = pct(spent, budget);
      const weekly = (spent / 4).toFixed(2);
      const over = p > 100;
      const editForm =
        ui.editingBudget === c.id
          ? `<form data-form="edit-budget" data-id="${c.id}" class="edit-budget-form">
              <label>Monthly budget <input type="number" name="budget" step="1" min="0" value="${budget}" required></label>
              <button type="submit">Save</button>
              <button type="button" data-action="cancel-budget-edit">Cancel</button>
            </form>`
          : `<button type="button" data-action="edit-budget" data-id="${c.id}">Edit budget</button>`;
      return `<article class="card budget-card ${over ? 'over' : ''}">
        <h3><span class="dot" style="background:${c.color}"></span> ${esc(c.name)}</h3>
        <p class="big-num">${money(spent)} <span class="of">of ${money(budget)}</span></p>
        <div class="bar-track"><div class="bar-fill ${healthClass(p)}" style="width:${Math.min(p, 100).toFixed(1)}%"></div></div>
        <p class="budget-meta">${p.toFixed(0)}% used · ${money(Math.max(budget - spent, 0))} left · about ${money(weekly)} a week</p>
        ${over ? `<p class="tip">Over budget by ${money(spent - budget)} — try one home-cooked dinner a week instead of eating out.</p>` : ''}
        ${editForm}
      </article>`;
    })
    .join('\n      ');

  return `
  <section class="page-head">
    <h1>Budgets</h1>
    <p class="lede">${monthLabel(state, m)} · Total budgeted ${money(totalBudget)} · spent ${money(t.spent)} · ${money(left)} left</p>
  </section>
  <div class="budget-grid">${cards}</div>
  <section class="card">
    <h2>Add a category</h2>
    <form data-form="add-category" class="add-form">
      <label>Name <input type="text" name="name" placeholder="e.g. Pets" required></label>
      <label>Monthly budget <input type="number" name="budget" step="1" min="0" placeholder="100" required></label>
      <button type="submit">Add category</button>
    </form>
    <p class="chart-note">A new category gets its own budget card and shows up in the add-transaction form right away.</p>
  </section>`;
}

// ---------- Goals ----------

function finishMonth(fromMonth, monthsLeft) {
  const [y, m] = fromMonth.split('-').map(Number);
  const d = new Date(y, m - 1 + monthsLeft, 1);
  return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

export function renderGoals(state) {
  const cards = state.goals
    .map((g) => {
      const p = (g.saved / g.target) * 100;
      if (g.done || g.saved >= g.target) {
        return `<article class="card goal-card done">
          <h3>✓ ${esc(g.name)}</h3>
          <p class="big-num">${money(g.saved)} <span class="of">of ${money(g.target)}</span></p>
          <div class="bar-track"><div class="bar-fill ok" style="width:100%"></div></div>
          <p class="goal-meta">Reached in October — nicely done.</p>
          <p class="chart-note">${esc(g.note || '')}</p>
        </article>`;
      }
      const left = g.target - g.saved;
      const monthsLeft = g.monthly > 0 ? Math.ceil(left / g.monthly) : null;
      const finish = monthsLeft ? finishMonth(state.month, monthsLeft) : 'Add a monthly contribution to see a finish date';
      return `<article class="card goal-card">
        <h3>${esc(g.name)}</h3>
        <p class="big-num">${money(g.saved)} <span class="of">of ${money(g.target)}</span></p>
        <div class="bar-track"><div class="bar-fill ok" style="width:${Math.min(p, 100).toFixed(1)}%"></div></div>
        <p class="goal-meta">${p.toFixed(0)}% there · ${money(left)} to go · ${money(g.monthly)} a month → done around ${finish}</p>
        <p class="chart-note">${esc(g.note || '')}</p>
        <form data-form="add-funds" data-id="${g.id}" class="funds-form">
          <span class="funds-label">Add to this goal:</span>
          <button type="button" data-action="add-funds" data-id="${g.id}" data-amount="25">$25</button>
          <button type="button" data-action="add-funds" data-id="${g.id}" data-amount="50">$50</button>
          <button type="button" data-action="add-funds" data-id="${g.id}" data-amount="100">$100</button>
          <label class="custom-amt">$ <input type="number" name="amount" step="1" min="1" placeholder="Custom"></label>
          <button type="submit">Add</button>
        </form>
      </article>`;
    })
    .join('\n      ');

  return `
  <section class="page-head">
    <h1>Savings goals</h1>
    <p class="lede">Three goals on the go, one already reached. Every dollar added here moves the bar and the finish date.</p>
  </section>
  <div class="goal-grid">${cards}</div>
  <section class="card">
    <h2>New goal</h2>
    <form data-form="add-goal" class="add-form">
      <label>Name <input type="text" name="name" placeholder="e.g. New sofa" required></label>
      <label>Target <input type="number" name="target" step="1" min="1" placeholder="800" required></label>
      <label>Monthly contribution <input type="number" name="monthly" step="1" min="0" placeholder="100" required></label>
      <button type="submit">Add goal</button>
    </form>
  </section>`;
}

// ---------- Compare ----------

export function renderCompare(state) {
  const a = monthTotals(state, '2026-10');
  const b = monthTotals(state, '2026-11');
  const delta = (x, y) => y - x;
  const cell = (d, goodWhenDown = false, isRate = false) => {
    if (Math.abs(d) < 0.005) return '<span class="delta flat">— no change</span>';
    const up = d > 0;
    const good = goodWhenDown ? !up : up;
    const text = isRate ? `${Math.abs(d).toFixed(1)} pts` : money(Math.abs(d));
    return `<span class="delta ${good ? 'good' : 'bad'}">${up ? '▲' : '▼'} ${up ? '+' : '−'}${text}</span>`;
  };

  const rows = state.categories
    .map((c) => {
      const oct = a.byCat[c.id] || 0;
      const nov = b.byCat[c.id] || 0;
      const d = nov - oct;
      const max = Math.max(oct, nov, 1);
      return `<tr>
        <td>${esc(c.name)}</td>
        <td class="num">${money(oct)}</td>
        <td class="num">${money(nov)}</td>
        <td class="num">${cell(d, true)}</td>
        <td><span class="mini-bars"><span class="mini-bar oct" style="width:${((oct / max) * 100).toFixed(1)}%"></span><span class="mini-bar nov" style="width:${((nov / max) * 100).toFixed(1)}%"></span></span></td>
      </tr>`;
    })
    .join('\n        ');

  const changes = state.categories
    .map((c) => ({ name: c.name, d: (b.byCat[c.id] || 0) - (a.byCat[c.id] || 0) }))
    .sort((x, y) => x.d - y.d);
  const best = changes[0];
  const worst = changes[changes.length - 1];
  const callout = `Biggest improvement: ${best.name} down ${money(Math.abs(best.d))} vs October. Biggest rise: ${worst.name} up ${money(worst.d)} (heating).`;
  const why =
    best.name === 'Dining out'
      ? 'Dining out fell because the family cooked at home more often — four restaurant meals in November against six in October. Utilities rose with the colder weather: the heating ran longer most evenings.'
      : 'The two biggest moves tell the story of the month: spending shifted between categories as the weather turned colder and routines changed.';

  return `
  <section class="page-head">
    <h1>October vs November</h1>
    <p class="lede">Same family, same paydays — how did November stack up against October?</p>
  </section>

  <section class="stats compare-stats" aria-label="Month comparison">
    <div class="stat"><span class="stat-label">Income — Oct / Nov</span><span class="stat-value">${money(a.income)} / ${money(b.income)}</span><span class="stat-note">${cell(delta(a.income, b.income))}</span></div>
    <div class="stat"><span class="stat-label">Spending — Oct / Nov</span><span class="stat-value">${money(a.spent)} / ${money(b.spent)}</span><span class="stat-note">${cell(delta(a.spent, b.spent), true)}</span></div>
    <div class="stat"><span class="stat-label">Saved — Oct / Nov</span><span class="stat-value">${money(a.saved)} / ${money(b.saved)}</span><span class="stat-note">${cell(delta(a.saved, b.saved))}</span></div>
    <div class="stat"><span class="stat-label">Savings rate — Oct / Nov</span><span class="stat-value">${a.rate.toFixed(1)}% / ${b.rate.toFixed(1)}%</span><span class="stat-note">${cell(delta(a.rate, b.rate), false, true)}</span></div>
  </section>

  <section class="card">
    <h2>Spending by category</h2>
    <div class="table-wrap"><table class="ledger compare-table">
      <thead><tr><th>Category</th><th>October</th><th>November</th><th>Change</th><th>Bars (grey Oct, green Nov)</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    <p class="callout">${esc(callout)}</p>
    <p class="chart-note"><strong>Why:</strong> ${esc(why)}</p>
  </section>`;
}
