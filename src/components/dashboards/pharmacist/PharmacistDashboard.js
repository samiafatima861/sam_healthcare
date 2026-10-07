'use client';

import { useState } from 'react';
import { Pill, PackageSearch, History } from 'lucide-react';
import styles from '../../../assets/styles/StaffDashboards.module.css';

const INITIAL_QUEUE = [
  { id: 1, patient: 'Bilal Ahmed', medicine: 'Amlodipine 5mg', qty: '30 tablets', status: 'Pending' },
  { id: 2, patient: 'Sana Khan', medicine: 'Cetirizine 10mg', qty: '5 tablets', status: 'Pending' },
  { id: 3, patient: 'Hina Tariq', medicine: 'Losartan 50mg', qty: '30 tablets', status: 'Dispensed' },
];

const INVENTORY = [
  { name: 'Amlodipine 5mg', stock: 18, capacity: 200, level: 'low' },
  { name: 'Paracetamol 500mg', stock: 640, capacity: 800, level: 'ok' },
  { name: 'Cetirizine 10mg', stock: 42, capacity: 300, level: 'low' },
  { name: 'Amoxicillin 250mg', stock: 210, capacity: 400, level: 'ok' },
];

const HISTORY = [
  { patient: 'Zoya Raheel', medicine: 'Metformin 500mg', time: 'Today, 11:20 AM' },
  { patient: 'Imran Farooq', medicine: 'Ibuprofen 400mg', time: 'Today, 10:05 AM' },
];

export default function PharmacistDashboard() {
  const [queue, setQueue] = useState(INITIAL_QUEUE);

  function dispense(id) {
    setQueue((list) => list.map((q) => (q.id === id ? { ...q, status: 'Dispensed' } : q)));
  }

  const pending = queue.filter((q) => q.status === 'Pending').length;
  const lowStock = INVENTORY.filter((i) => i.level === 'low').length;

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Pharmacy</h1>
          <p className={styles.subtitle}>Prescription queue, stock levels, and dispensing history.</p>
        </div>
      </div>

      <div className={styles.statRow}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Prescriptions pending</p>
          <p className={styles.statValue}>{pending}</p>
        </div>
        <div className={`${styles.statCard} ${styles.danger}`}>
          <p className={styles.statLabel}>Low stock items</p>
          <p className={styles.statValue}>{lowStock}</p>
        </div>
        <div className={`${styles.statCard} ${styles.blue}`}>
          <p className={styles.statLabel}>Dispensed today</p>
          <p className={styles.statValue}>{queue.filter((q) => q.status === 'Dispensed').length + HISTORY.length}</p>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.mainCol}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Prescription queue</h2>
              <span className={styles.cardCount}>{pending} pending</span>
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

          <div className={styles.card}>
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

        <div className={styles.sideCol}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <PackageSearch size={16} strokeWidth={2} style={{ verticalAlign: '-3px', marginRight: 6 }} />
                Stock levels
              </h2>
            </div>
            {INVENTORY.map((i) => {
              const pct = Math.round((i.stock / i.capacity) * 100);
              return (
                <div key={i.name} className={styles.row}>
                  <div className={styles.rowInfo}>
                    <p className={styles.rowTitle}>{i.name}</p>
                    <p className={styles.rowSub}>{i.stock} units left</p>
                  </div>
                  <div className={styles.inventoryBarTrack}>
                    <div
                      className={styles.inventoryBarFill}
                      style={{ width: `${pct}%`, background: i.level === 'low' ? '#A63737' : 'var(--brand-accent)' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}