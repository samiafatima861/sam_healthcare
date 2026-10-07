'use client';

import { useState } from 'react';
import { Scissors } from 'lucide-react';
import styles from '../../../assets/styles/StaffDashboards.module.css';

const INITIAL_SCHEDULE = [
  { id: 1, patient: 'Bilal Ahmed', procedure: 'Appendectomy', surgeon: 'Dr. Omar Siddiqui', room: 'OT 1', time: '5:00 PM', status: 'Scheduled' },
  { id: 2, patient: 'Imran Farooq', procedure: 'Knee arthroscopy', surgeon: 'Dr. Omar Siddiqui', room: 'OT 2', time: '3:00 PM', status: 'In progress' },
  { id: 3, patient: 'Zoya Raheel', procedure: 'Gallbladder removal', surgeon: 'Dr. Arjun Mehta', room: 'OT 1', time: '11:00 AM', status: 'Completed' },
];

const ROOMS = [
  { name: 'OT 1', status: 'In use', note: 'Appendectomy at 5:00 PM' },
  { name: 'OT 2', status: 'In use', note: 'Knee arthroscopy in progress' },
  { name: 'OT 3', status: 'Available', note: 'Free until further notice' },
];

const NEXT_STATUS = { Scheduled: 'In progress', 'In progress': 'Completed' };
const SCHEDULE_PILL = { Scheduled: styles.pillWarn, 'In progress': styles.pillTeal, Completed: styles.pillGreen };
const ROOM_PILL = { Available: styles.pillGreen, 'In use': styles.pillWarn, Cleaning: styles.pillGray };

export default function OtCoordinatorDashboard() {
  const [schedule, setSchedule] = useState(INITIAL_SCHEDULE);

  function advance(id) {
    setSchedule((list) =>
      list.map((s) => (s.id === id && NEXT_STATUS[s.status] ? { ...s, status: NEXT_STATUS[s.status] } : s))
    );
  }

  const inProgress = schedule.filter((s) => s.status === 'In progress').length;
  const scheduled = schedule.filter((s) => s.status === 'Scheduled').length;

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>OT coordination</h1>
          <p className={styles.subtitle}>Today's surgery schedule and operating room status.</p>
        </div>
      </div>

      <div className={styles.statRow}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Surgeries today</p>
          <p className={styles.statValue}>{schedule.length}</p>
        </div>
        <div className={`${styles.statCard} ${styles.amber}`}>
          <p className={styles.statLabel}>In progress</p>
          <p className={styles.statValue}>{inProgress}</p>
        </div>
        <div className={`${styles.statCard} ${styles.blue}`}>
          <p className={styles.statLabel}>Scheduled, not started</p>
          <p className={styles.statValue}>{scheduled}</p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Surgery schedule</h2>
        </div>
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

      <div className={styles.card} style={{ marginTop: 20 }}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Room status</h2>
        </div>
        <div className={styles.roomGrid}>
          {ROOMS.map((r) => (
            <div key={r.name} className={styles.roomCard}>
              <p className={styles.roomName}>{r.name}</p>
              <span className={`${styles.pill} ${ROOM_PILL[r.status]}`} style={{ marginTop: 6, display: 'inline-block' }}>
                {r.status}
              </span>
              <p className={styles.roomMeta}>{r.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}