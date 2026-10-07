'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from '../assets/styles/Testimonials.module.css';

/*
  Images you need to add inside /public/images/testimonials/
    bg.jpg          -> any hospital / infographic background (CSS blurs it)
    doctor.png      -> doctor photo with a transparent background (PNG/WebP)
    patient1.jpg ... patient5.jpg -> patient photos (square, min 200x200)
  If a patient photo is missing, the initials are shown instead.
*/

const AUTOPLAY_MS = 4000; // time between slides (4 seconds)

const REVIEWS = [
  {
    quote:
      'Booked an appointment in under two minutes and got seen the same afternoon. The whole process felt effortless.',
    name: 'Riya S.',
    context: 'Cardiology patient',
    initials: 'RS',
    photo: '/images/testimonials/patient1.jpg',
  },
  {
    quote:
      'My lab results were ready in the portal before I even left the building. No more waiting for a phone call.',
    name: 'Ahsan M.',
    context: 'General checkup',
    initials: 'AM',
    photo: '/images/testimonials/patient2.jpg',
  },
  {
    quote:
      'The doctors actually take time to explain things. I never feel rushed, even on a busy day.',
    name: 'Fatima K.',
    context: 'Dermatology patient',
    initials: 'FK',
    photo: '/images/testimonials/patient3.jpg',
  },
  {
    // placeholder, replace with a real review
    quote:
      'The nurses were kind and attentive from check-in to discharge. My family felt looked after the whole time.',
    name: 'Usman T.',
    context: 'Orthopedics patient',
    initials: 'UT',
    photo: '/images/testimonials/patient4.jpg',
  },
  {
    // placeholder, replace with a real review
    quote:
      'Clear pricing, no surprises on the bill, and a follow-up call the next day. I would recommend them to anyone.',
    name: 'Ayesha R.',
    context: 'Maternity care',
    initials: 'AR',
    photo: '/images/testimonials/patient5.jpg',
  },
];

function Avatar({ review }) {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return <span className={styles.avatarFallback}>{review.initials}</span>;
  }

  return (
    <Image
      src={review.photo}
      alt={review.name}
      width={112}
      height={112}
      className={styles.avatarImg}
      onError={() => setBroken(true)}
    />
  );
}

export default function Testimonials() {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const touchStartX = useRef(null);

  const [index, setIndex] = useState(0);
  const [maxIndex, setMaxIndex] = useState(0);
  const [offset, setOffset] = useState(0);
  const [paused, setPaused] = useState(false);

  // Measure card step + how far the track can move, and keep it in sync on resize
  useEffect(() => {
    const vp = viewportRef.current;
    const tr = trackRef.current;
    if (!vp || !tr) return;

    const update = () => {
      const cards = tr.children;
      const step =
        cards.length > 1
          ? cards[1].offsetLeft - cards[0].offsetLeft
          : vp.clientWidth;
      const maxTranslate = Math.max(0, tr.scrollWidth - vp.clientWidth);
      const max = step ? Math.ceil(maxTranslate / step) : 0;

      setMaxIndex(max);
      setIndex((i) => Math.min(i, max));
      setOffset(Math.min(index * step, maxTranslate));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(vp);
    return () => ro.disconnect();
  }, [index]);

  const next = useCallback(
    () => setIndex((i) => (i >= maxIndex ? 0 : i + 1)),
    [maxIndex]
  );
  const prev = useCallback(
    () => setIndex((i) => (i <= 0 ? maxIndex : i - 1)),
    [maxIndex]
  );

  // Autoplay: pauses on hover / focus / touch, loops back to the start
  useEffect(() => {
    if (paused || maxIndex === 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const id = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused, maxIndex, next]);

  // Swipe support for touch screens
  const onTouchStart = (e) => {
    setPaused(true);
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    setPaused(false);
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
  };

  return (
    <section className={styles.section}>
      {/* Blurred background */}
      <div className={styles.bg} aria-hidden="true" />
      <div className={styles.bgOverlay} aria-hidden="true" />

      <div className={`container ${styles.inner}`}>
        {/* Doctor image (left) */}
        <div className={styles.doctorWrap} aria-hidden="true">
          <Image
            src="/images/testi-.jpg"
            alt=""
            width={560}
            height={720}
            className={styles.doctor}
          />
        </div>

        {/* Slider (right) */}
        <div className={styles.content}>
          <div className={styles.head}>
            <div>
              <span className={styles.eyebrow}>Patient stories</span>
              <h2 className={styles.title}>
                What our <span className={styles.titleAccent}>patients say</span>
              </h2>
            </div>

            <div className={styles.controls}>
              <button
                type="button"
                className={styles.navBtn}
                onClick={prev}
                aria-label="Previous testimonials"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                className={`${styles.navBtn} ${styles.navBtnPrimary}`}
                onClick={next}
                aria-label="Next testimonials"
              >
                <ChevronRight size={22} />
              </button>
            </div>
          </div>

          <div
            className={styles.panel}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div className={styles.viewport} ref={viewportRef}>
            <div
              className={styles.track}
              ref={trackRef}
              style={{ transform: `translateX(-${offset}px)` }}
              aria-label="Patient testimonials"
            >
              {REVIEWS.map((r) => (
                <article key={r.name} className={styles.card}>
                  <div className={styles.avatar}>
                    <Avatar review={r} />
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.stars} aria-label="5 out of 5 stars">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={18}
                          fill="var(--star, #f5a524)"
                          stroke="var(--star, #f5a524)"
                        />
                      ))}
                    </div>

                    <blockquote className={styles.quote}>
                      &ldquo;{r.quote}&rdquo;
                    </blockquote>

                    <div className={styles.footer}>
                      <div>
                        <p className={styles.authorName}>{r.name}</p>
                        <p className={styles.authorContext}>{r.context}</p>
                      </div>
                      <Quote
                        className={styles.quoteIcon}
                        size={44}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}