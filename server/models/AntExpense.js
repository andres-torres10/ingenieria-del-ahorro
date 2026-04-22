const mongoose = require('mongoose');

const antExpenseSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  unit_cost: { type: Number, required: true, min: 0.01 },
  times_per_month: { type: Number, required: true, min: 0.01 },
  monthly_total: { type: Number, required: true },
  annual_impact: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('AntExpense', antExpenseSchema);
