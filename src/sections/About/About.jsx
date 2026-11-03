import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { about } from "../../data/about";
import { createPixelTree } from "../../lib/pixelTree";
import { useMagnetic } from "../../hooks/useMagnetic";
import "./about.css";

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const treeRef = useRef(null);
  const resumeRef = useMagnetic(0.3);
  const [active, setActive] = useState(-1);
  const words = about.headline.split(" ");
  const node = active >= 0 ? about.nodes[active] : null;

  // highlight the chosen branch on the canvas
  useEffect(() => { treeRef.current?.setActive(active); }, [active]);

  useEffect(() => {
    const root = rootRef.current;
    const tree = createPixelTree(canvasRef.current, about.nodes);
    treeRef.current = tree;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let ctx;

    if (reduce) {
      tree.setProgress(1);
      tree.setVisible(true);
    } else {
      const once = (trigger, start = "top 80%") => ({ trigger, start, once: true });
      ctx = gsap.context(() => {
        // 1. Headline words slide in one after another.
        gsap.from(".about-word", {
          opacity: 0, x: 20, duration: 0.8, ease: "power3.out", stagger: 0.06,
          scrollTrigger: once(".about-statement"),
        });
        // 2. Facts, closing line and buttons fade in.
        gsap.from(".about-fact, .about-closing, .about-cta", {
          opacity: 0, y: 14, duration: 0.8, ease: "power2.out", stagger: 0.1,
          scrollTrigger: once(".about-me"),
        });
        // 3. The tree grows from the trunk outwards, then the nodes appear.
        //    It replays every time it scrolls into view and resets once it is out of view.
        const p = { v: 0 };
        tree.setProgress(0);
        gsap.set(".about-node", { autoAlpha: 0 });
        const tl = gsap.timeline({ paused: true });
        tl.to(p, { v: 1, duration: 2.6, ease: "power1.inOut", onUpdate: () => tree.setProgress(p.v) }, 0)
          .to(".about-node", { autoAlpha: 1, duration: 0.5, ease: "power2.out", stagger: 0.18 }, 1.6);
        const replay = () => { tree.setVisible(true); tl.restart(); };
        const reset = () => {
          tl.pause(0);
          p.v = 0;
          tree.setProgress(0);
          tree.setVisible(false);
          gsap.set(".about-node", { autoAlpha: 0 });
          setActive(-1);
        };
        ScrollTrigger.create({
          trigger: ".about-tree",
          start: "top 75%",
          end: "bottom top",
          onEnter: replay,
          onEnterBack: replay,
          onLeave: reset,
          onLeaveBack: reset,
        });
      }, root);
    }

    // Web fonts change the layout, so re-measure once they are ready.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => { ctx?.revert(); tree.destroy(); treeRef.current = null; };
  }, []);

  return (
    <section id="about" className="about" aria-labelledby="about-title" ref={rootRef}>
      <div className="about-frame">
        <div className="about-me">
          <h2 id="about-title" className="about-statement" aria-label={about.headline}>
            {words.map((w, i) => (
              <span className="about-word" aria-hidden="true" key={i}>
                {w}{i < words.length - 1 ? "\u00A0" : ""}
              </span>
            ))}
          </h2>

          <dl className="about-facts">
            {about.facts.map((f) => (
              <div className="about-fact" key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.strong ? <b>{f.text}</b> : f.text}</dd>
              </div>
            ))}
          </dl>

          <p className="about-closing">
            {about.closing}<span className="about-caret" aria-hidden="true" />
          </p>

          <div className="about-cta">
            <span className="about-badge"><i className="about-ping" />{about.availability}</span>
            <div className="about-buttons">
              <a className="about-btn" href={about.resume.href} ref={resumeRef} target="_blank" rel="noopener noreferrer">
                {about.resume.label}
              </a>
            </div>
          </div>
        </div>

        <div className="about-side">
          <h3>{about.treeTitle}</h3>
          <p className="about-hint">{about.treeHint}</p>
          <div className="about-tree">
            <canvas className="about-canvas" ref={canvasRef} aria-hidden="true" />
            {about.nodes.map((n, i) => (
              <button
                type="button"
                className="about-node"
                key={n.label}
                aria-pressed={active === i}
                style={{ left: `${n.x}%`, top: `${n.y}%` }}
                onClick={() => setActive(i)}
              >
                <i /><span>{n.label}</span>
              </button>
            ))}
          </div>
          <div className="about-panel" aria-live="polite">
            <div className="about-panel-in" key={active}>
              <h4>{node ? node.label : about.panelIdle.title}</h4>
              <p>{node ? node.text : about.panelIdle.text}</p>
              {node?.pills && (
                <div className="about-pills">
                  {node.pills.map((p) => (p.href
                    ? <a key={p.label} href={p.href}>{p.label}</a>
                    : <span key={p.label}>{p.label}</span>))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
