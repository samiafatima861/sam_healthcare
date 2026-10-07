import Link from 'next/link';
import { ArrowRight, Users } from 'lucide-react';
import styles from '../assets/styles/CtaBanner.module.css';

export default function CtaBanner() {
  return (
    <section className={styles.section}>
      <div className={`container ${styles.wrap}`}>
        <div className={styles.card}>
          <div className={styles.text}>
            <h2 className={styles.title}>Your health is our priority</h2>
            <p className={styles.subtitle}>
              Let us take care of you and your family with trusted, JCI-accredited healthcare services.
            </p>
          </div>

          <div className={styles.actions}>
            <Link href="/book" className={styles.cta}>
              Book your appointment now
              <ArrowRight size={17} strokeWidth={2.25} />
            </Link>
            <span className={styles.iconCircle}>
              <Users size={20} strokeWidth={2} />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}