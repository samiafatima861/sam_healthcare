import { HeartPulse } from 'lucide-react';
import styles from '../../../assets/styles/StaffDashboards.module.css';

const PATIENTS = [
  { id: 1, name: 'Bilal Ahmed', room: 'Ward 2, Bed 4', condition: 'Post-op recovery', status: 'Stable' },
  { id: 2, name: 'Hina Tariq', room: 'Ward 1, Bed 2', condition: 'Hypertension monitoring', status: 'Needs check' },
  { id: 3, name: 'Sana Khan', room: 'Ward 2, Bed 1', condition: 'Fever observation', status: 'Stable' },
];

const PATIENT_PILL = { Stable: styles.pillGreen, 'Needs check': styles.pillWarn };

export default function NursePatients() {
  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Assigned patients</h1>
          <p className={styles.subtitle}>Patients under your care this shift.</p>
        </div>
      </div>

      <div className={styles.card}>
        {PATIENTS.map((p) => (
          <div key={p.id} className={styles.row}>
            <span className={`${styles.rowIcon} ${styles.rowIconTeal}`}><HeartPulse size={17} strokeWidth={2} /></span>
            <div className={styles.rowInfo}>
              <p className={styles.rowTitle}>{p.name}</p>
              <p className={styles.rowSub}>{p.room} · {p.condition}</p>
            </div>
            <span className={`${styles.pill} ${PATIENT_PILL[p.status]}`}>{p.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}