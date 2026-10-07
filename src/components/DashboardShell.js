'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {Bell, LogOut, LayoutDashboard, CalendarClock,FlaskConical, Pill, Users, Wallet, HelpCircle, ClipboardList, Building2, Activity, Receipt, ShieldCheck, HeartPulse,
  ClipboardCheck, PackageSearch, DoorOpen} from 'lucide-react';
import styles from '../assets/styles/DashboardShell.module.css';


const ICONS = { LayoutDashboard, CalendarClock, FlaskConical, Pill, Users, Wallet, ClipboardList, Building2, Activity, Receipt, ShieldCheck, HeartPulse,
  ClipboardCheck, PackageSearch, DoorOpen  };


export default function DashboardShell({ roleLabel, navItems, userName, userInitials, children }) {
  const pathname = usePathname();

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <Image src="/images/white-logo.png" alt="Sam Healthcare" width={32} height={32} />
          <span className={styles.roleLabel}>{roleLabel}</span>
        </div>

        <div className={styles.topbarRight}>
          <button type="button" className={styles.iconBtn} aria-label="Notifications">
            <Bell size={18} strokeWidth={2} />
          </button>
          <div className={styles.userChip}>
            <span className={styles.avatar}>{userInitials}</span>
            <span className={styles.userName}>{userName}</span>
          </div>
          <Link href="/" className={styles.logoutBtn} aria-label="Log out">
            <LogOut size={17} strokeWidth={2} />
          </Link>
        </div>
      </header>

      <div className={styles.body}>
        <nav className={styles.sidebar}>
          <p className={styles.sidebarLabel}>Menu</p>

          <div className={styles.navList}>
            {navItems.map((item) => {
              const Icon = ICONS[item.icon];
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
                >
                  <span className={styles.navIconWrap}>
                    {Icon && <Icon size={17} strokeWidth={2} />}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className={styles.helpCard}>
            <span className={styles.helpIcon}>
              <HelpCircle size={18} strokeWidth={2} />
            </span>
            <p className={styles.helpTitle}>Need help?</p>
            <p className={styles.helpText}>Reach our support team anytime.</p>
            <Link href="/contact" className={styles.helpBtn}>Contact support</Link>
          </div>
        </nav>

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}