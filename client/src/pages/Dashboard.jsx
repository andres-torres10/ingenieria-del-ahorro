import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCOP } from '../utils/formatCurrency';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import { ToastContext } from '../components/layout/AppLayout';
import IncomeForm from '../components/forms/IncomeForm';
import FixedExpenseForm from '../components/forms/FixedExpenseForm';
import AntExpenseForm from '../components/forms/AntExpenseForm';

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function SemaphoreIndicator({ health }) {
  const config = {
    SALUDABLE: { color: 'bg-green-500', label: 'Saludable', emoji: '🟢' },
    AJUSTADO: { color: 'bg-yellow-400', label: 'Ajustado', emoji: '🟡' },
    DEFICIT: { color: 'bg-red-500', label: 'Déficit', emoji: '🔴' },
  };
  const c = config[health] || config.AJUSTADO;
  return (
    <div className="flex items-center gap-3">
      <div className={`w-5 h-5 rounded-full ${c.color} shadow-md`} />
      <span className="font-semibold text-gray-700">{c.emoji} Semáforo: {c.label}</span>
    </div>
  );
}

function getTips(summary) {
  const tips = [];
  if (!summary) return tips;
  const { total_income, total_ant, savings_pct, total_fixed, total_debt_payments, top_ant_expense } = summary;
  if (total_income > 0 && total_ant / total_income > 0.10) {
    tips.push({ icon: '🐜', text: `Tus gastos hormiga representan el ${((total_ant / total_income) * 100).toFixed(1)}% de tus ingresos. ¡Revísalos!` });
  }
  if (savings_pct < 10) {
    tips.push({ icon: '💡', text: `Tu tasa de ahorro es ${savings_pct.toFixed(1)}%. Intenta llegar al 10% reduciendo gastos no esenciales.` });
  }
  if (total_income > 0 && total_debt_payments / total_income > 0.30) {
    tips.push({ icon: '⚠️', text: `Tus deudas representan el ${((total_debt_payments / total_income) * 100).toFixed(1)}% de tus ingresos. Considera un plan de pago acelerado.` });
  }
  if (tips.length < 3) tips.push({ icon: '🎯', text: 'Registra todos tus gastos para obtener un análisis más preciso de tu salud financiera.' });
  if (tips.length < 3 && top_ant_expense) {
    tips.push({ icon: '✂️', text: `Si eliminas "${top_ant_expense.description}", ahorrarías ${formatCOP(top_ant_expense.annual_impact)} al año.` });
  }
  if (tips.length < 3) tips.push({ icon: '📚', text: 'Visita la sección Aprende para mejorar tus conocimientos financieros.' });
  return tips.slice(0, 3);
}

export default function Dashboard() {
  const { user } = useAuth();
  const addToast = useContext(ToastContext);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'income' | 'fixed' | 'ant'

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/summary/${year}/${month}`);
      setSummary(data);
    } catch { /* empty */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSummary(); }, [year, month]);

  const savingsGoalPct = user?.savingsGoalPct || 10;
  const savingsProgress = summary ? Math.min(100, Math.max(0, (summary.savings_pct / savingsGoalPct) * 100)) : 0;

  const summaryCards = summary ? [
    { label: 'Ingresos', value: summary.total_income, color: 'text-green-600', bg: 'bg-green-50', icon: '📥' },
    { label: 'Gastos Fijos', value: summary.total_fixed, color: 'text-blue-600', bg: 'bg-blue-50', icon: '📤' },
    { label: 'Gastos Hormiga', value: summary.total_ant, color: 'text-orange-500', bg: 'bg-orange-50', icon: '🐜' },
    { label: 'Cuotas Deudas', value: summary.total_debt_payments, color: 'text-red-500', bg: 'bg-red-50', icon: '💳' },
    { label: 'Ahorro Disponible', value: summary.available_savings, color: summary.available_savings >= 0 ? 'text-green-700' : 'text-red-600', bg: 'bg-gray-50', icon: '💰' },
  ] : [];

  return (
    <div className="p-5 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">¡Hola, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-gray-500 text-sm">Resumen financiero de {MONTHS[month - 1]} {year}</p>
        </div>
        <div className="flex gap-2">
          <select value={month} onChange={e => setMonth(+e.target.value)} className="border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(+e.target.value)} className="border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            {summaryCards.map(c => (
              <Card key={c.label} className={`${c.bg} text-center`}>
                <div className="text-2xl mb-1">{c.icon}</div>
                <div className={`text-lg font-bold ${c.color}`}>{formatCOP(c.value)}</div>
                <div className="text-xs text-gray-500 mt-1">{c.label}</div>
              </Card>
            ))}
          </div>

          {/* Semaphore + savings goal */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <Card>
              <h2 className="font-semibold text-gray-700 mb-3">Semáforo Financiero</h2>
              {summary && <SemaphoreIndicator health={summary.health} />}
              <p className="text-xs text-gray-400 mt-2">
                {summary?.health === 'SALUDABLE' && 'Excelente manejo financiero. ¡Sigue así!'}
                {summary?.health === 'AJUSTADO' && 'Tus finanzas están ajustadas. Busca reducir gastos.'}
                {summary?.health === 'DEFICIT' && 'Estás en déficit. Revisa tus gastos urgentemente.'}
              </p>
            </Card>
            <Card>
              <h2 className="font-semibold text-gray-700 mb-2">Meta de Ahorro ({savingsGoalPct}%)</h2>
              <ProgressBar value={savingsProgress} max={100} color={savingsProgress >= 100 ? 'bg-green-500' : savingsProgress >= 50 ? 'bg-yellow-400' : 'bg-red-400'} />
              <p className="text-xs text-gray-500 mt-2">
                {summary ? `${summary.savings_pct.toFixed(1)}% de ${savingsGoalPct}% meta` : '—'}
              </p>
            </Card>
          </div>

          {/* Tips */}
          <Card className="mb-6">
            <h2 className="font-semibold text-gray-700 mb-3">💡 Consejos personalizados</h2>
            <div className="space-y-2">
              {getTips(summary).map((t, i) => (
                <div key={i} className="flex gap-3 items-start bg-gray-50 rounded-xl p-3 text-sm">
                  <span className="text-lg">{t.icon}</span>
                  <span className="text-gray-600">{t.text}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick add */}
          <Card>
            <h2 className="font-semibold text-gray-700 mb-3">Acceso rápido</h2>
            <div className="flex flex-wrap gap-3">
              <Button variant="accent" onClick={() => setModal('income')}>+ Ingreso</Button>
              <Button variant="outline" onClick={() => setModal('fixed')}>+ Gasto Fijo</Button>
              <Button variant="outline" onClick={() => setModal('ant')}>+ Gasto Hormiga</Button>
            </div>
          </Card>
        </>
      )}

      <Modal open={modal === 'income'} onClose={() => setModal(null)} title="Nuevo Ingreso">
        <IncomeForm onSuccess={() => { setModal(null); fetchSummary(); addToast('Ingreso guardado'); }} onCancel={() => setModal(null)} />
      </Modal>
      <Modal open={modal === 'fixed'} onClose={() => setModal(null)} title="Nuevo Gasto Fijo">
        <FixedExpenseForm onSuccess={() => { setModal(null); fetchSummary(); addToast('Gasto fijo guardado'); }} onCancel={() => setModal(null)} />
      </Modal>
      <Modal open={modal === 'ant'} onClose={() => setModal(null)} title="Nuevo Gasto Hormiga">
        <AntExpenseForm onSuccess={() => { setModal(null); fetchSummary(); addToast('Gasto hormiga guardado'); }} onCancel={() => setModal(null)} />
      </Modal>
    </div>
  );
}
