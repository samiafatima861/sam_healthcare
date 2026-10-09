import { CalendarClock } from 'lucide-react';
import styles from '../../../assets/styles/StaffDashboards.module.css';

const SCHEDULE = [
  { id: 1, patient: 'Bilal Ahmed', type: 'Follow-up', time: '4:00 PM', status: 'Completed' },
  { id: 2, patient: 'Sana Khan', type: 'New consultation', time: '4:20 PM', status: 'Upcoming' },
  { id: 3, patient: 'Imran Farooq', type: 'Follow-up', time: '4:45 PM', status: 'Upcoming' },
  { id: 4, patient: 'Hina Tariq', type: 'BP review', time: '5:10 PM', status: 'Upcoming' },
  { id: 5, patient: 'Zoya Raheel', type: 'Consultation', time: '2:30 PM', status: 'Cancelled' },
];

const SCHEDULE_PILL = { Upcoming: styles.pillTeal, Completed: styles.pillGreen, Cancelled: styles.pillDanger };

export default function DoctorSchedule() {
  const upcoming = SCHEDULE.filter((s) => s.status === 'Upcoming').length;

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Today's schedule</h1>
          <p className={styles.subtitle}>{upcoming} consultations remaining today.</p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Appointments</h2>
          <span className={styles.cardCount}>{SCHEDULE.length} today</span>
        </div>
        {SCHEDULE.map((s) => (
          <div key={s.id} className={styles.row}>
            <span className={`${styles.rowIcon} ${styles.rowIconTeal}`}><CalendarClock size={17} strokeWidth={2} /></span>
            <div className={styles.rowInfo}>
              <p className={styles.rowTitle}>{s.patient}</p>
              <p className={styles.rowSub}>{s.type}</p>
            </div>
            <span className={styles.rowMeta}>{s.time}</span>
            <span className={`${styles.pill} ${SCHEDULE_PILL[s.status]}`}>{s.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}