'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarPlus, CalendarClock, CalendarX, FileText, RefreshCw } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { toISO, titleCase, fmtTime, byDateTime, prettyDate } from '../../../lib/appointmentUtils';
import { timeAgo } from '../../../lib/adminUtils';
import { formatSlot } from '../../../lib/time';
import styles from '../../../assets/styles/PortalPages.module.css';

const OPEN = ['Pending', 'Confirmed', 'In consultation'];

const PILL = {
  Pending: styles.pillWarn,
  Confirmed: styles.pillTeal,
  'In consultation': styles.pillTeal,
  Completed: styles.pillGreen,
  Cancelled: styles.pillDanger,
};

const NOTE = {
  Pending: 'Waiting for the hospital to confirm your request.',
  Confirmed: 'Confirmed. Please arrive a few minutes early.',
  'In consultation': 'Your consultation is in progress.',
  Completed: 'This visit is complete.',
  Cancelled: 'This appointment was cancelled. You can book another time.',
};

const box = { fontSize: 'var(--fs-xs)', fontWeight: 600, padding: '11px 14px', borderRadius: 'var(--radius-sm)', marginBottom: 14 };
const boxError = { ...box, color: 'var(--danger-fg)', background: 'var(--danger-bg)' };
const boxOk = { ...box, color: 'var(--success-fg)', background: 'var(--success-bg)' };

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(null);
  const [today, setToday] = useState(null);
  const [tab, setTab] = useState('Upcoming');
  const [confirmId, setConfirmId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async (quiet) => {
    if (quiet) setRefreshing(true);

    const [a, p] = await Promise.all([
      supabase.from('my_appointments').select('*').order('created_at', { ascending: false }),
      supabase.from('prescriptions').select('id, appointment_id'),
    ]);

    if (a.error) setError('Could not load your appointments. Make sure the patient SQL was run in Supabase.');
    else { setError(''); setAppointments(a.data || []); }
    if (!p.error) setPrescriptions(p.data || []);

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    setToday(toISO(new Date()));
    load(false);

    // pick up the hospital's decisions without a manual refresh
    const timer = setInterval(() => load(true), 30000);
    const onVisible = () => { if (document.visibilityState === 'visible') load(true); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [load]);

  async function cancel(id) {
    setBusyId(id);
    const { data, error: err } = await supabase.rpc('cancel_my_appointment', { p_id: id });
    setBusyId(null);
    setConfirmId(null);

    if (err || data !== true) {
      setMessage({ type: 'error', text: 'Could not cancel this appointment. It may already be in progress.' });
      return;
    }
    setAppointments((list) => list.map((a) => (a.id === id ? { ...a, status: 'Cancelled' } : a)));
    setMessage({ type: 'ok', text: 'Your appointment was cancelled.' });
    setTimeout(() => setMessage(null), 3500);
  }

  if (!today) {
    return <div className={styles.wrap}><p className={styles.subtitle}>Loading...</p></div>;
  }

  const isUpcoming = (a) => OPEN.includes(a.status) && a.appointment_date >= today;
  const upcoming = appointments.filter(isUpcoming).sort(byDateTime);
  const past = appointments.filter((a) => !isUpcoming(a)).sort((x, y) => byDateTime(y, x));
  const shown = tab === 'Upcoming' ? upcoming : past;
  const hasRx = (a) => prescriptions.some((p) => p.appointment_id === a.id);

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Appointments</h1>
          <p className={styles.subtitle}>
            {loading ? 'Loading your appointments...' : 'Your bookings and what the hospital has decided. This page updates by itself.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className={styles.btnGhost} onClick={() => load(true)} disabled={refreshing}>
            <RefreshCw size={13} strokeWidth={2.25} style={{ marginRight: 6, verticalAlign: '-2px' }} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <Link href="/book" className={styles.btn}>
            <CalendarPlus size={16} strokeWidth={2.25} />
            Book appointment
          </Link>
        </div>
      </div>

      {error && <p style={boxError}>{error}</p>}
      {message && <p style={message.type === 'ok' ? boxOk : boxError} role="status">{message.text}</p>}

      <div className={styles.tabs}>
        {['Upcoming', 'Past'].map((t) => (
          <button
            key={t} type="button"
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => setTab(t)}
          >
            {t} ({t === 'Upcoming' ? upcoming.length : past.length})
          </button>
        ))}
      </div>

      <div className={styles.card}>
        {shown.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}><CalendarX size={20} strokeWidth={2} /></span>
            <p className={styles.emptyTitle}>{loading ? 'Loading...' : `No ${tab.toLowerCase()} appointments`}</p>
            <p className={styles.emptyText}>
              {tab === 'Upcoming'
                ? 'Book a visit while signed in and it will show up here.'
                : 'Bookings made before you signed in are not linked to your account.'}
            </p>
          </div>
        ) : (
          shown.map((a) => {
            const slot = formatSlot(a);
            const when = a.appointment_at ? slot.local : `${prettyDate(a.appointment_date)}, ${fmtTime(a.appointment_time)}`;
            const canCancel = isUpcoming(a) && ['Pending', 'Confirmed'].includes(a.status);

            return (
              <div key={a.id} className={styles.row}>
                <span className={`${styles.rowIcon} ${styles.rowIconTeal}`}>
                  <CalendarClock size={17} strokeWidth={2} />
                </span>
                <div className={styles.rowInfo}>
                  <p className={styles.rowTitle}>{a.doctor_name}</p>
                  <p className={styles.rowSub}>{titleCase(a.department)} · {NOTE[a.status] || ''}</p>
                  <p className={styles.rowSub}>
                    {a.status !== 'Pending' && a.updated_at ? `Updated ${timeAgo(a.updated_at)}` : `Booked ${timeAgo(a.created_at)}`}
                  </p>
                </div>
                <div className={styles.rowRight}>
                  <span className={styles.rowMeta}>
                    {when}
                    {a.appointment_at && !slot.sameZone ? ` (${slot.hospital})` : ''}
                  </span>
                  <span className={`${styles.pill} ${PILL[a.status] || styles.pillGray}`}>{a.status}</span>

                  {hasRx(a) && (
                    <Link href="/portal/prescriptions" className={styles.btnGhost}>
                      <FileText size={13} strokeWidth={2} style={{ marginRight: 6, verticalAlign: '-2px' }} />
                      Prescription
                    </Link>
                  )}

                  {canCancel && (confirmId === a.id ? (
                    <>
                      <button type="button" className={styles.btnGhost} onClick={() => setConfirmId(null)}>Keep</button>
                      <button type="button" className={styles.btn} disabled={busyId === a.id} onClick={() => cancel(a.id)}>
                        {busyId === a.id ? 'Cancelling...' : 'Yes, cancel'}
                      </button>
                    </>
                  ) : (
                    <button type="button" className={styles.btnGhost} onClick={() => setConfirmId(a.id)}>Cancel</button>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}