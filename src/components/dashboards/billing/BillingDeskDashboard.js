'use client';

import { useState } from 'react';
import styles from '../../../assets/styles/BillingDeskDashboard.module.css';

const INVOICES = [
  {
    id: 'INV-1042',
    patient: 'Bilal Ahmed',
    date: '28 Sep 2026',
    items: [
      { label: 'Cardiology consultation', amount: 1500 },
      { label: 'ECG test', amount: 700 },
    ],
    method: 'Card',
    status: 'Unpaid',
  },
  {
    id: 'INV-1041',
    patient: 'Sana Khan',
    date: '28 Sep 2026',
    items: [{ label: 'General consultation', amount: 800 }],
    method: 'Cash',
    status: 'Paid',
  },
  {
    id: 'INV-1039',
    patient: 'Hina Tariq',
    date: '27 Sep 2026',
    items: [
      { label: 'Dermatology consultation', amount: 1200 },
      { label: 'Skin allergy test', amount: 900 },
    ],
    method: 'Insurance (TPA)',
    status: 'Unpaid',
  },
];

const CLAIMS = [
  { id: 'CLM-3081', patient: 'Hina Tariq', insurer: 'State Life TPA', amount: 2100, status: 'Under review' },
  { id: 'CLM-3077', patient: 'Zoya Raheel', insurer: 'Jubilee Health', amount: 3400, status: 'Approved' },
  { id: 'CLM-3061', patient: 'Imran Farooq', insurer: 'EFU Health', amount: 1800, status: 'Rejected' },
];

const INVOICE_PILL = { Paid: styles.pillPaid, Unpaid: styles.pillUnpaid };
const CLAIM_PILL = { 'Under review': styles.pillClaimReview, Approved: styles.pillClaimApproved, Rejected: styles.pillClaimRejected };

const fmt = (n) => 'Rs ' + n.toLocaleString('en-US');
const total = (items) => items.reduce((s, i) => s + i.amount, 0);

export default function BillingDeskDashboard() {
  const [invoices, setInvoices] = useState(INVOICES);
  const [tab, setTab] = useState('Invoices');

  function markPaid(id) {
    setInvoices((list) => list.map((i) => (i.id === id ? { ...i, status: 'Paid' } : i)));
  }

  const outstanding = invoices.filter((i) => i.status === 'Unpaid').reduce((s, i) => s + total(i.items), 0);
  const collectedToday = invoices.filter((i) => i.status === 'Paid').reduce((s, i) => s + total(i.items), 0);
  const claimsPending = CLAIMS.filter((c) => c.status === 'Under review').length;

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Billing desk</h1>
          <p className={styles.subtitle}>Consolidated invoices, itemized charges, and insurance claims.</p>
        </div>
      </div>

      <div className={styles.statRow}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Invoices today</p>
          <p className={styles.statValue}>{invoices.length}</p>
        </div>
        <div className={`${styles.statCard} ${styles.amber}`}>
          <p className={styles.statLabel}>Outstanding</p>
          <p className={styles.statValue}>{fmt(outstanding)}</p>
        </div>
        <div className={`${styles.statCard} ${styles.blue}`}>
          <p className={styles.statLabel}>Collected today</p>
          <p className={styles.statValue}>{fmt(collectedToday)}</p>
        </div>
        <div className={`${styles.statCard} ${styles.danger}`}>
          <p className={styles.statLabel}>Claims pending</p>
          <p className={styles.statValue}>{claimsPending}</p>
        </div>
      </div>

      <div className={styles.tabs}>
        {['Invoices', 'Insurance claims'].map((t) => (
          <button
            key={t}
            type="button"
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Invoices' ? (
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
                  <button type="button" className={styles.btnGhost} onClick={() => markPaid(inv.id)}>
                    Mark paid
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.card}>
          {CLAIMS.map((c) => (
            <div key={c.id} className={styles.row}>
              <div className={styles.rowInfo}>
                <p className={styles.rowTitle}>{c.patient}</p>
                <p className={styles.rowSub}>{c.id} · {c.insurer}</p>
              </div>
              <div className={styles.rowRight}>
                <span className={styles.amount}>{fmt(c.amount)}</span>
                <span className={`${styles.pill} ${CLAIM_PILL[c.status]}`}>{c.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}