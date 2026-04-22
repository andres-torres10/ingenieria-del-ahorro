const { db } = require('../db/database');

function generateCSV(userId) {
  const lines = [];

  // Incomes
  lines.push('=== INGRESOS ===');
  lines.push('ID,Fuente,Categoría,Monto,Frecuencia,Fecha,Mes,Año');
  const incomes = db.prepare('SELECT * FROM incomes WHERE user_id = ? ORDER BY year DESC, month DESC').all(userId);
  for (const r of incomes) {
    lines.push(`${r.id},"${r.source_name}","${r.category}",${r.amount},"${r.frequency}","${r.date}",${r.month},${r.year}`);
  }

  lines.push('');
  lines.push('=== GASTOS FIJOS ===');
  lines.push('ID,Categoría,Descripción,Monto,Fecha Vencimiento,Mes,Año');
  const fixed = db.prepare('SELECT * FROM fixed_expenses WHERE user_id = ? ORDER BY year DESC, month DESC').all(userId);
  for (const r of fixed) {
    lines.push(`${r.id},"${r.category}","${r.description}",${r.amount},"${r.due_date}",${r.month},${r.year}`);
  }

  lines.push('');
  lines.push('=== GASTOS HORMIGA ===');
  lines.push('ID,Descripción,Categoría,Costo Unitario,Veces/Mes,Total Mensual,Impacto Anual');
  const ant = db.prepare('SELECT * FROM ant_expenses WHERE user_id = ?').all(userId);
  for (const r of ant) {
    lines.push(`${r.id},"${r.description}","${r.category}",${r.unit_cost},${r.times_per_month},${r.monthly_total},${r.annual_impact}`);
  }

  lines.push('');
  lines.push('=== DEUDAS ===');
  lines.push('ID,Acreedor,Capital,Tasa Mensual %,Plazo Meses,Cuota Mensual,Interés Total,Costo Total,Saldo Pendiente');
  const debts = db.prepare('SELECT * FROM debts WHERE user_id = ?').all(userId);
  for (const r of debts) {
    lines.push(`${r.id},"${r.creditor_name}",${r.principal},${r.monthly_rate},${r.term_months},${r.monthly_payment},${r.total_interest},${r.total_cost},${r.pending_balance}`);
  }

  return lines.join('\n');
}

module.exports = { generateCSV };
