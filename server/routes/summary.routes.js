const { Router } = require('express');
const { verifyJWT } = require('../middleware/auth.middleware');
const Income = require('../models/Income');
const FixedExpense = require('../models/FixedExpense');
const AntExpense = require('../models/AntExpense');
const Debt = require('../models/Debt');

const router = Router();

router.get('/:year/:month', verifyJWT, async (req, res) => {
  try {
    const userId = req.userId;
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12)
      return res.status(400).json({ error: 'Año o mes inválido' });

    const [incAgg, fixAgg, antAgg, debtAgg, topAnt] = await Promise.all([
      Income.aggregate([{ $match: { user_id: require('mongoose').Types.ObjectId.createFromHexString ? require('mongoose').Types.ObjectId.createFromHexString(userId.toString()) : new (require('mongoose').Types.ObjectId)(userId.toString()), year, month } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      FixedExpense.aggregate([{ $match: { user_id: require('mongoose').Types.ObjectId.createFromHexString ? require('mongoose').Types.ObjectId.createFromHexString(userId.toString()) : new (require('mongoose').Types.ObjectId)(userId.toString()), year, month } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      AntExpense.aggregate([{ $match: { user_id: require('mongoose').Types.ObjectId.createFromHexString ? require('mongoose').Types.ObjectId.createFromHexString(userId.toString()) : new (require('mongoose').Types.ObjectId)(userId.toString()) } }, { $group: { _id: null, total: { $sum: '$monthly_total' } } }]),
      Debt.aggregate([{ $match: { user_id: require('mongoose').Types.ObjectId.createFromHexString ? require('mongoose').Types.ObjectId.createFromHexString(userId.toString()) : new (require('mongoose').Types.ObjectId)(userId.toString()) } }, { $group: { _id: null, total: { $sum: '$monthly_payment' } } }]),
      AntExpense.findOne({ user_id: userId }).sort({ annual_impact: -1 }).lean(),
    ]);

    const total_income = incAgg[0]?.total || 0;
    const total_fixed = fixAgg[0]?.total || 0;
    const total_ant = antAgg[0]?.total || 0;
    const total_debt_payments = debtAgg[0]?.total || 0;
    const available_savings = total_income - total_fixed - total_ant - total_debt_payments;
    const savings_pct = total_income > 0 ? (available_savings / total_income) * 100 : 0;
    const health = savings_pct > 10 ? 'SALUDABLE' : savings_pct >= 0 ? 'AJUSTADO' : 'DEFICIT';

    res.json({ year, month, total_income, total_fixed, total_ant, total_debt_payments, available_savings, savings_pct, health, top_ant_expense: topAnt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
