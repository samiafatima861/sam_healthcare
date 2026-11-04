'use client';

import { useEffect, useState } from 'react';
import { FlaskConical, ChevronRight, CalendarPlus, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';
import { toISO, titleCase, fmtTime, byDateTime, prettyDate } from '../../../lib/appointmentUtils';
import { formatSlot } from '../../../lib/time';
import PortalStats from './PortalStats';
import styles from '../../../assets/styles/PatientPortal.module.css';

const OPEN = ['Pending', 'Confirmed', 'In consultation'];

const VISIT_PILL = {
  Pending: styles.pillWarn,
  Confirmed: styles.pillUpcoming,
  'In consultation': styles.pillUpcoming,
  Completed: styles.pillDone,
  Cancelled: styles.pillDanger,
};

const emptyText = { fontSize: 'var(--fs-xs)', color: 'var(--text-secondary)', padding: '8px 0', lineHeight: 1.6 };

function firstNameOf(full) {
  const cleaned = (full || '').replace(/^(dr\.?|mr\.?|mrs\.?|ms\.?)\s+/i, '').trim();
  const first = cleaned.split(/\s+/)[0] || '';
  return first ? first.charAt(0).toUpperCase() + first.slice(1) : '';
}

const listOf = (text) => (text || '').split(/[,\n]/).map((s) => s.trim()).filter(Boolean);

function whenOf(a) {
  if (!a.appointment_at) return `${prettyDate(a.appointment_date)}, ${fmtTime(a.appointment_time)}`;
  return formatSlot(a).local;
}

export default function PatientPortal() {
  const [firstName, setFirstName] = useState('');
  const [info, setInfo] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [today, setToday] = useState(null);

  useEffect(() => {
    let active = true;
    setToday(toISO(new Date()));

    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const [profileRes, apptRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle(),
        supabase.from('my_appointments').select('*').order('created_at', { ascending: false }).limit(50),
      ]);

      if (!active) return;
      const profile = profileRes.data;
      const name = firstNameOf(profile?.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0]);
      if (name) setFirstName(name);
      setInfo(profile || {});
      if (!apptRes.error) setAppointments(apptRes.data || []);
    }

    load();
    return () => { active = false; };
  }, []);

  const upcoming = today
    ? appointments.filter((a) => OPEN.includes(a.status) && a.appointment_date >= today).sort(byDateTime)
    : [];
  const next = upcoming[0];
  const recent = [...appointments].sort((x, y) => byDateTime(y, x)).slice(0, 3);

  const nextAppointment = next
    ? { when: whenOf(next), doctor: next.doctor_name, department: titleCase(next.department) }
    : { when: 'None booked', doctor: 'Book your next visit', department: 'it takes a minute' };

  const history = [
    ...listOf(info?.conditions).map((t) => ({ title: t, detail: 'Condition on your record', type: 'Condition' })),
    ...listOf(info?.allergies).map((t) => ({ title: t, detail: 'Allergy on your record', type: 'Allergy' })),
  ].slice(0, 5);

  const infoRows = [
    ['Gender', info?.gender],
    ['Blood type', info?.blood_type],
    ['Allergies', info?.allergies],
    ['Conditions', info?.conditions],
    ['Height', info?.height_cm ? `${info.height_cm} cm` : ''],
    ['Weight', info?.weight_kg ? `${info.weight_kg} kg` : ''],
    ['Phone', info?.phone],
  ];

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>{firstName ? `Welcome back, ${firstName}` : 'Welcome back'}</h1>
          <p className={styles.subtitle}>Here's what's happening with your care.</p>
        </div>
        <Link href="/book" className={styles.bookBtn}>
          <CalendarPlus size={16} strokeWidth={2.25} />
          Book appointment
        </Link>
      </div>

      <PortalStats nextAppointment={nextAppointment} labs={{ ready: 0, total: 0 }} balance={0} />

      <div className={styles.grid}>
        <div className={styles.mainCol}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Visit timeline</h2>
              <Link href="/portal/appointments" className={styles.viewAll}>
                View all <ChevronRight size={14} strokeWidth={2.5} />
              </Link>
            </div>
            {recent.length === 0 ? (
              <p style={emptyText}>No visits yet. Bookings you make while signed in appear here.</p>
            ) : (
              <div className={styles.list}>
                {recent.map((a) => (
                  <div key={a.id} className={styles.visitRow}>
                    <span className={styles.visitAvatar}>
                      {(a.doctor_name || '?').replace(/^dr\.?\s+/i, '').charAt(0).toUpperCase()}
                    </span>
                    <div className={styles.visitInfo}>
                      <p className={styles.visitDoctor}>{a.doctor_name}</p>
                      <p className={styles.visitSpecialty}>{titleCase(a.department)}</p>
                    </div>
                    <div className={styles.visitRight}>
                      <p className={styles.visitDate}>{whenOf(a)}</p>
                      <span className={`${styles.pill} ${VISIT_PILL[a.status] || styles.pillDone}`}>{a.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Lab reports</h2>
              <Link href="/portal/lab-reports" className={styles.viewAll}>
                View all <ChevronRight size={14} strokeWidth={2.5} />
              </Link>
            </div>
            <div className={styles.reportRow}>
              <div className={styles.reportIconWrap}><FlaskConical size={16} strokeWidth={2} /></div>
              <div className={styles.reportInfo}>
                <p className={styles.reportName}>No lab reports yet</p>
                <p className={styles.reportDate}>Results will appear here once your lab uploads them.</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.sideCol}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Patient history</h2>
              <Link href="/portal/history" className={styles.viewAll}>
                View all <ChevronRight size={14} strokeWidth={2.5} />
              </Link>
            </div>
            {history.length === 0 ? (
              <p style={emptyText}>Nothing recorded yet. Conditions and allergies you add to your profile appear here.</p>
            ) : (
              <div className={styles.historyList}>
                {history.map((h) => (
                  <div key={h.type + h.title} className={styles.historyRow}>
                    <span className={styles.historyIcon}><ClipboardList size={16} strokeWidth={2} /></span>
                    <div className={styles.historyInfo}>
                      <p className={styles.historyTitle}>{h.title}</p>
                      <p className={styles.historyDetail}>{h.detail}</p>
                    </div>
                    <span className={`${styles.pill} ${h.type === 'Allergy' ? styles.pillDanger : styles.pillWarn}`}>{h.type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Information</h2>
            </div>
            <div className={styles.infoList}>
              {infoRows.map(([key, value]) => (
                <div key={key} className={styles.infoRow}>
                  <span className={styles.infoKey}>{key}</span>
                  <span className={styles.infoVal}>{value || 'Not added'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}