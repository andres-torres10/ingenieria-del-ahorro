import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from 'recharts';
import api from '../services/api';
import { formatCOP } from '../utils/formatCurrency';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';

const COLORS = ['#1A5276', '#E67E22', '#27AE60', '#E74C3C', '#8E44AD', '#2980B9', '#F39C12', '#16A085'];

const CopTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      {label && <p className="font-semibold text-gray-700 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {formatCOP(p.value)}</p>
      ))}
    </div>
  );
};

const PieCopTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold" style={{ color: p.payload.fill }}>{p.name}</p>
      <p>{formatCOP(p.value)} ({p.payload.percent ? (p.payload.percent * 100).toFixed(1) : 0}%)</p>
    </div>
  );
};

export default function Charts() {
  const [data, setData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    Promise.all([
      api.get('/charts/history?months=6'),
      api.get(`/summary/${now.getFullYear()}/${now.getMonth() + 1}`),
    ]).then(([h, s]) => { setData(h.data); setSummary(s.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const donutData = summary ? [
    { name: 'Gastos Fijos', value: summary.total_fixed },
    { name: 'Gastos Hormiga', value: summary.total_ant },
    { name: 'Deudas', value: summary.total_debt_payments },
    { name: 'Ahorro', value: Math.max(0, summary.available_savings) },
  ].filter(d => d.value > 0) : [];

  const noData = (arr) => !arr || arr.length === 0 || arr.every(d => d.value === 0 || (d.totalIncome === 0 && d.totalExpenses === 0));

  return (
    <div className="p-5 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-primary">📈 Gráficas</h1>

      {/* Bar chart: income vs expenses */}
      <Card>
        <h2 className="font-semibold text-gray-700 mb-4">Ingresos vs Gastos (últimos 6 meses)</h2>
        {noData(data?.history) ? (
          <p className="text-center text-gray-400 py-8">No hay datos suficientes para mostrar esta gráfica.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.history} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="monthLabel" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={v => `$${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 11 }} />
              <Tooltip content={<CopTooltip />} />
              <Legend />
              <Bar dataKey="totalIncome" name="Ingresos" fill="#27AE60" radius={[4, 4, 0, 0]} />
              <Bar dataKey="totalExpenses" name="Gastos" fill="#E74C3C" radius={[4, 4, 0, 0]} />
              <Bar dataKey="totalSavings" name="Ahorro" fill="#1A5276" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Line chart: savings trend */}
      <Card>
        <h2 className="font-semibold text-gray-700 mb-4">Tendencia de ahorro</h2>
        {noData(data?.history) ? (
          <p className="text-center text-gray-400 py-8">No hay datos suficientes.</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.history} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="monthLabel" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={v => `$${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 11 }} />
              <Tooltip content={<CopTooltip />} />
              <Line type="monotone" dataKey="totalSavings" name="Ahorro" stroke="#1A5276" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Pie: fixed expenses by category */}
        <Card>
          <h2 className="font-semibold text-gray-700 mb-4">Gastos fijos por categoría</h2>
          {!data?.fixedByCategory?.length ? (
            <p className="text-center text-gray-400 py-8">Sin datos este mes.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={data.fixedByCategory} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {data.fixedByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<PieCopTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Donut: income distribution */}
        <Card>
          <h2 className="font-semibold text-gray-700 mb-4">Distribución del ingreso (mes actual)</h2>
          {donutData.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Sin datos este mes.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={donutData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90}>
                  {donutData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<PieCopTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
}
