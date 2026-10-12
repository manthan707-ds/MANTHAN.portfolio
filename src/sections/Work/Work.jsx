import { useCallback, useEffect, useRef, useState } from 'react'
import { PROJECTS, PROFILE } from '../../data/projects'
import './work.css'

/*
  <Work />  props (all optional)
  contactHref    where the "Contact" links go. Default: mailto. Use "#contact" to scroll to your Contact section.
  onModalChange  (open:boolean) => void. Called when the project panel opens or closes.
                 Use it to pause smooth scroll:  onModalChange={(o) => (o ? lenis.stop() : lenis.start())}
  syncHash       true = the URL shows #/work/<id> while a project is open, and that link opens it on load.
*/

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const n = PROJECTS.length
const RING = [...PROJECTS, ...PROJECTS] // every project twice so the ring always looks full
const N = RING.length
const isMobile = () => window.matchMedia('(max-width:649px)').matches
const prefersReduced = () => window.matchMedia('(prefers-reduced-motion:reduce)').matches

export default function Work({ contactHref = `mailto:${PROFILE.email}`, onModalChange, syncHash = false }) {
  const root = useRef(null)
  const hero = useRef(null)
  const stage = useRef(null)
  const cards = useRef([])
  const state = useRef({ pos: 0, target: 0, hold: 0, down: false, sx: 0, sp: 0, moved: 0, lx: 0, vx: 0, hover: false, visible: true, cw: 0, mob: null })
  const api = useRef({ go: () => {}, measure: () => {} })
  const ovRef = useRef(null)
  const panelRef = useRef(null)
  const closeBtn = useRef(null)
  const opener = useRef(null)
  const closeTimer = useRef(0)

  const [mode, setMode] = useState('featured')
  const [open, setOpen] = useState(null) // project index or null
  const [shown, setShown] = useState(false)
  const openRef = useRef(null)
  openRef.current = open
  const modeRef = useRef(mode)
  modeRef.current = mode
  const isOpen = open !== null

  /* ---------- carousel: endless ring, slow drift, drag, water ripple ---------- */
  useEffect(() => {
    const s = state.current
    const el = stage.current
    const reduce = prefersReduced()
    const list = () => cards.current.filter(Boolean)
    let raf = 0
    let last = performance.now()

    const go = (t) => { s.target = t; s.hold = performance.now() + 1800 }
    const measure = () => { const c = list()[0]; s.cw = c ? c.offsetWidth : 0 }
    api.current = { go, measure }

    function layout(t) {
      const c = list()
      if (!c.length) return
      if (isMobile()) {
        if (s.mob !== true) c.forEach((e) => { e.style.transform = ''; e.style.opacity = ''; e.style.zIndex = '' })
        s.mob = true
        return
      }
      s.mob = false
      if (!s.cw) return
      const step = s.cw * 1.01
      const R = s.cw * 2.3
      const lag = clamp(s.target - s.pos, -3, 3)
      const w = reduce ? 0 : 1
      c.forEach((e, i) => {
        let d = (((i - s.pos) % N) + N) % N
        if (d > N / 2) d -= N
        const a = Math.abs(d)
        const th = clamp((d * step) / R, -1.4, 1.4)
        const ph = t * 0.0016 + d * 0.95
        const x = R * Math.sin(th)
        const z = -R * (1 - Math.cos(th)) + Math.sin(t * 0.0013 + d * 0.8) * 26 * w
        const y = -lag * 55 * Math.sin(d * 0.85 - lag * 0.6) + (Math.sin(ph) * 15 + Math.sin(t * 0.0009 - d * 1.7) * 8) * w
        e.style.transform =
          `translate(-50%,-50%) translate3d(${x}px,${y}px,${z}px) rotateY(${th * 57.3}deg) ` +
          `rotateX(${Math.cos(ph) * 2.2 * w}deg) rotateZ(${-lag * 2.2 * Math.cos(d * 0.8) + Math.cos(ph) * 1.6 * w}deg)`
        e.style.opacity = clamp((3.8 - a) * 0.9, 0, 1)
        e.style.zIndex = 100 - Math.round(a * 10)
      })
    }

    function tick(now) {
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016)
      last = now
      // work only while the carousel is on screen, in Featured view, and no project panel is open
      if (s.visible && openRef.current === null && modeRef.current === 'featured') {
        if (!s.down && !reduce && !s.hover && now > s.hold) s.target += dt * 0.22 // slow drift, paused while hovering
        s.pos += (s.target - s.pos) * (1 - Math.exp(-dt * (s.down ? 16 : 6.5)))
        layout(now)
      }
      raf = requestAnimationFrame(tick)
    }

    const stepPx = () => (s.cw || 500) * 1.05
    const onDown = (e) => {
      if (isMobile() || (e.pointerType === 'mouse' && e.button !== 0)) return
      s.down = true; s.sx = s.lx = e.clientX; s.sp = s.target; s.moved = 0; s.vx = 0
      el.classList.add('is-drag')
    }
    const onMove = (e) => {
      if (!s.down) return
      s.moved = Math.max(s.moved, Math.abs(e.clientX - s.sx))
      s.vx = e.clientX - s.lx; s.lx = e.clientX
      go(s.sp - (e.clientX - s.sx) / stepPx())
    }
    const onUp = () => {
      if (!s.down) return
      s.down = false
      el.classList.remove('is-drag')
      go(Math.round(s.target - (s.vx / stepPx()) * 3))
    }
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { e.preventDefault(); go(s.target + e.deltaX / 420) }
    }
    const onEnter = (e) => { if (e.pointerType === 'mouse') s.hover = true }
    const onLeave = () => { s.hover = false }
    const onKey = (e) => {
      if (openRef.current !== null || !s.visible || modeRef.current !== 'featured') return
      const t = e.target
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return
      if (e.key === 'ArrowRight') go(Math.round(s.target) + 1)
      if (e.key === 'ArrowLeft') go(Math.round(s.target) - 1)
    }
    const onResize = () => measure()

    const io = new IntersectionObserver(([en]) => { s.visible = en.isIntersecting }, { threshold: 0 })
    if (hero.current) io.observe(hero.current)

    measure()
    layout(performance.now())
    raf = requestAnimationFrame(tick)
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('pointerenter', onEnter)
    el.addEventListener('pointerleave', onLeave)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('pointerenter', onEnter)
      el.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  // the stage has no size while hidden (Full view), so measure again when it comes back
  useEffect(() => { api.current.measure() }, [mode])

  /* ---------- scroll reveal ---------- */
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((x) => { if (x.isIntersecting) { x.target.classList.add('is-in'); io.unobserve(x.target) } }),
      { threshold: 0.2 }
    )
    root.current.querySelectorAll('.w-rv').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  /* ---------- project panel ---------- */
  const close = useCallback(() => {
    setShown(false)
    clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpen(null), 420)
  }, [])

  const openProject = (i, from) => {
    clearTimeout(closeTimer.current)
    opener.current = from || document.activeElement
    setOpen(i)
  }

  const nextProject = () => {
    setOpen((i) => (i + 1) % n)
    panelRef.current?.scrollTo({ top: 0, behavior: prefersReduced() ? 'auto' : 'smooth' })
  }

  useEffect(() => {
    if (!isOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    if (onModalChange) onModalChange(true)
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => {
      setShown(true)
      if (closeBtn.current) closeBtn.current.focus({ preventScroll: true })
    }))
    const onKey = (e) => {
      if (e.key === 'Escape') { close(); return }
      if (e.key !== 'Tab' || !ovRef.current) return
      const f = [...ovRef.current.querySelectorAll('a[href],button:not([disabled])')]
      if (!f.length) return
      const first = f[0]
      const lastEl = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus() }
      else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      if (onModalChange) onModalChange(false)
      if (opener.current && opener.current.focus) opener.current.focus({ preventScroll: true })
    }
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  // optional: #/work/<id> in the address bar
  useEffect(() => {
    if (!syncHash) return
    const m = location.hash.match(/^#\/work\/(.+)$/)
    if (m) { const i = PROJECTS.findIndex((p) => p.id === m[1]); if (i >= 0) setOpen(i) }
  }, [syncHash])
  useEffect(() => {
    if (!syncHash) return
    try {
      if (open !== null) history.replaceState(null, '', '#/work/' + PROJECTS[open].id)
      else if (location.hash.startsWith('#/work/')) history.replaceState(null, '', location.pathname + location.search)
    } catch (e) { /* ignore */ }
  }, [open, syncHash])

  useEffect(() => () => clearTimeout(closeTimer.current), [])

  const onCard = (i) => {
    const s = state.current
    if (s.moved > 6) return // that was a drag, not a click
    let d = (((i - s.pos) % N) + N) % N
    if (d > N / 2) d -= N
    if (isMobile() || Math.abs(d) < 0.5) openProject(i % n, cards.current[i])
    else api.current.go(Math.round(s.pos) + Math.round(d))
  }

  const p = isOpen ? PROJECTS[open] : null

  return (
    <section ref={root} id="work" className="work" data-mode={mode} aria-label="Selected work">
      <div className="w-hero" ref={hero}>
        <div className="w-bar w-bar--top">
          <a className="w-label" href="#">{PROFILE.name}</a>
          <a className="w-label" href={contactHref}>Contact</a>
        </div>

        <div className="w-intro">
          <h1>Selected Work</h1>
          <p>A collection of projects where data, machine learning, and AI meet real-world problem-solving. Every project is an opportunity to experiment, build, and improve.</p>
        </div>

        <div className="w-stage" ref={stage}>
          <div className="w-floor" />
          {RING.map((pr, i) => {
            const dup = i >= n
            return (
              <article
                key={i}
                ref={(e) => (cards.current[i] = e)}
                className="w-card"
                role="button"
                tabIndex={dup ? -1 : 0}
                aria-hidden={dup || undefined}
                aria-label={dup ? undefined : `${pr.title}. Open project`}
                data-look={pr.look}
                data-dup={dup ? '1' : undefined}
                onClick={() => onCard(i)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProject(i % n, e.currentTarget) } }}
              >
                <span className="w-num" aria-hidden="true">{String((i % n) + 1).padStart(2, '0')}</span>
                <span className="w-tag w-label">{pr.cat[0]}</span>
                <p className="w-cap"><span className="w-title">{pr.title}</span><span className="w-go" aria-hidden="true">↗</span></p>
              </article>
            )
          })}
        </div>

        <div className="w-list">
          {PROJECTS.map((pr, i) => (
            <button key={pr.id} type="button" className="w-row" onClick={(e) => openProject(i, e.currentTarget)}>
              <span className="w-label">{String(i + 1).padStart(2, '0')}</span>
              <span className="w-rt">{pr.title}</span>
              <span className="w-label w-rc">{pr.cat[0]}</span>
              <span className="w-label w-rs">{pr.status}</span>
            </button>
          ))}
        </div>

        <div className="w-bar">
          <nav className="w-nav w-label" aria-label="Project views">
            <button type="button" className={mode === 'featured' ? '' : 'w-off'} aria-pressed={mode === 'featured'} onClick={() => setMode('featured')}>Featured</button>
            <span aria-hidden="true">/</span>
            <button type="button" className={mode === 'full' ? '' : 'w-off'} aria-pressed={mode === 'full'} onClick={() => setMode('full')}>Full</button>
          </nav>
          <span className="w-label w-hint">Drag or use arrow keys</span>
          <a className="w-label" href={PROFILE.github} target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
      </div>

      <div className="w-sec w-sec--tight">
        <h2 className="w-rv">What's Next?</h2>
        <p className="w-sub w-rv">I'm currently expanding my skills in Deep Learning, LLM applications, RAG pipelines, and AI systems. More experiments and projects are on the way.</p>
        <p className="w-big w-rv">Interested in collaborating or discussing a project? Let's build something meaningful.</p>
        <div className="w-ctas w-rv">
          <a className="w-btn w-btn--main" href={contactHref}>Contact Me</a>
          <a className="w-btn" href={PROFILE.github} target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
      </div>

      {p && (
        <div
          ref={ovRef}
          className={`w-ov is-on${shown ? ' is-show' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="work-panel-title"
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          <div className="w-panel" ref={panelRef}>
            <div className="w-pl" key={`l${open}`}>
              <h2 id="work-panel-title">{p.title}</h2>
              <p className="w-d">{p.desc}</p>
              <div className="w-pills">
                {p.links.map(([label, url]) =>
                  url === '#'
                    ? <span key={label} className="w-btn w-off">{label} · soon</span>
                    : <a key={label} className="w-btn" href={url} target="_blank" rel="noopener noreferrer">{label} ↗</a>
                )}
              </div>
              <div className="w-pills">
                <span className="w-pill w-pill--hot">{p.status}</span>
                {p.cat.map((c) => <span key={c} className="w-pill">{c}</span>)}
              </div>
              <p className="w-lb w-label">Tech stack</p>
              <div className="w-pills w-pills--tight">
                {p.tech.map((t) => <span key={t} className="w-pill">{t}</span>)}
              </div>
            </div>
            <div className="w-media" key={`m${open}`}>
              {p.media.map((m, k) => (
                <div key={m} className="w-shot" data-look={p.look}>
                  {p.images && p.images[k]
                    ? <img src={p.images[k]} alt={`${p.title}: ${m}`} loading="lazy" />
                    : <span className="w-label">{m}</span>}
                </div>
              ))}
            </div>
            <button type="button" className="w-next" key={`n${open}`} onClick={nextProject}>
              <span className="w-label">Next project</span>
              <span className="w-nt">{PROJECTS[(open + 1) % n].title}</span>
            </button>
          </div>
          <button ref={closeBtn} type="button" className="w-x" onClick={close} aria-label="Close project">✕</button>
        </div>
      )}
    </section>
  )
}
