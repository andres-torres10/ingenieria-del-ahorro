const { db } = require('../db/database');

// ─── Helpers ────────────────────────────────────────────────────────────────

function calcMonthlyPayment(P, r, n) {
  const rDecimal = r / 100;
  const factor = Math.pow(1 + rDecimal, n);
  return P * (rDecimal * factor) / (factor - 1);
}

// ─── INCOMES ─────────────────────────────────────────────────────────────────

function getIncomes(userId, year, month) {
  return db.prepare(
    'SELECT * FROM incomes WHERE user_id = ? AND year = ? AND month = ? ORDER BY id DESC'
  ).all(userId, year, month);
}

function createIncome(userId, { source_name, amount, frequency, category, date, month, year }) {
  const stmt = db.prepare(
    'INSERT INTO incomes (user_id, source_name, amount, frequency, category, date, month, year) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const result = stmt.run(userId, source_name, amount, frequency, category, date, month, year);
  return db.prepare('SELECT * FROM incomes WHERE id = ?').get(result.lastInsertRowid);
}

function updateIncome(id, userId, { source_name, amount, frequency, category, date, month, year }) {
  const existing = db.prepare('SELECT id FROM incomes WHERE id = ? AND user_id = ?').get(id, userId);
  if (!existing) return null;
  db.prepare(
    'UPDATE incomes SET source_name = ?, amount = ?, frequency = ?, category = ?, date = ?, month = ?, year = ? WHERE id = ? AND user_id = ?'
  ).run(source_name, amount, frequency, category, date, month, year, id, userId);
  return db.prepare('SELECT * FROM incomes WHERE id = ?').get(id);
}

function deleteIncome(id, userId) {
  const result = db.prepare('DELETE FROM incomes WHERE id = ? AND user_id = ?').run(id, userId);
  return result.changes > 0;
}

// ─── FIXED EXPENSES ──────────────────────────────────────────────────────────

function getFixedExpenses(userId, year, month) {
  return db.prepare(
    'SELECT * FROM fixed_expenses WHERE user_id = ? AND year = ? AND month = ? ORDER BY id DESC'
  ).all(userId, year, month);
}

function createFixedExpense(userId, { category, description, amount, due_date, month, year }) {
  const stmt = db.prepare(
    'INSERT INTO fixed_expenses (user_id, category, description, amount, due_date, month, year) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  const result = stmt.run(userId, category, description, amount, due_date, month, year);
  return db.prepare('SELECT * FROM fixed_expenses WHERE id = ?').get(result.lastInsertRowid);
}

function updateFixedExpense(id, userId, data) {
  const existing = db.prepare('SELECT id FROM fixed_expenses WHERE id = ? AND user_id = ?').get(id, userId);
  if (!existing) return null;
  const { category, description, amount, due_date, month, year } = data;
  db.prepare(
    'UPDATE fixed_expenses SET category = ?, description = ?, amount = ?, due_date = ?, month = ?, year = ? WHERE id = ? AND user_id = ?'
  ).run(category, description, amount, due_date, month, year, id, userId);
  return db.prepare('SELECT * FROM fixed_expenses WHERE id = ?').get(id);
}

function deleteFixedExpense(id, userId) {
  const result = db.prepare('DELETE FROM fixed_expenses WHERE id = ? AND user_id = ?').run(id, userId);
  return result.changes > 0;
}

// ─── ANT EXPENSES ────────────────────────────────────────────────────────────

function getAntExpenses(userId) {
  return db.prepare(
    'SELECT * FROM ant_expenses WHERE user_id = ? ORDER BY id DESC'
  ).all(userId);
}

function createAntExpense(userId, { description, category, unit_cost, times_per_month }) {
  const monthly_total = unit_cost * times_per_month;
  const annual_impact = monthly_total * 12;
  const stmt = db.prepare(
    'INSERT INTO ant_expenses (user_id, description, category, unit_cost, times_per_month, monthly_total, annual_impact) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  const result = stmt.run(userId, description, category, unit_cost, times_per_month, monthly_total, annual_impact);
  return db.prepare('SELECT * FROM ant_expenses WHERE id = ?').get(result.lastInsertRowid);
}

function updateAntExpense(id, userId, data) {
  const existing = db.prepare('SELECT id FROM ant_expenses WHERE id = ? AND user_id = ?').get(id, userId);
  if (!existing) return null;
  const { description, category, unit_cost, times_per_month } = data;
  const monthly_total = unit_cost * times_per_month;
  const annual_impact = monthly_total * 12;
  db.prepare(
    'UPDATE ant_expenses SET description = ?, category = ?, unit_cost = ?, times_per_month = ?, monthly_total = ?, annual_impact = ? WHERE id = ? AND user_id = ?'
  ).run(description, category, unit_cost, times_per_month, monthly_total, annual_impact, id, userId);
  return db.prepare('SELECT * FROM ant_expenses WHERE id = ?').get(id);
}

function deleteAntExpense(id, userId) {
  const result = db.prepare('DELETE FROM ant_expenses WHERE id = ? AND user_id = ?').run(id, userId);
  return result.changes > 0;
}

// ─── DEBTS ───────────────────────────────────────────────────────────────────

function getDebts(userId) {
  return db.prepare(
    'SELECT * FROM debts WHERE user_id = ? ORDER BY id DESC'
  ).all(userId);
}

function createDebt(userId, { creditor_name, principal, monthly_rate, term_months, pending_balance }) {
  const monthly_payment = calcMonthlyPayment(principal, monthly_rate, term_months);
  const total_cost = monthly_payment * term_months;
  const total_interest = total_cost - principal;
  const stmt = db.prepare(
    'INSERT INTO debts (user_id, creditor_name, principal, monthly_rate, term_months, monthly_payment, total_interest, total_cost, pending_balance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const result = stmt.run(userId, creditor_name, principal, monthly_rate, term_months, monthly_payment, total_interest, total_cost, pending_balance);
  return db.prepare('SELECT * FROM debts WHERE id = ?').get(result.lastInsertRowid);
}

function updateDebt(id, userId, data) {
  const existing = db.prepare('SELECT id FROM debts WHERE id = ? AND user_id = ?').get(id, userId);
  if (!existing) return null;
  const { creditor_name, principal, monthly_rate, term_months, pending_balance } = data;
  const monthly_payment = calcMonthlyPayment(principal, monthly_rate, term_months);
  const total_cost = monthly_payment * term_months;
  const total_interest = total_cost - principal;
  db.prepare(
    'UPDATE debts SET creditor_name = ?, principal = ?, monthly_rate = ?, term_months = ?, monthly_payment = ?, total_interest = ?, total_cost = ?, pending_balance = ? WHERE id = ? AND user_id = ?'
  ).run(creditor_name, principal, monthly_rate, term_months, monthly_payment, total_interest, total_cost, pending_balance, id, userId);
  return db.prepare('SELECT * FROM debts WHERE id = ?').get(id);
}

function deleteDebt(id, userId) {
  const result = db.prepare('DELETE FROM debts WHERE id = ? AND user_id = ?').run(id, userId);
  return result.changes > 0;
}

// ─── Exports ─────────────────────────────────────────────────────────────────

module.exports = {
  // Incomes
  getIncomes,
  createIncome,
  updateIncome,
  deleteIncome,
  // Fixed expenses
  getFixedExpenses,
  createFixedExpense,
  updateFixedExpense,
  deleteFixedExpense,
  // Ant expenses
  getAntExpenses,
  createAntExpense,
  updateAntExpense,
  deleteAntExpense,
  // Debts
  getDebts,
  createDebt,
  updateDebt,
  deleteDebt,
};
