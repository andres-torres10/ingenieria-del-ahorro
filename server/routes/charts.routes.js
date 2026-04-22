const { Router } = require('express');
const { verifyJWT } = require('../middleware/auth.middleware');
const { db } = require('../db/database');

const router = Router();

const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// GET /api/charts/history?months=N
router.get('/history', verifyJWT, (req, res) => {
  try {
    const userId = req.userId;
    let months = parseInt(req.query.months) || 6;
    if (months < 1) months = 1;
    if (months > 12) months = 12;

    const now = new Date();
    const history = [];

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const monthLabel = `${MONTH_LABELS[month - 1]} ${year}`;

      const totalIncome = db.prepare(
        'SELECT COALESCE(SUM(amount), 0) AS total FROM incomes WHERE user_id = ? AND year = ? AND month = ?'
      ).get(userId, year, month).total;

      const totalFixed = db.prepare(
        'SELECT COALESCE(SUM(amount), 0) AS total FROM fixed_expenses WHERE user_id = ? AND year = ? AND month = ?'
      ).get(userId, year, month).total;

      const totalAnt = db.prepare(
        'SELECT COALESCE(SUM(monthly_total), 0) AS total FROM ant_expenses WHERE user_id = ?'
      ).get(userId).total;

      const totalDebt = db.prepare(
        'SELECT COALESCE(SUM(monthly_payment), 0) AS total FROM debts WHERE user_id = ?'
      ).get(userId).total;

      const totalExpenses = totalFixed + totalAnt + totalDebt;
      const totalSavings = totalIncome - totalExpenses;

      history.push({ year, month, monthLabel, totalIncome, totalExpenses, totalSavings });
    }

    // Fixed expenses by category for current month (pie chart)
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const fixedByCategory = db.prepare(
      'SELECT category, COALESCE(SUM(amount), 0) AS total FROM fixed_expenses WHERE user_id = ? AND year = ? AND month = ? GROUP BY category'
    ).all(userId, currentYear, currentMonth);

    return res.status(200).json({ history, fixedByCategory });
  } catch (err) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
