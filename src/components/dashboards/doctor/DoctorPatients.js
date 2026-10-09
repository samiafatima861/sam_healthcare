import { HeartPulse } from 'lucide-react';
import styles from '../../../assets/styles/StaffDashboards.module.css';

const PATIENTS = [
  { name: 'Bilal Ahmed', age: 42, gender: 'Male', condition: 'Hypertension', lastVisit: '12 Sep 2026' },
  { name: 'Sana Khan', age: 29, gender: 'Female', condition: 'Seasonal fever', lastVisit: 'Today' },
  { name: 'Imran Farooq', age: 51, gender: 'Male', condition: 'Post-op follow-up', lastVisit: '27 Sep 2026' },
  { name: 'Hina Tariq', age: 55, gender: 'Female', condition: 'Hypertension', lastVisit: '20 Aug 2026' },
  { name: 'Zoya Raheel', age: 34, gender: 'Female', condition: 'Diabetes monitoring', lastVisit: '2 Aug 2026' },
];

export default function DoctorPatients() {
  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>My patients</h1>
          <p className={styles.subtitle}>{PATIENTS.length} patients under your care.</p>
        </div>
      </div>

      <div className={styles.card}>
        {PATIENTS.map((p) => (
          <div key={p.name} className={styles.row}>
            <span className={`${styles.rowIcon} ${styles.rowIconTeal}`}><HeartPulse size={17} strokeWidth={2} /></span>
            <div className={styles.rowInfo}>
              <p className={styles.rowTitle}>{p.name}</p>
              <p className={styles.rowSub}>{p.age} · {p.gender} · {p.condition}</p>
            </div>
            <span className={styles.rowMeta}>Last visit: {p.lastVisit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}