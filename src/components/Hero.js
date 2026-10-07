
import styles from '../assets/styles/Hero.module.css';
import { ArrowRight, Headphones, ShieldCheck, Users } from 'lucide-react';

const AVATAR_STACK = [
  { initials: 'AR', tone: 'a' },
  { initials: 'ND', tone: 'b' },
  { initials: 'SK', tone: 'c' },
  { initials: 'MJ', tone: 'd' },
];

export default function Hero() {
  return (
    <section className={styles.hero} role="img" aria-label="Doctor speaking with a patient">
      <div className= {styles.inner}>
        <div className={styles.content}>
          <h1 className={`${styles.headline} ${styles.fadeIn1}`}>
            Healthcare
            <span className={styles.headlineAccent}>Wherever you are</span>
          </h1>

          <p className={`${styles.subtext} ${styles.fadeIn2}`}>
            Book by department, doctor, or symptom, and get a confirmed time
            slot in under a minute. Your records, prescriptions, and lab
            results stay in one place for every visit that follows.
          </p>

          <div className={`${styles.ctaRow} ${styles.fadeIn3}`}>
            <a href="/book" className={styles.primaryCta}>
              Book an appointment
              <ArrowRight size={17} strokeWidth={2.25} />
            </a>
            <a href="#departments" className={styles.secondaryCta}>
              Browse departments
            </a>
          </div>

          <div className={`${styles.avatarRow} ${styles.fadeIn4}`}>
            <div className={styles.avatarStack}>
              {AVATAR_STACK.map((doc) => (
                <span
                  key={doc.initials}
                  className={`${styles.avatar} ${styles[`tone${doc.tone}`]}`}
                >
                  {doc.initials}
                </span>
              ))}
              <span className={`${styles.avatar} ${styles.avatarMore}`}>+40</span>
            </div>
            <span className={styles.avatarLabel}>40+ specialists ready today</span>
          </div>

        </div>
        {/* <div className={styles.floatingCards}>
          <div className={styles.floatCard}>
            <span className={styles.floatIcon}>
              <Headphones size={18} strokeWidth={2} />
            </span>
            <div>
              <p className={styles.floatValue}>24/7</p>
              <p className={styles.floatLabel}>Emergency support</p>
            </div>
          </div>

          <div className={styles.floatCard}>
            <span className={styles.floatIcon}>
              <ShieldCheck size={18} strokeWidth={2} />
            </span>
            <div>
              <p className={styles.floatValue}>JCI</p>
              <p className={styles.floatLabel}>Accredited care</p>
            </div>
          </div>

          <div className={styles.floatCard}>
            <span className={styles.floatIcon}>
              <Users size={18} strokeWidth={2} />
            </span>
            <div>
              <p className={styles.floatValue}>120K+</p>
              <p className={styles.floatLabel}>Happy patients</p>
            </div>
          </div>
        </div> */}

      </div>
    </section>
  );
}