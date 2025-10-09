import { useContext } from 'react';
import { ToastContext } from '@/contexts/ToastContext';
import type { ToastOptions } from '@/types/toast';

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  const { addToast, removeToast, clearToasts, toasts } = context;

  // Convenience methods
  const success = (title: string, message?: string, options?: Partial<ToastOptions>) => {
    addToast({ ...options, type: 'success', title, message });
  };

  const error = (title: string, message?: string, options?: Partial<ToastOptions>) => {
    addToast({ ...options, type: 'error', title, message });
  };

  const warning = (title: string, message?: string, options?: Partial<ToastOptions>) => {
    addToast({ ...options, type: 'warning', title, message });
  };

  const info = (title: string, message?: string, options?: Partial<ToastOptions>) => {
    addToast({ ...options, type: 'info', title, message });
  };

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    // Convenience methods
    success,
    error,
    warning,
    info,
  };
};
