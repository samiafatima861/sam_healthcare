'use client';

import { useState } from 'react';
import { Send, Check } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import styles from '../assets/styles/ContactPage.module.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUBJECTS = ['General enquiry', 'Appointment help', 'Billing', 'Feedback', 'Other'];
const INITIAL = { name: '', email: '', phone: '', subject: SUBJECTS[0], message: '' };

function validate(values) {
  const errors = {};
  if (values.name.trim().length < 2) errors.name = 'Please enter your full name.';
  if (!EMAIL_RE.test(values.email.trim())) errors.email = 'Enter a valid email, like name@example.com.';
  if (values.phone.trim()) {
    const digits = values.phone.replace(/\D/g, '');
    if (!/^[+\d\s()-]+$/.test(values.phone) || digits.length < 7 || digits.length > 15) {
      errors.phone = 'Enter a valid phone number (7–15 digits).';
    }
  }
  if (values.message.trim().length < 10) errors.message = 'Please write at least 10 characters.';
  return errors;
}

export default function ContactForm() {
  const [values, setValues] = useState(INITIAL);
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent
  const [serverError, setServerError] = useState('');

  const errors = validate(values);
  const showError = (field) => touched[field] && errors[field];

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  }

  function handleBlur(e) {
    setTouched((t) => ({ ...t, [e.target.name]: true }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({ name: true, email: true, phone: true, message: true });
    if (Object.keys(errors).length > 0) return;

    setStatus('sending');
    setServerError('');

    const { error } = await supabase.from('contact_messages').insert({
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim() || null,
      subject: values.subject,
      message: values.message.trim(),
    });

    if (error) {
      setStatus('idle');
      setServerError('Something went wrong sending your message. Please try again or call us.');
      return;
    }

    setStatus('sent');
    setValues(INITIAL);
    setTouched({});
  }

  if (status === 'sent') {
    return (
      <div className={styles.formCard}>
        <div className={styles.successBox}>
          <span className={styles.successIcon}><Check size={26} strokeWidth={2.5} /></span>
          <h2 className={styles.successTitle}>Message sent</h2>
          <p className={styles.successText}>
            Thank you for reaching out. Our team will reply by email, usually within a few hours.
          </p>
          <button type="button" className={styles.ghostBtn} onClick={() => setStatus('idle')}>
            Send another message
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className={styles.formCard} onSubmit={handleSubmit} noValidate>
      <h2 className={styles.formTitle}>Send us a message</h2>
      <p className={styles.formSub}>Fill in the form and we'll get back to you by email.</p>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="cf-name">Full name</label>
          <input
            id="cf-name" name="name" type="text" autoComplete="name"
            className={`${styles.input} ${showError('name') ? styles.inputError : ''}`}
            placeholder="Your full name"
            value={values.name} onChange={handleChange} onBlur={handleBlur}
          />
          {showError('name') && <p className={styles.errorText}>{errors.name}</p>}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="cf-email">Email</label>
          <input
            id="cf-email" name="email" type="email" autoComplete="email"
            className={`${styles.input} ${showError('email') ? styles.inputError : ''}`}
            placeholder="you@example.com"
            value={values.email} onChange={handleChange} onBlur={handleBlur}
          />
          {showError('email') && <p className={styles.errorText}>{errors.email}</p>}
        </div>
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="cf-phone">Phone <span className={styles.optional}>(optional)</span></label>
          <input
            id="cf-phone" name="phone" type="tel" autoComplete="tel"
            className={`${styles.input} ${showError('phone') ? styles.inputError : ''}`}
            placeholder="+92 300 1234567"
            value={values.phone} onChange={handleChange} onBlur={handleBlur}
          />
          {showError('phone') && <p className={styles.errorText}>{errors.phone}</p>}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="cf-subject">Subject</label>
          <select
            id="cf-subject" name="subject" className={styles.input}
            value={values.subject} onChange={handleChange}
          >
            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="cf-message">Message</label>
        <textarea
          id="cf-message" name="message"
          className={`${styles.input} ${styles.textarea} ${showError('message') ? styles.inputError : ''}`}
          placeholder="How can we help?"
          value={values.message} onChange={handleChange} onBlur={handleBlur}
        />
        {showError('message') && <p className={styles.errorText}>{errors.message}</p>}
      </div>

      {serverError && <p className={styles.serverError}>{serverError}</p>}

      <button type="submit" className={styles.submitBtn} disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending...' : <>Send message <Send size={16} strokeWidth={2.25} /></>}
      </button>
    </form>
  );
}