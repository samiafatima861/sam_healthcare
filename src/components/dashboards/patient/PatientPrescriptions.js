'use client';

import { useEffect, useState } from 'react';
import { Pill, Download, FileText } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { prettyDate } from '../../../lib/appointmentUtils';
import { downloadPrescriptionPdf } from '../../../lib/prescriptionDownload';
import styles from '../../../assets/styles/PortalPages.module.css';

const box = { fontSize: 'var(--fs-xs)', fontWeight: 600, padding: '11px 14px', borderRadius: 'var(--radius-sm)', marginBottom: 14 };
const boxError = { ...box, color: 'var(--danger-fg)', background: 'var(--danger-bg)' };
const boxOk = { ...box, color: 'var(--success-fg)', background: 'var(--success-bg)' };

export default function PatientPrescriptions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    supabase
      .from('prescriptions')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (err) setError('Could not load your prescriptions. Make sure the patient SQL was run in Supabase.');
        else setItems(data || []);
        setLoading(false);
      });
  }, []);

  async function download(rx) {
    setBusyId(rx.id);
    setMessage(null);
    try {
      await downloadPrescriptionPdf(rx.id);
      setMessage({ type: 'ok', text: 'Your PDF is downloading.' });
      setTimeout(() => setMessage(null), 3500);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
    setBusyId(null);
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Prescriptions</h1>
          <p className={styles.subtitle}>
            {loading ? 'Loading your prescriptions...' : 'Everything your doctors have prescribed. Download any of them as a PDF.'}
          </p>
        </div>
      </div>

      {error && <p style={boxError}>{error}</p>}
      {message && <p style={message.type === 'ok' ? boxOk : boxError} role="status">{message.text}</p>}

      {items.length === 0 ? (
        <div className={styles.card}>
          <div className={styles.empty}>
            <span className={styles.emptyIcon}><FileText size={20} strokeWidth={2} /></span>
            <p className={styles.emptyTitle}>{loading ? 'Loading...' : 'No prescriptions yet'}</p>
            <p className={styles.emptyText}>When a doctor prescribes medicine for you, it appears here.</p>
          </div>
        </div>
      ) : (
        items.map((rx) => (
          <div key={rx.id} className={styles.card}>
            <div className={styles.row}>
              <span className={`${styles.rowIcon} ${styles.rowIconTeal}`}>
                <FileText size={17} strokeWidth={2} />
              </span>
              <div className={styles.rowInfo}>
                <p className={styles.rowTitle}>{rx.doctor_name || 'Your doctor'}</p>
                <p className={styles.rowSub}>
                  {prettyDate((rx.created_at || '').slice(0, 10))}
                  {rx.diagnosis ? ` · Diagnosis: ${rx.diagnosis}` : ''}
                </p>
              </div>
              <div className={styles.rowRight}>
                <button type="button" className={styles.btn} disabled={busyId === rx.id} onClick={() => download(rx)}>
                  <Download size={14} strokeWidth={2.25} />
                  {busyId === rx.id ? 'Preparing...' : 'Download PDF'}
                </button>
              </div>
            </div>

            {(rx.medicines || []).map((m, i) => (
              <div key={i} className={styles.row}>
                <span className={`${styles.rowIcon} ${styles.rowIconBlue}`}>
                  <Pill size={17} strokeWidth={2} />
                </span>
                <div className={styles.rowInfo}>
                  <p className={styles.rowTitle}>{m.name}</p>
                  <p className={styles.rowSub}>
                    {[m.dosage, m.frequency, m.duration].filter(Boolean).join(' · ') || 'No details given'}
                  </p>
                </div>
              </div>
            ))}

            {rx.instructions && (
              <div className={styles.row}>
                <div className={styles.rowInfo}>
                  <p className={styles.rowSub}>Instructions</p>
                  <p className={styles.rowTitle} style={{ fontWeight: 500, whiteSpace: 'pre-wrap' }}>{rx.instructions}</p>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}