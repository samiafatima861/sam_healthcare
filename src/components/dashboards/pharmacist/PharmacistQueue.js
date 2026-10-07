'use client';

import { useState } from 'react';
import { Pill, History } from 'lucide-react';
import styles from '../../../assets/styles/StaffDashboards.module.css';

const INITIAL_QUEUE = [
  { id: 1, patient: 'Bilal Ahmed', medicine: 'Amlodipine 5mg', qty: '30 tablets', status: 'Pending' },
  { id: 2, patient: 'Sana Khan', medicine: 'Cetirizine 10mg', qty: '5 tablets', status: 'Pending' },
  { id: 3, patient: 'Hina Tariq', medicine: 'Losartan 50mg', qty: '30 tablets', status: 'Dispensed' },
];

const HISTORY = [
  { patient: 'Zoya Raheel', medicine: 'Metformin 500mg', time: 'Today, 11:20 AM' },
  { patient: 'Imran Farooq', medicine: 'Ibuprofen 400mg', time: 'Today, 10:05 AM' },
];

export default function PharmacistQueue() {
  const [queue, setQueue] = useState(INITIAL_QUEUE);

  function dispense(id) {
    setQueue((list) => list.map((q) => (q.id === id ? { ...q, status: 'Dispensed' } : q)));
  }

  const pending = queue.filter((q) => q.status === 'Pending').length;

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Prescription queue</h1>
          <p className={styles.subtitle}>{pending} prescriptions waiting to be dispensed.</p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Today's queue</h2>
        </div>
        {queue.map((q) => (
          <div key={q.id} className={styles.row}>
            <span className={`${styles.rowIcon} ${q.status === 'Dispensed' ? styles.rowIconTeal : styles.rowIconAmber}`}><Pill size={17} strokeWidth={2} /></span>
            <div className={styles.rowInfo}>
              <p className={styles.rowTitle}>{q.medicine}</p>
              <p className={styles.rowSub}>{q.patient} · {q.qty}</p>
            </div>
            {q.status === 'Dispensed' ? (
              <span className={`${styles.pill} ${styles.pillGreen}`}>Dispensed</span>
            ) : (
              <button type="button" className={styles.btnGhost} onClick={() => dispense(q.id)}>Dispense</button>
            )}
          </div>
        ))}
      </div>

      <div className={styles.card} style={{ marginTop: 20 }}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Recently dispensed</h2>
        </div>
        {HISTORY.map((h) => (
          <div key={h.patient + h.medicine} className={styles.row}>
            <span className={`${styles.rowIcon} ${styles.rowIconBlue}`}><History size={17} strokeWidth={2} /></span>
            <div className={styles.rowInfo}>
              <p className={styles.rowTitle}>{h.medicine}</p>
              <p className={styles.rowSub}>{h.patient}</p>
            </div>
            <span className={styles.rowMeta}>{h.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}