'use client';

import { useState } from 'react';
import { Pill } from 'lucide-react';
import styles from '../../../assets/styles/StaffDashboards.module.css';

const MED_SCHEDULE = [
  { id: 1, patient: 'Bilal Ahmed', medicine: 'Paracetamol 500mg', time: '2:00 PM', given: false },
  { id: 2, patient: 'Hina Tariq', medicine: 'Losartan 50mg', time: '2:30 PM', given: false },
  { id: 3, patient: 'Sana Khan', medicine: 'Amoxicillin 250mg', time: '3:00 PM', given: true },
];

export default function NurseMedications() {
  const [meds, setMeds] = useState(MED_SCHEDULE);

  function markGiven(id) {
    setMeds((list) => list.map((m) => (m.id === id ? { ...m, given: true } : m)));
  }

  const pending = meds.filter((m) => !m.given).length;

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Medication schedule</h1>
          <p className={styles.subtitle}>{pending} doses still pending today.</p>
        </div>
      </div>

      <div className={styles.card}>
        {meds.map((m) => (
          <div key={m.id} className={styles.row}>
            <span className={`${styles.rowIcon} ${m.given ? styles.rowIconTeal : styles.rowIconAmber}`}><Pill size={17} strokeWidth={2} /></span>
            <div className={styles.rowInfo}>
              <p className={styles.rowTitle}>{m.medicine}</p>
              <p className={styles.rowSub}>{m.patient} · {m.time}</p>
            </div>
            {m.given ? (
              <span className={`${styles.pill} ${styles.pillGreen}`}>Given</span>
            ) : (
              <button type="button" className={styles.btnGhost} onClick={() => markGiven(m.id)}>Mark given</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}