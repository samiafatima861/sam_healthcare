'use client';

import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import styles from '../../../assets/styles/ReceptionistDashboard.module.css';

const INITIAL_PAYMENTS = [
  { id: 1, patient: 'Hina Tariq', method: 'Cash', amount: 1500, status: 'Pending' },
  { id: 2, patient: 'Bilal Ahmed', method: 'Card', amount: 2200, status: 'Pending' },
  { id: 3, patient: 'Zoya Raheel', method: 'Insurance (TPA)', amount: 3400, status: 'Settled' },
];

export default function ReceptionistPayments() {
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);

  function settle(id) {
    setPayments((list) => list.map((p) => (p.id === id ? { ...p, status: 'Settled' } : p)));
  }

  const pendingAmount = payments.filter((p) => p.status === 'Pending').reduce((s, p) => s + p.amount, 0);

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Payment reconciliation</h1>
          <p className={styles.subtitle}>Rs {pendingAmount.toLocaleString('en-US')} pending today.</p>
        </div>
      </div>

      <div className={styles.card}>
        {payments.map((p) => (
          <div key={p.id} className={styles.paymentRow}>
            <div className={styles.paymentInfo}>
              <p className={styles.paymentName}>{p.patient}</p>
              <p className={styles.paymentMeta}>
                <CreditCard size={11} strokeWidth={2} style={{ verticalAlign: '-1px', marginRight: 4 }} />
                {p.method}
              </p>
            </div>
            <div className={styles.paymentRight}>
              <span className={styles.paymentAmount}>Rs {p.amount.toLocaleString('en-US')}</span>
              <span className={`${styles.pill} ${p.status === 'Settled' ? styles.pillSettled : styles.pillPending}`}>
                {p.status}
              </span>
              {p.status === 'Pending' && (
                <button type="button" className={styles.btnGhost} onClick={() => settle(p.id)}>
                  Mark settled
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}