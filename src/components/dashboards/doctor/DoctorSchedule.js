'use client';

import { useEffect, useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import styles from '../../../assets/styles/StaffDashboards.module.css';

const SCHEDULE_PILL = {
  Pending: styles.pillWarn,
  Confirmed: styles.pillTeal,
  Completed: styles.pillGreen,
  Cancelled: styles.pillDanger,
};

export default function DoctorSchedule() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAppointments() {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('appointment_date', { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setSchedule(data);
      }
      setLoading(false);
    }

    fetchAppointments();
  }, []);

  const pendingCount = schedule.filter((s) => s.status === 'Pending').length;

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Appointments</h1>
          <p className={styles.subtitle}>
            {loading ? 'Loading...' : `${pendingCount} pending confirmation.`}
          </p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Booked appointments</h2>
          <span className={styles.cardCount}>{schedule.length} total</span>
        </div>

        {error && <p style={{ color: 'var(--danger-fg)', fontSize: 'var(--fs-sm)' }}>Error: {error}</p>}
        {!loading && !error && schedule.length === 0 && (
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)', padding: '20px 0' }}>
            No appointments booked yet.
          </p>
        )}

        {schedule.map((s) => (
          <div key={s.id} className={styles.row}>
            <span className={`${styles.rowIcon} ${styles.rowIconTeal}`}><CalendarClock size={17} strokeWidth={2} /></span>
            <div className={styles.rowInfo}>
              <p className={styles.rowTitle}>{s.patient_name}</p>
              <p className={styles.rowSub}>{s.department} · {s.doctor_name}</p>
            </div>
            <span className={styles.rowMeta}>{s.appointment_date} at {s.appointment_time}</span>
            <span className={`${styles.pill} ${SCHEDULE_PILL[s.status] || styles.pillGray}`}>{s.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}