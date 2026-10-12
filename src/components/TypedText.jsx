import { useEffect, useState } from 'react';
import { prefersReducedMotion } from '../lib/utils';

// Types each phrase, holds, deletes, moves on. Starts when `start` becomes true.
export default function TypedText({ phrases, start }) {
  const [text, setText] = useState('');

  useEffect(() => {
    if (!start) return undefined;
    if (prefersReducedMotion()) { setText(phrases[0]); return undefined; }

    let w = 0;
    let c = 0;
    let deleting = false;
    let timer;
    let dead = false;

    const tick = () => {
      if (dead) return;
      const cur = phrases[w];
      if (!deleting) {
        c += 1; setText(cur.slice(0, c));
        if (c === cur.length) { timer = setTimeout(() => { deleting = true; tick(); }, 2200); return; }
        timer = setTimeout(tick, 70 + Math.random() * 40);
      } else {
        c -= 1; setText(cur.slice(0, c));
        if (c === 0) { deleting = false; w = (w + 1) % phrases.length; timer = setTimeout(tick, 400); return; }
        timer = setTimeout(tick, 35);
      }
    };
    timer = setTimeout(tick, 900); // lets the headline lead land first
    return () => { dead = true; clearTimeout(timer); };
  }, [start, phrases]);

  return (
    <span className="typed" aria-hidden="true">
      <span>{text}</span><span className="caret" />
    </span>
  );
}
