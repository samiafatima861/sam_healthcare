import { Award, Stethoscope, LayoutGrid, Users, Building2 } from 'lucide-react';
import styles from '../assets/styles/TrustStats.module.css';

const STATS = [
  { icon: Award, value: '15+', label: 'Years of excellence' },
  { icon: Stethoscope, value: '40+', label: 'Expert doctors' },
  { icon: LayoutGrid, value: '14', label: 'Medical departments' },
  { icon: Users, value: '120K+', label: 'Happy patients' },
  { icon: Building2, value: '6', label: 'Healthcare centers' },
];

export default function TrustStats() {
  return (
    <section className={styles.section}>
      <div className={`container ${styles.wrap}`}>
        <div className={styles.card}>
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className={styles.item}>
                <span className={styles.iconWrap}>
                  <Icon size={20} strokeWidth={2} />
                </span>
                <div>
                  <p className={styles.value}>{stat.value}</p>
                  <p className={styles.label}>{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}