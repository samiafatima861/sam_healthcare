'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Building2, Search, Users, CalendarClock } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { digits, norm } from '../../../lib/adminUtils';
import AdminModal from './AdminModal';
import styles from '../../../assets/styles/AdminDashboard.module.css';

/* ---------- add / edit form ---------- */
function DeptModal({ dept, existing, doctors, onClose, onSaved }) {
  const isEdit = !!dept;
  const [v, setV] = useState({
    name: dept?.name || '',
    head: dept?.head || '',
    description: dept?.description || '',
  });
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');

  let nameError = '';
  if (v.name.trim().length < 2) nameError = 'Please enter the department name.';
  else if (existing.some((d) => d.id !== dept?.id && norm(d.name) === norm(v.name))) {
    nameError = 'A department with this name already exists.';
  }

  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.value }));

  const headOptions = [...doctors];
  if (v.head && !headOptions.includes(v.head)) headOptions.push(v.head);

  async function submit(e) {
    e.preventDefault();
    setTouched(true);
    if (nameError) return;

    setSaving(true);
    setServerError('');

    const payload = {
      name: v.name.trim(),
      head: v.head || null,
      description: v.description.trim() || null,
    };

    const query = isEdit
      ? supabase.from('departments').update(payload).eq('id', dept.id)
      : supabase.from('departments').insert(payload);
    const { data, error } = await query.select().single();

    // keep staff in sync if the department was renamed
    if (!error && isEdit && dept.name !== payload.name) {
      await supabase.from('staff').update({ department: payload.name }).eq('department', dept.name);
    }
    setSaving(false);

    if (error || !data) {
      setServerError('Could not save this department. Please try again.');
      return;
    }
    onSaved(data, isEdit, dept?.name);
  }

  return (
    <AdminModal
      title={isEdit ? 'Edit department' : 'Add department'}
      subtitle={isEdit ? 'Update its name, head or description.' : 'Create a new department for the hospital.'}
      onClose={onClose}
    >
      <form onSubmit={submit} noValidate>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="dp-name">Department name</label>
          <input
            id="dp-name" className={`${styles.input} ${touched && nameError ? styles.inputError : ''}`}
            placeholder="e.g. Neurology"
            value={v.name} onChange={set('name')} onBlur={() => setTouched(true)}
          />
          {touched && nameError && <p className={styles.errorText}>{nameError}</p>}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="dp-head">Head of department <span className={styles.optional}>(optional)</span></label>
          <select id="dp-head" className={styles.input} value={v.head} onChange={set('head')}>
            <option value="">Not assigned</option>
            {headOptions.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          {doctors.length === 0 && <p className={styles.hint}>Add a doctor on the Staff page to choose one here.</p>}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="dp-desc">Description <span className={styles.optional}>(optional)</span></label>
          <textarea
            id="dp-desc" className={`${styles.input} ${styles.textarea}`}
            placeholder="A short line about what this department treats"
            value={v.description} onChange={set('description')}
          />
        </div>

        {serverError && <p className={styles.serverError}>{serverError}</p>}

        <div className={styles.modalActions}>
          <button type="button" className={styles.btn} onClick={onClose}>Cancel</button>
          <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Add department'}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}

/* ---------- page ---------- */
export default function AdminDepartments() {
  const [departments, setDepartments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [setup, setSetup] = useState(false);
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState(null); // { dept: object | null }
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  function flash(type, text) {
    setNotice({ type, text });
    if (type === 'ok') setTimeout(() => setNotice(null), 3000);
  }

  useEffect(() => {
    async function load() {
      const [d, a, s] = await Promise.all([
        supabase.from('departments').select('*').order('name', { ascending: true }),
        supabase.from('appointments').select('department, patient_phone, patient_name, status'),
        supabase.from('staff').select('full_name, role, department'),
      ]);
      if (d.error) setSetup(true);
      else setDepartments(d.data || []);
      if (!a.error) setAppointments(a.data || []);
      if (!s.error) setStaff(s.data || []);
      setLoading(false);
    }
    load();
  }, []);

  function handleSaved(row, isEdit, oldName) {
    setDepartments((list) => {
      const next = isEdit ? list.map((d) => (d.id === row.id ? row : d)) : [...list, row];
      return next.sort((x, y) => x.name.localeCompare(y.name));
    });
    if (isEdit && oldName && oldName !== row.name) {
      setStaff((list) => list.map((s) => (s.department === oldName ? { ...s, department: row.name } : s)));
    }
    setModal(null);
    flash('ok', isEdit ? 'Department updated.' : 'Department added.');
  }

  async function confirmDelete() {
    setBusy(true);
    const { error } = await supabase.from('departments').delete().eq('id', deleting.id);
    setBusy(false);
    if (error) {
      flash('error', 'Could not delete this department.');
      setDeleting(null);
      return;
    }
    setDepartments((list) => list.filter((d) => d.id !== deleting.id));
    flash('ok', `${deleting.name} was deleted.`);
    setDeleting(null);
  }

  /* ----- numbers per department ----- */
  const live = appointments.filter((a) => a.status !== 'Cancelled');
  const doctors = staff.filter((s) => s.role === 'Doctor').map((s) => s.full_name);

  function statsFor(d) {
    const mine = live.filter((a) => norm(a.department) === norm(d.name));
    const patients = new Set(mine.map((a) => digits(a.patient_phone) || norm(a.patient_name)));
    return {
      bookings: mine.length,
      patients: patients.size,
      staff: staff.filter((s) => norm(s.department) === norm(d.name)).length,
    };
  }

  const withStats = departments.map((d) => ({ ...d, ...statsFor(d) }));
  const maxBookings = Math.max(1, ...withStats.map((d) => d.bookings));
  const q = norm(query);
  const shown = withStats.filter((d) => !q || [d.name, d.head, d.description].some((x) => norm(x).includes(q)));

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Departments</h1>
          <p className={styles.subtitle}>
            {loading ? 'Loading departments...' : 'Create and manage hospital departments. Numbers come from real bookings and staff.'}
          </p>
        </div>
        <button
          type="button" className={`${styles.btn} ${styles.btnPrimary}`}
          disabled={setup} onClick={() => setModal({ dept: null })}
        >
          <Plus size={16} strokeWidth={2.5} /> Add department
        </button>
      </div>

      {setup && (
        <p className={`${styles.notice} ${styles.noticeInfo}`}>
          The departments table does not exist yet. Run the admin SQL in Supabase, then refresh this page.
        </p>
      )}
      {notice && (
        <p className={`${styles.notice} ${notice.type === 'ok' ? styles.noticeOk : styles.noticeError}`}>{notice.text}</p>
      )}

      <div className={styles.statRow}>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.toneTeal}`}><Building2 size={20} strokeWidth={2} /></span>
          <div><p className={styles.statLabel}>Departments</p><p className={styles.statValue}>{departments.length}</p></div>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.toneBlue}`}><CalendarClock size={20} strokeWidth={2} /></span>
          <div><p className={styles.statLabel}>Total bookings</p><p className={styles.statValue}>{live.length}</p></div>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.toneGreen}`}><Users size={20} strokeWidth={2} /></span>
          <div><p className={styles.statLabel}>Staff assigned</p><p className={styles.statValue}>{staff.filter((s) => s.department).length}</p></div>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={15} strokeWidth={2} className={styles.searchIcon} />
          <input
            type="search" className={styles.searchInput} aria-label="Search departments"
            placeholder="Search departments"
            value={query} onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {shown.length === 0 ? (
        <div className={styles.tablePanel}>
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>{loading ? 'Loading...' : 'No departments found'}</p>
            {!loading && (
              <p className={styles.emptyText}>
                {departments.length === 0 ? 'Click "Add department" to create the first one.' : 'Try a different search.'}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.cardGrid}>
          {shown.map((d) => (
            <article key={d.id} className={styles.dCard}>
              <div className={styles.dTop}>
                <span className={styles.dIcon}><Building2 size={22} strokeWidth={2} /></span>
                <div className={styles.dInfo}>
                  <h2 className={styles.dName}>{d.name}</h2>
                  <p className={styles.dHead}>{d.head ? `Head: ${d.head}` : 'No head assigned'}</p>
                </div>
              </div>

              <p className={styles.dDesc}>{d.description || 'No description yet.'}</p>

              <div className={styles.dStats}>
                <div><p className={styles.dStatValue}>{d.staff}</p><p className={styles.dStatLabel}>Staff</p></div>
                <div><p className={styles.dStatValue}>{d.patients}</p><p className={styles.dStatLabel}>Patients</p></div>
                <div><p className={styles.dStatValue}>{d.bookings}</p><p className={styles.dStatLabel}>Bookings</p></div>
              </div>

              <div className={styles.dLoad}>
                <div className={styles.dLoadFill} style={{ width: `${(d.bookings / maxBookings) * 100}%` }} />
              </div>

              <div className={styles.dActions}>
                <button type="button" className={`${styles.btn} ${styles.btnSm}`} onClick={() => setModal({ dept: d })}>
                  <Pencil size={13} strokeWidth={2.25} /> Edit
                </button>
                <button type="button" className={`${styles.btn} ${styles.btnSm}`} onClick={() => setDeleting(d)}>
                  <Trash2 size={13} strokeWidth={2.25} /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {modal && (
        <DeptModal
          dept={modal.dept} existing={departments} doctors={doctors}
          onClose={() => setModal(null)} onSaved={handleSaved}
        />
      )}

      {deleting && (
        <AdminModal title="Delete department?" onClose={() => setDeleting(null)}>
          <p className={styles.confirmText}>
            <strong>{deleting.name}</strong> will be deleted. Its staff and past bookings are not deleted,
            but staff will still show this name until you edit them.
          </p>
          <div className={styles.modalActions}>
            <button type="button" className={styles.btn} onClick={() => setDeleting(null)}>Keep</button>
            <button type="button" className={`${styles.btn} ${styles.btnDanger}`} disabled={busy} onClick={confirmDelete}>
              {busy ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </AdminModal>
      )}
    </div>
  );
}