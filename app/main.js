// main.js — tiny router, state and event wiring for Hearth Ledger.
// All state lives in memory and is saved to localStorage after every change,
// so edits survive a reload; "Reset demo data" restores the pre-loaded figures.

import { CATEGORIES, MONTHS, BUDGETS, GOALS, BILLS, TRANSACTIONS } from './data.js';
import { renderDashboard, renderTransactions, renderBudgets, renderGoals, renderCompare, esc } from './views.js';

const STORE_KEY = 'hearth-ledger-v1';
const PALETTE = ['#b7791f', '#4a7c59', '#a34d6d', '#5b7a99', '#7a6a53', '#946b2d'];

function freshState() {
  return {
    month: '2026-11',
    months: MONTHS.map((m) => ({ ...m })),
    categories: CATEGORIES.map((c) => ({ ...c })),
    budgets: { ...BUDGETS },
    goals: GOALS.map((g) => ({ ...g })),
    bills: BILLS.map((b) => ({ ...b, paid: false })),
    transactions: TRANSACTIONS.map((t) => ({ ...t })),
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return freshState();
    const saved = JSON.parse(raw);
    if (!saved || !Array.isArray(saved.transactions) || !Array.isArray(saved.goals)) return freshState();
    return saved;
  } catch {
    return freshState();
  }
}

let state = loadState();
let nextId = 1000;

// Per-page UI state (not persisted): filters, sorting, open edit forms.
const ui = {
  filterCat: 'all',
  search: '',
  sortKey: 'date',
  sortDir: 'desc',
  editingId: null,
  confirmDeleteId: null,
  editingBudget: null,
};

function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    // Private mode or full storage: the site still works in memory.
  }
}

function newId(prefix) {
  return prefix + (nextId++);
}

// ---------- Router ----------

const ROUTES = {
  '/': renderDashboard,
  '/transactions': (s) => renderTransactions(s, ui),
  '/budgets': (s) => renderBudgets(s, ui),
  '/goals': renderGoals,
  '/compare': renderCompare,
};

function currentRoute() {
  const hash = location.hash.replace(/^#/, '') || '/';
  return ROUTES[hash] ? hash : '/';
}

function render() {
  const route = currentRoute();
  document.getElementById('view').innerHTML = ROUTES[route](state);
  document.querySelectorAll('.nav-link').forEach((a) => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + route);
    if (a.getAttribute('href') === '#' + route) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  const picker = document.getElementById('month-picker');
  if (picker) {
    picker.innerHTML = state.months.map((m) => `<option value="${m.id}">${esc(m.label)}</option>`).join('');
    picker.value = state.month;
  }
}

window.addEventListener('hashchange', () => {
  ui.editingId = null;
  ui.confirmDeleteId = null;
  ui.editingBudget = null;
  render();
});

// ---------- Actions ----------

function rerender() {
  save();
  render();
}

document.addEventListener('click', (event) => {
  const el = event.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;
  const id = el.dataset.id;

  if (action === 'pay-bill') {
    const bill = state.bills.find((b) => b.id === id);
    if (bill) bill.paid = true;
    rerender();
  } else if (action === 'reset') {
    state = freshState();
    ui.filterCat = 'all';
    ui.search = '';
    ui.sortKey = 'date';
    ui.sortDir = 'desc';
    ui.editingId = null;
    ui.confirmDeleteId = null;
    ui.editingBudget = null;
    rerender();
  } else if (action === 'edit-tx') {
    ui.editingId = id;
    ui.confirmDeleteId = null;
    render();
  } else if (action === 'cancel-edit') {
    ui.editingId = null;
    render();
  } else if (action === 'delete-tx') {
    ui.confirmDeleteId = id;
    render();
  } else if (action === 'cancel-delete') {
    ui.confirmDeleteId = null;
    render();
  } else if (action === 'confirm-delete') {
    state.transactions = state.transactions.filter((t) => t.id !== id);
    ui.confirmDeleteId = null;
    ui.editingId = null;
    rerender();
  } else if (action === 'clear-filter') {
    ui.filterCat = 'all';
    ui.search = '';
    ui.confirmDeleteId = null;
    render();
  } else if (action === 'sort') {
    const key = el.dataset.key;
    if (ui.sortKey === key) ui.sortDir = ui.sortDir === 'asc' ? 'desc' : 'asc';
    else {
      ui.sortKey = key;
      ui.sortDir = key === 'amount' ? 'desc' : 'desc';
    }
    render();
  } else if (action === 'edit-budget') {
    ui.editingBudget = id;
    render();
  } else if (action === 'cancel-budget-edit') {
    ui.editingBudget = null;
    render();
  } else if (action === 'add-funds') {
    const goal = state.goals.find((g) => g.id === id);
    const amount = Number(el.dataset.amount);
    if (goal && amount > 0) {
      goal.saved = Math.round((goal.saved + amount) * 100) / 100;
      if (goal.saved >= goal.target) goal.done = true;
      rerender();
    }
  }
});

document.addEventListener('submit', (event) => {
  const form = event.target.closest('form[data-form]');
  if (!form) return;
  event.preventDefault();
  const data = new FormData(form);
  const kind = form.dataset.form;

  if (kind === 'add-tx' || kind === 'edit-tx') {
    const amount = Math.round(Number(data.get('amount')) * 100) / 100;
    const desc = String(data.get('desc') || '').trim();
    const date = String(data.get('date') || '');
    const category = String(data.get('category') || 'other');
    const txKind = String(data.get('kind') || 'expense');
    if (!desc || !date || !(amount > 0)) return;
    if (kind === 'add-tx') {
      state.transactions.push({
        id: newId('u'),
        month: date.slice(0, 7),
        date,
        desc,
        category: txKind === 'income' ? 'income' : category,
        amount,
        kind: txKind,
      });
      // A transaction dated in another month opens that month (adding it to
      // the month list first if it is new) so the new row is visible at once.
      const txMonth = date.slice(0, 7);
      if (!state.months.some((m) => m.id === txMonth)) {
        const [y, mo] = txMonth.split('-').map(Number);
        const label = new Date(y, mo - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
        state.months.push({ id: txMonth, label, days: new Date(y, mo, 0).getDate() });
        state.months.sort((a, b) => (a.id < b.id ? -1 : 1));
      }
      state.month = txMonth;
    } else {
      const tx = state.transactions.find((t) => t.id === form.dataset.id);
      if (tx) {
        tx.date = date;
        tx.month = date.slice(0, 7);
        tx.desc = desc;
        tx.category = txKind === 'income' ? 'income' : category;
        tx.amount = amount;
        tx.kind = txKind;
      }
      ui.editingId = null;
    }
    rerender();
  } else if (kind === 'edit-budget') {
    const budget = Math.round(Number(data.get('budget')) * 100) / 100;
    if (budget >= 0) state.budgets[form.dataset.id] = budget;
    ui.editingBudget = null;
    rerender();
  } else if (kind === 'add-category') {
    const name = String(data.get('name') || '').trim();
    const budget = Math.round(Number(data.get('budget')) * 100) / 100;
    if (!name || !(budget >= 0)) return;
    const id = 'c' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + (nextId++);
    const color = PALETTE[state.categories.length % PALETTE.length];
    state.categories.push({ id, name, color });
    state.budgets[id] = budget;
    rerender();
  } else if (kind === 'add-funds') {
    const goal = state.goals.find((g) => g.id === form.dataset.id);
    const amount = Math.round(Number(data.get('amount')) * 100) / 100;
    if (goal && amount > 0) {
      goal.saved = Math.round((goal.saved + amount) * 100) / 100;
      if (goal.saved >= goal.target) goal.done = true;
      rerender();
    }
  } else if (kind === 'add-goal') {
    const name = String(data.get('name') || '').trim();
    const target = Math.round(Number(data.get('target')) * 100) / 100;
    const monthly = Math.round(Number(data.get('monthly')) * 100) / 100;
    if (!name || !(target > 0) || !(monthly >= 0)) return;
    state.goals.push({ id: newId('g'), name, saved: 0, target, monthly, note: 'A new goal — every dollar counts.' });
    rerender();
  }
});

document.addEventListener('change', (event) => {
  const el = event.target;
  if (el.id === 'month-picker') {
    state.month = el.value;
    rerender();
  } else if (el.dataset.input === 'filter-cat') {
    ui.filterCat = el.value;
    ui.confirmDeleteId = null;
    render();
  }
});

document.addEventListener('input', (event) => {
  const el = event.target;
  if (el.dataset.input === 'search') {
    ui.search = el.value;
    render();
    // Re-rendering rebuilds the input: put the caret back where it was.
    const box = document.querySelector('[data-input="search"]');
    if (box) {
      box.focus();
      box.setSelectionRange(box.value.length, box.value.length);
    }
  }
});

// Month picker options are built once from the months in state.
const picker = document.getElementById('month-picker');
if (picker) {
  picker.innerHTML = state.months.map((m) => `<option value="${m.id}">${esc(m.label)}</option>`).join('');
  picker.value = state.month;
}

render();
