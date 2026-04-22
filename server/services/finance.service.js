const Income = require('../models/Income');
const FixedExpense = require('../models/FixedExpense');
const AntExpense = require('../models/AntExpense');
const Debt = require('../models/Debt');

function calcMonthlyPayment(P, r, n) {
  const rDecimal = r / 100;
  const factor = Math.pow(1 + rDecimal, n);
  return P * (rDecimal * factor) / (factor - 1);
}

function toObj(doc) {
  if (!doc) return null;
  const o = doc.toObject();
  o.id = o._id;
  return o;
}

// INCOMES
async function getIncomes(userId, year, month) {
  return Income.find({ user_id: userId, year, month }).sort({ createdAt: -1 }).lean();
}
async function createIncome(userId, data) {
  const doc = await Income.create({ user_id: userId, ...data });
  return doc.toObject();
}
async function updateIncome(id, userId, data) {
  const doc = await Income.findOneAndUpdate({ _id: id, user_id: userId }, data, { new: true });
  return doc ? doc.toObject() : null;
}
async function deleteIncome(id, userId) {
  const r = await Income.deleteOne({ _id: id, user_id: userId });
  return r.deletedCount > 0;
}

// FIXED EXPENSES
async function getFixedExpenses(userId, year, month) {
  return FixedExpense.find({ user_id: userId, year, month }).sort({ createdAt: -1 }).lean();
}
async function createFixedExpense(userId, data) {
  const doc = await FixedExpense.create({ user_id: userId, ...data });
  return doc.toObject();
}
async function updateFixedExpense(id, userId, data) {
  const doc = await FixedExpense.findOneAndUpdate({ _id: id, user_id: userId }, data, { new: true });
  return doc ? doc.toObject() : null;
}
async function deleteFixedExpense(id, userId) {
  const r = await FixedExpense.deleteOne({ _id: id, user_id: userId });
  return r.deletedCount > 0;
}

// ANT EXPENSES
async function getAntExpenses(userId) {
  return AntExpense.find({ user_id: userId }).sort({ createdAt: -1 }).lean();
}
async function createAntExpense(userId, { description, category, unit_cost, times_per_month }) {
  const monthly_total = unit_cost * times_per_month;
  const annual_impact = monthly_total * 12;
  const doc = await AntExpense.create({ user_id: userId, description, category, unit_cost, times_per_month, monthly_total, annual_impact });
  return doc.toObject();
}
async function updateAntExpense(id, userId, { description, category, unit_cost, times_per_month }) {
  const monthly_total = unit_cost * times_per_month;
  const annual_impact = monthly_total * 12;
  const doc = await AntExpense.findOneAndUpdate({ _id: id, user_id: userId }, { description, category, unit_cost, times_per_month, monthly_total, annual_impact }, { new: true });
  return doc ? doc.toObject() : null;
}
async function deleteAntExpense(id, userId) {
  const r = await AntExpense.deleteOne({ _id: id, user_id: userId });
  return r.deletedCount > 0;
}

// DEBTS
async function getDebts(userId) {
  return Debt.find({ user_id: userId }).sort({ createdAt: -1 }).lean();
}
async function createDebt(userId, { creditor_name, principal, monthly_rate, term_months, pending_balance }) {
  const monthly_payment = calcMonthlyPayment(principal, monthly_rate, term_months);
  const total_cost = monthly_payment * term_months;
  const total_interest = total_cost - principal;
  const doc = await Debt.create({ user_id: userId, creditor_name, principal, monthly_rate, term_months, monthly_payment, total_interest, total_cost, pending_balance });
  return doc.toObject();
}
async function updateDebt(id, userId, { creditor_name, principal, monthly_rate, term_months, pending_balance }) {
  const monthly_payment = calcMonthlyPayment(principal, monthly_rate, term_months);
  const total_cost = monthly_payment * term_months;
  const total_interest = total_cost - principal;
  const doc = await Debt.findOneAndUpdate({ _id: id, user_id: userId }, { creditor_name, principal, monthly_rate, term_months, monthly_payment, total_interest, total_cost, pending_balance }, { new: true });
  return doc ? doc.toObject() : null;
}
async function deleteDebt(id, userId) {
  const r = await Debt.deleteOne({ _id: id, user_id: userId });
  return r.deletedCount > 0;
}

module.exports = {
  getIncomes, createIncome, updateIncome, deleteIncome,
  getFixedExpenses, createFixedExpense, updateFixedExpense, deleteFixedExpense,
  getAntExpenses, createAntExpense, updateAntExpense, deleteAntExpense,
  getDebts, createDebt, updateDebt, deleteDebt,
};
