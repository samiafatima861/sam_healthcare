'use client';

import { Search, X } from 'lucide-react';
import { maskSearchText, maskPhone } from '../lib/masks';
import styles from '../assets/styles/SearchInput.module.css';

// mask: 'text' = clean text, 'phone' = phone format, 'smart' = phone format when only digits are typed, otherwise text
export default function SearchInput({
  value, onChange, placeholder = 'Search', label = 'Search',
  mask = 'text', max = 40, width, tall = false,
}) {
  function handle(e) {
    const raw = e.target.value;
    let next;
    if (mask === 'phone') next = maskPhone(raw);
    else if (mask === 'smart') next = /\p{L}/u.test(raw) || !/\d/.test(raw) ? maskSearchText(raw, max) : maskPhone(raw);
    else next = maskSearchText(raw, max);
    onChange(next);
  }

  return (
    <div className={`${styles.box} ${tall ? styles.tall : ''}`} style={width ? { width, maxWidth: '100%' } : undefined}>
      <Search size={tall ? 17 : 15} strokeWidth={2} className={styles.icon} />
      <input
        type="text"
        className={styles.input}
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={handle}
        maxLength={max}
        autoComplete="off"
        spellCheck={false}
      />
      {value && (
        <button type="button" className={styles.clear} onClick={() => onChange('')} aria-label="Clear search">
          <X size={13} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}