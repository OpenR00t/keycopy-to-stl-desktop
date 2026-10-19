// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 The KeyCopy to STL contributors

/* KeyCopy → STL core. Units: inches for specs, millimetres for geometry/mesh. */
(function (root) {
  'use strict';
  const IN = 25.4;

  // ---------------------------------------------------------------------------
  // Format table.
  // `app` mirrors KeyCopier's key_formats.c (what the Flipper draws on screen).
  // `spec` holds published values where verified; any field missing falls back to app.
  //   spec.first/inc  : spacing from shoulder (bow → tip) for shoulder-stopped keys
  //   spec.tipFirst   : distance from tip to the cut nearest the tip (tip-stopped keys)
  //   spec.d0/dstep   : root depth of the app's min index, and per-index increment
  //   spec.fullWidth  : double-sided depths quoted as remaining full blade width
  // `blade` is the uncut blade height and `len` the shoulder-to-tip length, where known.
  // ---------------------------------------------------------------------------
  const F = (o) => o;
  const FORMATS = [
    F({ id: 'KW1', mfr: 'Kwikset', sheet: 'https://lsamichigan.org/Tech/Kwikset_KeySpecs.pdf', sides: 1, tip: false, pins: 5,
      app: { first: .247, last: .847, inc: .15, root: .084, angle: 90, elbow: .15, uncut: .329, step: .023, min: 1, max: 7, macs: 4 },
      spec: { first: .247, inc: .150, d0: .329, dstep: .023, root: .084, angle: 90, src: 'Kwikset spec sheet; T. J. Thomas, Key Bitting Specifications (2025) p.57' },
      blade: .335, warding: 'Kwikset KW1' }),
    F({ id: 'SC4', mfr: 'Schlage', sheet: 'https://lsamichigan.org/Tech/SCHLAGE_KeySpecs.pdf', sides: 1, tip: false, pins: 6,
      app: { first: .231, last: 1.012, inc: .1562, root: .031, angle: 90, elbow: .1, uncut: .335, step: .015, min: 0, max: 9, macs: 7 },
      spec: { first: .231, inc: .1562, d0: .335, dstep: .015, root: .031, angle: 100, src: 'Schlage spec sheet; Thomas p.76' },
      blade: .343, warding: 'Schlage C' }),
    F({ id: 'AR4', mfr: 'Arrow', sheet: 'HPC C2', sides: 1, tip: false, pins: 6,
      app: { first: .265, last: 1.040, inc: .155, root: .060, angle: 90, elbow: .1, uncut: .312, step: .014, min: 0, max: 9, macs: 6 },
      spec: { first: .265, inc: .155, d0: .312, dstep: .014, root: .046, angle: 100, src: 'Thomas p.40 (Arrow New Large Pin)' } }),
    F({ id: 'M1', mfr: 'Master Lock', sheet: 'HPC C35', sides: 1, tip: false, pins: 5,
      app: { first: .185, last: .689, inc: .126, root: .039, angle: 90, elbow: .1, uncut: .276, step: .015, min: 0, max: 7, macs: 7 }, spec: null }),
    // Master's 4-pin padlock key (No. 1, 3, 5 and other laminated padlocks; Ilco M1). The app's M1 above draws 5 pins.
    F({ id: '1K', mfr: 'Master Lock', sheet: 'https://cdn.masterlock.com/masterlock/resources/documents/pdf/7000-0031_Technical_Manual_pg_25.pdf', sides: 1, tip: false, pins: 4,
      app: { first: .187, last: .562, inc: .125, root: .050, angle: 90, elbow: .042, uncut: .272, step: .0155, min: 0, max: 7, macs: 7 },
      spec: { first: .187, inc: .125, d0: .272, dstep: .0155, root: .050, angle: 100, src: 'Master Lock Technical Manual p.25 (1K); cut flat, cut angle and blade length from the keygen project’s Master model' },
      blade: .281, len: .732, warding: 'Master K1' }),
    F({ id: 'AM7', mfr: 'American', sheet: 'HPC C80', sides: 1, tip: false, pins: 6,
      app: { first: .157, last: .781, inc: .125, root: .039, angle: 90, elbow: .1, uncut: .283, step: .016, min: 1, max: 8, macs: 7 },
      spec: { first: .156, inc: .125, d0: .284, dstep: .0156, root: .052, angle: 90, src: 'Thomas p.39 (American-Junkunc Small Pin)' } }),
    F({ id: 'Y2', mfr: 'Yale', sheet: 'HPC C57', sides: 1, tip: false, pins: 6,
      app: { first: .200, last: 1.025, inc: .165, root: .054, angle: 90, elbow: .1, uncut: .320, step: .019, min: 0, max: 9, macs: 9 },
      spec: { first: .200, inc: .165, d0: .320, dstep: .019, root: .054, angle: 95, src: 'Yale .019 spec sheet; Thomas p.81' }, blade: .320 }),
    F({ id: 'Y11', mfr: 'Yale', sheet: 'HPC CX55', sides: 1, tip: false, pins: 5,
      app: { first: .124, last: .502, inc: .095, root: .039, angle: 90, elbow: .1, uncut: .246, step: .020, min: 1, max: 5, macs: 7 },
      spec: { first: .125, inc: .095, d0: .250, dstep: .020, root: .044, angle: 90, src: 'Thomas p.102 (Yale Disc Tumbler)' } }),
    F({ id: 'S22', mfr: 'Sargent', sheet: 'HPC C44', sides: 1, tip: false, pins: 6,
      app: { first: .216, last: .996, inc: .156, root: .063, angle: 90, elbow: .1, uncut: .328, step: .020, min: 1, max: 10, macs: 7 },
      spec: { first: .215, inc: .156, d0: .330, dstep: .020, root: .051, angle: 76, src: 'Thomas p.74 (Sargent .020)' } }),
    F({ id: 'NA25', mfr: 'National', sheet: 'HPC C40', sides: 1, tip: false, pins: 5,
      app: { first: .250, last: .874, inc: .156, root: .039, angle: 90, elbow: .1, uncut: .304, step: .012, min: 0, max: 9, macs: 7 }, spec: null }),
    F({ id: 'CO88', mfr: 'Corbin', sheet: 'HPC C14', sides: 1, tip: false, pins: 6,
      app: { first: .250, last: 1.030, inc: .156, root: .047, angle: 90, elbow: .1, uncut: .343, step: .014, min: 1, max: 10, macs: 7 },
      spec: { first: .250, inc: .156, d0: .339, dstep: .014, root: .053, angle: 90, src: 'Thomas p.47 (Corbin Z Class, Pre-System 70)' } }),
    F({ id: 'LW4', mfr: 'Lockwood', sheet: '', sides: 1, tip: false, pins: 5,
      app: { first: .245, last: .870, inc: .1562, root: .031, angle: 90, elbow: .1, uncut: .344, step: .014, min: 0, max: 9, macs: 9 }, spec: null }),
    F({ id: 'LW5', mfr: 'Lockwood', sheet: '', sides: 1, tip: false, pins: 6,
      app: { first: .245, last: 1.0262, inc: .1562, root: .031, angle: 90, elbow: .1, uncut: .344, step: .014, min: 0, max: 9, macs: 9 }, spec: null }),
    F({ id: 'NA12', mfr: 'National', sheet: 'HPC C39', sides: 1, tip: false, pins: 5,
      app: { first: .150, last: .710, inc: .140, root: .039, angle: 90, elbow: .1, uncut: .270, step: .013, min: 0, max: 9, macs: 7 }, spec: null }),
    F({ id: 'RU45', mfr: 'Russwin', sheet: 'HPC CX6', sides: 1, tip: false, pins: 6,
      app: { first: .250, last: 1.030, inc: .156, root: .053, angle: 90, elbow: .1, uncut: .343, step: .028, min: 1, max: 6, macs: 5 },
      spec: { first: .250, inc: .156, d0: .339, dstep: .028, root: .053, angle: 90, src: 'Thomas p.44 (Corbin Russwin System 70)' } }),
    F({ id: 'WR3', mfr: 'Weiser', sheet: 'https://www.lockwiki.com/index.php/Weiser_Classic', sides: 1, tip: false, pins: 5,
      app: { first: .237, last: .861, inc: .156, root: .090, angle: 90, elbow: .150, uncut: .315, step: .018, min: 0, max: 10, macs: 6 },
      spec: { first: .237, inc: .156, d0: .315, dstep: .018, root: .090, angle: 100, src: 'Thomas p.78 (Weiser)' } }),
    F({ id: 'H75', mfr: 'Ford', sheet: 'HPC CX101', sides: 2, tip: true, pins: 8,
      app: { first: .201, last: .845, inc: .092, root: .039, angle: 90, elbow: .201, uncut: .354, step: .025, min: 1, max: 5, macs: 5 },
      spec: { tipFirst: .200, inc: .0921, d0: .354, dstep: .050, fullWidth: true, src: 'Ford/STRATTEC service sheet 7L2A-7843432 (depths 9.00–3.90 mm)' } }),
    F({ id: 'B102', mfr: 'Chevrolet', sheet: '', sides: 2, tip: true, pins: 10,
      app: { first: .205, last: 1.037, inc: .093, root: .039, angle: 90, elbow: .205, uncut: .315, step: .026, min: 1, max: 4, macs: 5 },
      spec: { tipFirst: .205, inc: .0921, d0: .315, dstep: .025, fullWidth: true, src: 'Locksmith Ledger, GM ten-cut locks (spacing from tip; full-width depths)' } }),
    F({ id: 'Y159', mfr: 'Dodge', sheet: 'HPC CX102', sides: 2, tip: true, pins: 8,
      app: { first: .297, last: .941, inc: .092, root: .039, angle: 90, elbow: .297, uncut: .339, step: .047, min: 1, max: 4, macs: 5 },
      spec: { tipFirst: .309, inc: .092, src: 'National Locksmith v73 n2 (spacing only; depths not verified)' } }),
    F({ id: 'KA14', mfr: 'Kawasaki', sheet: 'HPC CMC50', sides: 2, tip: false, pins: 6,
      app: { first: .098, last: .591, inc: .098, root: .039, angle: 90, elbow: .1, uncut: .258, step: .020, min: 1, max: 4, macs: 4 }, spec: null }),
    F({ id: 'SUZ18', mfr: 'Suzuki', sheet: 'X241', sides: 2, tip: false, pins: 7,
      app: { first: .16, last: .73, inc: .095, root: .045, angle: 90, elbow: .1, uncut: .28, step: .020, min: 1, max: 4, macs: 4 }, spec: null }),
    F({ id: 'YM63', mfr: 'Yamaha', sheet: 'HPC CMC71', sides: 2, tip: false, pins: 7,
      app: { first: .157, last: .748, inc: .098, root: .039, angle: 90, elbow: .1, uncut: .295, step: .020, min: 1, max: 4, macs: 4 }, spec: null }),
    F({ id: 'SFIC', mfr: 'Best (A2)', sheet: 'HPC C3', sides: 1, tip: true, pins: 6,
      app: { first: .250, last: .998, inc: .149, root: .051, angle: 90, elbow: .081, uncut: .318, step: .025, min: 0, max: 9, macs: 5 },
      spec: { tipFirst: .088, inc: .150, d0: .318, dstep: .0125, root: .054, angle: 90, src: 'Thomas p.41 (BEST A2, spacing from tip stop)' },
      blade: .330, warding: 'Best A' }),
    F({ id: 'RV', mfr: 'RV (FIC,GL,Bauer)', sheet: 'Card', sides: 2, tip: false, pins: 5,
      app: { first: .126, last: .504, inc: .094, root: .039, angle: 90, elbow: .126, uncut: .260, step: .040, min: 1, max: 3, macs: 3 }, spec: null }),
  ];
  const byId = Object.fromEntries(FORMATS.map((f) => [f.id.toUpperCase(), f]));

  // ---------------------------------------------------------------------------
  // .keycopy parser (FlipperFormat "Key: Value" text)
  // ---------------------------------------------------------------------------
  function parseKeycopy(text) {
    const kv = {};
    for (const raw of text.split(/\r?\n/)) {
      const i = raw.indexOf(':');
      if (i < 0) continue;
      kv[raw.slice(0, i).trim().toLowerCase()] = raw.slice(i + 1).trim();
    }
    if (!/key copier/i.test(kv['filetype'] || '')) throw new Error('This isn’t a Key Copier file (missing “Filetype: Flipper Key Copier File”).');
    const name = kv['format name'] || '';
    const bitStr = kv['bitting pattern'] || '';
    const bitting = bitStr.split(/[-\s,]+/).filter(Boolean).map(Number);
    if (!bitting.length || bitting.some((n) => !Number.isFinite(n))) throw new Error('Couldn’t read the bitting pattern “' + bitStr + '”.');
    return {
      manufacturer: kv['manufacturer'] || '', formatName: name, dataSheet: kv['data sheet'] || '',
      pins: parseInt(kv['number of pins'] || bitting.length, 10), macs: parseInt(kv['maximum adjacent cut specification (macs)'] || '0', 10),
      bitting, format: byId[name.toUpperCase()] || null,
    };
  }

  // ---------------------------------------------------------------------------
  // Resolve a format + options into concrete cut geometry (inches)
  // ---------------------------------------------------------------------------
  function resolve(fmt, bitting, opt) {
    const a = fmt.app, s = (opt.source === 'spec' && fmt.spec) ? fmt.spec : {};
    const n = fmt.pins;
    const tipX = a.last + a.elbow; // where the app puts the tip (meaningful for tip-stopped keys)
    const inc = s.inc ?? a.inc;
    let xs;
    if (fmt.tip && s.tipFirst != null) xs = bitting.map((_, k) => tipX - (s.tipFirst + (n - 1 - k) * inc));
    else { const first = s.first ?? a.first; xs = bitting.map((_, k) => first + k * inc); }
    const root = (opt.root ?? (s.root ?? a.root));
    const angle = opt.angle ?? (s.angle ?? a.angle);
    const d0 = s.d0 ?? a.uncut, ds = s.dstep ?? a.step;
    const off = (opt.depthOffset || 0); // inches, + = deeper
    let blade, cuts; // cuts = amount removed from the cut edge (per side)
    if (fmt.sides === 2) {
      blade = a.uncut; // full blade width (matches Ford factory 9.00 mm; GM .315)
      cuts = bitting.map((d) => (s.fullWidth ? (d - a.min) * ds / 2 : (d - a.min) * ds) + off);
    } else {
      blade = Math.max(fmt.blade || 0, a.uncut, d0);
      cuts = bitting.map((d) => blade - (d0 - (d - a.min) * ds) + off);
    }
    if (opt.bladeHeight) blade = opt.bladeHeight;
    return { xs, cuts, root, angle, blade, tipX, sides: fmt.sides, tipStop: fmt.tip, elbow: a.elbow, last: Math.max(...xs), len: fmt.len };
  }

  // ---------------------------------------------------------------------------
  // Exact piecewise-linear blade profile (inches). Returns top/bottom chains.
  // ---------------------------------------------------------------------------
  function bladeProfile(g, x0) {
    const H = g.blade, k = 1 / Math.tan((g.angle / 2) * Math.PI / 180), hw = g.root / 2;
    const top = [], bot = []; // lines y = m x + c ; top = min(lines), bot = max(lines)
    top.push([0, H]);
    for (let i = 0; i < g.xs.length; i++) {
      const c = g.xs[i], r = H - g.cuts[i];
      if (g.cuts[i] <= 1e-9) continue;
      // cut i as a "V with flat": y >= r, y >= r + k(c-hw-x), y >= r + k(x-c-hw) → contributes the max of these
      top.push({ cut: [[0, r], [-k, r + k * (c - hw)], [k, r - k * (c + hw)]] });
      if (g.sides === 2) bot.push({ cut: [[0, H - r], [k, H - r - k * (c - hw)], [-k, H - r + k * (c + hw)]] });
    }
    const lastEdge = g.last + hw;
    let xEnd;
    if (g.sides === 1 && !g.tipStop) {
      const L = g.last + g.elbow; // bottom chamfer start (app's "elbow")
      const Lt = lastEdge + 0.03; // top chamfer start
      top.push([-1, H + Lt]); bot.push([0, 0]); bot.push([1, -L]);
      xEnd = (H + Lt + L) / 2;
      // a known blade length squares the point off there, so the key can't bottom out before the shoulder seats
      if (g.len) xEnd = Math.min(xEnd, Math.max(g.len, lastEdge + 0.02));
    } else {
      xEnd = g.tipX;
      const room = Math.max(0.005, xEnd - lastEdge - 0.01);
      const c = Math.min(g.sides === 2 ? 0.3 * H : 0.25 * H, room);
      const Ls = xEnd - c;
      top.push([-1, H + Ls]);
      if (g.sides === 2) bot.push([1, -Ls]); else bot.push([0, 0]);
      if (g.sides === 2) bot.push([0, 0]);
    }
    if (g.sides === 1 && !bot.length) bot.push([0, 0]);
    const flat = (arr) => arr.flatMap((l) => (l.cut ? l.cut : [l]));
    const TL = flat(top), BL = flat(bot);
    const evalTop = (x) => { let y = Infinity; for (const l of top) { const v = l.cut ? Math.max(...l.cut.map(([m, c]) => m * x + c)) : l[0] * x + l[1]; if (v < y) y = v; } return y; };
    const evalBot = (x) => { let y = -Infinity; for (const l of bot) { const v = l.cut ? Math.min(...l.cut.map(([m, c]) => m * x + c)) : l[0] * x + l[1]; if (v > y) y = v; } return Math.max(0, y); };
    // candidate breakpoints
    const all = TL.concat(BL), xsC = new Set([x0, xEnd]);
    for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
      const [m1, c1] = all[i], [m2, c2] = all[j];
      if (Math.abs(m1 - m2) < 1e-12) continue;
      const x = (c2 - c1) / (m1 - m2);
      if (x > x0 && x < xEnd) xsC.add(x);
    }
    let X = [...xsC].sort((p, q) => p - q);
    // find where top meets bottom (pointed tip) and truncate
    let endIdx = X.length - 1;
    for (let i = 1; i < X.length; i++) if (X[i] > g.last && evalTop(X[i]) - evalBot(X[i]) <= 1e-9) { endIdx = i; break; }
    X = X.slice(0, endIdx + 1);
    const simplify = (pts) => {
      const out = [];
      for (const p of pts) {
        if (out.length && Math.abs(out[out.length - 1][0] - p[0]) < 1e-9 && Math.abs(out[out.length - 1][1] - p[1]) < 1e-9) continue;
        while (out.length >= 2) {
          const [a, b] = [out[out.length - 2], out[out.length - 1]];
          const cr = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
          if (Math.abs(cr) < 1e-12) out.pop(); else break;
        }
        out.push(p);
      }
      return out;
    };
    const T = simplify(X.map((x) => [x, Math.min(evalTop(x), H)]));
    const B = simplify(X.map((x) => [x, Math.max(evalBot(x), 0)]));
    return { top: T, bot: B, H, xEnd: X[X.length - 1] };
  }

  // ---------------------------------------------------------------------------
  // Polygons for the side view (mm).  Bow + blade outline + ring hole.
  // ---------------------------------------------------------------------------
  function circlePts(cx, cy, r, n, ccw) {
    const p = [];
    for (let i = 0; i < n; i++) { const t = (ccw ? 1 : -1) * 2 * Math.PI * i / n; p.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]); }
    return p;
  }
  function roundedRect(x0, y0, x1, y1, r, seg) {
    r = Math.min(r, (x1 - x0) / 2, (y1 - y0) / 2);
    const p = [];
    const arc = (cx, cy, a0) => { for (let i = 0; i <= seg; i++) { const t = a0 + (Math.PI / 2) * i / seg; p.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]); } };
    // only the far (left) corners are rounded; right edge meets the blade square
    p.push([x1, y0]); p.push([x1, y1]);
    arc(x0 + r, y1 - r, Math.PI / 2);
    arc(x0 + r, y0 + r, Math.PI);
    return p; // CCW
  }

  // Fillet every corner of a closed polygon. r: number or per-vertex array. Works for convex and concave corners.
  function fillet(pts, r, frac) {
    const n = pts.length, out = [];
    for (let i = 0; i < n; i++) {
      const P = pts[i], A = pts[(i + n - 1) % n], B = pts[(i + 1) % n];
      let rad = Array.isArray(r) ? r[i] : r;
      const la = Math.hypot(A[0] - P[0], A[1] - P[1]), lb = Math.hypot(B[0] - P[0], B[1] - P[1]);
      const d1 = [(A[0] - P[0]) / la, (A[1] - P[1]) / la], d2 = [(B[0] - P[0]) / lb, (B[1] - P[1]) / lb];
      const th = Math.acos(Math.max(-1, Math.min(1, d1[0] * d2[0] + d1[1] * d2[1])));
      if (!rad || th > Math.PI - 1e-3 || th < 1e-3) { out.push(P); continue; }
      let t = rad / Math.tan(th / 2);
      const tmax = (frac ? frac[i] : 0.48) * Math.min(la, lb);
      if (t > tmax) { t = tmax; rad = t * Math.tan(th / 2); }
      const T1 = [P[0] + d1[0] * t, P[1] + d1[1] * t], T2 = [P[0] + d2[0] * t, P[1] + d2[1] * t];
      const bis = [d1[0] + d2[0], d1[1] + d2[1]], bl = Math.hypot(bis[0], bis[1]);
      const h = rad / Math.sin(th / 2), C = [P[0] + bis[0] / bl * h, P[1] + bis[1] / bl * h];
      let a1 = Math.atan2(T1[1] - C[1], T1[0] - C[0]), a2 = Math.atan2(T2[1] - C[1], T2[0] - C[0]);
      let da = a2 - a1; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
      const seg = Math.max(2, Math.ceil(Math.abs(da) / (Math.PI / 14)));
      for (let k = 0; k <= seg; k++) { const a = a1 + da * k / seg; out.push([C[0] + rad * Math.cos(a), C[1] + rad * Math.sin(a)]); }
    }
    return out;
  }
  const area = (p) => { let s = 0; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; };
  const orient = (p, ccw) => ((area(p) > 0) === ccw ? p : p.slice().reverse());
  // rotate loop so it starts at the bottom of the straight edge at x = xr, followed by its top
  function startAtShoulder(loop, xr) {
    let best = -1;
    for (let i = 0; i < loop.length; i++) {
      const p = loop[i], q = loop[(i + 1) % loop.length];
      if (Math.abs(p[0] - xr) < 1e-9 && Math.abs(q[0] - xr) < 1e-9 && q[1] > p[1]) { best = i; break; }
    }
    return best < 0 ? loop : loop.slice(best).concat(loop.slice(0, best));
  }

  // Kwikset-style shield head. Local frame: u = distance from the far end (0) to the shoulder (L), v = across, centred.
  function shieldHead(x0, cy, L, W, collarW, cutouts, fit) {
    fit = fit || {};
    const collarL = Math.min(3, L * 0.15), Lh = L - collarL, sx = W / 21, sy = Lh / 21;
    const cw = collarW / 2, hw = W / 2, ys = (fit.ys ?? 5.75) * sy;
    const P = (u, v) => [x0 - L + u, cy + v];
    // corners (u, v) going CCW in (x,y) when mapped; radii per corner
    const outer = [
      [L, -cw], [L, cw], [Lh, cw], [Lh, hw], [ys, hw], [(fit.tu ?? -1) * sy, 0], [ys, -hw], [Lh, -hw], [Lh, -cw],
    ].map(([u, v]) => P(u, v));
    const rOuter = [0.6, 0.6, 0.35, 5 * Math.min(sx, sy), (fit.rc ?? 5.5) * sx, (fit.rt ?? 5) * sx, (fit.rc ?? 5.5) * sx, 5 * Math.min(sx, sy), 0.35];
    const fOuter = [0.45, 0.45, 0.02, 0.97, 0.6, 0.45, 0.6, 0.97, 0.02];
    let o = orient(fillet(outer, rOuter, fOuter), true);
    o = startAtShoulder(o.map((p) => [Math.abs(p[0] - x0) < 1e-7 ? x0 : p[0], p[1]]), x0);
    const loops = [o];
    if (cutouts) {
      const S = (pts) => pts.map(([v, u]) => P(u * sy, v * sx));
      const kite = S([[0, 1.6], [3.7, 4.2], [0, 8.4], [-3.7, 4.2]]);
      const left = S([[-7.8, 6.1], [-2.5, 11.6], [-2.5, 12.7], [-7.8, 12.7]]);
      const right = S([[7.8, 6.1], [2.5, 11.6], [2.5, 12.7], [7.8, 12.7]]);
      loops.push(orient(fillet(kite, [0.9, 0.6, 0.7, 0.6]), false));
      loops.push(orient(fillet(left, 0.6), false), orient(fillet(right, 0.6), false));
    }
    return loops;
  }

  function buildOutline(fmt, bitting, opt) {
    const g = resolve(fmt, bitting, opt);
    const neck = (opt.neck ?? (fmt.tip ? 0.12 : 0)); // inches
    const x0 = -neck;
    const prof = bladeProfile(g, x0);
    const mm = (p) => [p[0] * IN, p[1] * IN];
    // blade loop CCW: bottom chain left→right, then top chain right→left
    const blade = prof.bot.map(mm);
    const topR = prof.top.slice().reverse().map(mm);
    if (Math.abs(topR[0][0] - blade[blade.length - 1][0]) < 1e-6 && Math.abs(topR[0][1] - blade[blade.length - 1][1]) < 1e-6) topR.shift();
    const bladeLoop = blade.concat(topR);
    // bow
    const H = g.blade * IN, cy = H / 2;
    const style = opt.headStyle || 'shield';
    const bowL = opt.bowLength ?? 24, bowH = Math.max(opt.bowHeight ?? (style === 'shield' ? 21 : 24), H + 6);
    const bx1 = x0 * IN, bx0 = bx1 - bowL;
    let bowLoops;
    if (style === 'shield') {
      bowLoops = shieldHead(bx1, cy, bowL, bowH, Math.max(13, H + 4.5), opt.cutouts !== false, opt._fit);
    } else {
      const bow = roundedRect(bx0, cy - bowH / 2, bx1, cy + bowH / 2, opt.bowRadius ?? 7, 8);
      const holeD = opt.holeDiameter ?? 5;
      const hole = holeD > 0 ? circlePts(bx0 + Math.max(holeD / 2 + 2.5, 6), cy, holeD / 2, 40, false) : null;
      bowLoops = hole ? [bow, hole] : [bow];
    }
    return { g, prof, bladeLoop, bowLoops, H, x0mm: bx1, bx0, cy, bowH };
  }

  // ---------------------------------------------------------------------------
  // Warding cross-section (mm, (z,y) with y from blade bottom). Returns loops.
  // ---------------------------------------------------------------------------
  // merge coordinate values closer than tol (mm) so hand-traced profiles have exact horizontals/verticals
  function snapCoords(pts, tol) {
    const snapAxis = (k) => {
      const vals = pts.map((p) => p[k]).sort((a, b) => a - b), rep = new Map();
      let start = 0;
      for (let i = 1; i <= vals.length; i++) if (i === vals.length || vals[i] - vals[i - 1] > tol) {
        const grp = vals.slice(start, i), m = grp.reduce((a, b) => a + b, 0) / grp.length;
        for (const v of grp) rep.set(v, m); start = i;
      }
      return rep;
    };
    const rz = snapAxis(0), ry = snapAxis(1);
    const out = [];
    for (const p of pts) { const q = [rz.get(p[0]), ry.get(p[1])]; const o = out[out.length - 1]; if (!o || o[0] !== q[0] || o[1] !== q[1]) out.push(q); }
    if (out.length > 1 && out[0][0] === out[out.length - 1][0] && out[0][1] === out[out.length - 1][1]) out.pop();
    return out;
  }

  function wardingLoops(name, H, opt, WARD, Clipper) {
    const T = opt.thickness ?? 2.0;
    if (!name || name === 'flat' || !WARD[name]) {
      return { loops: [[[-T / 2, -0.001], [T / 2, -0.001], [T / 2, H + 0.001], [-T / 2, H + 0.001]]], thick: T, zmin: -T / 2, zmax: T / 2 };
    }
    let pts = snapCoords(WARD[name], 0.02);
    const h0 = Math.max(...pts.map((p) => p[1]));
    pts = pts.map(([z, y]) => [z, y * H / h0]);
    let loops = [pts];
    const fit = opt.fit ?? 0.1;
    if (fit > 0 && Clipper) {
      const S = 1e5;
      const co = new Clipper.ClipperOffset(2, 0.25 * S);
      co.AddPath(pts.map(([x, y]) => ({ X: Math.round(x * S), Y: Math.round(y * S) })), Clipper.JoinType.jtMiter, Clipper.EndType.etClosedPolygon);
      const sol = new Clipper.Paths();
      co.Execute(sol, -fit * S);
      loops = sol.map((p) => p.map((q) => [q.X / S, q.Y / S]));
      // restore full blade height so cut depths stay referenced to the blade's bottom edge
      let ymin = Infinity, ymax = -Infinity;
      for (const l of loops) for (const p of l) { ymin = Math.min(ymin, p[1]); ymax = Math.max(ymax, p[1]); }
      loops = loops.map((l) => l.map(([z, y]) => [z, (y - ymin) * H / (ymax - ymin)]));
    }
    // pad slightly beyond blade edges so the profile (not the warding) defines edges
    loops = loops.map((l) => l.map(([z, y]) => [z, y <= 1e-9 ? -0.001 : y >= H - 1e-9 ? H + 0.001 : y]));
    let zmin = Infinity, zmax = -Infinity;
    for (const l of loops) for (const p of l) { zmin = Math.min(zmin, p[0]); zmax = Math.max(zmax, p[0]); }
    return { loops, thick: zmax - zmin, zmin, zmax };
  }

  // Largest distance between the bed plane and the lowest material, across the bitting half of the blade.
  function bedGap(loops, y0, y1, bedZ) {
    let worst = 0;
    for (let y = y0 + 0.025; y <= y1; y += 0.05) {
      let best = Infinity;
      for (const l of loops) for (let i = 0; i < l.length; i++) {
        const a = l[i], b = l[(i + 1) % l.length];
        if ((a[1] - y) * (b[1] - y) >= 0 || a[1] === b[1]) continue;
        const z = a[0] + (y - a[1]) * (b[0] - a[0]) / (b[1] - a[1]);
        best = Math.min(best, Math.abs(z - bedZ));
      }
      if (best < Infinity) worst = Math.max(worst, best);
    }
    return worst;
  }

  // ---------------------------------------------------------------------------
  // Watertight mesher.
  // Solid = { (x,y,z) : (x,y)∈Bow and z∈[zb0,zb1] }  ∪  { (x,y)∈Blade and (y,z)∈Warding }.
  // Slice into y-bands at every vertex height; inside a band every boundary is a line
  // linear in y, so the cross-section is a grid of cells with fixed solid/empty state.
  // Emit grid-boundary faces per band + symmetric-difference caps between bands.
  // ---------------------------------------------------------------------------
  function mesh(outline, ward, opt) {
    // head is flush with whichever blade face goes down on the bed
    const bowT = Math.max(opt.bowThickness ?? 3, ward.thick);
    const zb0 = opt.flip ? ward.zmin + ward.thick - bowT : ward.zmin, zb1 = zb0 + bowT;
    const XY = { bow: outline.bowLoops, blade: [outline.bladeLoop] };
    const YZ = ward.loops.map((l) => l.map(([z, y]) => [y, z])); // as (y, z)
    const ev = new Set();
    const addEv = (loops, yi) => { for (const l of loops) for (const p of l) ev.add(p[yi]); };
    addEv(XY.bow, 1); addEv(XY.blade, 1); addEv(YZ, 0);
    const Y = [];
    for (const v of [...ev].sort((a, b) => a - b)) if (!Y.length || v - Y[Y.length - 1] > 1e-9) Y.push(v);

    // edges crossing band [ya,yb] → lines (value at ya, value at yb); loops given as [u, y] (u=x) or [y, z] flag
    function crossing(loops, ya, yb, yIdx, uIdx) {
      const out = [];
      for (const l of loops) for (let i = 0; i < l.length; i++) {
        const p = l[i], q = l[(i + 1) % l.length];
        const y1 = p[yIdx], y2 = q[yIdx];
        if (Math.abs(y1 - y2) < 1e-12) continue;
        const lo = Math.min(y1, y2), hi = Math.max(y1, y2);
        if (lo > ya + 1e-9 || hi < yb - 1e-9) continue;
        const f = (y) => (Math.abs(y - y1) < 1e-8 ? p[uIdx] : Math.abs(y - y2) < 1e-8 ? q[uIdx] : p[uIdx] + (y - y1) * (q[uIdx] - p[uIdx]) / (y2 - y1));
        out.push([f(ya), f(yb)]);
      }
      return out;
    }
    const mid = (l) => (l[0] + l[1]) / 2;
    const intervals = (lines) => { const v = lines.map(mid).sort((a, b) => a - b); const r = []; for (let i = 0; i + 1 < v.length; i += 2) r.push([v[i], v[i + 1]]); return r; };
    const inside = (iv, u) => iv.some(([a, b]) => u > a && u < b);
    const dedupe = (lines) => {
      lines.sort((p, q) => mid(p) - mid(q));
      const out = [];
      for (const l of lines) { const o = out[out.length - 1]; if (o && Math.abs(o[0] - l[0]) < 1e-7 && Math.abs(o[1] - l[1]) < 1e-7) continue; out.push(l); }
      return out;
    };

    const bands = [];
    for (let k = 0; k + 1 < Y.length; k++) {
      const ya = Y[k], yb = Y[k + 1];
      if (yb - ya < 1e-9) continue;
      const bowL = crossing(XY.bow, ya, yb, 1, 0), bladeL = crossing(XY.blade, ya, yb, 1, 0);
      const wL = crossing(YZ, ya, yb, 0, 1);
      const bowI = intervals(bowL), bladeI = intervals(bladeL), wI = intervals(wL);
      const X = dedupe(bowL.concat(bladeL));
      const Z = dedupe(wL.concat(bowI.length ? [[zb0, zb0], [zb1, zb1]] : []));
      if (X.length < 2 || Z.length < 2) { bands.push({ ya, yb, X, Z, S: null }); continue; }
      const S = [];
      let any = false;
      for (let i = 0; i + 1 < X.length; i++) {
        const xm = (mid(X[i]) + mid(X[i + 1])) / 2, row = [];
        const inBow = inside(bowI, xm), inBlade = inside(bladeI, xm);
        for (let j = 0; j + 1 < Z.length; j++) {
          const zm = (mid(Z[j]) + mid(Z[j + 1])) / 2;
          const s = (inBow && zm > zb0 && zm < zb1) || (inBlade && inside(wI, zm));
          row.push(s); any = any || s;
        }
        S.push(row);
      }
      bands.push({ ya, yb, X, Z, S: any ? S : null });
    }

    const tris = []; // each: [p,q,r, dir]
    const pushQuadStrip = (bottom, top, dir) => {
      // bottom/top: ordered point lists along the same direction
      let i = 0, j = 0;
      while (i < bottom.length - 1 || j < top.length - 1) {
        const advB = j >= top.length - 1 || (i < bottom.length - 1 && (i + 1) / (bottom.length - 1 || 1) <= (j + 1) / (top.length - 1 || 1));
        if (advB) { tris.push([bottom[i], bottom[i + 1], top[j], dir]); i++; }
        else { tris.push([bottom[i], top[j + 1], top[j], dir]); j++; }
      }
    };
    const st = (b, i, j) => !!(b && b.S && i >= 0 && j >= 0 && i < b.S.length && j < b.S[0].length && b.S[i][j]);
    // cap grids at each event level
    const capAt = new Map();
    function capGrid(y, lower, upper) {
      const xs = [], zs = [];
      if (lower && lower.S) { lower.X.forEach((l) => xs.push(l[1])); lower.Z.forEach((l) => zs.push(l[1])); }
      if (upper && upper.S) { upper.X.forEach((l) => xs.push(l[0])); upper.Z.forEach((l) => zs.push(l[0])); }
      const u = (a) => { a.sort((p, q) => p - q); const o = []; for (const v of a) if (!o.length || v - o[o.length - 1] > 1e-7) o.push(v); return o; };
      return { xs: u(xs), zs: u(zs) };
    }
    const bandAt = (y, upper) => bands.find((b) => (upper ? Math.abs(b.ya - y) < 1e-12 : Math.abs(b.yb - y) < 1e-12)) || null;
    for (const y of Y) capAt.set(y, capGrid(y, bandAt(y, false), bandAt(y, true)));
    const between = (arr, a, b) => { const lo = Math.min(a, b), hi = Math.max(a, b); return arr.filter((v) => v > lo + 1e-7 && v < hi - 1e-7); };
    const chain = (a, b, inner) => { const pts = [a].concat(inner, [b]); return a <= b ? pts.sort((p, q) => p - q) : pts.sort((p, q) => q - p); };

    for (const b of bands) {
      if (!b.S) continue;
      const nx = b.X.length, nz = b.Z.length;
      const capA = capAt.get(b.ya), capB = capAt.get(b.yb);
      // x-faces
      for (let l = 0; l < nx; l++) for (let j = 0; j + 1 < nz; j++) {
        const L = st(b, l - 1, j), R = st(b, l, j);
        if (L === R) continue;
        const xa = b.X[l][0], xb = b.X[l][1];
        const zbA = chain(b.Z[j][0], b.Z[j + 1][0], between(capA.zs, b.Z[j][0], b.Z[j + 1][0]));
        const zbB = chain(b.Z[j][1], b.Z[j + 1][1], between(capB.zs, b.Z[j][1], b.Z[j + 1][1]));
        pushQuadStrip(zbA.map((z) => [xa, b.ya, z]), zbB.map((z) => [xb, b.yb, z]), [L ? 1 : -1, 0, 0]);
      }
      // z-faces
      for (let m = 0; m < nz; m++) for (let i = 0; i + 1 < nx; i++) {
        const D = st(b, i, m - 1), U = st(b, i, m);
        if (D === U) continue;
        const za = b.Z[m][0], zb = b.Z[m][1];
        const xbA = chain(b.X[i][0], b.X[i + 1][0], between(capA.xs, b.X[i][0], b.X[i + 1][0]));
        const xbB = chain(b.X[i][1], b.X[i + 1][1], between(capB.xs, b.X[i][1], b.X[i + 1][1]));
        pushQuadStrip(xbA.map((x) => [x, b.ya, za]), xbB.map((x) => [x, b.yb, zb]), [0, 0, D ? 1 : -1]);
      }
    }
    // caps
    const locate = (lines, v, endIdx) => { for (let i = 0; i + 1 < lines.length; i++) if (v > lines[i][endIdx] - 1e-9 && v < lines[i + 1][endIdx] + 1e-9) return i; return -1; };
    for (const y of Y) {
      const lo = bandAt(y, false), up = bandAt(y, true), cg = capAt.get(y);
      for (let i = 0; i + 1 < cg.xs.length; i++) for (let j = 0; j + 1 < cg.zs.length; j++) {
        const xm = (cg.xs[i] + cg.xs[i + 1]) / 2, zm = (cg.zs[j] + cg.zs[j + 1]) / 2;
        const sl = lo && lo.S ? st(lo, locate(lo.X, xm, 1), locate(lo.Z, zm, 1)) : false;
        const su = up && up.S ? st(up, locate(up.X, xm, 0), locate(up.Z, zm, 0)) : false;
        if (sl === su) continue;
        const a = [cg.xs[i], y, cg.zs[j]], b2 = [cg.xs[i + 1], y, cg.zs[j]], c = [cg.xs[i + 1], y, cg.zs[j + 1]], d = [cg.xs[i], y, cg.zs[j + 1]];
        const dir = [0, sl ? 1 : -1, 0];
        tris.push([a, b2, c, dir]); tris.push([a, c, d, dir]);
      }
    }
    // weld + orient
    const key = (p) => p.map((v) => Math.round(v * 1e6)).join(',');
    const vmap = new Map(), V = [], Fc = [];
    const idx = (p) => { const k = key(p); let i = vmap.get(k); if (i === undefined) { i = V.length; V.push(p); vmap.set(k, i); } return i; };
    for (const [p, q, r, dir] of tris) {
      let a = idx(p), b2 = idx(q), c = idx(r);
      if (a === b2 || b2 === c || a === c) continue;
      const P = V[a], Q = V[b2], R = V[c];
      const u = [Q[0] - P[0], Q[1] - P[1], Q[2] - P[2]], w = [R[0] - P[0], R[1] - P[1], R[2] - P[2]];
      const nrm = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
      const len = Math.hypot(...nrm);
      if (len < 1e-12) continue;
      if (nrm[0] * dir[0] + nrm[1] * dir[1] + nrm[2] * dir[2] < 0) { const t = b2; b2 = c; c = t; }
      Fc.push([a, b2, c]);
    }
    // place on bed (z from 0). "flip" = rotate 180° about the key's long axis so the other face is down.
    // (A rotation, never a mirror: mirroring would reverse the keyway warding.)
    let zmin = Infinity, zmax = -Infinity;
    for (const v of V) { zmin = Math.min(zmin, v[2]); zmax = Math.max(zmax, v[2]); }
    const Vout = opt.flip ? V.map(([x, y, z]) => [x, -y, zmax - z]) : V.map(([x, y, z]) => [x, y, z - zmin]);
    return { V: Vout, F: Fc };
  }

  function checkMesh(m) {
    const E = new Map();
    for (const [a, b, c] of m.F) for (const [p, q] of [[a, b], [b, c], [c, a]]) { const k = p + ',' + q; E.set(k, (E.get(k) || 0) + 1); }
    let open = 0, nonManifold = 0, flipped = 0;
    for (const [k, n] of E) { const [p, q] = k.split(','); const r = E.get(q + ',' + p) || 0; if (n > 1) nonManifold++; if (r === 0) open++; if (n !== r) flipped++; }
    let vol = 0;
    for (const [a, b, c] of m.F) { const A = m.V[a], B = m.V[b], C = m.V[c]; vol += (A[0] * (B[1] * C[2] - B[2] * C[1]) - A[1] * (B[0] * C[2] - B[2] * C[0]) + A[2] * (B[0] * C[1] - B[1] * C[0])) / 6; }
    return { watertight: open === 0 && nonManifold === 0, open, nonManifold, volume: vol, triangles: m.F.length };
  }

  function toSTL(m, name) {
    const n = m.F.length, buf = new ArrayBuffer(84 + 50 * n), dv = new DataView(buf);
    const hdr = ('KeyCopy STL ' + (name || '')).slice(0, 79);
    for (let i = 0; i < hdr.length; i++) dv.setUint8(i, hdr.charCodeAt(i) & 0x7f);
    dv.setUint32(80, n, true);
    let o = 84;
    for (const [a, b, c] of m.F) {
      const A = m.V[a], B = m.V[b], C = m.V[c];
      const u = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], w = [C[0] - A[0], C[1] - A[1], C[2] - A[2]];
      const nr = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
      const L = Math.hypot(...nr) || 1;
      for (const v of [nr[0] / L, nr[1] / L, nr[2] / L, ...A, ...B, ...C]) { dv.setFloat32(o, v, true); o += 4; }
      dv.setUint16(o, 0, true); o += 2;
    }
    return new Uint8Array(buf);
  }

  function toDXF(outline) {
    const lines = ['0', 'SECTION', '2', 'HEADER', '9', '$INSUNITS', '70', '4', '0', 'ENDSEC', '0', 'SECTION', '2', 'ENTITIES'];
    const loop = (pts, layer) => { for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; lines.push('0', 'LINE', '8', layer, '10', a[0].toFixed(5), '20', a[1].toFixed(5), '30', '0', '11', b[0].toFixed(5), '21', b[1].toFixed(5), '31', '0'); } };
    // merged outer outline: bow up to the blade, blade, bow back
    const bow = outline.bowLoops[0], bl = outline.bladeLoop, x0 = outline.x0mm;
    const yBot = bl[0][1], yTop = bl[bl.length - 1][1];
    const outer = [];
    for (const p of bow) { if (Math.abs(p[0] - x0) < 1e-9) continue; outer.push(p); }
    // bow loop is [x1,y0],[x1,y1],arcs...; rebuild: start at bow bottom-right, go to blade bottom, around blade, blade top to bow top-right, then arcs back
    const arcs = bow.slice(2);
    const pts = [[x0, bow[0][1]], ...bl, [x0, bow[1][1]], ...arcs];
    const clean = pts.filter((p, i) => i === 0 || Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) > 1e-9);
    loop(clean, 'OUTLINE');
    for (const h of outline.bowLoops.slice(1)) loop(h, 'HOLE');
    void yBot; void yTop; void outer;
    lines.push('0', 'ENDSEC', '0', 'EOF');
    return lines.join('\n');
  }

  // minimal store-only ZIP
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = (u8) => { let c = 0xffffffff; for (let i = 0; i < u8.length; i++) c = CRC[(c ^ u8[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  function zip(files) {
    const enc = new TextEncoder(), parts = [], central = [];
    let off = 0;
    for (const f of files) {
      const name = enc.encode(f.name), data = typeof f.data === 'string' ? enc.encode(f.data) : f.data, crc = crc32(data);
      const h = new DataView(new ArrayBuffer(30));
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(8, 0, true);
      h.setUint32(14, crc, true); h.setUint32(18, data.length, true); h.setUint32(22, data.length, true); h.setUint16(26, name.length, true);
      parts.push(new Uint8Array(h.buffer), name, data);
      const c = new DataView(new ArrayBuffer(46));
      c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true);
      c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true); c.setUint16(28, name.length, true); c.setUint32(42, off, true);
      central.push(new Uint8Array(c.buffer), name);
      off += 30 + name.length + data.length;
    }
    const csz = central.reduce((s, p) => s + p.length, 0);
    const e = new DataView(new ArrayBuffer(22));
    e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, csz, true); e.setUint32(16, off, true);
    const all = parts.concat(central, [new Uint8Array(e.buffer)]);
    const out = new Uint8Array(all.reduce((s, p) => s + p.length, 0));
    let o = 0; for (const p of all) { out.set(p, o); o += p.length; }
    return out;
  }

  function validate(fmt, bitting) {
    const a = fmt.app, issues = [];
    if (bitting.length !== fmt.pins) issues.push({ level: 'error', msg: `${fmt.id} uses ${fmt.pins} cuts; this bitting has ${bitting.length}.` });
    bitting.forEach((d, i) => { if (d < a.min || d > a.max) issues.push({ level: 'error', msg: `Cut ${i + 1} is ${d}; ${fmt.id} depths run ${a.min}–${a.max}.` }); });
    for (let i = 1; i < bitting.length; i++) if (Math.abs(bitting[i] - bitting[i - 1]) > a.macs) issues.push({ level: 'warn', msg: `Cuts ${i} and ${i + 1} differ by ${Math.abs(bitting[i] - bitting[i - 1])}, more than the MACS of ${a.macs}. A real lock may not be pinned this way.` });
    return issues;
  }

  // how far apart the two interpretations are for this bitting (inches)
  function sourceDelta(fmt, bitting) {
    if (!fmt.spec) return null;
    const A = resolve(fmt, bitting, { source: 'app' }), S = resolve(fmt, bitting, { source: 'spec' });
    let dd = 0, dx = 0;
    for (let i = 0; i < bitting.length; i++) {
      const ra = A.sides === 2 ? A.cuts[i] : A.blade - A.cuts[i], rs = S.sides === 2 ? S.cuts[i] : S.blade - S.cuts[i];
      dd = Math.max(dd, Math.abs(ra - rs)); dx = Math.max(dx, Math.abs((A.tipStop ? A.tipX - A.xs[i] : A.xs[i]) - (S.tipStop ? S.tipX - S.xs[i] : S.xs[i])));
    }
    return { depth: dd, spacing: dx, angle: (fmt.spec.angle ?? fmt.app.angle) !== fmt.app.angle };
  }

  function generate(fmt, bitting, opt, WARD, Clipper) {
    const outline = buildOutline(fmt, bitting, opt);
    const ward = wardingLoops(opt.warding, outline.H, opt, WARD || {}, Clipper);
    // Print orientation. The teeth band runs from just below the deepest root up to the cut edge; whichever
    // face has material closest to the bed across that band goes down (unless the caller chose a face).
    const g = outline.g, H = outline.H;
    const deepest = Math.min(...g.cuts.map((c) => H - c * IN), H - 0.3);
    let yT = Math.max(0.05, deepest - 0.1); const yE = H - 0.05;
    const gapFront = bedGap(ward.loops, yT, yE, ward.zmin), gapBack = bedGap(ward.loops, yT, yE, ward.zmax);
    const flip = opt.flip ?? (gapBack < gapFront - 1e-6);
    const bedZ = flip ? ward.zmax : ward.zmin;
    ward.flip = flip; ward.bedGap = flip ? gapBack : gapFront; ward.filled = 0;
    // A small gap under the teeth means the first layers of the teeth print over air. Fill just that sliver.
    const thr = opt.flatBed ?? 0.3;
    if (ward.bedGap > 1e-6 && ward.bedGap <= thr + 1e-9 && Clipper) {
      // extend the fill down the whole recessed face the teeth sit on, stopping where the profile
      // either reaches the bed already or drops into a real groove
      const ys = [...new Set(ward.loops.flat().map((p) => p[1]))].filter((y) => y < yT).sort((a, b) => b - a);
      let yFill = yT, prev = yT;
      for (const y of ys) {
        const mid = y + (prev - y) / 2, gm = bedGap(ward.loops, mid - 0.025, mid, bedZ);
        if (gm > 1e-6 && gm <= thr + 1e-9) { yFill = y; prev = y; } else break;
      }
      yT = yFill;
      const S = 1e5, d = ward.bedGap + 1e-4, z0 = flip ? bedZ - d : bedZ, z1 = flip ? bedZ : bedZ + d;
      const toP = (l) => l.map(([z, y]) => ({ X: Math.round(z * S), Y: Math.round(y * S) }));
      const rect = [[z0, yT], [z1, yT], [z1, H + 0.001], [z0, H + 0.001]];
      const c = new Clipper.Clipper(), sol = new Clipper.Paths();
      c.AddPaths(ward.loops.map(toP), Clipper.PolyType.ptSubject, true);
      c.AddPath(toP(rect), Clipper.PolyType.ptClip, true);
      c.Execute(Clipper.ClipType.ctUnion, sol, Clipper.PolyFillType.pftNonZero, Clipper.PolyFillType.pftNonZero);
      ward.loops = sol.map((p) => p.map((q) => [q.X / S, q.Y / S]));
      // Clipper snaps to its integer grid, so re-measure the faces the head is aligned to
      let zmin = Infinity, zmax = -Infinity;
      for (const l of ward.loops) for (const p of l) { zmin = Math.min(zmin, p[0]); zmax = Math.max(zmax, p[0]); }
      ward.zmin = zmin; ward.zmax = zmax; ward.thick = zmax - zmin;
      ward.filled = ward.bedGap; ward.bedGap = bedGap(ward.loops, yT, yE, flip ? zmax : zmin);
    }
    const m = mesh(outline, ward, { ...opt, flip });
    return { outline, ward, mesh: m, check: checkMesh(m) };
  }

  root.KeyCore = { FORMATS, byId, parseKeycopy, resolve, bladeProfile, buildOutline, wardingLoops, mesh, checkMesh, toSTL, toDXF, zip, validate, sourceDelta, generate, IN };
})(typeof window !== 'undefined' ? window : globalThis);
