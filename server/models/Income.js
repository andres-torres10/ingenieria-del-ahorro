const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  source_name: { type: String, required: true },
  amount: { type: Number, required: true, min: 0.01 },
  frequency: { type: String, enum: ['unica','semanal','quincenal','mensual'], required: true },
  category: { type: String, enum: ['Salario','Freelance','Negocio','Arriendo','Otro'], required: true },
  date: { type: String, required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Income', incomeSchema);
