'use client';

import { useState } from 'react';
import { Pill as PillIcon, FileText, Scan, BedDouble, Check } from 'lucide-react';
import styles from '../../../assets/styles/DoctorDashboard.module.css';

const PATIENTS = [
  {
    id: 1,
    name: 'Bilal Ahmed',
    age: 42,
    gender: 'Male',
    queueStatus: 'Current',
    vitals: { bp: '128/84', pulse: '78 bpm', temp: '98.4°F', spo2: '98%' },
    bpHistory: [118, 122, 130, 126, 128],
    medications: [
      { name: 'Amlodipine 5mg', schedule: 'Once daily, morning' },
      { name: 'Aspirin 75mg', schedule: 'Once daily, after dinner' },
    ],
    history: [
      { title: 'Follow-up visit', detail: '12 Sep 2026 · Blood pressure review' },
      { title: 'Initial diagnosis', detail: '3 Jun 2021 · Hypertension' },
    ],
  },
  {
    id: 2,
    name: 'Sana Khan',
    age: 29,
    gender: 'Female',
    queueStatus: 'Waiting',
    vitals: { bp: '112/74', pulse: '82 bpm', temp: '99.1°F', spo2: '99%' },
    bpHistory: [108, 110, 114, 111, 112],
    medications: [{ name: 'Paracetamol 500mg', schedule: 'As needed, max 3/day' }],
    history: [{ title: 'First visit', detail: 'Today · Fever, sore throat' }],
  },
  {
    id: 3,
    name: 'Hina Tariq',
    age: 55,
    gender: 'Female',
    queueStatus: 'Waiting',
    vitals: { bp: '134/88', pulse: '76 bpm', temp: '98.2°F', spo2: '97%' },
    bpHistory: [130, 132, 129, 135, 134],
    medications: [{ name: 'Losartan 50mg', schedule: 'Once daily, morning' }],
    history: [{ title: 'Follow-up visit', detail: '20 Aug 2026 · BP monitoring' }],
  },
];

const QUEUE_PILL = { Waiting: styles.pillWaiting, Current: styles.pillCurrent, Done: styles.pillDone };

function BPChart({ data }) {
  const width = 400;
  const height = 100;
  const min = Math.min(...data) - 5;
  const max = Math.max(...data) + 5;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / (max - min)) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className={styles.chartWrap}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100">
        <polyline points={points} fill="none" stroke="var(--brand-accent)" strokeWidth="2.5" />
        {data.map((v, i) => {
          const x = (i / (data.length - 1)) * width;
          const y = height - ((v - min) / (max - min)) * height;
          return <circle key={i} cx={x} cy={y} r="4" fill="var(--brand-accent)" />;
        })}
      </svg>
      <div className={styles.chartCaption}>
        <span>5 visits ago</span>
        <span>Most recent: {data[data.length - 1]} systolic</span>
      </div>
    </div>
  );
}

export default function DoctorDashboard() {
  const [selectedId, setSelectedId] = useState(PATIENTS[0].id);
  const [doneActions, setDoneActions] = useState([]);
  const [note, setNote] = useState('');
  const [savedNote, setSavedNote] = useState(false);

  const patient = PATIENTS.find((p) => p.id === selectedId);

  function toggleAction(action) {
    setDoneActions((list) =>
      list.includes(action) ? list.filter((a) => a !== action) : [...list, action]
    );
  }

  function saveNote() {
    setSavedNote(true);
    setTimeout(() => setSavedNote(false), 2000);
  }

  const ACTIONS = [
    { key: 'prescribe', label: 'Prescribe', icon: PillIcon },
    { key: 'lab', label: 'Order lab test', icon: FileText },
    { key: 'imaging', label: 'Order imaging', icon: Scan },
    { key: 'admit', label: 'Admit patient', icon: BedDouble },
  ];

  return (
    <div className={styles.wrap}>
      <aside className={styles.queueCol}>
        <h2 className={styles.queueTitle}>Today's queue</h2>
        <p className={styles.queueSub}>{PATIENTS.length} patients</p>
        {PATIENTS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`${styles.queueItem} ${p.id === selectedId ? styles.queueItemActive : ''}`}
            onClick={() => {
              setSelectedId(p.id);
              setDoneActions([]);
              setNote('');
            }}
          >
            <span className={styles.queueAvatar}>{p.name[0]}</span>
            <div>
              <p className={styles.queueName}>{p.name}</p>
              <p className={styles.queueMeta}>{p.age} · {p.gender}</p>
            </div>
            <span className={`${styles.pill} ${QUEUE_PILL[p.queueStatus]}`}>{p.queueStatus}</span>
          </button>
        ))}
      </aside>

      <div className={styles.main}>
        <div className={styles.patientHeader}>
          <div>
            <h1 className={styles.patientName}>{patient.name}</h1>
            <p className={styles.patientMeta}>{patient.age} years · {patient.gender}</p>
          </div>
          <div className={styles.actionRow}>
            {ACTIONS.map((a) => {
              const done = doneActions.includes(a.key);
              return (
                <button
                  key={a.key}
                  type="button"
                  className={`${styles.actionBtn} ${done ? styles.actionBtnDone : ''}`}
                  onClick={() => toggleAction(a.key)}
                >
                  {done ? <Check size={14} strokeWidth={2.5} /> : <a.icon size={14} strokeWidth={2} />}
                  {done ? 'Done' : a.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.vitalsRow}>
          <div className={styles.vitalCard}>
            <p className={styles.vitalLabel}>Blood pressure</p>
            <p className={styles.vitalValue}>{patient.vitals.bp}</p>
          </div>
          <div className={styles.vitalCard}>
            <p className={styles.vitalLabel}>Pulse</p>
            <p className={styles.vitalValue}>{patient.vitals.pulse}</p>
          </div>
          <div className={styles.vitalCard}>
            <p className={styles.vitalLabel}>Temperature</p>
            <p className={styles.vitalValue}>{patient.vitals.temp}</p>
          </div>
          <div className={styles.vitalCard}>
            <p className={styles.vitalLabel}>SpO2</p>
            <p className={styles.vitalValue}>{patient.vitals.spo2}</p>
          </div>
        </div>

        <div className={styles.grid}>
          <div>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>BP trend</h2>
              <BPChart data={patient.bpHistory} />
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Doctor's notes</h2>
              <textarea
                className={styles.notesArea}
                placeholder="Write consultation notes here..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <button type="button" className={styles.saveNoteBtn} onClick={saveNote}>
                Save note
              </button>
              {savedNote && <span className={styles.savedTag}>Saved</span>}
            </div>
          </div>

          <div>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Active medications</h2>
              {patient.medications.map((m) => (
                <div key={m.name} className={styles.medRow}>
                  <div className={styles.medInfo}>
                    <p className={styles.medName}>{m.name}</p>
                    <p className={styles.medMeta}>{m.schedule}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Visit history</h2>
              {patient.history.map((h) => (
                <div key={h.title + h.detail} className={styles.historyRow}>
                  <div className={styles.historyInfo}>
                    <p className={styles.historyTitle}>{h.title}</p>
                    <p className={styles.historyMeta}>{h.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}