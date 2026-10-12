import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { clamp, cssColor, isFinePointer, prefersReducedMotion } from '../lib/utils';

// Fixed full-screen WebGL background: faceted crystal, orbit rings, wire shell, dust.
// Colours come from the CSS tokens (--accent, --bg). Pass started={true} to play the fly-in.
export default function HeroScene({ started }) {
  const canvasRef = useRef(null);
  const startedAt = useRef(0);

  useEffect(() => {
    if (started && !startedAt.current) startedAt.current = performance.now();
  }, [started]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const reduced = prefersReducedMotion();
    const fine = isFinePointer();
    const small = window.innerWidth < 1024;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      return undefined; // no WebGL: the CSS glow behind the page still shows
    }
    let pr = Math.min(window.devicePixelRatio || 1, small ? 1.75 : 2);
    renderer.setPixelRatio(pr);
    renderer.setClearColor(0x000000, 0);

    const accent = new THREE.Color(cssColor('--accent'));
    const bg = new THREE.Color(cssColor('--bg'));
    const white = new THREE.Color(0xffffff);
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(bg.getHex(), 0.016);
    const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, 26);

    // seeded random so the crystal looks the same on every load
    const rand = (seed) => () => {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const rnd = rand(2026);

    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = 128; glowCanvas.height = 128;
    const g = glowCanvas.getContext('2d');
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.25, 'rgba(255,255,255,.5)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    const soft = new THREE.CanvasTexture(glowCanvas);
    soft.colorSpace = THREE.SRGBColorSpace;

    const root = new THREE.Group();
    scene.add(root);

    // crystal: icosahedron whose shared vertices are nudged so the facets are irregular
    const cg = new THREE.IcosahedronGeometry(1.55, 1);
    const pos = cg.attributes.position;
    const seen = {};
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const k = `${v.x.toFixed(3)},${v.y.toFixed(3)},${v.z.toFixed(3)}`;
      if (seen[k] === undefined) seen[k] = 0.86 + rnd() * 0.32;
      v.multiplyScalar(seen[k]);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    cg.computeVertexNormals();
    const crystal = new THREE.Mesh(cg, new THREE.MeshPhysicalMaterial({
      color: accent.clone().lerp(white, 0.55), metalness: 0.25, roughness: 0.16,
      clearcoat: 1, clearcoatRoughness: 0.08, flatShading: true, emissive: accent, emissiveIntensity: 0.16,
    }));
    root.add(crystal);
    crystal.add(new THREE.LineSegments(
      new THREE.EdgesGeometry(cg, 1),
      new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }),
    ));

    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: soft, color: accent, transparent: true, opacity: 0.34, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    halo.scale.set(11, 11, 1); halo.position.z = -1.2; root.add(halo);

    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(3.4, 1),
      new THREE.MeshBasicMaterial({ color: accent, wireframe: true, transparent: true, opacity: 0.11, depthWrite: false }),
    );
    root.add(shell);

    // orbit ring with two small satellites riding it
    const pivot = new THREE.Group();
    pivot.rotation.set(Math.PI / 2.3, Math.PI / 9, 0);
    root.add(pivot);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.75, 0.026, 12, 160), new THREE.MeshBasicMaterial({ color: accent.clone().lerp(white, 0.35) }));
    pivot.add(ring);
    [0, Math.PI].forEach((a) => {
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false }));
      s.position.set(Math.cos(a) * 2.75, Math.sin(a) * 2.75, 0);
      const h = new THREE.Sprite(new THREE.SpriteMaterial({ map: soft, color: accent, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
      h.scale.set(0.9, 0.9, 1);
      s.add(h); ring.add(s);
    });
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(3.7, 0.012, 8, 160), new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.35 }));
    ring2.rotation.set(Math.PI / 2.8, -Math.PI / 6, 0);
    root.add(ring2);

    // two dark glass orbs for depth
    const orbMat = new THREE.MeshPhysicalMaterial({ color: 0x14101f, metalness: 0.5, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05 });
    const orbA = new THREE.Mesh(new THREE.SphereGeometry(1.0, 40, 40), orbMat); orbA.position.set(-6.2, 3.1, -6); root.add(orbA);
    const orbB = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 32), orbMat); orbB.position.set(6.4, -3.2, -9); root.add(orbB);

    // dust
    const n = small ? 520 : 1100;
    const pp = new Float32Array(n * 3);
    const pc = new Float32Array(n * 3);
    for (let j = 0; j < n; j++) {
      const r = 6 + rnd() * 22; const th = rnd() * Math.PI * 2; const ph = Math.acos(2 * rnd() - 1);
      pp[j * 3] = r * Math.sin(ph) * Math.cos(th);
      pp[j * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.7;
      pp[j * 3 + 2] = r * Math.cos(ph) - 6;
      const col = rnd() > 0.7 ? accent : white;
      pc[j * 3] = col.r; pc[j * 3 + 1] = col.g; pc[j * 3 + 2] = col.b;
    }
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.BufferAttribute(pp, 3));
    pg.setAttribute('color', new THREE.BufferAttribute(pc, 3));
    const dust = new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.11, map: soft, vertexColors: true, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true }));
    scene.add(dust);

    // lights. three r155+ uses physical units, so intensities are multiplied by PI to keep the
    // look I previewed. If the crystal looks too bright or too dark, tweak these four numbers.
    scene.add(new THREE.AmbientLight(accent.clone().multiplyScalar(0.55), 0.7 * Math.PI));
    const key = new THREE.DirectionalLight(0xffffff, 1.25 * Math.PI); key.position.set(-6, 7, 9); scene.add(key);
    const fill = new THREE.PointLight(accent, 1.8 * Math.PI, 40, 0); fill.position.set(5, -4, 6); scene.add(fill);
    const rim = new THREE.PointLight(0x8f7bff, 1.6 * Math.PI, 40, 0); rim.position.set(-5, 2, -5); scene.add(rim);

    // ---- sizing ----
    let fit = 1;
    let baseY = 0;
    const resize = () => {
      const w = window.innerWidth; const h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
      const visH = 2 * Math.tan((camera.fov * Math.PI) / 360) * 12;
      const visW = visH * camera.aspect;
      fit = Math.min(1, visW / 5.0);
      baseY = w < 1024 ? visH * 0.15 : 0;
      if (reduced) {
        camera.position.z = 12; root.scale.setScalar(fit); root.position.y = baseY;
        renderer.render(scene, camera);
      }
    };
    resize();
    let rzTimer;
    const onResize = () => { clearTimeout(rzTimer); rzTimer = setTimeout(resize, 80); };
    window.addEventListener('resize', onResize, { passive: true });

    // ---- pointer ----
    const m = { nx: 0, ny: 0 };
    const onMove = (e) => {
      if (e.pointerType === 'touch') return;
      m.nx = (e.clientX / window.innerWidth) * 2 - 1;
      m.ny = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    // ---- loop ----
    let raf = 0;
    let px = 0; let py = 0;
    const t0 = performance.now();
    let last = t0; let acc = 0; let frames = 0; let lastOpacity = '';

    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      const t = (now - t0) / 1000; const dt = now - last; last = now;
      const sy = window.scrollY || 0;
      const p = clamp(sy / (window.innerHeight * 0.9), 0, 1);
      if (sy > window.innerHeight * 1.15) return; // hero is long gone: stop drawing

      px += ((fine ? m.nx : Math.sin(t * 0.35) * 0.5) - px) * 0.05;
      py += ((fine ? m.ny : Math.cos(t * 0.28) * 0.3) - py) * 0.05;

      let ease = 0;
      if (startedAt.current) {
        const ip = clamp((now - startedAt.current) / 2400, 0, 1);
        ease = ip === 1 ? 1 : 1 - Math.pow(2, -10 * ip);
      }
      camera.position.set(px * 0.9, -py * 0.7, 26 - 14 * ease + p * 6);
      camera.lookAt(0, 0, 0);

      root.scale.setScalar(fit * (0.72 + 0.28 * ease));
      root.position.y = baseY + Math.sin(t * 0.8) * 0.12 - p * 1.2;
      root.rotation.y = px * 0.35 + Math.sin(t * 0.5) * 0.14;
      root.rotation.x = py * 0.22;
      crystal.rotation.y = t * 0.24; crystal.rotation.x = Math.sin(t * 0.3) * 0.22;
      shell.rotation.y = -t * 0.08; shell.rotation.x = t * 0.05;
      ring.rotation.z = t * 0.5; ring2.rotation.z = -t * 0.18;
      dust.rotation.y = t * 0.012;
      orbA.position.y = 3.1 + Math.sin(t * 0.6) * 0.3; orbB.position.y = -3.2 + Math.cos(t * 0.5) * 0.25;
      halo.material.opacity = 0.3 + Math.sin(t * 1.3) * 0.08;
      crystal.material.emissiveIntensity = 0.14 + (Math.sin(t * 1.3) * 0.5 + 0.5) * 0.12;

      const op = (1 - p * 0.88).toFixed(3);
      if (op !== lastOpacity) { canvas.style.opacity = op; lastOpacity = op; }
      renderer.render(scene, camera);

      // tiny quality governor: if frames run long, lower the pixel ratio (never below 1)
      acc += dt; frames += 1;
      if (frames >= 90) {
        if (acc / frames > 24 && pr > 1) { pr = Math.max(1, pr - 0.25); renderer.setPixelRatio(pr); resize(); }
        acc = 0; frames = 0;
      }
    };
    if (!reduced) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(rzTimer);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onMove);
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
        mats.forEach((mm) => mm.dispose());
      });
      soft.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} id="gl" aria-hidden="true" />;
}
