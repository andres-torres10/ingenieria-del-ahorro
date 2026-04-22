const mongoose = require('mongoose');

const fixedExpenseSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true, min: 0.01 },
  due_date: { type: String, required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('FixedExpense', fixedExpenseSchema);
