import styles from '../../../assets/styles/AdminDashboard.module.css';

const STAFF = [
  { name: 'Dr. Priya Sharma', role: 'General Physician', dept: 'General Medicine', status: 'Active' },
  { name: 'Dr. Arjun Mehta', role: 'Cardiologist', dept: 'Cardiology', status: 'Active' },
  { name: 'Dr. Neha Verma', role: 'Dermatologist', dept: 'Dermatology', status: 'Active' },
  { name: 'Dr. Omar Siddiqui', role: 'Orthopedist', dept: 'Orthopedics', status: 'On leave' },
  { name: 'Fatima Noor', role: 'Receptionist', dept: 'Front desk', status: 'Active' },
  { name: 'Usman Ali', role: 'Billing officer', dept: 'Billing', status: 'Active' },
  { name: 'Sarah Malik', role: 'Lab technician', dept: 'Laboratory', status: 'Inactive' },
];

const STAFF_PILL = { Active: styles.pillActive, 'On leave': styles.pillLeave, Inactive: styles.pillInactive };

export default function AdminStaff() {
  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Staff directory</h1>
          <p className={styles.subtitle}>Every staff member across all departments.</p>
        </div>
      </div>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr><th>Name</th><th>Department</th><th>Status</th></tr>
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
  );
}