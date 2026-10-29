'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Star, CalendarPlus } from 'lucide-react';
import styles from '../assets/styles/DoctorsPage.module.css';

// Edit this list: photos, ratings and fees here are placeholders
const DOCTORS = [
  { name: 'Dr. Priya Sharma', department: 'General Physician', years: 8, rating: 4.9, fee: 499, available: 'Today', photo: '/images/doctor1.avif' },
  { name: 'Dr. Arjun Mehta', department: 'Cardiology', years: 12, rating: 4.8, fee: 799, available: 'Today', photo: '/images/doctor2.avif' },
  { name: 'Dr. Neha Verma', department: 'Dermatology', years: 7, rating: 4.9, fee: 599, available: 'Tomorrow', photo: '/images/doctor3.avif' },
  { name: 'Dr. Omar Siddiqui', department: 'Orthopedics', years: 10, rating: 4.8, fee: 699, available: 'Tomorrow', photo: '/images/doctor4.avif' },
];

const DEPARTMENTS = ['All', ...new Set(DOCTORS.map((d) => d.department))];

const initials = (name) =>
  name.replace('Dr. ', '').split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();

function Avatar({ doctor }) {
  const [failed, setFailed] = useState(false);

  if (!doctor.photo || failed) {
    return <span className={styles.avatarFallback}>{initials(doctor.name)}</span>;
  }

  return (
    <Image
      src={doctor.photo}
      alt={doctor.name}
      width={96}
      height={96}
      className={styles.avatarImg}
      onError={() => setFailed(true)}
    />
  );
}

export default function DoctorsDirectory() {
  const [dept, setDept] = useState('All');
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const shown = DOCTORS.filter(
    (d) =>
      (dept === 'All' || d.department === dept) &&
      (!q || d.name.toLowerCase().includes(q) || d.department.toLowerCase().includes(q))
  );

  function clearFilters() {
    setDept('All');
    setQuery('');
  }

  return (
    <>
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={17} strokeWidth={2} className={styles.searchIcon} />
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search by doctor name or department"
            aria-label="Search doctors"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className={styles.chips}>
          {DEPARTMENTS.map((d) => (
            <button
              key={d}
              type="button"
              className={`${styles.chip} ${dept === d ? styles.chipActive : ''}`}
              onClick={() => setDept(d)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <p className={styles.resultCount}>
        {shown.length} doctor{shown.length === 1 ? '' : 's'} found
      </p>

      {shown.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>No doctors match your search</p>
          <p className={styles.emptyText}>Try a different name or department.</p>
          <button type="button" className={styles.clearBtn} onClick={clearFilters}>Clear filters</button>
        </div>
      ) : (
        <div className={styles.grid}>
          {shown.map((d) => (
            <article key={d.name} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.availability}>
                  <span className={styles.availDot} /> Available {d.available.toLowerCase()}
                </span>
                <div className={styles.avatarWrap}>
                  <Avatar doctor={d} />
                </div>
              </div>

              <div className={styles.cardBody}>
                <h2 className={styles.name}>{d.name}</h2>
                <span className={styles.specialty}>{d.department}</span>

                <div className={styles.stats}>
                  <div className={styles.stat}>
                    <span className={styles.statValue}>
                      <Star size={13} strokeWidth={2} fill="currentColor" className={styles.starIcon} /> {d.rating}
                    </span>
                    <span className={styles.statLabel}>Rating</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statValue}>{d.years}+ yrs</span>
                    <span className={styles.statLabel}>Experience</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statValue}>Rs {d.fee}</span>
                    <span className={styles.statLabel}>Per visit</span>
                  </div>
                </div>

                <Link href="/book" className={styles.bookBtn}>
                  <CalendarPlus size={15} strokeWidth={2.25} /> Book appointment
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}