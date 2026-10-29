import { Phone } from 'lucide-react';
import BookingFlow from '../../../components/BookingFlow';
import Footer from '../../../components/Footer';
import styles from '../../../assets/styles/BookPage.module.css';

export const metadata = { title: 'Book an appointment — Sam Healthcare' };

// Change to your real number
const PHONE = '+92 21 111 222 333';

export default function BookPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <span className={styles.eyebrow}>Book appointment</span>
          <h1 className={styles.heroTitle}>
            Book your <span className={styles.heroAccent}>appointment</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Choose a department, pick a doctor and a time that suits you. It takes about a minute.
          </p>
        </div>
      </section>

      <section className={`container ${styles.body}`}>
        <BookingFlow />
      </section>

      <section className={`container ${styles.helpSection}`}>
        <div className={styles.helpCard}>
          <div>
            <h2 className={styles.helpTitle}>Prefer to book by phone?</h2>
            <p className={styles.helpText}>Our front desk is open 8:00 AM to 9:00 PM, every day.</p>
          </div>
          <a href={`tel:${PHONE.replace(/\s/g, '')}`} className={styles.helpBtn}>
            <Phone size={16} strokeWidth={2.25} />
            {PHONE}
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}