'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from '../assets/styles/Departments.module.css';

const DEPARTMENTS = [
  { name: 'Cardiology', description: 'Advanced care for your heart', image: '/images/cardio.webp' },
  { name: 'Neurology', description: 'Expert treatment for brain and nerves', image: '/images/Neurology-1.png' },
  { name: 'Orthopedics', description: 'Bone, joint, and mobility care', image: '/images/ortho1.avif' },
  { name: 'Pediatrics', description: 'Special care for your little ones', image: '/images/pediatric.jpg' },
  { name: 'Dermatology', description: 'Skin, hair, and nail treatment', image: '/images/derma.webp' },
  { name: 'ENT', description: 'Ear, nose, and throat specialists', image: '/images/ent.webp' },
  { name: 'Gynecology', description: 'Women\u2019s health at every stage', image: '/images/gynee.jpg' },
  { name: 'Ophthalmology', description: 'Complete eye care and surgery', image: '/images/eye.webp' },
  { name: 'Psychiatry', description: 'Mental health support and therapy', image: '/images/psychology.jpg' },
  { name: 'Urology', description: 'Kidney, bladder, and urinary care', image: '/images/urology.jpg' },
];

const PER_PAGE = 5;
const TOTAL_PAGES = Math.ceil(DEPARTMENTS.length / PER_PAGE);

export default function Departments() {
  const [page, setPage] = useState(0);

  const start = page * PER_PAGE;
  const visible = DEPARTMENTS.slice(start, start + PER_PAGE);

  return (
    <section className={styles.section}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.heading}>
          <h2 className={styles.title}>
            Our Healthcare <span className={styles.titleAccent}>Departments</span>
          </h2>
          <p className={styles.subtitle}>
            Expert care across 14 specialties, all under one roof.
          </p>
        </div>

        <div className={styles.carousel}>
          <button
            type="button"
            className={`${styles.pagerBtn} ${styles.pagerLeft}`}
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 0}
            aria-label="Previous departments"
          >
            <ChevronLeft size={18} strokeWidth={2} />
          </button>

          <div className={styles.grid}>
            {visible.map((dept) => (
              <Link key={dept.name} href="/departments" className={styles.card}>
                <div
                  className={styles.photo}
                  style={{ backgroundImage: `url('${dept.image}')` }}
                />
                <div className={styles.cardBody}>
                  <div>
                    <p className={styles.cardTitle}>{dept.name}</p>
                    <p className={styles.cardDesc}>{dept.description}</p>
                  </div>
                  <span className={styles.arrow}>
                    <ArrowRight size={14} strokeWidth={2.25} />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <button
            type="button"
            className={`${styles.pagerBtn} ${styles.pagerRight}`}
            onClick={() => setPage((p) => p + 1)}
            disabled={page === TOTAL_PAGES - 1}
            aria-label="Next departments"
          >
            <ChevronRight size={18} strokeWidth={2} />
          </button>
        </div>
      </div>
    </section>
  );
}