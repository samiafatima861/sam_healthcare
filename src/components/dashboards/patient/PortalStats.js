import Link from 'next/link';
import { CalendarClock, FlaskConical, Wallet, ArrowRight } from 'lucide-react';
import styles from '../../../assets/styles/PortalStats.module.css';

// These defaults are the demo values from your page. Pass real data as props later.
export default function PortalStats({
  nextAppointment = { when: 'Today, 4:40 PM', doctor: 'Dr. Priya Sharma', department: 'General Physician' },
  labs = { ready: 2, total: 3 },
  balance = 1240,
}) {
  const labPercent = labs.total > 0 ? Math.round((labs.ready / labs.total) * 100) : 0;

  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        <article className={`${styles.card} ${styles.toneBlue}`}>
          <div className={styles.top}>
            <span className={styles.iconTile}><CalendarClock size={20} strokeWidth={2} /></span>
            <span className={styles.label}>Next appointment</span>
          </div>
          <div>
            <p className={styles.value}>{nextAppointment.when}</p>
            <p className={styles.sub}>{nextAppointment.doctor} · {nextAppointment.department}</p>
          </div>
          <Link href="/portal/appointments" className={styles.action}>
            View details <ArrowRight size={13} strokeWidth={2.5} />
          </Link>
        </article>

        <article className={`${styles.card} ${styles.toneTeal}`}>
          <div className={styles.top}>
            <span className={styles.iconTile}><FlaskConical size={20} strokeWidth={2} /></span>
            <span className={styles.label}>Lab reports ready</span>
          </div>
          <div>
            <p className={styles.value}>{labs.ready} <span className={styles.valueSmall}>of {labs.total}</span></p>
            <div className={styles.track} aria-hidden="true">
              <div className={styles.fill} style={{ width: `${labPercent}%` }} />
            </div>
          </div>
          <Link href="/portal/lab-reports" className={styles.action}>
            View reports <ArrowRight size={13} strokeWidth={2.5} />
          </Link>
        </article>

        <article className={`${styles.card} ${styles.toneDeep}`}>
          <div className={styles.top}>
            <span className={styles.iconTile}><Wallet size={20} strokeWidth={2} /></span>
            <span className={styles.label}>Outstanding balance</span>
          </div>
          <div>
            <p className={styles.value}>Rs {Number(balance).toLocaleString('en-US')}</p>
            <p className={styles.sub}>Across your open invoices</p>
          </div>
          <Link href="/portal/billing" className={styles.action}>
            Pay now <ArrowRight size={13} strokeWidth={2.5} />
          </Link>
        </article>
      </div>
    </div>
  );
}