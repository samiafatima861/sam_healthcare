'use client';

import { useState } from 'react';
import styles from '../../../assets/styles/BillingDeskDashboard.module.css';

const INVOICES = [
  { id: 'INV-1042', patient: 'Bilal Ahmed', date: '28 Sep 2026', items: [{ label: 'Cardiology consultation', amount: 1500 }, { label: 'ECG test', amount: 700 }], method: 'Card', status: 'Unpaid' },
  { id: 'INV-1041', patient: 'Sana Khan', date: '28 Sep 2026', items: [{ label: 'General consultation', amount: 800 }], method: 'Cash', status: 'Paid' },
  { id: 'INV-1039', patient: 'Hina Tariq', date: '27 Sep 2026', items: [{ label: 'Dermatology consultation', amount: 1200 }, { label: 'Skin allergy test', amount: 900 }], method: 'Insurance (TPA)', status: 'Unpaid' },
];

const INVOICE_PILL = { Paid: styles.pillPaid, Unpaid: styles.pillUnpaid };
const fmt = (n) => 'Rs ' + n.toLocaleString('en-US');
const total = (items) => items.reduce((s, i) => s + i.amount, 0);

export default function BillingInvoices() {
  const [invoices, setInvoices] = useState(INVOICES);

  function markPaid(id) {
    setInvoices((list) => list.map((i) => (i.id === id ? { ...i, status: 'Paid' } : i)));
  }

  const outstanding = invoices.filter((i) => i.status === 'Unpaid').reduce((s, i) => s + total(i.items), 0);

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Invoices</h1>
          <p className={styles.subtitle}>Rs {outstanding.toLocaleString('en-US')} outstanding across {invoices.filter(i => i.status === 'Unpaid').length} invoices.</p>
        </div>
      </div>

      <div className={styles.card}>
        {invoices.map((inv) => (
          <div key={inv.id} className={styles.row}>
            <div className={styles.rowInfo}>
              <p className={styles.rowTitle}>{inv.patient}</p>
              <p className={styles.rowSub}>{inv.id} · {inv.date} · {inv.method}</p>
              <div className={styles.itemList}>
                {inv.items.map((it) => (
                  <div key={it.label} className={styles.itemLine}>
                    <span>{it.label}</span>
                    <span>{fmt(it.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.rowRight}>
              <span className={styles.amount}>{fmt(total(inv.items))}</span>
              <span className={`${styles.pill} ${INVOICE_PILL[inv.status]}`}>{inv.status}</span>
              {inv.status === 'Unpaid' && (
                <button type="button" className={styles.btnGhost} onClick={() => markPaid(inv.id)}>Mark paid</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}