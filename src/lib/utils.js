export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isFinePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export const cssColor = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export function scrollToId(id) {
  const behavior = prefersReducedMotion() ? 'auto' : 'smooth';
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior });
  else if (id === 'hero') window.scrollTo({ top: 0, behavior });
}

// Scrambles an element's text into its final text. Returns a stop function.
export function decodeText(el, ms = 700) {
  if (!el) return () => {};
  const final = el.dataset.text || el.textContent;
  if (prefersReducedMotion()) { el.textContent = final; return () => {}; }
  const glyphs = '01X><-/\\*+~_#';
  const step = final.length / (ms / 30);
  let i = 0;
  const iv = setInterval(() => {
    let out = '';
    for (let k = 0; k < final.length; k++) {
      const c = final[k];
      out += c === ' ' || k < i ? c : glyphs[(Math.random() * glyphs.length) | 0];
    }
    el.textContent = out;
    if (i >= final.length) { clearInterval(iv); el.textContent = final; }
    i += step;
  }, 30);
  return () => { clearInterval(iv); el.textContent = final; };
}
