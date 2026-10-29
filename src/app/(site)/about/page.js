import Image from 'next/image';
import Link from 'next/link';
import {
  Target, Eye, HeartPulse, ShieldCheck, Users, Clock, Stethoscope, Check, ArrowRight,
} from 'lucide-react';
import CtaBanner from '../../../components/CtaBanner';
import Footer from '../../../components/Footer';
import styles from '../../../assets/styles/AboutPage.module.css';

export const metadata = { title: 'About us — Sam Healthcare' };

/* ---------- content: edit everything here ---------- */

const STATS = [
  { icon: Stethoscope, value: '50+', label: 'Specialist doctors' },
  { icon: Users, value: '10+', label: 'Departments' },
  { icon: Clock, value: '24/7', label: 'Emergency care' },
  { icon: HeartPulse, value: '1', label: 'Connected patient record' },
];

const STORY_POINTS = [
  'General and specialist care under one roof',
  'A lab, pharmacy and operating theatre that share one patient record',
  'Online booking, a patient portal and a mobile app',
];

const VALUES = [
  { icon: HeartPulse, title: 'Patient-first care', text: 'Every decision starts with what is best for the person in front of us.' },
  { icon: ShieldCheck, title: 'Trusted expertise', text: 'Specialists across every department, held to the same standard of care.' },
  { icon: Users, title: 'A team that listens', text: 'From the front desk to the operating theatre, everyone is part of your care.' },
];

const TEAM = [
  { name: 'Dr. Priya Sharma', role: 'General Physician' },
  { name: 'Dr. Arjun Mehta', role: 'Cardiologist' },
  { name: 'Dr. Neha Verma', role: 'Dermatologist' },
  { name: 'Dr. Omar Siddiqui', role: 'Orthopedic Surgeon' },
];

// Placeholder milestones: replace the years and wording with your real history
const MILESTONES = [
  { year: '2015', title: 'Hospital opens', text: 'Sam Healthcare opens its doors with general medicine and emergency care.' },
  { year: '2018', title: 'Specialist departments', text: 'Cardiology, orthopedics and dermatology join the hospital.' },
  { year: '2022', title: 'Lab and pharmacy', text: 'An in-house laboratory and pharmacy connect to the patient record.' },
  { year: '2026', title: 'Digital care', text: 'Online booking, a patient portal and a mobile app go live.' },
];

const initials = (name) => name.replace('Dr. ', '').split(' ').map((p) => p[0]).join('').slice(0, 2);

export default function AboutPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          {/* <span className={styles.eyebrow}>About us</span> */}
          <h1 className={styles.heroTitle}>
            Care that feels <span className={styles.accent}>personal</span>, even at scale
          </h1>
          <p className={styles.heroSubtitle}>
            Sam Healthcare Hospital brings specialist doctors, modern facilities and simple digital tools together, so getting the right care is easier.
          </p>
        </div>
      </section>

      <section className={`container ${styles.statsWrap}`}>
        <div className={styles.statsStrip}>
          {STATS.map((s) => (
            <div key={s.label} className={styles.stat}>
              <span className={styles.statIcon}><s.icon size={20} strokeWidth={2} /></span>
              <div>
                <p className={styles.statValue}>{s.value}</p>
                <p className={styles.statLabel}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={`container ${styles.section}`}>
        <div className={styles.storyGrid}>
          <div className={styles.storyImageWrap}>
            <Image
              src="/images/hospital-2.jpg"
              alt="Sam Healthcare Hospital building"
              width={640}
              height={480}
              className={styles.storyImage}
            />
          </div>
          <div>
            <span className={styles.sectionTag}>Our story</span>
            <h2 className={styles.sectionTitle}>
              Built around the <span className={styles.accent}>patient</span>
            </h2>
            <p className={styles.storyText}>
              We started with a simple idea: shorten the distance between a patient and the right doctor. Today our teams in cardiology, dermatology, orthopedics, pediatrics and more work from the same patient record, supported by an in-house lab, pharmacy and operating theatre.
            </p>
            <ul className={styles.checkList}>
              {STORY_POINTS.map((p) => (
                <li key={p}>
                  <span className={styles.checkIcon}><Check size={13} strokeWidth={3} /></span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className={`container ${styles.section}`}>
        <div className={styles.mvGrid}>
          <div className={styles.mvCard}>
            <span className={styles.mvIcon}><Target size={22} strokeWidth={2} /></span>
            <h3 className={styles.mvTitle}>Our mission</h3>
            <p className={styles.mvText}>
              To deliver safe, compassionate and affordable healthcare, and to make every visit clear and stress-free for patients and their families.
            </p>
          </div>
          <div className={styles.mvCard}>
            <span className={styles.mvIcon}><Eye size={22} strokeWidth={2} /></span>
            <h3 className={styles.mvTitle}>Our vision</h3>
            <p className={styles.mvText}>
              To be the hospital our community trusts first, known for skilled doctors, honest communication and care that follows the patient.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.valuesBand}>
        <div className={`container ${styles.section}`}>
          <div className={styles.centerHead}>
            <span className={styles.sectionTag}>What we stand for</span>
            <h2 className={styles.sectionTitle}>Our <span className={styles.accent}>values</span></h2>
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
        </div>
      </section>

      <section className={`container ${styles.section}`}>
        <div className={styles.centerHead}>
          <span className={styles.sectionTag}>Our doctors</span>
          <h2 className={styles.sectionTitle}>Meet the <span className={styles.accent}>team</span></h2>
        </div>
        <div className={styles.teamGrid}>
          {TEAM.map((d) => (
            <div key={d.name} className={styles.teamCard}>
              <span className={styles.teamAvatar}>{initials(d.name)}</span>
              <h3 className={styles.teamName}>{d.name}</h3>
              <p className={styles.teamRole}>{d.role}</p>
            </div>
          ))}
        </div>
        <div className={styles.centerAction}>
          <Link href="/doctors" className={styles.outlineBtn}>
            View all doctors <ArrowRight size={15} strokeWidth={2.25} />
          </Link>
        </div>
      </section>

      <section className={`container ${styles.timelineSection}`}>
        <div className={styles.centerHead}>
          <span className={styles.sectionTag}>Our journey</span>
          <h2 className={styles.sectionTitle}>How we <span className={styles.accent}>grew</span></h2>
        </div>
        <div className={styles.timeline}>
          {MILESTONES.map((m) => (
            <div key={m.year} className={styles.milestone}>
              <span className={styles.milestoneYear}>{m.year}</span>
              <h3 className={styles.milestoneTitle}>{m.title}</h3>
              <p className={styles.milestoneText}>{m.text}</p>
            </div>
          ))}
        </div>
      </section>

      <CtaBanner />
      <Footer />
    </>
  );
}