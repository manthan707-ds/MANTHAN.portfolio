// Interactive pixel-grid tree on a <canvas>.
//  - grows with setProgress(0..1)
//  - leaves scatter away from the cursor, some twinkle, a few drift down
//  - setActive(i) lights up one branch (hub -> node) and the leaves around it
// Seeded generator, so the tree shape is the same on every load.
// Colours blend into the accent #D8B4FD. Change STOPS if you change the accent.
const STOPS = ["#3b2470", "#7c4fd6", "#b98af0", "#D8B4FD", "#ffffff"];

function rng(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
function ramp(t) {
  t = Math.min(0.999, Math.max(0, t));
  const s = t * (STOPS.length - 1), i = Math.floor(s), f = s - i;
  const a = hex(STOPS[i]), b = hex(STOPS[i + 1]);
  return "rgb(" + a.map((v, k) => Math.round(v + (b[k] - v) * f)).join(",") + ")";
}

export function createPixelTree(canvas, nodes = [], { cell = 8, seed = 7 } = {}) {
  const ctx = canvas.getContext("2d");
  const host = canvas.parentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let cells = [], leaves = [], total = 1, W = 0, H = 0;
  let progress = 0, active = -1, mx = -9999, my = -9999, raf = 0;

  function build(cols, rows) {
    const r = rng(seed), map = new Map();
    let order = 0;
    const put = (x, y, depth, rad = 0) => {
      for (let dx = -rad; dx <= rad; dx++) for (let dy = -rad; dy <= rad; dy++) {
        const gx = Math.round(x + dx), gy = Math.round(y + dy);
        if (gx < 0 || gx >= cols || gy < 0 || gy >= rows) continue;
        const k = gy * cols + gx;
        if (!map.has(k)) {
          const t = 0.3 + (depth / 6) * 0.55 + (r() - 0.5) * 0.3;
          map.set(k, { gx, gy, order: order++, color: ramp(t), ox: 0, oy: 0, tw: Math.random() < 0.14, ph: Math.random() * 6.28 });
        }
      }
    };
    const branch = (x, y, ang, len, th, depth) => {
      for (let i = 0; i < len; i++) {
        x += Math.cos(ang); y += Math.sin(ang);
        ang += (r() - 0.5) * 0.14;
        put(x, y, depth, Math.round(th * (1 - (i / len) * 0.5)));
      }
      if (depth >= 3) for (let i = 0; i < 7; i++) put(x + (r() - 0.5) * 10, y + (r() - 0.5) * 10, depth);
      if (depth < 6 && len > 6) {
        const n = r() > 0.55 ? 3 : 2;
        for (let k = 0; k < n; k++) {
          const spread = (k - (n - 1) / 2) * 0.75 + (r() - 0.5) * 0.3;
          branch(x, y, ang + spread, len * (0.66 + r() * 0.1), th * 0.7, depth + 1);
        }
      }
    };
    branch(cols / 2, rows - 1, -Math.PI / 2, rows * 0.3, 2, 0);
    cells = Array.from(map.values());
    total = Math.max(1, order);
  }

  const points = () => nodes.map((n) => ({ x: (n.x / 100) * W, y: (n.y / 100) * H }));

  function render() {
    const T = performance.now();
    ctx.clearRect(0, 0, W, H);
    const limit = progress * total, P = points(), ap = active >= 0 ? P[active] : null, R = 70;
    for (const c of cells) {
      if (c.order > limit) break;
      const cx = c.gx * cell + 3, cy = c.gy * cell + 3;
      if (!reduce) {
        let tx = 0, ty = 0;
        const dx = cx - mx, dy = cy - my, d = Math.sqrt(dx * dx + dy * dy);
        if (d < R && d > 0.1) { let f = 1 - d / R; f *= f; tx = (dx / d) * f * 24; ty = (dy / d) * f * 24; }
        c.ox += (tx - c.ox) * 0.16; c.oy += (ty - c.oy) * 0.16;
      }
      const hot = ap && Math.hypot(cx - ap.x, cy - ap.y) < 95;
      const twinkle = !reduce && c.tw && Math.sin(T * 0.004 + c.ph) > 0.88;
      ctx.fillStyle = hot || twinkle ? "#F6F3FB" : c.color;
      ctx.fillRect(c.gx * cell + c.ox, c.gy * cell + c.oy, cell - 1, cell - 1);
    }
    if (progress >= 1 && !reduce) {
      for (const p of leaves) {
        p.y += p.vy; p.x += Math.sin(T * 0.001 + p.s) * 0.35;
        if (p.y > H * 0.92) { p.y = H * (0.08 + Math.random() * 0.25); p.x = W * (0.28 + Math.random() * 0.44); }
        ctx.globalAlpha = 0.85; ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, p.s, p.s);
      }
      ctx.globalAlpha = 1;
    }
    if (!nodes.length) return;
    const hub = { x: W * 0.5, y: H * 0.7 };
    ctx.save();
    ctx.globalAlpha = Math.min(1, progress * 1.6);
    ctx.strokeStyle = "rgba(250,250,250,0.35)";
    ctx.setLineDash([3, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    P.forEach((p, i) => {
      ctx.moveTo(hub.x, hub.y); ctx.lineTo(p.x, p.y);
      const q = P[(i + 1) % P.length];
      ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
    });
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowColor = "#D8B4FD"; ctx.shadowBlur = 18 + 8 * Math.sin(T * 0.003);
    ctx.fillStyle = "#D8B4FD"; ctx.fillRect(hub.x - 5, hub.y - 5, 10, 10);
    ctx.shadowBlur = 0;
    if (ap) {
      ctx.strokeStyle = "#D8B4FD"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(hub.x, hub.y); ctx.lineTo(ap.x, ap.y); ctx.stroke();
    }
    ctx.restore();
  }

  function resize() {
    W = canvas.clientWidth; H = canvas.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build(Math.floor(W / cell), Math.floor(H / cell));
    leaves = Array.from({ length: 20 }, () => ({
      x: W * (0.28 + Math.random() * 0.44), y: H * (0.08 + Math.random() * 0.8),
      vy: 0.25 + Math.random() * 0.4, s: 3 + Math.floor(Math.random() * 3),
      c: Math.random() > 0.5 ? "#D8B4FD" : "#b98af0",
    }));
    render();
  }

  const onMove = (e) => { const r = canvas.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; };
  const onLeave = () => { mx = my = -9999; };
  host.addEventListener("pointermove", onMove);
  host.addEventListener("pointerleave", onLeave);

  const tick = () => { render(); raf = requestAnimationFrame(tick); };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  return {
    // 0..1, how much of the tree has grown
    setProgress(p) { progress = p; if (reduce) render(); },
    // index of the highlighted node, or -1
    setActive(i) { active = i; if (reduce) render(); },
    // run the animation loop only while the tree is on screen
    setVisible(v) {
      if (reduce) { render(); return; }
      if (v && !raf) raf = requestAnimationFrame(tick);
      else if (!v && raf) { cancelAnimationFrame(raf); raf = 0; }
    },
    destroy() {
      cancelAnimationFrame(raf); raf = 0; ro.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    },
  };
}
