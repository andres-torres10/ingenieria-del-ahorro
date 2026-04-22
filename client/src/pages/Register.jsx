import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

const API = import.meta.env.VITE_API_URL || '';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'El nombre es requerido';
    if (!form.email) e.email = 'El correo es requerido';
    if (form.password.length < 8) e.password = 'Mínimo 8 caracteres';
    if (form.password !== form.confirm) e.confirm = 'Las contraseñas no coinciden';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({}); setServerError(''); setLoading(true);
    try {
      const { data } = await axios.post(`${API}/auth/register`, { name: form.name, email: form.email, password: form.password });
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setServerError(err.response?.data?.error || 'Error al registrarse');
    } finally { setLoading(false); }
  };

  const field = (key, label, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${errors[key] ? 'border-red-400' : 'border-gray-300'}`}
        placeholder={placeholder}
      />
      {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">💰</div>
          <h1 className="text-2xl font-bold text-primary">Crear cuenta</h1>
          <p className="text-gray-500 text-sm mt-1">Empieza a gestionar tus finanzas</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {field('name', 'Nombre completo', 'text', 'Juan Pérez')}
          {field('email', 'Correo electrónico', 'email', 'tu@correo.com')}
          {field('password', 'Contraseña', 'password', 'Mínimo 8 caracteres')}
          {field('confirm', 'Confirmar contraseña', 'password', 'Repite tu contraseña')}
          {serverError && <p className="text-red-500 text-sm text-center">{serverError}</p>}
          <Button type="submit" loading={loading} className="w-full py-3">Crear cuenta</Button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-accent font-semibold hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
