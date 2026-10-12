import { useEffect, useState } from 'react';
import { profile } from '../data/profile';
import { scrollToId } from '../lib/utils';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [time, setTime] = useState('--:--');

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 50);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  useEffect(() => {
    const tick = () => {
      try {
        setTime(new Date().toLocaleTimeString('en-GB', { timeZone: profile.clock.timeZone, hour: '2-digit', minute: '2-digit' }));
      } catch { /* unknown time zone: keep placeholder */ }
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('locked', open);
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => { document.body.classList.remove('locked'); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const go = (href) => (e) => { e.preventDefault(); setOpen(false); scrollToId(href.replace('#', '')); };

  return (
    <>
      <nav className={`site-nav${scrolled ? ' scrolled' : ''}`}>
        <a className="brand rv-nav" href="#hero" onClick={go('#hero')}>{profile.name}</a>
        <div className="nav-right rv-nav">
          <div className="clock" aria-hidden="true"><b>{profile.clock.label}</b><span>{time}</span></div>
          <button
            className={`burger${open ? ' open' : ''}`}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <div id="menu" className={open ? 'open' : ''} role="dialog" aria-label="Site menu">
        {profile.nav.map((l) => (
          <a key={l.label} href={l.href} onClick={go(l.href)}>{l.label}</a>
        ))}
      </div>
    </>
  );
}
