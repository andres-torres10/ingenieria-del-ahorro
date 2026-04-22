const { Router } = require('express');
const { verifyJWT } = require('../middleware/auth.middleware');
const Income = require('../models/Income');
const FixedExpense = require('../models/FixedExpense');
const AntExpense = require('../models/AntExpense');
const Debt = require('../models/Debt');

const router = Router();
const MONTH_LABELS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

router.get('/history', verifyJWT, async (req, res) => {
  try {
    const userId = req.userId;
    let months = Math.min(12, Math.max(1, parseInt(req.query.months) || 6));
    const now = new Date();
    const history = [];

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;

      const [incAgg, fixAgg, antAgg, debtAgg] = await Promise.all([
        Income.aggregate([{ $match: { user_id: new (require('mongoose').Types.ObjectId)(userId.toString()), year, month } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
        FixedExpense.aggregate([{ $match: { user_id: new (require('mongoose').Types.ObjectId)(userId.toString()), year, month } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
        AntExpense.aggregate([{ $match: { user_id: new (require('mongoose').Types.ObjectId)(userId.toString()) } }, { $group: { _id: null, total: { $sum: '$monthly_total' } } }]),
        Debt.aggregate([{ $match: { user_id: new (require('mongoose').Types.ObjectId)(userId.toString()) } }, { $group: { _id: null, total: { $sum: '$monthly_payment' } } }]),
      ]);

      const totalIncome = incAgg[0]?.total || 0;
      const totalExpenses = (fixAgg[0]?.total || 0) + (antAgg[0]?.total || 0) + (debtAgg[0]?.total || 0);
      history.push({ year, month, monthLabel: `${MONTH_LABELS[month-1]} ${year}`, totalIncome, totalExpenses, totalSavings: totalIncome - totalExpenses });
    }

    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const fixedByCategory = await FixedExpense.aggregate([
      { $match: { user_id: new (require('mongoose').Types.ObjectId)(userId.toString()), year: currentYear, month: currentMonth } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $project: { category: '$_id', total: 1, _id: 0 } },
    ]);

    res.json({ history, fixedByCategory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
