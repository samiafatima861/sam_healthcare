import Image from 'next/image';
import { Phone, Mail, MapPin, Clock, Stethoscope, HeartPulse } from 'lucide-react';
import styles from '../../../assets/styles/ContactPage.module.css';

export const metadata = { title: 'Contact us — Sam Healthcare' };

const BADGES = [
  { icon: Clock, label: '24/7 Emergency care' },
  { icon: Stethoscope, label: '50+ Specialists' },
  { icon: HeartPulse, label: '10+ Departments' },
];

export default function ContactPage() {
  return (
    <>
      <section className={styles.hero}>
        <span className={styles.chevronTopLeft} aria-hidden="true">
          <svg width="90" height="60" viewBox="0 0 90 60" fill="none">
            <path d="M4 4L34 30L4 56" stroke="var(--brand-accent)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
            <path d="M30 4L60 30L30 56" stroke="var(--brand-accent)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
          </svg>
        </span>
        <span className={styles.chevronBottomRight} aria-hidden="true">
          <svg width="90" height="60" viewBox="0 0 90 60" fill="none">
            <path d="M4 4L34 30L4 56" stroke="var(--brand-accent)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
            <path d="M30 4L60 30L30 56" stroke="var(--brand-accent)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
          </svg>
        </span>

        <div className={`container ${styles.heroInner}`}>
          <h1 className={styles.heroTitle}>Contact us</h1>
          <svg className={styles.wave} width="140" height="18" viewBox="0 0 140 18" fill="none">
            <path d="M2 14C14 2 24 2 36 14C48 26 58 26 70 14C82 2 92 2 104 14C116 26 126 26 138 14" stroke="var(--brand-accent)" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <p className={styles.heroSubtitle}>
            Reach the front desk, ask a question, or find us on the map — we usually reply within a few hours.
          </p>
        </div>

        <div className={styles.badgeStrip}>
          {BADGES.map((b) => (
            <div key={b.label} className={styles.badge}>
              <span className={styles.badgeIcon}><b.icon size={18} strokeWidth={2} /></span>
              <span className={styles.badgeLabel}>{b.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={`container ${styles.body}`}>
        <div className={styles.formGrid}>
          <form className={styles.form}>
            <h2 className={styles.formTitle}>Send us a message</h2>
            <div className={styles.fieldRow}>
              <div className={styles.fieldCol}>
                <label className={styles.fieldLabel} htmlFor="c-email">Email</label>
                <input id="c-email" type="email" className={styles.input} placeholder="you@email.com" />
              </div>
              <div className={styles.fieldCol}>
                <label className={styles.fieldLabel} htmlFor="c-phone">Phone</label>
                <input id="c-phone" type="tel" className={styles.input} placeholder="+92 300 1234567" />
              </div>
            </div>
            <label className={styles.fieldLabel} htmlFor="c-name">Name</label>
            <input id="c-name" type="text" className={styles.input} placeholder="Your name" />
            <label className={styles.fieldLabel} htmlFor="c-message">Message</label>
            <textarea id="c-message" className={styles.textarea} placeholder="How can we help?" />
            <button type="button" className={styles.submitBtn}>Send message</button>
          </form>

          <div className={styles.newsletterCard}>
            <h3 className={styles.newsletterTitle}>Health tips, monthly</h3>
            <p className={styles.newsletterText}>
              Short, useful notes from our doctors — seasonal advice, checkup reminders, nothing spammy.
            </p>
            <input type="email" className={styles.newsletterInput} placeholder="Email" />
            <button type="button" className={styles.newsletterBtn}>Subscribe</button>
          </div>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}><Phone size={20} strokeWidth={2} /></span>
            <h3 className={styles.infoTitle}>+92 21 111 222 333</h3>
            <p className={styles.infoText}>Call the front desk, 8 AM – 10 PM daily.</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}><Mail size={20} strokeWidth={2} /></span>
            <h3 className={styles.infoTitle}>info@samhealthcare.com</h3>
            <p className={styles.infoText}>General questions, usually answered same day.</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}><MapPin size={20} strokeWidth={2} /></span>
            <h3 className={styles.infoTitle}>12 Clifton Road, Karachi</h3>
            <p className={styles.infoText}>Pakistan. Parking available on-site.</p>
          </div>
        </div>

        <div className={styles.mapCard}>
          <Image src="/images/facility.jpg" alt="Sam Healthcare location" fill className={styles.mapImage} />
          <div className={styles.mapOverlay} />
          <span className={styles.mapPin}><MapPin size={22} strokeWidth={2.5} /></span>
          <div className={styles.mapCaption}>
            <p className={styles.mapCaptionTitle}>Map coming soon</p>
            <p className={styles.mapCaptionText}>An interactive map of our location will be added here.</p>
          </div>
        </div>
      </section>
    </>
  );
}