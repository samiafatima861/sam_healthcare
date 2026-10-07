'use client';

import { useState } from 'react';
import { Pill } from 'lucide-react';
import styles from '../../../assets/styles/PortalPages.module.css';

const PRESCRIPTIONS = [
  { id: 1, medicine: 'Amlodipine 5mg', dosage: '1 tablet, once daily', doctor: 'Dr. Arjun Mehta', refills: 2, status: 'Active' },
  { id: 2, medicine: 'Vitamin D3 1000 IU', dosage: '1 capsule, once daily', doctor: 'Dr. Priya Sharma', refills: 1, status: 'Active' },
  { id: 3, medicine: 'Cetirizine 10mg', dosage: '1 tablet at night, 5 days', doctor: 'Dr. Neha Verma', refills: 0, status: 'Completed' },
];

export default function PatientPrescriptions() {
  const [requested, setRequested] = useState([]);

  function requestRefill(id) {
    setRequested((list) => [...list, id]);
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Prescriptions</h1>
          <p className={styles.subtitle}>Your active medications and refill history.</p>
        </div>
      </div>

      <div className={styles.card}>
        {PRESCRIPTIONS.map((p) => {
          const isRequested = requested.includes(p.id);
          const canRefill = p.status === 'Active' && p.refills > 0;
          return (
            <div key={p.id} className={styles.row}>
              <span className={`${styles.rowIcon} ${p.status === 'Active' ? styles.rowIconTeal : styles.rowIconBlue}`}>
                <Pill size={17} strokeWidth={2} />
              </span>
              <div className={styles.rowInfo}>
                <p className={styles.rowTitle}>{p.medicine}</p>
                <p className={styles.rowSub}>{p.dosage} · Prescribed by {p.doctor}</p>
              </div>
              <div className={styles.rowRight}>
                <span className={styles.rowMeta}>
                  {p.status === 'Active' ? `${p.refills} refill${p.refills === 1 ? '' : 's'} left` : 'Course finished'}
                </span>
                <span className={`${styles.pill} ${p.status === 'Active' ? styles.pillGreen : styles.pillGray}`}>
                  {p.status}
                </span>
                {canRefill && (
                  <button
                    type="button"
                    className={styles.btnGhost}
                    disabled={isRequested}
                    onClick={() => requestRefill(p.id)}
                  >
                    {isRequested ? 'Refill requested' : 'Request refill'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}