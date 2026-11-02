'use client';

import { useEffect, useState } from 'react';
import { HeartPulse, Stethoscope, Bone, Baby, Sparkles, Check } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import styles from '../assets/styles/BookingFlow.module.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STEPS = ['Department', 'Doctor', 'Date & time', 'Your details'];

const DEPT_META = {
  'General Physician': { icon: Stethoscope, blurb: 'Checkups and everyday health concerns' },
  Cardiology: { icon: HeartPulse, blurb: 'Heart and blood pressure care' },
  Dermatology: { icon: Sparkles, blurb: 'Skin, hair and nail conditions' },
  Orthopedics: { icon: Bone, blurb: 'Bones, joints and sports injuries' },
  Pediatrics: { icon: Baby, blurb: 'Care for infants and children' },
};
const DEFAULT_META = { icon: Stethoscope, blurb: 'Specialist care' };

/* ---------- helpers ---------- */
function minutesToLabel(m) {
  let h = Math.floor(m / 60);
  const min = m % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${String(min).padStart(2, '0')} ${ampm}`;
}

function labelToMinutes(label) {
  const [time, ampm] = label.split(' ');
  let [h, min] = time.split(':').map(Number);
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return h * 60 + min;
}

// 9:00 AM to 8:30 PM, every 30 minutes
const SLOTS = (() => {
  const out = [];
  for (let m = 9 * 60; m <= 20 * 60 + 30; m += 30) out.push(minutesToLabel(m));
  return out;
})();

function toISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function nextDays(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      iso: toISO(d),
      weekday: i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      day: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
    };
  });
}

function prettyDate(iso) {
  if (!iso) return '';
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

const initials = (name) => name.replace('Dr. ', '').split(' ').map((p) => p[0]).join('').slice(0, 2);

function validateDetails(d) {
  const errors = {};
  if (d.name.trim().length < 2) errors.name = 'Please enter your full name.';
  const digits = d.phone.replace(/\D/g, '');
  if (!/^[+\d\s()-]+$/.test(d.phone) || digits.length < 7 || digits.length > 15) {
    errors.phone = 'Enter a valid phone number (7–15 digits).';
  }
  if (d.email.trim() && !EMAIL_RE.test(d.email.trim())) {
    errors.email = 'Enter a valid email, like name@example.com.';
  }
  return errors;
}

/* ---------- component ---------- */
export default function BookingFlow() {
  const [step, setStep] = useState(0);
  const [department, setDepartment] = useState('');
  const [doctor, setDoctor] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [details, setDetails] = useState({ name: '', phone: '', email: '', reason: '' });
  const [touched, setTouched] = useState({});
  const [days, setDays] = useState([]);
  const [taken, setTaken] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [confirmed, setConfirmed] = useState(null);

  const [roster, setRoster] = useState([]);
  const [rosterState, setRosterState] = useState('loading'); // loading | ready | failed

  // doctors and departments come from the staff table, so new doctors appear automatically
  useEffect(() => {
    supabase.rpc('bookable_doctors').then(({ data, error }) => {
      if (error) {
        setRosterState('failed');
        return;
      }
      setRoster(data || []);
      setRosterState('ready');
    });
  }, []);

  const DEPARTMENTS = [...new Set(roster.map((r) => r.department))].map((name) => ({
    name,
    ...(DEPT_META[name] || DEFAULT_META),
  }));

  const DOCTORS = {};
  roster.forEach((r) => {
    if (!DOCTORS[r.department]) DOCTORS[r.department] = [];
    DOCTORS[r.department].push({ name: r.full_name, title: `${r.department} specialist` });
  });

  // Dates are built after mount so server and browser time zones can't disagree
  useEffect(() => { setDays(nextDays(7)); }, []);

  // opened from a department card, e.g. /book?department=Cardiology
  useEffect(() => {
    if (rosterState !== 'ready') return;
    const wanted = new URLSearchParams(window.location.search).get('department');
    const match = DEPARTMENTS.find((d) => d.name.toLowerCase() === (wanted || '').toLowerCase());
    if (match) {
      setDepartment(match.name);
      const list = DOCTORS[match.name] || [];
      setDoctor(list.length === 1 ? list[0].name : '');
      setStep(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rosterState]);

  // Look up slots already booked for this doctor on this day
  useEffect(() => {
    if (!doctor || !date) { setTaken([]); return; }
    let cancelled = false;
    supabase
      .rpc('taken_slots', { p_doctor: doctor, p_date: date })
      .then(({ data, error }) => {
        if (cancelled || error) return;
        const times = (data || []).map((r) => r.slot);
        setTaken(times);
        setTime((t) => (times.includes(t) ? '' : t));
      });
    return () => { cancelled = true; };
  }, [doctor, date]);

  const doctors = DOCTORS[department] || [];
  const errors = validateDetails(details);
  const showError = (f) => touched[f] && errors[f];
  const todayISO = days[0]?.iso;

  function isSlotDisabled(label) {
    if (taken.includes(label)) return true;
    if (date && date === todayISO) {
      const now = new Date();
      return labelToMinutes(label) <= now.getHours() * 60 + now.getMinutes();
    }
    return false;
  }

  const availableSlots = SLOTS.filter((s) => !isSlotDisabled(s)).length;

  function chooseDepartment(name) {
    setDepartment(name);
    const list = DOCTORS[name] || [];
    setDoctor(list.length === 1 ? list[0].name : '');
    setDate('');
    setTime('');
  }

  function chooseDate(iso) {
    setDate(iso);
    setTime('');
  }

  function handleDetailChange(e) {
    const { name, value } = e.target;
    setDetails((d) => ({ ...d, [name]: value }));
  }

  function canContinue() {
    if (step === 0) return !!department;
    if (step === 1) return !!doctor;
    if (step === 2) return !!date && !!time;
    return Object.keys(errors).length === 0;
  }

  async function handleConfirm() {
    setTouched({ name: true, phone: true, email: true });
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    setServerError('');

    const { error } = await supabase.from('appointments').insert({
      patient_name: details.name.trim(),
      patient_phone: details.phone.trim(),
      patient_email: details.email.trim() || null,
      reason: details.reason.trim() || null,
      doctor_name: doctor,
      department,
      appointment_date: date,
      appointment_time: time,
      status: 'Pending',
    });

    setSubmitting(false);

    if (error) {
      console.error(error);
      setServerError('We could not save your appointment. Please try again or call the front desk.');
      return;
    }

    setConfirmed({ name: details.name.trim(), department, doctor, date, time });
  }

  function reset() {
    setConfirmed(null);
    setStep(0);
    setDepartment('');
    setDoctor('');
    setDate('');
    setTime('');
    setDetails({ name: '', phone: '', email: '', reason: '' });
    setTouched({});
  }

  /* ---------- success ---------- */
  if (confirmed) {
    return (
      <div className={styles.successWrap}>
        <div className={styles.flowCard}>
          <div className={styles.successBox}>
            <span className={styles.successIcon}><Check size={28} strokeWidth={2.5} /></span>
            <h2 className={styles.successTitle}>Appointment requested</h2>
            <p className={styles.successText}>
              Thank you, {confirmed.name}. Our front desk will confirm your appointment shortly.
            </p>
            <div className={styles.successSummary}>
              <div><span>Department</span><strong>{confirmed.department}</strong></div>
              <div><span>Doctor</span><strong>{confirmed.doctor}</strong></div>
              <div><span>Date</span><strong>{prettyDate(confirmed.date)}</strong></div>
              <div><span>Time</span><strong>{confirmed.time}</strong></div>
            </div>
            <button type="button" className={styles.backBtn} onClick={reset}>Book another appointment</button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- flow ---------- */
  return (
    <div className={styles.layout}>
      <div className={styles.flowCard}>
        <div className={styles.stepper}>
          {STEPS.map((label, i) => (
            <div key={label} className={styles.stepperItem}>
              <span className={`${styles.stepDot} ${i <= step ? styles.stepDotActive : ''}`}>
                {i < step ? <Check size={13} strokeWidth={3} /> : i + 1}
              </span>
              <span className={`${styles.stepLabel} ${i === step ? styles.stepLabelActive : ''}`}>{label}</span>
              {i < STEPS.length - 1 && <span className={styles.stepLine} />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <>
            <h2 className={styles.stepTitle}>Choose a department</h2>
            <p className={styles.stepHint}>Pick the area of care you need.</p>

            {rosterState === 'loading' && <p className={styles.stepHint}>Loading departments...</p>}
            {rosterState === 'failed' && (
              <p className={styles.serverError}>Could not load doctors. Please refresh the page or call the front desk.</p>
            )}
            {rosterState === 'ready' && DEPARTMENTS.length === 0 && (
              <p className={styles.stepHint}>No doctors are available for booking yet.</p>
            )}

            <div className={styles.optionGrid}>
              {DEPARTMENTS.map((d) => (
                <button
                  key={d.name} type="button"
                  className={`${styles.optionCard} ${department === d.name ? styles.optionCardActive : ''}`}
                  onClick={() => chooseDepartment(d.name)}
                >
                  <span className={styles.optionIcon}><d.icon size={20} strokeWidth={2} /></span>
                  <span className={styles.optionName}>{d.name}</span>
                  <span className={styles.optionBlurb}>{d.blurb}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2 className={styles.stepTitle}>Choose your doctor</h2>
            <p className={styles.stepHint}>Available in {department}.</p>
            <div className={styles.optionGrid}>
              {doctors.map((d) => (
                <button
                  key={d.name} type="button"
                  className={`${styles.optionCard} ${doctor === d.name ? styles.optionCardActive : ''}`}
                  onClick={() => setDoctor(d.name)}
                >
                  <span className={styles.avatar}>{initials(d.name)}</span>
                  <span className={styles.optionName}>{d.name}</span>
                  <span className={styles.optionBlurb}>{d.title}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className={styles.stepTitle}>Pick a date and time</h2>
            <p className={styles.stepHint}>Appointments with {doctor}, 9:00 AM to 9:00 PM.</p>

            <p className={styles.sectionLabel}>Date</p>
            <div className={styles.dayGrid}>
              {days.map((d) => (
                <button
                  key={d.iso} type="button"
                  className={`${styles.dayChip} ${date === d.iso ? styles.dayChipActive : ''}`}
                  onClick={() => chooseDate(d.iso)}
                >
                  <span className={styles.dayWeekday}>{d.weekday}</span>
                  <span className={styles.dayNum}>{d.day}</span>
                  <span className={styles.dayMonth}>{d.month}</span>
                </button>
              ))}
            </div>

            {date && (
              <>
                <p className={styles.sectionLabel}>Time</p>
                {availableSlots === 0 ? (
                  <p className={styles.noSlots}>No slots left on this day. Please pick another date.</p>
                ) : (
                  <div className={styles.timeGrid}>
                    {SLOTS.map((s) => {
                      const disabled = isSlotDisabled(s);
                      return (
                        <button
                          key={s} type="button" disabled={disabled}
                          className={`${styles.timeChip} ${time === s ? styles.timeChipActive : ''}`}
                          onClick={() => setTime(s)}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <h2 className={styles.stepTitle}>Your details</h2>
            <p className={styles.stepHint}>So the front desk can confirm your visit.</p>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="bf-name">Full name</label>
                <input
                  id="bf-name" name="name" type="text" autoComplete="name"
                  className={`${styles.input} ${showError('name') ? styles.inputError : ''}`}
                  placeholder="Your full name"
                  value={details.name} onChange={handleDetailChange}
                  onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                />
                {showError('name') && <p className={styles.errorText}>{errors.name}</p>}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="bf-phone">Phone number</label>
                <input
                  id="bf-phone" name="phone" type="tel" autoComplete="tel"
                  className={`${styles.input} ${showError('phone') ? styles.inputError : ''}`}
                  placeholder="+92 300 1234567"
                  value={details.phone} onChange={handleDetailChange}
                  onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                />
                {showError('phone') && <p className={styles.errorText}>{errors.phone}</p>}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="bf-email">Email <span className={styles.optional}>(optional)</span></label>
              <input
                id="bf-email" name="email" type="email" autoComplete="email"
                className={`${styles.input} ${showError('email') ? styles.inputError : ''}`}
                placeholder="you@example.com"
                value={details.email} onChange={handleDetailChange}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              />
              {showError('email') && <p className={styles.errorText}>{errors.email}</p>}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="bf-reason">Reason for visit <span className={styles.optional}>(optional)</span></label>
              <textarea
                id="bf-reason" name="reason"
                className={`${styles.input} ${styles.textarea}`}
                placeholder="Briefly describe your symptoms or the reason for your visit"
                value={details.reason} onChange={handleDetailChange}
              />
            </div>

            {serverError && <p className={styles.serverError}>{serverError}</p>}
          </>
        )}

        <div className={styles.actions}>
          {step > 0 && (
            <button type="button" className={styles.backBtn} onClick={() => setStep((s) => s - 1)}>Back</button>
          )}
          {step < 3 ? (
            <button type="button" className={styles.nextBtn} disabled={!canContinue()} onClick={() => setStep((s) => s + 1)}>
              Continue
            </button>
          ) : (
            <button type="button" className={styles.nextBtn} disabled={submitting} onClick={handleConfirm}>
              {submitting ? 'Booking...' : 'Confirm appointment'}
            </button>
          )}
        </div>
      </div>

      <aside className={styles.summaryCard}>
        <h3 className={styles.summaryTitle}>Your appointment</h3>
        <div className={styles.summaryRow}>
          <span>Department</span>
          <strong className={department ? '' : styles.summaryEmpty}>{department || 'Not selected yet'}</strong>
        </div>
        <div className={styles.summaryRow}>
          <span>Doctor</span>
          <strong className={doctor ? '' : styles.summaryEmpty}>{doctor || 'Not selected yet'}</strong>
        </div>
        <div className={styles.summaryRow}>
          <span>Date</span>
          <strong className={date ? '' : styles.summaryEmpty}>{date ? prettyDate(date) : 'Not selected yet'}</strong>
        </div>
        <div className={styles.summaryRow}>
          <span>Time</span>
          <strong className={time ? '' : styles.summaryEmpty}>{time || 'Not selected yet'}</strong>
        </div>
        <p className={styles.summaryNote}>Our front desk will confirm your appointment after you book.</p>
      </aside>
    </div>
  );
}