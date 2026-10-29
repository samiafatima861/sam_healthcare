'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Phone, Mail, ArrowRight, Users, HeartPulse, CalendarClock, Stethoscope } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { toISO, initials, titleCase, byDateTime, prettyDate } from '../../../lib/appointmentUtils';
import styles from '../../../assets/styles/DoctorPages.module.css';

const TABS = ['All', 'New', 'Returning', 'Upcoming'];

const digits = (s) => (s || '').replace(/\D/g, '');
const keyOf = (a) => digits(a.patient_phone) || (a.patient_name || '').trim().toLowerCase();

export default function DoctorPatients() {
  const [appointments, setAppointments] = useState([]);
  const [rxCounts, setRxCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [today, setToday] = useState(null);
  const [tab, setTab] = useState('All');
  const [query, setQuery] = useState('');

  useEffect(() => {
    setToday(toISO(new Date()));

    async function load() {
      const [appts, rx] = await Promise.all([
        supabase.from('appointments').select('*').order('appointment_date', { ascending: true }),
        supabase.from('prescriptions').select('patient_phone'),
      ]);

      if (appts.error) setError(appts.error.message);
      else setAppointments(appts.data || []);

      // the prescriptions table may not exist yet, so ignore its errors
      if (!rx.error) {
        const counts = {};
        (rx.data || []).forEach((r) => {
          const k = digits(r.patient_phone);
          counts[k] = (counts[k] || 0) + 1;
        });
        setRxCounts(counts);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (!today) {
    return <div className={styles.wrap}><p className={styles.subtitle}>Loading...</p></div>;
  }

  /* ----- build one record per patient ----- */
  const grouped = {};
  appointments.forEach((a) => {
    const k = keyOf(a);
    if (!grouped[k]) grouped[k] = [];
    grouped[k].push(a);
  });

  const patients = Object.keys(grouped).map((k) => {
    const sorted = [...grouped[k]].sort(byDateTime);
    const real = sorted.filter((a) => a.status !== 'Cancelled');
    const latest = sorted[sorted.length - 1];
    const upcoming = real.filter((a) => a.appointment_date >= today && a.status !== 'Completed');
    const past = real.filter((a) => a.appointment_date < today || a.status === 'Completed');
    const nextAppt = upcoming[0] || null;
    const lastVisit = past[past.length - 1] || null;
    const departments = [...new Set(real.map((a) => titleCase(a.department)))];

    return {
      key: k,
      name: latest.patient_name,
      phone: latest.patient_phone,
      email: sorted.map((a) => a.patient_email).filter(Boolean).pop() || '',
      visits: real.length,
      departments,
      lastVisit,
      nextAppt,
      activity: latest.appointment_date,
      openId: (nextAppt || latest).id,
      rx: rxCounts[digits(latest.patient_phone)] || 0,
      live: real.some((a) => a.status === 'In consultation'),
    };
  }).sort((a, b) => b.activity.localeCompare(a.activity) || a.name.localeCompare(b.name));

  const matchesTab = (p, t) =>
    t === 'All' ||
    (t === 'New' && p.visits <= 1) ||
    (t === 'Returning' && p.visits >= 2) ||
    (t === 'Upcoming' && !!p.nextAppt);

  const q = query.trim().toLowerCase();
  const shown = patients.filter(
    (p) =>
      matchesTab(p, tab) &&
      (!q || [p.name, p.phone, p.email].some((v) => (v || '').toLowerCase().includes(q)))
  );

  const stats = {
    total: patients.length,
    fresh: patients.filter((p) => p.visits <= 1).length,
    returning: patients.filter((p) => p.visits >= 2).length,
    upcoming: patients.filter((p) => p.nextAppt).length,
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h1 className={styles.title}>Patients</h1>
        <p className={styles.subtitle}>
          {loading ? 'Loading patients...' : 'Everyone who has booked with you, built from real appointments.'}
        </p>
      </div>

      {error && <p className={styles.flashError}>Could not load patients: {error}</p>}

      <div className={styles.statRow}>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.toneTeal}`}><Users size={20} strokeWidth={2} /></span>
          <div><p className={styles.statLabel}>Total patients</p><p className={styles.statValue}>{stats.total}</p></div>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.toneBlue}`}><Stethoscope size={20} strokeWidth={2} /></span>
          <div><p className={styles.statLabel}>New</p><p className={styles.statValue}>{stats.fresh}</p></div>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.toneGreen}`}><HeartPulse size={20} strokeWidth={2} /></span>
          <div><p className={styles.statLabel}>Returning</p><p className={styles.statValue}>{stats.returning}</p></div>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.toneAmber}`}><CalendarClock size={20} strokeWidth={2} /></span>
          <div><p className={styles.statLabel}>With upcoming visit</p><p className={styles.statValue}>{stats.upcoming}</p></div>
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
              <span className={styles.tabCount}>{patients.filter((p) => matchesTab(p, t)).length}</span>
            </button>
          ))}
        </div>

        <div className={styles.searchBox}>
          <Search size={15} strokeWidth={2} className={styles.searchIcon} />
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search name, phone or email"
            aria-label="Search patients"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {shown.length === 0 ? (
        <div className={styles.card}>
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>{loading ? 'Loading...' : 'No patients found'}</p>
            {!loading && <p className={styles.emptyText}>Try another filter or clear the search.</p>}
          </div>
        </div>
      ) : (
        <div className={styles.pGrid}>
          {shown.map((p) => (
            <article key={p.key} className={styles.pCard}>
              <div className={styles.pTop}>
                <span className={styles.pAvatar}>{initials(p.name)}</span>
                <div className={styles.pWho}>
                  <p className={styles.pName}>{p.name}</p>
                  <p className={styles.pPhone}>{p.phone}</p>
                </div>
                {p.live && <span className={`${styles.chip} ${styles.chipLive}`}>In consultation</span>}
              </div>

              <div className={styles.pTags}>
                {p.departments.slice(0, 3).map((d) => <span key={d} className={styles.tag}>{d}</span>)}
              </div>

              <dl className={styles.pStats}>
                <div><dt>Visits</dt><dd>{p.visits}</dd></div>
                <div><dt>Prescriptions</dt><dd>{p.rx}</dd></div>
                <div><dt>Last visit</dt><dd>{p.lastVisit ? prettyDate(p.lastVisit.appointment_date, { day: 'numeric', month: 'short' }) : 'None yet'}</dd></div>
                <div><dt>Next visit</dt><dd>{p.nextAppt ? prettyDate(p.nextAppt.appointment_date, { day: 'numeric', month: 'short' }) : 'None booked'}</dd></div>
              </dl>

              <div className={styles.pActions}>
                <Link href={`/dashboard/doctor/consultation/${p.openId}`} className={`${styles.btn} ${styles.btnPrimary}`}>
                  Open record <ArrowRight size={13} strokeWidth={2.5} />
                </Link>
                <a href={`tel:${(p.phone || '').replace(/[^\d+]/g, '')}`} className={styles.btn} aria-label="Call patient">
                  <Phone size={14} strokeWidth={2.25} />
                </a>
                {p.email && (
                  <a href={`mailto:${p.email}`} className={styles.btn} aria-label="Email patient">
                    <Mail size={14} strokeWidth={2.25} />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}