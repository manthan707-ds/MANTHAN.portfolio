import { useEffect, useRef, useState } from 'react';
import { profile } from '../data/profile';
import { clamp, prefersReducedMotion } from '../lib/utils';
import '../styles/preloader.css';

const TICKS = 32;
const STAGES = [[0, 'BOOTING'], [25, 'LOADING PROJECTS'], [55, 'COMPILING SHADERS'], [85, 'CALIBRATING LIGHT'], [100, 'SYSTEM READY']];
const LOGS = [
  [0,  'BOOT SEQUENCE', 'OK'],
  [30, 'PROJECTS', 'INDEXED'],
  [60, 'SCENE', 'COMPILED'],
  [92, 'PORTFOLIO', 'READY'],
];

// Counts 0 -> 100, then WAITS for the visitor to press ENTER.
// Clicking ENTER collapses the loader into a line and calls onExit() so the hero animation starts.
// (The click is also the first user gesture, so the site music is allowed to start right then.)
export default function Preloader({ onExit }) {
  const [pct, setPct] = useState(0);
  const [phase, setPhase] = useState('loading'); // loading | ready (waiting for ENTER) | exit | gone
  const btn = useRef(null);
  const timers = useRef([]);

  // count 0 -> 100
  useEffect(() => {
    const reduced = prefersReducedMotion();
    const dur = reduced ? 200 : 2600;
    const start = performance.now();
    let raf = 0;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      setPct(100);
      setPhase('ready'); // stops here: the ENTER button appears
    };

    const step = (now) => {
      const p = clamp((now - start) / dur, 0, 1);
      const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      setPct(Math.round(e * 100));
      if (p < 1) raf = requestAnimationFrame(step); else finish();
    };
    raf = requestAnimationFrame(step);
    const safety = setTimeout(finish, 9000); // if the counter ever stalls, still show ENTER

    return () => { cancelAnimationFrame(raf); clearTimeout(safety); };
  }, []);

  // keep the page still behind the loader; put keyboard focus on ENTER when it appears
  useEffect(() => {
    document.body.classList.add('locked');
    return () => { document.body.classList.remove('locked'); timers.current.forEach(clearTimeout); };
  }, []);
  useEffect(() => {
    if (phase === 'ready' && btn.current) btn.current.focus({ preventScroll: true });
  }, [phase]);

  const enter = () => {
    if (phase !== 'ready') return;
    const reduced = prefersReducedMotion();
    setPhase('exit');
    timers.current.push(setTimeout(() => {
      document.body.classList.remove('locked');
      if (onExit) onExit();
    }, reduced ? 0 : 750));
    timers.current.push(setTimeout(() => setPhase('gone'), reduced ? 100 : 1700));
  };

  if (phase === 'gone') return null;

  const lit = Math.round((pct / 100) * TICKS);
  const stage = STAGES.reduce((s, st) => (pct >= st[0] ? st[1] : s), STAGES[0][1]);

  return (
    <div id="preloader" className={phase === 'ready' ? 'ready' : phase === 'exit' ? 'ready exit' : ''} aria-hidden={phase === 'loading' ? 'true' : undefined}>
      <div className="pl-grid" />
      <div className="pl-scan" />
      <i className="pl-corner tl" /><i className="pl-corner tr" /><i className="pl-corner bl" /><i className="pl-corner br" />
      <div className="pl-meta tl">MG//OS <b>BUILD 2026.10</b></div>
      <div className="pl-meta tr">PORTFOLIO <b>V1</b></div>

      <div className="pl-core">
        <div className="pl-brand">{profile.shortName}</div>
        <div className="pl-count"><span className="pl-num">{String(pct).padStart(3, '0')}</span><em>%</em></div>
        <div className="pl-ticks">
          {Array.from({ length: TICKS }, (_, i) => (
            <i key={i} className={i < lit - 1 ? 'on' : i === lit - 1 ? 'lead' : ''} />
          ))}
        </div>
        <div className="pl-stage">{stage}</div>

        <div className="pl-enter-wrap">
          <button ref={btn} type="button" className="pl-enter" onClick={enter} tabIndex={phase === 'ready' ? 0 : -1}>
            <span>Enter</span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
          <div className="pl-hint">Best with sound on</div>
        </div>
      </div>

      <div className="pl-log">
        {LOGS.map(([at, label, status]) => (
          <div key={label} className={pct >= at ? 'in' : ''}>&gt; {label} <b>{status}</b></div>
        ))}
      </div>
      <div className="pl-flash" />
    </div>
  );
}
