'use client';

import { useEffect, useState } from 'react';
import { Search, Trash2, CalendarClock, Inbox, CalendarCheck, Check } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { toISO, initials, titleCase, fmtTime, byDateTime, prettyDate } from '../../../lib/appointmentUtils';
import { norm } from '../../../lib/adminUtils';
import AdminModal from './AdminModal';
import styles from '../../../assets/styles/AdminDashboard.module.css';

const STATUSES = ['Pending', 'Confirmed', 'In consultation', 'Completed', 'Cancelled'];
const TABS = ['All', ...STATUSES];
const PAGE_SIZE = 20;

const SELECT_CLASS = {
  Pending: styles.selPending,
  Confirmed: styles.selConfirmed,
  'In consultation': styles.selLive,
  Completed: styles.selDone,
  Cancelled: styles.selCancelled,
};

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState(null);
  const [tab, setTab] = useState('All');
  const [dept, setDept] = useState('All');
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [deleting, setDeleting] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState(null);

  function flash(type, text) {
    setNotice({ type, text });
    if (type === 'ok') setTimeout(() => setNotice(null), 3000);
  }

  useEffect(() => {
    setToday(toISO(new Date()));
    supabase
      .from('appointments')
      .select('*')
      .then(({ data, error }) => {
        if (error) flash('error', `Could not load appointments: ${error.message}`);
        else setAppointments(data || []);
        setLoading(false);
      });
  }, []);

  async function changeStatus(a, status) {
    setBusyId(a.id);
    const { data, error } = await supabase.from('appointments').update({ status }).eq('id', a.id).select();
    setBusyId(null);
    if (error || !data || data.length === 0) {
      flash('error', 'Could not change the status. Check the update policy in Supabase.');
      return;
    }
    setAppointments((list) => list.map((x) => (x.id === a.id ? { ...x, status } : x)));
  }

  async function confirmDelete() {
    setBusyId(deleting.id);
    const { data, error } = await supabase.from('appointments').delete().eq('id', deleting.id).select();
    setBusyId(null);
    if (error || !data || data.length === 0) {
      flash('error', 'Could not delete this booking. Run the delete-policy SQL in Supabase first.');
      setDeleting(null);
      return;
    }
    setAppointments((list) => list.filter((x) => x.id !== deleting.id));
    flash('ok', 'Booking deleted.');
    setDeleting(null);
  }

  if (!today) {
    return <div className={styles.wrap}><p className={styles.subtitle}>Loading...</p></div>;
  }

  const countFor = (s) => (s === 'All' ? appointments.length : appointments.filter((a) => a.status === s).length);
  const departments = [...new Set(appointments.map((a) => titleCase(a.department)))].sort();

  const q = norm(query);
  const filtered = appointments
    .filter(
      (a) =>
        (tab === 'All' || a.status === tab) &&
        (dept === 'All' || titleCase(a.department) === dept) &&
        (!q || [a.patient_name, a.patient_phone, a.doctor_name, a.department, a.reason].some((x) => norm(x).includes(q)))
    )
    .sort((x, y) => byDateTime(y, x));
  const shown = filtered.slice(0, limit);

  const stats = {
    total: appointments.length,
    today: appointments.filter((a) => a.appointment_date === today && a.status !== 'Cancelled').length,
    pending: countFor('Pending'),
    completed: countFor('Completed'),
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Appointments</h1>
          <p className={styles.subtitle}>
            {loading ? 'Loading appointments...' : 'Every booking from the website and the mobile app. Change a status or remove a booking.'}
          </p>
        </div>
      </div>

      {notice && (
        <p className={`${styles.notice} ${notice.type === 'ok' ? styles.noticeOk : styles.noticeError}`}>{notice.text}</p>
      )}

      <div className={styles.statRow}>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.toneTeal}`}><CalendarClock size={20} strokeWidth={2} /></span>
          <div><p className={styles.statLabel}>All bookings</p><p className={styles.statValue}>{stats.total}</p></div>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.toneBlue}`}><CalendarCheck size={20} strokeWidth={2} /></span>
          <div><p className={styles.statLabel}>Today</p><p className={styles.statValue}>{stats.today}</p></div>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.toneAmber}`}><Inbox size={20} strokeWidth={2} /></span>
          <div><p className={styles.statLabel}>Pending</p><p className={styles.statValue}>{stats.pending}</p></div>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.toneGreen}`}><Check size={20} strokeWidth={2.5} /></span>
          <div><p className={styles.statLabel}>Completed</p><p className={styles.statValue}>{stats.completed}</p></div>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.tabs}>
          {TABS.map((t) => (
            <button
              key={t} type="button"
              className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
              onClick={() => { setTab(t); setLimit(PAGE_SIZE); }}
            >
              {t}
              <span className={styles.tabCount}>{countFor(t)}</span>
            </button>
          ))}
        </div>

        <div className={styles.filters}>
          <select
            className={styles.select} aria-label="Filter by department"
            value={dept} onChange={(e) => { setDept(e.target.value); setLimit(PAGE_SIZE); }}
          >
            <option value="All">All departments</option>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <div className={styles.searchBox}>
            <Search size={15} strokeWidth={2} className={styles.searchIcon} />
            <input
              type="search" className={styles.searchInput} aria-label="Search appointments"
              placeholder="Search patient, phone or doctor"
              value={query} onChange={(e) => { setQuery(e.target.value); setLimit(PAGE_SIZE); }}
            />
          </div>
        </div>
      </div>

      <div className={styles.tablePanel}>
        {shown.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>{loading ? 'Loading...' : 'No appointments found'}</p>
            {!loading && <p className={styles.emptyText}>Try another status or clear the search.</p>}
          </div>
        ) : (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Patient</th><th>Department</th><th>Date and time</th><th>Status</th>
                    <th className={styles.thRight}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <div className={styles.person}>
                          <span className={styles.avatar}>{initials(a.patient_name)}</span>
                          <div>
                            <p className={styles.personName}>{a.patient_name}</p>
                            <p className={styles.personSub}>{a.patient_phone}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={styles.cellStack}>
                          <p>{titleCase(a.department)}</p>
                          <p>{a.doctor_name}</p>
                        </div>
                      </td>
                      <td>
                        <div className={styles.cellStack}>
                          <p>{prettyDate(a.appointment_date)}</p>
                          <p>{fmtTime(a.appointment_time)}</p>
                        </div>
                      </td>
                      <td>
                        <select
                          className={`${styles.statusSelect} ${SELECT_CLASS[a.status] || styles.selPending}`}
                          aria-label={`Status for ${a.patient_name}`}
                          value={a.status} disabled={busyId === a.id}
                          onChange={(e) => changeStatus(a, e.target.value)}
                        >
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className={styles.tdRight}>
                        <span className={styles.rowActions}>
                          <button
                            type="button" className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                            aria-label={`Delete booking for ${a.patient_name}`}
                            onClick={() => setDeleting(a)}
                          >
                            <Trash2 size={15} strokeWidth={2} />
                          </button>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length > limit && (
              <div className={styles.moreWrap}>
                <button type="button" className={styles.btn} onClick={() => setLimit((n) => n + PAGE_SIZE)}>
                  Show more ({filtered.length - limit} left)
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {deleting && (
        <AdminModal title="Delete this booking?" onClose={() => setDeleting(null)}>
          <p className={styles.confirmText}>
            The booking for <strong>{deleting.patient_name}</strong> on {prettyDate(deleting.appointment_date)} will be
            permanently deleted. To keep a record, set its status to "Cancelled" instead.
          </p>
          <div className={styles.modalActions}>
            <button type="button" className={styles.btn} onClick={() => setDeleting(null)}>Keep</button>
            <button type="button" className={`${styles.btn} ${styles.btnDanger}`} disabled={busyId === deleting.id} onClick={confirmDelete}>
              {busyId === deleting.id ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </AdminModal>
      )}
    </div>
  );
}