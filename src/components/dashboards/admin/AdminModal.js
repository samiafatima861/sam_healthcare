'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import styles from '../../../assets/styles/AdminDashboard.module.css';

export default function AdminModal({ title, subtitle, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return createPortal(
    <div
      className={styles.overlay}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label={title}>
        <div className={styles.modalHead}>
          <div>
            <h2 className={styles.modalTitle}>{title}</h2>
            {subtitle && <p className={styles.modalSub}>{subtitle}</p>}
          </div>
          <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Close">
            <X size={18} strokeWidth={2.25} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}