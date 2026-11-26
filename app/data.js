// data.js — the pre-loaded example data for Hearth Ledger.
// Household: the invented Marlowe family (two adults, one child), figures in
// USD. Every number below is real example data; the site computes all totals,
// charts and comparisons from these rows, so editing a row updates the site.

// Eight spending categories, each with its chart colour.
export const CATEGORIES = [
  { id: 'housing', name: 'Housing', color: '#1d4d3b' },
  { id: 'groceries', name: 'Groceries', color: '#4c8a5f' },
  { id: 'transport', name: 'Transport', color: '#7ba7bc' },
  { id: 'dining', name: 'Dining out', color: '#d98e2b' },
  { id: 'utilities', name: 'Utilities', color: '#8a6fb8' },
  { id: 'fun', name: 'Fun & kids', color: '#c65b7c' },
  { id: 'health', name: 'Health', color: '#5b8c8a' },
  { id: 'other', name: 'Other', color: '#9a8a7a' },
];

export const MONTHS = [
  { id: '2026-10', label: 'October 2026', days: 31 },
  { id: '2026-11', label: 'November 2026', days: 30 },
];

// Monthly budgets per category (November; October used the same plan).
export const BUDGETS = {
  housing: 1900,
  groceries: 800,
  transport: 420,
  dining: 250,
  utilities: 350,
  fun: 450,
  health: 250,
  other: 730,
};

// Savings goals: saved so far, target, monthly contribution.
export const GOALS = [
  { id: 'emergency', name: 'Emergency fund', saved: 8400, target: 10000, monthly: 400, note: 'Six months of essentials, for peace of mind.' },
  { id: 'holiday', name: 'Family holiday — coast trip', saved: 1150, target: 2000, monthly: 150, note: 'A week by the sea next summer.' },
  { id: 'washer', name: 'New washing machine', saved: 320, target: 650, monthly: 80, note: 'The old one rattles on every spin.' },
  { id: 'bikes', name: "Kids' bikes", saved: 420, target: 420, monthly: 0, note: 'Reached in October — two shiny bikes under the porch.', done: true },
];

// Bills due this week (December bills falling due at the end of November).
export const BILLS = [
  { id: 'bill-power', name: 'City power bill (Dec)', due: '2026-11-27', amount: 142.6 },
  { id: 'bill-internet', name: 'Internet — FiberLine (Dec)', due: '2026-11-28', amount: 89.0 },
  { id: 'bill-water', name: 'Water bill (Dec)', due: '2026-11-29', amount: 64.6 },
  { id: 'bill-swim', name: "Kids' swimming lessons — Dec term", due: '2026-11-30', amount: 190.0 },
];

// Transactions: {id, month, date, desc, category, amount, kind}
// kind is 'expense' or 'income'; income rows have category 'income'.
// November spends $4,912.40 and takes in $6,850.00.
export const TRANSACTIONS = [
  // ---- November 2026 ----
  { id: 'n01', month: '2026-11', date: '2026-11-01', desc: 'Payroll — Northwind Studio', category: 'income', amount: 5400.0, kind: 'income' },
  { id: 'n02', month: '2026-11', date: '2026-11-01', desc: 'Marlowe rent', category: 'housing', amount: 1850.0, kind: 'expense' },
  { id: 'n03', month: '2026-11', date: '2026-11-02', desc: 'Bus pass top-up', category: 'transport', amount: 95.0, kind: 'expense' },
  { id: 'n04', month: '2026-11', date: '2026-11-03', desc: 'Whole Foods Market', category: 'groceries', amount: 186.4, kind: 'expense' },
  { id: 'n05', month: '2026-11', date: '2026-11-03', desc: 'Home insurance', category: 'other', amount: 210.0, kind: 'expense' },
  { id: 'n06', month: '2026-11', date: '2026-11-04', desc: 'Family pizza night', category: 'dining', amount: 46.8, kind: 'expense' },
  { id: 'n07', month: '2026-11', date: '2026-11-05', desc: 'City power bill', category: 'utilities', amount: 142.6, kind: 'expense' },
  { id: 'n08', month: '2026-11', date: '2026-11-06', desc: 'Pharmacy', category: 'health', amount: 42.3, kind: 'expense' },
  { id: 'n09', month: '2026-11', date: '2026-11-07', desc: "Kids' swimming lessons", category: 'fun', amount: 95.0, kind: 'expense' },
  { id: 'n10', month: '2026-11', date: '2026-11-07', desc: "Trader Joe's", category: 'groceries', amount: 203.55, kind: 'expense' },
  { id: 'n11', month: '2026-11', date: '2026-11-08', desc: 'Lunch — Noodle House', category: 'dining', amount: 64.25, kind: 'expense' },
  { id: 'n12', month: '2026-11', date: '2026-11-09', desc: 'Fuel — Shell', category: 'transport', amount: 119.6, kind: 'expense' },
  { id: 'n13', month: '2026-11', date: '2026-11-09', desc: 'Internet — FiberLine', category: 'utilities', amount: 89.0, kind: 'expense' },
  { id: 'n14', month: '2026-11', date: '2026-11-10', desc: 'Brunch — Sunny Cafe', category: 'dining', amount: 80.9, kind: 'expense' },
  { id: 'n15', month: '2026-11', date: '2026-11-11', desc: 'Cinema — family night', category: 'fun', amount: 48.5, kind: 'expense' },
  { id: 'n16', month: '2026-11', date: '2026-11-12', desc: 'Whole Foods Market', category: 'groceries', amount: 158.3, kind: 'expense' },
  { id: 'n17', month: '2026-11', date: '2026-11-12', desc: "Kids' winter coats", category: 'other', amount: 265.8, kind: 'expense' },
  { id: 'n18', month: '2026-11', date: '2026-11-13', desc: 'Water bill', category: 'utilities', amount: 64.6, kind: 'expense' },
  { id: 'n19', month: '2026-11', date: '2026-11-14', desc: 'Freelance design — Marlowe', category: 'income', amount: 950.0, kind: 'income' },
  { id: 'n20', month: '2026-11', date: '2026-11-14', desc: 'Haircuts — family', category: 'other', amount: 156.6, kind: 'expense' },
  { id: 'n21', month: '2026-11', date: '2026-11-15', desc: 'Board game — Toy Barn', category: 'fun', amount: 36.75, kind: 'expense' },
  { id: 'n22', month: '2026-11', date: '2026-11-17', desc: 'Dentist check-up', category: 'health', amount: 95.0, kind: 'expense' },
  { id: 'n23', month: '2026-11', date: '2026-11-18', desc: 'Rideshare + parking', category: 'transport', amount: 76.4, kind: 'expense' },
  { id: 'n24', month: '2026-11', date: '2026-11-20', desc: 'Child benefit', category: 'income', amount: 500.0, kind: 'income' },
  { id: 'n25', month: '2026-11', date: '2026-11-20', desc: 'Pet food & vet', category: 'other', amount: 90.0, kind: 'expense' },
  { id: 'n26', month: '2026-11', date: '2026-11-21', desc: "Trader Joe's", category: 'groceries', amount: 193.75, kind: 'expense' },
  { id: 'n27', month: '2026-11', date: '2026-11-22', desc: "Kids' winter activity club", category: 'fun', amount: 151.75, kind: 'expense' },
  { id: 'n28', month: '2026-11', date: '2026-11-22', desc: 'Mobile top-up', category: 'utilities', amount: 21.8, kind: 'expense' },
  { id: 'n29', month: '2026-11', date: '2026-11-23', desc: 'Metro card — Ana', category: 'transport', amount: 95.0, kind: 'expense' },
  { id: 'n30', month: '2026-11', date: '2026-11-24', desc: 'Dinner — Trattoria Verde', category: 'dining', amount: 102.05, kind: 'expense' },
  { id: 'n31', month: '2026-11', date: '2026-11-24', desc: 'Pharmacy', category: 'health', amount: 50.7, kind: 'expense' },
  { id: 'n32', month: '2026-11', date: '2026-11-28', desc: 'Museum tickets', category: 'fun', amount: 80.0, kind: 'expense' },
  // ---- October 2026 ----
  // October spends $4,874.00 and takes in $6,700.00.
  { id: 'o01', month: '2026-10', date: '2026-10-01', desc: 'Payroll — Northwind Studio', category: 'income', amount: 5400.0, kind: 'income' },
  { id: 'o02', month: '2026-10', date: '2026-10-01', desc: 'Marlowe rent', category: 'housing', amount: 1850.0, kind: 'expense' },
  { id: 'o03', month: '2026-10', date: '2026-10-02', desc: 'Bus pass top-up', category: 'transport', amount: 95.0, kind: 'expense' },
  { id: 'o04', month: '2026-10', date: '2026-10-03', desc: 'Whole Foods Market', category: 'groceries', amount: 172.5, kind: 'expense' },
  { id: 'o05', month: '2026-10', date: '2026-10-03', desc: 'Home insurance', category: 'other', amount: 210.0, kind: 'expense' },
  { id: 'o06', month: '2026-10', date: '2026-10-05', desc: 'Family pizza night', category: 'dining', amount: 88.4, kind: 'expense' },
  { id: 'o07', month: '2026-10', date: '2026-10-06', desc: 'City power bill', category: 'utilities', amount: 128.4, kind: 'expense' },
  { id: 'o08', month: '2026-10', date: '2026-10-08', desc: "Trader Joe's", category: 'groceries', amount: 188.2, kind: 'expense' },
  { id: 'o09', month: '2026-10', date: '2026-10-09', desc: "Kids' swimming lessons", category: 'fun', amount: 95.0, kind: 'expense' },
  { id: 'o10', month: '2026-10', date: '2026-10-10', desc: 'Lunch — Noodle House', category: 'dining', amount: 96.2, kind: 'expense' },
  { id: 'o11', month: '2026-10', date: '2026-10-12', desc: 'Fuel — Shell', category: 'transport', amount: 187.4, kind: 'expense' },
  { id: 'o12', month: '2026-10', date: '2026-10-13', desc: 'Internet — FiberLine', category: 'utilities', amount: 89.0, kind: 'expense' },
  { id: 'o13', month: '2026-10', date: '2026-10-14', desc: 'Freelance design — Marlowe', category: 'income', amount: 800.0, kind: 'income' },
  { id: 'o14', month: '2026-10', date: '2026-10-15', desc: 'Cinema — family night', category: 'fun', amount: 52.0, kind: 'expense' },
  { id: 'o15', month: '2026-10', date: '2026-10-16', desc: 'Whole Foods Market', category: 'groceries', amount: 154.6, kind: 'expense' },
  { id: 'o16', month: '2026-10', date: '2026-10-17', desc: 'Dentist check-up', category: 'health', amount: 118.5, kind: 'expense' },
  { id: 'o17', month: '2026-10', date: '2026-10-18', desc: 'Brunch — Sunny Cafe', category: 'dining', amount: 74.5, kind: 'expense' },
  { id: 'o18', month: '2026-10', date: '2026-10-20', desc: 'Child benefit', category: 'income', amount: 500.0, kind: 'income' },
  { id: 'o19', month: '2026-10', date: '2026-10-20', desc: "Kids' bikes — paid off", category: 'fun', amount: 141.0, kind: 'expense' },
  { id: 'o20', month: '2026-10', date: '2026-10-21', desc: 'Pharmacy', category: 'health', amount: 95.5, kind: 'expense' },
  { id: 'o21', month: '2026-10', date: '2026-10-22', desc: 'Fuel — Shell', category: 'transport', amount: 119.6, kind: 'expense' },
  { id: 'o22', month: '2026-10', date: '2026-10-23', desc: 'Gift — Grandma’s birthday', category: 'other', amount: 145.0, kind: 'expense' },
  { id: 'o23', month: '2026-10', date: '2026-10-24', desc: 'Dinner — Trattoria Verde', category: 'dining', amount: 130.9, kind: 'expense' },
  { id: 'o24', month: '2026-10', date: '2026-10-25', desc: 'Museum tickets', category: 'fun', amount: 100.0, kind: 'expense' },
  { id: 'o25', month: '2026-10', date: '2026-10-26', desc: 'Water bill', category: 'utilities', amount: 59.6, kind: 'expense' },
  { id: 'o26', month: '2026-10', date: '2026-10-27', desc: "Trader Joe's", category: 'groceries', amount: 182.7, kind: 'expense' },
  { id: 'o27', month: '2026-10', date: '2026-10-28', desc: 'Haircuts — family', category: 'other', amount: 180.0, kind: 'expense' },
  { id: 'o28', month: '2026-10', date: '2026-10-30', desc: 'Household supplies', category: 'other', amount: 120.0, kind: 'expense' },
];
