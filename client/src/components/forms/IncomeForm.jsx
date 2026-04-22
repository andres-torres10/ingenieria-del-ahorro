import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Button } from '../ui/Button';

const CATEGORIES = ['Salario', 'Freelance', 'Negocio', 'Arriendo', 'Otro'];
const FREQUENCIES = [{ v: 'mensual', l: 'Mensual' }, { v: 'quincenal', l: 'Quincenal' }, { v: 'semanal', l: 'Semanal' }, { v: 'unica', l: 'Única vez' }];

const today = () => new Date().toISOString().split('T')[0];

export default function IncomeForm({ onSuccess, onCancel, initial }) {
  const [form, setForm] = useState({ source_name: '', amount: '', frequency: 'mensual', category: 'Salario', date: today(), ...initial });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.source_name.trim()) e.source_name = 'Requerido';
    if (!form.amount || +form.amount <= 0) e.amount = 'Debe ser mayor a 0';
    if (!form.date) e.date = 'Requerido';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      if (initial?.id) await api.put(`/incomes/${initial.id}`, { ...form, amount: +form.amount });
      else await api.post('/incomes', { ...form, amount: +form.amount });
      onSuccess();
    } catch (err) {
      setErrors({ server: err.response?.data?.error || 'Error al guardar' });
    } finally { setLoading(false); }
  };

  const f = (key, label, type = 'text', extra = {}) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${errors[key] ? 'border-red-400' : 'border-gray-300'}`}
        {...extra} />
      {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {f('source_name', 'Fuente de ingreso', 'text', { placeholder: 'Ej: Salario empresa' })}
      {f('amount', 'Monto', 'number', { min: 1, step: 1, placeholder: '0' })}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia</label>
        <select value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}
          className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          {FREQUENCIES.map(fr => <option key={fr.v} value={fr.v}>{fr.l}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
        <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
          className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      {f('date', 'Fecha', 'date')}
      {errors.server && <p className="text-red-500 text-sm">{errors.server}</p>}
      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading} className="flex-1">{initial?.id ? 'Actualizar' : 'Guardar'}</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  );
}
