import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const links = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/ingresos', label: 'Ingresos', icon: '📥' },
  { to: '/gastos-fijos', label: 'Gastos Fijos', icon: '📤' },
  { to: '/gastos-hormiga', label: 'Gastos Hormiga', icon: '🐜' },
  { to: '/deudas', label: 'Deudas', icon: '💳' },
  { to: '/resumen', label: 'Resumen Mensual', icon: '📊' },
  { to: '/graficas', label: 'Gráficas', icon: '📈' },
  { to: '/aprende', label: 'Aprende', icon: '🎓' },
  { to: '/perfil', label: 'Mi Perfil', icon: '👤' },
];

export function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-primary text-white">
      <div className="p-5 border-b border-white/20">
        <h1 className="text-xl font-bold leading-tight">💰 Ingeniería<br />del Ahorro</h1>
        {user && <p className="text-sm text-white/70 mt-1">Hola, {user.name}</p>}
      </div>
      <nav className="flex-1 py-4">
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-3 text-sm transition-all hover:bg-white/10 ${isActive ? 'bg-white/20 font-semibold' : ''}`
            }
          >
            <span>{l.icon}</span>{l.label}
          </NavLink>
        ))}
      </nav>
      <button
        onClick={() => { logout(); navigate('/login'); }}
        className="m-4 py-2 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-sm transition-all"
      >
        Cerrar sesión
      </button>
    </aside>
  );
}
