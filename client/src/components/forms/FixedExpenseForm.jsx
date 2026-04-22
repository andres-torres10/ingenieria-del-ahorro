import React, { useState } from 'react';
import api from '../../services/api';
import { Button } from '../ui/Button';

const CATEGORIES = ['Vivienda', 'Servicios', 'Transporte', 'Alimentación', 'Educación', 'Salud', 'Seguros', 'Pago Deuda', 'Otro'];
const today = () => new Date().toISOString().split('T')[0];

export default function FixedExpenseForm({ onSuccess, onCancel, initial }) {
  const [form, setForm] = useState({ category: 'Vivienda', description: '', amount: '', due_date: today(), ...initial });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.description.trim()) e.description = 'Requerido';
    if (!form.amount || +form.amount <= 0) e.amount = 'Debe ser mayor a 0';
    if (!form.due_date) e.due_date = 'Requerido';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      if (initial?.id) await api.put(`/fixed-expenses/${initial.id}`, { ...form, amount: +form.amount });
      else await api.post('/fixed-expenses', { ...form, amount: +form.amount });
      onSuccess();
    } catch (err) {
      setErrors({ server: err.response?.data?.error || 'Error al guardar' });
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
        <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
          className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      {['description', 'amount', 'due_date'].map(key => (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {key === 'description' ? 'Descripción' : key === 'amount' ? 'Monto' : 'Fecha de vencimiento'}
          </label>
          <input type={key === 'amount' ? 'number' : key === 'due_date' ? 'date' : 'text'}
            value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
            min={key === 'amount' ? 1 : undefined}
            className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${errors[key] ? 'border-red-400' : 'border-gray-300'}`}
            placeholder={key === 'description' ? 'Ej: Arriendo apartamento' : key === 'amount' ? '0' : ''} />
          {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
        </div>
      ))}
      {errors.server && <p className="text-red-500 text-sm">{errors.server}</p>}
      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading} className="flex-1">{initial?.id ? 'Actualizar' : 'Guardar'}</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  );
}
