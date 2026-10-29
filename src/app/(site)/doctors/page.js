import DoctorsDirectory from '../../../components/DoctorsDirectory';
import CtaBanner from '../../../components/CtaBanner';
import Footer from '../../../components/Footer';
import styles from '../../../assets/styles/DoctorsPage.module.css';

export const metadata = { title: 'Find a doctor — Sam Healthcare' };

export default function DoctorsPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <span className={styles.eyebrow}>Find a doctor</span>
          <h1 className={styles.heroTitle}>
            Find the right <span className={styles.accent}>doctor</span> for you
          </h1>
          <p className={styles.heroSubtitle}>
            Browse our specialists, compare experience, and book a consultation in under a minute.
          </p>
        </div>
      </section>

      <section className={`container ${styles.body}`}>
        <DoctorsDirectory />
      </section>

      <CtaBanner />
      <Footer />
    </>
  );
}