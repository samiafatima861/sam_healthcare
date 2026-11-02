'use client';

import { useEffect, useState } from 'react';
import {
  Plus, Trash2, Check, Wallet, Clock, FileText, TrendingUp, TrendingDown,
} from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { pad, initials, prettyDate } from '../../../lib/appointmentUtils';
import { validPhone, norm } from '../../../lib/adminUtils';
import AdminModal from './AdminModal';
import styles from '../../../assets/styles/AdminDashboard.module.css';
import SearchInput from '../../SearchInput';

const METHODS = ['Cash', 'Card', 'Bank transfer', 'Insurance'];
const TABS = ['All', 'Pending', 'Paid'];
const STATUS_CHIP = { Paid: styles.chipActive, Pending: styles.chipLeave };

const rs = (n) => 'Rs ' + Math.round(Number(n) || 0).toLocaleString('en-US');
const compact = (n) =>
  n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '')}k` : String(Math.round(n));
const monthKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;

/* ---------- create invoice ---------- */
function InvoiceModal({ departments, onClose, onSaved }) {
  const [v, setV] = useState({
    patient_name: '', patient_phone: '', department: '', description: '',
    amount: '', status: 'Pending', method: METHODS[0],
  });
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');

  const amount = Number(v.amount);
  const errors = {};
  if (v.patient_name.trim().length < 2) errors.patient_name = 'Please enter the patient name.';
  if (v.patient_phone.trim() && !validPhone(v.patient_phone)) errors.patient_phone = 'Enter a valid phone number (7–15 digits).';
  if (v.description.trim().length < 2) errors.description = 'Describe what this invoice is for.';
  if (!v.amount || !Number.isFinite(amount) || amount <= 0) errors.amount = 'Enter an amount greater than zero.';

  const show = (f) => touched[f] && errors[f];
  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.value }));
  const blur = (k) => () => setTouched((t) => ({ ...t, [k]: true }));

  async function submit(e) {
    e.preventDefault();
    setTouched({ patient_name: true, patient_phone: true, description: true, amount: true });
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    setServerError('');

    const isPaid = v.status === 'Paid';
    const { data, error } = await supabase
      .from('invoices')
      .insert({
        patient_name: v.patient_name.trim(),
        patient_phone: v.patient_phone.trim() || null,
        department: v.department || null,
        description: v.description.trim(),
        amount,
        status: v.status,
        method: isPaid ? v.method : null,
        paid_at: isPaid ? new Date().toISOString() : null,
      })
      .select()
      .single();
    setSaving(false);

    if (error || !data) {
      setServerError('Could not save this invoice. Make sure you ran the invoices SQL in Supabase.');
      return;
    }
    onSaved(data);
  }

  return (
    <AdminModal title="Create invoice" subtitle="Bill a patient for a visit, test or treatment." onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="iv-name">Patient name</label>
            <input
              id="iv-name" className={`${styles.input} ${show('patient_name') ? styles.inputError : ''}`}
              placeholder="e.g. Ahsan Raza"
              value={v.patient_name} onChange={set('patient_name')} onBlur={blur('patient_name')}
            />
            {show('patient_name') && <p className={styles.errorText}>{errors.patient_name}</p>}
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="iv-phone">Phone <span className={styles.optional}>(optional)</span></label>
            <input
              id="iv-phone" type="tel" className={`${styles.input} ${show('patient_phone') ? styles.inputError : ''}`}
              placeholder="0300 1234567"
              value={v.patient_phone} onChange={set('patient_phone')} onBlur={blur('patient_phone')}
            />
            {show('patient_phone') && <p className={styles.errorText}>{errors.patient_phone}</p>}
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="iv-desc">Description</label>
          <input
            id="iv-desc" className={`${styles.input} ${show('description') ? styles.inputError : ''}`}
            placeholder="e.g. Consultation and blood tests"
            value={v.description} onChange={set('description')} onBlur={blur('description')}
          />
          {show('description') && <p className={styles.errorText}>{errors.description}</p>}
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="iv-amount">Amount (Rs)</label>
            <input
              id="iv-amount" type="number" min="0" step="0.01" inputMode="decimal"
              className={`${styles.input} ${show('amount') ? styles.inputError : ''}`}
              placeholder="e.g. 2500"
              value={v.amount} onChange={set('amount')} onBlur={blur('amount')}
            />
            {show('amount') && <p className={styles.errorText}>{errors.amount}</p>}
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="iv-dept">Department <span className={styles.optional}>(optional)</span></label>
            <select id="iv-dept" className={styles.input} value={v.department} onChange={set('department')}>
              <option value="">None</option>
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="iv-status">Status</label>
            <select id="iv-status" className={styles.input} value={v.status} onChange={set('status')}>
              <option value="Pending">Pending (not paid yet)</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="iv-method">Payment method</label>
            <select id="iv-method" className={styles.input} value={v.method} onChange={set('method')} disabled={v.status !== 'Paid'}>
              {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        {serverError && <p className={styles.serverError}>{serverError}</p>}

        <div className={styles.modalActions}>
          <button type="button" className={styles.btn} onClick={onClose}>Cancel</button>
          <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={saving}>
            {saving ? 'Saving...' : 'Create invoice'}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}

/* ---------- record payment ---------- */
function PayModal({ invoice, onClose, onPaid }) {
  const [method, setMethod] = useState(METHODS[0]);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');

  async function confirm() {
    setSaving(true);
    setServerError('');
    const { data, error } = await supabase
      .from('invoices')
      .update({ status: 'Paid', method, paid_at: new Date().toISOString() })
      .eq('id', invoice.id)
      .select();
    setSaving(false);

    if (error || !data || data.length === 0) {
      setServerError('Could not record the payment. Please try again.');
      return;
    }
    onPaid(data[0]);
  }

  return (
    <AdminModal title="Record payment" subtitle={`INV-${invoice.invoice_no} for ${invoice.patient_name}`} onClose={onClose}>
      <p className={styles.confirmText}>
        Mark <strong>{rs(invoice.amount)}</strong> as received. It will count towards this month's collected revenue.
      </p>
      <div className={styles.field} style={{ marginTop: 16 }}>
        <label className={styles.label} htmlFor="pay-method">Payment method</label>
        <select id="pay-method" className={styles.input} value={method} onChange={(e) => setMethod(e.target.value)}>
          {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      {serverError && <p className={styles.serverError}>{serverError}</p>}
      <div className={styles.modalActions}>
        <button type="button" className={styles.btn} onClick={onClose}>Cancel</button>
        <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} disabled={saving} onClick={confirm}>
          {saving ? 'Saving...' : 'Mark as paid'}
        </button>
      </div>
    </AdminModal>
  );
}

/* ---------- page ---------- */
export default function AdminRevenue() {
  const [invoices, setInvoices] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [setup, setSetup] = useState(false);
  const [now, setNow] = useState(null);
  const [tab, setTab] = useState('All');
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [paying, setPaying] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  function flash(type, text) {
    setNotice({ type, text });
    if (type === 'ok') setTimeout(() => setNotice(null), 3000);
  }

  useEffect(() => {
    setNow(new Date());

    async function load() {
      const [inv, dep] = await Promise.all([
        supabase.from('invoices').select('*').order('issued_at', { ascending: false }),
        supabase.from('departments').select('name').order('name', { ascending: true }),
      ]);
      if (inv.error) setSetup(true);
      else setInvoices(inv.data || []);
      if (!dep.error) setDepartments((dep.data || []).map((d) => d.name));
      setLoading(false);
    }
    load();
  }, []);

  async function confirmDelete() {
    setBusy(true);
    const { error } = await supabase.from('invoices').delete().eq('id', deleting.id);
    setBusy(false);
    if (error) {
      flash('error', 'Could not delete this invoice.');
      setDeleting(null);
      return;
    }
    setInvoices((list) => list.filter((i) => i.id !== deleting.id));
    flash('ok', `Invoice INV-${deleting.invoice_no} was deleted.`);
    setDeleting(null);
  }

  if (!now) {
    return <div className={styles.wrap}><p className={styles.subtitle}>Loading...</p></div>;
  }

  /* ----- numbers ----- */
  const paid = invoices.filter((i) => i.status === 'Paid' && i.paid_at);
  const pendingList = invoices.filter((i) => i.status === 'Pending');

  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: monthKey(d), label: d.toLocaleDateString('en-US', { month: 'short' }), total: 0 });
  }
  paid.forEach((inv) => {
    const m = months.find((x) => x.key === monthKey(new Date(inv.paid_at)));
    if (m) m.total += Number(inv.amount);
  });

  const thisMonth = months[5].total;
  const lastMonth = months[4].total;
  const trend = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : null;
  const sixMonthTotal = months.reduce((s, m) => s + m.total, 0);
  const outstanding = pendingList.reduce((s, i) => s + Number(i.amount), 0);
  const maxMonth = Math.max(1, ...months.map((m) => m.total));

  const countFor = (s) => (s === 'All' ? invoices.length : invoices.filter((i) => i.status === s).length);
  const q = norm(query);
  const shown = invoices.filter(
    (i) =>
      (tab === 'All' || i.status === tab) &&
      (!q || [i.patient_name, i.patient_phone, i.description, i.department, `inv-${i.invoice_no}`].some((x) => norm(x).includes(q)))
  );

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Revenue</h1>
          <p className={styles.subtitle}>
            {loading ? 'Loading invoices...' : 'Create invoices, record payments and track what the hospital has collected.'}
          </p>
        </div>
        <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} disabled={setup} onClick={() => setCreating(true)}>
          <Plus size={16} strokeWidth={2.5} /> Create invoice
        </button>
      </div>

      {setup && (
        <p className={`${styles.notice} ${styles.noticeInfo}`}>
          The invoices table does not exist yet. Run the invoices SQL in Supabase, then refresh this page.
        </p>
      )}
      {notice && (
        <p className={`${styles.notice} ${notice.type === 'ok' ? styles.noticeOk : styles.noticeError}`}>{notice.text}</p>
      )}

      <div className={styles.statRow}>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.toneTeal}`}><Wallet size={20} strokeWidth={2} /></span>
          <div>
            <p className={styles.statLabel}>Collected this month</p>
            <p className={styles.statValue}>{rs(thisMonth)}</p>
            <p className={styles.statSub}>
              {trend === null ? 'No data last month' : (
                <span className={trend >= 0 ? styles.trendUp : styles.trendDown}>
                  {trend >= 0 ? <TrendingUp size={11} strokeWidth={2.5} /> : <TrendingDown size={11} strokeWidth={2.5} />}
                  {Math.abs(trend).toFixed(1)}% vs last month
                </span>
              )}
            </p>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.toneAmber}`}><Clock size={20} strokeWidth={2} /></span>
          <div>
            <p className={styles.statLabel}>Outstanding</p>
            <p className={styles.statValue}>{rs(outstanding)}</p>
            <p className={styles.statSub}>{pendingList.length} unpaid invoice{pendingList.length === 1 ? '' : 's'}</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.toneBlue}`}><TrendingUp size={20} strokeWidth={2} /></span>
          <div>
            <p className={styles.statLabel}>Last 6 months</p>
            <p className={styles.statValue}>{rs(sixMonthTotal)}</p>
            <p className={styles.statSub}>Collected in total</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.toneGreen}`}><FileText size={20} strokeWidth={2} /></span>
          <div>
            <p className={styles.statLabel}>Invoices</p>
            <p className={styles.statValue}>{invoices.length}</p>
            <p className={styles.statSub}>{countFor('Paid')} paid</p>
          </div>
        </div>
      </div>

      <section className={styles.panel} style={{ marginBottom: 12 }}>
        <div className={styles.panelHead}>
          <h2 className={styles.panelTitle}>Revenue collected per month</h2>
          <p className={styles.panelSub}>Money received, by the month the payment was recorded</p>
        </div>
        <div className={styles.chart}>
          {months.map((m) => (
            <div key={m.key} className={styles.barCol}>
              <span className={styles.barValue}>{m.total > 0 ? compact(m.total) : '0'}</span>
              <div className={styles.barTrack}>
                <div className={styles.bar} style={{ height: `${(m.total / maxMonth) * 100}%` }} />
              </div>
              <span className={styles.barLabel}>{m.label}</span>
            </div>
          ))}
        </div>
      </section>

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
        <SearchInput width={260} label="Search staff" placeholder="Search name, role or email" value={query} onChange={setQuery} />
      </div>

      <div className={styles.tablePanel}>
        {shown.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>{loading ? 'Loading...' : 'No invoices found'}</p>
            {!loading && (
              <p className={styles.emptyText}>
                {invoices.length === 0 ? 'Click "Create invoice" to bill the first patient.' : 'Try another status or clear the search.'}
              </p>
            )}
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Invoice</th><th>Patient</th><th>Description</th><th>Amount</th><th>Status</th><th>Date</th>
                  <th className={styles.thRight}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((i) => (
                  <tr key={i.id}>
                    <td className={styles.noWrap}><strong>INV-{i.invoice_no}</strong></td>
                    <td>
                      <div className={styles.person}>
                        <span className={styles.avatar}>{initials(i.patient_name)}</span>
                        <div>
                          <p className={styles.personName}>{i.patient_name}</p>
                          <p className={styles.personSub}>{i.department || i.patient_phone || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td>{i.description}</td>
                    <td className={styles.amount}>{rs(i.amount)}</td>
                    <td>
                      <span className={`${styles.chip} ${STATUS_CHIP[i.status] || styles.chipInactive}`}>{i.status}</span>
                      {i.method && <p className={styles.personSub}>{i.method}</p>}
                    </td>
                    <td className={styles.noWrap}>
                      {prettyDate((i.status === 'Paid' && i.paid_at ? i.paid_at : i.issued_at).slice(0, 10))}
                    </td>
                    <td className={styles.tdRight}>
                      <span className={styles.rowActions}>
                        {i.status === 'Pending' && (
                          <button type="button" className={`${styles.btn} ${styles.btnSm}`} onClick={() => setPaying(i)}>
                            <Check size={13} strokeWidth={2.75} /> Mark paid
                          </button>
                        )}
                        <button
                          type="button" className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                          aria-label={`Delete invoice ${i.invoice_no}`} onClick={() => setDeleting(i)}
                        >
                          <Trash2 size={14} strokeWidth={2} />
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

      {creating && (
        <InvoiceModal
          departments={departments}
          onClose={() => setCreating(false)}
          onSaved={(row) => {
            setInvoices((list) => [row, ...list]);
            setCreating(false);
            flash('ok', `Invoice INV-${row.invoice_no} created.`);
          }}
        />
      )}

      {paying && (
        <PayModal
          invoice={paying}
          onClose={() => setPaying(null)}
          onPaid={(row) => {
            setInvoices((list) => list.map((x) => (x.id === row.id ? row : x)));
            setPaying(null);
            flash('ok', `Payment of ${rs(row.amount)} recorded.`);
          }}
        />
      )}

      {deleting && (
        <AdminModal title="Delete this invoice?" onClose={() => setDeleting(null)}>
          <p className={styles.confirmText}>
            Invoice <strong>INV-{deleting.invoice_no}</strong> for {deleting.patient_name} ({rs(deleting.amount)}) will be
            permanently deleted.{deleting.status === 'Paid' ? ' It will also be removed from the revenue totals.' : ''}
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