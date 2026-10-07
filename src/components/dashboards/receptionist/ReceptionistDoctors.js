import { Stethoscope } from 'lucide-react';
import styles from '../../../assets/styles/ReceptionistDashboard.module.css';

const DOCTORS = [
  { name: 'Dr. Priya Sharma', specialty: 'General Physician', status: 'With patient', seenToday: 6 },
  { name: 'Dr. Arjun Mehta', specialty: 'Cardiologist', status: 'Available', seenToday: 3 },
  { name: 'Dr. Neha Verma', specialty: 'Dermatologist', status: 'Available', seenToday: 5 },
  { name: 'Dr. Omar Siddiqui', specialty: 'Orthopedist', status: 'On leave', seenToday: 0 },
];

const DOCTOR_PILL = { Available: styles.pillDone, 'With patient': styles.pillWithDoctor, 'On leave': styles.pillOnLeave };
const initials = (name) => name.replace('Dr. ', '').split(' ').map((p) => p[0]).join('').slice(0, 2);

export default function ReceptionistDoctors() {
  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Doctor availability</h1>
          <p className={styles.subtitle}>Who's in, who's free, who's out today.</p>
        </div>
      </div>

      <div className={styles.card}>
        {DOCTORS.map((d) => (
          <div key={d.name} className={styles.doctorRow}>
            <span className={styles.doctorAvatar}>{initials(d.name)}</span>
            <div className={styles.doctorInfo}>
              <p className={styles.doctorName}>{d.name}</p>
              <p className={styles.doctorMeta}>
                <Stethoscope size={11} strokeWidth={2} style={{ verticalAlign: '-1px', marginRight: 3 }} />
                {d.specialty} · {d.seenToday} seen today
              </p>
            </div>
            <span className={`${styles.pill} ${DOCTOR_PILL[d.status]}`}>{d.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}