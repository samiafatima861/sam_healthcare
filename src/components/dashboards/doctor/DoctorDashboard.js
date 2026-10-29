'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users, CalendarCheck, Inbox, Phone, Mail, Check, X,
  ChevronLeft, ChevronRight, ArrowRight, Stethoscope,
} from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import styles from '../../../assets/styles/DoctorDashboard.module.css';

// Set to e.g. 'Dr. Arjun Mehta' to show only that doctor's appointments
const DOCTOR_NAME = null;

const STATUS_CHIP = {
  Pending: styles.chipPending,
  Confirmed: styles.chipConfirmed,
 'In consultation': styles.chipConfirmed,
  Completed: styles.chipDone,
  Cancelled: styles.chipCancelled,
};

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/* ---------- helpers ---------- */
const pad = (n) => String(n).padStart(2, '0');
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const initials = (name) =>
  (name || '?').trim().split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase();
const titleCase = (s) =>
  (s || 'Other').trim().toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
const fmtTime = (t) => (t || '').replace(/\s*(AM|PM)$/i, (m, ap) => ` ${ap.toUpperCase()}`);

function timeToMinutes(label) {
  const m = (label || '').match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return 0;
  let h = Number(m[1]);
  const min = Number(m[2]);
  const ap = m[3].toUpperCase();
  if (ap === 'PM' && h !== 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return h * 60 + min;
}

const byDateTime = (a, b) =>
  a.appointment_date.localeCompare(b.appointment_date) ||
  timeToMinutes(a.appointment_time) - timeToMinutes(b.appointment_time);

function prettyDate(iso, opts) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(
    'en-US',
    opts || { day: 'numeric', month: 'short', year: 'numeric' }
  );
}

const patientKey = (a) => (a.patient_phone || a.patient_name || '').replace(/\s/g, '').toLowerCase();

/* ---------- donut chart ---------- */
function Donut({ newCount, returningCount }) {
  const total = newCount + returningCount;
  const r = 52;
  const c = 2 * Math.PI * r;
  const retLen = total ? (returningCount / total) * c : 0;
  const newLen = total ? (newCount / total) * c : 0;

  return (
    <svg viewBox="0 0 140 140" className={styles.donut} role="img" aria-label={`${total} patients`}>
      <circle cx="70" cy="70" r={r} fill="none" stroke="#D9E8E6" strokeWidth="18" />
      {total > 0 && (
        <>
          <circle
            cx="70" cy="70" r={r} fill="none" stroke="var(--brand-800)" strokeWidth="18"
            strokeDasharray={`${retLen} ${c - retLen}`} transform="rotate(-90 70 70)"
          />
          <circle
            cx="70" cy="70" r={r} fill="none" stroke="var(--brand-cyan)" strokeWidth="18"
            strokeDasharray={`${newLen} ${c - newLen}`} strokeDashoffset={-retLen}
            transform="rotate(-90 70 70)"
          />
        </>
      )}
      <text x="70" y="69" textAnchor="middle" className={styles.donutNumber}>{total}</text>
      <text x="70" y="85" textAnchor="middle" className={styles.donutLabel}>Patients</text>
    </svg>
  );
}

/* ---------- calendar ---------- */
function Calendar({ viewMonth, onShift, selected, onSelect, today, marked }) {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const offset = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));

  return (
    <>
      <div className={styles.panelHead}>
        <h2 className={styles.panelTitle}>
          {viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <div className={styles.calNav}>
          <button type="button" className={styles.calNavBtn} onClick={() => onShift(-1)} aria-label="Previous month">
            <ChevronLeft size={14} strokeWidth={2.5} />
          </button>
          <button type="button" className={styles.calNavBtn} onClick={() => onShift(1)} aria-label="Next month">
            <ChevronRight size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className={styles.calWeek}>
        {WEEKDAYS.map((d) => <span key={d} className={styles.calWeekday}>{d}</span>)}
      </div>

      <div className={styles.calGrid}>
        {cells.map((date, i) => {
          if (!date) return <span key={`e${i}`} />;
          const iso = toISO(date);
          const cls = [
            styles.calDay,
            iso === today ? styles.calDayToday : '',
            iso === selected ? styles.calDaySelected : '',
          ].join(' ');
          return (
            <button key={iso} type="button" className={cls} onClick={() => onSelect(iso)}>
              {date.getDate()}
              {marked.has(iso) && <span className={styles.calDot} />}
            </button>
          );
        })}
      </div>
    </>
  );
}

/* ---------- page ---------- */
export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [today, setToday] = useState(null);
  const [nowMin, setNowMin] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMonth, setViewMonth] = useState(null);

  useEffect(() => {
    const now = new Date();
    const t = toISO(now);
    setToday(t);
    setNowMin(now.getHours() * 60 + now.getMinutes());
    setViewMonth(new Date(now.getFullYear(), now.getMonth(), 1));

    async function load() {
      let query = supabase.from('appointments').select('*').order('appointment_date', { ascending: true });
      if (DOCTOR_NAME) query = query.eq('doctor_name', DOCTOR_NAME);
      const { data, error: err } = await query;

      if (err) {
        setError(err.message);
        setSelectedDate(t);
      } else {
        const rows = data || [];
        setAppointments(rows);
        const live = rows.filter((a) => a.status !== 'Cancelled');
        if (live.some((a) => a.appointment_date === t)) {
          setSelectedDate(t);
        } else {
          const next = live.filter((a) => a.appointment_date > t).sort(byDateTime)[0];
          setSelectedDate(next ? next.appointment_date : t);
        }
      }
      setLoading(false);
    }

    load();
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

    // A missing policy updates 0 rows without raising an error, so check both
    if (err || !data || data.length === 0) {
      setActionError('Could not update this appointment. Check that the update policy exists in Supabase.');
      return;
    }
    setAppointments((list) => list.map((a) => (a.id === id ? { ...a, status } : a)));
  }

  if (!today || !viewMonth) {
    return <div className={styles.wrap}><p className={styles.subtitle}>Loading dashboard...</p></div>;
  }

  /* ----- derived data ----- */
  const live = appointments.filter((a) => a.status !== 'Cancelled');

  const visits = {};
  live.forEach((a) => { const k = patientKey(a); visits[k] = (visits[k] || 0) + 1; });
  const keys = Object.keys(visits);
  const totalPatients = keys.length;
  const returningCount = keys.filter((k) => visits[k] > 1).length;
  const newCount = totalPatients - returningCount;

  const todayCount = live.filter((a) => a.appointment_date === today).length;
  const pending = appointments.filter((a) => a.status === 'Pending').sort(byDateTime);
  const selectedList = live.filter((a) => a.appointment_date === selectedDate).sort(byDateTime);
  const marked = new Set(live.map((a) => a.appointment_date));

  const ongoing = live.find((a) => a.status === 'In consultation');

  const next = live
    .filter((a) => a.status !== 'Completed' && a.status !== 'In consultation')
    .filter((a) => a.appointment_date > today || (a.appointment_date === today && timeToMinutes(a.appointment_time) >= nowMin))
    .sort(byDateTime)[0];

  const deptCounts = {};
  live.forEach((a) => { const d = titleCase(a.department); deptCounts[d] = (deptCounts[d] || 0) + 1; });
  const depts = Object.entries(deptCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const deptMax = depts.length ? depts[0][1] : 1;

  const selectedLabel =
    selectedDate === today
      ? 'Today'
      : prettyDate(selectedDate, { day: 'numeric', month: 'short' });

  const todayLong = prettyDate(today, { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className={styles.wrap}>
      <div className={styles.shell}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.subtitle}>
              {loading ? 'Loading appointments...' : 'Your patients and appointments at a glance.'}
            </p>
          </div>
          <span className={styles.todayChip}>{todayLong}</span>
        </div>

        {error && <p className={styles.errorBanner}>Could not load appointments: {error}</p>}
        {actionError && <p className={styles.errorBanner}>{actionError}</p>}


                {ongoing && (
          <div className={styles.ongoing}>
            <span className={styles.ongoingDot} />
            <div className={styles.ongoingText}>
              <p className={styles.ongoingLabel}>Now consulting</p>
              <p className={styles.ongoingName}>
                {ongoing.patient_name} · {titleCase(ongoing.department)} · {fmtTime(ongoing.appointment_time)}
              </p>
            </div>
            <Link href={`/dashboard/doctor/consultation/${ongoing.id}`} className={styles.ongoingBtn}>
              Open patient <ArrowRight size={12} strokeWidth={2.5} />
            </Link>
          </div>
        )}

        {/* stat cards */}
        <div className={styles.statRow}>
          <div className={styles.statCard}>
            <span className={styles.statIcon}><Users size={20} strokeWidth={2.25} /></span>
            <div>
              <p className={styles.statLabel}>Total patients</p>
              <p className={styles.statValue}>{totalPatients}</p>
              <p className={styles.statSub}>Till today</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}><CalendarCheck size={20} strokeWidth={2.25} /></span>
            <div>
              <p className={styles.statLabel}>Today's appointments</p>
              <p className={styles.statValue}>{todayCount}</p>
              <p className={styles.statSub}>{todayLong}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}><Inbox size={20} strokeWidth={2.25} /></span>
            <div>
              <p className={styles.statLabel}>Pending requests</p>
              <p className={styles.statValue}>{pending.length}</p>
              <p className={styles.statSub}>Waiting for confirmation</p>
            </div>
          </div>
        </div>

        {/* row 1: summary, appointments, next patient */}
        <div className={styles.row}>
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Patients summary</h2>
            <Donut newCount={newCount} returningCount={returningCount} />
            <ul className={styles.legend}>
              <li className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: 'var(--brand-cyan)' }} />
                <span className={styles.legendLabel}>New patients</span>
                <span className={styles.legendValue}>{newCount}</span>
              </li>
              <li className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: 'var(--brand-800)' }} />
                <span className={styles.legendLabel}>Returning patients</span>
                <span className={styles.legendValue}>{returningCount}</span>
              </li>
              <li className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: '#D9E8E6' }} />
                <span className={styles.legendLabel}>Total patients</span>
                <span className={styles.legendValue}>{totalPatients}</span>
              </li>
            </ul>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <h2 className={styles.panelTitle}>Appointments</h2>
              <span className={styles.dateChip}>{selectedLabel}</span>
            </div>

            {selectedList.length === 0 ? (
              <div className={styles.empty}>
                <p className={styles.emptyTitle}>No appointments on this day</p>
                <p className={styles.emptyText}>Pick a day with a dot on the calendar.</p>
              </div>
            ) : (
              <ul className={styles.list}>
                {selectedList.slice(0, 4).map((a) => (
                  <li key={a.id} className={styles.item}>
                    <span className={styles.avatar}>{initials(a.patient_name)}</span>
                    <div className={styles.itemInfo}>
                      <p className={styles.itemName}>{a.patient_name}</p>
                      <p className={styles.itemMeta}>{titleCase(a.department)}</p>
                    </div>
                    <span className={`${styles.timeChip} ${STATUS_CHIP[a.status] || ''}`} title={a.status}>
                      {fmtTime(a.appointment_time)}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <Link href="/dashboard/doctor/schedule" className={styles.panelLink}>
              See all <ArrowRight size={12} strokeWidth={2.5} />
            </Link>
          </section>

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Next patient details</h2>

            {!next ? (
              <div className={styles.empty}>
                <p className={styles.emptyTitle}>No upcoming patients</p>
                <p className={styles.emptyText}>New bookings will appear here.</p>
              </div>
            ) : (
              <>
                <div className={styles.nextTop}>
                  <span className={styles.nextAvatar}>{initials(next.patient_name)}</span>
                  <div className={styles.nextWho}>
                    <p className={styles.nextName}>{next.patient_name}</p>
                    <p className={styles.itemMeta}>{titleCase(next.department)}</p>
                  </div>
                  <div className={styles.nextIdBox}>
                    <p className={styles.fieldLabel}>Booking ID</p>
                    <p className={styles.nextId}>{String(next.id).slice(0, 8).toUpperCase()}</p>
                  </div>
                </div>

                                <div className={styles.fieldGrid}>
                  <div><p className={styles.fieldLabel}>Date</p><p className={styles.fieldValue}>{prettyDate(next.appointment_date)}</p></div>
                  <div><p className={styles.fieldLabel}>Time</p><p className={styles.fieldValue}>{fmtTime(next.appointment_time)}</p></div>
                  <div><p className={styles.fieldLabel}>Doctor</p><p className={styles.fieldValue}>{next.doctor_name}</p></div>
                  <div><p className={styles.fieldLabel}>Visits</p><p className={styles.fieldValue}>{visits[patientKey(next)]}</p></div>
                  <div className={styles.fieldWide}><p className={styles.fieldLabel}>Phone</p><p className={styles.fieldValue}>{next.patient_phone}</p></div>
                  <div className={styles.fieldWide}><p className={styles.fieldLabel}>Email</p><p className={styles.fieldValue}>{next.patient_email || 'Not provided'}</p></div>
                </div>

                <p className={styles.subHead}>Reason for visit</p>
                <div className={styles.tagRow}>
                  <span className={`${styles.tag} ${STATUS_CHIP[next.status] || ''}`}>{next.status}</span>
                  <span className={styles.tag}>{next.reason || 'No reason given'}</span>
                </div>

                <Link
                  href={`/dashboard/doctor/consultation/${next.id}`}
                  className={`${styles.smallBtn} ${styles.smallBtnPrimary} ${styles.startBtn}`}
                >
                  <Stethoscope size={13} strokeWidth={2.5} /> Start consultation
                </Link>

                <div className={styles.btnRow}>
                  <a
                    href={`tel:${(next.patient_phone || '').replace(/[^\d+]/g, '')}`}
                    className={styles.smallBtn}
                  >
                    <Phone size={12} strokeWidth={2.5} /> Call
                  </a>
                  {next.patient_email ? (
                    <a href={`mailto:${next.patient_email}`} className={styles.smallBtn}>
                      <Mail size={12} strokeWidth={2.5} /> Email
                    </a>
                  ) : (
                    <span className={`${styles.smallBtn} ${styles.smallBtnOff}`}>
                      <Mail size={12} strokeWidth={2.5} /> Email
                    </span>
                  )}
                </div>

                <Link href={`/dashboard/doctor/consultation/${next.id}`} className={styles.panelLink}>
                  Prescriptions and notes <ArrowRight size={12} strokeWidth={2.5} />
                </Link>
              </>
            )}
          </section>
        </div>

        {/* row 2: departments, requests, calendar */}
        <div className={styles.row}>
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Appointments by department</h2>
            {depts.length === 0 ? (
              <div className={styles.empty}><p className={styles.emptyText}>No data yet.</p></div>
            ) : (
              <div className={styles.barList}>
                {depts.map(([name, count]) => (
                  <div key={name} className={styles.barRow}>
                    <span className={styles.barName}>{name}</span>
                    <div className={styles.barTrack}>
                      <div className={styles.barFill} style={{ width: `${(count / deptMax) * 100}%` }} />
                    </div>
                    <span className={styles.barCount}>{count}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <h2 className={styles.panelTitle}>Appointment requests</h2>
              <span className={styles.dateChip}>{pending.length} pending</span>
            </div>

            {pending.length === 0 ? (
              <div className={styles.empty}>
                <p className={styles.emptyTitle}>No pending requests</p>
                <p className={styles.emptyText}>You're all caught up.</p>
              </div>
            ) : (
              <ul className={styles.list}>
                {pending.slice(0, 3).map((a) => (
                  <li key={a.id} className={styles.item}>
                    <span className={styles.avatar}>{initials(a.patient_name)}</span>
                    <div className={styles.itemInfo}>
                      <p className={styles.itemName}>{a.patient_name}</p>
                      <p className={styles.itemMeta}>
                        {prettyDate(a.appointment_date, { day: 'numeric', month: 'short' })} · {fmtTime(a.appointment_time)}
                      </p>
                    </div>
                    <div className={styles.reqActions}>
                      <button
                        type="button" disabled={busyId === a.id}
                        className={`${styles.iconBtn} ${styles.iconBtnAccept}`}
                        onClick={() => updateStatus(a.id, 'Confirmed')}
                        aria-label="Accept" title="Accept"
                      >
                        <Check size={13} strokeWidth={3} />
                      </button>
                      <button
                        type="button" disabled={busyId === a.id}
                        className={`${styles.iconBtn} ${styles.iconBtnReject}`}
                        onClick={() => updateStatus(a.id, 'Cancelled')}
                        aria-label="Decline" title="Decline"
                      >
                        <X size={13} strokeWidth={3} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <Link href="/dashboard/doctor/schedule" className={styles.panelLink}>
              See all <ArrowRight size={12} strokeWidth={2.5} />
            </Link>
          </section>

          <section className={styles.panel}>
            <Calendar
              viewMonth={viewMonth}
              onShift={(delta) => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + delta, 1))}
              selected={selectedDate}
              onSelect={setSelectedDate}
              today={today}
              marked={marked}
            />
          </section>
        </div>
      </div>
    </div>
  );
}