// Draws a pixel-grid tree on a <canvas>, with dotted links between labelled nodes.
// Original generator (seeded, so it looks the same on every load).
// The colours blend into your accent #D8B4FD. Change STOPS if you change the accent.
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

export function createPixelTree(canvas, nodes = [], { cell = 7, seed = 7 } = {}) {
  const ctx = canvas.getContext("2d");
  let cells = [], total = 1, W = 0, H = 0, progress = 1;

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
          map.set(k, { gx, gy, order: order++, color: ramp(t) });
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

  function render() {
    ctx.clearRect(0, 0, W, H);
    const limit = progress * total;
    for (const c of cells) {
      if (c.order > limit) break;
      ctx.fillStyle = c.color;
      ctx.fillRect(c.gx * cell, c.gy * cell, cell - 1, cell - 1);
    }
    if (!nodes.length) return;
    const pts = nodes.map((n) => ({ x: (n.x / 100) * W, y: (n.y / 100) * H }));
    const hub = { x: W * 0.5, y: H * 0.7 };
    ctx.save();
    ctx.globalAlpha = Math.min(1, progress * 1.6);
    ctx.strokeStyle = "rgba(250,250,250,0.35)";
    ctx.setLineDash([3, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    pts.forEach((p, i) => {
      ctx.moveTo(hub.x, hub.y); ctx.lineTo(p.x, p.y);
      const q = pts[(i + 1) % pts.length];
      ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
    });
    ctx.stroke();
    ctx.restore();
  }

  function resize() {
    W = canvas.clientWidth; H = canvas.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build(Math.floor(W / cell), Math.floor(H / cell));
    render();
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  return {
    draw(p) { progress = p; render(); },
    destroy() { ro.disconnect(); },
  };
}
