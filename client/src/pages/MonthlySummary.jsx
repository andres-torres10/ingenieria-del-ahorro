import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { formatCOP } from '../utils/formatCurrency';
import { calcSavingsProjection } from '../utils/financialCalc';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const PROJECTIONS = [3, 6, 12, 24, 36];

export default function MonthlySummary() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/summary/${year}/${month}`)
      .then(r => setSummary(r.data))
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, [year, month]);

  const rows = [
    { label: 'Total Ingresos', value: summary?.total_income, color: 'text-green-600' },
    { label: '− Gastos Fijos', value: summary?.total_fixed, color: 'text-blue-600' },
    { label: '− Gastos Hormiga', value: summary?.total_ant, color: 'text-orange-500' },
    { label: '− Cuotas Deudas', value: summary?.total_debt_payments, color: 'text-red-500' },
    { label: '= Ahorro Disponible', value: summary?.available_savings, color: summary?.available_savings >= 0 ? 'text-green-700 font-bold text-lg' : 'text-red-600 font-bold text-lg', border: true },
  ];

  return (
    <div className="p-5 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-primary">📊 Resumen Mensual</h1>
        <div className="flex gap-2">
          <select value={month} onChange={e => setMonth(+e.target.value)} className="border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(+e.target.value)} className="border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : !summary ? (
        <Card className="text-center py-12 text-gray-400">No hay datos para este período.</Card>
      ) : (
        <>
          {summary.available_savings < 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 flex gap-3 items-start">
              <span className="text-2xl">🚨</span>
              <div>
                <p className="font-semibold text-red-700">Estás en déficit</p>
                <p className="text-sm text-red-600">Tus gastos superan tus ingresos en {formatCOP(Math.abs(summary.available_savings))}. Revisa tus gastos urgentemente.</p>
              </div>
            </div>
          )}

          <Card className="mb-4">
            <h2 className="font-semibold text-gray-700 mb-4">Balance de {MONTHS[month - 1]} {year}</h2>
            <div className="space-y-3">
              {rows.map(r => (
                <div key={r.label} className={`flex justify-between items-center py-2 ${r.border ? 'border-t border-gray-200 mt-2 pt-3' : ''}`}>
                  <span className="text-sm text-gray-600">{r.label}</span>
                  <span className={`text-sm ${r.color}`}>{r.value !== undefined ? formatCOP(r.value) : '—'}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm">
              <span className="text-gray-500">Tasa de ahorro</span>
              <span className={`font-semibold ${summary.savings_pct >= 10 ? 'text-green-600' : summary.savings_pct >= 0 ? 'text-yellow-500' : 'text-red-500'}`}>
                {summary.savings_pct.toFixed(1)}%
              </span>
            </div>
          </Card>

          {summary.available_savings > 0 && (
            <Card>
              <h2 className="font-semibold text-gray-700 mb-4">📈 Proyección de ahorro</h2>
              <p className="text-xs text-gray-400 mb-3">Basado en un ahorro mensual de {formatCOP(summary.available_savings)}</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-gray-500 font-medium">Período</th>
                      <th className="text-right py-2 text-gray-500 font-medium">Ahorro acumulado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PROJECTIONS.map(m => (
                      <tr key={m} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 text-gray-600">{m} meses</td>
                        <td className="py-2 text-right font-semibold text-green-600">
                          {formatCOP(calcSavingsProjection(summary.available_savings, m))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
