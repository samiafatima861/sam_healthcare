'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Phone, Mail, Plus, X, Stethoscope, Check } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { initials, titleCase, fmtTime, prettyDate } from '../../../lib/appointmentUtils';
import styles from '../../../assets/styles/DoctorVisit.module.css';

const FREQUENCIES = ['Once daily', 'Twice daily', 'Three times daily', 'Four times daily', 'At bedtime', 'As needed'];
const emptyMed = () => ({ name: '', dosage: '', frequency: FREQUENCIES[0], duration: '' });

const STATUS_CHIP = {
  Pending: styles.chipPending,
  Confirmed: styles.chipConfirmed,
  'In consultation': styles.chipLive,
  Completed: styles.chipDone,
  Cancelled: styles.chipCancelled,
};

export default function DoctorPatientVisit({ appointmentId }) {
  const [appt, setAppt] = useState(null);
  const [history, setHistory] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [setupNote, setSetupNote] = useState('');

  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [meds, setMeds] = useState([emptyMed()]);
  const [instructions, setInstructions] = useState('');

  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState(null);

  function flash(type, text) {
    setMessage({ type, text });
    if (type === 'ok') setTimeout(() => setMessage(null), 2500);
  }

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('appointments').select('*').eq('id', appointmentId).maybeSingle();

      if (error || !data) {
        setLoadError('We could not find this appointment.');
        setLoading(false);
        return;
      }

      setAppt(data);
      setDiagnosis(data.diagnosis || '');
      setNotes(data.doctor_notes || '');

      const [past, rx] = await Promise.all([
        supabase.from('appointments').select('*')
          .eq('patient_phone', data.patient_phone).neq('id', data.id)
          .order('appointment_date', { ascending: false }),
        supabase.from('prescriptions').select('*')
          .eq('patient_phone', data.patient_phone)
          .order('created_at', { ascending: false }),
      ]);

      setHistory(past.data || []);
      if (rx.error) {
        setSetupNote('Prescriptions are not set up yet. Run the SQL from the setup step in Supabase.');
      } else {
        setPrescriptions(rx.data || []);
      }
      setLoading(false);
    }
    load();
  }, [appointmentId]);

  async function updateAppointment(fields) {
    const { data, error } = await supabase
      .from('appointments').update(fields).eq('id', appt.id).select();
    if (error || !data || data.length === 0) return false;
    setAppt((a) => ({ ...a, ...fields }));
    return true;
  }

  async function changeStatus(status) {
    setBusy('status');
    const ok = await updateAppointment({ status });
    setBusy('');
    if (ok) flash('ok', `Status changed to ${status}.`);
    else flash('error', 'Could not change the status. Check the update policy in Supabase.');
  }

  async function saveNotes() {
    setBusy('notes');
    const ok = await updateAppointment({
      diagnosis: diagnosis.trim() || null,
      doctor_notes: notes.trim() || null,
    });
    setBusy('');
    if (ok) flash('ok', 'Notes saved.');
    else flash('error', 'Could not save notes. Make sure you ran the SQL that adds the diagnosis and doctor_notes columns.');
  }

  function updateMed(i, field, value) {
    setMeds((list) => list.map((m, idx) => (idx === i ? { ...m, [field]: value } : m)));
  }

  async function savePrescription() {
    const cleaned = meds
      .map((m) => ({ name: m.name.trim(), dosage: m.dosage.trim(), frequency: m.frequency, duration: m.duration.trim() }))
      .filter((m) => m.name);

    if (cleaned.length === 0) {
      flash('error', 'Add at least one medicine name.');
      return;
    }

    setBusy('rx');
    const { data, error } = await supabase
      .from('prescriptions')
      .insert({
        appointment_id: appt.id,
        patient_name: appt.patient_name,
        patient_phone: appt.patient_phone,
        doctor_name: appt.doctor_name,
        diagnosis: diagnosis.trim() || null,
        medicines: cleaned,
        instructions: instructions.trim() || null,
      })
      .select()
      .single();
    setBusy('');

    if (error || !data) {
      flash('error', 'Could not save the prescription. Make sure you ran the SQL in Supabase.');
      return;
    }

    setPrescriptions((list) => [data, ...list]);
    setMeds([emptyMed()]);
    setInstructions('');
    flash('ok', 'Prescription saved for this patient.');
  }

  if (loading) {
    return <div className={styles.wrap}><p className={styles.subtitle}>Loading patient...</p></div>;
  }

  if (loadError) {
    return (
      <div className={styles.wrap}>
        <Link href="/dashboard/doctor/consultation" className={styles.backLink}>
          <ArrowLeft size={14} strokeWidth={2.5} /> Back to patient queue
        </Link>
        <div className={styles.card}><p className={styles.emptyTitle}>{loadError}</p></div>
      </div>
    );
  }

  const canStart = appt.status === 'Pending' || appt.status === 'Confirmed';
  const isLive = appt.status === 'In consultation';
  const isDone = appt.status === 'Completed';
  const phoneHref = `tel:${(appt.patient_phone || '').replace(/[^\d+]/g, '')}`;

  return (
    <div className={styles.wrap}>
      <Link href="/dashboard/doctor/consultation" className={styles.backLink}>
        <ArrowLeft size={14} strokeWidth={2.5} /> Back to patient queue
      </Link>

      {message && (
        <p className={message.type === 'ok' ? styles.flashOk : styles.flashError}>{message.text}</p>
      )}
      {setupNote && <p className={styles.flashError}>{setupNote}</p>}

      <section className={`${styles.card} ${styles.headCard}`}>
        <div className={styles.headTop}>
          <span className={styles.bigAvatar}>{initials(appt.patient_name)}</span>
          <div className={styles.headInfo}>
            <div className={styles.headNameRow}>
              <h1 className={styles.patientName}>{appt.patient_name}</h1>
              <span className={`${styles.chip} ${STATUS_CHIP[appt.status] || styles.chipPending}`}>{appt.status}</span>
            </div>
            <p className={styles.contactLine}>
              {appt.patient_phone}{appt.patient_email ? ` · ${appt.patient_email}` : ''}
            </p>
          </div>

          <div className={styles.headBtns}>
            {canStart && (
              <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} disabled={busy === 'status'} onClick={() => changeStatus('In consultation')}>
                <Stethoscope size={14} strokeWidth={2.25} /> Start consultation
              </button>
            )}
            {isLive && (
              <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} disabled={busy === 'status'} onClick={() => changeStatus('Completed')}>
                <Check size={14} strokeWidth={2.5} /> Complete visit
              </button>
            )}
            {isDone && (
              <button type="button" className={styles.btn} disabled={busy === 'status'} onClick={() => changeStatus('In consultation')}>
                Reopen visit
              </button>
            )}
            <a href={phoneHref} className={styles.btn}><Phone size={14} strokeWidth={2.25} /> Call</a>
            {appt.patient_email && (
              <a href={`mailto:${appt.patient_email}`} className={styles.btn}><Mail size={14} strokeWidth={2.25} /> Email</a>
            )}
          </div>
        </div>

        <div className={styles.infoGrid}>
          <div><p className={styles.fieldLabel}>Date</p><p className={styles.fieldValue}>{prettyDate(appt.appointment_date)}</p></div>
          <div><p className={styles.fieldLabel}>Time</p><p className={styles.fieldValue}>{fmtTime(appt.appointment_time)}</p></div>
          <div><p className={styles.fieldLabel}>Department</p><p className={styles.fieldValue}>{titleCase(appt.department)}</p></div>
          <div><p className={styles.fieldLabel}>Doctor</p><p className={styles.fieldValue}>{appt.doctor_name}</p></div>
        </div>

        <div className={styles.reasonWrap}>
          <p className={styles.fieldLabel}>Reason for visit</p>
          <p className={styles.reasonBox}>{appt.reason || 'No reason given.'}</p>
        </div>
      </section>

      <div className={styles.layout}>
        <div className={styles.col}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Write prescription</h2>
            <p className={styles.cardSub}>This prescription is saved for {appt.patient_name} only.</p>

            <div className={styles.medHead}>
              <span>Medicine</span><span>Dosage</span><span>Frequency</span><span>Duration</span><span />
            </div>

            {meds.map((m, i) => (
              <div key={i} className={styles.medRow}>
                <input className={styles.input} placeholder="Medicine name" aria-label="Medicine name"
                  value={m.name} onChange={(e) => updateMed(i, 'name', e.target.value)} />
                <input className={styles.input} placeholder="e.g. 5mg" aria-label="Dosage"
                  value={m.dosage} onChange={(e) => updateMed(i, 'dosage', e.target.value)} />
                <select className={styles.input} aria-label="Frequency"
                  value={m.frequency} onChange={(e) => updateMed(i, 'frequency', e.target.value)}>
                  {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                <input className={styles.input} placeholder="e.g. 7 days" aria-label="Duration"
                  value={m.duration} onChange={(e) => updateMed(i, 'duration', e.target.value)} />
                {meds.length > 1 ? (
                  <button type="button" className={styles.removeBtn} aria-label="Remove medicine"
                    onClick={() => setMeds((list) => list.filter((_, idx) => idx !== i))}>
                    <X size={14} strokeWidth={2.5} />
                  </button>
                ) : <span />}
              </div>
            ))}

            <button type="button" className={styles.addBtn} onClick={() => setMeds((list) => [...list, emptyMed()])}>
              <Plus size={14} strokeWidth={2.5} /> Add another medicine
            </button>

            <label className={styles.label} htmlFor="rx-instructions">Instructions for the patient</label>
            <textarea id="rx-instructions" className={`${styles.input} ${styles.textarea}`}
              placeholder="e.g. Take after meals. Avoid cold drinks. Review in one week."
              value={instructions} onChange={(e) => setInstructions(e.target.value)} />

            <button type="button" className={`${styles.btn} ${styles.btnPrimary} ${styles.saveBtn}`}
              disabled={busy === 'rx'} onClick={savePrescription}>
              {busy === 'rx' ? 'Saving...' : 'Save prescription'}
            </button>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Diagnosis and notes</h2>
            <p className={styles.cardSub}>Saved with this visit.</p>

            <label className={styles.label} htmlFor="dx">Diagnosis</label>
            <input id="dx" className={styles.input} placeholder="e.g. Hypertension, stage 1"
              value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />

            <label className={styles.label} htmlFor="dn">Consultation notes</label>
            <textarea id="dn" className={`${styles.input} ${styles.textarea}`}
              placeholder="Findings, advice given, follow-up plan..."
              value={notes} onChange={(e) => setNotes(e.target.value)} />

            <button type="button" className={`${styles.btn} ${styles.saveBtn}`} disabled={busy === 'notes'} onClick={saveNotes}>
              {busy === 'notes' ? 'Saving...' : 'Save notes'}
            </button>
          </section>
        </div>

        <div className={styles.col}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Patient record</h2>
            <dl className={styles.recordList}>
              <div className={styles.recordRow}><dt>Phone</dt><dd>{appt.patient_phone}</dd></div>
              <div className={styles.recordRow}><dt>Email</dt><dd>{appt.patient_email || 'Not provided'}</dd></div>
              <div className={styles.recordRow}><dt>Total visits</dt><dd>{history.length + 1}</dd></div>
              <div className={styles.recordRow}><dt>Prescriptions</dt><dd>{prescriptions.length}</dd></div>
            </dl>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Previous prescriptions</h2>
            {prescriptions.length === 0 ? (
              <p className={styles.emptyText}>No prescriptions for this patient yet.</p>
            ) : (
              <ul className={styles.rxList}>
                {prescriptions.map((rx) => (
                  <li key={rx.id} className={styles.rxItem}>
                    <div className={styles.rxTop}>
                      <span className={styles.rxDate}>{prettyDate(rx.created_at.slice(0, 10))}</span>
                      {rx.diagnosis && <span className={styles.rxDx}>{rx.diagnosis}</span>}
                    </div>
                    <ul className={styles.rxMeds}>
                      {(rx.medicines || []).map((m, i) => (
                        <li key={i}>
                          <strong>{m.name}</strong>
                          <span> {[m.dosage, m.frequency, m.duration].filter(Boolean).join(' · ')}</span>
                        </li>
                      ))}
                    </ul>
                    {rx.instructions && <p className={styles.rxNote}>{rx.instructions}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Visit history</h2>
            {history.length === 0 ? (
              <p className={styles.emptyText}>This is the patient's first visit.</p>
            ) : (
              <ul className={styles.histList}>
                {history.map((h) => (
                  <li key={h.id} className={styles.histRow}>
                    <div>
                      <p className={styles.histTitle}>{titleCase(h.department)}</p>
                      <p className={styles.histMeta}>{prettyDate(h.appointment_date)} · {fmtTime(h.appointment_time)}</p>
                    </div>
                    <span className={`${styles.chip} ${STATUS_CHIP[h.status] || styles.chipPending}`}>{h.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}