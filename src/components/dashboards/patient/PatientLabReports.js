import { FlaskConical, Download, Hourglass } from 'lucide-react';
import styles from '../../../assets/styles/PortalPages.module.css';

const REPORTS = [
  { name: 'Complete Blood Count', date: '12 Sep 2026', doctor: 'Dr. Arjun Mehta', status: 'Ready' },
  { name: 'Lipid Profile', date: '12 Sep 2026', doctor: 'Dr. Arjun Mehta', status: 'Ready' },
  { name: 'Thyroid Panel', date: '20 Sep 2026', doctor: 'Dr. Priya Sharma', status: 'Pending' },
  { name: 'Skin Allergy Test', date: '2 Aug 2026', doctor: 'Dr. Neha Verma', status: 'Ready' },
];

export default function PatientLabReports() {
  const ready = REPORTS.filter((r) => r.status === 'Ready').length;
  const pending = REPORTS.length - ready;

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Lab reports</h1>
          <p className={styles.subtitle}>Download results as soon as your lab marks them ready.</p>
        </div>
      </div>

      <div className={styles.summaryRow}>
        <div className={`${styles.summaryCard} ${styles.summaryAccentBlue}`}>
          <p className={styles.summaryLabel}>Total reports</p>
          <p className={styles.summaryValue}>{REPORTS.length}</p>
        </div>
        <div className={`${styles.summaryCard} ${styles.summaryAccentTeal}`}>
          <p className={styles.summaryLabel}>Ready to download</p>
          <p className={styles.summaryValue}>{ready}</p>
        </div>
        <div className={`${styles.summaryCard} ${styles.summaryAccentAmber}`}>
          <p className={styles.summaryLabel}>Still processing</p>
          <p className={styles.summaryValue}>{pending}</p>
        </div>
      </div>

      <div className={styles.card}>
        {REPORTS.map((r) => (
          <div key={r.name + r.date} className={styles.row}>
            <span className={`${styles.rowIcon} ${r.status === 'Ready' ? styles.rowIconTeal : styles.rowIconAmber}`}>
              <FlaskConical size={17} strokeWidth={2} />
            </span>
            <div className={styles.rowInfo}>
              <p className={styles.rowTitle}>{r.name}</p>
              <p className={styles.rowSub}>{r.doctor} · {r.date}</p>
            </div>
            <div className={styles.rowRight}>
              {r.status === 'Ready' ? (
                <button type="button" className={styles.btnGhost}>
                  <Download size={13} strokeWidth={2} style={{ marginRight: 6, verticalAlign: '-2px' }} />
                  Download
                </button>
              ) : (
                <span className={`${styles.pill} ${styles.pillWarn}`}>
                  <Hourglass size={9} strokeWidth={2.5} style={{ marginRight: 4, verticalAlign: '-1px' }} />
                  Pending
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}