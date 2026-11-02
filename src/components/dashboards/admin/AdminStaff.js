'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Users, Check, Clock, X, Eye, EyeOff  } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { initials } from '../../../lib/appointmentUtils';
import { EMAIL_RE, validPhone, norm } from '../../../lib/adminUtils';
import AdminModal from './AdminModal';
import styles from '../../../assets/styles/AdminDashboard.module.css';
import { callStaffApi } from '../../../lib/adminApi';
import SearchInput from '../../SearchInput';

const ROLES = ['Doctor', 'Nurse', 'Receptionist', 'Pharmacist', 'Lab technician', 'OT coordinator', 'Billing officer', 'Administrator'];
const STATUSES = ['Active', 'On leave', 'Inactive'];
const TABS = ['All', ...STATUSES];

const STATUS_CHIP = {
  Active: styles.chipActive,
  'On leave': styles.chipLeave,
  Inactive: styles.chipInactive,
};

/* ---------- add / edit form ---------- */
function generatePassword() {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
  const nums = '23456789';
  const all = letters + nums;
  const pick = (set) => set[crypto.getRandomValues(new Uint32Array(1))[0] % set.length];
  const out = [pick(letters), pick(nums)];
  while (out.length < 12) out.push(pick(all));
  return out.sort(() => Math.random() - 0.5).join('');
}

function StaffModal({ member, departments, existing, onClose, onSaved }) {
  const isEdit = !!member;
  const [v, setV] = useState({
    full_name: member?.full_name || '',
    role: member?.role || ROLES[0],
    department: member?.department || '',
    email: member?.email || '',
    phone: member?.phone || '',
    status: member?.status || 'Active',
    password: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');

  const errors = {};
  if (v.full_name.trim().length < 2) errors.full_name = 'Please enter the full name.';
  if (!EMAIL_RE.test(v.email.trim())) {
    errors.email = 'Enter a valid email, like name@example.com.';
  } else if (existing.some((s) => s.id !== member?.id && norm(s.email) === norm(v.email))) {
    errors.email = 'A staff member with this email already exists.';
  }
  if (v.phone.trim() && !validPhone(v.phone)) errors.phone = 'Enter a valid phone number (7–15 digits).';
  if (!isEdit) {
    if (v.password.length < 8) errors.password = 'Use at least 8 characters.';
    else if (!/[A-Za-z]/.test(v.password) || !/\d/.test(v.password)) errors.password = 'Include both letters and numbers.';
  }

  const show = (f) => touched[f] && errors[f];
  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.value }));
  const blur = (k) => () => setTouched((t) => ({ ...t, [k]: true }));

  const roleOptions = ROLES.includes(v.role) ? ROLES : [...ROLES, v.role];
  const deptOptions = departments.map((d) => d.name);
  if (v.department && !deptOptions.includes(v.department)) deptOptions.push(v.department);

  async function submit(e) {
    e.preventDefault();
    setTouched({ full_name: true, email: true, phone: true, password: true });
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    setServerError('');

    const payload = {
      full_name: v.full_name.trim(),
      role: v.role,
      department: v.department || null,
      email: v.email.trim().toLowerCase(),
      phone: v.phone.trim() || null,
      status: v.status,
    };

    if (isEdit) {
      const { data, error } = await supabase.from('staff').update(payload).eq('id', member.id).select().single();
      setSaving(false);
      if (error || !data) {
        setServerError('Could not save this staff member. Please try again.');
        return;
      }
      onSaved(data, true);
      return;
    }

    try {
      const { staff } = await callStaffApi({ mode: 'create', ...payload, password: v.password });
      setSaving(false);
      onSaved(staff, false);
    } catch (err) {
      setSaving(false);
      setServerError(err.message);
    }
  }

  return (
    <AdminModal
      title={isEdit ? 'Edit staff member' : 'Add staff member'}
      subtitle={isEdit ? 'Update their details or status.' : 'Creates their login. They sign in with this email and password.'}
      onClose={onClose}
    >
      <form onSubmit={submit} noValidate>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="sf-name">Full name</label>
          <input
            id="sf-name" className={`${styles.input} ${show('full_name') ? styles.inputError : ''}`}
            placeholder="e.g. Dr. Ayesha Khan"
            value={v.full_name} onChange={set('full_name')} onBlur={blur('full_name')}
          />
          {show('full_name') && <p className={styles.errorText}>{errors.full_name}</p>}
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="sf-role">Role</label>
            <select id="sf-role" className={styles.input} value={v.role} onChange={set('role')}>
              {roleOptions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="sf-dept">Department <span className={styles.optional}>(needed for doctors)</span></label>
            <select id="sf-dept" className={styles.input} value={v.department} onChange={set('department')}>
              <option value="">None</option>
              {deptOptions.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="sf-email">Email</label>
          <input
            id="sf-email" type="email" className={`${styles.input} ${show('email') ? styles.inputError : ''}`}
            placeholder="name@samhealthcare.com"
            value={v.email} onChange={set('email')} onBlur={blur('email')}
          />
          {show('email') && <p className={styles.errorText}>{errors.email}</p>}
          {isEdit && <p className={styles.hint}>Changing this does not change their sign-in email.</p>}
        </div>

        {!isEdit && (
          <div className={styles.field}>
            <label className={styles.label} htmlFor="sf-password">Initial password</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                id="sf-password" type={showPw ? 'text' : 'password'} autoComplete="new-password"
                className={`${styles.input} ${show('password') ? styles.inputError : ''}`}
                placeholder="At least 8 characters"
                value={v.password} onChange={set('password')} onBlur={blur('password')}
              />
              <button type="button" className={styles.iconBtn} aria-label={showPw ? 'Hide password' : 'Show password'} onClick={() => setShowPw((x) => !x)}>
                {showPw ? <EyeOff size={15} strokeWidth={2} /> : <Eye size={15} strokeWidth={2} />}
              </button>
              <button
                type="button" className={`${styles.btn} ${styles.btnSm}`}
                onClick={() => { setV((x) => ({ ...x, password: generatePassword() })); setShowPw(true); }}
              >
                Generate
              </button>
            </div>
            {show('password')
              ? <p className={styles.errorText}>{errors.password}</p>
              : <p className={styles.hint}>Give it to them privately. They can change it with "Forgot password".</p>}
          </div>
        )}

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="sf-phone">Phone <span className={styles.optional}>(optional)</span></label>
            <input
              id="sf-phone" type="tel" className={`${styles.input} ${show('phone') ? styles.inputError : ''}`}
              placeholder="0300 1234567"
              value={v.phone} onChange={set('phone')} onBlur={blur('phone')}
            />
            {show('phone') && <p className={styles.errorText}>{errors.phone}</p>}
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="sf-status">Status</label>
            <select id="sf-status" className={styles.input} value={v.status} onChange={set('status')}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {serverError && <p className={styles.serverError}>{serverError}</p>}

        <div className={styles.modalActions}>
          <button type="button" className={styles.btn} onClick={onClose}>Cancel</button>
          <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Add staff member'}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}

/* ---------- page ---------- */
export default function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [setup, setSetup] = useState(false);
  const [tab, setTab] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState(null); // { member: object | null }
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  function flash(type, text) {
    setNotice({ type, text });
    if (type === 'ok') setTimeout(() => setNotice(null), 3000);
  }

  useEffect(() => {
    async function load() {
      const [s, d] = await Promise.all([
        supabase.from('staff').select('*').order('created_at', { ascending: true }),
        supabase.from('departments').select('name').order('name', { ascending: true }),
      ]);
      if (s.error) setSetup(true);
      else setStaff(s.data || []);
      if (!d.error) setDepartments(d.data || []);
      setLoading(false);
    }
    load();
  }, []);

  function handleSaved(row, isEdit) {
    setStaff((list) => (isEdit ? list.map((s) => (s.id === row.id ? row : s)) : [...list, row]));
    setModal(null);
    flash('ok', isEdit ? 'Staff member updated.' : 'Staff member added.');
  }

  async function confirmDelete() {
    setBusy(true);
    const { error } = await supabase.from('staff').delete().eq('id', deleting.id);
    setBusy(false);
    if (error) {
      flash('error', 'Could not remove this staff member.');
      setDeleting(null);
      return;
    }
    setStaff((list) => list.filter((s) => s.id !== deleting.id));
    flash('ok', `${deleting.full_name} was removed.`);
    setDeleting(null);
  }

  const countFor = (s) => (s === 'All' ? staff.length : staff.filter((x) => x.status === s).length);
  const roleOptions = [...new Set([...ROLES, ...staff.map((s) => s.role)])];

  const q = norm(query);
  const shown = staff.filter(
    (s) =>
      (tab === 'All' || s.status === tab) &&
      (roleFilter === 'All' || s.role === roleFilter) &&
      (!q || [s.full_name, s.role, s.department, s.email].some((x) => norm(x).includes(q)))
  );

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Staff</h1>
          <p className={styles.subtitle}>
            {loading ? 'Loading staff...' : 'Everyone who works at the hospital. Add people, change roles and mark leave.'}
          </p>
        </div>
        <button
          type="button" className={`${styles.btn} ${styles.btnPrimary}`}
          disabled={setup} onClick={() => setModal({ member: null })}
        >
          <Plus size={16} strokeWidth={2.5} /> Add staff member
        </button>
      </div>

      {setup && (
        <p className={`${styles.notice} ${styles.noticeInfo}`}>
          The staff table does not exist yet. Run the admin SQL in Supabase, then refresh this page.
        </p>
      )}
      {notice && (
        <p className={`${styles.notice} ${notice.type === 'ok' ? styles.noticeOk : styles.noticeError}`}>{notice.text}</p>
      )}

      <div className={styles.statRow}>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.toneTeal}`}><Users size={20} strokeWidth={2} /></span>
          <div><p className={styles.statLabel}>Total staff</p><p className={styles.statValue}>{staff.length}</p></div>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.toneGreen}`}><Check size={20} strokeWidth={2.5} /></span>
          <div><p className={styles.statLabel}>Active</p><p className={styles.statValue}>{countFor('Active')}</p></div>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.toneAmber}`}><Clock size={20} strokeWidth={2} /></span>
          <div><p className={styles.statLabel}>On leave</p><p className={styles.statValue}>{countFor('On leave')}</p></div>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.toneRed}`}><X size={20} strokeWidth={2.5} /></span>
          <div><p className={styles.statLabel}>Inactive</p><p className={styles.statValue}>{countFor('Inactive')}</p></div>
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

        <div className={styles.filters}>
          <select className={styles.select} aria-label="Filter by role" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="All">All roles</option>
            {roleOptions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
           <SearchInput width={260} label="Search staff" placeholder="Search name, role or email" value={query} onChange={setQuery} />
        </div>
      </div>

      <div className={styles.tablePanel}>
        {shown.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>{loading ? 'Loading...' : 'No staff found'}</p>
            {!loading && (
              <p className={styles.emptyText}>
                {staff.length === 0 ? 'Click "Add staff member" to add the first person.' : 'Try another status or clear the search.'}
              </p>
            )}
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th><th>Role</th><th>Department</th><th>Phone</th><th>Status</th>
                  <th className={styles.thRight}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className={styles.person}>
                        <span className={styles.avatar}>{initials(s.full_name)}</span>
                        <div>
                          <p className={styles.personName}>{s.full_name}</p>
                          <p className={styles.personSub}>{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>{s.role}</td>
                    <td>{s.department || '—'}</td>
                    <td>{s.phone || '—'}</td>
                    <td><span className={`${styles.chip} ${STATUS_CHIP[s.status] || styles.chipInactive}`}>{s.status}</span></td>
                    <td className={styles.tdRight}>
                      <span className={styles.rowActions}>
                        <button type="button" className={styles.iconBtn} aria-label={`Edit ${s.full_name}`} onClick={() => setModal({ member: s })}>
                          <Pencil size={15} strokeWidth={2} />
                        </button>
                        <button type="button" className={`${styles.iconBtn} ${styles.iconBtnDanger}`} aria-label={`Remove ${s.full_name}`} onClick={() => setDeleting(s)}>
                          <Trash2 size={15} strokeWidth={2} />
                        </button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <StaffModal
          member={modal.member} departments={departments} existing={staff}
          onClose={() => setModal(null)} onSaved={handleSaved}
        />
      )}

      {deleting && (
        <AdminModal title="Remove staff member?" onClose={() => setDeleting(null)}>
          <p className={styles.confirmText}>
            <strong>{deleting.full_name}</strong> will be removed from the staff list. This cannot be undone.
            If they are only away, set their status to "On leave" or "Inactive" instead.
          </p>
          <div className={styles.modalActions}>
            <button type="button" className={styles.btn} onClick={() => setDeleting(null)}>Keep</button>
            <button type="button" className={`${styles.btn} ${styles.btnDanger}`} disabled={busy} onClick={confirmDelete}>
              {busy ? 'Removing...' : 'Remove'}
            </button>
          </div>
        </AdminModal>
      )}
    </div>
  );
}