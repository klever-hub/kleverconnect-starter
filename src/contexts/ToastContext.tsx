import { createContext, useState, useCallback, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Toast, ToastOptions } from '@/types/toast';

export interface ToastContextType {
  toasts: Toast[];
  addToast: (options: ToastOptions) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export { ToastContext };

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const removeToastRef = useRef<(id: string) => void | undefined>(undefined);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
    removeToastRef.current = removeToast;
  }, [removeToast]);

  const addToast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: Toast = {
      id,
      type: options.type || 'info',
      title: options.title,
      message: options.message,
      duration: options.duration || 5000,
      action: options.action,
    };

    setToasts((prev) => [...prev, toast]);

    // Auto remove toast after duration
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        removeToastRef.current?.(id);
      }, toast.duration);
    }
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const value: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    clearToasts,
  };

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};
