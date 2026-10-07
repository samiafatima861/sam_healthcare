import { TrendingUp, TrendingDown } from 'lucide-react';
import styles from '../../../assets/styles/AdminDashboard.module.css';

const REVENUE = [
  { month: 'Apr', amount: 820000 },
  { month: 'May', amount: 910000 },
  { month: 'Jun', amount: 870000 },
  { month: 'Jul', amount: 960000 },
  { month: 'Aug', amount: 1040000 },
  { month: 'Sep', amount: 1120000 },
];

const fmt = (n) => 'Rs ' + (n / 1000).toFixed(0) + 'k';
const fmtFull = (n) => 'Rs ' + n.toLocaleString('en-US');

export default function AdminRevenue() {
  const maxRevenue = Math.max(...REVENUE.map((r) => r.amount));
  const thisMonth = REVENUE[REVENUE.length - 1].amount;
  const lastMonth = REVENUE[REVENUE.length - 2].amount;
  const revenueUp = thisMonth >= lastMonth;
  const total = REVENUE.reduce((s, r) => s + r.amount, 0);

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Revenue</h1>
          <p className={styles.subtitle}>Monthly revenue across the hospital, last 6 months.</p>
        </div>
      </div>

      <div className={styles.statRow}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>This month</p>
          <p className={styles.statValue}>{fmt(thisMonth)}</p>
          <p className={`${styles.statTrend} ${revenueUp ? styles.trendUp : styles.trendDown}`}>
            {revenueUp ? <TrendingUp size={11} strokeWidth={2.5} style={{ verticalAlign: '-1px' }} /> : <TrendingDown size={11} strokeWidth={2.5} style={{ verticalAlign: '-1px' }} />}
            {' '}{Math.abs(((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1)}% vs last month
          </p>
        </div>
        <div className={`${styles.statCard} ${styles.blue}`}>
          <p className={styles.statLabel}>6-month total</p>
          <p className={styles.statValue}>{fmt(total)}</p>
        </div>
        <div className={`${styles.statCard} ${styles.amber}`}>
          <p className={styles.statLabel}>Monthly average</p>
          <p className={styles.statValue}>{fmt(total / REVENUE.length)}</p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Monthly breakdown</h2>
        </div>
        <div className={styles.chartWrap}>
          {REVENUE.map((r) => (
            <div key={r.month} className={styles.barCol}>
              <div className={styles.bar} style={{ height: `${(r.amount / maxRevenue) * 100}%` }} />
              <span className={styles.barLabel}>{r.month}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.card} style={{ marginTop: 20 }}>
        <table className={styles.table}>
          <thead><tr><th>Month</th><th>Revenue</th></tr></thead>
          <tbody>
            {REVENUE.map((r) => (
              <tr key={r.month}><td>{r.month} 2026</td><td>{fmtFull(r.amount)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}