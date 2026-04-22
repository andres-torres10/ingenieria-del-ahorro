const Income = require('../models/Income');
const FixedExpense = require('../models/FixedExpense');
const AntExpense = require('../models/AntExpense');
const Debt = require('../models/Debt');

async function generateCSV(userId) {
  const lines = [];

  lines.push('=== INGRESOS ===');
  lines.push('Fuente,Categoría,Monto,Frecuencia,Fecha,Mes,Año');
  const incomes = await Income.find({ user_id: userId }).lean();
  for (const r of incomes) {
    lines.push(`"${r.source_name}","${r.category}",${r.amount},"${r.frequency}","${r.date}",${r.month},${r.year}`);
  }

  lines.push('');
  lines.push('=== GASTOS FIJOS ===');
  lines.push('Categoría,Descripción,Monto,Fecha Vencimiento,Mes,Año');
  const fixed = await FixedExpense.find({ user_id: userId }).lean();
  for (const r of fixed) {
    lines.push(`"${r.category}","${r.description}",${r.amount},"${r.due_date}",${r.month},${r.year}`);
  }

  lines.push('');
  lines.push('=== GASTOS HORMIGA ===');
  lines.push('Descripción,Categoría,Costo Unitario,Veces/Mes,Total Mensual,Impacto Anual');
  const ant = await AntExpense.find({ user_id: userId }).lean();
  for (const r of ant) {
    lines.push(`"${r.description}","${r.category}",${r.unit_cost},${r.times_per_month},${r.monthly_total},${r.annual_impact}`);
  }

  lines.push('');
  lines.push('=== DEUDAS ===');
  lines.push('Acreedor,Capital,Tasa Mensual %,Plazo Meses,Cuota Mensual,Interés Total,Costo Total,Saldo Pendiente');
  const debts = await Debt.find({ user_id: userId }).lean();
  for (const r of debts) {
    lines.push(`"${r.creditor_name}",${r.principal},${r.monthly_rate},${r.term_months},${r.monthly_payment},${r.total_interest},${r.total_cost},${r.pending_balance}`);
  }

  return lines.join('\n');
}

module.exports = { generateCSV };
