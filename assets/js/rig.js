/* ═══════════════════════════════════════════════════════════════
   Procedural drift, ported from CinematicMotion.swift.

   The frequency ratios (0.31 / 0.47 / 0.23) are deliberately
   incommensurate so the loop never visibly repeats, equal or
   harmonic frequencies produce an obvious cycle, which is the tell
   that separates procedural motion from real handheld footage.
   ═══════════════════════════════════════════════════════════════ */

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const AMP = {
  float:    { yaw: 0.085, pitch: 0.055, roll: 0.035, bob: 0.022 },
  showcase: { yaw: 0.420, pitch: 0.200, roll: 0.130, bob: 0.090 }
};

const DEG = 180 / Math.PI;

function makeRig(stageEl, rigEl, glassEl, opts) {
  if (!stageEl || !rigEl) return null;

  const amp = AMP[opts.mode];
  const speed = opts.speed || 1;
  const drag = !!opts.drag;

  // Pointer tracking is decorative, so it gets a spring rather than a
  // straight lerp, tying rotation directly to cursor position reads as
  // artificial because it carries no momentum.
  let tgtY = 0, tgtX = 0, curY = 0, curX = 0, velY = 0, velX = 0;
  const STIFF = 110, DAMP = 16;

  if (drag) {
    const onMove = (e) => {
      const r = stageEl.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      tgtY = nx * 0.42;
      tgtX = -ny * 0.26;
    };
    stageEl.addEventListener('pointermove', onMove);
    stageEl.addEventListener('pointerleave', () => { tgtY = 0; tgtX = 0; });
  }

  return function step(t, dt) {
    const s = t * speed;

    let yaw   = amp.yaw   * Math.sin(s * 0.31);
    let pitch = amp.pitch * Math.sin(s * 0.47 + 1.1);
    let roll  = amp.roll  * Math.sin(s * 0.23 + 2.3);
    const bob = amp.bob   * Math.sin(s * 0.37 + 0.6);

    // semi-implicit spring, integrated on real dt so a 120Hz display
    // settles at the same rate as a 60Hz one
    velY += (tgtY - curY) * STIFF * dt;  velY *= Math.exp(-DAMP * dt);  curY += velY * dt;
    velX += (tgtX - curX) * STIFF * dt;  velX *= Math.exp(-DAMP * dt);  curX += velX * dt;
    yaw   += curY;
    pitch += curX;

    rigEl.style.transform =
      'translateY(' + (bob * 46).toFixed(2) + 'px)' +
      ' rotateX(' + (pitch * DEG).toFixed(2) + 'deg)' +
      ' rotateY(' + (yaw   * DEG).toFixed(2) + 'deg)' +
      ' rotateZ(' + (roll  * DEG).toFixed(2) + 'deg)';

    // the key light stays put, so the sheen sweeps as the glass turns
    if (glassEl) {
      glassEl.style.setProperty('--sheen-a', (118 + yaw * DEG * 2.4).toFixed(1) + 'deg');
    }
  };
}

const rigs = [
  makeRig(document.getElementById('heroStage'),  document.getElementById('heroRig'),  document.getElementById('heroGlass'),  { mode: 'showcase', speed: 2.2, drag: true }),
  makeRig(document.getElementById('proofStage'), document.getElementById('proofRig'), document.getElementById('proofGlass'), { mode: 'showcase', speed: 1.9 }),
  makeRig(document.getElementById('floatStage'), document.getElementById('floatRig'), document.getElementById('floatGlass'), { mode: 'float',    speed: 2.4 }),
  makeRig(document.getElementById('showStage'),  document.getElementById('showRig'),  document.getElementById('showGlass'),  { mode: 'showcase', speed: 2.4 })
].filter(Boolean);

if (reduced) {
  // hold a considered pose rather than animating
  rigs.forEach(fn => fn(3.4, 0.016));
} else {
  const t0 = performance.now();
  let prev = t0;
  (function frame(now) {
    const t = (now - t0) / 1000;
    const dt = Math.min((now - prev) / 1000, 0.05); // clamp: a backgrounded tab
    prev = now;                                     // must not fling the spring
    for (const fn of rigs) fn(t, dt);
    requestAnimationFrame(frame);
  })(t0);
}
