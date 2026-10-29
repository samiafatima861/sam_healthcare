'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import styles from '../assets/styles/ContactPage.module.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | done
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    setError('');
    setStatus('sending');

    const { error: dbError } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: email.trim().toLowerCase() });

    // 23505 = already subscribed, which we treat as success
    if (dbError && dbError.code !== '23505') {
      setStatus('idle');
      setError('Could not subscribe right now. Please try again.');
      return;
    }

    setStatus('done');
    setEmail('');
  }

  if (status === 'done') {
    return (
      <div>
        <h3 className={styles.newsletterTitle}>You're subscribed</h3>
        <p className={styles.newsletterText}>Thanks! Look out for our next health tips email.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h3 className={styles.newsletterTitle}>Health tips, monthly</h3>
      <p className={styles.newsletterText}>
        Short, useful notes from our doctors: seasonal advice and checkup reminders. No spam.
      </p>
      <input
        type="email" className={styles.newsletterInput} placeholder="Your email address"
        aria-label="Email address" value={email} onChange={(e) => setEmail(e.target.value)}
      />
      {error && <p className={styles.newsletterError}>{error}</p>}
      <button type="submit" className={styles.newsletterBtn} disabled={status === 'sending'}>
        {status === 'sending' ? 'Subscribing...' : 'Subscribe'}
      </button>
    </form>
  );
}