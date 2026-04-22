import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import { ToastContext } from '../components/layout/AppLayout';

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const addToast = useContext(ToastContext);
  const navigate = useNavigate();

  const [profile, setProfile] = useState({ name: '', email: '', savings_goal_pct: 10 });
  const [profileErrors, setProfileErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [savingPw, setSavingPw] = useState(false);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/profile').then(r => {
      setProfile({ name: r.data.name, email: r.data.email, savings_goal_pct: r.data.savingsGoalPct });
    }).finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!profile.name.trim()) errs.name = 'El nombre es requerido';
    if (!profile.email) errs.email = 'El correo es requerido';
    if (profile.savings_goal_pct < 0 || profile.savings_goal_pct > 100) errs.savings_goal_pct = 'Entre 0 y 100';
    if (Object.keys(errs).length) { setProfileErrors(errs); return; }
    setSavingProfile(true);
    try {
      const { data } = await api.put('/profile', profile);
      setUser({ ...user, name: data.name, email: data.email, savingsGoalPct: data.savingsGoalPct });
      addToast('Perfil actualizado');
    } catch (err) {
      setProfileErrors({ server: err.response?.data?.error || 'Error al guardar' });
    } finally { setSavingProfile(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!pwForm.current_password) errs.current_password = 'Requerido';
    if (pwForm.new_password.length < 8) errs.new_password = 'Mínimo 8 caracteres';
    if (pwForm.new_password !== pwForm.confirm) errs.confirm = 'Las contraseñas no coinciden';
    if (Object.keys(errs).length) { setPwErrors(errs); return; }
    setSavingPw(true);
    try {
      await api.put('/profile/password', { current_password: pwForm.current_password, new_password: pwForm.new_password });
      addToast('Contraseña actualizada');
      setPwForm({ current_password: '', new_password: '', confirm: '' });
    } catch (err) {
      setPwErrors({ server: err.response?.data?.error || 'Error al cambiar contraseña' });
    } finally { setSavingPw(false); }
  };

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/export/csv', { headers: { Authorization: `Bearer ${token}` } });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url;
      a.download = 'ingenieria-del-ahorro.csv'; a.click();
      URL.revokeObjectURL(url);
      addToast('Datos exportados');
    } catch { addToast('Error al exportar', 'error'); }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await api.delete('/profile');
      logout(); navigate('/login');
    } catch { addToast('Error al eliminar cuenta', 'error'); setDeleting(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const inputClass = (err) => `w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${err ? 'border-red-400' : 'border-gray-300'}`;

  return (
    <div className="p-5 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-primary">👤 Mi Perfil</h1>

      {/* Profile form */}
      <Card>
        <h2 className="font-semibold text-gray-700 mb-4">Información personal</h2>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          {[
            { key: 'name', label: 'Nombre completo', type: 'text' },
            { key: 'email', label: 'Correo electrónico', type: 'email' },
          ].map(({ key, label, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input type={type} value={profile[key]} onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
                className={inputClass(profileErrors[key])} />
              {profileErrors[key] && <p className="text-red-500 text-xs mt-1">{profileErrors[key]}</p>}
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meta de ahorro (%)</label>
            <input type="number" min="0" max="100" value={profile.savings_goal_pct}
              onChange={e => setProfile(p => ({ ...p, savings_goal_pct: +e.target.value }))}
              className={inputClass(profileErrors.savings_goal_pct)} />
            {profileErrors.savings_goal_pct && <p className="text-red-500 text-xs mt-1">{profileErrors.savings_goal_pct}</p>}
            <p className="text-xs text-gray-400 mt-1">Porcentaje de tus ingresos que deseas ahorrar cada mes</p>
          </div>
          {profileErrors.server && <p className="text-red-500 text-sm">{profileErrors.server}</p>}
          <Button type="submit" loading={savingProfile}>Guardar cambios</Button>
        </form>
      </Card>

      {/* Change password */}
      <Card>
        <h2 className="font-semibold text-gray-700 mb-4">Cambiar contraseña</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          {[
            { key: 'current_password', label: 'Contraseña actual' },
            { key: 'new_password', label: 'Nueva contraseña' },
            { key: 'confirm', label: 'Confirmar nueva contraseña' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input type="password" value={pwForm[key]} onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                className={inputClass(pwErrors[key])} placeholder="••••••••" />
              {pwErrors[key] && <p className="text-red-500 text-xs mt-1">{pwErrors[key]}</p>}
            </div>
          ))}
          {pwErrors.server && <p className="text-red-500 text-sm">{pwErrors.server}</p>}
          <Button type="submit" loading={savingPw} variant="outline">Cambiar contraseña</Button>
        </form>
      </Card>

      {/* Export & Delete */}
      <Card>
        <h2 className="font-semibold text-gray-700 mb-4">Datos de la cuenta</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700">Exportar mis datos</p>
              <p className="text-xs text-gray-400">Descarga todos tus registros en formato CSV</p>
            </div>
            <Button variant="outline" onClick={handleExportCSV}>📥 Exportar CSV</Button>
          </div>
          <div className="border-t pt-3 flex items-center justify-between">
            <div>
              <p className="font-medium text-red-600">Eliminar cuenta</p>
              <p className="text-xs text-gray-400">Esta acción es irreversible y borrará todos tus datos</p>
            </div>
            <Button variant="danger" onClick={() => setDeleteModal(true)}>Eliminar cuenta</Button>
          </div>
        </div>
      </Card>

      <Modal open={deleteModal} onClose={() => setDeleteModal(false)} title="¿Eliminar cuenta?">
        <p className="text-gray-600 mb-2">Esta acción eliminará permanentemente:</p>
        <ul className="text-sm text-gray-500 list-disc list-inside mb-4 space-y-1">
          <li>Tu perfil y datos de acceso</li>
          <li>Todos tus ingresos registrados</li>
          <li>Todos tus gastos fijos y hormiga</li>
          <li>Todas tus deudas</li>
        </ul>
        <p className="text-red-600 font-semibold mb-4">Esta acción no se puede deshacer.</p>
        <div className="flex gap-3">
          <Button variant="danger" loading={deleting} onClick={handleDeleteAccount} className="flex-1">Sí, eliminar mi cuenta</Button>
          <Button variant="ghost" onClick={() => setDeleteModal(false)}>Cancelar</Button>
        </div>
      </Modal>
    </div>
  );
}
