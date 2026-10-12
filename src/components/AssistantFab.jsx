import { useEffect, useState } from 'react';
import ContactAssistant from '../sections/Contact/ContactAssistant';
import './assistantFab.css';

// Floating "Ask my assistant" button, visible on every page.
// Click: the assistant opens full-screen on top of whatever page you are on. Esc or the cross closes it.
// It hides itself while the Contact page is on screen (the assistant is already there) and while a Work project is open.
export default function AssistantFab({ show = true }) {
  const [open, setOpen] = useState(false);
  const [onContact, setOnContact] = useState(false);

  useEffect(() => {
    const el = document.getElementById('contact');
    if (!el || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(([e]) => setOnContact(e.intersectionRatio > 0.5), { threshold: [0, 0.5, 1] });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.body.classList.toggle('locked', open);
    return () => document.body.classList.remove('locked');
  }, [open]);

  return (
    <>
      {show && !open && !onContact && (
        <button type="button" className="afab" onClick={() => setOpen(true)} aria-label="Open the AI assistant" aria-haspopup="dialog">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" />
            <path d="M18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" />
          </svg>
          <span>Ask my assistant</span>
        </button>
      )}
      {open && (
        <div className="afab-layer" role="dialog" aria-modal="true" aria-label="AI assistant">
          <ContactAssistant fullscreen startView="assistant" onClose={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}
