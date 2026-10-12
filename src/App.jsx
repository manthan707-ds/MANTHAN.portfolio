import { useEffect, useState } from 'react';
import { sound } from './lib/audio';
import SoundToggle from './components/SoundToggle';
import Preloader from './components/Preloader';
import Cursor from './components/Cursor';
import Navbar from './components/Navbar';
import HeroScene from './components/HeroScene';
import Hero from './sections/Hero/Hero';
import About from './sections/About/About';
import TechStack from './sections/TechStack/TechStack';
import Work from './sections/Work/Work';
import ContactAssistant from './sections/Contact/ContactAssistant';
import AssistantFab from './components/AssistantFab';

export default function App() {
  const [loaded, setLoaded] = useState(false); // flips to true when the preloader hands off
  const [workOpen, setWorkOpen] = useState(false); // a Work project panel is open

  // transition sound: the moment loading hits 100% and the hero animation pops in
  useEffect(() => { if (loaded) sound.play('transition'); }, [loaded]);

  // projects.mp3 while the Work section is on screen or a project panel is open; main.mp3 everywhere else
  const [workVisible, setWorkVisible] = useState(false);
  useEffect(() => {
    const el = document.getElementById('work');
    if (!el || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(([e]) => setWorkVisible(e.intersectionRatio > 0.3), { threshold: [0, 0.3, 0.6, 1] });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => { sound.setZone(workVisible || workOpen ? 'projects' : 'main'); }, [workVisible, workOpen]);

  return (
    <div className={loaded ? 'app loaded' : 'app'}>
      <a className="skip" href="#hero">Skip to content</a>

      {/* fixed background layers: only visible behind the hero (later sections have solid backgrounds) */}
      <div className="glow" aria-hidden="true" />
      <HeroScene started={loaded} />
      <div className="vignette" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      <Cursor />
      <Preloader onExit={() => setLoaded(true)} />
      <Navbar />
      <SoundToggle show={loaded} />
      <AssistantFab show={loaded && !workOpen} />   {/* assistant button on every page */}

      <main>
        <Hero loaded={loaded} />          {/* #hero       */}
        <About />                          {/* #about      */}
        <TechStack />                      {/* #tech-stack */}
        <Work contactHref="#contact" onModalChange={setWorkOpen} />    {/* #work       */}
        <div id="contact">                 {/* #contact: last page */}
          <ContactAssistant />
        </div>
      </main>
    </div>
  );
}
