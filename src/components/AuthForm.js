'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { ROLE_HOME } from '../lib/auth';
import styles from '../assets/styles/AuthForm.module.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function friendly(message) {
  const m = (message || '').toLowerCase();
  if (m.includes('invalid login')) return 'Incorrect email or password.';
  if (m.includes('email not confirmed')) return 'Please confirm your email first. Check your inbox for the link.';
  if (m.includes('already registered')) return 'An account with this email already exists. Try logging in.';
  if (m.includes('rate limit')) return 'Too many emails were sent. Please wait a few minutes and try again.';
  if (m.includes('password should be')) return 'Choose a stronger password (at least 8 characters).';
  return message || 'Something went wrong. Please try again.';
}

export default function AuthForm({ tab, setTab }) {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  // already signed in, or just came back from Google: go to your own dashboard
  useEffect(() => {
    let active = true;

    async function goHome(userId) {
      const { data } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
      if (active) router.replace(ROLE_HOME[data?.role] || '/portal');
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) goHome(session.user.id);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) goHome(session.user.id);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    setError('');
    setInfo('');
    setForgot(false);
  }, [tab]);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!EMAIL_RE.test(email.trim())) return setError('Enter a valid email address.');
    if (!password) return setError('Enter your password.');

    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (err) {
      setLoading(false);
      setError(friendly(err.message));
    }
    // on success the listener above sends you to your dashboard
  }

  async function handleSignup(e) {
    e.preventDefault();
    setError('');
    setInfo('');
    if (fullName.trim().length < 2) return setError('Please enter your full name.');
    if (!EMAIL_RE.test(email.trim())) return setError('Enter a valid email address.');
    if (password.length < 8) return setError('Your password must be at least 8 characters.');

    setLoading(true);
    const { data, error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    setLoading(false);

    if (err) return setError(friendly(err.message));
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      return setError('An account with this email already exists. Try logging in.');
    }
    if (!data.session) {
      setInfo('Account created. We sent a confirmation link to your email. Open it, then come back and log in.');
    }
  }

  async function handleForgot(e) {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!EMAIL_RE.test(email.trim())) return setError('Enter the email you signed up with.');

    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);

    if (err) return setError(friendly(err.message));
    setInfo('If an account exists for this email, a reset link is on its way.');
  }

  async function handleGoogle() {
    setError('');
    setInfo('');
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/login` },
    });
    if (err) setError(friendly(err.message));
  }

  const passwordField = (id, placeholder, autoComplete) => (
    <div className={styles.field}>
      <label htmlFor={id}>Password</label>
      <div className={styles.inputRow}>
        <Lock size={16} strokeWidth={2} />
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="button"
          className={styles.eyeBtn}
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
        </button>
      </div>
    </div>
  );

  const googleButton = (
    <>
      <div className={styles.divider}><span>or</span></div>
      <button type="button" className={styles.googleBtn} onClick={handleGoogle} disabled={loading}>
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.87 2.7-6.62Z" />
          <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18Z" />
          <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33Z" />
          <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58Z" />
        </svg>
        Continue with Google
      </button>
    </>
  );

  const messages = (
    <>
      {error && <p className={`${styles.alert} ${styles.alertError}`} role="alert">{error}</p>}
      {info && <p className={`${styles.alert} ${styles.alertInfo}`}>{info}</p>}
    </>
  );

  const title = forgot ? 'Reset your password' : tab === 'login' ? 'Login to your account' : 'Create your account';
  const subtitle = forgot
    ? 'We will email you a link to choose a new password'
    : tab === 'login'
      ? 'Enter your credentials to continue'
      : 'A few details to get you set up';

  return (
    <div className={styles.wrap}>
      <div className={styles.iconCircle}>
        <Lock size={22} strokeWidth={2} />
      </div>

      <h1 className={styles.title}>{title}</h1>
      <p className={styles.subtitle}>{subtitle}</p>

      {tab === 'login' && forgot && (
        <form className={styles.form} onSubmit={handleForgot} noValidate>
          <div className={styles.field}>
            <label htmlFor="forgot-email">Email address</label>
            <div className={styles.inputRow}>
              <Mail size={16} strokeWidth={2} />
              <input
                id="forgot-email" type="email" placeholder="Enter your email address" autoComplete="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          {messages}
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
          <div className={styles.rowBetween}>
            <span />
            <button type="button" className={styles.linkBtn} onClick={() => { setForgot(false); setError(''); setInfo(''); }}>
              Back to log in
            </button>
          </div>
        </form>
      )}

      {tab === 'login' && !forgot && (
        <form className={styles.form} onSubmit={handleLogin} noValidate>
          <div className={styles.field}>
            <label htmlFor="login-email">Email address</label>
            <div className={styles.inputRow}>
              <Mail size={16} strokeWidth={2} />
              <input
                id="login-email" type="email" placeholder="Enter your email address" autoComplete="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {passwordField('login-password', 'Enter your password', 'current-password')}

          <div className={styles.rowBetween}>
            <span />
            <button type="button" className={styles.linkBtn} onClick={() => { setForgot(true); setError(''); setInfo(''); }}>
              Forgot password?
            </button>
          </div>

          {messages}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Signing in...' : 'Continue'}
          </button>

          {googleButton}

          <p className={styles.helpNote}>
            Staff accounts are created by the admin. <a href="/contact">Need help?</a>
          </p>
        </form>
      )}

      {tab === 'signup' && (
        <form className={styles.form} onSubmit={handleSignup} noValidate>
          <div className={styles.field}>
            <label htmlFor="signup-name">Full name</label>
            <div className={styles.inputRow}>
              <User size={16} strokeWidth={2} />
              <input
                id="signup-name" type="text" placeholder="Your full name" autoComplete="name"
                value={fullName} onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="signup-email">Email address</label>
            <div className={styles.inputRow}>
              <Mail size={16} strokeWidth={2} />
              <input
                id="signup-email" type="email" placeholder="Enter your email address" autoComplete="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {passwordField('signup-password', 'Create a password (8+ characters)', 'new-password')}

          {messages}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          {googleButton}

          <p className={styles.helpNote}>
            Need help? <a href="/contact">Contact admin</a>
          </p>
        </form>
      )}
    </div>
  );
}