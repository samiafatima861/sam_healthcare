'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { toISO, initials, titleCase, fmtTime, byDateTime, prettyDate } from '../../../lib/appointmentUtils';
import styles from '../../../assets/styles/DoctorVisit.module.css';

const STATUS_CHIP = {
  Pending: styles.chipPending,
  Confirmed: styles.chipConfirmed,
  'In consultation': styles.chipLive,
  Completed: styles.chipDone,
  Cancelled: styles.chipCancelled,
};

const TABS = [
  { key: 'today', label: 'Today' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'done', label: 'Completed' },
];

const EMPTY = {
  today: 'No patients waiting today.',
  upcoming: 'No upcoming appointments.',
  done: 'No completed visits yet.',
};

export default function DoctorConsultation() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [today, setToday] = useState(null);
  const [tab, setTab] = useState('today');

  useEffect(() => {
    setToday(toISO(new Date()));
    supabase
      .from('appointments')
      .select('*')
      .order('appointment_date', { ascending: true })
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else setAppointments(data || []);
        setLoading(false);
      });
  }, []);

  if (!today) {
    return <div className={styles.wrap}><p className={styles.subtitle}>Loading...</p></div>;
  }

  const open = appointments.filter((a) => a.status !== 'Cancelled' && a.status !== 'Completed');
  const lists = {
    today: open.filter((a) => a.status === 'In consultation' || a.appointment_date === today).sort(byDateTime),
    upcoming: open.filter((a) => a.status !== 'In consultation' && a.appointment_date > today).sort(byDateTime),
    done: appointments.filter((a) => a.status === 'Completed').sort((a, b) => byDateTime(b, a)),
  };
  const shown = lists[tab];

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h1 className={styles.title}>Patient queue</h1>
        <p className={styles.subtitle}>
          {loading ? 'Loading appointments...' : 'Open a patient to see their details and write a prescription.'}
        </p>
      </div>

      {error && <p className={styles.flashError}>Could not load appointments: {error}</p>}

      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t.key} type="button"
            className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            <span className={styles.tabCount}>{lists[t.key].length}</span>
          </button>
        ))}
      </div>

      <section className={styles.card}>
        {shown.length === 0 ? (
          <p className={styles.emptyText}>{EMPTY[tab]}</p>
        ) : (
          <ul>
            {shown.map((a) => (
              <li key={a.id} className={styles.qRow}>
                <span className={styles.avatar}>{initials(a.patient_name)}</span>
                <div className={styles.qInfo}>
                  <p className={styles.qName}>{a.patient_name}</p>
                  <p className={styles.qMeta}>
                    {titleCase(a.department)} · {a.doctor_name}{a.reason ? ` · ${a.reason}` : ''}
                  </p>
                </div>
                <div className={styles.qWhen}>
                  <p className={styles.qDate}>{prettyDate(a.appointment_date, { day: 'numeric', month: 'short' })}</p>
                  <p className={styles.qTime}>{fmtTime(a.appointment_time)}</p>
                </div>
                <span className={`${styles.chip} ${STATUS_CHIP[a.status] || styles.chipPending}`}>{a.status}</span>
                <Link href={`/dashboard/doctor/consultation/${a.id}`} className={styles.qBtn}>
                  {a.status === 'In consultation' ? 'Continue' : a.status === 'Completed' ? 'View' : 'Start'}
                  <ArrowRight size={13} strokeWidth={2.5} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}