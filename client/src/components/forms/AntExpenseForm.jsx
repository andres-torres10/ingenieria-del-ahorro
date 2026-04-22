import React, { useState } from 'react';
import api from '../../services/api';
import { Button } from '../ui/Button';
import { formatCOP } from '../../utils/formatCurrency';

const CATEGORIES = ['Café/bebidas', 'Domicilios', 'Streaming', 'Juegos', 'Compras impulsivas', 'Transporte extra', 'Otro'];

export default function AntExpenseForm({ onSuccess, onCancel, initial }) {
  const [form, setForm] = useState({ description: '', category: 'Café/bebidas', unit_cost: '', times_per_month: '', ...initial });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const monthly = +form.unit_cost > 0 && +form.times_per_month > 0 ? +form.unit_cost * +form.times_per_month : 0;
  const annual = monthly * 12;

  const validate = () => {
    const e = {};
    if (!form.description.trim()) e.description = 'Requerido';
    if (!form.unit_cost || +form.unit_cost <= 0) e.unit_cost = 'Debe ser mayor a 0';
    if (!form.times_per_month || +form.times_per_month <= 0) e.times_per_month = 'Debe ser mayor a 0';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const payload = { ...form, unit_cost: +form.unit_cost, times_per_month: +form.times_per_month };
      if (initial?.id) await api.put(`/ant-expenses/${initial.id}`, payload);
      else await api.post('/ant-expenses', payload);
      onSuccess();
    } catch (err) {
      setErrors({ server: err.response?.data?.error || 'Error al guardar' });
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${errors.description ? 'border-red-400' : 'border-gray-300'}`}
          placeholder="Ej: Café en la oficina" />
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
        <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
          className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Costo unitario</label>
          <input type="number" min="1" value={form.unit_cost} onChange={e => setForm(f => ({ ...f, unit_cost: e.target.value }))}
            className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${errors.unit_cost ? 'border-red-400' : 'border-gray-300'}`}
            placeholder="0" />
          {errors.unit_cost && <p className="text-red-500 text-xs mt-1">{errors.unit_cost}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Veces al mes</label>
          <input type="number" min="1" value={form.times_per_month} onChange={e => setForm(f => ({ ...f, times_per_month: e.target.value }))}
            className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${errors.times_per_month ? 'border-red-400' : 'border-gray-300'}`}
            placeholder="0" />
          {errors.times_per_month && <p className="text-red-500 text-xs mt-1">{errors.times_per_month}</p>}
        </div>
      </div>
      {monthly > 0 && (
        <div className="bg-orange-50 rounded-xl p-3 text-sm">
          <p>Total mensual: <strong className="text-accent">{formatCOP(monthly)}</strong></p>
          <p>Impacto anual: <strong className="text-red-500">{formatCOP(annual)}</strong></p>
        </div>
      )}
      {errors.server && <p className="text-red-500 text-sm">{errors.server}</p>}
      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading} className="flex-1">{initial?.id ? 'Actualizar' : 'Guardar'}</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  );
}
