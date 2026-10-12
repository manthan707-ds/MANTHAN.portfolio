import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { about } from "../../data/about";
import { createPixelTree } from "../../lib/pixelTree";
import "./about.css";

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const words = about.headline.split(" ");

  useEffect(() => {
    const root = rootRef.current;
    const tree = createPixelTree(canvasRef.current, about.nodes);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let ctx;

    if (reduce) {
      tree.draw(1);
    } else {
      const once = (trigger, start = "top 80%") => ({ trigger, start, once: true });
      ctx = gsap.context(() => {
        // 1. Headline words slide in one after another.
        gsap.from(".about-word", {
          opacity: 0, x: 20, duration: 0.8, ease: "power3.out", stagger: 0.06,
          scrollTrigger: once(".about-statement"),
        });
        // 2. Bio text fades in.
        gsap.from(".about-me > p", {
          opacity: 0, duration: 0.9, ease: "power2.out", stagger: 0.12,
          scrollTrigger: once(".about-me"),
        });
        // 3. The tree grows from the trunk outwards, then the labels appear.
        //    It replays EVERY time it scrolls into view, from above or from below, and resets once it is out of view.
        const p = { v: 0 };
        tree.draw(0);
        gsap.set(".about-node", { opacity: 0 });
        const tl = gsap.timeline({ paused: true });
        tl.to(p, { v: 1, duration: 2.6, ease: "power1.inOut", onUpdate: () => tree.draw(p.v) }, 0)
          .to(".about-node", { opacity: 1, duration: 0.5, ease: "power2.out", stagger: 0.18 }, 1.6);
        const replay = () => tl.restart();
        const reset = () => {
          tl.pause(0);
          p.v = 0;
          tree.draw(0);
          gsap.set(".about-node", { opacity: 0 });
        };
        ScrollTrigger.create({
          trigger: ".about-tree",
          start: "top 75%",      // entering from below (scrolling down)
          end: "bottom top",     // entering from above (scrolling back up)
          onEnter: replay,
          onEnterBack: replay,
          onLeave: reset,
          onLeaveBack: reset,
        });
      }, root);
    }

    // Web fonts change the layout, so re-measure once they are ready.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => { ctx?.revert(); tree.destroy(); };
  }, []);

  return (
    <section id="about" className="about" aria-labelledby="about-title" ref={rootRef}>
      <div className="about-frame">
        <div className="about-split">
          <div className="about-me">
            <h2 id="about-title" className="about-statement" aria-label={about.headline}>
              {words.map((w, i) => (
                <span className="about-word" aria-hidden="true" key={i}>
                  {w}{i < words.length - 1 ? "\u00A0" : ""}
                </span>
              ))}
            </h2>
            {about.bio.map((p, i) => <p className="about-text" key={i}>{p}</p>)}
            <p className="about-big">{about.availability}</p>
          </div>
          <div className="about-side">
            <h3>{about.treeTitle}</h3>
            <div className="about-tree">
              <canvas className="about-canvas" ref={canvasRef} aria-hidden="true" />
              {about.nodes.map((n) => (
                <div className="about-node" key={n.label} style={{ left: `${n.x}%`, top: `${n.y}%` }}>
                  <i /><span>{n.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
