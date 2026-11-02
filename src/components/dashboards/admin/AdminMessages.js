'use client';

import { useEffect, useState } from 'react';
import { Mail, Trash2, Check, ChevronDown } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { norm, timeAgo } from '../../../lib/adminUtils';
import AdminModal from './AdminModal';
import styles from '../../../assets/styles/AdminDashboard.module.css';
import SearchInput from '../../SearchInput';

const TABS = ['All', 'New', 'Read', 'Resolved'];
const STATUS_CHIP = { New: styles.chipNew, Read: styles.chipRead, Resolved: styles.chipResolved };

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [tab, setTab] = useState('All');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  function flash(type, text) {
    setNotice({ type, text });
    if (type === 'ok') setTimeout(() => setNotice(null), 3000);
  }

  useEffect(() => {
    supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setLocked(true);
        else setMessages(data || []);
        setLoading(false);
      });
  }, []);

  async function setStatus(m, status) {
    const { data, error } = await supabase.from('contact_messages').update({ status }).eq('id', m.id).select();
    if (error || !data || data.length === 0) {
      flash('error', 'Could not update this message. Make sure you are signed in as admin.');
      return false;
    }
    setMessages((list) => list.map((x) => (x.id === m.id ? { ...x, status } : x)));
    return true;
  }

  async function toggle(m) {
    const opening = openId !== m.id;
    setOpenId(opening ? m.id : null);
    if (opening && m.status === 'New') await setStatus(m, 'Read');
  }

  async function confirmDelete() {
    setBusy(true);
    const { data, error } = await supabase.from('contact_messages').delete().eq('id', deleting.id).select();
    setBusy(false);
    if (error || !data || data.length === 0) {
      flash('error', 'Could not delete this message. Make sure you are signed in as admin.');
      setDeleting(null);
      return;
    }
    setMessages((list) => list.filter((x) => x.id !== deleting.id));
    flash('ok', 'Message deleted.');
    setDeleting(null);
  }

  const countFor = (s) => (s === 'All' ? messages.length : messages.filter((m) => m.status === s).length);
  const q = norm(query);
  const shown = messages.filter(
    (m) =>
      (tab === 'All' || m.status === tab) &&
      (!q || [m.name, m.email, m.subject, m.message].some((x) => norm(x).includes(q)))
  );

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Messages</h1>
          <p className={styles.subtitle}>
            {loading ? 'Loading messages...' : 'Messages sent through the Contact page. Reply by email, then mark them resolved.'}
          </p>
        </div>
      </div>

      {locked && (
        <p className={`${styles.notice} ${styles.noticeInfo}`}>
          Messages could not be loaded. Make sure you are signed in as an admin, then refresh.
        </p>
      )}
      {notice && (
        <p className={`${styles.notice} ${notice.type === 'ok' ? styles.noticeOk : styles.noticeError}`}>{notice.text}</p>
      )}

      <div className={styles.toolbar}>
        <div className={styles.tabs}>
          {TABS.map((t) => (
            <button
              key={t} type="button"
              className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
              onClick={() => setTab(t)}
            >
              {t}
              <span className={styles.tabCount}>{countFor(t)}</span>
            </button>
          ))}
        </div>

        <SearchInput width={260} label="Search staff" placeholder="Search name, role or email" value={query} onChange={setQuery} />
      </div>

      {shown.length === 0 ? (
        <div className={styles.tablePanel}>
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>{loading ? 'Loading...' : 'No messages found'}</p>
            {!loading && !locked && (
              <p className={styles.emptyText}>
                {messages.length === 0 ? 'Messages from the Contact page will appear here.' : 'Try another filter or clear the search.'}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.msgList}>
          {shown.map((m) => {
            const open = openId === m.id;
            return (
              <article key={m.id} className={`${styles.msgItem} ${m.status === 'New' ? styles.msgItemNew : ''}`}>
                <button type="button" className={styles.msgHead} onClick={() => toggle(m)} aria-expanded={open}>
                  <div className={styles.msgMain}>
                    <div className={styles.msgTop}>
                      <span className={styles.msgName}>{m.name}</span>
                      <span className={styles.msgSubject}>{m.subject}</span>
                      <span className={`${styles.chip} ${STATUS_CHIP[m.status] || styles.chipRead}`}>{m.status}</span>
                    </div>
                    {!open && <p className={styles.msgPreview}>{m.message}</p>}
                  </div>
                  <span className={styles.msgTime}>{timeAgo(m.created_at)}</span>
                  <ChevronDown
                    size={16} strokeWidth={2.25}
                    style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }}
                  />
                </button>

                {open && (
                  <div className={styles.msgBody}>
                    <p className={styles.msgText}>{m.message}</p>
                    <div className={styles.msgMeta}>
                      <span>Email: <strong>{m.email}</strong></span>
                      {m.phone && <span>Phone: <strong>{m.phone}</strong></span>}
                    </div>
                    <div className={styles.msgActions}>
                      <a
                        href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`}
                        className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
                      >
                        <Mail size={14} strokeWidth={2.25} /> Reply
                      </a>
                      {m.status !== 'Resolved' ? (
                        <button type="button" className={`${styles.btn} ${styles.btnSm}`} onClick={() => setStatus(m, 'Resolved')}>
                          <Check size={14} strokeWidth={2.5} /> Mark resolved
                        </button>
                      ) : (
                        <button type="button" className={`${styles.btn} ${styles.btnSm}`} onClick={() => setStatus(m, 'Read')}>
                          Reopen
                        </button>
                      )}
                      <button type="button" className={`${styles.btn} ${styles.btnSm}`} onClick={() => setDeleting(m)}>
                        <Trash2 size={14} strokeWidth={2.25} /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {deleting && (
        <AdminModal title="Delete this message?" onClose={() => setDeleting(null)}>
          <p className={styles.confirmText}>
            The message from <strong>{deleting.name}</strong> will be permanently deleted.
          </p>
          <div className={styles.modalActions}>
            <button type="button" className={styles.btn} onClick={() => setDeleting(null)}>Keep</button>
            <button type="button" className={`${styles.btn} ${styles.btnDanger}`} disabled={busy} onClick={confirmDelete}>
              {busy ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </AdminModal>
      )}
    </div>
  );
}