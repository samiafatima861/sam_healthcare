'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import styles from '../../../assets/styles/StaffDashboards.module.css';

const INITIAL_REQUESTS = [
  { id: 1, patient: 'Bilal Ahmed', test: 'Complete Blood Count', doctor: 'Dr. Arjun Mehta', status: 'Pending' },
  { id: 2, patient: 'Hina Tariq', test: 'Lipid Profile', doctor: 'Dr. Arjun Mehta', status: 'In progress' },
  { id: 3, patient: 'Sana Khan', test: 'Thyroid Panel', doctor: 'Dr. Priya Sharma', status: 'Pending' },
  { id: 4, patient: 'Zoya Raheel', test: 'Blood Glucose', doctor: 'Dr. Priya Sharma', status: 'Ready' },
];

const NEXT_STATUS = { Pending: 'In progress', 'In progress': 'Ready' };
const REQUEST_PILL = { Pending: styles.pillWarn, 'In progress': styles.pillTeal, Ready: styles.pillGreen };

export default function LabTechDashboard() {
  const [requests, setRequests] = useState(INITIAL_REQUESTS);

  function advance(id) {
    setRequests((list) =>
      list.map((r) => (r.id === id && NEXT_STATUS[r.status] ? { ...r, status: NEXT_STATUS[r.status] } : r))
    );
  }

  const pending = requests.filter((r) => r.status === 'Pending').length;
  const inProgress = requests.filter((r) => r.status === 'In progress').length;
  const ready = requests.filter((r) => r.status === 'Ready').length;

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Laboratory</h1>
          <p className={styles.subtitle}>Test requests and sample processing status.</p>
        </div>
      </div>

      <div className={styles.statRow}>
        <div className={`${styles.statCard} ${styles.amber}`}>
          <p className={styles.statLabel}>Pending</p>
          <p className={styles.statValue}>{pending}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>In progress</p>
          <p className={styles.statValue}>{inProgress}</p>
        </div>
        <div className={`${styles.statCard} ${styles.blue}`}>
          <p className={styles.statLabel}>Ready for review</p>
          <p className={styles.statValue}>{ready}</p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Test requests</h2>
          <span className={styles.cardCount}>{requests.length} total</span>
        </div>
        {requests.map((r) => (
          <div key={r.id} className={styles.row}>
            <span className={`${styles.rowIcon} ${r.status === 'Ready' ? styles.rowIconTeal : styles.rowIconAmber}`}>
              <FlaskConical size={17} strokeWidth={2} />
            </span>
            <div className={styles.rowInfo}>
              <p className={styles.rowTitle}>{r.test}</p>
              <p className={styles.rowSub}>{r.patient} · Requested by {r.doctor}</p>
            </div>
            <span className={`${styles.pill} ${REQUEST_PILL[r.status]}`}>{r.status}</span>
            {NEXT_STATUS[r.status] && (
              <button type="button" className={styles.btnGhost} onClick={() => advance(r.id)}>
                Mark {NEXT_STATUS[r.status].toLowerCase()}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}