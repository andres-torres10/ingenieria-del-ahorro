import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { formatCOP } from '../utils/formatCurrency';
import { calcMonthlyPayment, calcTotalInterest, calcTotalCost } from '../utils/financialCalc';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import { ProgressBar } from '../components/ui/ProgressBar';
import { ToastContext } from '../components/layout/AppLayout';

export default function Debts() {
  const addToast = useContext(ToastContext);
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  // Calculator state
  const [calc, setCalc] = useState({ principal: '', monthly_rate: '', term_months: '' });
  const [calcResult, setCalcResult] = useState(null);
  const [saveForm, setSaveForm] = useState({ creditor_name: '', pending_balance: '' });
  const [saveErrors, setSaveErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try { const { data } = await api.get('/debts'); setDebts(data); }
    catch { /* empty */ } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  useEffect(() => {
    const { principal, monthly_rate, term_months } = calc;
    if (+principal > 0 && +monthly_rate > 0 && +monthly_rate <= 100 && +term_months >= 1) {
      const r = +monthly_rate / 100;
      const mp = calcMonthlyPayment(+principal, r, +term_months);
      setCalcResult({
        monthly_payment: mp,
        total_interest: calcTotalInterest(mp, +term_months, +principal),
        total_cost: calcTotalCost(mp, +term_months),
      });
    } else { setCalcResult(null); }
  }, [calc]);

  const handleSaveDebt = async () => {
    const errs = {};
    if (!saveForm.creditor_name.trim()) errs.creditor_name = 'Requerido';
    if (!saveForm.pending_balance && saveForm.pending_balance !== 0) errs.pending_balance = 'Requerido';
    if (Object.keys(errs).length) { setSaveErrors(errs); return; }
    setSaving(true);
    try {
      await api.post('/debts', {
        creditor_name: saveForm.creditor_name,
        principal: +calc.principal,
        monthly_rate: +calc.monthly_rate,
        term_months: +calc.term_months,
        pending_balance: +saveForm.pending_balance,
      });
      addToast('Deuda guardada');
      setModal(null); setCalc({ principal: '', monthly_rate: '', term_months: '' });
      setSaveForm({ creditor_name: '', pending_balance: '' }); fetch();
    } catch (err) { addToast(err.response?.data?.error || 'Error al guardar', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await api.delete(`/debts/${deleting}`); addToast('Deuda eliminada'); setDeleting(null); fetch(); }
    catch { addToast('Error al eliminar', 'error'); }
  };

  const totalMonthly = debts.reduce((s, d) => s + d.monthly_payment, 0);

  return (
    <div className="p-5 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-primary">💳 Deudas e Intereses</h1>
        <Button variant="accent" onClick={() => setModal('calc')}>+ Nueva deuda</Button>
      </div>

      {/* Calculator */}
      <Card className="mb-6">
        <h2 className="font-semibold text-gray-700 mb-4">🧮 Calculadora de préstamos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {[
            { key: 'principal', label: 'Capital ($)', placeholder: '10.000.000' },
            { key: 'monthly_rate', label: 'Tasa mensual (%)', placeholder: '2.5' },
            { key: 'term_months', label: 'Plazo (meses)', placeholder: '24' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input type="number" min="0" value={calc[key]} onChange={e => setCalc(c => ({ ...c, [key]: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={placeholder} />
            </div>
          ))}
        </div>
        {calcResult && (
          <div className="grid grid-cols-3 gap-3 bg-primary/5 rounded-xl p-4">
            <div className="text-center">
              <p className="text-xs text-gray-500">Cuota mensual</p>
              <p className="font-bold text-primary">{formatCOP(calcResult.monthly_payment)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Interés total</p>
              <p className="font-bold text-red-500">{formatCOP(calcResult.total_interest)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Costo total</p>
              <p className="font-bold text-gray-700">{formatCOP(calcResult.total_cost)}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Total */}
      {debts.length > 0 && (
        <Card className="mb-4 bg-red-50">
          <p className="text-sm text-gray-500">Total cuotas mensuales</p>
          <p className="text-2xl font-bold text-red-500">{formatCOP(totalMonthly)}</p>
        </Card>
      )}

      {loading ? <div className="flex justify-center py-10"><Spinner size="lg" /></div> : (
        debts.length === 0 ? (
          <Card className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-3">💳</div>
            <p>No tienes deudas registradas.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {debts.map(d => {
              const paidPct = d.principal > 0 ? Math.min(100, ((d.principal - d.pending_balance) / d.principal) * 100) : 0;
              return (
                <Card key={d.id}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-semibold text-gray-800">{d.creditor_name}</p>
                      <p className="text-xs text-gray-400">Capital: {formatCOP(d.principal)} · Tasa: {d.monthly_rate}% · {d.term_months} meses</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button variant="ghost" className="text-xs px-2 py-1 text-red-400" onClick={() => setDeleting(d.id)}>🗑️</Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-sm mb-3">
                    <div><p className="text-xs text-gray-400">Cuota</p><p className="font-bold text-primary">{formatCOP(d.monthly_payment)}</p></div>
                    <div><p className="text-xs text-gray-400">Saldo</p><p className="font-bold text-red-500">{formatCOP(d.pending_balance)}</p></div>
                    <div><p className="text-xs text-gray-400">Pagado</p><p className="font-bold text-green-600">{paidPct.toFixed(0)}%</p></div>
                  </div>
                  <ProgressBar value={paidPct} max={100} color="bg-green-500" />
                </Card>
              );
            })}
          </div>
        )
      )}

      {/* Save debt modal */}
      <Modal open={modal === 'calc'} onClose={() => setModal(null)} title="Registrar deuda">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { key: 'principal', label: 'Capital ($)' },
              { key: 'monthly_rate', label: 'Tasa mensual (%)' },
              { key: 'term_months', label: 'Plazo (meses)' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input type="number" min="0" value={calc[key]} onChange={e => setCalc(c => ({ ...c, [key]: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            ))}
          </div>
          {calcResult && (
            <div className="grid grid-cols-3 gap-2 bg-primary/5 rounded-xl p-3 text-center text-sm">
              <div><p className="text-xs text-gray-400">Cuota</p><p className="font-bold text-primary">{formatCOP(calcResult.monthly_payment)}</p></div>
              <div><p className="text-xs text-gray-400">Interés</p><p className="font-bold text-red-500">{formatCOP(calcResult.total_interest)}</p></div>
              <div><p className="text-xs text-gray-400">Total</p><p className="font-bold">{formatCOP(calcResult.total_cost)}</p></div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del acreedor</label>
            <input type="text" value={saveForm.creditor_name} onChange={e => setSaveForm(f => ({ ...f, creditor_name: e.target.value }))}
              className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${saveErrors.creditor_name ? 'border-red-400' : 'border-gray-300'}`}
              placeholder="Ej: Banco Bogotá" />
            {saveErrors.creditor_name && <p className="text-red-500 text-xs mt-1">{saveErrors.creditor_name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Saldo pendiente actual</label>
            <input type="number" min="0" value={saveForm.pending_balance} onChange={e => setSaveForm(f => ({ ...f, pending_balance: e.target.value }))}
              className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${saveErrors.pending_balance ? 'border-red-400' : 'border-gray-300'}`}
              placeholder="0" />
            {saveErrors.pending_balance && <p className="text-red-500 text-xs mt-1">{saveErrors.pending_balance}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSaveDebt} loading={saving} className="flex-1" disabled={!calcResult}>Guardar deuda</Button>
            <Button variant="ghost" onClick={() => setModal(null)}>Cancelar</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Confirmar eliminación">
        <p className="text-gray-600 mb-4">¿Eliminar esta deuda?</p>
        <div className="flex gap-3">
          <Button variant="danger" onClick={handleDelete} className="flex-1">Eliminar</Button>
          <Button variant="ghost" onClick={() => setDeleting(null)}>Cancelar</Button>
        </div>
      </Modal>
    </div>
  );
}
