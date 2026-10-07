'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CalendarPlus, CalendarClock, CalendarX } from 'lucide-react';
import styles from '../../../assets/styles/PortalPages.module.css';

const INITIAL = [
  { id: 1, doctor: 'Dr. Priya Sharma', specialty: 'General Physician', date: 'Today, 4:40 PM', status: 'Upcoming' },
  { id: 2, doctor: 'Dr. Arjun Mehta', specialty: 'Cardiologist', date: '2 Oct 2026, 11:00 AM', status: 'Upcoming' },
  { id: 3, doctor: 'Dr. Arjun Mehta', specialty: 'Cardiologist', date: '12 Sep 2026', status: 'Completed' },
  { id: 4, doctor: 'Dr. Neha Verma', specialty: 'Dermatologist', date: '2 Aug 2026', status: 'Completed' },
];

const PILL = { Upcoming: styles.pillTeal, Completed: styles.pillGreen, Cancelled: styles.pillDanger };

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState(INITIAL);
  const [tab, setTab] = useState('Upcoming');

  function cancelAppointment(id) {
    setAppointments((list) => list.map((a) => (a.id === id ? { ...a, status: 'Cancelled' } : a)));
  }

  const shown = appointments.filter((a) =>
    tab === 'Upcoming' ? a.status === 'Upcoming' : a.status !== 'Upcoming'
  );

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Appointments</h1>
          <p className={styles.subtitle}>Manage your upcoming visits and review past ones.</p>
        </div>
        <Link href="/book" className={styles.btn}>
          <CalendarPlus size={16} strokeWidth={2.25} />
          Book appointment
        </Link>
      </div>

      <div className={styles.tabs}>
        {['Upcoming', 'Past'].map((t) => (
          <button
            key={t}
            type="button"
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className={styles.card}>
        {shown.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}><CalendarX size={20} strokeWidth={2} /></span>
            <p className={styles.emptyTitle}>No {tab.toLowerCase()} appointments</p>
            <p className={styles.emptyText}>
              {tab === 'Upcoming' ? 'Book a visit and it will show up here.' : 'Your visit history will appear here once you have one.'}
            </p>
          </div>
        ) : (
          shown.map((a) => (
            <div key={a.id} className={styles.row}>
              <span className={`${styles.rowIcon} ${styles.rowIconTeal}`}>
                <CalendarClock size={17} strokeWidth={2} />
              </span>
              <div className={styles.rowInfo}>
                <p className={styles.rowTitle}>{a.doctor}</p>
                <p className={styles.rowSub}>{a.specialty}</p>
              </div>
              <div className={styles.rowRight}>
                <span className={styles.rowMeta}>{a.date}</span>
                <span className={`${styles.pill} ${PILL[a.status]}`}>{a.status}</span>
                {a.status === 'Upcoming' && (
                  <button type="button" className={styles.btnGhost} onClick={() => cancelAppointment(a.id)}>
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}