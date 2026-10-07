'use client';

import { useState } from 'react';
import { HeartPulse, Pill, ClipboardCheck } from 'lucide-react';
import styles from '../../../assets/styles/StaffDashboards.module.css';

const PATIENTS = [
  { id: 1, name: 'Bilal Ahmed', room: 'Ward 2, Bed 4', condition: 'Post-op recovery', status: 'Stable' },
  { id: 2, name: 'Hina Tariq', room: 'Ward 1, Bed 2', condition: 'Hypertension monitoring', status: 'Needs check' },
  { id: 3, name: 'Sana Khan', room: 'Ward 2, Bed 1', condition: 'Fever observation', status: 'Stable' },
];

const MED_SCHEDULE = [
  { id: 1, patient: 'Bilal Ahmed', medicine: 'Paracetamol 500mg', time: '2:00 PM', given: false },
  { id: 2, patient: 'Hina Tariq', medicine: 'Losartan 50mg', time: '2:30 PM', given: false },
  { id: 3, patient: 'Sana Khan', medicine: 'Amoxicillin 250mg', time: '3:00 PM', given: true },
];

const INITIAL_TASKS = [
  { id: 1, label: 'Morning vitals round — Ward 1', done: true },
  { id: 2, label: 'Morning vitals round — Ward 2', done: true },
  { id: 3, label: 'Afternoon medication round', done: false },
  { id: 4, label: 'Update patient charts', done: false },
];

const PATIENT_PILL = { Stable: styles.pillGreen, 'Needs check': styles.pillWarn };

export default function NurseDashboard() {
  const [meds, setMeds] = useState(MED_SCHEDULE);
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  function markGiven(id) {
    setMeds((list) => list.map((m) => (m.id === id ? { ...m, given: true } : m)));
  }

  function toggleTask(id) {
    setTasks((list) => list.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  const needsCheck = PATIENTS.filter((p) => p.status === 'Needs check').length;
  const pendingMeds = meds.filter((m) => !m.given).length;

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Nursing station</h1>
          <p className={styles.subtitle}>Assigned patients, medication schedule, and today's rounds.</p>
        </div>
      </div>

      <div className={styles.statRow}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Assigned patients</p>
          <p className={styles.statValue}>{PATIENTS.length}</p>
        </div>
        <div className={`${styles.statCard} ${styles.amber}`}>
          <p className={styles.statLabel}>Needs check</p>
          <p className={styles.statValue}>{needsCheck}</p>
        </div>
        <div className={`${styles.statCard} ${styles.blue}`}>
          <p className={styles.statLabel}>Medications pending</p>
          <p className={styles.statValue}>{pendingMeds}</p>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.mainCol}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Assigned patients</h2>
            </div>
            {PATIENTS.map((p) => (
              <div key={p.id} className={styles.row}>
                <span className={`${styles.rowIcon} ${styles.rowIconTeal}`}><HeartPulse size={17} strokeWidth={2} /></span>
                <div className={styles.rowInfo}>
                  <p className={styles.rowTitle}>{p.name}</p>
                  <p className={styles.rowSub}>{p.room} · {p.condition}</p>
                </div>
                <span className={`${styles.pill} ${PATIENT_PILL[p.status]}`}>{p.status}</span>
              </div>
            ))}
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Medication schedule</h2>
              <span className={styles.cardCount}>{pendingMeds} pending</span>
            </div>
            {meds.map((m) => (
              <div key={m.id} className={styles.row}>
                <span className={`${styles.rowIcon} ${m.given ? styles.rowIconTeal : styles.rowIconAmber}`}><Pill size={17} strokeWidth={2} /></span>
                <div className={styles.rowInfo}>
                  <p className={styles.rowTitle}>{m.medicine}</p>
                  <p className={styles.rowSub}>{m.patient} · {m.time}</p>
                </div>
                {m.given ? (
                  <span className={`${styles.pill} ${styles.pillGreen}`}>Given</span>
                ) : (
                  <button type="button" className={styles.btnGhost} onClick={() => markGiven(m.id)}>Mark given</button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.sideCol}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Today's rounds</h2>
            </div>
            {tasks.map((t) => (
              <div key={t.id} className={styles.taskRow}>
                <button
                  type="button"
                  className={`${styles.taskCheckbox} ${t.done ? styles.taskCheckboxDone : ''}`}
                  onClick={() => toggleTask(t.id)}
                  aria-label={t.done ? 'Mark incomplete' : 'Mark complete'}
                >
                  {t.done && <ClipboardCheck size={12} strokeWidth={2.5} />}
                </button>
                <span className={`${styles.taskLabel} ${t.done ? styles.taskLabelDone : ''}`}>{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}