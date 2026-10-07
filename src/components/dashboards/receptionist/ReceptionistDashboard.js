'use client';

import { useState } from 'react';
import { Users, Clock, Wallet, UserPlus, Stethoscope, CreditCard } from 'lucide-react';
import styles from '../../../assets/styles/ReceptionistDashboard.module.css';

const INITIAL_QUEUE = [
  { id: 1, patient: 'Bilal Ahmed', doctor: 'Dr. Priya Sharma', time: '4:00 PM', status: 'With doctor' },
  { id: 2, patient: 'Sana Khan', doctor: 'Dr. Priya Sharma', time: '4:20 PM', status: 'Waiting' },
  { id: 3, patient: 'Imran Farooq', doctor: 'Dr. Arjun Mehta', time: '4:30 PM', status: 'Waiting' },
  { id: 4, patient: 'Hina Tariq', doctor: 'Dr. Neha Verma', time: '3:40 PM', status: 'Completed' },
];

const DOCTORS = [
  { name: 'Dr. Priya Sharma', specialty: 'General Physician', status: 'With patient', seenToday: 6 },
  { name: 'Dr. Arjun Mehta', specialty: 'Cardiologist', status: 'Available', seenToday: 3 },
  { name: 'Dr. Neha Verma', specialty: 'Dermatologist', status: 'Available', seenToday: 5 },
  { name: 'Dr. Omar Siddiqui', specialty: 'Orthopedist', status: 'On leave', seenToday: 0 },
];

const INITIAL_PAYMENTS = [
  { id: 1, patient: 'Hina Tariq', method: 'Cash', amount: 1500, status: 'Pending' },
  { id: 2, patient: 'Bilal Ahmed', method: 'Card', amount: 2200, status: 'Pending' },
  { id: 3, patient: 'Zoya Raheel', method: 'Insurance (TPA)', amount: 3400, status: 'Settled' },
];

const QUEUE_PILL = { Waiting: styles.pillWaiting, 'With doctor': styles.pillWithDoctor, Completed: styles.pillDone };
const DOCTOR_PILL = { Available: styles.pillDone, 'With patient': styles.pillWithDoctor, 'On leave': styles.pillOnLeave };

const initials = (name) => name.replace('Dr. ', '').split(' ').map((p) => p[0]).join('').slice(0, 2);

export default function ReceptionistDashboard() {
  const [queue, setQueue] = useState(INITIAL_QUEUE);
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);

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

  function settle(id) {
    setPayments((list) => list.map((p) => (p.id === id ? { ...p, status: 'Settled' } : p)));
  }

  const waiting = queue.filter((q) => q.status === 'Waiting').length;
  const checkedIn = queue.filter((q) => q.status !== 'Waiting').length;
  const pendingAmount = payments.filter((p) => p.status === 'Pending').reduce((s, p) => s + p.amount, 0);

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Front desk</h1>
          <p className={styles.subtitle}>Today's queue, doctor availability, and payments.</p>
        </div>
        <button type="button" className={styles.btn}>
          <UserPlus size={16} strokeWidth={2.25} />
          Add walk-in
        </button>
      </div>

      <div className={styles.statRow}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Patients waiting</p>
          <p className={styles.statValue}>{waiting}</p>
        </div>
        <div className={`${styles.statCard} ${styles.blue}`}>
          <p className={styles.statLabel}>Checked in today</p>
          <p className={styles.statValue}>{checkedIn}</p>
        </div>
        <div className={`${styles.statCard} ${styles.amber}`}>
          <p className={styles.statLabel}>Avg wait time</p>
          <p className={styles.statValue}>14 min</p>
        </div>
        <div className={`${styles.statCard} ${styles.danger}`}>
          <p className={styles.statLabel}>Pending payments</p>
          <p className={styles.statValue}>Rs {pendingAmount.toLocaleString('en-US')}</p>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.mainCol}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Live queue</h2>
              <span className={styles.cardCount}>{queue.length} today</span>
            </div>
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

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Payment reconciliation</h2>
              <span className={styles.cardCount}>
                {payments.filter((p) => p.status === 'Pending').length} pending
              </span>
            </div>
            {payments.map((p) => (
              <div key={p.id} className={styles.paymentRow}>
                <div className={styles.paymentInfo}>
                  <p className={styles.paymentName}>{p.patient}</p>
                  <p className={styles.paymentMeta}>
                    <CreditCard size={11} strokeWidth={2} style={{ verticalAlign: '-1px', marginRight: 4 }} />
                    {p.method}
                  </p>
                </div>
                <div className={styles.paymentRight}>
                  <span className={styles.paymentAmount}>Rs {p.amount.toLocaleString('en-US')}</span>
                  <span className={`${styles.pill} ${p.status === 'Settled' ? styles.pillSettled : styles.pillPending}`}>
                    {p.status}
                  </span>
                  {p.status === 'Pending' && (
                    <button type="button" className={styles.btnGhost} onClick={() => settle(p.id)}>
                      Mark settled
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.sideCol}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Doctor availability</h2>
            </div>
            {DOCTORS.map((d) => (
              <div key={d.name} className={styles.doctorRow}>
                <span className={styles.doctorAvatar}>{initials(d.name)}</span>
                <div className={styles.doctorInfo}>
                  <p className={styles.doctorName}>{d.name}</p>
                  <p className={styles.doctorMeta}>
                    <Stethoscope size={11} strokeWidth={2} style={{ verticalAlign: '-1px', marginRight: 3 }} />
                    {d.specialty} · {d.seenToday} seen today
                  </p>
                </div>
                <span className={`${styles.pill} ${DOCTOR_PILL[d.status]}`}>{d.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}