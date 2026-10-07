import styles from '../../../assets/styles/AdminDashboard.module.css';

const ACTIVITY = [
  { text: 'Dr. Arjun Mehta admitted a patient in Cardiology', time: '12 minutes ago' },
  { text: 'New invoice INV-1042 generated for Bilal Ahmed', time: '38 minutes ago' },
  { text: 'Insurance claim CLM-3077 approved by Jubilee Health', time: '1 hour ago' },
  { text: 'Fatima Noor checked in 3 walk-in patients', time: '2 hours ago' },
  { text: 'Dr. Omar Siddiqui marked on leave for the week', time: 'Yesterday' },
  { text: 'Lipid Profile report uploaded for Bilal Ahmed', time: 'Yesterday' },
  { text: 'New staff member Sarah Malik added to Laboratory', time: '2 days ago' },
];

export default function AdminActivity() {
  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Activity log</h1>
          <p className={styles.subtitle}>Recent actions across the hospital system.</p>
        </div>
      </div>

      <div className={styles.card}>
        {ACTIVITY.map((a) => (
          <div key={a.text} className={styles.activityRow}>
            <span className={styles.activityDot} />
            <div className={styles.activityInfo}>
              <p className={styles.activityText}>{a.text}</p>
              <p className={styles.activityTime}>{a.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}