import { useCallback, useEffect, useRef, useState } from 'react'
import { PROJECTS, PROFILE } from '../../data/projects'
import './work.css'

/*
  <Work />  props (all optional)
  contactHref    where the "Contact" links go. Default: mailto. Use "#contact" to scroll to your Contact section.
  onModalChange  (open:boolean) => void. Called when the project panel opens or closes.
                 Use it to pause smooth scroll:  onModalChange={(o) => (o ? lenis.stop() : lenis.start())}
  syncHash       true (default) = the URL shows #/work/<id> while a project is open, and that link opens it on load.

  Optional project fields used by the panel (see src/data/projects.js): accent, images, metrics, role, highlight,
  who, problem, approach, does, decisions, challenge, learned, tryText, samples, note, compare.
  Anything missing is simply not shown.
*/

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const n = PROJECTS.length
const RING = [...PROJECTS, ...PROJECTS] // every project twice so the ring always looks full
const N = RING.length
const isMobile = () => window.matchMedia('(max-width:649px)').matches
const prefersReduced = () => window.matchMedia('(prefers-reduced-motion:reduce)').matches

const hostOf = (u) => { try { return new URL(u).host } catch (e) { return '' } }
const liveOf = (p) => {
  const l = p.links.find(([lb, u]) => lb === 'Live Demo' && u !== '#') || p.links.find(([, u]) => u !== '#')
  return l ? l[1] : null
}
const wordsOf = (p) => [p.desc, p.problem, p.approach, p.challenge, p.learned, p.who, p.highlight, p.note, ...(p.does || []), ...(p.decisions || [])]
  .filter(Boolean).join(' ').split(/\s+/).length
const abbr = (x) => { const w = x.split(/\s+/); return w.length > 1 ? w.map((y) => y[0]).join('').slice(0, 2) : x.slice(0, 2) }

function copyText(text) {
  try { if (navigator.clipboard) return navigator.clipboard.writeText(text) } catch (e) { /* fall through */ }
  const a = document.createElement('textarea')
  a.value = text; a.style.position = 'fixed'; a.style.opacity = '0'
  document.body.appendChild(a); a.select()
  try { document.execCommand('copy') } catch (e) { /* ignore */ }
  a.remove()
  return Promise.resolve()
}

function CopyBtn({ text, label, className, title }) {
  const [ok, setOk] = useState(false)
  const t = useRef(0)
  useEffect(() => () => clearTimeout(t.current), [])
  return (
    <button
      type="button"
      className={`${className}${ok ? ' is-ok' : ''}`}
      title={title}
      onClick={() => { copyText(text); setOk(true); clearTimeout(t.current); t.current = setTimeout(() => setOk(false), 1400) }}
    >
      {ok ? 'Copied ✓' : label}
    </button>
  )
}

function CountUp({ value }) {
  const ref = useRef(null)
  useEffect(() => {
    const num = parseInt(String(value).replace(/,/g, ''), 10)
    if (!/^[\d,]+$/.test(value) || !num || prefersReduced()) return undefined
    let raf = 0
    const t0 = performance.now()
    const f = (now) => {
      const k = clamp((now - t0) / 900, 0, 1)
      if (ref.current) ref.current.textContent = Math.round(num * (1 - Math.pow(1 - k, 3))).toLocaleString('en-US')
      if (k < 1) raf = requestAnimationFrame(f)
    }
    raf = requestAnimationFrame(f)
    return () => cancelAnimationFrame(raf)
  }, [value])
  return <b ref={ref}>{value}</b>
}

const Lock = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
    <rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
)

const imgReady = (el) => { if (el && el.complete) el.classList.add('is-ld') }
const imgLoaded = (e) => e.currentTarget.classList.add('is-ld')

export default function Work({ contactHref = `mailto:${PROFILE.email}`, onModalChange, syncHash = true }) {
  const root = useRef(null)
  const hero = useRef(null)
  const stage = useRef(null)
  const cards = useRef([])
  const state = useRef({ pos: 0, target: 0, hold: 0, down: false, sx: 0, sp: 0, moved: 0, lx: 0, vx: 0, vel: 0, hover: false, visible: true, cw: 0, mob: null, t0: null })
  const hv = useRef({ el: null, on: false, fan: 0, d: 9, tx: 0, ty: 0, ttx: 0, tty: 0, ci: -1, timer: 0 })
  const api = useRef({ go: () => {}, measure: () => {} })
  const ovRef = useRef(null)
  const panelRef = useRef(null)
  const closeBtn = useRef(null)
  const lbBtn = useRef(null)
  const curRef = useRef(null)
  const opener = useRef(null)
  const closeTimer = useRef(0)
  const swapTimer = useRef(0)
  const swipeX = useRef(null)

  const [mode, setMode] = useState('featured')
  const [open, setOpen] = useState(null) // project index or null
  const [shown, setShown] = useState(false)
  const [theme, setTheme] = useState('dark')
  const [g, setG] = useState(0) // gallery image
  const [zoom, setZoom] = useState(null) // enlarged screenshot
  const [lit, setLit] = useState(-1) // card that keeps its glow after its panel closes
  const [ci, setCi] = useState(0) // centred project (dots + progress bar)
  const [origin, setOrigin] = useState(null) // where the panel grows from
  const [out, setOut] = useState(false)
  const [swapDir, setSwapDir] = useState(null)
  const openRef = useRef(null)
  openRef.current = open
  const modeRef = useRef(mode)
  modeRef.current = mode
  const zoomRef = useRef(null)
  zoomRef.current = zoom
  const isOpen = open !== null

  /* ---------- carousel: endless ring, slow drift, drag, spring motion ---------- */
  useEffect(() => {
    const s = state.current
    const h = hv.current
    const el = stage.current
    const reduce = prefersReduced()
    const list = () => cards.current.filter(Boolean)
    let raf = 0
    let last = performance.now()

    const go = (t) => { s.target = t; s.hold = performance.now() + 1800 }
    const measure = () => { const c = list()[0]; s.cw = c ? c.offsetWidth : 0 }
    api.current = { go, measure }
    const curHide = () => { if (curRef.current) curRef.current.classList.remove('is-on') }

    function layout(t) {
      const c = list()
      if (!c.length) return
      if (isMobile()) {
        if (s.mob !== true) c.forEach((e) => { e.style.transform = ''; e.style.opacity = ''; e.style.zIndex = ''; e.style.filter = ''; e.style.visibility = '' })
        s.mob = true
        return
      }
      s.mob = false
      if (!s.cw) return
      const step = s.cw * 1.01
      const R = s.cw * 2.3
      const lag = clamp(s.target - s.pos, -3, 3)
      const w = reduce ? 0 : 1
      const hi = h.el ? c.indexOf(h.el) : -1
      // cards float up and in, one after another, the first time the section is on screen
      const ent = (r) => (reduce ? 1 : s.t0 === null ? 0 : 1 - Math.pow(1 - clamp((t - s.t0 - 250 - r * 130) / 750, 0, 1), 3))
      c.forEach((e, i) => {
        let d = (((i - s.pos) % N) + N) % N
        if (d > N / 2) d -= N
        const a = Math.abs(d)
        let dd = hi < 0 ? 0 : (((i - hi) % N) + N) % N
        if (dd > N / 2) dd -= N
        if (e === h.el) h.d = d
        const en = ent(a)
        const op = clamp((3.8 - a) * 0.9, 0, 1) * en
        // fully invisible card: hide it and skip all its layout work
        if (op < 0.01) {
          if (e.style.visibility !== 'hidden') { e.style.visibility = 'hidden'; e.style.opacity = '0' }
          return
        }
        if (e.style.visibility === 'hidden') e.style.visibility = ''
        const th = clamp((d * step) / R, -1.4, 1.4)
        const ph = t * 0.0016 + d * 0.95
        const x = R * Math.sin(th) + (dd ? Math.sign(dd) * (Math.abs(dd) === 1 ? 60 : 24) * h.fan : 0) // neighbours fan out
        const z = -R * (1 - Math.cos(th)) + Math.sin(t * 0.0013 + d * 0.8) * 26 * w
        const y = (1 - en) * 90 - lag * 55 * Math.sin(d * 0.85 - lag * 0.6) + (Math.sin(ph) * 15 + Math.sin(t * 0.0009 - d * 1.7) * 8) * w
        const tiltY = e === h.el ? h.tx : 0
        const tiltX = e === h.el ? h.ty : 0
        e.style.transform =
          `translate(-50%,-50%) translate3d(${x}px,${y}px,${z}px) rotateY(${th * 57.3}deg) ` +
          `rotateX(${Math.cos(ph) * 2.2 * w}deg) rotateZ(${-lag * 2.2 * Math.cos(d * 0.8) + Math.cos(ph) * 1.6 * w}deg) ` +
          `rotateY(${tiltY}deg) rotateX(${tiltX}deg)`
        e.style.opacity = op
        e.style.zIndex = 100 - Math.round(a * 10)
        e.classList.toggle('is-ctr', a < 0.35)
      })
    }

    function tick(now) {
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016)
      last = now
      // work only while the carousel is on screen, in Featured view, and no project panel is open
      if (s.visible && openRef.current === null && modeRef.current === 'featured') {
        if (!s.down && !reduce && !s.hover && now > s.hold) s.target += dt * 0.22 // slow drift, paused while hovering
        if (s.down || reduce) {
          s.pos += (s.target - s.pos) * (1 - Math.exp(-dt * (s.down ? 16 : 6.5)))
          s.vel = 0
        } else {
          s.vel += ((s.target - s.pos) * 70 - s.vel * 12) * dt // spring
          s.pos += s.vel * dt
        }
        h.tx += (h.ttx - h.tx) * 0.12
        h.ty += (h.tty - h.ty) * 0.12
        h.fan += ((h.on && !s.down && !reduce ? 1 : 0) - h.fan) * 0.1
        if (h.el && !reduce) {
          h.el.style.setProperty('--px', (-h.tx * 1.2).toFixed(1) + 'px')
          h.el.style.setProperty('--py', (-h.ty * 1.2).toFixed(1) + 'px')
        }
        layout(now)
        const k = ((Math.round(s.pos) % n) + n) % n
        if (k !== h.ci) { h.ci = k; setCi(k) }
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
    const onLeave = () => {
      s.hover = false; h.ttx = h.tty = 0; h.on = false; curHide()
      clearTimeout(h.timer)
      h.timer = setTimeout(() => { if (!h.on) h.el = null }, 600)
    }
    // hover: tilt toward the cursor, neighbours fan out, "View" / "Drag" label follows the pointer
    const onStageMove = (e) => {
      const c = e.target.closest && e.target.closest('.w-card')
      if (!c || e.pointerType !== 'mouse') { h.on = false; curHide(); return }
      const r = c.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width
      const py = (e.clientY - r.top) / r.height
      h.el = c; h.on = true
      if (!reduce) { h.ttx = (px - 0.5) * 12; h.tty = -(py - 0.5) * 9 }
      const p = curRef.current
      if (p) {
        p.textContent = Math.abs(h.d) < 0.5 ? 'View' : 'Drag'
        p.style.transform = `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-190%)`
        p.classList.add('is-on')
      }
    }
    const onKey = (e) => {
      if (openRef.current !== null || !s.visible || modeRef.current !== 'featured') return
      const t = e.target
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return
      if (e.key === 'ArrowRight') go(Math.round(s.target) + 1)
      if (e.key === 'ArrowLeft') go(Math.round(s.target) - 1)
    }
    const onResize = () => measure()

    const io = new IntersectionObserver(([en]) => {
      s.visible = en.isIntersecting
      if (en.isIntersecting && s.t0 === null) s.t0 = performance.now()
    }, { threshold: 0 })
    if (hero.current) io.observe(hero.current)

    measure()
    layout(performance.now())
    raf = requestAnimationFrame(tick)
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('pointerenter', onEnter)
    el.addEventListener('pointerleave', onLeave)
    el.addEventListener('pointermove', onStageMove)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(h.timer)
      io.disconnect()
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('pointerenter', onEnter)
      el.removeEventListener('pointerleave', onLeave)
      el.removeEventListener('pointermove', onStageMove)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  // the stage has no size while hidden (Full view), so measure again when it comes back
  useEffect(() => { api.current.measure() }, [mode])

  const dotGo = (i) => {
    const s = state.current
    const cu = Math.round(s.target)
    let df = (((i - cu) % n) + n) % n
    if (df > n / 2) df -= n
    api.current.go(cu + df)
  }

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
    setZoom(null)
    setShown(false)
    clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpen(null), 420)
  }, [])

  const openProject = (i, from) => {
    clearTimeout(closeTimer.current)
    opener.current = from || document.activeElement
    const r = from && from.getBoundingClientRect ? from.getBoundingClientRect() : null
    setOrigin(r ? { x: r.left + r.width / 2 - 16, y: r.top + r.height / 2 - 16 } : null)
    setG(0); setSwapDir(null); setOut(false)
    if (curRef.current) curRef.current.classList.remove('is-on')
    setOpen(i)
  }

  // move to another project with a slide transition
  const swap = (i, dir) => {
    if (out) return
    const doIt = () => {
      setSwapDir(dir); setG(0); setOut(false)
      setOpen(((i % n) + n) % n)
      panelRef.current?.scrollTo({ top: 0 })
    }
    if (prefersReduced()) doIt()
    else { setOut(true); clearTimeout(swapTimer.current); swapTimer.current = setTimeout(doIt, 170) }
  }
  const swapRef = useRef(swap)
  swapRef.current = swap
  const nextProject = () => swap((openRef.current ?? 0) + 1, 1)

  useEffect(() => { if (open !== null) setLit(open) }, [open])

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
      if (zoomRef.current) { // enlarged screenshot is open: Esc closes only that
        if (e.key === 'Escape') setZoom(null)
        if (e.key === 'Tab') e.preventDefault()
        return
      }
      if (e.key === 'Escape') { close(); return }
      if (e.key === 'ArrowRight') { swapRef.current(openRef.current + 1, 1); return }
      if (e.key === 'ArrowLeft') { swapRef.current(openRef.current - 1, -1); return }
      if (e.key !== 'Tab' || !ovRef.current) return
      const f = [...ovRef.current.querySelectorAll('a[href],button:not([disabled]),[tabindex="0"]')]
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

  useEffect(() => { if (zoom && lbBtn.current) lbBtn.current.focus({ preventScroll: true }) }, [zoom])

  // text and numbers in the panel fade in as you scroll
  useEffect(() => {
    if (!isOpen || !panelRef.current) return undefined
    const io = new IntersectionObserver(
      (es) => es.forEach((x) => { if (x.isIntersecting) { x.target.classList.add('is-in'); io.unobserve(x.target) } }),
      { root: panelRef.current, threshold: 0.12 }
    )
    panelRef.current.querySelectorAll('.w-r').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [open, isOpen])

  // #/work/<id> in the address bar: a link that opens a project directly
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

  useEffect(() => () => { clearTimeout(closeTimer.current); clearTimeout(swapTimer.current) }, [])

  const onCard = (i) => {
    const s = state.current
    if (s.moved > 6) return // that was a drag, not a click
    let d = (((i - s.pos) % N) + N) % N
    if (d > N / 2) d -= N
    if (isMobile() || Math.abs(d) < 0.5) openProject(i % n, cards.current[i])
    else api.current.go(Math.round(s.pos) + Math.round(d))
  }

  // phones: drag the handle down to close the bottom sheet
  const onGrab = (e) => {
    if (e.pointerType === 'mouse' || !panelRef.current) return
    const pn = panelRef.current
    const hd = e.currentTarget
    const y0 = e.clientY
    let dy = 0
    pn.style.transition = 'none'
    hd.setPointerCapture(e.pointerId)
    const mv = (m) => { dy = Math.max(0, m.clientY - y0); pn.style.transform = `translateY(${dy}px)` }
    const end = () => {
      hd.removeEventListener('pointermove', mv); hd.removeEventListener('pointerup', end); hd.removeEventListener('pointercancel', end)
      pn.style.transition = ''; pn.style.transform = ''
      if (dy > 110) close()
    }
    hd.addEventListener('pointermove', mv); hd.addEventListener('pointerup', end); hd.addEventListener('pointercancel', end)
  }
  const onSwipeDown = (e) => { if (e.pointerType === 'touch') swipeX.current = e.clientX }
  const onSwipeUp = (e) => {
    if (swipeX.current === null) return
    const d = e.clientX - swipeX.current
    swipeX.current = null
    if (Math.abs(d) > 70 && openRef.current !== null) swap(openRef.current + (d < 0 ? 1 : -1), d < 0 ? 1 : -1)
  }

  const p = isOpen ? PROJECTS[open] : null
  const live = p ? liveOf(p) : null
  const permalink = p ? `${location.origin}${location.pathname}#/work/${p.id}` : ''
  const hasImgs = !!(p && p.images && p.images.length)

  return (
    <section ref={root} id="work" className="work" data-mode={mode} aria-label="Selected work">
      <div className="w-hero" ref={hero}>
        <div className="w-vig" aria-hidden="true" />
        <div className="w-bar w-bar--top">
          <a className="w-label" href="#">{PROFILE.name}</a>
          <a className="w-label" href={contactHref}>Contact</a>
        </div>

        <div className="w-intro">
          <h1 aria-label="Selected Work">
            {[...'Selected Work'].map((c, i) => <span key={i} aria-hidden="true" style={{ '--i': i }}>{c === ' ' ? '\u00A0' : c}</span>)}
          </h1>
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
                className={`w-card${i % n === lit ? ' is-lit' : ''}`}
                style={pr.accent ? { '--accent': pr.accent } : undefined}
                role="button"
                tabIndex={dup ? -1 : 0}
                aria-hidden={dup || undefined}
                aria-label={dup ? undefined : `${pr.title}. Open project`}
                data-look={pr.look}
                data-dup={dup ? '1' : undefined}
                onClick={() => onCard(i)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProject(i % n, e.currentTarget) } }}
              >
                {pr.images && pr.images[0] && (
                  <img src={pr.images[0]} alt="" draggable="false" loading="lazy" decoding="async" ref={imgReady} onLoad={imgLoaded} />
                )}
                <span className="w-openl" aria-hidden="true">Open project</span>
                <span className="w-num" aria-hidden="true">{String((i % n) + 1).padStart(2, '0')}</span>
                <span className="w-tag w-label">{pr.cat[0]}</span>
                <span className="w-badge"><i />{pr.status}</span>
                <p className="w-cap"><span className="w-title">{pr.title}</span><span className="w-go" aria-hidden="true">↗</span></p>
              </article>
            )
          })}
        </div>

        <div className="w-dots">
          <div className="w-dr">
            {PROJECTS.map((pr, i) => (
              <button
                key={pr.id}
                type="button"
                className={i === ci ? 'is-on' : ''}
                style={pr.accent ? { '--accent': pr.accent } : undefined}
                aria-label={`Show ${pr.title}`}
                onClick={() => dotGo(i)}
              />
            ))}
          </div>
          <div className="w-track"><i style={{ width: `${((ci + 1) / n) * 100}%`, '--cc': PROJECTS[ci] && PROJECTS[ci].accent }} /></div>
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
        <h2 className="w-rv">What’s Next?</h2>
        <p className="w-sub w-rv">I’m currently expanding my skills in Deep Learning, LLM applications, RAG pipelines, and AI systems. More experiments and projects are on the way.</p>
        <p className="w-big w-rv">Interested in collaborating or discussing a project? Let’s build something meaningful.</p>
        <p className="w-sub w-rv">Also the Technical Director of my college club.</p>
        <div className="w-ctas w-rv">
          <a className="w-btn w-btn--main" href={contactHref}>Contact Me</a>
          <a className="w-btn" href={PROFILE.github} target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
      </div>

      <div className="w-cur" ref={curRef} aria-hidden="true" />

      {p && (
        <div
          ref={ovRef}
          className={`w-ov is-on${shown ? ' is-show' : ''}`}
          data-pt={theme}
          style={origin ? { '--ox': origin.x + 'px', '--oy': origin.y + 'px' } : undefined}
          role="dialog"
          aria-modal="true"
          aria-labelledby="work-panel-title"
          onClick={(e) => e.target === e.currentTarget && close()}
          onPointerDown={onSwipeDown}
          onPointerUp={onSwipeUp}
        >
          <div className={`w-panel${swapDir !== null ? ' w-swap' : ''}${out ? ' w-out' : ''}`} ref={panelRef} style={{ '--accent': p.accent, '--dir': swapDir === null ? 1 : swapDir }}>
            <div className="w-grab" aria-hidden="true" onPointerDown={onGrab}><i /></div>
            <div className="w-pl" key={`l${open}`}>
              <div className="w-top">
                <p className="w-label w-count">{open + 1} / {n} · {Math.max(1, Math.round(wordsOf(p) / 200))} min case study</p>
                <button type="button" className="w-tg" aria-label="Switch panel theme" onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}>
                  {theme === 'dark' ? '☀ Light' : '☾ Dark'}
                </button>
              </div>
              <h2 id="work-panel-title">{p.title}</h2>
              <p className="w-d">{p.desc}</p>
              {p.role && <p className="w-role"><b>My role</b>{p.role}</p>}
              <div className="w-pills">
                {p.links.map(([label, url]) =>
                  url === '#'
                    ? <span key={label} className="w-btn w-off">{label} · soon</span>
                    : <a key={label} className={`w-btn${label === 'Live Demo' ? ' w-btn--main' : ''}`} href={url} target="_blank" rel="noopener noreferrer">{label} ↗</a>
                )}
                <CopyBtn className="w-btn" label="Copy link" text={permalink} />
              </div>
              <div className="w-pills">
                <span className="w-pill w-pill--hot">{p.status}</span>
                {p.cat.map((c) => <span key={c} className="w-pill">{c}</span>)}
              </div>
              {p.metrics && p.metrics.length > 0 && (
                <div className="w-met w-r">
                  {p.metrics.map(([v, l]) => <div key={l}><CountUp value={v} /><span>{l}</span></div>)}
                </div>
              )}
              {p.highlight && <blockquote className="w-hl w-r">{p.highlight}</blockquote>}
              {p.who && <><p className="w-lb w-label">Who this is for</p><p className="w-cs w-r">{p.who}</p></>}
              {p.problem && <><p className="w-lb w-label">Problem</p><p className="w-cs w-r">{p.problem}</p></>}
              {p.approach && <><p className="w-lb w-label">Approach</p><p className="w-cs w-r">{p.approach}</p></>}
              {p.does && p.does.length > 0 && <><p className="w-lb w-label">What it does</p><ul className="w-do w-r">{p.does.map((x) => <li key={x}>{x}</li>)}</ul></>}
              {p.decisions && p.decisions.length > 0 && <><p className="w-lb w-label">Key decisions</p><ul className="w-do w-r">{p.decisions.map((x) => <li key={x}>{x}</li>)}</ul></>}
              {p.challenge && <><p className="w-lb w-label">Challenge</p><p className="w-cs w-r">{p.challenge}</p></>}
              {p.learned && <><p className="w-lb w-label">What I learned</p><p className="w-cs w-r">{p.learned}</p></>}
              {p.samples && p.samples.length > 0 && (
                <>
                  <p className="w-lb w-label">Try this</p>
                  {p.tryText && <p className="w-cs w-r">{p.tryText}</p>}
                  <div className="w-pills w-pills--tight w-r">
                    {p.samples.map((x) => <CopyBtn key={x} className="w-chip" title="Click to copy" text={x} label={x.length > 40 ? x.slice(0, 38) + '…' : x} />)}
                  </div>
                </>
              )}
              {p.note && <><p className="w-lb w-label">Note</p><p className="w-cs w-r">{p.note}</p></>}
              <p className="w-lb w-label">Built with</p>
              <div className="w-pills w-pills--tight">
                {p.tech.map((t) => <span key={t} className="w-pill w-tc"><i>{abbr(t)}</i>{t}</span>)}
              </div>
            </div>
            <div className="w-media" key={`m${open}`}>
              {hasImgs ? (
                <>
                  <div className="w-frame">
                    <div className="w-frame-bar">
                      <i /><i /><i />
                      {live && <span className="w-url"><Lock />{hostOf(live)}</span>}
                      <em aria-hidden="true">↻</em>
                    </div>
                    <img
                      tabIndex={0}
                      role="button"
                      aria-label="Enlarge screenshot"
                      src={p.images[g] || p.images[0]}
                      alt={`${p.title}: ${p.media[g] || p.media[0] || 'screenshot'}`}
                      ref={imgReady}
                      onLoad={imgLoaded}
                      onClick={(e) => setZoom({ src: e.currentTarget.src, alt: e.currentTarget.alt })}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setZoom({ src: e.currentTarget.src, alt: e.currentTarget.alt }) } }}
                    />
                  </div>
                  {p.images.length > 1 && (
                    <div className="w-thumbs">
                      {p.images.map((im, k) => (
                        <button key={im} type="button" aria-label={`Screenshot ${k + 1}`} aria-pressed={k === g} onClick={() => setG(k)}>
                          <img src={im} alt="" loading="lazy" />
                        </button>
                      ))}
                    </div>
                  )}
                  {p.compare && (
                    <div className="w-cmp" style={{ '--c': '50%' }}>
                      <img src={p.compare[0]} alt="Before" />
                      <img className="w-cmp2" src={p.compare[1]} alt="After" />
                      <input type="range" min="0" max="100" defaultValue="50" aria-label="Before and after slider" onChange={(e) => e.currentTarget.parentNode.style.setProperty('--c', e.currentTarget.value + '%')} />
                    </div>
                  )}
                </>
              ) : (
                p.media.map((m) => (
                  <div key={m} className="w-shot" data-look={p.look}><span className="w-label">{m}</span></div>
                ))
              )}
            </div>
            <button type="button" className="w-next" key={`n${open}`} onClick={nextProject}>
              <span className="w-label">Next project</span>
              <span className="w-nt">{PROJECTS[(open + 1) % n].title}</span>
            </button>
            <p className="w-label w-hintk">Esc to close · ← → switch project · swipe on touch</p>
            <div className="w-sticky">
              {live && <a className="w-btn w-btn--main" href={live} target="_blank" rel="noopener noreferrer">Live Demo ↗</a>}
              <button type="button" className="w-btn" onClick={nextProject}>Next →</button>
            </div>
          </div>
          <button ref={closeBtn} type="button" className="w-x" onClick={close} aria-label="Close project">✕</button>
        </div>
      )}

      {zoom && (
        <div className="w-lbx" role="dialog" aria-modal="true" aria-label="Screenshot, enlarged" onClick={() => setZoom(null)}>
          <img src={zoom.src} alt={zoom.alt} />
          <button ref={lbBtn} type="button" aria-label="Close enlarged screenshot" onClick={() => setZoom(null)}>✕</button>
        </div>
      )}
    </section>
  )
}
