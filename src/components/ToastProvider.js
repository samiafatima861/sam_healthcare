'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Check, X, Info } from 'lucide-react';
import styles from '../assets/styles/ToastProvider.module.css';

const ToastContext = createContext(null);
const ICONS = { success: Check, error: X, info: Info };
let nextId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((type, message, options = {}) => {
    nextId += 1;
    const id = nextId;
    const duration = options.duration ?? (type === 'error' ? 6000 : 3500);
    setToasts((list) => [...list.slice(-3), { id, type, message, title: options.title }]);
    timers.current[id] = setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const api = useMemo(() => ({
    success: (message, options) => push('success', message, options),
    error: (message, options) => push('error', message, options),
    info: (message, options) => push('info', message, options),
    dismiss,
  }), [push, dismiss]);

  useEffect(() => {
    const pending = timers.current;
    return () => Object.values(pending).forEach(clearTimeout);
  }, []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className={styles.region} aria-live="polite" aria-atomic="false">
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <div key={t.id} className={`${styles.toast} ${styles[t.type]}`} role={t.type === 'error' ? 'alert' : 'status'}>
              <span className={styles.icon}><Icon size={14} strokeWidth={3} /></span>
              <div className={styles.body}>
                {t.title && <p className={styles.title}>{t.title}</p>}
                <p className={styles.message}>{t.message}</p>
              </div>
              <button type="button" className={styles.close} onClick={() => dismiss(t.id)} aria-label="Dismiss">
                <X size={14} strokeWidth={2.5} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

const fallback = {
  success: (m) => console.info(m),
  error: (m) => console.error(m),
  info: (m) => console.info(m),
  dismiss: () => {},
};

// use inside any client component: const toast = useToast(); toast.success('Saved');
export function useToast() {
  return useContext(ToastContext) || fallback;
}