import { useEffect, useRef } from 'react';
import { isFinePointer } from '../lib/utils';

// Pulls an element slightly toward the cursor. Desktop pointers only.
export function useMagnetic(strength = 0.3) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !isFinePointer()) return undefined;
    let timer;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      el.style.transition = '';
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * strength}px, ${(e.clientY - r.top - r.height / 2) * strength}px)`;
    };
    const leave = () => {
      el.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1), background .35s, color .35s, border-color .35s';
      el.style.transform = '';
      timer = setTimeout(() => { el.style.transition = ''; }, 520);
    };
    el.addEventListener('mousemove', move);
    el.addEventListener('mouseleave', leave);
    return () => { el.removeEventListener('mousemove', move); el.removeEventListener('mouseleave', leave); clearTimeout(timer); };
  }, [strength]);
  return ref;
}
