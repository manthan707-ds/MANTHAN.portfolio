import { useEffect, useRef } from 'react';
import { isFinePointer } from '../lib/utils';

// Dot + trailing ring + a "SCROLL" pill while the hero is on screen. Desktop pointers only.
export default function Cursor({ heroSelector = '#hero' }) {
  const dot = useRef(null);
  const ring = useRef(null);
  const label = useRef(null);

  useEffect(() => {
    if (!isFinePointer()) return undefined;
    const root = document.documentElement;
    root.classList.add('cursor-on');

    const m = { x: window.innerWidth / 2, y: window.innerHeight / 2, seen: false };
    const c = { x: m.x, y: m.y, s: 1 };
    let over = false;
    let raf = 0;

    const onMove = (e) => { if (e.pointerType === 'touch') return; m.x = e.clientX; m.y = e.clientY; m.seen = true; };
    const onOver = (e) => {
      over = !!(e.target.closest && e.target.closest('a, button'));
      document.body.classList.toggle('hovering', over);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver);

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!m.seen) return;
      dot.current.style.transform = `translate3d(${m.x}px,${m.y}px,0)`;
      c.x += (m.x - c.x) * 0.2; c.y += (m.y - c.y) * 0.2;
      c.s += ((over ? 1.6 : 1) - c.s) * 0.2;
      ring.current.style.transform = `translate3d(${c.x}px,${c.y}px,0) scale(${c.s.toFixed(3)})`;
      label.current.style.transform = `translate3d(${m.x}px,${m.y}px,0) translate(-50%,-165%)`;
      const hero = document.querySelector(heroSelector);
      const inHero = hero && hero.getBoundingClientRect().bottom > window.innerHeight * 0.5 && !document.body.classList.contains('locked');
      label.current.classList.toggle('show', !!inHero && !over);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseover', onOver);
      root.classList.remove('cursor-on');
      document.body.classList.remove('hovering');
    };
  }, [heroSelector]);

  return (
    <>
      <div id="c-dot" ref={dot} aria-hidden="true" />
      <div id="c-ring" ref={ring} aria-hidden="true" />
      <div id="c-label" ref={label} aria-hidden="true">Scroll &darr;</div>
    </>
  );
}
