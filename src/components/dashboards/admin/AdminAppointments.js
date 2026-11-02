'use client';

import { useEffect, useState } from 'react';
import { Trash2, CalendarClock, Inbox, CalendarCheck, Check } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { toISO, initials, titleCase, fmtTime, byDateTime, prettyDate } from '../../../lib/appointmentUtils';
import { norm, timeAgo } from '../../../lib/adminUtils';
import { digitsOnly } from '../../../lib/masks';
import SearchInput from '../../SearchInput';
import AdminModal from './AdminModal';
import styles from '../../../assets/styles/AdminDashboard.module.css';

const STATUSES = ['Pending', 'Confirmed', 'In consultation', 'Completed', 'Cancelled'];
const TABS = ['All', ...STATUSES];
const PAGE_SIZE = 20;
const SORTS = [
  { key: 'booked', label: 'Newest booked first' },
  { key: 'dateDesc', label: 'Appointment date: latest' },
  { key: 'dateAsc', label: 'Appointment date: earliest' },
];

const SELECT_CLASS = {
  Pending: styles.selPending,
  Confirmed: styles.selConfirmed,
  'In consultation': styles.selLive,
  Completed: styles.selDone,
  Cancelled: styles.selCancelled,
};

const bookedAt = (a) => (a.created_at ? new Date(a.created_at).getTime() : 0);

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState(null);
  const [tab, setTab] = useState('All');
  const [dept, setDept] = useState('All');
  const [doctorFilter, setDoctorFilter] = useState('All');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('booked');
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

    // a new booking appears at the top without a refresh
    const channel = supabase
      .channel('admin-appointments')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'appointments' }, (payload) => {
        setAppointments((list) => (list.some((x) => x.id === payload.new.id) ? list : [payload.new, ...list]));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
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
      flash('error', 'Could not delete this booking. Make sure you are signed in as admin.');
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
  const doctorNames = [...new Set(appointments.map((a) => a.doctor_name).filter(Boolean))].sort();

  const q = norm(query);
  const qDigits = digitsOnly(query);
  const phoneSearch = qDigits.length >= 3 && !/\p{L}/u.test(query);

  const filtered = appointments.filter((a) => {
    if (tab !== 'All' && a.status !== tab) return false;
    if (dept !== 'All' && titleCase(a.department) !== dept) return false;
    if (doctorFilter !== 'All' && a.doctor_name !== doctorFilter) return false;
    if (from && a.appointment_date < from) return false;
    if (to && a.appointment_date > to) return false;
    if (!q) return true;
    if (phoneSearch) return digitsOnly(a.patient_phone).includes(qDigits);
    return [a.patient_name, a.doctor_name, a.department, a.reason].some((x) => norm(x).includes(q));
  });

  const sorted = [...filtered].sort((x, y) => {
    if (sort === 'booked') return bookedAt(y) - bookedAt(x);
    if (sort === 'dateAsc') return byDateTime(x, y);
    return byDateTime(y, x);
  });
  const shown = sorted.slice(0, limit);

  const hasFilters = tab !== 'All' || dept !== 'All' || doctorFilter !== 'All' || from || to || query;
  function clearFilters() {
    setTab('All'); setDept('All'); setDoctorFilter('All'); setFrom(''); setTo(''); setQuery(''); setLimit(PAGE_SIZE);
  }
  const reset = (setter) => (value) => { setter(value); setLimit(PAGE_SIZE); };
  const isNew = (a) => Date.now() - bookedAt(a) < 60 * 60 * 1000;

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
            {loading ? 'Loading appointments...' : 'Every booking from the website and the mobile app. The newest bookings are shown first.'}
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
            <button key={t} type="button" className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`} onClick={() => reset(setTab)(t)}>
              {t}<span className={styles.tabCount}>{countFor(t)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.filterField} style={{ flex: '1 1 220px' }}>
          <span className={styles.filterLabel}>Search</span>
          <SearchInput
            mask="smart" label="Search appointments"
            placeholder="Patient name or phone number"
            value={query} onChange={reset(setQuery)}
          />
        </div>

        <div className={styles.filterField}>
          <label className={styles.filterLabel} htmlFor="f-from">From date</label>
          <input id="f-from" type="date" className={styles.select} value={from} max={to || undefined} onChange={(e) => reset(setFrom)(e.target.value)} />
        </div>
        <div className={styles.filterField}>
          <label className={styles.filterLabel} htmlFor="f-to">To date</label>
          <input id="f-to" type="date" className={styles.select} value={to} min={from || undefined} onChange={(e) => reset(setTo)(e.target.value)} />
        </div>

        <div className={styles.filterField}>
          <label className={styles.filterLabel} htmlFor="f-dept">Department</label>
          <select id="f-dept" className={styles.select} value={dept} onChange={(e) => reset(setDept)(e.target.value)}>
            <option value="All">All departments</option>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className={styles.filterField}>
          <label className={styles.filterLabel} htmlFor="f-doc">Doctor</label>
          <select id="f-doc" className={styles.select} value={doctorFilter} onChange={(e) => reset(setDoctorFilter)(e.target.value)}>
            <option value="All">All doctors</option>
            {doctorNames.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className={styles.filterField}>
          <label className={styles.filterLabel} htmlFor="f-sort">Sort by</label>
          <select id="f-sort" className={styles.select} value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>

        {hasFilters && (
          <button type="button" className={`${styles.btn} ${styles.btnSm}`} onClick={clearFilters}>Clear filters</button>
        )}
      </div>

      <p className={styles.resultLine}>Showing {shown.length} of {filtered.length} bookings</p>

      <div className={styles.tablePanel}>
        {shown.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>{loading ? 'Loading...' : 'No appointments found'}</p>
            {!loading && <p className={styles.emptyText}>Try different filters or clear them.</p>}
          </div>
        ) : (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Patient</th><th>Department</th><th>Appointment</th><th>Booked</th><th>Status</th>
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
                            <p className={styles.personName}>
                              {a.patient_name}
                              {isNew(a) && <span className={styles.pillNew}>New</span>}
                            </p>
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
                        <div className={styles.cellStack} title={a.created_at ? new Date(a.created_at).toISOString() : ''}>
                          <p>{a.created_at ? timeAgo(a.created_at) : '—'}</p>
                          <p>
                            {a.created_at
                              ? new Date(a.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                              : ''}
                          </p>
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

            {sorted.length > limit && (
              <div className={styles.moreWrap}>
                <button type="button" className={styles.btn} onClick={() => setLimit((n) => n + PAGE_SIZE)}>
                  Show more ({sorted.length - limit} left)
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