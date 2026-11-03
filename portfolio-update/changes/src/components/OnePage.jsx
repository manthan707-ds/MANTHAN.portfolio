import { useEffect, useRef, useState } from 'react';
import { scrollToId } from '../lib/utils';
import './onePage.css';

/**
 * Makes the whole site feel like ONE continuous page.
 *  1. SEAMS    - where two pages meet, both edges dissolve into the shared background
 *                (strongest while the boundary crosses the screen, gone when a page is at rest).
 *  2. AMBIENT  - (off by default) one glow + faint dot texture floating above every page.
 *  3. RAIL     - (off by default) a thin progress line on the right with a dot per page.
 * With both off, the only thing this does is the soft fade at the boundary between two pages,
 * and that fade is fully gone whenever a page is resting on screen. No page's own code or look changes.
 */
const SEAMS = [
  { id: 'about', mode: 'out' },                 // 'out' also melts the hero's bottom into About
  { id: 'tech-stack' },
  { id: 'work' },
  { id: 'contact', last: true },               // last page: no bottom seam
];
const RAIL = [
  { id: 'hero', label: 'Home' }, { id: 'about', label: 'About' }, { id: 'tech-stack', label: 'Tech Stack' },
  { id: 'work', label: 'Work' }, { id: 'contact', label: 'Contact' },
];
// Both are OFF so no other page is touched. Set true only if you want them.
const SHOW_AMBIENT = false;   // faint glow + dots floating over every page
const SHOW_RAIL = false;      // progress line on the right edge

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const bump = (u) => (u > 0 && u < 1 ? Math.sin(Math.PI * u) : 0);

export default function OnePage({ hidden = false }) {
  const glowRef = useRef(null);
  const fillRef = useRef(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const seams = SEAMS.map((s) => {
      const el = document.getElementById(s.id);
      if (el) el.dataset.seam = s.mode || 'in';
      return { ...s, el };
    });
    let raf = 0;
    let lastActive = -1;

    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const y = window.scrollY;
      const max = Math.max(1, document.documentElement.scrollHeight - vh);

      // 1. seams
      seams.forEach((s) => {
        if (!s.el) return;
        const r = s.el.getBoundingClientRect();
        const t = bump(1 - r.top / vh);
        const b = s.last ? 0 : bump(r.bottom / vh);
        s.el.style.setProperty('--seam-t', t.toFixed(3));
        s.el.style.setProperty('--seam-b', b.toFixed(3));
      });

      // 2. ambient glow drifts diagonally with total scroll progress
      const p = y / max;
      if (glowRef.current && !reduce) {
        const x = (0.5 + Math.sin(p * Math.PI * 2) * 0.32) * window.innerWidth;
        const gy = (0.15 + p * 0.7) * vh;
        glowRef.current.style.transform = `translate3d(${x}px, ${gy}px, 0) translate(-50%, -50%)`;
      }

      // 3. rail: fill follows position inside the current page
      const mid = y + vh / 2;
      let idx = 0; let local = 0;
      RAIL.forEach((r, i) => {
        const el = document.getElementById(r.id);
        if (!el) return;
        const top = el.getBoundingClientRect().top + y;
        if (mid >= top) { idx = i; local = clamp((mid - top) / Math.max(1, el.offsetHeight), 0, 1); }
      });
      const pos = idx >= RAIL.length - 1 ? 1 : (idx + local) / (RAIL.length - 1);
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${pos.toFixed(4)})`;
      if (idx !== lastActive) { lastActive = idx; setActive(idx); }
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };

    update();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    document.fonts?.ready.then(on);
    const late = setTimeout(on, 1200); // layout settles after the preloader
    return () => {
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
      clearTimeout(late);
      cancelAnimationFrame(raf);
      seams.forEach((s) => { if (s.el) { delete s.el.dataset.seam; s.el.style.removeProperty('--seam-t'); s.el.style.removeProperty('--seam-b'); } });
    };
  }, []);

  return (
    <>
      {SHOW_AMBIENT && (
        <div className="one-ambient" aria-hidden="true">
          <div className="one-dots" />
          <div className="one-glow" ref={glowRef} />
        </div>
      )}

      {SHOW_RAIL && (
        <nav className={`one-rail${hidden ? ' is-hidden' : ''}`} aria-label="Page progress">
          <div className="one-track"><i ref={fillRef} /></div>
          {RAIL.map((r, i) => (
            <button
              key={r.id}
              type="button"
              className={`one-dot${i === active ? ' on' : ''}${i < active ? ' past' : ''}`}
              style={{ top: `${(i / (RAIL.length - 1)) * 100}%` }}
              onClick={() => scrollToId(r.id)}
              aria-label={`Go to ${r.label}`}
              aria-current={i === active ? 'true' : undefined}
            >
              <span>{r.label}</span>
            </button>
          ))}
        </nav>
      )}
    </>
  );
}
