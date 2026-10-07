import PageHeader from '../../../components/PageHeader';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../../../assets/styles/DoctorsPage.module.css';

export const metadata = { title: 'Find a doctor — Sam Healthcare' };

const DOCTORS = [
  { name: 'Dr. Priya Sharma', specialty: 'General Physician', image: '/images/doctor1.avif' },
  { name: 'Dr. Arjun Mehta', specialty: 'Cardiologist', image: '/images/doctor2.avif' },
  { name: 'Dr. Neha Verma', specialty: 'Dermatologist', image: '/images/doctor3.avif' },
  { name: 'Dr. Omar Siddiqui', specialty: 'Orthopedist', image: '/images/doctor4.avif' },
];

export default function DoctorsPage() {
  return (
    <>
      <PageHeader title="Find a doctor" subtitle="Browse our specialists and book a consultation." />
      <section className={`container ${styles.section}`}>
        <div className={styles.grid}>
          {DOCTORS.map((d) => (
            <div key={d.name} className={styles.card}>
              <Image src={d.image} alt={d.name} width={280} height={280} className={styles.photo} />
              <h3 className={styles.name}>{d.name}</h3>
              <p className={styles.specialty}>{d.specialty}</p>
              <Link href="/book" className={styles.bookLink}>Book appointment</Link>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}