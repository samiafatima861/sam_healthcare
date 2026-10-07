'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, IdCard, MessageSquareText, Eye, EyeOff } from 'lucide-react';
import styles from '../assets/styles/AuthForm.module.css';

export default function AuthForm({ tab, setTab }) {
  const [useOtp, setUseOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  function handleSubmit(e) {
    e.preventDefault();
    sessionStorage.setItem('medicore_mock_auth', 'true');
    router.push('/portal');
  }

  function handleSendOtp() {
    setOtpSent(true);
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.iconCircle}>
        <Lock size={22} strokeWidth={2} />
      </div>

      <h1 className={styles.title}>
        {tab === 'login' ? 'Login to your account' : 'Create your account'}
      </h1>
      <p className={styles.subtitle}>
        {tab === 'login'
          ? 'Enter your credentials to continue'
          : 'A few details to get you set up'}
      </p>

      {tab === 'login' ? (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="login-id">Email address</label>
            <div className={styles.inputRow}>
              <Mail size={16} strokeWidth={2} />
              <input id="login-id" type="text" placeholder="Enter your email address" required />
            </div>
          </div>

          {!useOtp ? (
            <div className={styles.field}>
              <label htmlFor="login-password">Password</label>
              <div className={styles.inputRow}>
                <Lock size={16} strokeWidth={2} />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  required
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
          ) : (
            <div className={styles.field}>
              <label htmlFor="login-otp">One-time code</label>
              <div className={styles.otpRow}>
                <div className={styles.inputRow}>
                  <MessageSquareText size={16} strokeWidth={2} />
                  <input id="login-otp" type="text" placeholder="6-digit code" required />
                </div>
                <button type="button" className={styles.otpBtn} onClick={handleSendOtp}>
                  {otpSent ? 'Resend' : 'Send code'}
                </button>
              </div>
            </div>
          )}

          <div className={styles.rowBetween}>
            {!useOtp ? (
              <label className={styles.checkboxRow}>
                <input type="checkbox" />
                Remember me
              </label>
            ) : <span />}
            <button type="button" className={styles.linkBtn} onClick={() => setUseOtp((v) => !v)}>
              {useOtp ? 'Use password instead' : 'Forgot password?'}
            </button>
          </div>

          <button type="submit" className={styles.submitBtn}>
            Continue
          </button>

          <div className={styles.divider}><span>or</span></div>

          <button type="button" className={styles.googleBtn}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.87 2.7-6.62Z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18Z" />
              <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33Z" />
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58Z" />
            </svg>
            Continue with Google
          </button>

          <p className={styles.helpNote}>
            Need help? <a href="/contact">Contact admin</a>
          </p>
        </form>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="signup-name">Full name</label>
            <div className={styles.inputRow}>
              <User size={16} strokeWidth={2} />
              <input id="signup-name" type="text" placeholder="Your full name" required />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="signup-id">Email address</label>
            <div className={styles.inputRow}>
              <Mail size={16} strokeWidth={2} />
              <input id="signup-id" type="text" placeholder="Enter your email address" required />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="signup-password">Password</label>
            <div className={styles.inputRow}>
              <Lock size={16} strokeWidth={2} />
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                required
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

          <div className={styles.field}>
            <label htmlFor="signup-cnic">National ID (optional)</label>
            <div className={styles.inputRow}>
              <IdCard size={16} strokeWidth={2} />
              <input id="signup-cnic" type="text" placeholder="For patient record matching" />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn}>
            Create account
          </button>

          <p className={styles.helpNote}>
            Need help? <a href="/contact">Contact admin</a>
          </p>
        </form>
      )}
    </div>
  );
}