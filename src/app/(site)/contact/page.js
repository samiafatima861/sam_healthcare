import { Phone, Mail, MapPin, Clock, Stethoscope, HeartPulse, ChevronDown, ArrowRight } from 'lucide-react';
import ContactForm from '../../../components/ContactForm';
import NewsletterForm from '../../../components/NewsletterForm';
import CtaBanner from '../../../components/CtaBanner';
import Footer from '../../../components/Footer';
import styles from '../../../assets/styles/ContactPage.module.css';

export const metadata = { title: 'Contact us — Sam Healthcare' };

// Change these to your real details
const PHONE = '+92 21 111 222 333';
const EMAIL = 'info@samhealthcare.com';
const ADDRESS = '12 Clifton Road, Karachi, Pakistan';

const MAP_SRC = `https://www.google.com/maps?q=${encodeURIComponent(ADDRESS)}&output=embed`;
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(ADDRESS)}`;

const BADGES = [
  { icon: Clock, label: '24/7 Emergency care' },
  { icon: Stethoscope, label: '50+ Specialists' },
  { icon: HeartPulse, label: '10+ Departments' },
];

const FAQS = [
  { q: 'How quickly will I get a reply?', a: 'We usually reply to messages by email within a few hours during opening times, and by the next morning otherwise.' },
  { q: 'Is this form for medical emergencies?', a: 'No. For an emergency, call us directly or come to the emergency department, which is open 24 hours a day.' },
  { q: 'How do I book or change an appointment?', a: 'Use the Book appointment button on the site or in our mobile app. For changes, mention your name and appointment date in a message.' },
  { q: 'Can I ask about my bill or insurance?', a: 'Yes. Choose "Billing" as the subject and include your invoice number if you have one.' },
];

export default function ContactPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <span className={styles.eyebrow}>Contact us</span>
          <h1 className={styles.heroTitle}>
            We're here to <span className={styles.heroAccent}>help</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Ask a question, reach the front desk, or find us on the map. A real person reads every message.
          </p>
        </div>
      </section>

      <section className={`container ${styles.badgeWrap}`}>
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
        <div className={styles.mainGrid}>
          <ContactForm />

          <aside className={styles.sideCol}>
            <div className={styles.infoCard}>
  <div className={styles.infoHead}>
    <h2 className={styles.infoHeading}>Get in touch</h2>
    <p className={styles.infoIntro}>Call, email or visit us. We're happy to help.</p>
  </div>

  <ul className={styles.infoList}>
    <li>
      <a href={`tel:${PHONE.replace(/\s/g, '')}`} className={styles.infoItem}>
        <span className={styles.infoIcon}><Phone size={18} strokeWidth={2} /></span>
        <span className={styles.infoText}>
          <span className={styles.infoLabel}>Call us</span>
          <span className={styles.infoValue}>{PHONE}</span>
        </span>
        <ArrowRight size={16} strokeWidth={2} className={styles.infoArrow} />
      </a>
    </li>

    <li>
      <a href={`mailto:${EMAIL}`} className={styles.infoItem}>
        <span className={styles.infoIcon}><Mail size={18} strokeWidth={2} /></span>
        <span className={styles.infoText}>
          <span className={styles.infoLabel}>Email us</span>
          <span className={styles.infoValue}>{EMAIL}</span>
        </span>
        <ArrowRight size={16} strokeWidth={2} className={styles.infoArrow} />
      </a>
    </li>

    <li>
      <a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" className={styles.infoItem}>
        <span className={styles.infoIcon}><MapPin size={18} strokeWidth={2} /></span>
        <span className={styles.infoText}>
          <span className={styles.infoLabel}>Visit us</span>
          <span className={styles.infoValue}>{ADDRESS}</span>
        </span>
        <ArrowRight size={16} strokeWidth={2} className={styles.infoArrow} />
      </a>
    </li>

    <li>
      <div className={styles.infoItemStatic}>
        <span className={styles.infoIcon}><Clock size={18} strokeWidth={2} /></span>
        <span className={styles.infoText}>
          <span className={styles.infoLabel}>Opening hours</span>
          <span className={styles.infoValue}>OPD: 8:00 AM – 9:00 PM, every day</span>
        </span>
      </div>
    </li>
  </ul>

  <div className={styles.emergencyStrip}>
    <div>
      <p className={styles.emergencyLabel}>Medical emergency?</p>
      <p className={styles.emergencySub}>Our emergency department is open 24/7</p>
    </div>
    <a href={`tel:${PHONE.replace(/\s/g, '')}`} className={styles.emergencyBtn}>Call now</a>
  </div>
</div>

            <div className={styles.newsletterCard}>
              <NewsletterForm />
            </div>
          </aside>
        </div>

        <div className={styles.mapSection}>
          <div className={styles.mapHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Find <span className={styles.heroAccent}>us</span></h2>
              <p className={styles.sectionSub}>{ADDRESS}</p>
            </div>
            <a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" className={styles.directionsBtn}>
              Get directions <ArrowRight size={15} strokeWidth={2.25} />
            </a>
          </div>
          <div className={styles.mapFrameWrap}>
            <iframe
              title="Sam Healthcare Hospital location"
              src={MAP_SRC}
              className={styles.mapFrame}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <div className={styles.faqSection}>
          <h2 className={styles.sectionTitle}>Frequently asked <span className={styles.heroAccent}>questions</span></h2>
          <div className={styles.faqList}>
            {FAQS.map((f) => (
              <details key={f.q} className={styles.faqItem}>
                <summary className={styles.faqQuestion}>
                  {f.q}
                  <ChevronDown size={18} strokeWidth={2} className={styles.faqChevron} />
                </summary>
                <p className={styles.faqAnswer}>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner />
      <Footer />
    </>
  );
}