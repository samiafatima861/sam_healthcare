'use client';

import { useState } from 'react';
import { Scissors } from 'lucide-react';
import styles from '../../../assets/styles/StaffDashboards.module.css';

const INITIAL_SCHEDULE = [
  { id: 1, patient: 'Bilal Ahmed', procedure: 'Appendectomy', surgeon: 'Dr. Omar Siddiqui', room: 'OT 1', time: '5:00 PM', status: 'Scheduled' },
  { id: 2, patient: 'Imran Farooq', procedure: 'Knee arthroscopy', surgeon: 'Dr. Omar Siddiqui', room: 'OT 2', time: '3:00 PM', status: 'In progress' },
  { id: 3, patient: 'Zoya Raheel', procedure: 'Gallbladder removal', surgeon: 'Dr. Arjun Mehta', room: 'OT 1', time: '11:00 AM', status: 'Completed' },
];

const NEXT_STATUS = { Scheduled: 'In progress', 'In progress': 'Completed' };
const SCHEDULE_PILL = { Scheduled: styles.pillWarn, 'In progress': styles.pillTeal, Completed: styles.pillGreen };

export default function OtSchedule() {
  const [schedule, setSchedule] = useState(INITIAL_SCHEDULE);

  function advance(id) {
    setSchedule((list) =>
      list.map((s) => (s.id === id && NEXT_STATUS[s.status] ? { ...s, status: NEXT_STATUS[s.status] } : s))
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Surgery schedule</h1>
          <p className={styles.subtitle}>{schedule.length} procedures today.</p>
        </div>
      </div>

      <div className={styles.card}>
        {schedule.map((s) => (
          <div key={s.id} className={styles.row}>
            <span className={`${styles.rowIcon} ${styles.rowIconTeal}`}><Scissors size={17} strokeWidth={2} /></span>
            <div className={styles.rowInfo}>
              <p className={styles.rowTitle}>{s.procedure}</p>
              <p className={styles.rowSub}>{s.patient} · {s.surgeon} · {s.room}</p>
            </div>
            <span className={styles.rowMeta}>{s.time}</span>
            <span className={`${styles.pill} ${SCHEDULE_PILL[s.status]}`}>{s.status}</span>
            {NEXT_STATUS[s.status] && (
              <button type="button" className={styles.btnGhost} onClick={() => advance(s.id)}>
                Mark {NEXT_STATUS[s.status].toLowerCase()}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}