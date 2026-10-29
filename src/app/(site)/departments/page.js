import DepartmentsDirectory from '../../../components/DepartmentsDirectory';
import CtaBanner from '../../../components/CtaBanner';
import Footer from '../../../components/Footer';
import styles from '../../../assets/styles/DepartmentsPage.module.css';

export const metadata = { title: 'Departments — Sam Healthcare' };

export default function DepartmentsPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <span className={styles.eyebrow}>Departments</span>
          <h1 className={styles.heroTitle}>
            Expert care in every <span className={styles.accent}>specialty</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Ten departments, one connected hospital record. Find the team that fits your needs and book in under a minute.
          </p>
        </div>
      </section>

      <section className={`container ${styles.body}`}>
        <DepartmentsDirectory />
      </section>

      <CtaBanner />
      <Footer />
    </>
  );
}