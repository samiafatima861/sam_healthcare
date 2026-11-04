'use client';

import { useEffect, useState } from 'react';

// "New" means booked after the last time this person left the page. Remembered per browser.
export function useNewSince(key) {
  const storageKey = `sam_seen_${key}`;
  const [since, setSince] = useState(null);

  useEffect(() => {
    let value = Date.now() - 24 * 60 * 60 * 1000; // first visit: treat the last 24 hours as new
    try {
      const stored = Number(localStorage.getItem(storageKey));
      if (stored) value = stored;
    } catch { /* storage unavailable */ }
    setSince(value);

    const mountedAt = Date.now();
    const markSeen = () => {
      // ignore the instant mount/unmount that development mode does
      if (Date.now() - mountedAt < 3000) return;
      try { localStorage.setItem(storageKey, String(Date.now())); } catch { /* storage unavailable */ }
    };

    window.addEventListener('pagehide', markSeen);
    return () => {
      markSeen();
      window.removeEventListener('pagehide', markSeen);
    };
  }, [storageKey]);

  function markAllSeen() {
    const now = Date.now();
    try { localStorage.setItem(storageKey, String(now)); } catch { /* storage unavailable */ }
    setSince(now);
  }

  const isNew = (row) => since !== null && !!row.created_at && new Date(row.created_at).getTime() > since;

  return { isNew, markAllSeen };
}