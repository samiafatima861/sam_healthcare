'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, X, CalendarCheck, CalendarClock, Inbox, Users } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { toISO, initials, titleCase, fmtTime, byDateTime, prettyDate } from '../../../lib/appointmentUtils';
import { digitsOnly } from '../../../lib/masks';
import { useNewSince } from '../../../lib/useNewSince';
import SearchInput from '../../SearchInput';
import styles from '../../../assets/styles/DoctorPages.module.css';

const TABS = ['All', 'Pending', 'Confirmed', 'In consultation', 'Completed', 'Cancelled'];

const STATUS_CHIP = {
  Pending: styles.chipPending,
  Confirmed: styles.chipConfirmed,
  'In consultation': styles.chipLive,
  Completed: styles.chipDone,
  Cancelled: styles.chipCancelled,
};

function dayLabel(iso, today) {
  const diff = Math.round((new Date(`${iso}T00:00:00`) - new Date(`${today}T00:00:00`)) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  return prettyDate(iso, { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function DoctorSchedule() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [today, setToday] = useState(null);
  const [tab, setTab] = useState('All');
  const [query, setQuery] = useState('');

  // marks bookings made since the doctor last looked at this page
  const { isNew, markAllSeen } = useNewSince('appointments_doctor');

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

    // a new booking for this doctor appears without a refresh
    const channel = supabase
      .channel('doctor-schedule')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'appointments' }, (payload) => {
        setAppointments((list) => (list.some((x) => x.id === payload.new.id) ? list : [...list, payload.new]));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function updateStatus(id, status) {
    setBusyId(id);
    setActionError('');
    const { data, error: err } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)
      .select();
    setBusyId(null);

    if (err || !data || data.length === 0) {
      setActionError('Could not update this appointment. Check that the update policy exists in Supabase.');
      return;
    }
    setAppointments((list) => list.map((a) => (a.id === id ? { ...a, status } : a)));
  }

  if (!today) {
    return <div className={styles.wrap}><p className={styles.subtitle}>Loading...</p></div>;
  }

  /* ----- derived data ----- */
  const countFor = (s) => (s === 'All' ? appointments.length : appointments.filter((a) => a.status === s).length);
  const openStatuses = ['Pending', 'Confirmed', 'In consultation'];

  const stats = {
    today: appointments.filter((a) => a.appointment_date === today && a.status !== 'Cancelled').length,
    pending: countFor('Pending'),
    upcoming: appointments.filter((a) => a.appointment_date >= today && openStatuses.includes(a.status)).length,
    completed: countFor('Completed'),
  };

  const newCount = appointments.filter(isNew).length;

  const q = query.trim().toLowerCase();
  const qDigits = digitsOnly(query);
  const phoneSearch = qDigits.length >= 3 && !/\p{L}/u.test(query);

  const filtered = appointments.filter((a) => {
    if (tab !== 'All' && a.status !== tab) return false;
    if (!q) return true;
    if (phoneSearch) return digitsOnly(a.patient_phone).includes(qDigits);
    return [a.patient_name, a.department, a.doctor_name, a.reason].some((v) => (v || '').toLowerCase().includes(q));
  });

  const byDate = {};
  filtered.forEach((a) => {
    if (!byDate[a.appointment_date]) byDate[a.appointment_date] = [];
    byDate[a.appointment_date].push(a);
  });
  const dates = Object.keys(byDate);
  const orderedDates = [
    ...dates.filter((d) => d >= today).sort(),
    ...dates.filter((d) => d < today).sort().reverse(),
  ];

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h1 className={styles.title}>Schedule</h1>
        <p className={styles.subtitle}>
          {loading ? 'Loading appointments...' : 'Every booking, grouped by day. Accept requests and start consultations from here.'}
        </p>
      </div>

      {error && <p className={styles.flashError}>Could not load appointments: {error}</p>}
      {actionError && <p className={styles.flashError}>{actionError}</p>}

      {newCount > 0 && (
        <div className={styles.newBanner}>
          <span><strong>{newCount}</strong> new booking{newCount === 1 ? '' : 's'} since your last visit</span>
          <button type="button" className={styles.btn} onClick={markAllSeen}>Mark all as seen</button>
        </div>
      )}

      <div className={styles.statRow}>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.toneTeal}`}><CalendarCheck size={20} strokeWidth={2} /></span>
          <div><p className={styles.statLabel}>Today</p><p className={styles.statValue}>{stats.today}</p></div>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.toneAmber}`}><Inbox size={20} strokeWidth={2} /></span>
          <div><p className={styles.statLabel}>Pending</p><p className={styles.statValue}>{stats.pending}</p></div>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.toneBlue}`}><CalendarClock size={20} strokeWidth={2} /></span>
          <div><p className={styles.statLabel}>Upcoming</p><p className={styles.statValue}>{stats.upcoming}</p></div>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.toneGreen}`}><Users size={20} strokeWidth={2} /></span>
          <div><p className={styles.statLabel}>Completed</p><p className={styles.statValue}>{stats.completed}</p></div>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.tabs}>
          {TABS.map((t) => (
            <button
              key={t} type="button"
              className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
              onClick={() => setTab(t)}
            >
              {t}
              <span className={styles.tabCount}>{countFor(t)}</span>
            </button>
          ))}
        </div>

        <SearchInput
          mask="smart" width={280} label="Search appointments"
          placeholder="Patient name or phone number"
          value={query} onChange={setQuery}
        />
      </div>

      {orderedDates.length === 0 ? (
        <div className={styles.card}>
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>{loading ? 'Loading...' : 'No appointments found'}</p>
            {!loading && <p className={styles.emptyText}>Try another status or clear the search.</p>}
          </div>
        </div>
      ) : (
        orderedDates.map((date) => {
          const label = dayLabel(date, today);
          const relative = ['Today', 'Tomorrow', 'Yesterday'].includes(label);
          return (
            <section key={date} className={`${styles.card} ${date < today ? styles.groupPast : ''}`}>
              <div className={styles.groupHead}>
                <span className={styles.groupLabel}>{label}</span>
                {relative && <span className={styles.groupDate}>{prettyDate(date)}</span>}
                <span className={styles.groupCount}>{byDate[date].length}</span>
              </div>

              <ul>
                {byDate[date].sort(byDateTime).map((a) => {
                  const busy = busyId === a.id;
                  const patientHref = `/dashboard/doctor/consultation/${a.id}`;
                  return (
                    <li key={a.id} className={styles.row}>
                      <span className={styles.timeCol}>{fmtTime(a.appointment_time)}</span>
                      <span className={styles.avatar}>{initials(a.patient_name)}</span>
                      <div className={styles.info}>
                        <Link href={patientHref} className={styles.nameLink}>{a.patient_name}</Link>
                        {isNew(a) && <span className={styles.pillNew}>New</span>}
                        <p className={styles.meta}>
                          {titleCase(a.department)} · {a.doctor_name}{a.reason ? ` · ${a.reason}` : ''}
                        </p>
                      </div>
                      <span className={`${styles.chip} ${STATUS_CHIP[a.status] || styles.chipPending}`}>{a.status}</span>

                      <div className={styles.actions}>
                        {a.status === 'Pending' && (
                          <>
                            <button type="button" disabled={busy} className={`${styles.btn} ${styles.btnAccept}`} onClick={() => updateStatus(a.id, 'Confirmed')}>
                              <Check size={14} strokeWidth={2.75} /> Accept
                            </button>
                            <button type="button" disabled={busy} className={`${styles.btn} ${styles.btnDecline}`} onClick={() => updateStatus(a.id, 'Cancelled')}>
                              <X size={14} strokeWidth={2.75} /> Decline
                            </button>
                          </>
                        )}
                        {a.status === 'Confirmed' && (
                          <Link href={patientHref} className={`${styles.btn} ${styles.btnPrimary}`}>Start</Link>
                        )}
                        {a.status === 'In consultation' && (
                          <Link href={patientHref} className={`${styles.btn} ${styles.btnPrimary}`}>Continue</Link>
                        )}
                        {a.status === 'Completed' && (
                          <Link href={patientHref} className={styles.btn}>View</Link>
                        )}
                        {a.status === 'Cancelled' && (
                          <button type="button" disabled={busy} className={styles.btn} onClick={() => updateStatus(a.id, 'Pending')}>
                            Restore
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
}