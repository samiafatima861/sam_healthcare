import { HeartPulse, ShieldAlert, Scissors } from 'lucide-react';
import styles from '../../../assets/styles/PortalPages.module.css';

const GROUPS = [
  {
    heading: 'Conditions',
    icon: HeartPulse,
    tone: styles.rowIconTeal,
    pill: styles.pillWarn,
    items: [
      { title: 'Hypertension', detail: 'Diagnosed 2021 · On medication' },
      { title: 'Seasonal asthma', detail: 'Diagnosed 2015 · Occasional inhaler use' },
    ],
  },
  {
    heading: 'Allergies',
    icon: ShieldAlert,
    tone: styles.rowIconDanger,
    pill: styles.pillDanger,
    items: [
      { title: 'Penicillin', detail: 'Reaction: skin rash' },
      { title: 'Dust', detail: 'Reaction: sneezing, watery eyes' },
    ],
  },
  {
    heading: 'Surgeries',
    icon: Scissors,
    tone: styles.rowIconBlue,
    pill: styles.pillTeal,
    items: [
      { title: 'Appendectomy', detail: 'March 2018' },
    ],
  },
];

export default function PatientHistory() {
  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Patient history</h1>
          <p className={styles.subtitle}>Conditions, allergies and surgeries on your record. Tell your doctor if anything here is out of date.</p>
        </div>
      </div>

      {GROUPS.map((g) => (
        <div key={g.heading} className={styles.card}>
          <h2 className={styles.cardTitle}>{g.heading}</h2>
          {g.items.map((item) => (
            <div key={item.title} className={styles.row}>
              <span className={`${styles.rowIcon} ${g.tone}`}>
                <g.icon size={17} strokeWidth={2} />
              </span>
              <div className={styles.rowInfo}>
                <p className={styles.rowTitle}>{item.title}</p>
                <p className={styles.rowSub}>{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}