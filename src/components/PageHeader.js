import Link from 'next/link';
import styles from '../assets/styles/PageHeader.module.css';

export default function PageHeader({ title, subtitle, crumb }) {
  return (
    <div className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <p className={styles.breadcrumb}>
          <Link href="/" className={styles.breadcrumbLink}>Home</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>{crumb || title}</span>
        </p>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
    </div>
  );
}