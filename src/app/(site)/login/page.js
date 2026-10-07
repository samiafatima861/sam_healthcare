'use client';

import { useState } from 'react';
import { Activity, ShieldCheck, Zap } from 'lucide-react';
import AuthForm from '../../../components/AuthForm';
import styles from '../../../assets/styles/AuthPage.module.css';

const FEATURES = [
  { icon: Activity, title: 'Real-time records', desc: 'Access your health data anytime' },
  { icon: ShieldCheck, title: 'Bank-level security', desc: 'Your data, fully protected' },
  { icon: Zap, title: 'Instant booking', desc: 'Confirmed slots in seconds' },
];

export default function LoginPage() {
  const [tab, setTab] = useState('login');

  return (
    <main className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.panelContent}>
          <p className={styles.eyebrow}>Welcome back!</p>
          <h2 className={styles.panelTitle}>Good to see you again!</h2>

          <div className={styles.featureList}>
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className={styles.feature}>
                  <span className={styles.featureIcon}>
                    <Icon size={18} strokeWidth={2} />
                  </span>
                  <div>
                    <p className={styles.featureTitle}>{f.title}</p>
                    <p className={styles.featureDesc}>{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className={styles.formSide}>
        <div className={styles.pillToggle}>
          <button
            type="button"
            className={tab === 'login' ? styles.pillActive : styles.pill}
            onClick={() => setTab('login')}
          >
            Log in
          </button>
          <button
            type="button"
            className={tab === 'signup' ? styles.pillActive : styles.pill}
            onClick={() => setTab('signup')}
          >
            Sign up
          </button>
        </div>

        <AuthForm tab={tab} setTab={setTab} />
      </div>
    </main>
  );
}