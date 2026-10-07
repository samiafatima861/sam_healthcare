import Link from 'next/link';
import { Stethoscope, CalendarPlus, Pill, FlaskConical, CreditCard, ArrowRight } from 'lucide-react';
import styles from '../assets/styles/QuickActions.module.css';

const ACTIONS = [
  {
    icon: Stethoscope,
    title: 'Find a doctor',
    description: 'Connect with our specialists',
    href: '/doctors',
  },
  {
    icon: CalendarPlus,
    title: 'Book appointment',
    description: 'Your health, on your schedule',
    href: '/book',
  },
  {
    icon: Pill,
    title: 'Pharmacy',
    description: 'Prescriptions, delivered fast',
    href: '#',
  },
  {
    icon: FlaskConical,
    title: 'Lab reports',
    description: 'Accurate, reliable results',
    href: '/portal',
  },
  {
    icon: CreditCard,
    title: 'Pay a bill',
    description: 'Quick and secure payment',
    href: '/portal',
  },
];

export default function QuickActions() {
  return (
    <section className={styles.wrap}>
      <div className={`container ${styles.card}`}>
        <h2 className={styles.heading}>How can we help you?</h2>

        <div className={styles.grid}>
          {ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.title} href={action.href} className={styles.item}>
                <div className={styles.itemTop}>
                  <span className={styles.iconWrap}>
                    <Icon size={20} strokeWidth={2.5} />
                  </span>
                  <div className='{styles.itemText'>
                    <p className={styles.itemTitle}>{action.title}</p>
                    <p className={styles.itemDesc}>{action.description}</p>
                  </div>
                </div>
                <span className={styles.arrow}>
                  <ArrowRight size={14} strokeWidth={2.25} />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}