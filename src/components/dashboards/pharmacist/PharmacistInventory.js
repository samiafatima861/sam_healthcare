import { PackageSearch } from 'lucide-react';
import styles from '../../../assets/styles/StaffDashboards.module.css';

const INVENTORY = [
  { name: 'Amlodipine 5mg', stock: 18, capacity: 200, level: 'low' },
  { name: 'Paracetamol 500mg', stock: 640, capacity: 800, level: 'ok' },
  { name: 'Cetirizine 10mg', stock: 42, capacity: 300, level: 'low' },
  { name: 'Amoxicillin 250mg', stock: 210, capacity: 400, level: 'ok' },
];

export default function PharmacistInventory() {
  const lowStock = INVENTORY.filter((i) => i.level === 'low').length;

  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>
            <PackageSearch size={20} strokeWidth={2} style={{ verticalAlign: '-3px', marginRight: 8 }} />
            Stock levels
          </h1>
          <p className={styles.subtitle}>{lowStock} items running low.</p>
        </div>
      </div>

      <div className={styles.card}>
        {INVENTORY.map((i) => {
          const pct = Math.round((i.stock / i.capacity) * 100);
          return (
            <div key={i.name} className={styles.row}>
              <div className={styles.rowInfo}>
                <p className={styles.rowTitle}>{i.name}</p>
                <p className={styles.rowSub}>{i.stock} units left</p>
              </div>
              <div className={styles.inventoryBarTrack}>
                <div
                  className={styles.inventoryBarFill}
                  style={{ width: `${pct}%`, background: i.level === 'low' ? '#A63737' : 'var(--brand-accent)' }}
                />
              </div>
              {i.level === 'low' && <span className={`${styles.pill} ${styles.pillDanger}`}>Low stock</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}