'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import styles from '../assets/styles/BookingFlow.module.css';

const DEPARTMENTS = ['Cardiology', 'Dermatology', 'General Physician', 'Orthopedics', 'Pediatrics'];

const DOCTORS = {
  Cardiology: ['Dr. Arjun Mehta'],
  Dermatology: ['Dr. Neha Verma'],
  'General Physician': ['Dr. Priya Sharma'],
  Orthopedics: ['Dr. Omar Siddiqui'],
  Pediatrics: ['Dr. Priya Sharma'],
};

const TIMES = ['9:00 AM', '10:30 AM', '12:00 PM', '2:00 PM', '3:30 PM', '5:00 PM'];

const STEPS = ['Department', 'Doctor', 'Date & time', 'Confirm'];

export default function BookingFlow() {
  const [step, setStep] = useState(0);
  const [department, setDepartment] = useState('');
  const [doctor, setDoctor] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function next() { setStep((s) => Math.min(s + 1, STEPS.length - 1)); }
  function back() { setStep((s) => Math.max(s - 1, 0)); }

  function canContinue() {
    if (step === 0) return !!department;
    if (step === 1) return !!doctor;
    if (step === 2) return !!date && !!time;
    return true;
  }

  if (submitted) {
    return (
      <div className={styles.card}>
        <div className={styles.successWrap}>
          <span className={styles.successIcon}><Check size={24} strokeWidth={2.5} /></span>
          <h2 className={styles.successTitle}>Appointment requested</h2>
          <p className={styles.successText}>
            {doctor} · {department} · {date} at {time}
          </p>
          <p className={styles.successNote}>You'll get a confirmation once the front desk approves this slot.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.stepper}>
        {STEPS.map((label, i) => (
          <div key={label} className={styles.stepperItem}>
            <span className={`${styles.stepDot} ${i <= step ? styles.stepDotActive : ''}`}>
              {i < step ? <Check size={12} strokeWidth={3} /> : i + 1}
            </span>
            <span className={`${styles.stepLabel} ${i === step ? styles.stepLabelActive : ''}`}>{label}</span>
            {i < STEPS.length - 1 && <span className={styles.stepLine} />}
          </div>
        ))}
      </div>

      <div className={styles.stepBody}>
        {step === 0 && (
          <div className={styles.optionGrid}>
            {DEPARTMENTS.map((d) => (
              <button
                key={d}
                type="button"
                className={`${styles.optionCard} ${department === d ? styles.optionCardActive : ''}`}
                onClick={() => { setDepartment(d); setDoctor(''); }}
              >
                {d}
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className={styles.optionGrid}>
            {(DOCTORS[department] || []).map((d) => (
              <button
                key={d}
                type="button"
                className={`${styles.optionCard} ${doctor === d ? styles.optionCardActive : ''}`}
                onClick={() => setDoctor(d)}
              >
                {d}
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div>
            <label className={styles.fieldLabel} htmlFor="booking-date">Choose a date</label>
            <input
              id="booking-date"
              type="date"
              className={styles.dateInput}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <p className={`${styles.fieldLabel} ${styles.timeLabel}`}>Choose a time</p>
            <div className={styles.timeGrid}>
              {TIMES.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`${styles.optionCard} ${time === t ? styles.optionCardActive : ''}`}
                  onClick={() => setTime(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={styles.summary}>
            <div className={styles.summaryRow}><span>Department</span><strong>{department}</strong></div>
            <div className={styles.summaryRow}><span>Doctor</span><strong>{doctor}</strong></div>
            <div className={styles.summaryRow}><span>Date</span><strong>{date}</strong></div>
            <div className={styles.summaryRow}><span>Time</span><strong>{time}</strong></div>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        {step > 0 && <button type="button" className={styles.backBtn} onClick={back}>Back</button>}
        {step < STEPS.length - 1 ? (
          <button type="button" className={styles.nextBtn} disabled={!canContinue()} onClick={next}>
            Continue
          </button>
        ) : (
          <button type="button" className={styles.nextBtn} onClick={() => setSubmitted(true)}>
            Confirm appointment
          </button>
        )}
      </div>
    </div>
  );
}