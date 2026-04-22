import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { formatCOP } from '../utils/formatCurrency';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import { ToastContext } from '../components/layout/AppLayout';
import IncomeForm from '../components/forms/IncomeForm';

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export default function Incomes() {
  const addToast = useContext(ToastContext);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try { const { data } = await api.get(`/incomes?year=${year}&month=${month}`); setItems(data); }
    catch { /* empty */ } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [year, month]);

  const handleDelete = async () => {
    try {
      await api.delete(`/incomes/${deleting}`);
      addToast('Ingreso eliminado');
      setDeleting(null); fetch();
    } catch { addToast('Error al eliminar', 'error'); }
  };

  const total = items.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="p-5 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-primary">📥 Ingresos</h1>
        <div className="flex gap-2 flex-wrap">
          <select value={month} onChange={e => setMonth(+e.target.value)} className="border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(+e.target.value)} className="border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <Button variant="accent" onClick={() => { setEditing(null); setModal('form'); }}>+ Nuevo ingreso</Button>
        </div>
      </div>

      <Card className="mb-4 bg-green-50">
        <p className="text-sm text-gray-500">Total ingresos {MONTHS[month - 1]} {year}</p>
        <p className="text-3xl font-bold text-green-600">{formatCOP(total)}</p>
      </Card>

      {loading ? <div className="flex justify-center py-10"><Spinner size="lg" /></div> : (
        items.length === 0 ? (
          <Card className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-3">📭</div>
            <p>No hay ingresos registrados para este mes.</p>
            <Button variant="accent" className="mt-4" onClick={() => { setEditing(null); setModal('form'); }}>Agregar primer ingreso</Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <Card key={item.id} className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{item.source_name}</p>
                  <p className="text-xs text-gray-400">{item.category} · {item.frequency} · {item.date}</p>
                </div>
                <p className="font-bold text-green-600 whitespace-nowrap">{formatCOP(item.amount)}</p>
                <div className="flex gap-2">
                  <Button variant="ghost" className="text-xs px-2 py-1" onClick={() => { setEditing(item); setModal('form'); }}>✏️</Button>
                  <Button variant="ghost" className="text-xs px-2 py-1 text-red-400" onClick={() => setDeleting(item.id)}>🗑️</Button>
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      <Modal open={modal === 'form'} onClose={() => setModal(null)} title={editing ? 'Editar ingreso' : 'Nuevo ingreso'}>
        <IncomeForm initial={editing} onSuccess={() => { setModal(null); addToast(editing ? 'Ingreso actualizado' : 'Ingreso guardado'); fetch(); }} onCancel={() => setModal(null)} />
      </Modal>
      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Confirmar eliminación">
        <p className="text-gray-600 mb-4">¿Estás seguro de que deseas eliminar este ingreso?</p>
        <div className="flex gap-3">
          <Button variant="danger" onClick={handleDelete} className="flex-1">Eliminar</Button>
          <Button variant="ghost" onClick={() => setDeleting(null)}>Cancelar</Button>
        </div>
      </Modal>
    </div>
  );
}
