import styles from '../../../assets/styles/AdminDashboard.module.css';

const DEPARTMENTS = [
  { name: 'Cardiology', patients: 312, load: 82 },
  { name: 'General Physician', patients: 540, load: 91 },
  { name: 'Dermatology', patients: 198, load: 54 },
  { name: 'Orthopedics', patients: 164, load: 47 },
  { name: 'Pediatrics', patients: 271, load: 68 },
];

export default function AdminDepartments() {
  const totalPatients = DEPARTMENTS.reduce((s, d) => s + d.patients, 0);

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Departments</h1>
          <p className={styles.subtitle}>Patient load across {DEPARTMENTS.length} departments, {totalPatients.toLocaleString('en-US')} patients total.</p>
        </div>
      </div>

      <div className={styles.card}>
        {DEPARTMENTS.map((d) => (
          <div key={d.name} className={styles.deptRow}>
            <div className={styles.deptInfo}>
              <p className={styles.deptName}>{d.name}</p>
              <p className={styles.deptMeta}>{d.patients} patients</p>
            </div>
            <div className={styles.deptBarTrack}>
              <div className={styles.deptBarFill} style={{ width: `${d.load}%` }} />
            </div>
            <span className={styles.deptPct}>{d.load}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}