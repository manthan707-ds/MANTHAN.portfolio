import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CONTACT, ENDPOINTS } from "../../data/contact";
import { INTRO_MESSAGES, SUGGESTIONS, KB, OFF_TOPIC, REFUSAL, FALLBACK, ERROR_TEXT } from "../../data/assistant";
import { createRenderer } from "./ringRenderer";
import "./ContactAssistant.css";

/*
  Contact + Assistant section.

  <ContactAssistant />              a full-height section inside your page
  <ContactAssistant fullscreen />   covers the whole screen (use it on its own /contact route)

  Props
    fullscreen   (false)  fixed full-screen overlay instead of an in-page section
    captureWheel (false)  vertical mouse wheel also moves the cards (leave off inside a scrolling page)
    className    ""       extra class on the root element
*/

const ARROW = (
  <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
    <path d="M1 6h9M6.5 2.5 10 6l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const SEND_ICON = (
  <svg viewBox="0 0 12 12" width="14" height="14" aria-hidden="true">
    <path d="M1 6h9M6.5 2.5 10 6l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const CLOSE_ICON = (
  <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
    <path d="M2 2l8 8M10 2l-8 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function replay(el, cls) {
  if (!el) return;
  el.classList.remove(cls);
  void el.offsetWidth; // restart the CSS animation
  el.classList.add(cls);
}
function scriptedReply(q) {
  if (OFF_TOPIC.test(q)) return { a: REFUSAL };
  for (const k of KB) if (k.match.test(q)) return { a: k.answer, go: k.go };
  return { a: FALLBACK };
}
async function remoteReply(history) {
  const res = await fetch(ENDPOINTS.chat, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: history }),
  });
  if (!res.ok) throw new Error("chat request failed");
  const data = await res.json();
  return { a: String(data.reply || "").trim() || FALLBACK, go: data.go };
}

function buildDecks() {
  const contact = [
    { top: "Message", big: "Contact me", detail: "Send me a message", light: true, act: { t: "form" } },
    { top: "Direct", big: "Email", detail: CONTACT.email, act: { t: "copy", v: CONTACT.email } },
    { top: "Social", big: "LinkedIn", detail: CONTACT.handles.linkedin, light: true, act: { t: "link", v: CONTACT.links.linkedin } },
    { top: "Code", big: "GitHub", detail: CONTACT.handles.github, act: { t: "link", v: CONTACT.links.github } },
  ];
  if (CONTACT.links.resume) contact.push({ top: "Document", big: "Resume", detail: "Open the PDF", light: true, act: { t: "link", v: CONTACT.links.resume } });
  const assistant = SUGGESTIONS.map((s) => ({ top: "Ask", big: s.label, detail: s.question, light: !!s.light, act: { t: "ask", v: s.question } }));
  return { contact, assistant };
}

export default function ContactAssistant({ fullscreen = false, captureWheel = false, className = "", startView = null, onClose = null }) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const DECKS = useMemo(buildDecks, []);

  // ---------- refs ----------
  const rootRef = useRef(null), stageRef = useRef(null), floorRef = useRef(null), ringRef = useRef(null), railRef = useRef(null);
  const contactRef = useRef(null), chatRef = useRef(null), logRef = useRef(null);
  const nameRef = useRef(null), honeyRef = useRef(null), toastTimer = useRef(0), alive = useRef(true);
  const cardEls = useRef([]);
  const S = useRef(null);
  if (!S.current) {
    S.current = {
      cur: 0, target: 0, prev: 0, vel: 0, dragging: false, captured: false, pid: 0, lastP: 0, dragTotal: 0, lastInput: 0,
      hover: -1, h: [], mx: 0, my: 0, tmx: 0, tmy: 0,
      vw: 0, vh: 0, dpr: 1, vertical: false, D: 700, T: 30, cx: 0, cy: 0, Rc: 800, pitch: 400,
      born: 0, popAt: -1e9, ringOn: false, ringVis: 0, view: "contact", n: DECKS.contact.length,
      busy: false, visible: true, reduced: false, accent: "#D8B4FD", disc: "#000000", captureWheel, fullscreen,
    };
  }
  S.current.captureWheel = captureWheel;
  S.current.fullscreen = fullscreen;

  // ---------- state ----------
  const [view, setView] = useState("contact");          // which panel/deck is active
  const [deckView, setDeckView] = useState("contact");  // deck currently drawn (lags a moment so it can fade)
  const [ringOn, setRingOn] = useState(false);
  const [swap, setSwap] = useState(false);
  const [hintGone, setHintGone] = useState(false);
  const [toast, setToast] = useState({ text: "", on: false });

  const [fields, setFields] = useState({ name: "", email: "", message: "" });
  const [bad, setBad] = useState({});
  const [status, setStatus] = useState({ text: "", err: false });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(null);

  const [messages, setMessages] = useState(INTRO_MESSAGES);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // ---------- helpers ----------
  const showToast = useCallback((text) => {
    setToast({ text, on: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, on: false })), 2400);
  }, []);

  const copy = useCallback((text) => {
    const ok = () => showToast("Copied " + text);
    const fail = () => showToast("Copy is blocked here. The address is " + text);
    try { navigator.clipboard.writeText(text).then(ok, fail); } catch (e) { fail(); }
  }, [showToast]);

  const openRing = useCallback((v) => {
    const s = S.current;
    if (!s.ringOn) { s.ringOn = true; s.born = performance.now(); setRingOn(true); }
    if (v !== s.view) { s.view = v; s.popAt = performance.now(); setView(v); }
  }, []);

  const closeRing = useCallback(() => {
    const s = S.current;
    s.ringOn = false; setRingOn(false);
    setDone(null); setFields({ name: "", email: "", message: "" }); setBad({}); setStatus({ text: "", err: false });
    if (s.view !== "contact") { s.view = "contact"; s.popAt = performance.now(); setView("contact"); }
    if (onCloseRef.current) onCloseRef.current();
  }, []);

  const openForm = useCallback(() => {
    openRing("contact");
    setTimeout(() => nameRef.current && nameRef.current.focus(), 380);
  }, [openRing]);

  // startView="assistant" (or "contact") opens the ring as soon as the component mounts (used by the floating button)
  useEffect(() => {
    if (!startView) return undefined;
    const t = setTimeout(() => openRing(startView), 250);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const ask = useCallback(async (raw) => {
    const q = (raw || "").trim();
    const s = S.current;
    if (!q || s.busy) return;
    s.busy = true;
    openRing("assistant");
    const history = messagesRef.current.filter((m) => !m.intro).map((m) => ({ role: m.who === "me" ? "user" : "assistant", content: m.text }));
    history.push({ role: "user", content: q });
    setMessages((m) => [...m, { who: "me", text: q }]);
    setTyping(true);
    let r;
    try {
      if (ENDPOINTS.chat) r = await remoteReply(history.slice(-10));
      else { await sleep(s.reduced ? 0 : 750); r = scriptedReply(q); }
    } catch (e) {
      r = { a: ERROR_TEXT };
    }
    if (!alive.current) return;
    setTyping(false);
    setMessages((m) => [...m, { who: "bot", text: "" }]);
    const words = r.a.split(" ");
    for (let n = 1; n <= words.length; n++) {
      if (n > 1) await sleep(s.reduced ? 0 : 32);
      if (!alive.current) return;
      const text = words.slice(0, n).join(" ");
      setMessages((m) => { const c = m.slice(); c[c.length - 1] = { ...c[c.length - 1], text }; return c; });
    }
    if (r.go) setMessages((m) => { const c = m.slice(); c[c.length - 1] = { ...c[c.length - 1], go: r.go }; return c; });
    s.busy = false;
  }, [openRing]);

  const run = useCallback((a) => {
    if (a.t === "copy") copy(a.v);
    else if (a.t === "link") { if (a.v) window.open(a.v, "_blank", "noopener"); else showToast("That link is empty. Add it in data/contact.js."); }
    else if (a.t === "form") openForm();
    else if (a.t === "ask") ask(a.v);
  }, [copy, openForm, ask, showToast]);

  // ---------- contact form ----------
  const setField = (k) => (e) => {
    const v = e.target.value;
    setFields((f) => ({ ...f, [k]: v }));
    setBad((b) => ({ ...b, [k]: false }));
    setStatus({ text: "", err: false });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (honeyRef.current && honeyRef.current.value) return; // bots fill the hidden field
    if (sending) return;
    const name = fields.name.trim(), email = fields.email.trim(), message = fields.message.trim();
    const okName = name.length >= 2;
    const okMail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
    const okMsg = message.length >= 10;
    setBad({ name: !okName, email: !okMail, message: !okMsg });
    if (!okName) { setStatus({ text: "Add your name so Manthan knows who to reply to.", err: true }); return; }
    if (!okMail) { setStatus({ text: "That email address looks incomplete.", err: true }); return; }
    if (!okMsg) { setStatus({ text: "Write at least a sentence so the message makes sense.", err: true }); return; }
    setSending(true); setStatus({ text: "Sending", err: false });
    try {
      if (ENDPOINTS.contact) {
        const res = await fetch(ENDPOINTS.contact, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, message }),
        });
        if (!res.ok) throw new Error("contact request failed");
      } else {
        await sleep(1100); // preview mode: nothing is sent
      }
      if (!alive.current) return;
      setStatus({ text: "", err: false });
      setDone({ first: name.split(/\s+/)[0] });
    } catch (err) {
      setStatus({ text: "Could not send. Please email me directly instead.", err: true });
    } finally {
      if (alive.current) setSending(false);
    }
  };

  const sendAnother = () => { setDone(null); setFields({ name: "", email: "", message: "" }); setBad({}); setTimeout(() => nameRef.current && nameRef.current.focus(), 60); };

  const onChat = (e) => { e.preventDefault(); const v = input; setInput(""); ask(v); };
  const tap = (e) => replay(e.currentTarget, "ca-tap");

  // ---------- panel visibility ----------
  useEffect(() => {
    const c = ringOn && view === "contact", a = ringOn && view === "assistant";
    if (contactRef.current) contactRef.current.toggleAttribute("inert", !c);
    if (chatRef.current) chatRef.current.toggleAttribute("inert", !a);
  }, [ringOn, view]);

  useEffect(() => {
    if (!ringOn) return;
    replay(view === "contact" ? contactRef.current : chatRef.current, "ca-pop");
  }, [ringOn, view]);

  // swap the card deck with a short fade when the view changes
  useEffect(() => {
    if (view === deckView) { setSwap(false); return; }
    setSwap(true);
    const t = setTimeout(() => {
      const s = S.current;
      s.n = DECKS[view].length; s.h = [];
      setDeckView(view);
      s.cur = s.target + (s.vertical ? 300 : 520);
      setSwap(false);
      requestAnimationFrame(() => replay(railRef.current, "ca-pop"));
    }, 230);
    return () => clearTimeout(t);
  }, [view, deckView, DECKS]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages, typing]);

  // ---------- animation loop, layout, input ----------
  useEffect(() => {
    alive.current = true;
    const st = S.current, root = rootRef.current, stage = stageRef.current;
    const renderer = createRenderer(floorRef.current, ringRef.current);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    st.reduced = mq.matches;
    const onMq = () => { st.reduced = mq.matches; };
    mq.addEventListener && mq.addEventListener("change", onMq);

    function readColors() {
      const cs = getComputedStyle(root);
      const a = cs.getPropertyValue("--ca-accent").trim(), d = cs.getPropertyValue("--ca-disc").trim();
      if (/^#[0-9a-f]{3,6}$/i.test(a)) st.accent = a;
      if (/^#[0-9a-f]{3,6}$/i.test(d)) st.disc = d;
    }

    function resize() {
      st.vw = stage.clientWidth; st.vh = stage.clientHeight;
      if (!st.vw || !st.vh) return;
      st.dpr = Math.min(window.devicePixelRatio || 1, 2);
      const vw = st.vw, vh = st.vh;
      st.vertical = vw < 650;
      st.D = st.vertical ? Math.min(vw * 0.98, vh * 0.56) : Math.min(vh * 0.86, vw * 0.62, 880);
      st.T = st.D * 0.042;
      st.cx = vw / 2; st.cy = vh * 0.5;
      const din = st.D - 2 * st.T;
      const fs = Math.max(12, Math.min(16, st.D * 0.0195));
      let cardsW, cardsH;
      if (st.vertical) { cardsW = Math.min(vw * 0.8, 340); cardsH = Math.min(vh * 0.19, 150); st.Rc = vh * 0.8; st.pitch = cardsH + 44; }
      else { cardsH = Math.max(210, Math.min(vh * 0.4, 360)); cardsW = cardsH * 1.45; st.Rc = vw * 0.85; st.pitch = cardsW + 70; }
      const set = (k, v) => root.style.setProperty(k, v);
      set("--ca-fs", fs.toFixed(2) + "px");
      set("--ca-cx", st.cx + "px"); set("--ca-cy", st.cy + "px");
      set("--ca-pw", (din * (st.vertical ? 0.82 : 0.74)).toFixed(0) + "px");
      set("--ca-logh", (din * (st.vertical ? 0.40 : 0.44)).toFixed(0) + "px");
      set("--ca-cw", cardsW + "px"); set("--ca-ch", cardsH + "px");
      renderer.size(st);
      readColors();
    }

    function updateCards(dt) {
      const n = st.n, L = n * st.pitch;
      for (let i = 0; i < n; i++) {
        const el = cardEls.current[i];
        if (!el) continue;
        let p = (((i * st.pitch - st.cur) % L) + L) % L;
        if (p > L / 2) p -= L;
        const th = p / st.Rc, ath = Math.abs(th);
        const tgt = st.hover === i && !st.dragging ? 1 : 0;
        st.h[i] = (st.h[i] || 0) + (tgt - (st.h[i] || 0)) * Math.min(1, dt / 120);
        const op = ath < 0.7 ? 1 : Math.max(0, 1 - (ath - 0.7) / 0.45);
        const z = st.Rc * (Math.cos(th) - 1), sc = 1 + st.h[i] * 0.05;
        const x = (st.Rc * Math.sin(th)).toFixed(1), zz = z.toFixed(1);
        el.style.transform = st.vertical
          ? "translate3d(0," + x + "px," + zz + "px) rotateX(" + th.toFixed(4) + "rad) scale(" + sc.toFixed(3) + ")"
          : "translate3d(" + x + "px,0," + zz + "px) rotateY(" + (-th).toFixed(4) + "rad) scale(" + sc.toFixed(3) + ")";
        el.style.zIndex = String(100 - Math.round(ath * 40));
        el.style.opacity = op.toFixed(2);
        el.style.visibility = op < 0.02 ? "hidden" : "visible";
      }
    }

    let raf = 0, last = performance.now();
    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(64, now - last); last = now;
      if (document.hidden || !st.visible || !st.vw) return;
      st.mx += (st.tmx - st.mx) * 0.06; st.my += (st.tmy - st.my) * 0.06;
      if (!st.dragging && !st.reduced && now - st.lastInput > 2500) st.target += dt * 0.018;
      st.prev = st.cur; st.cur += (st.target - st.cur) * (st.reduced ? 1 : 1 - Math.exp(-dt / 140)); st.vel = st.cur - st.prev;
      st.ringVis += ((st.ringOn ? 1 : 0) - st.ringVis) * (st.reduced ? 1 : 1 - Math.exp(-dt / 120));
      if (!st.ringOn && st.ringVis < 0.002) st.ringVis = 0;
      updateCards(dt);
      renderer.drawFloor(st);
      renderer.drawRing(now, st);
    }

    // start with the first card centred and slide the rail in
    resize();
    st.target = 0;
    st.cur = st.target + (st.reduced ? 0 : (st.vertical ? 420 : 820));
    raf = requestAnimationFrame(frame);

    const ro = new ResizeObserver(resize); ro.observe(stage);
    const io = new IntersectionObserver((entries) => { st.visible = entries[0].isIntersecting; last = performance.now(); });
    io.observe(stage);

    const onWheel = (e) => {
      if (e.target.closest && e.target.closest(".ca-log")) return;
      const horiz = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      if (!horiz && !st.captureWheel) return; // let the page scroll normally
      st.target += (horiz ? e.deltaX : e.deltaY) * 0.9; st.lastInput = performance.now(); setHintGone(true);
    };
    stage.addEventListener("wheel", onWheel, { passive: true });

    const onKey = (e) => {
      if (e.key === "Escape" && st.ringOn) { closeRing(); return; }
      if (e.target.closest && e.target.closest("input, textarea")) return;
      if (!st.fullscreen && !(root.contains(document.activeElement))) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") st.target += st.pitch;
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") st.target -= st.pitch;
    };
    window.addEventListener("keydown", onKey);

    return () => {
      alive.current = false;
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      stage.removeEventListener("wheel", onWheel); window.removeEventListener("keydown", onKey);
      mq.removeEventListener && mq.removeEventListener("change", onMq);
      clearTimeout(toastTimer.current);
    };
  }, []);

  // ---------- pointer drag on the stage ----------
  const axis = (e) => (S.current.vertical ? e.clientY : e.clientX);
  const onPointerDown = (e) => {
    if (e.target.closest("[data-nodrag], .ca-pill, .ca-send, .ca-switch, .ca-cbtn, .ca-close, .ca-ghost")) return;
    const s = S.current;
    s.dragging = true; s.captured = false; s.pid = e.pointerId; s.dragTotal = 0; s.lastP = axis(e); s.lastInput = performance.now();
  };
  const onPointerMove = (e) => {
    const s = S.current;
    s.tmx = (e.clientX - e.currentTarget.getBoundingClientRect().left) / s.vw * 2 - 1;
    s.tmy = (e.clientY - e.currentTarget.getBoundingClientRect().top) / s.vh * 2 - 1;
    if (!s.dragging) return;
    const p = axis(e), d = p - s.lastP; s.lastP = p; s.dragTotal += Math.abs(d); s.target -= d * 1.15; s.lastInput = performance.now();
    // capture the pointer only once it is a real drag, so a plain click still reaches the card
    if (!s.captured && s.dragTotal > 5) {
      s.captured = true; e.currentTarget.classList.add("ca-grabbing"); setHintGone(true);
      try { e.currentTarget.setPointerCapture(s.pid); } catch (x) { /* ignore */ }
    }
  };
  const endDrag = (e) => {
    const s = S.current;
    if (!s.dragging) return;
    s.dragging = false; s.captured = false; e.currentTarget.classList.remove("ca-grabbing");
    setTimeout(() => { s.dragTotal = 0; }, 30);
  };

  // ---------- render ----------
  const deck = DECKS[deckView];
  const contactOff = !(ringOn && view === "contact");
  const chatOff = !(ringOn && view === "assistant");

  return (
    <div ref={rootRef} className={"ca" + (fullscreen ? " ca-full" : "") + (className ? " " + className : "")}>
      <div
        ref={stageRef}
        className="ca-stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <canvas ref={floorRef} className="ca-floor" aria-hidden="true" />
        <div ref={railRef} className={"ca-rail" + (swap ? " ca-swap" : "")} role="group" aria-label="Shortcuts. Drag sideways to browse.">
          {deck.map((c, i) => (
            <button
              key={deckView + i}
              ref={(el) => { cardEls.current[i] = el; }}
              type="button"
              className={"ca-card" + (c.light ? " ca-light" : "")}
              aria-label={c.big + ": " + c.detail}
              onClick={() => { if (S.current.dragTotal > 6) return; run(c.act); }}
              onPointerEnter={(e) => { if (e.pointerType === "mouse") S.current.hover = i; }}
              onPointerLeave={() => { if (S.current.hover === i) S.current.hover = -1; }}
            >
              <span className="ca-c-top">{c.top}</span>
              <span className="ca-c-big">{c.big}</span>
              <span className="ca-c-bot"><span className="ca-c-detail">{c.detail}</span><span className="ca-c-go">{ARROW}</span></span>
            </button>
          ))}
        </div>
        <canvas ref={ringRef} className="ca-ringc" aria-hidden="true" />

        {/* Contact panel (inside the ring) */}
        <section ref={contactRef} className={"ca-panel" + (contactOff ? " ca-off" : "")} aria-label="Contact">
          {done ? (
            <div className="ca-done">
              <h2>Thank you, {done.first}.</h2>
              <p>Your message is on its way. A reply goes to the address you gave.</p>
              {!ENDPOINTS.contact && <p className="ca-tag">Preview mode: nothing was actually sent</p>}
              <button className="ca-ghost" type="button" data-nodrag onClick={sendAnother}>Send another</button>
            </div>
          ) : (
            <>
              <p className="ca-lede">Have a project, an internship or a question? Send a message and I will reply.</p>
              <form className="ca-form" noValidate data-nodrag onSubmit={onSubmit}>
                <div className="ca-two">
                  <label className="ca-pill" data-invalid={bad.name ? "true" : "false"}>
                    <span className="ca-sr">Your name</span>
                    <input ref={nameRef} name="name" type="text" autoComplete="name" placeholder="Your name" maxLength={80}
                      value={fields.name} onChange={setField("name")} aria-invalid={bad.name ? "true" : "false"} />
                  </label>
                  <label className="ca-pill" data-invalid={bad.email ? "true" : "false"}>
                    <span className="ca-sr">Your email</span>
                    <input name="email" type="email" autoComplete="email" autoCapitalize="off" spellCheck={false} placeholder="Email address" maxLength={120}
                      value={fields.email} onChange={setField("email")} aria-invalid={bad.email ? "true" : "false"} />
                  </label>
                </div>
                <div className="ca-msgrow">
                  <label className="ca-pill" data-invalid={bad.message ? "true" : "false"}>
                    <span className="ca-sr">Message</span>
                    <textarea name="message" rows={2} placeholder="What would you like to talk about?" maxLength={1200}
                      value={fields.message} onChange={setField("message")} aria-invalid={bad.message ? "true" : "false"} />
                  </label>
                  <button className="ca-send" type="submit" aria-label="Send message" disabled={sending} aria-busy={sending ? "true" : undefined}>{SEND_ICON}</button>
                </div>
                <input ref={honeyRef} className="ca-honey" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              </form>
              <p className={"ca-status" + (status.err ? " ca-err" : "")} role="status" aria-live="polite">{status.text}</p>
              <p className="ca-alt">Or copy the address: <button type="button" data-nodrag onClick={() => copy(CONTACT.email)}>{CONTACT.email}</button></p>
            </>
          )}
        </section>

        {/* Assistant panel (inside the ring) */}
        <section ref={chatRef} className={"ca-panel" + (chatOff ? " ca-off" : "")} aria-label="Assistant">
          <p className="ca-tag">{ENDPOINTS.chat ? "Assistant" : "Preview \u00b7 scripted replies"}</p>
          <div ref={logRef} className="ca-log" role="log" aria-live="polite" tabIndex={0} aria-label="Conversation" data-nodrag>
            {messages.map((m, i) => (
              <div key={i} className={"ca-msg ca-" + m.who}>
                {m.text}
                {m.go && (<><br /><button type="button" className="ca-ghost ca-go" onClick={() => openRing("contact")}>{m.go}</button></>)}
              </div>
            ))}
            {typing && (<div className="ca-msg ca-bot ca-typing" aria-label="Typing"><i /><i /><i /></div>)}
          </div>
          <form className="ca-chatrow" autoComplete="off" data-nodrag onSubmit={onChat}>
            <label className="ca-pill">
              <span className="ca-sr">Your question</span>
              <input type="text" maxLength={280} placeholder="Ask a question" enterKeyHint="send" value={input} onChange={(e) => setInput(e.target.value)} />
            </label>
            <button className="ca-send" type="submit" aria-label="Send question">{SEND_ICON}</button>
          </form>
        </section>

        {/* Corner controls */}
        <div className="ca-ui">
          <div className="ca-row">
            <span className="ca-label">{CONTACT.name}</span>
            {ringOn ? (
              <button type="button" className="ca-label ca-close" aria-label={view === "assistant" ? "Close the assistant" : "Close the message form"} onClick={(e) => { tap(e); closeRing(); }}>{CLOSE_ICON}</button>
            ) : (
              <button type="button" className="ca-label ca-cbtn" onClick={(e) => { tap(e); openForm(); }}>Contact</button>
            )}
          </div>
          <div className="ca-row ca-bottom">
            <button type="button" className="ca-label ca-switch" aria-label={view === "contact" ? "Open the assistant" : "Open the message form"}
              onClick={(e) => { tap(e); if (view === "contact") openRing("assistant"); else openForm(); }}>
              {view === "contact" ? "Assistant" : "Contact"}
            </button>
          </div>
        </div>
        <p className={"ca-label ca-hint" + (hintGone ? " ca-gone" : "")}>Drag the cards</p>
      </div>
      <div className={"ca-toast" + (toast.on ? " ca-on" : "")} role="status" aria-live="polite">{toast.text}</div>
    </div>
  );
}
