'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Brain, Bone, Baby, Sparkles, Ear, Eye, MessageCircle, Droplets,
  Stethoscope, CalendarPlus, ArrowRight, X, Check, Clock,
} from 'lucide-react';
import styles from '../assets/styles/DepartmentsPage.module.css';
import SearchInput from './SearchInput';

// Edit this list: the treatments below are placeholders, so replace them with what each department really offers
const DEPARTMENTS = [
  { name: 'Cardiology', icon: Heart, image: '/images/cardio.webp', description: 'Advanced care for your heart and blood pressure.', treatments: ['ECG and echo', 'Blood pressure care', 'Heart check-ups', 'Cholesterol management'] },
  { name: 'Neurology', icon: Brain, image: '/images/Neurology-1.png', description: 'Expert treatment for brain, spine and nerves.', treatments: ['Migraine and headaches', 'Stroke follow-up', 'Nerve conditions', 'Epilepsy care'] },
  { name: 'Orthopedics', icon: Bone, image: '/images/ortho1.avif', description: 'Bone, joint and mobility care.', treatments: ['Fractures', 'Joint pain', 'Sports injuries', 'Physiotherapy referral'] },
  { name: 'Pediatrics', icon: Baby, image: '/images/pediatric.jpg', description: 'Special care for infants, children and teens.', treatments: ['Vaccinations', 'Growth checks', 'Childhood illness', 'Newborn care'] },
  { name: 'Dermatology', icon: Sparkles, image: '/images/derma.webp', description: 'Skin, hair and nail treatment.', treatments: ['Acne and eczema', 'Hair loss', 'Skin allergies', 'Skin check-ups'] },
  { name: 'ENT', icon: Ear, image: '/images/ent.webp', description: 'Ear, nose and throat specialists.', treatments: ['Hearing tests', 'Sinus problems', 'Throat infections', 'Allergy care'] },
  { name: 'Gynecology', icon: Stethoscope, image: '/images/gynee.jpg', description: "Women's health at every stage of life.", treatments: ['Pregnancy care', 'Routine check-ups', "Women's wellness", 'Family planning'] },
  { name: 'Ophthalmology', icon: Eye, image: '/images/eye.webp', description: 'Complete eye care and surgery.', treatments: ['Eye tests', 'Cataract care', 'Vision correction', 'Glaucoma screening'] },
  { name: 'Psychiatry', icon: MessageCircle, image: '/images/psychology.jpg', description: 'Mental health support and therapy.', treatments: ['Anxiety and stress', 'Depression care', 'Counselling', 'Sleep problems'] },
  { name: 'Urology', icon: Droplets, image: '/images/urology.jpg', description: 'Kidney, bladder and urinary care.', treatments: ['Kidney stones', 'Urinary problems', 'Prostate care', 'Kidney check-ups'] },
];

function Photo({ dept, tall }) {
  const [failed, setFailed] = useState(false);
  const Icon = dept.icon;

  return (
    <div className={`${styles.photoWrap} ${tall ? styles.photoWrapTall : ''}`}>
      {failed ? (
        <div className={styles.photoFallback}><Icon size={44} strokeWidth={1.5} /></div>
      ) : (
        <Image
          src={dept.image}
          alt={`${dept.name} department`}
          fill
          sizes={tall ? '(max-width: 700px) 100vw, 560px' : '(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 25vw'}
          className={styles.photo}
          onError={() => setFailed(true)}
        />
      )}
      <span className={styles.photoShade} />
      <span className={styles.badge}><Icon size={18} strokeWidth={2} /></span>
    </div>
  );
}

function DetailModal({ dept, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className={styles.overlay}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label={`${dept.name} department`}>
        <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Close">
          <X size={18} strokeWidth={2.25} />
        </button>

        <Photo dept={dept} tall />

        <div className={styles.modalBody}>
          <h2 className={styles.modalTitle}>{dept.name}</h2>
          <p className={styles.modalDesc}>{dept.description}</p>

          <h3 className={styles.modalHeading}>What we treat</h3>
          <ul className={styles.treatList}>
            {dept.treatments.map((t) => (
              <li key={t} className={styles.treatItem}>
                <span className={styles.treatCheck}><Check size={12} strokeWidth={3} /></span>
                {t}
              </li>
            ))}
          </ul>

          <p className={styles.hours}>
            <Clock size={15} strokeWidth={2} /> OPD open 8:00 AM to 9:00 PM, every day
          </p>

          <div className={styles.modalActions}>
            <Link href={`/book?department=${encodeURIComponent(dept.name)}`} className={styles.bookBtn}>
              <CalendarPlus size={15} strokeWidth={2.25} /> Book appointment
            </Link>
            <Link href="/doctors" className={styles.linkBtn}>View doctors</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DepartmentsDirectory() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const close = useCallback(() => setSelected(null), []);

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
        <SearchInput width={260} label="Search staff" placeholder="Search name, role or email" value={query} onChange={setQuery} />
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
              <button
                type="button"
                className={styles.cardMain}
                onClick={() => setSelected(d)}
                aria-label={`View details for ${d.name}`}
              >
                <Photo dept={d} />
                <span className={styles.cardBody}>
                  <span className={styles.name}>{d.name}</span>
                  <span className={styles.desc}>{d.description}</span>
                  <span className={styles.tags}>
                    {d.treatments.slice(0, 3).map((t) => <span key={t} className={styles.tag}>{t}</span>)}
                  </span>
                  <span className={styles.more}>Learn more <ArrowRight size={13} strokeWidth={2.5} /></span>
                </span>
              </button>

              <div className={styles.actions}>
                <Link href={`/book?department=${encodeURIComponent(d.name)}`} className={styles.bookBtn}>
                  <CalendarPlus size={15} strokeWidth={2.25} /> Book
                </Link>
                <Link href="/doctors" className={styles.linkBtn}>View doctors</Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {selected && <DetailModal dept={selected} onClose={close} />}
    </>
  );
}