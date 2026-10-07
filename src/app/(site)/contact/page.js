import PageHeader from '../../../components/PageHeader';
import EmptyState from '../../../components/EmptyState';
import { Phone, Mail, MapPin, MapPinned } from 'lucide-react';
import styles from '../../../assets/styles/ContactPage.module.css';

export const metadata = { title: 'Contact us — Sam Healthcare' };

export default function ContactPage() {
  return (
    <>
      <PageHeader title="Contact us" subtitle="Reach the front desk, ask a question, or find us on the map." />
      <section className={`container ${styles.section}`}>
        <div className={styles.grid}>
          <div className={styles.infoCol}>
            <div className={styles.infoRow}>
              <span className={styles.infoIcon}><Phone size={18} strokeWidth={2} /></span>
              <div>
                <p className={styles.infoLabel}>Phone</p>
                <p className={styles.infoValue}>+92 21 111 222 333</p>
              </div>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoIcon}><Mail size={18} strokeWidth={2} /></span>
              <div>
                <p className={styles.infoLabel}>Email</p>
                <p className={styles.infoValue}>info@samhealthcare.com</p>
              </div>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoIcon}><MapPin size={18} strokeWidth={2} /></span>
              <div>
                <p className={styles.infoLabel}>Address</p>
                <p className={styles.infoValue}>12 Clifton Road, Karachi, Pakistan</p>
              </div>
            </div>

            <form className={styles.form}>
              <label className={styles.fieldLabel} htmlFor="c-name">Name</label>
              <input id="c-name" type="text" className={styles.input} placeholder="Your name" />
              <label className={styles.fieldLabel} htmlFor="c-message">Message</label>
              <textarea id="c-message" className={styles.textarea} placeholder="How can we help?" />
              <button type="button" className={styles.submitBtn}>Send message</button>
            </form>
          </div>

          <EmptyState
            icon={MapPinned}
            title="Map coming soon"
            message="An interactive map of our location will be added here."
          />
        </div>
      </section>
    </>
  );
}