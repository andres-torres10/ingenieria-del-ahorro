import React from 'react';

export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div
          key={t.id}
          onClick={() => removeToast(t.id)}
          className={`px-4 py-3 rounded-xl shadow-lg text-white text-sm cursor-pointer transition-all
            ${t.type === 'error' ? 'bg-red-500' : t.type === 'warning' ? 'bg-yellow-500' : 'bg-green-600'}`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
