import styles from '../../../assets/styles/BillingDeskDashboard.module.css';

const CLAIMS = [
  { id: 'CLM-3081', patient: 'Hina Tariq', insurer: 'State Life TPA', amount: 2100, status: 'Under review' },
  { id: 'CLM-3077', patient: 'Zoya Raheel', insurer: 'Jubilee Health', amount: 3400, status: 'Approved' },
  { id: 'CLM-3061', patient: 'Imran Farooq', insurer: 'EFU Health', amount: 1800, status: 'Rejected' },
];

const CLAIM_PILL = { 'Under review': styles.pillClaimReview, Approved: styles.pillClaimApproved, Rejected: styles.pillClaimRejected };
const fmt = (n) => 'Rs ' + n.toLocaleString('en-US');

export default function BillingClaims() {
  const pending = CLAIMS.filter((c) => c.status === 'Under review').length;

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Insurance claims</h1>
          <p className={styles.subtitle}>{pending} claims still under review.</p>
        </div>
      </div>

      <div className={styles.card}>
        {CLAIMS.map((c) => (
          <div key={c.id} className={styles.row}>
            <div className={styles.rowInfo}>
              <p className={styles.rowTitle}>{c.patient}</p>
              <p className={styles.rowSub}>{c.id} · {c.insurer}</p>
            </div>
            <div className={styles.rowRight}>
              <span className={styles.amount}>{fmt(c.amount)}</span>
              <span className={`${styles.pill} ${CLAIM_PILL[c.status]}`}>{c.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}