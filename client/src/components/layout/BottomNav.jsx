import React from 'react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', icon: '🏠', label: 'Inicio' },
  { to: '/ingresos', icon: '📥', label: 'Ingresos' },
  { to: '/gastos-fijos', icon: '📤', label: 'Gastos' },
  { to: '/gastos-hormiga', icon: '🐜', label: 'Hormiga' },
  { to: '/deudas', icon: '💳', label: 'Deudas' },
  { to: '/resumen', icon: '📊', label: 'Resumen' },
  { to: '/graficas', icon: '📈', label: 'Gráficas' },
  { to: '/aprende', icon: '🎓', label: 'Aprende' },
  { to: '/perfil', icon: '👤', label: 'Perfil' },
];

export function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-primary z-30 flex overflow-x-auto">
      {links.map(l => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-w-[60px] py-2 px-1 text-white text-xs transition-all ${isActive ? 'bg-white/20' : 'hover:bg-white/10'}`
          }
        >
          <span className="text-lg">{l.icon}</span>
          <span className="text-[10px]">{l.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
