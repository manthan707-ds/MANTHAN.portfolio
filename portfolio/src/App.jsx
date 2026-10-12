import { useState } from 'react';
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
