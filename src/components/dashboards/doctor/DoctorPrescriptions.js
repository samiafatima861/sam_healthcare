'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Pill, FileText, Users, CalendarClock } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { toISO, initials, prettyDate } from '../../../lib/appointmentUtils';
import styles from '../../../assets/styles/DoctorPages.module.css';
import SearchInput from '../../SearchInput';

const TABS = ['All', 'This week', 'This month'];

const digits = (s) => (s || '').replace(/\D/g, '');

export default function DoctorPrescriptions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [setupNote, setSetupNote] = useState('');
  const [today, setToday] = useState(null);
  const [tab, setTab] = useState('All');
  const [query, setQuery] = useState('');

  useEffect(() => {
    setToday(toISO(new Date()));
    supabase
      .from('prescriptions')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setSetupNote('Prescriptions are not set up yet. Run the prescriptions SQL in Supabase, then refresh.');
        else setItems(data || []);
        setLoading(false);
      });
  }, []);

  if (!today) {
    return <div className={styles.wrap}><p className={styles.subtitle}>Loading...</p></div>;
  }

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoISO = toISO(weekAgo);
  const dateOf = (rx) => (rx.created_at || '').slice(0, 10);

  const inTab = (rx, t) =>
    t === 'All' ||
    (t === 'This week' && dateOf(rx) >= weekAgoISO) ||
    (t === 'This month' && dateOf(rx).startsWith(today.slice(0, 7)));

  const q = query.trim().toLowerCase();
  const shown = items.filter(
    (rx) =>
      inTab(rx, tab) &&
      (!q ||
        [rx.patient_name, rx.diagnosis, rx.doctor_name].some((v) => (v || '').toLowerCase().includes(q)) ||
        (rx.medicines || []).some((m) => (m.name || '').toLowerCase().includes(q)))
  );

  const stats = {
    total: items.length,
    month: items.filter((rx) => inTab(rx, 'This month')).length,
    patients: new Set(items.map((rx) => digits(rx.patient_phone) || rx.patient_name)).size,
    medicines: items.reduce((sum, rx) => sum + (rx.medicines || []).length, 0),
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h1 className={styles.title}>Prescriptions</h1>
        <p className={styles.subtitle}>
          {loading ? 'Loading prescriptions...' : 'Every prescription you have written. Create new ones from a patient\'s page.'}
        </p>
      </div>

      {setupNote && <p className={styles.flashError}>{setupNote}</p>}

      <div className={styles.statRow}>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.toneTeal}`}><FileText size={20} strokeWidth={2} /></span>
          <div><p className={styles.statLabel}>Total prescriptions</p><p className={styles.statValue}>{stats.total}</p></div>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.toneBlue}`}><CalendarClock size={20} strokeWidth={2} /></span>
          <div><p className={styles.statLabel}>This month</p><p className={styles.statValue}>{stats.month}</p></div>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.toneGreen}`}><Users size={20} strokeWidth={2} /></span>
          <div><p className={styles.statLabel}>Patients</p><p className={styles.statValue}>{stats.patients}</p></div>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.toneAmber}`}><Pill size={20} strokeWidth={2} /></span>
          <div><p className={styles.statLabel}>Medicines prescribed</p><p className={styles.statValue}>{stats.medicines}</p></div>
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
              <span className={styles.tabCount}>{items.filter((rx) => inTab(rx, t)).length}</span>
            </button>
          ))}
        </div>

        <SearchInput width={260} label="Search staff" placeholder="Search name, role or email" value={query} onChange={setQuery} />
      </div>

      {shown.length === 0 ? (
        <div className={styles.card}>
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>{loading ? 'Loading...' : 'No prescriptions found'}</p>
            {!loading && (
              <p className={styles.emptyText}>
                {items.length === 0
                  ? 'Open a patient from the Consultation page to write the first one.'
                  : 'Try another period or clear the search.'}
              </p>
            )}
          </div>
        </div>
      ) : (
        shown.map((rx) => (
          <article key={rx.id} className={styles.card}>
            <div className={styles.rxHead}>
              <span className={styles.avatar}>{initials(rx.patient_name)}</span>
              <div className={styles.info}>
                <p className={styles.nameLink}>{rx.patient_name}</p>
                <p className={styles.meta}>{rx.patient_phone}</p>
              </div>
              <div className={styles.rxWhen}>
                <p className={styles.rxDate}>{prettyDate(dateOf(rx))}</p>
                <p className={styles.rxTime}>
                  {new Date(rx.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </p>
              </div>
            </div>

            <div className={styles.rxBody}>
              {rx.diagnosis && <span className={styles.rxDx}>Diagnosis: {rx.diagnosis}</span>}

              <div className={styles.medTable}>
                <div className={styles.medTableHead}>
                  <span>Medicine</span><span>Dosage</span><span>Frequency</span><span>Duration</span>
                </div>
                {(rx.medicines || []).map((m, i) => (
                  <div key={i} className={styles.medTableRow}>
                    <strong>{m.name}</strong>
                    <span>{m.dosage || '—'}</span>
                    <span>{m.frequency || '—'}</span>
                    <span>{m.duration || '—'}</span>
                  </div>
                ))}
              </div>

              {rx.instructions && (
                <div className={styles.rxNote}>
                  <span>Instructions</span>
                  {rx.instructions}
                </div>
              )}

              <div className={styles.rxFoot}>
                <span className={styles.rxDoctor}>Prescribed by {rx.doctor_name || 'doctor'}</span>
                {rx.appointment_id && (
                  <Link href={`/dashboard/doctor/consultation/${rx.appointment_id}`} className={styles.rxLink}>
                    Open patient <ArrowRight size={13} strokeWidth={2.5} />
                  </Link>
                )}
              </div>
            </div>
          </article>
        ))
      )}
    </div>
  );
}