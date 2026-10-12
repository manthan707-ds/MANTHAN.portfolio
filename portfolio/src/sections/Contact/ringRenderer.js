// Canvas drawing for the contact + assistant section: the perspective floor grid and the glass ring.
// Pure drawing code, no React. ContactAssistant.jsx calls it once per animation frame.

function hex(h) {
  h = String(h).replace("#", "");
  if (h.length === 3) h = h.replace(/(.)/g, "$1$1");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
export function mix(a, b, t) {
  const x = hex(a), y = hex(b);
  return "#" + x.map((v, i) => { const n = Math.round(v + (y[i] - v) * t); return (n < 16 ? "0" : "") + n.toString(16); }).join("");
}
export function rgba(h, a) { const x = hex(h); return "rgba(" + x[0] + "," + x[1] + "," + x[2] + "," + a + ")"; }
function clamp01(x) { return Math.max(0, Math.min(1, x)); }

const beads = [
  { r: .075, a: .62, b: .50, s: .00021, p: 0.2, k: 1.35, d: 1.0 },
  { r: .052, a: .70, b: .62, s: .00016, p: 2.1, k: 1.0, d: .6 },
  { r: .066, a: .58, b: .66, s: .00019, p: 3.7, k: 1.5, d: 1.3 },
  { r: .044, a: .74, b: .44, s: .00026, p: 5.0, k: 1.0, d: .4 },
  { r: .058, a: .50, b: .70, s: .00014, p: 1.2, k: 1.25, d: .9 }
];

export function createRenderer(floorCanvas, ringCanvas) {
  const fg = floorCanvas.getContext("2d");
  const rg = ringCanvas.getContext("2d");
  const off = document.createElement("canvas");
  const og = off.getContext("2d");
  let gridOff = 0;

  // call whenever the stage size changes
  function size(st) {
    const { vw, vh, dpr, D } = st;
    [floorCanvas, ringCanvas].forEach((c) => { c.width = Math.round(vw * dpr); c.height = Math.round(vh * dpr); });
    fg.setTransform(dpr, 0, 0, dpr, 0, 0);
    rg.setTransform(dpr, 0, 0, dpr, 0, 0);
    const s = Math.ceil((D + 24) * dpr);
    off.width = s; off.height = s;
    og.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawFloor(st) {
    const { vw, vh, vertical, D, cx, cy, vel, reduced, ringVis, born } = st;
    const C = { accent: st.accent, disc: st.disc };
    fg.clearRect(0, 0, vw, vh);
    var hy = vertical ? vh * 0.7 : vh * 0.6, n = 16;
    var lg = fg.createLinearGradient(0, hy, 0, vh); lg.addColorStop(0, rgba(C.accent, 0)); lg.addColorStop(1, rgba(C.accent, 0.32));
    fg.strokeStyle = lg; fg.lineWidth = 1;
    gridOff = (gridOff + (reduced ? 0 : 0.0035) + Math.abs(vel) * 0.0009) % 1;
    fg.beginPath();
    for (var k = 0; k < n; k++) { var f = (k + gridOff) / n, y = hy + (vh - hy) * Math.pow(f, 2.3); fg.moveTo(0, y); fg.lineTo(vw, y); }
    var step = Math.max(60, vw / 10);
    for (var i = -14; i <= 14; i++) { fg.moveTo(cx + i * step * 0.06, hy); fg.lineTo(cx + i * step * 1.25, vh); }
    fg.stroke();
    var Rr = D / 2, k = (born ? Math.min(1, (performance.now() - born) / 1300) : 1) * ringVis;
    fg.save(); fg.translate(cx, cy + Rr * 0.99); fg.scale(1, 0.13);
    var cgl = fg.createRadialGradient(0, 0, 0, 0, 0, Rr * 0.95); cgl.addColorStop(0, rgba(C.accent, 0.5 * k)); cgl.addColorStop(1, rgba(C.accent, 0));
    fg.fillStyle = cgl; fg.beginPath(); fg.arc(0, 0, Rr * 0.95, 0, 7); fg.fill(); fg.restore();
  }

  function drawRing(now, st) {
    const { vw, vh, dpr, D, T, cx, cy, reduced, ringVis, born, popAt, mx, my } = st;
    const C = { accent: st.accent, disc: st.disc };
    rg.clearRect(0, 0, vw, vh);
    if (ringVis < 0.004) return;
    var t = reduced ? 1 : clamp01((now - born) / 1300), e = 1 - Math.pow(1 - t, 4);
    var sc = 0.1 + 0.9 * e, al = clamp01(t * 5), beadA = clamp01((t - 0.55) / 0.45);
    sc *= 0.6 + 0.4 * ringVis; al *= ringVis;
    var pp = reduced ? 1 : clamp01((now - popAt) / 800), spring = pp >= 1 ? 0 : Math.exp(-pp * 4.2) * Math.sin(pp * Math.PI * 3.2) * 0.075;
    sc *= 1 + spring;
    var ox = mx * 7, oy = my * 5, R = D / 2, Rin = R - T, accent = C.accent;
    var a = (reduced ? 0.6 : now * 0.00014 + mx * 0.5 + my * 0.2) + (1 - e) * 5;
    var hasConic = !!rg.createConicGradient;

    rg.save(); rg.translate(cx + ox, cy + oy); rg.scale(sc, sc); rg.globalAlpha = al;
    // outer glow (brighter right after a switch)
    var gl = rg.createRadialGradient(0, 0, R * 0.96, 0, 0, R * 1.32); gl.addColorStop(0, rgba(accent, 0.32 + (pp < 1 ? 0.35 * Math.pow(1 - pp, 2) : 0))); gl.addColorStop(1, rgba(accent, 0));
    rg.fillStyle = gl; rg.beginPath(); rg.arc(0, 0, R * 1.32, 0, 7); rg.fill();
    // black disc with a soft lit edge
    var dg = rg.createRadialGradient(0, 0, 0, 0, 0, Rin); dg.addColorStop(0, C.disc); dg.addColorStop(0.8, C.disc); dg.addColorStop(1, mix(C.disc, accent, 0.22));
    rg.fillStyle = dg; rg.beginPath(); rg.arc(0, 0, Rin + 1, 0, 7); rg.fill();
    // ring light spilling onto the disc
    if (hasConic) {
      var ig = rg.createConicGradient(a * 1.0, 0, 0), L1 = mix(accent, "#ffffff", 0.4);
      ig.addColorStop(0, rgba(L1, 0.5)); ig.addColorStop(.18, rgba(accent, 0.05)); ig.addColorStop(.38, rgba(accent, 0.3)); ig.addColorStop(.6, rgba(accent, 0.04)); ig.addColorStop(.82, rgba("#ffc48a", 0.32)); ig.addColorStop(1, rgba(L1, 0.5));
      rg.globalCompositeOperation = "lighter"; rg.strokeStyle = ig;
      for (var q = 0; q < 4; q++) { rg.globalAlpha = al * (0.5 - q * 0.11); rg.lineWidth = 3 + q * 9; rg.beginPath(); rg.arc(0, 0, Rin - 1.5 - q * 4, 0, 7); rg.stroke(); }
      rg.globalAlpha = al; rg.globalCompositeOperation = "source-over";
    }
    // beads
    rg.save(); rg.beginPath(); rg.arc(0, 0, Rin - 2, 0, 7); rg.clip(); rg.globalAlpha = al * beadA;
    for (var i = 0; i < beads.length; i++) {
      var bd = beads[i], ang = now * bd.s + bd.p;
      var x = Math.cos(ang) * Rin * bd.a - mx * bd.d * 14, y = Math.sin(ang * 0.8 + bd.p) * Rin * bd.b - my * bd.d * 10, r = Rin * bd.r;
      if (reduced) { x = Math.cos(bd.p) * Rin * bd.a; y = Math.sin(bd.p) * Rin * bd.b; }
      rg.save(); rg.translate(x, y); rg.rotate(Math.sin(ang * 1.7) * 0.5); rg.scale(1, bd.k);
      var body = rg.createRadialGradient(-r * .3, -r * .35, r * .05, 0, 0, r); body.addColorStop(0, "#5a5a78"); body.addColorStop(.35, "#10101a"); body.addColorStop(1, "#000");
      rg.fillStyle = body; rg.beginPath(); rg.arc(0, 0, r, 0, 7); rg.fill();
      var rim = rg.createRadialGradient(r * .55, r * .6, 0, r * .55, r * .6, r * .95); rim.addColorStop(0, rgba(accent, .65)); rim.addColorStop(1, rgba(accent, 0));
      rg.globalCompositeOperation = "lighter"; rg.fillStyle = rim; rg.beginPath(); rg.arc(0, 0, r, 0, 7); rg.fill(); rg.globalCompositeOperation = "source-over";
      rg.save(); rg.translate(-r * .36, -r * .42); rg.rotate(-0.6); rg.scale(1, .6);
      var sp = rg.createRadialGradient(0, 0, 0, 0, 0, r * .3); sp.addColorStop(0, "rgba(255,255,255,.95)"); sp.addColorStop(1, "rgba(255,255,255,0)");
      rg.fillStyle = sp; rg.beginPath(); rg.arc(0, 0, r * .3, 0, 7); rg.fill(); rg.restore();
      rg.restore();
    }
    rg.restore();
    // opening flash
    if (t < 1) {
      var fl = rg.createRadialGradient(0, 0, 0, 0, 0, R * 0.9), f = Math.pow(1 - t, 2);
      fl.addColorStop(0, "rgba(255,255,255," + (0.85 * f) + ")"); fl.addColorStop(.35, rgba(accent, 0.5 * f)); fl.addColorStop(1, rgba(accent, 0));
      rg.globalCompositeOperation = "lighter"; rg.fillStyle = fl; rg.beginPath(); rg.arc(0, 0, R * 0.9, 0, 7); rg.fill(); rg.globalCompositeOperation = "source-over";
    }
    rg.restore();

    // ---- glass ring on an offscreen canvas
    var c = D / 2 + 12;
    og.clearRect(0, 0, off.width / dpr, off.height / dpr);
    og.globalCompositeOperation = "source-over";
    var aL = mix(accent, "#ffffff", .6), aD = mix(accent, "#000000", .62), nearBlack = mix(accent, "#000000", .92), warm = "#FFC48A", ice = "#BFE9FF";
    var cg = hasConic ? og.createConicGradient(a, c, c) : og.createLinearGradient(0, 0, D, D);
    [[0, aL], [.06, "#ffffff"], [.13, accent], [.21, aD], [.29, nearBlack], [.37, aD], [.44, warm], [.5, "#fff2e0"], [.56, warm], [.63, aD], [.7, accent], [.78, nearBlack], [.86, ice], [.93, "#ffffff"], [1, aL]]
      .forEach(function (s) { cg.addColorStop(s[0], s[1]); });
    var mid = R - T / 2;
    og.lineWidth = T; og.strokeStyle = cg; og.beginPath(); og.arc(c, c, mid, 0, 7); og.stroke();
    // tube shading across the cross-section
    var sh = og.createRadialGradient(c, c, R - T, c, c, R);
    sh.addColorStop(0, "#2a2a3c"); sh.addColorStop(.16, "#9c9cb8"); sh.addColorStop(.42, "#ffffff"); sh.addColorStop(.62, "#e6e6f4"); sh.addColorStop(.86, "#8a8aa6"); sh.addColorStop(1, "#1c1c2c");
    og.globalCompositeOperation = "multiply"; og.strokeStyle = sh; og.beginPath(); og.arc(c, c, mid, 0, 7); og.stroke();
    if (hasConic) {
      og.globalCompositeOperation = "source-atop";
      // wide soft-box reflections
      var wg = og.createConicGradient(-a * 1.3 + 0.4, c, c);
      wg.addColorStop(0, "rgba(255,255,255,0)"); wg.addColorStop(.03, "rgba(255,255,255,.5)"); wg.addColorStop(.08, "rgba(255,255,255,0)");
      wg.addColorStop(.46, "rgba(255,255,255,0)"); wg.addColorStop(.5, "rgba(255,230,200,.45)"); wg.addColorStop(.57, "rgba(255,255,255,0)"); wg.addColorStop(1, "rgba(255,255,255,0)");
      og.lineWidth = T * 0.5; og.strokeStyle = wg; og.beginPath(); og.arc(c, c, R - T * 0.38, 0, 7); og.stroke();
      // tight specular streaks
      var sg = og.createConicGradient(-a * 1.6 + 1, c, c);
      sg.addColorStop(0, "rgba(255,255,255,0)"); sg.addColorStop(.05, "rgba(255,255,255,1)"); sg.addColorStop(.11, "rgba(255,255,255,0)");
      sg.addColorStop(.52, "rgba(255,255,255,0)"); sg.addColorStop(.57, "rgba(255,255,255,.85)"); sg.addColorStop(.63, "rgba(255,255,255,0)"); sg.addColorStop(1, "rgba(255,255,255,0)");
      og.lineWidth = T * 0.13; og.strokeStyle = sg; og.beginPath(); og.arc(c, c, R - T * 0.68, 0, 7); og.stroke();
    }
    // crisp bevel lines on both edges
    og.globalCompositeOperation = "source-atop";
    og.lineWidth = 1.6; og.strokeStyle = "rgba(255,255,255,.55)"; og.beginPath(); og.arc(c, c, R - 0.8, 0, 7); og.stroke();
    og.lineWidth = 1.4; og.strokeStyle = "rgba(255,255,255,.3)"; og.beginPath(); og.arc(c, c, R - T + 0.7, 0, 7); og.stroke();
    og.globalCompositeOperation = "source-over";
    rg.save(); rg.globalAlpha = al; rg.translate(cx + ox - c * sc, cy + oy - c * sc); rg.scale(sc, sc);
    rg.drawImage(off, 0, 0, off.width / dpr, off.height / dpr);
    rg.restore();

    // shockwave
    if (pp < 1) {
      rg.save(); rg.translate(cx + ox, cy + oy); rg.globalCompositeOperation = "lighter";
      for (var w = 0; w < 2; w++) {
        var pw = clamp01(pp * 1.25 - w * 0.18); if (pw <= 0 || pw >= 1) continue;
        rg.globalAlpha = Math.pow(1 - pw, 2) * 0.7; rg.lineWidth = 2.5 - w; rg.strokeStyle = w ? "#ffffff" : accent;
        rg.beginPath(); rg.arc(0, 0, R * (1.02 + pw * 0.38), 0, 7); rg.stroke();
      }
      rg.restore();
    }

    // chromatic fringes on the inner and outer edges
    if (hasConic) {
      rg.save(); rg.translate(cx + ox, cy + oy); rg.scale(sc, sc); rg.globalAlpha = al; rg.globalCompositeOperation = "lighter";
      var fr = rg.createConicGradient(a * 0.7 + 2, 0, 0);
      fr.addColorStop(0, "rgba(255,70,110,0)"); fr.addColorStop(.1, "rgba(255,70,110,.6)"); fr.addColorStop(.24, "rgba(255,70,110,0)");
      fr.addColorStop(.5, "rgba(255,70,110,0)"); fr.addColorStop(.6, "rgba(255,70,110,.5)"); fr.addColorStop(.74, "rgba(255,70,110,0)"); fr.addColorStop(1, "rgba(255,70,110,0)");
      var fc = rg.createConicGradient(a * 0.7 + 2.2, 0, 0);
      fc.addColorStop(0, "rgba(70,200,255,0)"); fc.addColorStop(.1, "rgba(70,200,255,.55)"); fc.addColorStop(.24, "rgba(70,200,255,0)");
      fc.addColorStop(.5, "rgba(70,200,255,0)"); fc.addColorStop(.6, "rgba(70,200,255,.5)"); fc.addColorStop(.74, "rgba(70,200,255,0)"); fc.addColorStop(1, "rgba(70,200,255,0)");
      rg.lineWidth = 2.2; rg.strokeStyle = fr; rg.beginPath(); rg.arc(0, 0, Rin - 1.2, 0, 7); rg.stroke();
      rg.strokeStyle = fc; rg.beginPath(); rg.arc(0, 0, Rin - 3.2, 0, 7); rg.stroke();
      rg.strokeStyle = fc; rg.lineWidth = 1.6; rg.beginPath(); rg.arc(0, 0, R + 0.8, 0, 7); rg.stroke();
      rg.restore();
    }
  }

  return { size, drawFloor, drawRing };
}
