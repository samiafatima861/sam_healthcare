'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { initials } from '../../../lib/appointmentUtils';
import { norm, timeAgo } from '../../../lib/adminUtils';
import { callStaffApi } from '../../../lib/adminApi';
import SearchInput from '../../SearchInput';
import AdminModal from './AdminModal';
import styles from '../../../assets/styles/AdminDashboard.module.css';

const ROLES = ['Doctor', 'Nurse', 'Receptionist', 'Pharmacist', 'Lab technician', 'OT coordinator', 'Billing officer', 'Administrator'];
const TABS = ['All', 'Patients', 'Staff'];
const roleLabel = (r) => (r || 'patient').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

function PromoteModal({ user, departments, onClose, onDone }) {
  const [role, setRole] = useState('Doctor');
  const [department, setDepartment] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    if (role === 'Doctor' && !department) {
      setError('Choose a department so patients can book this doctor.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const result = await callStaffApi({ mode: 'promote', user_id: user.id, role, department: department || null });
      onDone(result);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <AdminModal title="Make staff" subtitle={`${user.full_name || user.email} will get a staff dashboard the next time they sign in.`} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="pm-role">Role</label>
          <select id="pm-role" className={styles.input} value={role} onChange={(e) => setRole(e.target.value)}>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="pm-dept">Department <span className={styles.optional}>(needed for doctors)</span></label>
          <select id="pm-dept" className={styles.input} value={department} onChange={(e) => setDepartment(e.target.value)}>
            <option value="">None</option>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        {error && <p className={styles.serverError}>{error}</p>}
        <div className={styles.modalActions}>
          <button type="button" className={styles.btn} onClick={onClose}>Cancel</button>
          <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={saving}>
            {saving ? 'Saving...' : 'Make staff'}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}

export default function AdminSignups() {
  const [people, setPeople] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('All');
  const [query, setQuery] = useState('');
  const [promoting, setPromoting] = useState(null);
  const [notice, setNotice] = useState(null);

  function flash(text) {
    setNotice(text);
    setTimeout(() => setNotice(null), 3000);
  }

  useEffect(() => {
    async function load() {
      const [p, d] = await Promise.all([
        supabase.from('profiles').select('id, full_name, email, role, staff_id, created_at').order('created_at', { ascending: false }),
        supabase.from('departments').select('name').order('name', { ascending: true }),
      ]);
      if (p.error) setError(p.error.message);
      else setPeople(p.data || []);
      if (!d.error) setDepartments((d.data || []).map((x) => x.name));
      setLoading(false);
    }
    load();

    // a new sign-up appears at the top straight away
    const channel = supabase
      .channel('admin-signups')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, (payload) => {
        setPeople((list) => (list.some((x) => x.id === payload.new.id) ? list : [payload.new, ...list]));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const isStaff = (p) => p.role && p.role !== 'patient';
  const countFor = (t) => (t === 'All' ? people.length : people.filter((p) => (t === 'Staff' ? isStaff(p) : !isStaff(p))).length);

  const q = norm(query);
  const shown = people.filter(
    (p) =>
      (tab === 'All' || (tab === 'Staff' ? isStaff(p) : !isStaff(p))) &&
      (!q || [p.full_name, p.email].some((x) => norm(x).includes(q)))
  );

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Sign-ups</h1>
          <p className={styles.subtitle}>
            {loading ? 'Loading accounts...' : 'Everyone who has created an account, newest first. Turn a sign-up into a staff member.'}
          </p>
        </div>
      </div>

      {error && <p className={`${styles.notice} ${styles.noticeError}`}>Could not load accounts: {error}</p>}
      {notice && <p className={`${styles.notice} ${styles.noticeOk}`}>{notice}</p>}

      <div className={styles.toolbar}>
        <div className={styles.tabs}>
          {TABS.map((t) => (
            <button key={t} type="button" className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`} onClick={() => setTab(t)}>
              {t}<span className={styles.tabCount}>{countFor(t)}</span>
            </button>
          ))}
        </div>
        <SearchInput width={260} label="Search accounts" placeholder="Search name or email" value={query} onChange={setQuery} />
      </div>

      <div className={styles.tablePanel}>
        {shown.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>{loading ? 'Loading...' : 'No accounts found'}</p>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr><th>Person</th><th>Role</th><th>Joined</th><th className={styles.thRight}>Actions</th></tr>
              </thead>
              <tbody>
                {shown.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className={styles.person}>
                        <span className={styles.avatar}>{initials(p.full_name || p.email)}</span>
                        <div>
                          <p className={styles.personName}>{p.full_name || 'No name'}</p>
                          <p className={styles.personSub}>{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className={`${styles.chip} ${isStaff(p) ? styles.chipActive : styles.chipInactive}`}>{roleLabel(p.role)}</span></td>
                    <td><span title={new Date(p.created_at).toISOString()}>{timeAgo(p.created_at)}</span></td>
                    <td className={styles.tdRight}>
                      {!isStaff(p) && (
                        <button type="button" className={`${styles.btn} ${styles.btnSm}`} onClick={() => setPromoting(p)}>Make staff</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {promoting && (
        <PromoteModal
          user={promoting} departments={departments}
          onClose={() => setPromoting(null)}
          onDone={(result) => {
            setPeople((list) => list.map((x) => (x.id === promoting.id ? { ...x, role: result.role, staff_id: result.staff.id } : x)));
            setPromoting(null);
            flash('Done. They now have a staff account.');
          }}
        />
      )}
    </div>
  );
}