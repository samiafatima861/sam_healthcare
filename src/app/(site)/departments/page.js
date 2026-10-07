import PageHeader from '../../../components/PageHeader';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../../../assets/styles/DepartmentsPage.module.css';

export const metadata = { title: 'Departments — Sam Healthcare' };

const DEPARTMENTS = [
  { name: 'Cardiology', image: '/images/dept-cardiology.jpg' },
  { name: 'Neurology', image: '/images/dept-neurology.jpg' },
  { name: 'Orthopedics', image: '/images/dept-orthopedics.jpg' },
  { name: 'Pediatrics', image: '/images/dept-pediatrics.jpg' },
  { name: 'Dermatology', image: '/images/dept-dermatology.jpg' },
  { name: 'ENT', image: '/images/dept-ent.jpg' },
  { name: 'Gynecology', image: '/images/dept-gynecology.jpg' },
  { name: 'Ophthalmology', image: '/images/dept-ophthalmology.jpg' },
  { name: 'Psychiatry', image: '/images/dept-psychiatry.jpg' },
  { name: 'Urology', image: '/images/dept-urology.jpg' },
];

export default function DepartmentsPage() {
  return (
    <>
      <PageHeader title="Departments" subtitle="Ten specialties, one hospital record." />
      <section className={`container ${styles.section}`}>
        <div className={styles.grid}>
          {DEPARTMENTS.map((d) => (
            <Link key={d.name} href="/doctors" className={styles.card}>
              <Image src={d.image} alt={d.name} width={300} height={200} className={styles.photo} />
              <p className={styles.name}>{d.name}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}