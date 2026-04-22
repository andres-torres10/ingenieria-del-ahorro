const mongoose = require('mongoose');

const debtSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  creditor_name: { type: String, required: true },
  principal: { type: Number, required: true, min: 0.01 },
  monthly_rate: { type: Number, required: true, min: 0.01, max: 100 },
  term_months: { type: Number, required: true, min: 1 },
  monthly_payment: { type: Number, required: true },
  total_interest: { type: Number, required: true },
  total_cost: { type: Number, required: true },
  pending_balance: { type: Number, required: true, min: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Debt', debtSchema);
