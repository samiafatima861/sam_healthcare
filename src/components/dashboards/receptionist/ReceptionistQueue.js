'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import styles from '../../../assets/styles/ReceptionistDashboard.module.css';

const INITIAL_QUEUE = [
  { id: 1, patient: 'Bilal Ahmed', doctor: 'Dr. Priya Sharma', time: '4:00 PM', status: 'With doctor' },
  { id: 2, patient: 'Sana Khan', doctor: 'Dr. Priya Sharma', time: '4:20 PM', status: 'Waiting' },
  { id: 3, patient: 'Imran Farooq', doctor: 'Dr. Arjun Mehta', time: '4:30 PM', status: 'Waiting' },
  { id: 4, patient: 'Hina Tariq', doctor: 'Dr. Neha Verma', time: '3:40 PM', status: 'Completed' },
];

const QUEUE_PILL = { Waiting: styles.pillWaiting, 'With doctor': styles.pillWithDoctor, Completed: styles.pillDone };

export default function ReceptionistQueue() {
  const [queue, setQueue] = useState(INITIAL_QUEUE);

  function advance(id) {
    setQueue((list) =>
      list.map((q) => {
        if (q.id !== id) return q;
        if (q.status === 'Waiting') return { ...q, status: 'With doctor' };
        if (q.status === 'With doctor') return { ...q, status: 'Completed' };
        return q;
      })
    );
  }

  const waiting = queue.filter((q) => q.status === 'Waiting').length;

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Live queue</h1>
          <p className={styles.subtitle}>{waiting} patients waiting right now.</p>
        </div>
        <button type="button" className={styles.btn}>
          <UserPlus size={16} strokeWidth={2.25} />
          Add walk-in
        </button>
      </div>

      <div className={styles.card}>
        {queue.map((q) => (
          <div key={q.id} className={styles.queueRow}>
            <span className={styles.queueAvatar}>{q.patient[0]}</span>
            <div className={styles.queueInfo}>
              <p className={styles.queueName}>{q.patient}</p>
              <p className={styles.queueMeta}>{q.doctor}</p>
            </div>
            <div className={styles.queueRight}>
              <span className={styles.queueTime}>{q.time}</span>
              <span className={`${styles.pill} ${QUEUE_PILL[q.status]}`}>{q.status}</span>
              {q.status !== 'Completed' && (
                <button type="button" className={styles.btnGhost} onClick={() => advance(q.id)}>
                  {q.status === 'Waiting' ? 'Send in' : 'Mark complete'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}