import Link from 'next/link';
import { CheckCircle2, Phone, ArrowRight } from 'lucide-react';
import styles from '../assets/styles/WhyChooseUs.module.css';

const REASONS = [
  'JCI-accredited quality standards',
  'Board-certified, experienced specialists',
  'Transparent, upfront pricing',
  'Advanced diagnostic technology',
  '24/7 emergency care, every location',
];

export default function WhyChooseUs() {
  return (
    <section className={styles.section}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.photoWrap}>
          <div
            className={styles.photo}
            style={{ backgroundImage: "url('/images/building2.png')" }}
          />
          <div className={styles.missionBadge}>
            <p className={styles.missionLabel}>Our mission</p>
            <p className={styles.missionText}>
              To deliver quality healthcare with compassion and innovation.
            </p>
          </div>
        </div>

        <div className={styles.content}>
          <h2 className={styles.title}>
            Why Choose <span className={styles.titleAccent}>Sam Healthcare</span>?
          </h2>
          <p className={styles.subtitle}>
            We combine innovation, expertise, and care to deliver the best
            healthcare experience for you and your family.
          </p>

          <ul className={styles.list}>
            {REASONS.map((reason) => (
              <li key={reason}>
                <CheckCircle2 size={18} strokeWidth={2} className={styles.checkIcon} />
                {reason}
              </li>
            ))}
          </ul>

          <Link href="/about" className={styles.learnMore}>
            Learn more about us
            <ArrowRight size={16} strokeWidth={2.25} />
          </Link>
        </div>

        <div className={styles.emergencyCard}>
  <div
    className={styles.emergencyPhoto}
    style={{ backgroundImage: "url('/images/emergency-card1.jpg')" }}
  />
  <div className={styles.emergencyBody}>
    <p className={styles.emergencyTitle}>Need emergency help?</p>
    <p className={styles.emergencyText}>
      We're available 24/7 for emergencies. Your health is our priority.
    </p>
    <a href="tel:+15551234000" className={styles.emergencyBtn}>
      <Phone size={16} strokeWidth={2} />
      (555) 123-4000
    </a>
  </div>
</div>
      </div>
    </section>
  );
}