import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Incomes from './pages/Incomes';
import FixedExpenses from './pages/FixedExpenses';
import AntExpenses from './pages/AntExpenses';
import Debts from './pages/Debts';
import MonthlySummary from './pages/MonthlySummary';
import Charts from './pages/Charts';
import Learning from './pages/Learning';
import Profile from './pages/Profile';

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { token } = useAuth();
  return token ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ingresos" element={<Incomes />} />
            <Route path="/gastos-fijos" element={<FixedExpenses />} />
            <Route path="/gastos-hormiga" element={<AntExpenses />} />
            <Route path="/deudas" element={<Debts />} />
            <Route path="/resumen" element={<MonthlySummary />} />
            <Route path="/graficas" element={<Charts />} />
            <Route path="/aprende" element={<Learning />} />
            <Route path="/perfil" element={<Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
