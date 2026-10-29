'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Heart, Brain, Bone, Baby, Sparkles, Ear, Eye, MessageCircle, Droplets, Stethoscope, CalendarPlus } from 'lucide-react';
import styles from '../assets/styles/DepartmentsPage.module.css';

// Edit this list: the treatments below are placeholders, so replace them with what each department really offers
const DEPARTMENTS = [
  { name: 'Cardiology', icon: Heart, image: '/images/cardio.webp', description: 'Advanced care for your heart and blood pressure.', treatments: ['ECG and echo', 'Blood pressure care', 'Heart check-ups'] },
  { name: 'Neurology', icon: Brain, image: '/images/Neurology-1.png', description: 'Expert treatment for brain, spine and nerves.', treatments: ['Migraine and headaches', 'Stroke follow-up', 'Nerve conditions'] },
  { name: 'Orthopedics', icon: Bone, image: '/images/ortho1.avif', description: 'Bone, joint and mobility care.', treatments: ['Fractures', 'Joint pain', 'Sports injuries'] },
  { name: 'Pediatrics', icon: Baby, image: '/images/pediatric.jpg', description: 'Special care for infants, children and teens.', treatments: ['Vaccinations', 'Growth checks', 'Childhood illness'] },
  { name: 'Dermatology', icon: Sparkles, image: '/images/derma.webp', description: 'Skin, hair and nail treatment.', treatments: ['Acne and eczema', 'Hair loss', 'Skin allergies'] },
  { name: 'ENT', icon: Ear, image: '/images/ent.webp', description: 'Ear, nose and throat specialists.', treatments: ['Hearing tests', 'Sinus problems', 'Throat infections'] },
  { name: 'Gynecology', icon: Stethoscope, image: '/images/gynee.jpg', description: "Women's health at every stage of life.", treatments: ['Pregnancy care', 'Routine check-ups', "Women's wellness"] },
  { name: 'Ophthalmology', icon: Eye, image: '/images/eye.webp', description: 'Complete eye care and surgery.', treatments: ['Eye tests', 'Cataract care', 'Vision correction'] },
  { name: 'Psychiatry', icon: MessageCircle, image: '/images/psychology.jpg', description: 'Mental health support and therapy.', treatments: ['Anxiety and stress', 'Depression care', 'Counselling'] },
  { name: 'Urology', icon: Droplets, image: '/images/urology.jpg', description: 'Kidney, bladder and urinary care.', treatments: ['Kidney stones', 'Urinary problems', 'Prostate care'] },
];

function Photo({ dept }) {
  const [failed, setFailed] = useState(false);
  const Icon = dept.icon;

  return (
    <div className={styles.photoWrap}>
      {failed ? (
        <div className={styles.photoFallback}><Icon size={44} strokeWidth={1.5} /></div>
      ) : (
        <Image
          src={dept.image}
          alt={`${dept.name} department`}
          fill
          sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 25vw"
          className={styles.photo}
          onError={() => setFailed(true)}
        />
      )}
      <span className={styles.photoShade} />
      <span className={styles.badge}><Icon size={18} strokeWidth={2} /></span>
    </div>
  );
}

export default function DepartmentsDirectory() {
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const shown = DEPARTMENTS.filter(
    (d) =>
      !q ||
      d.name.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q) ||
      d.treatments.some((t) => t.toLowerCase().includes(q))
  );

  return (
    <>
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={17} strokeWidth={2} className={styles.searchIcon} />
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search by department, condition or treatment"
            aria-label="Search departments"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <p className={styles.resultCount}>
        {shown.length} department{shown.length === 1 ? '' : 's'}
      </p>

      {shown.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>No departments match your search</p>
          <p className={styles.emptyText}>Try a different word, such as "heart" or "skin".</p>
          <button type="button" className={styles.clearBtn} onClick={() => setQuery('')}>Clear search</button>
        </div>
      ) : (
        <div className={styles.grid}>
          {shown.map((d) => (
            <article key={d.name} className={styles.card}>
              <Photo dept={d} />

              <div className={styles.cardBody}>
                <h2 className={styles.name}>{d.name}</h2>
                <p className={styles.desc}>{d.description}</p>

                <ul className={styles.tags}>
                  {d.treatments.map((t) => <li key={t} className={styles.tag}>{t}</li>)}
                </ul>

                <div className={styles.actions}>
                  <Link href="/book" className={styles.bookBtn}>
                    <CalendarPlus size={15} strokeWidth={2.25} /> Book
                  </Link>
                  <Link href="/doctors" className={styles.linkBtn}>View doctors</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}