import { Receipt } from 'lucide-react';
import styles from '../../../assets/styles/PortalPages.module.css';

const INVOICES = [
  { no: 'INV-1042', desc: 'Cardiology consultation + lab tests', date: '12 Sep 2026', amount: 1240, status: 'Unpaid' },
  { no: 'INV-0988', desc: 'Dermatology consultation', date: '2 Aug 2026', amount: 1500, status: 'Paid' },
  { no: 'INV-0931', desc: 'General checkup', date: '14 Jun 2026', amount: 800, status: 'Paid' },
];

const fmt = (n) => 'Rs ' + n.toLocaleString('en-US');

export default function PatientBilling() {
  const outstanding = INVOICES.filter((i) => i.status === 'Unpaid').reduce((sum, i) => sum + i.amount, 0);
  const paid = INVOICES.filter((i) => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Billing</h1>
          <p className={styles.subtitle}>Invoices from your visits and their payment status.</p>
        </div>
      </div>

      <div className={styles.summaryRow}>
        <div className={`${styles.summaryCard} ${styles.summaryAccentAmber}`}>
          <p className={styles.summaryLabel}>Outstanding</p>
          <p className={styles.summaryValue}>{fmt(outstanding)}</p>
        </div>
        <div className={`${styles.summaryCard} ${styles.summaryAccentTeal}`}>
          <p className={styles.summaryLabel}>Paid this year</p>
          <p className={styles.summaryValue}>{fmt(paid)}</p>
        </div>
        <div className={`${styles.summaryCard} ${styles.summaryAccentBlue}`}>
          <p className={styles.summaryLabel}>Total invoices</p>
          <p className={styles.summaryValue}>{INVOICES.length}</p>
        </div>
      </div>

      <div className={styles.card}>
        {INVOICES.map((i) => (
          <div key={i.no} className={styles.row}>
            <span className={`${styles.rowIcon} ${i.status === 'Paid' ? styles.rowIconTeal : styles.rowIconAmber}`}>
              <Receipt size={17} strokeWidth={2} />
            </span>
            <div className={styles.rowInfo}>
              <p className={styles.rowTitle}>{i.desc}</p>
              <p className={styles.rowSub}>{i.no} · {i.date}</p>
            </div>
            <div className={styles.rowRight}>
              <span className={styles.amount}>{fmt(i.amount)}</span>
              <span className={`${styles.pill} ${i.status === 'Paid' ? styles.pillGreen : styles.pillWarn}`}>
                {i.status}
              </span>
              {i.status === 'Unpaid' && <button type="button" className={styles.btn}>Pay invoice</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}