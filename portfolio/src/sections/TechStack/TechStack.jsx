/* ==========================================================================
   TechStack.jsx : ONE FILE VERSION (tools list + styles + component together)
   Save as  src/sections/TechStack.jsx  and use it with:
       import TechStack from './sections/TechStack'
       <TechStack />
   Needs only react + gsap. No other files to connect.
   To change your tools, edit the STACK list below.
   ========================================================================== */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'

/* ---------- YOUR TOOLS (edit here) ---------- */
// Edit this file to change the Tech Stack section. Nothing else needs touching.
// - Add a tool: push a string into a group's `items`.
// - Add a group: add a new object to the array (the carousel, counter and ticks all follow).
// - `kind` is the short "Type:" line shown on the active card.
// - `blurb` is the one-line description under the big headline.
// - `tint` (optional): any CSS colour. Leave it out to use your single accent colour.

const STACK = [
  {
    id: 'languages',
    title: 'Programming Languages',
    kind: 'Foundation',
    blurb: 'The languages I think and build in',
    items: ['Python', 'SQL', 'JavaScript', 'TypeScript', 'HTML', 'CSS'],
  },
  {
    id: 'data',
    title: 'Data Science & Data Analysis',
    kind: 'Analysis',
    blurb: 'Turning raw data into clear answers',
    items: ['NumPy', 'Pandas', 'Matplotlib', 'Seaborn', 'Jupyter Notebook', 'Anaconda'],
  },
  {
    id: 'ml',
    title: 'Machine Learning & Deep Learning',
    kind: 'Modelling',
    blurb: 'Models that learn from data, and how I judge them',
    items: [
      'Scikit-learn',
      'TensorFlow',
      'Keras',
      'Ridge Regression',
      'Model Evaluation',
      'Feature Engineering',
    ],
  },
  {
    id: 'ai',
    title: 'AI & Generative AI',
    kind: 'Generative',
    blurb: 'Building with LLMs, retrieval and embeddings',
    items: [
      'LLMs',
      'Retrieval-Augmented Generation (RAG)',
      'Embeddings',
      'Vector Search',
      'Prompt Engineering',
      'AI APIs',
    ],
  },
  {
    id: 'web',
    title: 'Web Development',
    kind: 'Build',
    blurb: 'Interfaces and apps people can actually use',
    items: ['React', 'Next.js', 'Streamlit', 'Tailwind CSS'],
  },
  {
    id: 'databases',
    title: 'Databases',
    kind: 'Storage',
    blurb: 'Structured data, designed to last',
    // SQL lives in Programming Languages so it is not shown twice.
    items: ['MySQL', 'Relational Database Design'],
  },
  {
    id: 'devtools',
    title: 'Developer Tools',
    kind: 'Workflow',
    blurb: 'The workbench I ship from',
    items: ['Git', 'GitHub', 'VS Code', 'Cursor', 'PowerShell'],
  },
  {
    id: 'deploy',
    title: 'Deployment & Cloud',
    kind: 'Shipping',
    blurb: 'From localhost to a live link',
    // GitHub lives in Developer Tools so it is not shown twice.
    items: ['Vercel', 'Streamlit Community Cloud'],
  },
  {
    id: 'exploring',
    title: 'Currently Exploring',
    kind: 'In progress',
    blurb: 'What I am learning next, always in beta',
    items: [
      'Advanced Machine Learning',
      'Deep Learning',
      'LLM Applications',
      'RAG Pipelines',
      'AI Agents',
    ],
  },
]

/* ---------- STYLES ---------- */
const CSS = `
/* ==========================================================================
   Tech Stack: curved 3D carousel
   Colours come only from tokens.css: --bg --surface --text --muted --accent
   ========================================================================== */

.ts {
  --ts-fh: var(--font-heading, 'Pixelify Sans', ui-monospace, monospace);
  --ts-fb: var(--font-body, 'DM Sans', system-ui, sans-serif);
  --ts-fm: var(--font-mono, 'DM Mono', ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace);
  --tint: var(--accent, #d8b4fd);
  --cw: 270px;
  --ch: 415px;

  position: relative;
  height: 100vh;
  height: 100dvh;
  min-height: 580px;
  overflow: hidden;
  isolation: isolate;
  background: var(--bg, #09090b);
  color: var(--text, #fafafa);
  font-family: var(--ts-fb);
  -webkit-user-select: none;
  user-select: none;
}

.ts *,
.ts *::before,
.ts *::after {
  box-sizing: border-box;
}

/* visually hidden, still read by screen readers and search engines */
.ts-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* ---------- atmosphere ---------- */

.ts-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.ts-glow {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(55% 42% at 50% 40%, color-mix(in srgb, var(--accent, #d8b4fd) 24%, transparent), transparent 72%),
    radial-gradient(85% 38% at 50% 100%, color-mix(in srgb, var(--accent, #d8b4fd) 16%, transparent), transparent 72%),
    radial-gradient(120% 90% at 50% 45%, transparent 55%, color-mix(in srgb, var(--bg, #09090b) 85%, transparent) 100%);
}

/* tiny space: soft nebula, three layers of twinkling stars, two rare shooting stars */
.ts-nebula {
  position: absolute;
  inset: -10%;
  background:
    radial-gradient(38% 30% at 16% 26%, color-mix(in srgb, var(--accent, #d8b4fd) 13%, transparent), transparent 70%),
    radial-gradient(34% 28% at 84% 72%, color-mix(in srgb, var(--accent, #d8b4fd) 10%, transparent), transparent 70%),
    radial-gradient(26% 22% at 62% 14%, color-mix(in srgb, var(--text, #fafafa) 5%, transparent), transparent 70%);
  animation: ts-drift 46s ease-in-out infinite alternate;
}
.ts-star {
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 50%;
  pointer-events: none;
}
.ts-star--1 { width: 1px; height: 1px; animation: ts-twinkle 6s ease-in-out infinite alternate; }
.ts-star--2 { width: 2px; height: 2px; animation: ts-twinkle 4.5s ease-in-out -2s infinite alternate; }
.ts-star--3 { width: 2px; height: 2px; animation: ts-twinkle 3.2s ease-in-out -1s infinite alternate; }
@keyframes ts-twinkle { from { opacity: 0.3; } to { opacity: 1; } }
@keyframes ts-drift {
  from { transform: translate3d(-1.5%, -1%, 0) scale(1); }
  to { transform: translate3d(1.5%, 1%, 0) scale(1.06); }
}
.ts-shoot {
  position: absolute;
  top: 10%;
  left: 18%;
  width: 90px;
  height: 1px;
  opacity: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.9));
  transform: rotate(32deg);
  animation: ts-shoot 11s linear 3s infinite;
}
.ts-shoot--b { top: 50%; left: 55%; animation-duration: 15s; animation-delay: 8s; }
@keyframes ts-shoot {
  0% { opacity: 0; transform: translate3d(0, 0, 0) rotate(32deg); }
  2% { opacity: 1; }
  9% { opacity: 0; transform: translate3d(260px, 163px, 0) rotate(32deg); }
  100% { opacity: 0; transform: translate3d(260px, 163px, 0) rotate(32deg); }
}
@media (prefers-reduced-motion: reduce) {
  .ts-star, .ts-nebula { animation: none; }
  .ts-shoot { display: none; }
}

.ts-ray {
  position: absolute;
  top: 0;
  left: 50%;
  width: 1px;
  height: 78%;
  transform-origin: top center;
  background: linear-gradient(to bottom, color-mix(in srgb, var(--accent, #d8b4fd) 90%, transparent), transparent 85%);
  opacity: 0.22;
}
.ts-ray--c { height: 62%; opacity: 0.3; }
.ts-ray--l1 { transform: rotate(-66deg); height: 52%; }
.ts-ray--r1 { transform: rotate(66deg); height: 52%; }
.ts-ray--l2 { transform: rotate(-52deg); height: 40%; opacity: 0.12; }
.ts-ray--r2 { transform: rotate(52deg); height: 40%; opacity: 0.12; }

/* ---------- small top label ---------- */

.ts-label {
  position: absolute;
  top: 1.5rem;
  left: 3rem;
  right: 3rem;
  z-index: 6;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  pointer-events: none;
}
.ts-label__title {
  font-family: var(--ts-fh);
  font-size: 1.25rem;
  color: var(--text, #fafafa);
}
.ts-label__hint {
  font-size: 0.8125rem;
  color: var(--muted, #a1a1aa);
}

/* ---------- stage + ring ---------- */

.ts-stage {
  position: absolute;
  inset: 0;
  z-index: 1;
  perspective: 1500px;
  perspective-origin: 50% 42%;
  touch-action: pan-y; /* vertical swipes still scroll the page */
  cursor: grab;
  outline: none;
}
.ts-stage.is-dragging,
.ts-stage.is-dragging * {
  cursor: grabbing;
}
.ts-stage:focus-visible {
  outline: 1px dashed color-mix(in srgb, var(--accent, #d8b4fd) 70%, transparent);
  outline-offset: -8px;
}

.ts-ring {
  position: absolute;
  left: 0;
  right: 0;
  top: 46%;
  height: 0;
  transform-style: preserve-3d;
}

/* glowing curved line under the cards */
.ts-floor {
  position: absolute;
  left: 50%;
  top: calc(46% + var(--ch) / 2 - 150px);
  width: min(138vw, 1900px);
  height: 300px;
  transform: translateX(-50%);
  border-radius: 50%;
  border: 1px solid color-mix(in srgb, var(--accent, #d8b4fd) 50%, transparent);
  background: radial-gradient(ellipse at 50% 50%, color-mix(in srgb, var(--accent, #d8b4fd) 16%, transparent), transparent 68%);
  box-shadow:
    0 0 36px color-mix(in srgb, var(--accent, #d8b4fd) 28%, transparent),
    inset 0 -34px 70px color-mix(in srgb, var(--accent, #d8b4fd) 14%, transparent);
  clip-path: inset(50% 0 0 0);
  pointer-events: none;
}

/* ---------- cards ---------- */

.ts-card {
  position: absolute;
  left: 50%;
  top: 50%;
  width: var(--cw);
  height: var(--ch);
  margin: calc(var(--ch) / -2) 0 0 calc(var(--cw) / -2);
  transform-style: preserve-3d;
  will-change: transform, opacity;
  backface-visibility: hidden;
  opacity: 0;
  --on: 0;
}

.ts-card__face {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: calc(var(--cw) * 0.075);
  background: var(--surface, #0e0b16);
  box-shadow: 0 22px 44px -22px rgba(0, 0, 0, 0.7);
}
.ts-card__face::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  background: radial-gradient(90% 62% at 85% 6%, color-mix(in srgb, var(--tint) 40%, transparent), transparent 62%);
  opacity: calc(0.7 + var(--on) * 0.3);
  pointer-events: none;
}
.ts-card__face::after {
  content: none;
}

/* soft outer glow, brightens on the centred card */
.ts-card__halo {
  position: absolute;
  inset: 0;
  border-radius: calc(var(--cw) * 0.075);
  box-shadow: 0 0 60px color-mix(in srgb, var(--tint) 38%, transparent);
  opacity: calc(var(--on) * 0.7);
  pointer-events: none;
}

.ts-card__art {
  position: absolute;
  inset: 0;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  image-rendering: pixelated;
  opacity: calc(0.2 + var(--on) * 0.25);
  -webkit-mask-image: radial-gradient(75% 58% at 88% 8%, #000 0%, transparent 72%);
  mask-image: radial-gradient(75% 58% at 88% 8%, #000 0%, transparent 72%);
  z-index: 0;
}

.ts-card__scan {
  display: none;
}

.ts-card__glow {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  z-index: 3;
  padding: 1px;
  background: linear-gradient(
    155deg,
    color-mix(in srgb, var(--text, #fafafa) 34%, transparent) 0%,
    color-mix(in srgb, var(--text, #fafafa) 8%, transparent) 38%,
    color-mix(in srgb, var(--tint) 45%, transparent) 100%
  );
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
  opacity: calc(0.55 + var(--on) * 0.45);
  pointer-events: none;
}

.ts-card__top {
  position: absolute;
  top: 5.5%;
  left: 8%;
  right: 8%;
  display: flex;
  justify-content: space-between;
  font-family: var(--ts-fb);
  z-index: 2;
  font-size: max(10px, calc(var(--cw) * 0.04));
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text, #fafafa);
  opacity: 0.6;
}

.ts-card__title {
  position: absolute;
  left: 8%;
  right: 8%;
  bottom: 6.5%;
  font-family: var(--ts-fh);
  z-index: 2;
  font-size: max(16px, calc(var(--cw) * 0.098));
  line-height: 1.08;
  color: var(--text, #fafafa);
  opacity: calc(1 - var(--on) * 1.4);
}

/* the data readout that appears on the centred card */
.ts-info {
  position: absolute;
  inset: 0;
  z-index: 2;
  padding: 17% 8% 8%;
  display: flex;
  flex-direction: column;
  gap: 0.85em;
  font-family: var(--ts-fb);
  font-size: max(11px, calc(var(--cw) * 0.048));
  font-weight: 500;
  line-height: 1.25;
  color: var(--text, #fafafa);
  opacity: calc(var(--on) * 1.25);
  pointer-events: none;
}
.ts-info::before {
  content: none;
}
.ts-info__row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.8em;
  padding-bottom: 0.7em;
  border-bottom: 1px solid color-mix(in srgb, var(--text, #fafafa) 10%, transparent);
}



.ts-info__k {
  flex: none;
  font-size: 0.78em;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted, #a1a1aa);
}
.ts-info__row:nth-child(1) {
  display: none;
}
.ts-info__row--name {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.3em;
}
.ts-info__row--name .ts-info__k {
  display: none;
}
.ts-info__row--name .ts-info__v {
  font-family: var(--ts-fh);
  font-weight: 400;
  font-size: max(18px, calc(var(--cw) * 0.098));
  line-height: 1.08;
  text-align: left;
}
.ts-info__row--stack {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.6em;
  margin-top: auto;
  padding-bottom: 0;
  border-bottom: 0;
}
.ts-info__v {
  text-align: right;
  color: var(--text, #fafafa);
  font-weight: 500;
}
.ts-info__list {
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  justify-content: flex-start;
  text-align: left;
  gap: 0.4em;
}
.ts-info__list > span {
  max-width: 100%;
  padding: 0.28em 0.75em;
  border: 1px solid color-mix(in srgb, var(--tint) 45%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--tint) 12%, transparent);
  font-size: 0.88em;
  line-height: 1.2;
}

/* soft reflection on the "floor" */
.ts-card__mirror {
  display: none;
}


/* ---------- headline (bottom-left) ---------- */

.ts-head {
  position: absolute;
  left: 3rem;
  bottom: 1.25rem;
  z-index: 5;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: min(34vw, 30rem);
  pointer-events: none;
}
.ts-head__title {
  margin: 0;
  font-weight: 500;
}
.ts-head__mask {
  display: block;
  overflow: hidden;
  padding: 0.1em 0 0.2em;
}
.ts-head__line {
  display: flex;
  align-items: flex-start;
  gap: 0.4em;
  font-family: var(--ts-fh);
  font-size: clamp(1.6rem, 3vw, 3rem);
  line-height: 1.04;
  letter-spacing: -0.01em;
  color: var(--text, #fafafa);
  text-shadow: 0 0 32px color-mix(in srgb, var(--accent, #d8b4fd) 40%, transparent);
  will-change: transform;
}
.ts-arrow {
  flex: none;
  width: 0.7em;
  height: 0.7em;
  margin-top: 0.12em;
  color: var(--accent, #d8b4fd);
}
.ts-head__desc {
  margin: 0;
  width: 16.25rem;
  max-width: 100%;
  font-family: var(--ts-fm);
  font-size: 0.75rem;
  line-height: 1.2;
  text-transform: uppercase;
  color: var(--muted, #a1a1aa);
}

/* ---------- index pill + pagination ---------- */

.ts-pill {
  position: absolute;
  left: 50%;
  bottom: 4rem;
  z-index: 10;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  min-width: 7.5rem;
  padding: 0.875rem 1.75rem;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--accent, #d8b4fd) 45%, transparent);
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--accent, #d8b4fd) 10%, var(--surface, #18181b)),
    color-mix(in srgb, var(--accent, #d8b4fd) 22%, var(--surface, #18181b))
  );
  -webkit-backdrop-filter: blur(5px);
  backdrop-filter: blur(5px);
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, var(--text, #fafafa) 22%, transparent),
    0 0 22px color-mix(in srgb, var(--accent, #d8b4fd) 22%, transparent);
  color: var(--text, #fafafa);
  font-family: var(--ts-fb);
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
  transition: opacity 0.15s ease, box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.ts-pill svg {
  width: 1.25rem;
  height: 1.25rem;
}
.ts-pill:hover {
  box-shadow: 0 0 28px color-mix(in srgb, var(--accent, #d8b4fd) 40%, transparent);
}
.ts-pill:focus-visible {
  outline: 2px solid var(--accent, #d8b4fd);
  outline-offset: 3px;
}
.ts-pill.is-open {
  opacity: 0;
}

.ts-pager {
  position: absolute;
  left: 50%;
  bottom: 1.25rem;
  z-index: 10;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 1rem;
  font-family: var(--ts-fm);
  font-size: 0.8125rem;
  color: var(--text, #fafafa);
}
.ts-pager__count {
  width: 2ch;
  text-align: center;
  font-feature-settings: 'tnum';
}
.ts-pager__items {
  display: flex;
  align-items: center;
  cursor: grab;
  touch-action: none;
}
.ts-pager__items.is-dragging,
.ts-pager__items.is-dragging .ts-tick {
  cursor: grabbing;
}
.ts-tick {
  display: flex;
  align-items: center;
  padding: 0 0.4rem;
  background: none;
  border: 0;
  cursor: pointer;
  transition: padding 0.25s ease;
}
.ts-tick:focus-visible {
  outline: 1px solid var(--text, #fafafa);
  outline-offset: 3px;
  border-radius: 2px;
}
.ts-tick__bar {
  display: block;
  width: 1px;
  height: 1rem;
  border: 1px solid transparent;
  border-radius: 3px;
  background: var(--text, #fafafa);
  opacity: 0.35;
  transition: width 0.35s ease, background-color 0.35s ease, border-color 0.35s ease, opacity 0.35s ease;
}
.ts-tick:hover .ts-tick__bar {
  opacity: 1;
}
.ts-tick.is-active .ts-tick__bar {
  width: 0.75rem;
  background: transparent;
  border-color: var(--accent, #d8b4fd);
  box-shadow: 0 0 12px color-mix(in srgb, var(--accent, #d8b4fd) 70%, transparent);
  opacity: 1;
}

/* ---------- index overlay ---------- */

.ts-index {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ts-fade 0.35s ease both;
}
.ts-index__backdrop {
  position: absolute;
  inset: 0;
  border: 0;
  background: color-mix(in srgb, var(--bg, #09090b) 82%, transparent);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  cursor: pointer;
}
.ts-index__panel {
  position: relative;
  width: min(30rem, calc(100% - 2rem));
  max-height: calc(100% - 4rem);
  overflow: auto;
  padding: 0.5rem;
  border-radius: 1.5rem;
  border: 1px solid color-mix(in srgb, var(--accent, #d8b4fd) 45%, transparent);
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--accent, #d8b4fd) 10%, var(--surface, #18181b)),
    color-mix(in srgb, var(--accent, #d8b4fd) 20%, var(--surface, #18181b))
  );
  animation: ts-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.ts-index ol {
  list-style: none;
  margin: 0;
  padding: 0;
}
.ts-index li button {
  width: 100%;
  display: grid;
  grid-template-columns: 2.5rem 1fr auto;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1rem;
  border: 0;
  border-radius: 1rem;
  background: none;
  color: var(--text, #fafafa);
  text-align: left;
  cursor: pointer;
  transition: background-color 0.25s ease;
}
.ts-index li button:hover,
.ts-index li button:focus-visible {
  background: color-mix(in srgb, var(--accent, #d8b4fd) 16%, transparent);
  outline: none;
}
.ts-index li button.is-active .ts-index__t {
  color: var(--accent, #d8b4fd);
}
.ts-index__n,
.ts-index__c {
  font-family: var(--ts-fm);
  font-size: 0.75rem;
  color: var(--muted, #a1a1aa);
}
.ts-index__t {
  font-family: var(--ts-fh);
  font-size: 1.15rem;
  line-height: 1.1;
}

@keyframes ts-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes ts-pop {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}

/* ---------- tablet + phone ---------- */

@media (max-width: 1024px) {
  .ts-label { left: 2rem; right: 2rem; }
  .ts-head {
    left: 2rem;
    top: 3.75rem;
    bottom: auto;
    gap: 1rem;
    max-width: calc(100% - 4rem);
  }
  .ts-head__line { font-size: clamp(1.5rem, 5vw, 2.25rem); }
  .ts-pill { bottom: 4.75rem; padding: 0.75rem 1.5rem; }
  .ts-pager { bottom: 2rem; }
}

@media (max-width: 640px) {
  .ts-label { left: 1rem; right: 1rem; top: 1.1rem; }
  .ts-label__hint { display: none; }
  .ts-head { left: 1rem; top: 3.25rem; max-width: calc(100% - 2rem); }
  .ts-info { padding: 12% 9%; gap: 0.4em; }
  .ts-info__row--name { display: none; }
  .ts-tick { padding: 0 0.3rem; }
}

@media (prefers-reduced-motion: reduce) {
  .ts-index,
  .ts-index__panel { animation: none; }
  .ts-tick,
  .ts-tick__bar,
  .ts-pill { transition: none; }
}

`

/* ------------------------------------------------------------------ */
/*  helpers                                                            */
/* ------------------------------------------------------------------ */

const N = STACK.length

// Tiny deterministic starfield: each layer is ONE element whose box-shadow draws many stars.
function starField(count, seed, blur, spread) {
  let a = seed
  const r = () => (a = (Math.imul(a, 1664525) + 1013904223) >>> 0) / 4294967296
  const out = []
  for (let i = 0; i < count; i++) {
    out.push(
      `${(r() * 100).toFixed(2)}vw ${(r() * 100).toFixed(2)}vh ${blur}px ${(r() * spread).toFixed(2)}px rgba(255,255,255,${(0.35 + r() * 0.65).toFixed(2)})`,
    )
  }
  return out.join(',')
}
const STAR_LAYERS = [starField(110, 11, 0, 0), starField(40, 23, 0, 0.3), starField(10, 37, 4, 0.5)]
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
const pad = (n) => String(n).padStart(2, '0')

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
const dur = (s) => (prefersReduced() ? 0 : s)

// Reads --accent from tokens.css so a palette change recolours the pixel art too.
function readAccent() {
  try {
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue('--accent')
      .trim()
    const m = /^#?([0-9a-f]{6})$/i.exec(raw)
    if (m) {
      const n = parseInt(m[1], 16)
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    }
  } catch (e) {
    /* fall through */
  }
  return [216, 180, 253]
}

// Small deterministic pixel-art picture per group (mirrored blob, denser in the middle).
// Generated at runtime from the group id, so there are no image files to manage.
function pixelArt(seed, rgb) {
  if (typeof document === 'undefined') return ''
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  const rand = () => {
    h += 0x6d2b79f5
    let t = h
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const W = 26
  const H = 40
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')
  const half = W / 2
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < half; x++) {
      const dx = 1 - x / half
      const dy = Math.abs(y / H - 0.5) * 2
      const density = clamp(1.08 - Math.hypot(dx * 0.95, dy * 0.8), 0, 1)
      if (rand() < density * 0.9) {
        const a = 0.14 + rand() * 0.8 * density
        ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a.toFixed(3)})`
        ctx.fillRect(x, y, 1, 1)
        ctx.fillRect(W - 1 - x, y, 1, 1)
      }
    }
  }
  // a few bright "stars"
  for (let i = 0; i < 9; i++) {
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.fillRect((rand() * W) | 0, (rand() * H) | 0, 1, 1)
  }
  return c.toDataURL()
}

// Text "decode" effect used on the active card's info rows.
const GLYPHS = '▮▯░▒▓/\\<>_-+*#'
function decode(el, text, { duration = 0.6, delay = 0 } = {}) {
  if (!el) return
  if (el._decode) el._decode.kill()
  if (prefersReduced()) {
    el.textContent = text
    return
  }
  const noise = (reveal) => {
    let out = ''
    for (let i = 0; i < text.length; i++) {
      const ch = text[i]
      out += i < reveal || ch === ' ' ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]
    }
    return out
  }
  el.textContent = noise(0)
  const s = { p: 0 }
  el._decode = gsap.to(s, {
    p: 1,
    duration,
    delay,
    ease: 'none',
    onUpdate: () => {
      el.textContent = noise(Math.floor(s.p * text.length))
    },
    onComplete: () => {
      el.textContent = text
    },
  })
}

const Arrow = () => (
  <svg
    className="ts-arrow"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m15 10 5 5-5 5" />
    <path d="M4 4v7a4 4 0 0 0 4 4h12" />
  </svg>
)

// one decodable piece of text
const T = ({ t, className }) => (
  <span className={className} data-decode data-text={t}>
    {t}
  </span>
)

/* ------------------------------------------------------------------ */
/*  component                                                          */
/* ------------------------------------------------------------------ */

export default function TechStack() {
  const rootRef = useRef(null)
  const stageRef = useRef(null)
  const ringRef = useRef(null)
  const cardsRef = useRef([])
  const headRef = useRef(null)
  const tickRef = useRef(null)

  const P = useRef({ pos: 0 }) // carousel position, 0 .. N-1 (float while moving)
  const S = useRef({ spread: 0 }) // 0 = cards stacked, 1 = fanned out (entrance)
  const geo = useRef({ R: 900, step: 0.34, pitch: 300 })
  const drag = useRef({ on: false })
  const chase = useRef({ target: 0, follow: false, goal: 0 }) // eased following while dragging / wheeling
  const tickDrag = useRef({ on: false, last: -1 })

  const [active, setActive] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [scrubbing, setScrubbing] = useState(false)
  const [indexOpen, setIndexOpen] = useState(false)

  const arts = useMemo(() => {
    if (typeof document === 'undefined') return []
    const rgb = readAccent()
    return STACK.map((g) => pixelArt(g.id, rgb))
  }, [])

  /* ---------- placement of every card on the curved ring ---------- */
  const render = useCallback(() => {
    const pos = P.current.pos
    const spread = S.current.spread
    const { R, step } = geo.current
    const cards = cardsRef.current

    for (let i = 0; i < cards.length; i++) {
      const el = cards[i]
      if (!el) continue
      const d = i - pos
      const ad = Math.abs(d)

      if (ad > 5.4) {
        if (!el._hidden) {
          el.style.visibility = 'hidden'
          el._hidden = true
        }
        continue
      }
      if (el._hidden) {
        el.style.visibility = 'visible'
        el._hidden = false
      }

      const a = d * step * spread
      const x = Math.sin(a) * R
      const z = -R * (1 - Math.cos(a))
      const deg = (a * 180) / Math.PI
      const fade = clamp(1 - Math.max(0, ad - 2.8) * 0.4, 0, 1) * clamp(spread * 1.3, 0, 1)
      const on = clamp(1 - ad, 0, 1)

      el.style.transform = `translate3d(${x.toFixed(2)}px,0,${z.toFixed(2)}px) rotateY(${deg.toFixed(3)}deg) scale(${(0.9 + 0.1 * spread).toFixed(3)})`
      el.style.opacity = fade.toFixed(3)
      el.style.zIndex = String(100 - Math.round(ad * 10))
      el.style.pointerEvents = ad < 4.6 ? 'auto' : 'none'
      el.style.setProperty('--on', on.toFixed(3))
    }

    const idx = clamp(Math.round(pos), 0, N - 1)
    setActive((prev) => (prev === idx ? prev : idx))
  }, [])

  const goTo = useCallback(
    (i, { duration = 1.15 } = {}) => {
      const t = clamp(Math.round(i), 0, N - 1)
      const d = dur(duration)
      chase.current.follow = false
      chase.current.goal = t
      gsap.to(P.current, {
        pos: t,
        duration: d,
        ease: 'power3.out',
        overwrite: true,
        onUpdate: render,
        onComplete: render,
      })
      if (d === 0) render()
    },
    [render],
  )

  /* ---------- size + geometry (cards scale with the viewport) ---------- */
  useEffect(() => {
    const measure = () => {
      const w = window.innerWidth
      const cw = w < 640 ? 128 : w < 1024 ? 168 : Math.min(240, Math.max(190, w * 0.115))
      const R = cw * 3.3
      const step = (cw * 1.12) / R
      geo.current = { R, step, pitch: R * step }
      const root = rootRef.current
      if (root) {
        root.style.setProperty('--cw', `${cw}px`)
        root.style.setProperty('--ch', `${Math.round(cw / 0.65)}px`)
      }
      render()
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [render])

  /* ---------- entrance: cards fan out once when the section is seen ---------- */
  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        gsap.to(S.current, {
          spread: 1,
          duration: dur(1.6),
          ease: 'power3.out',
          onUpdate: render,
          onComplete: render,
        })
      },
      { threshold: 0.3 },
    )
    io.observe(root)
    return () => io.disconnect()
  }, [render])

  /* ---------- eased following (drag + wheel): frame-rate independent, no jitter ---------- */
  useEffect(() => {
    const tick = (time, deltaTime) => {
      const t = chase.current
      if (!t.follow) return
      const p = P.current
      const k = prefersReduced() ? 1 : 1 - Math.exp(-(deltaTime / 1000) * 13)
      const next = p.pos + (t.target - p.pos) * k
      p.pos = Math.abs(t.target - next) < 0.0004 ? t.target : next
      render()
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [render])

  /* ---------- sideways wheel / trackpad swipe (vertical wheel keeps scrolling the page) ---------- */
  useEffect(() => {
    const el = stageRef.current
    if (!el) return undefined
    let timer
    const onWheel = (e) => {
      const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey
      if (!horizontal) return
      e.preventDefault()
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      gsap.killTweensOf(P.current)
      const t = chase.current
      if (!t.follow) t.target = P.current.pos
      t.follow = true
      t.target = clamp(t.target + delta / 300, -0.3, N - 0.7)
      clearTimeout(timer)
      timer = setTimeout(() => goTo(chase.current.target, { duration: 0.9 }), 140)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      el.removeEventListener('wheel', onWheel)
      clearTimeout(timer)
    }
  }, [render, goTo])

  /* ---------- gentle mouse parallax on the whole ring ---------- */
  useEffect(() => {
    const root = rootRef.current
    const ring = ringRef.current
    if (!root || !ring || prefersReduced()) return undefined
    const rx = gsap.quickTo(ring, 'rotationX', { duration: 0.9, ease: 'power3.out' })
    const ry = gsap.quickTo(ring, 'rotationY', { duration: 0.9, ease: 'power3.out' })
    const move = (e) => {
      if (e.pointerType !== 'mouse') return
      const r = root.getBoundingClientRect()
      const nx = (e.clientX - r.left) / r.width - 0.5
      const ny = (e.clientY - r.top) / r.height - 0.5
      ry(nx * -4)
      rx(ny * 3)
    }
    const leave = () => {
      ry(0)
      rx(0)
    }
    root.addEventListener('pointermove', move)
    root.addEventListener('pointerleave', leave)
    return () => {
      root.removeEventListener('pointermove', move)
      root.removeEventListener('pointerleave', leave)
    }
  }, [])

  /* ---------- headline + decode when the active group changes ---------- */
  useEffect(() => {
    const head = headRef.current
    if (head) {
      const line = head.querySelector('.ts-head__line')
      const desc = head.querySelector('.ts-head__desc')
      gsap.fromTo(line, { yPercent: 115 }, { yPercent: 0, duration: dur(0.85), ease: 'expo.out' })
      gsap.fromTo(
        desc,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: dur(0.6), delay: dur(0.12), ease: 'power3.out' },
      )
    }
    const card = cardsRef.current[active]
    if (card) {
      card.querySelectorAll('[data-decode]').forEach((el, i) => {
        decode(el, el.dataset.text, { duration: 0.55, delay: i * 0.035 })
      })
    }
  }, [active])

  /* ---------- Esc closes the index ---------- */
  useEffect(() => {
    if (!indexOpen) return undefined
    const onKey = (e) => e.key === 'Escape' && setIndexOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [indexOpen])

  /* ---------- clean up tweens on unmount ---------- */
  useEffect(
    () => () => {
      gsap.killTweensOf(P.current)
      gsap.killTweensOf(S.current)
      chase.current.follow = false
    },
    [],
  )

  /* ---------- drag / swipe on the stage ---------- */
  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    gsap.killTweensOf(P.current)
    chase.current.target = P.current.pos
    chase.current.follow = true
    const hit = e.target.closest ? e.target.closest('[data-i]') : null
    drag.current = {
      on: true,
      moved: false,
      startX: e.clientX,
      startPos: P.current.pos,
      lastX: e.clientX,
      lastT: performance.now(),
      v: 0,
      downIdx: hit ? Number(hit.dataset.i) : null,
    }
    setDragging(true)
    stageRef.current.setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = (e) => {
    const d = drag.current
    if (!d.on) return
    const dx = e.clientX - d.startX
    if (Math.abs(dx) > 4) d.moved = true
    if (!d.moved) return
    const now = performance.now()
    d.v = (e.clientX - d.lastX) / Math.max(1, now - d.lastT) // px per ms
    d.lastX = e.clientX
    d.lastT = now
    chase.current.target = clamp(d.startPos - dx / geo.current.pitch, -0.35, N - 0.65)
  }

  const endDrag = (e) => {
    const d = drag.current
    if (!d.on) return
    d.on = false
    setDragging(false)
    stageRef.current.releasePointerCapture?.(e.pointerId)
    if (!d.moved) {
      // a tap: jump to the card that was pressed
      goTo(d.downIdx != null ? d.downIdx : P.current.pos)
      return
    }
    const flick = clamp((-d.v * 200) / geo.current.pitch, -2, 2)
    goTo(chase.current.target + flick)
  }

  const onKeyDown = (e) => {
    const cur = chase.current.goal
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      goTo(cur + 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      goTo(cur - 1)
    } else if (e.key === 'Home') {
      e.preventDefault()
      goTo(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      goTo(N - 1)
    }
  }

  /* ---------- scrub the tick bar ---------- */
  const tickIndexAt = (x) => {
    const r = tickRef.current.getBoundingClientRect()
    return clamp(Math.floor(((x - r.left) / r.width) * N), 0, N - 1)
  }
  const onTickDown = (e) => {
    tickDrag.current = { on: true, last: tickIndexAt(e.clientX) }
    setScrubbing(true)
    tickRef.current.setPointerCapture?.(e.pointerId)
    goTo(tickDrag.current.last, { duration: 0.8 })
  }
  const onTickMove = (e) => {
    const t = tickDrag.current
    if (!t.on) return
    const i = tickIndexAt(e.clientX)
    if (i !== t.last) {
      t.last = i
      goTo(i, { duration: 0.6 })
    }
  }
  const onTickUp = (e) => {
    tickDrag.current.on = false
    setScrubbing(false)
    tickRef.current.releasePointerCapture?.(e.pointerId)
  }

  const group = STACK[active]

  return (
    <section
      id="tech-stack"
      className="ts"
      ref={rootRef}
      aria-label="Tech stack"
    >
      {/* screen-reader / no-WebGL-needed content: everything is readable as plain text */}
      <style>{CSS}</style>
      <div className="ts-sr">
        <h2>Tech stack</h2>
        <p aria-live="polite">
          Showing {group.title}, group {active + 1} of {N}
        </p>
        <ul>
          {STACK.map((g) => (
            <li key={g.id}>
              <strong>{g.title}</strong>: {g.items.join(', ')}
            </li>
          ))}
        </ul>
      </div>

      {/* atmosphere */}
      <div className="ts-bg" aria-hidden="true">
        <div className="ts-glow" />
        <div className="ts-nebula" />
        {STAR_LAYERS.map((sh, i) => (
          <div key={i} className={`ts-star ts-star--${i + 1}`} style={{ boxShadow: sh }} />
        ))}
        <span className="ts-shoot" />
        <span className="ts-shoot ts-shoot--b" />
        <span className="ts-ray ts-ray--c" />
        <span className="ts-ray ts-ray--l1" />
        <span className="ts-ray ts-ray--r1" />
        <span className="ts-ray ts-ray--l2" />
        <span className="ts-ray ts-ray--r2" />
      </div>

      <div className="ts-label" aria-hidden="true">
        <span className="ts-label__title">Tech stack</span>
        <span className="ts-label__hint">Drag, swipe or use the arrow keys</span>
      </div>

      {/* the curved carousel */}
      <div
        className={`ts-stage${dragging ? ' is-dragging' : ''}`}
        ref={stageRef}
        role="group"
        aria-roledescription="carousel"
        aria-label="Tech stack groups"
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
      >
        <div className="ts-floor" aria-hidden="true" />
        <div className="ts-ring" ref={ringRef}>
          {STACK.map((g, i) => (
            <article
              key={g.id}
              className="ts-card"
              data-i={i}
              ref={(el) => {
                cardsRef.current[i] = el
              }}
              style={g.tint ? { '--tint': g.tint } : undefined}
              aria-hidden="true"
            >
              <div className="ts-card__halo" />
              <div className="ts-card__face">
                <div
                  className="ts-card__art"
                  style={{ backgroundImage: arts[i] ? `url(${arts[i]})` : 'none' }}
                />
                <div className="ts-card__scan" />
                <div className="ts-card__top">
                  <span>{pad(i + 1)}</span>
                  <span>{g.kind}</span>
                </div>
                <div className="ts-card__title">{g.title}</div>

                <div className="ts-info">
                  <div className="ts-info__row">
                    <T className="ts-info__k" t="Group:" />
                    <T className="ts-info__v" t={`/${pad(i + 1)}`} />
                  </div>
                  <div className="ts-info__row ts-info__row--name">
                    <T className="ts-info__k" t="Name:" />
                    <T className="ts-info__v" t={g.title} />
                  </div>
                  <div className="ts-info__row">
                    <T className="ts-info__k" t="Type:" />
                    <T className="ts-info__v" t={g.kind} />
                  </div>
                  <div className="ts-info__row">
                    <T className="ts-info__k" t="Items:" />
                    <T className="ts-info__v" t={pad(g.items.length)} />
                  </div>
                  <div className="ts-info__row ts-info__row--stack">
                    <T className="ts-info__k" t="Stack:" />
                    <div className="ts-info__list">
                      {g.items.map((it) => (
                        <T key={it} t={it} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="ts-card__glow" />
              </div>
              <div className="ts-card__mirror" style={{ backgroundImage: arts[i] ? `url(${arts[i]})` : 'none' }} />
            </article>
          ))}
        </div>
      </div>

      {/* headline */}
      <div className="ts-head" ref={headRef} aria-hidden="true">
        <h3 className="ts-head__title">
          <span className="ts-head__mask">
            <span className="ts-head__line">
              <Arrow />
              <span>{group.title}</span>
            </span>
          </span>
        </h3>
        <p className="ts-head__desc">{group.blurb}</p>
      </div>

      {/* index button + pagination */}
      <button
        type="button"
        className={`ts-pill${indexOpen ? ' is-open' : ''}`}
        onClick={() => setIndexOpen(true)}
        aria-haspopup="dialog"
      >
        Index
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M3 6h18" />
          <path d="M3 12h12" />
          <path d="M3 18h7" />
        </svg>
      </button>

      <nav className="ts-pager" aria-label="Tech stack navigation">
        <span className="ts-pager__count" aria-hidden="true">
          {pad(active + 1)}
        </span>
        <div
          className={`ts-pager__items${scrubbing ? ' is-dragging' : ''}`}
          ref={tickRef}
          role="toolbar"
          aria-orientation="horizontal"
          onPointerDown={onTickDown}
          onPointerMove={onTickMove}
          onPointerUp={onTickUp}
          onPointerCancel={onTickUp}
        >
          {STACK.map((g, i) => (
            <button
              key={g.id}
              type="button"
              className={`ts-tick${i === active ? ' is-active' : ''}`}
              aria-label={`Group ${i + 1}: ${g.title}`}
              aria-current={i === active ? 'true' : undefined}
              tabIndex={i === active ? 0 : -1}
              onClick={() => goTo(i)}
            >
              <span className="ts-tick__bar" />
            </button>
          ))}
        </div>
        <span className="ts-pager__count" aria-hidden="true">
          {pad(N)}
        </span>
      </nav>

      {indexOpen && (
        <div className="ts-index" role="dialog" aria-modal="true" aria-label="All tech stack groups">
          <button type="button" className="ts-index__backdrop" aria-label="Close index" onClick={() => setIndexOpen(false)} />
          <div className="ts-index__panel">
            <ol>
              {STACK.map((g, i) => (
                <li key={g.id}>
                  <button
                    type="button"
                    className={i === active ? 'is-active' : ''}
                    onClick={() => {
                      goTo(i)
                      setIndexOpen(false)
                    }}
                  >
                    <span className="ts-index__n">{pad(i + 1)}</span>
                    <span className="ts-index__t">{g.title}</span>
                    <span className="ts-index__c">{pad(g.items.length)}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </section>
  )
}
