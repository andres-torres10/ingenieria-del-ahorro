import { useContext } from 'react';
import { ToastContext } from '../components/layout/AppLayout';

export function useToastContext() {
  return useContext(ToastContext);
}
