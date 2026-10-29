'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  LogOut, LayoutDashboard, CalendarClock, FlaskConical, Pill, Users, Wallet, HelpCircle,
  ClipboardList, Building2, Activity, Receipt, ShieldCheck, HeartPulse,
  ClipboardCheck, PackageSearch, DoorOpen, Mail,
} from 'lucide-react';
import styles from '../assets/styles/DashboardShell.module.css';
import NotificationBell from './NotificationBell';
import { signOut } from '../lib/auth';
import { supabase } from '../lib/supabaseClient';

const ICONS = {
  LayoutDashboard, CalendarClock, FlaskConical, Pill, Users, Wallet, ClipboardList, Building2,
  Activity, Receipt, ShieldCheck, HeartPulse, ClipboardCheck, PackageSearch, DoorOpen, Mail,
};

function makeInitials(name) {
  return (name || '')
    .replace(/^(dr\.?|mr\.?|mrs\.?|ms\.?)\s+/i, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function DashboardShell({ roleLabel, navItems, userName, userInitials, children }) {
  const pathname = usePathname();
  const [me, setMe] = useState(null);

  // show the signed-in person's real name instead of the placeholder from the layout
  useEffect(() => {
    let active = true;

    async function loadMe() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', session.user.id)
        .maybeSingle();

      const name = profile?.full_name || session.user.user_metadata?.full_name || session.user.email || '';
      if (active && name) setMe({ name });
    }

    loadMe();

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' && active) setMe(null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const shownName = me?.name || userName;
  const shownInitials = me ? makeInitials(me.name) : userInitials;

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <Image src="/images/white-logo.png" alt="Sam Healthcare" width={32} height={32} />
          <span className={styles.roleLabel}>{roleLabel}</span>
        </div>

        <div className={styles.topbarRight}>
          <NotificationBell />
          <div className={styles.userChip}>
            <span className={styles.avatar}>{shownInitials}</span>
            <span className={styles.userName}>{shownName}</span>
          </div>
          <button type="button" className={styles.logoutBtn} aria-label="Log out" onClick={signOut}>
            <LogOut size={17} strokeWidth={2} />
          </button>
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