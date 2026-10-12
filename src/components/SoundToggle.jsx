import { useEffect, useState } from 'react';
import { sound } from '../lib/audio';
import './soundToggle.css';

// Small fixed button, bottom-left. Click to mute / unmute all site sound.
export default function SoundToggle({ show = true }) {
  const [muted, setMuted] = useState(sound.isMuted());
  useEffect(() => sound.subscribe(setMuted), []);

  return (
    <button
      type="button"
      className={`snd${muted ? ' off' : ''}${show ? ' in' : ''}`}
      tabIndex={show ? 0 : -1}
      aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
      aria-pressed={!muted}
      onClick={() => sound.setMuted(!muted)}
    >
      <span className="snd-bars" aria-hidden="true"><i /><i /><i /><i /></span>
      <span className="snd-label">{muted ? 'Sound off' : 'Sound on'}</span>
    </button>
  );
}
