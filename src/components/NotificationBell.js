'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, CalendarClock, Mail } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { titleCase, fmtTime, prettyDate } from '../lib/appointmentUtils';
import { timeAgo } from '../lib/adminUtils';
import styles from '../assets/styles/NotificationBell.module.css';

function roleFor(pathname) {
  if (pathname.startsWith('/dashboard/admin')) return 'admin';
  if (pathname.startsWith('/dashboard/doctor')) return 'doctor';
  return 'other';
}

export default function NotificationBell() {
  const pathname = usePathname() || '';
  const role = roleFor(pathname);
  const storageKey = `sam_notif_seen_${role}`;

  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);
  const [highlightFrom, setHighlightFrom] = useState(null);
  const wrapRef = useRef(null);

  // remember when notifications were last opened (read after mount to avoid hydration mismatch)
  useEffect(() => {
    let value = 0;
    try { value = Number(localStorage.getItem(storageKey)) || 0; } catch { /* storage unavailable */ }
    setLastSeen(value);
  }, [storageKey]);

  const load = useCallback(async () => {
    if (role === 'other') { setItems([]); return; }

    const since = new Date(Date.now() - 7 * 86400000).toISOString();
    const [a, m] = await Promise.all([
      supabase
        .from('appointments')
        .select('id, patient_name, department, doctor_name, appointment_date, appointment_time, status, created_at')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(15),
      role === 'admin'
        ? supabase
            .from('contact_messages')
            .select('id, name, subject, status, created_at')
            .gte('created_at', since)
            .order('created_at', { ascending: false })
            .limit(10)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const bookingHref = role === 'admin' ? '/dashboard/admin/appointments' : '/dashboard/doctor/schedule';
    const list = [];

    if (!a.error) {
      (a.data || [])
        .filter((x) => x.status !== 'Cancelled')
        .forEach((x) =>
          list.push({
            id: `a${x.id}`,
            kind: 'booking',
            at: x.created_at,
            href: bookingHref,
            title: `New booking: ${x.patient_name}`,
            sub: `${titleCase(x.department)} · ${prettyDate(x.appointment_date, { day: 'numeric', month: 'short' })} · ${fmtTime(x.appointment_time)}${role === 'admin' && x.doctor_name ? ` · ${x.doctor_name}` : ''}`,
          })
        );
    }

    if (!m.error) {
      (m.data || []).forEach((x) =>
        list.push({
          id: `m${x.id}`,
          kind: 'message',
          at: x.created_at,
          href: '/dashboard/admin/messages',
          title: `Message from ${x.name}`,
          sub: x.subject,
        })
      );
    }

    list.sort((x, y) => new Date(y.at) - new Date(x.at));
    setItems(list.slice(0, 12));
  }, [role]);

  // load now, then refresh live (realtime) and every minute as a fallback
  useEffect(() => {
    load();
    if (role === 'other') return undefined;

    let channel = supabase
      .channel(`notif-${role}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'appointments' }, load);
    if (role === 'admin') {
      channel = channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'contact_messages' }, load);
    }
    channel.subscribe();

    const timer = setInterval(load, 60000);
    const onVisible = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
      supabase.removeChannel(channel);
    };
  }, [load, role]);

  // close on outside click or Escape
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const unread = lastSeen === null ? 0 : items.filter((i) => new Date(i.at).getTime() > lastSeen).length;

  function toggle() {
    if (!open) {
      setHighlightFrom(lastSeen);
      const now = Date.now();
      setLastSeen(now);
      try { localStorage.setItem(storageKey, String(now)); } catch { /* storage unavailable */ }
    } else {
      setHighlightFrom(null);
    }
    setOpen((v) => !v);
  }

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        className={styles.bellBtn}
        onClick={toggle}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-expanded={open}
      >
        <Bell size={20} strokeWidth={2} />
        {unread > 0 && <span className={styles.badge}>{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <h3 className={styles.panelTitle}>Notifications</h3>
            <span className={styles.panelSub}>Last 7 days</span>
          </div>

          {items.length === 0 ? (
            <p className={styles.empty}>
              {role === 'other' ? 'No notifications for this account yet.' : "You're all caught up."}
            </p>
          ) : (
            <ul className={styles.list}>
              {items.map((n) => {
                const Icon = n.kind === 'booking' ? CalendarClock : Mail;
                const fresh = highlightFrom !== null && new Date(n.at).getTime() > highlightFrom;
                return (
                  <li key={n.id}>
                    <Link
                      href={n.href}
                      className={`${styles.item} ${fresh ? styles.itemFresh : ''}`}
                      onClick={() => { setOpen(false); setHighlightFrom(null); }}
                    >
                      <span className={styles.itemIcon}><Icon size={16} strokeWidth={2} /></span>
                      <span className={styles.itemBody}>
                        <span className={styles.itemTitle}>{n.title}</span>
                        <span className={styles.itemSub}>{n.sub}</span>
                        <span className={styles.itemTime}>{timeAgo(n.at)}</span>
                      </span>
                      {fresh && <span className={styles.dot} />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}