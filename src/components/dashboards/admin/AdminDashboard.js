'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users, CalendarCheck, Inbox, Stethoscope, CalendarClock, Mail, Building2,
} from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { toISO, titleCase, initials, fmtTime, prettyDate } from '../../../lib/appointmentUtils';
import { digits, norm, timeAgo } from '../../../lib/adminUtils';
import styles from '../../../assets/styles/AdminDashboard.module.css';

const ACTIVITY_ICON = { booking: CalendarClock, staff: Users, message: Mail };

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [setup, setSetup] = useState(false);
  const [today, setToday] = useState(null);

  useEffect(() => {
    setToday(toISO(new Date()));

    async function load() {
      const [a, s, d, m] = await Promise.all([
        supabase.from('appointments').select('*'),
        supabase.from('staff').select('*'),
        supabase.from('departments').select('*'),
        supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(20),
      ]);

      if (a.error) setError(a.error.message);
      else setAppointments(a.data || []);

      if (s.error || d.error) {
        setSetup(true);
      } else {
        setStaff(s.data || []);
        setDepartments(d.data || []);
      }

      // messages stay private unless the optional SQL was run, so ignore errors here
      if (!m.error) setMessages(m.data || []);
      setLoading(false);
    }

    load();
  }, []);

  if (!today) {
    return <div className={styles.wrap}><p className={styles.subtitle}>Loading...</p></div>;
  }

  /* ----- derived numbers ----- */
  const live = appointments.filter((a) => a.status !== 'Cancelled');
  const patientKeys = new Set(live.map((a) => digits(a.patient_phone) || norm(a.patient_name)));
  const todayCount = live.filter((a) => a.appointment_date === today).length;
  const pending = appointments.filter((a) => a.status === 'Pending').length;
  const activeStaff = staff.filter((s) => s.status === 'Active').length;
  const newMessages = messages.filter((m) => m.status === 'New').length;

  const latest = appointments
  .filter((a) => a.created_at)
  .sort((x, y) => new Date(y.created_at) - new Date(x.created_at))
  .slice(0, 5);


  /* appointments per month, last 6 months */
  const base = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('en-US', { month: 'short' }),
      count: 0,
    });
  }
  live.forEach((a) => {
    const m = months.find((x) => (a.appointment_date || '').startsWith(x.key));
    if (m) m.count += 1;
  });
  const maxMonth = Math.max(1, ...months.map((m) => m.count));

  /* department load */
  const deptCounts = {};
  live.forEach((a) => {
    const k = titleCase(a.department);
    deptCounts[k] = (deptCounts[k] || 0) + 1;
  });
  const deptList = Object.entries(deptCounts).sort((x, y) => y[1] - x[1]).slice(0, 5);
  const deptMax = deptList.length ? deptList[0][1] : 1;

  /* staff by status */
  const team = ['Active', 'On leave', 'Inactive'].map((status) => ({
    status,
    count: staff.filter((s) => s.status === status).length,
    dot: status === 'Active' ? styles.dotActive : status === 'On leave' ? styles.dotLeave : styles.dotInactive,
  }));

  /* real recent activity */
  const activity = [
    ...appointments.filter((a) => a.created_at).map((a) => ({
      id: `a${a.id}`, kind: 'booking', at: a.created_at,
      text: `${a.patient_name} booked ${titleCase(a.department)}${a.doctor_name ? ` with ${a.doctor_name}` : ''}`,
    })),
    ...staff.filter((s) => s.created_at).map((s) => ({
      id: `s${s.id}`, kind: 'staff', at: s.created_at,
      text: `${s.full_name} added to the team as ${s.role}`,
    })),
    ...messages.map((m) => ({
      id: `m${m.id}`, kind: 'message', at: m.created_at,
      text: `New message from ${m.name}: ${m.subject}`,
    })),
  ].sort((x, y) => new Date(y.at) - new Date(x.at)).slice(0, 6);

  const QUICK = [
    { href: '/dashboard/admin/staff', icon: Users, title: 'Manage staff', sub: `${staff.length} team members` },
    { href: '/dashboard/admin/departments', icon: Building2, title: 'Departments', sub: `${departments.length} departments` },
    { href: '/dashboard/admin/appointments', icon: CalendarClock, title: 'Appointments', sub: `${pending} pending` },
    { href: '/dashboard/admin/messages', icon: Mail, title: 'Messages', sub: `${newMessages} new` },
  ];

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Hospital overview</h1>
          <p className={styles.subtitle}>
            {loading ? 'Loading...' : 'Live activity across bookings, staff and departments.'}
          </p>
        </div>
      </div>

      {error && <p className={`${styles.notice} ${styles.noticeError}`}>Could not load appointments: {error}</p>}
      {setup && (
        <p className={`${styles.notice} ${styles.noticeInfo}`}>
          Staff and departments are not set up yet. Run the admin SQL in Supabase, then refresh.
        </p>
      )}

      <div className={styles.statRow}>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.toneTeal}`}><Users size={22} strokeWidth={2} /></span>
          <div>
            <p className={styles.statLabel}>Total patients</p>
            <p className={styles.statValue}>{patientKeys.size}</p>
            <p className={styles.statSub}>Unique patients booked</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.toneBlue}`}><CalendarCheck size={22} strokeWidth={2} /></span>
          <div>
            <p className={styles.statLabel}>Appointments today</p>
            <p className={styles.statValue}>{todayCount}</p>
            <p className={styles.statSub}>Not cancelled</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.toneAmber}`}><Inbox size={22} strokeWidth={2} /></span>
          <div>
            <p className={styles.statLabel}>Pending requests</p>
            <p className={styles.statValue}>{pending}</p>
            <p className={styles.statSub}>Waiting for confirmation</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.toneGreen}`}><Stethoscope size={22} strokeWidth={2} /></span>
          <div>
            <p className={styles.statLabel}>Active staff</p>
            <p className={styles.statValue}>{activeStaff}</p>
            <p className={styles.statSub}>of {staff.length} team members</p>
          </div>
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.col}>

          
              <section className={styles.panel}>
            <div className={styles.panelHead}>
              <h2 className={styles.panelTitle}>Latest bookings</h2>
              <p className={styles.panelSub}>Newest first, by when they were booked</p>
            </div>
            {latest.length === 0 ? (
              <div className={styles.empty}><p className={styles.emptyText}>No bookings yet.</p></div>
            ) : (
              <ul className={styles.activityList}>
                {latest.map((a) => (
                  <li key={a.id} className={styles.activityItem}>
                    <span className={styles.avatar}>{initials(a.patient_name)}</span>
                    <div className={styles.activityBody}>
                      <p className={styles.activityText}>{a.patient_name} · {titleCase(a.department)}</p>
                      <p className={styles.activityTime}>
                        {prettyDate(a.appointment_date, { day: 'numeric', month: 'short' })} · {fmtTime(a.appointment_time)} · {a.doctor_name} · booked {timeAgo(a.created_at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <h2 className={styles.panelTitle}>Appointments per month</h2>
              <p className={styles.panelSub}>Last 6 months, cancelled bookings excluded</p>
            </div>
            <div className={styles.chart}>
              {months.map((m) => (
                <div key={m.key} className={styles.barCol}>
                  <span className={styles.barValue}>{m.count}</span>
                  <div className={styles.barTrack}>
                    <div className={styles.bar} style={{ height: `${(m.count / maxMonth) * 100}%` }} />
                  </div>
                  <span className={styles.barLabel}>{m.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <h2 className={styles.panelTitle}>Recent activity</h2>
              <p className={styles.panelSub}>Bookings, new staff and messages as they happen</p>
            </div>
            {activity.length === 0 ? (
              <div className={styles.empty}>
                <p className={styles.emptyTitle}>No activity yet</p>
                <p className={styles.emptyText}>New bookings and staff changes will show up here.</p>
              </div>
            ) : (
              <ul className={styles.activityList}>
                {activity.map((a) => {
                  const Icon = ACTIVITY_ICON[a.kind];
                  return (
                    <li key={a.id} className={styles.activityItem}>
                      <span className={styles.activityIcon}><Icon size={16} strokeWidth={2} /></span>
                      <div className={styles.activityBody}>
                        <p className={styles.activityText}>{a.text}</p>
                        <p className={styles.activityTime}>{timeAgo(a.at)}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <div className={styles.col}>
          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <h2 className={styles.panelTitle}>Department load</h2>
              <p className={styles.panelSub}>Busiest departments by bookings</p>
            </div>
            {deptList.length === 0 ? (
              <div className={styles.empty}><p className={styles.emptyText}>No bookings yet.</p></div>
            ) : (
              <div className={styles.barList}>
                {deptList.map(([name, count]) => (
                  <div key={name}>
                    <div className={styles.hTop}>
                      <span className={styles.hName}>{name}</span>
                      <span className={styles.hCount}>{count}</span>
                    </div>
                    <div className={styles.hTrack}>
                      <div className={styles.hFill} style={{ width: `${(count / deptMax) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <h2 className={styles.panelTitle}>Team</h2>
              <p className={styles.panelSub}>Staff by status</p>
            </div>
            <div>
              {team.map((t) => (
                <div key={t.status} className={styles.teamRow}>
                  <span className={`${styles.teamDot} ${t.dot}`} />
                  <span className={styles.teamLabel}>{t.status}</span>
                  <span className={styles.teamValue}>{t.count}</span>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <h2 className={styles.panelTitle}>Quick actions</h2>
            </div>
            <div className={styles.quickGrid}>
              {QUICK.map((q) => (
                <Link key={q.href} href={q.href} className={styles.quickLink}>
                  <span className={styles.quickIcon}><q.icon size={16} strokeWidth={2} /></span>
                  <div>
                    <p className={styles.quickTitle}>{q.title}</p>
                    <p className={styles.quickSub}>{q.sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}