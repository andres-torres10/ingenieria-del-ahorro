import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { ToastContainer } from '../ui/Toast';
import { useToast } from '../../hooks/useToast';

export const ToastContext = React.createContext(null);

export function AppLayout() {
  const { toasts, addToast, removeToast } = useToast();
  return (
    <ToastContext.Provider value={addToast}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <Outlet />
        </main>
        <BottomNav />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    </ToastContext.Provider>
  );
}
