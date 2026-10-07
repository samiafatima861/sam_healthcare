'use client';

import { useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import styles from '../../../assets/styles/StaffDashboards.module.css';

const INITIAL_TASKS = [
  { id: 1, label: 'Morning vitals round — Ward 1', done: true },
  { id: 2, label: 'Morning vitals round — Ward 2', done: true },
  { id: 3, label: 'Afternoon medication round', done: false },
  { id: 4, label: 'Update patient charts', done: false },
];

export default function NurseRounds() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  function toggleTask(id) {
    setTasks((list) => list.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  const remaining = tasks.filter((t) => !t.done).length;

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Today's rounds</h1>
          <p className={styles.subtitle}>{remaining} tasks left to complete.</p>
        </div>
      </div>

      <div className={styles.card}>
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
  );
}