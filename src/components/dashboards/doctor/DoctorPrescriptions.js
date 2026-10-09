import { Pill } from 'lucide-react';
import styles from '../../../assets/styles/StaffDashboards.module.css';

const PRESCRIPTIONS = [
  { patient: 'Bilal Ahmed', medicine: 'Amlodipine 5mg', date: '12 Sep 2026' },
  { patient: 'Bilal Ahmed', medicine: 'Aspirin 75mg', date: '12 Sep 2026' },
  { patient: 'Sana Khan', medicine: 'Paracetamol 500mg', date: 'Today' },
  { patient: 'Hina Tariq', medicine: 'Losartan 50mg', date: '20 Aug 2026' },
  { patient: 'Zoya Raheel', medicine: 'Metformin 500mg', date: '2 Aug 2026' },
];

export default function DoctorPrescriptions() {
  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Recent prescriptions</h1>
          <p className={styles.subtitle}>Medications you've prescribed recently.</p>
        </div>
      </div>

      <div className={styles.card}>
        {PRESCRIPTIONS.map((p, i) => (
          <div key={p.patient + p.medicine + i} className={styles.row}>
            <span className={`${styles.rowIcon} ${styles.rowIconTeal}`}><Pill size={17} strokeWidth={2} /></span>
            <div className={styles.rowInfo}>
              <p className={styles.rowTitle}>{p.medicine}</p>
              <p className={styles.rowSub}>{p.patient}</p>
            </div>
            <span className={styles.rowMeta}>{p.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}