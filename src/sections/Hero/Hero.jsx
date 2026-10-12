import { useEffect, useRef } from 'react';
import { profile } from '../../data/profile';
import { decodeText, scrollToId } from '../../lib/utils';
import { useMagnetic } from '../../hooks/useMagnetic';
import TypedText from '../../components/TypedText';
import './hero.css';

function Button({ href, variant, children, arrow }) {
  const ref = useMagnetic(0.3);
  return (
    <a
      ref={ref}
      className={`btn btn-${variant}`}
      href={href}
      onClick={(e) => { e.preventDefault(); scrollToId(href.replace('#', '')); }}
    >
      <span>{children}</span>
      {arrow && (
        <svg viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M4 9H14M14 9L9 4M14 9L9 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </a>
  );
}

export default function Hero({ loaded }) {
  const leadRef = useRef(null);
  const roleRef = useRef(null);

  useEffect(() => {
    if (!loaded) return undefined;
    const stopA = decodeText(leadRef.current, 700);
    const stopB = decodeText(roleRef.current, 900);
    return () => { stopA(); stopB(); };
  }, [loaded]);

  return (
    <section id="hero" aria-label="Introduction">
      <div className="hero-label rv" style={{ '--d': 0 }}>
        <i />
        <span ref={roleRef} data-text={profile.roleLine}>{profile.roleLine}</span>
        <i />
      </div>

      <div className="hero-bottom">
        <div className="hero-left">
          <h1>
            <span className="sr-only">{profile.srTitle}</span>
            <span ref={leadRef} className="h1-line" data-text={profile.lead} aria-hidden="true">{profile.lead}</span>
            <TypedText phrases={profile.phrases} start={loaded} />
          </h1>
        </div>

        <div className="hero-right">
          <p className="hero-desc rv" style={{ '--d': 1 }}>{profile.tagline}</p>
          <div className="cta-row rv" style={{ '--d': 2 }}>
            <Button href={profile.cta.primary.href} variant="primary" arrow>{profile.cta.primary.label}</Button>
            <Button href={profile.cta.secondary.href} variant="ghost">{profile.cta.secondary.label}</Button>
          </div>
          <div className="scroll-hint rv" style={{ '--d': 3 }}><i />Scroll to explore</div>
        </div>
      </div>
    </section>
  );
}
