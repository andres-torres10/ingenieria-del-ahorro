import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { formatCOP } from '../utils/formatCurrency';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import { ToastContext } from '../components/layout/AppLayout';
import AntExpenseForm from '../components/forms/AntExpenseForm';

export default function AntExpenses() {
  const addToast = useContext(ToastContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try { const { data } = await api.get('/ant-expenses'); setItems(data); }
    catch { /* empty */ } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleDelete = async () => {
    try { await api.delete(`/ant-expenses/${deleting}`); addToast('Gasto eliminado'); setDeleting(null); fetch(); }
    catch { addToast('Error al eliminar', 'error'); }
  };

  const totalMonthly = items.reduce((s, i) => s + i.monthly_total, 0);
  const totalAnnual = items.reduce((s, i) => s + i.annual_impact, 0);

  return (
    <div className="p-5 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-primary">🐜 Gastos Hormiga</h1>
        <Button variant="accent" onClick={() => { setEditing(null); setModal('form'); }}>+ Nuevo gasto hormiga</Button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="bg-orange-50 text-center">
          <p className="text-sm text-gray-500">Total mensual</p>
          <p className="text-2xl font-bold text-accent">{formatCOP(totalMonthly)}</p>
        </Card>
        <Card className="bg-red-50 text-center">
          <p className="text-sm text-gray-500">Impacto anual</p>
          <p className="text-2xl font-bold text-red-500">{formatCOP(totalAnnual)}</p>
        </Card>
      </div>

      {loading ? <div className="flex justify-center py-10"><Spinner size="lg" /></div> : (
        items.length === 0 ? (
          <Card className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-3">🐜</div>
            <p>No tienes gastos hormiga registrados.</p>
            <p className="text-sm mt-1">Los gastos pequeños y frecuentes pueden sumar mucho al año.</p>
            <Button variant="accent" className="mt-4" onClick={() => { setEditing(null); setModal('form'); }}>Agregar gasto hormiga</Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <Card key={item.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800">{item.description}</p>
                    <p className="text-xs text-gray-400">{item.category} · {formatCOP(item.unit_cost)} × {item.times_per_month} veces/mes</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-sm">
                      <span className="bg-orange-100 text-accent px-2 py-0.5 rounded-lg">Mensual: {formatCOP(item.monthly_total)}</span>
                      <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-lg">Anual: {formatCOP(item.annual_impact)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 italic">
                      💡 Si eliminas este gasto, ahorrarías <strong>{formatCOP(item.annual_impact)}</strong> al año
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="ghost" className="text-xs px-2 py-1" onClick={() => { setEditing(item); setModal('form'); }}>✏️</Button>
                    <Button variant="ghost" className="text-xs px-2 py-1 text-red-400" onClick={() => setDeleting(item.id)}>🗑️</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      <Modal open={modal === 'form'} onClose={() => setModal(null)} title={editing ? 'Editar gasto hormiga' : 'Nuevo gasto hormiga'}>
        <AntExpenseForm initial={editing} onSuccess={() => { setModal(null); addToast(editing ? 'Gasto actualizado' : 'Gasto guardado'); fetch(); }} onCancel={() => setModal(null)} />
      </Modal>
      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Confirmar eliminación">
        <p className="text-gray-600 mb-4">¿Eliminar este gasto hormiga?</p>
        <div className="flex gap-3">
          <Button variant="danger" onClick={handleDelete} className="flex-1">Eliminar</Button>
          <Button variant="ghost" onClick={() => setDeleting(null)}>Cancelar</Button>
        </div>
      </Modal>
    </div>
  );
}
