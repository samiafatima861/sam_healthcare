'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from '../assets/styles/Partners.module.css';

const PARTNERS = [
  { name: 'HealthGuard Insurance', logo: '/images/partners/hospital-logo1.png' },
  { name: 'MediCover', logo: '/images/partners/hospital-logo2.avif' },
  { name: 'TrustAssure', logo: '/images/partners/hospital-logo3.png' },
  { name: 'CarePlus Network', logo: '/images/partners/hospital-logo4.png' },
  { name: 'WellCare TPA', logo: '/images/partners/hospital-logo5.png' },
  { name: 'SecureHealth', logo: '/images/partners/hospital-logo6.jpg' },
];

export default function Partners() {
  const [failed, setFailed] = useState({});

  return (
    <section className={styles.section}>
      <div className={`container ${styles.inner}`}>
  <p className={styles.label}>Accepted insurance partners</p>
  <h2 className={styles.title}>
    Trusted by <span className={styles.titleAccent}>leading providers</span>
  </h2>
</div>

      <div className={styles.marqueeWrap}>
        <div className={styles.marqueeTrack}>
          {[0, 1].map((copy) => (
            <div key={copy} className={styles.group} aria-hidden={copy === 1}>
              {PARTNERS.map((partner) => (
                <div key={partner.name} className={styles.logoCard}>
                  {failed[partner.name] ? (
                    <span className={styles.fallbackText}>{partner.name}</span>
                  ) : (
                    <Image
                      src={partner.logo}
                      alt={copy === 0 ? partner.name : ''}
                      width={160}
                      height={48}
                      className={styles.logoImg}
                      onError={() =>
                        setFailed((f) => ({ ...f, [partner.name]: true }))
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}