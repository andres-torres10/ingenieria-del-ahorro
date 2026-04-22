const { Router } = require('express');
const { verifyJWT } = require('../middleware/auth.middleware');
const { db } = require('../db/database');

const router = Router();

// GET /api/summary/:year/:month
router.get('/:year/:month', verifyJWT, (req, res) => {
  try {
    const userId = req.userId;
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ error: 'Año o mes inválido' });
    }

    const total_income = db.prepare(
      'SELECT COALESCE(SUM(amount), 0) AS total FROM incomes WHERE user_id = ? AND year = ? AND month = ?'
    ).get(userId, year, month).total;

    const total_fixed = db.prepare(
      'SELECT COALESCE(SUM(amount), 0) AS total FROM fixed_expenses WHERE user_id = ? AND year = ? AND month = ?'
    ).get(userId, year, month).total;

    const total_ant = db.prepare(
      'SELECT COALESCE(SUM(monthly_total), 0) AS total FROM ant_expenses WHERE user_id = ?'
    ).get(userId).total;

    const total_debt_payments = db.prepare(
      'SELECT COALESCE(SUM(monthly_payment), 0) AS total FROM debts WHERE user_id = ?'
    ).get(userId).total;

    const available_savings = total_income - total_fixed - total_ant - total_debt_payments;
    const savings_pct = total_income > 0 ? (available_savings / total_income) * 100 : 0;

    let health;
    if (savings_pct > 10) health = 'SALUDABLE';
    else if (savings_pct >= 0) health = 'AJUSTADO';
    else health = 'DEFICIT';

    const top_ant_expense = db.prepare(
      'SELECT * FROM ant_expenses WHERE user_id = ? ORDER BY annual_impact DESC LIMIT 1'
    ).get(userId) || null;

    return res.status(200).json({
      year,
      month,
      total_income,
      total_fixed,
      total_ant,
      total_debt_payments,
      available_savings,
      savings_pct,
      health,
      top_ant_expense,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
