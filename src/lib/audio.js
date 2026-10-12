// Site-wide sound. One tiny engine, no dependencies.
//  - main.mp3        background loop for the whole site
//  - projects.mp3    loop that crossfades in over main while the Work section / a project panel is on screen
//  - transition.mp3  one-shot when the preloader hands off to the hero
// Browsers refuse sound until the visitor interacts with the page, so music starts on the first
// click / key / touch. A mute button (SoundToggle) lets the visitor switch everything off.
const BASE = import.meta.env.BASE_URL || '/';
const SRC = {
  main: `${BASE}audio/main.mp3`,
  projects: `${BASE}audio/projects.mp3`,
  transition: `${BASE}audio/transition.mp3`,
};
const VOL = { main: 0.35, projects: 0.4, transition: 0.7 }; // tweak loudness here
const FADE_MS = 1200;
const KEY = 'portfolio-sound';

const tracks = {};
const gain = { main: 0, projects: 0 }; // current fade level 0..1 per loop
let zone = 'main';
let muted = false;
let unlocked = false;
let raf = 0;
const listeners = new Set();

try { muted = localStorage.getItem(KEY) === 'off'; } catch { /* storage blocked */ }

function get(name) {
  if (typeof Audio === 'undefined') return null;
  if (!tracks[name]) {
    const a = new Audio(SRC[name]);
    a.preload = 'auto';
    a.loop = name === 'main' || name === 'projects';
    tracks[name] = a;
  }
  return tracks[name];
}

function apply() {
  ['main', 'projects'].forEach((n) => {
    const a = get(n);
    if (!a) return;
    a.volume = muted ? 0 : Math.max(0, Math.min(1, VOL[n] * gain[n]));
  });
}

function loop() {
  raf = 0;
  let moving = false;
  const step = 16 / FADE_MS;
  ['main', 'projects'].forEach((n) => {
    const target = zone === n ? 1 : 0;
    if (gain[n] !== target) {
      gain[n] = target > gain[n] ? Math.min(target, gain[n] + step) : Math.max(target, gain[n] - step);
      moving = true;
    }
    const a = get(n);
    if (a && unlocked && !muted && gain[n] > 0 && a.paused) a.play().catch(() => {});
    if (a && gain[n] === 0 && !a.paused) a.pause();
  });
  apply();
  if (moving) raf = requestAnimationFrame(loop);
}
const kick = () => { if (!raf && typeof window !== 'undefined') raf = requestAnimationFrame(loop); };

function unlock() {
  if (unlocked) return;
  unlocked = true;
  ['pointerdown', 'keydown', 'touchend', 'click'].forEach((e) => window.removeEventListener(e, unlock, true));
  // music for the current zone fades in from silence
  kick();
}

if (typeof window !== 'undefined') {
  ['pointerdown', 'keydown', 'touchend', 'click'].forEach((e) => window.addEventListener(e, unlock, true));
  // pause when the tab is hidden, resume when it is back
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) ['main', 'projects'].forEach((n) => tracks[n] && tracks[n].pause());
    else kick();
  });
}

export const sound = {
  // 'main' | 'projects'
  setZone(z) {
    if (z === zone) return;
    zone = z;
    // the incoming loop starts from its current gain, so make sure the element is playing
    kick();
  },
  // one-shot effects: 'transition'
  play(name) {
    if (muted) return;
    const a = get(name);
    if (!a) return;
    a.volume = VOL[name];
    try { a.currentTime = 0; } catch { /* not loaded yet */ }
    a.play().catch(() => {}); // blocked before the first interaction: skipped on purpose (a late sound would feel wrong)
  },
  isMuted: () => muted,
  setMuted(m) {
    muted = m;
    try { localStorage.setItem(KEY, m ? 'off' : 'on'); } catch { /* ignore */ }
    if (m && tracks.transition) tracks.transition.pause();
    kick();
    apply();
    listeners.forEach((f) => f(muted));
  },
  subscribe(f) { listeners.add(f); return () => listeners.delete(f); },
};
