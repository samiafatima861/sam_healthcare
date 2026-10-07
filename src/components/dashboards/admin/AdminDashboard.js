import { TrendingUp, TrendingDown } from 'lucide-react';
import styles from '../../../assets/styles/AdminDashboard.module.css';

const REVENUE = [
  { month: 'Apr', amount: 820000 },
  { month: 'May', amount: 910000 },
  { month: 'Jun', amount: 870000 },
  { month: 'Jul', amount: 960000 },
  { month: 'Aug', amount: 1040000 },
  { month: 'Sep', amount: 1120000 },
];

const DEPARTMENTS = [
  { name: 'Cardiology', patients: 312, load: 82 },
  { name: 'General Physician', patients: 540, load: 91 },
  { name: 'Dermatology', patients: 198, load: 54 },
  { name: 'Orthopedics', patients: 164, load: 47 },
  { name: 'Pediatrics', patients: 271, load: 68 },
];

const STAFF = [
  { name: 'Dr. Priya Sharma', role: 'General Physician', dept: 'General Medicine', status: 'Active' },
  { name: 'Dr. Arjun Mehta', role: 'Cardiologist', dept: 'Cardiology', status: 'Active' },
  { name: 'Dr. Neha Verma', role: 'Dermatologist', dept: 'Dermatology', status: 'Active' },
  { name: 'Dr. Omar Siddiqui', role: 'Orthopedist', dept: 'Orthopedics', status: 'On leave' },
  { name: 'Fatima Noor', role: 'Receptionist', dept: 'Front desk', status: 'Active' },
  { name: 'Usman Ali', role: 'Billing officer', dept: 'Billing', status: 'Active' },
  { name: 'Sarah Malik', role: 'Lab technician', dept: 'Laboratory', status: 'Inactive' },
];

const ACTIVITY = [
  { text: 'Dr. Arjun Mehta admitted a patient in Cardiology', time: '12 minutes ago' },
  { text: 'New invoice INV-1042 generated for Bilal Ahmed', time: '38 minutes ago' },
  { text: 'Insurance claim CLM-3077 approved by Jubilee Health', time: '1 hour ago' },
  { text: 'Fatima Noor checked in 3 walk-in patients', time: '2 hours ago' },
  { text: 'Dr. Omar Siddiqui marked on leave for the week', time: 'Yesterday' },
];

const STAFF_PILL = { Active: styles.pillActive, 'On leave': styles.pillLeave, Inactive: styles.pillInactive };

const fmt = (n) => 'Rs ' + (n / 1000).toFixed(0) + 'k';

export default function AdminDashboard() {
  const maxRevenue = Math.max(...REVENUE.map((r) => r.amount));
  const totalPatients = DEPARTMENTS.reduce((s, d) => s + d.patients, 0);
  const activeStaff = STAFF.filter((s) => s.status === 'Active').length;
  const thisMonth = REVENUE[REVENUE.length - 1].amount;
  const lastMonth = REVENUE[REVENUE.length - 2].amount;
  const revenueUp = thisMonth >= lastMonth;

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Hospital overview</h1>
          <p className={styles.subtitle}>System-wide activity across every department.</p>
        </div>
      </div>

      <div className={styles.statRow}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total patients</p>
          <p className={styles.statValue}>{totalPatients.toLocaleString('en-US')}</p>
        </div>
        <div className={`${styles.statCard} ${styles.blue}`}>
          <p className={styles.statLabel}>Active staff</p>
          <p className={styles.statValue}>{activeStaff} <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>of {STAFF.length}</span></p>
        </div>
        <div className={`${styles.statCard} ${styles.amber}`}>
          <p className={styles.statLabel}>Revenue this month</p>
          <p className={styles.statValue}>{fmt(thisMonth)}</p>
          <p className={`${styles.statTrend} ${revenueUp ? styles.trendUp : styles.trendDown}`}>
            {revenueUp ? <TrendingUp size={11} strokeWidth={2.5} style={{ verticalAlign: '-1px' }} /> : <TrendingDown size={11} strokeWidth={2.5} style={{ verticalAlign: '-1px' }} />}
            {' '}{Math.abs(((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1)}% vs last month
          </p>
        </div>
        <div className={`${styles.statCard} ${styles.purple}`}>
          <p className={styles.statLabel}>Departments</p>
          <p className={styles.statValue}>{DEPARTMENTS.length}</p>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.mainCol}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Revenue, last 6 months</h2>
            </div>
            <div className={styles.chartWrap}>
              {REVENUE.map((r) => (
                <div key={r.month} className={styles.barCol}>
                  <div className={styles.bar} style={{ height: `${(r.amount / maxRevenue) * 100}%` }} />
                  <span className={styles.barLabel}>{r.month}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Staff directory</h2>
              <span className={styles.cardCount}>{STAFF.length} members</span>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {STAFF.map((s) => (
                  <tr key={s.name}>
                    <td>
                      <p className={styles.staffName}>{s.name}</p>
                      <p className={styles.staffRole}>{s.role}</p>
                    </td>
                    <td>{s.dept}</td>
                    <td><span className={`${styles.pill} ${STAFF_PILL[s.status]}`}>{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.sideCol}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Department load</h2>
            </div>
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

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Recent activity</h2>
            </div>
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
      </div>
    </div>
  );
}