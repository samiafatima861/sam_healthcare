import Link from 'next/link';
import styles from '../assets/styles/EmptyState.module.css';

export default function EmptyState({ icon: Icon, title, message, actionLabel, actionHref }) {
  return (
    <div className={styles.wrap}>
      {Icon && (
        <span className={styles.iconWrap}>
          <Icon size={22} strokeWidth={2} />
        </span>
      )}
      <h3 className={styles.title}>{title}</h3>
      {message && <p className={styles.message}>{message}</p>}
      {actionLabel && actionHref && (
        <Link href={actionHref} className={styles.action}>{actionLabel}</Link>
      )}
    </div>
  );
}