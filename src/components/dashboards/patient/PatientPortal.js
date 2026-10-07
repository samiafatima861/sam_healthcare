import {
  CalendarClock,
  FlaskConical,
  Wallet,
  Download,
  ChevronRight,
  CalendarPlus,
  ArrowRight,
  ClipboardList,
} from 'lucide-react';
import Link from 'next/link';
import styles from '../../../assets/styles/PatientPortal.module.css';

const VISITS = [
  { doctor: 'Dr. Priya Sharma', specialty: 'General Physician', date: 'Today, 4:40 PM', status: 'Upcoming' },
  { doctor: 'Dr. Arjun Mehta', specialty: 'Cardiologist', date: '12 Sep 2026', status: 'Completed' },
  { doctor: 'Dr. Neha Verma', specialty: 'Dermatologist', date: '2 Aug 2026', status: 'Completed' },
];

const LAB_REPORTS = [
  { name: 'Complete Blood Count', date: '12 Sep 2026', status: 'Ready' },
  { name: 'Lipid Profile', date: '12 Sep 2026', status: 'Ready' },
  { name: 'Thyroid Panel', date: '20 Sep 2026', status: 'Pending' },
];

const HISTORY = [
  { title: 'Hypertension', detail: 'Diagnosed 2021 · On medication', type: 'Condition' },
  { title: 'Penicillin allergy', detail: 'Reaction: skin rash', type: 'Allergy' },
  { title: 'Appendectomy', detail: 'March 2018', type: 'Surgery' },
];

const HISTORY_PILL = {
  Condition: 'pillWarn',
  Allergy: 'pillDanger',
  Surgery: 'pillUpcoming',
};

export default function PatientPortal() {
  return (
    <div className={styles.wrap}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Welcome back, Ahsan</h1>
          <p className={styles.subtitle}>Here's what's happening with your care.</p>
        </div>
        <Link href="/book" className={styles.bookBtn}>
          <CalendarPlus size={16} strokeWidth={2.25} />
          Book appointment
        </Link>
      </div>

      <div className={styles.statRow}>
        <div className={`${styles.statCard} ${styles.accentBlue}`}>
          <span className={styles.statIcon}><CalendarClock size={20} strokeWidth={2} /></span>
          <div>
            <p className={styles.statLabel}>Next appointment</p>
            <p className={styles.statValue}>Today, 4:40 PM</p>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.accentTeal}`}>
          <span className={styles.statIcon}><FlaskConical size={20} strokeWidth={2} /></span>
          <div>
            <p className={styles.statLabel}>Lab reports ready</p>
            <p className={styles.statValue}>2 <span className={styles.statMuted}>of 3</span></p>
          </div>
        </div>

        <div className={styles.statCardBilling}>
          <div className={styles.statCardBillingTop}>
            <span className={styles.statIconBilling}><Wallet size={20} strokeWidth={2} /></span>
            <div>
              <p className={styles.statLabelBilling}>Outstanding balance</p>
              <p className={styles.statValueBilling}>Rs 1,240</p>
            </div>
          </div>
          <Link href="/portal/billing" className={styles.statPayLink}>
            Pay now <ArrowRight size={13} strokeWidth={2.5} />
          </Link>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.mainCol}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Visit timeline</h2>
              <Link href="/portal/appointments" className={styles.viewAll}>
                View all <ChevronRight size={14} strokeWidth={2.5} />
              </Link>
            </div>
            <div className={styles.list}>
              {VISITS.map((v) => (
                <div key={v.doctor + v.date} className={styles.visitRow}>
                  <span className={styles.visitAvatar}>{v.doctor.split(' ')[2]?.[0] || v.doctor[4]}</span>
                  <div className={styles.visitInfo}>
                    <p className={styles.visitDoctor}>{v.doctor}</p>
                    <p className={styles.visitSpecialty}>{v.specialty}</p>
                  </div>
                  <div className={styles.visitRight}>
                    <p className={styles.visitDate}>{v.date}</p>
                    <span className={`${styles.pill} ${v.status === 'Upcoming' ? styles.pillUpcoming : styles.pillDone}`}>
                      {v.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Lab reports</h2>
              <Link href="/portal/lab-reports" className={styles.viewAll}>
                View all <ChevronRight size={14} strokeWidth={2.5} />
              </Link>
            </div>
            <div className={styles.list}>
              {LAB_REPORTS.map((r) => (
                <div key={r.name} className={styles.reportRow}>
                  <div className={styles.reportIconWrap}>
                    <FlaskConical size={16} strokeWidth={2} />
                  </div>
                  <div className={styles.reportInfo}>
                    <p className={styles.reportName}>{r.name}</p>
                    <p className={styles.reportDate}>{r.date}</p>
                  </div>
                  {r.status === 'Ready' ? (
                    <Link href="/portal/lab-reports" className={styles.downloadBtn}>
                      <Download size={14} strokeWidth={2} />
                      Download
                    </Link>
                  ) : (
                    <span className={`${styles.pill} ${styles.pillWarn}`}>Pending</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.sideCol}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Patient history</h2>
              <Link href="/portal/history" className={styles.viewAll}>
                View all <ChevronRight size={14} strokeWidth={2.5} />
              </Link>
            </div>
            <div className={styles.historyList}>
              {HISTORY.map((h) => (
                <div key={h.title} className={styles.historyRow}>
                  <span className={styles.historyIcon}>
                    <ClipboardList size={16} strokeWidth={2} />
                  </span>
                  <div className={styles.historyInfo}>
                    <p className={styles.historyTitle}>{h.title}</p>
                    <p className={styles.historyDetail}>{h.detail}</p>
                  </div>
                  <span className={`${styles.pill} ${styles[HISTORY_PILL[h.type]]}`}>{h.type}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Information</h2>
            </div>
            <div className={styles.infoList}>
              <div className={styles.infoRow}>
                <span className={styles.infoKey}>Gender</span>
                <span className={styles.infoVal}>Male</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoKey}>Blood type</span>
                <span className={styles.infoVal}>O+ (Positive)</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoKey}>Allergies</span>
                <span className={styles.infoVal}>Milk, Penicillin</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoKey}>Diseases</span>
                <span className={styles.infoVal}>Diabetes, Hypertension</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoKey}>Height</span>
                <span className={styles.infoVal}>175 cm</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoKey}>Weight</span>
                <span className={styles.infoVal}>72 kg</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoKey}>Patient ID</span>
                <span className={styles.infoVal}>208898786</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoKey}>Last visit</span>
                <span className={styles.infoVal}>12 Sep 2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}