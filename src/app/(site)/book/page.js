import PageHeader from '../../../components/PageHeader';
import BookingFlow from '../../../components/BookingFlow';
import styles from '../../../assets/styles/BookPage.module.css';

export const metadata = { title: 'Book an appointment — Sam Healthcare' };

export default function BookPage() {
  return (
    <>
      <PageHeader title="Book an appointment" subtitle="Pick a department, doctor, and time that works for you." />
      <section className={`container ${styles.section}`}>
        <BookingFlow />
      </section>
    </>
  );
}