import PageHeader from '../../../components/PageHeader';
import Image from 'next/image';
import { HeartPulse, ShieldCheck, Users } from 'lucide-react';
import styles from '../../../assets/styles/AboutPage.module.css';

export const metadata = { title: 'About us — Sam Healthcare' };

const VALUES = [
  { icon: HeartPulse, title: 'Patient-first care', text: 'Every decision starts with what is best for the person in front of us.' },
  { icon: ShieldCheck, title: 'Trusted expertise', text: 'Specialists across 10+ departments, held to the same standard of care.' },
  { icon: Users, title: 'A team that listens', text: 'From the front desk to the OT, everyone here is part of your care.' },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="About Sam Healthcare"
        subtitle="A hospital built around one idea: care should feel personal, even at scale."
      />
      <section className={`container ${styles.section}`}>
        <div className={styles.intro}>
          <Image src="/images/facility.jpg" alt="Sam Healthcare facility" width={560} height={360} className={styles.introImage} />
          <div>
            <h2 className={styles.introTitle}>Our story</h2>
            <p className={styles.introText}>
              Sam Healthcare Hospital brings together general and specialist care under one roof,
              with a focus on shortening the distance between a patient and the right doctor.
              Our team spans cardiology, dermatology, orthopedics, pediatrics, and more — supported
              by a lab, pharmacy, and OT that all work from the same patient record.
            </p>
          </div>
        </div>

        <div className={styles.valuesGrid}>
          {VALUES.map((v) => (
            <div key={v.title} className={styles.valueCard}>
              <span className={styles.valueIcon}><v.icon size={20} strokeWidth={2} /></span>
              <h3 className={styles.valueTitle}>{v.title}</h3>
              <p className={styles.valueText}>{v.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}