import Link from 'next/link';
import { Star, Clock } from 'lucide-react';
import styles from '../assets/styles/TopDoctors.module.css';

const DOCTORS = [
  {
    name: 'Dr. Priya Sharma',
    specialty: 'General Physician',
    experience: '8+ yrs exp.',
    rating: 4.9,
    price: 'Rs499',
    available: 'Available today',
    image: '/images/doctor1.avif',
  },
  {
    name: 'Dr. Arjun Mehta',
    specialty: 'Cardiologist',
    experience: '12+ yrs exp.',
    rating: 4.8,
    price: 'Rs799',
    available: 'Available today',
    image: '/images/doctor2.avif',
  },
  {
    name: 'Dr. Neha Verma',
    specialty: 'Dermatologist',
    experience: '7+ yrs exp.',
    rating: 4.9,
    price: 'Rs599',
    available: 'Available tomorrow',
    image: '/images/doctor3.jpg',
  },
];

export default function TopDoctors() {
  return (
    <section className={styles.section}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.heading}>
          <h2 className={styles.title}>
            Top-Rated <span className={styles.titleAccent}>Doctors</span>
          </h2>
          <p className={styles.subtitle}>Experienced, compassionate, trusted.</p>
        </div>

        <div className={styles.grid}>
          {DOCTORS.map((doc) => (
            <div key={doc.name} className={styles.card}>
              <div className={styles.banner}>
                <span className={styles.availableBadge}>{doc.available}</span>
                <div
                  className={styles.avatar}
                  style={{ backgroundImage: `url('${doc.image}')` }}
                />
              </div>

              <div className={styles.cardBody}>
                <p className={styles.name}>{doc.name}</p>
                <p className={styles.specialty}>{doc.specialty}</p>

                <div className={styles.meta}>
                  <span className={styles.rating}>
                    <Star size={14} fill="var(--star)" stroke="var(--star)" />
                    {doc.rating}
                  </span>
                  <span className={styles.experience}>
                    <Clock size={14} strokeWidth={2} />
                    {doc.experience}
                  </span>
                </div>

                <p className={styles.price}>{doc.price}<span> / visit</span></p>

                <Link href="/book" className={styles.bookBtn}>
                  Book appointment
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}