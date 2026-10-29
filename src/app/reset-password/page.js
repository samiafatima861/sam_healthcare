'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import styles from '../../assets/styles/AuthForm.module.css';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 8) return setError('Your password must be at least 8 characters.');
    if (password !== confirm) return setError('The two passwords do not match.');

    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (err) return setError(err.message);
    setDone(true);
    setTimeout(() => router.replace('/login'), 1500);
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: 'var(--bg-light)' }}>
      <div className={styles.wrap}>
        <div className={styles.iconCircle}><Lock size={22} strokeWidth={2} /></div>
        <h1 className={styles.title}>Choose a new password</h1>

        {done ? (
          <p className={`${styles.alert} ${styles.alertInfo}`}>Password updated. Taking you to your account...</p>
        ) : !ready ? (
          <p className={styles.subtitle}>
            Open the link from your reset email on this device to continue. If it has expired, request a new one from the login page.
          </p>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
              <label htmlFor="rp-password">New password</label>
              <div className={styles.inputRow}>
                <Lock size={16} strokeWidth={2} />
                <input id="rp-password" type="password" autoComplete="new-password" placeholder="At least 8 characters"
                  value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>
            <div className={styles.field}>
              <label htmlFor="rp-confirm">Confirm password</label>
              <div className={styles.inputRow}>
                <Lock size={16} strokeWidth={2} />
                <input id="rp-confirm" type="password" autoComplete="new-password" placeholder="Repeat the password"
                  value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              </div>
            </div>
            {error && <p className={`${styles.alert} ${styles.alertError}`} role="alert">{error}</p>}
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Saving...' : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}