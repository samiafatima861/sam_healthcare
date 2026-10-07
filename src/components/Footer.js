import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import styles from '../assets/styles/Footer.module.css';

const SOCIAL_LINKS = [
  {
    label: 'Facebook',
    href: '#',
    path: 'M22 12a10 10 0 1 0-11.5 9.87v-6.98h-2.54V12h2.54V9.8c0-2.5 1.5-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.98A10 10 0 0 0 22 12',
  },
  {
    label: 'Instagram',
    href: '#',
    path: 'M12 2c2.72 0 3.06.01 4.12.06 1.06.05 1.79.22 2.43.47.66.25 1.21.6 1.76 1.15.5.5.9 1.1 1.15 1.76.25.64.42 1.37.47 2.43.05 1.06.06 1.4.06 4.13 0 2.72-.01 3.06-.06 4.12-.05 1.06-.22 1.79-.47 2.43a4.9 4.9 0 0 1-1.15 1.76 4.9 4.9 0 0 1-1.76 1.15c-.64.25-1.37.42-2.43.47-1.06.05-1.4.06-4.12.06-2.73 0-3.06-.01-4.13-.06-1.06-.05-1.79-.22-2.43-.47a4.9 4.9 0 0 1-1.76-1.15 4.9 4.9 0 0 1-1.15-1.76c-.25-.64-.42-1.37-.47-2.43C2.01 15.06 2 14.72 2 12c0-2.72.01-3.06.06-4.12.05-1.06.22-1.79.47-2.43.25-.66.6-1.21 1.15-1.76a4.9 4.9 0 0 1 1.76-1.15c.64-.25 1.37-.42 2.43-.47C8.94 2.01 9.28 2 12 2m0 1.8c-2.67 0-2.99.01-4.04.06-.97.05-1.5.2-1.85.34-.47.18-.8.4-1.15.75-.35.35-.57.68-.75 1.15-.14.35-.3.88-.34 1.85C3.81 9 3.8 9.33 3.8 12s.01 2.99.06 4.04c.05.97.2 1.5.34 1.85.18.47.4.8.75 1.15.35.35.68.57 1.15.75.35.14.88.3 1.85.34 1.05.05 1.37.06 4.04.06s2.99-.01 4.04-.06c.97-.05 1.5-.2 1.85-.34.47-.18.8-.4 1.15-.75.35-.35.57-.68.75-1.15.14-.35.3-.88.34-1.85.05-1.05.06-1.37.06-4.04s-.01-2.99-.06-4.04c-.05-.97-.2-1.5-.34-1.85a3.1 3.1 0 0 0-.75-1.15 3.1 3.1 0 0 0-1.15-.75c-.35-.14-.88-.3-1.85-.34C14.99 3.81 14.67 3.8 12 3.8m0 3.05a5.15 5.15 0 1 1 0 10.3 5.15 5.15 0 0 1 0-10.3m0 1.8a3.35 3.35 0 1 0 0 6.7 3.35 3.35 0 0 0 0-6.7m5.35-1.98a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0',
  },
  {
    label: 'Twitter',
    href: '#',
    path: 'M18.9 3h3.1l-6.77 7.74L23.3 21h-6.24l-4.89-6.39L6.56 21H3.46l7.24-8.28L2.7 3h6.4l4.42 5.84L18.9 3Zm-1.09 16.17h1.72L7.28 4.73H5.43l12.38 14.44Z',
  },
  {
    label: 'LinkedIn',
    href: '#',
    path: 'M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.83v1.64h.05c.53-1 1.85-2.05 3.8-2.05 4.07 0 4.82 2.68 4.82 6.16V21h-4v-5.6c0-1.34-.02-3.06-1.86-3.06-1.87 0-2.16 1.46-2.16 2.96V21h-4V9Z',
  },
];

const COLUMNS = [
  {
    heading: 'For patients',
    links: [
      { label: 'Book an appointment', href: '/book' },
      { label: 'Patient portal', href: '/portal' },
      { label: 'Find a doctor', href: '/doctors' },
      { label: 'Pay a bill', href: '/portal' },
    ],
  },
  {
    heading: 'Hospital',
    links: [
      { label: 'About us', href: '/about' },
      { label: 'Departments', href: '/departments' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy policy', href: '#' },
      { label: 'Terms of service', href: '#' },
      { label: 'Patient rights', href: '#' },
      { label: 'Accessibility', href: '#' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.top}`}>
        <div className={styles.brandCol}>
          <Link href="/" className={styles.logo}>
            <Image src="/images/white-logo.png" alt="Sam Healthcare Hospital" width={40} height={40} />
          </Link>
          {/* <p className={styles.tagline}>
            JCI-accredited care across 14 departments and 6 locations.
          </p> */}

          <ul className={styles.contactList}>
            <li>
              <Phone size={14} strokeWidth={2} />
              <a href="tel:+15551234000">(555) 123-4000</a>
            </li>
            <li>
              <Mail size={14} strokeWidth={2} />
              <a href="mailto:care@samhealthcare.com">care@samhealthcare.com</a>
            </li>
            <li>
              <MapPin size={14} strokeWidth={2} />
              <span>6 locations across the city</span>
            </li>
            <li>
              <Clock size={14} strokeWidth={2} />
              <span>OPD open 8am – 9pm, every day</span>
            </li>
          </ul>

          <div className={styles.social}>
            {SOCIAL_LINKS.map((s) => (
              <a key={s.label} href={s.href} aria-label={s.label}>
                 <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                    <path d={s.path} />
                 </svg>
             </a>
            ))}
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.heading} className={styles.linkCol}>
            <p className={styles.colHeading}>{col.heading}</p>
            <ul>
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className={`container ${styles.bottom}`}>
        <p>&copy; {new Date().getFullYear()} Sam Healthcare Hospital. All rights reserved.</p>
        <p className={styles.emergency}>Emergency: (555) 123-4000</p>
      </div>
    </footer>
  );
}