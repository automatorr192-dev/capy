const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const root = document.documentElement;

const fontsReady = Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 900))]);
fontsReady.then(() => requestAnimationFrame(() => root.classList.add('entered')));

const nav = $('#nav'), burger = $('#burger'), menu = $('#menu');
burger.addEventListener('click', () => {
  const open = burger.getAttribute('aria-expanded') !== 'true';
  burger.setAttribute('aria-expanded', open);
  menu.classList.toggle('open', open);
  nav.classList.add('solid');
});
menu.addEventListener('click', e => { if (e.target.closest('a')) { burger.setAttribute('aria-expanded', 'false'); menu.classList.remove('open'); } });
const sentinel = document.createElement('div');
sentinel.style.cssText = 'position:absolute;top:0;height:60px;width:1px;pointer-events:none';
document.body.prepend(sentinel);
new IntersectionObserver(([e]) => nav.classList.toggle('solid', !e.isIntersecting)).observe(sentinel);

const toastEl = $('#toast');
let toastT;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => toastEl.classList.remove('show'), 1900);
}

function splitLines(el) {
  const text = el.textContent.trim(), words = text.split(/[ \t\n\r]+/);
  el.innerHTML = words.map(w => `<span class="sw">${w}</span>`).join(' ');
  const lines = [];
  let top = null;
  el.querySelectorAll('.sw').forEach(s => {
    if (s.offsetTop !== top) { lines.push([]); top = s.offsetTop; }
    lines[lines.length - 1].push(s.textContent);
  });
  el.setAttribute('aria-label', text);
  el.innerHTML = lines.map((l, i) => `<span class="ln" aria-hidden="true"><span style="transition-delay:${i * 80}ms">${l.join(' ')}</span></span>`).join('');
}
fontsReady.then(() => {
  if (!reduce) $$('[data-split]').forEach(splitLines);
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, sibs = [...el.parentElement.children].filter(c => c.classList.contains('rv'));
    el.style.transitionDelay = ((+el.dataset.delay || 0) * 80 + Math.max(0, sibs.indexOf(el)) * 90) + 'ms';
    el.classList.add('is-in');
    io.unobserve(el);
  }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  $$('[data-split],.rv').forEach(el => io.observe(el));
});

/* ticker (simulated, labelled demo) */
const priceEl = $('#price'), chgEl = $('#chg'), spark = $('#spark');
let price = 0.00042;
const base = price, hist = Array.from({ length: 26 }, () => price * (1 + (Math.random() - 0.5) * 0.04));
function drawSpark() {
  const mn = Math.min(...hist), mx = Math.max(...hist), rg = mx - mn || 1;
  spark.setAttribute('d', hist.map((v, i) => `${i ? 'L' : 'M'}${(i / (hist.length - 1) * 88).toFixed(1)} ${(32 - (v - mn) / rg * 30).toFixed(1)}`).join(' '));
}
drawSpark();
let boardVisible = false;
new IntersectionObserver(([e]) => { boardVisible = e.isIntersecting; }).observe($('#stats'));
if (!reduce) setInterval(() => {
  if (!boardVisible || document.hidden) return;
  price = Math.max(0.0002, price * (1 + (Math.random() - 0.48) * 0.05));
  hist.push(price); hist.shift(); drawSpark();
  priceEl.textContent = '$' + price.toFixed(6);
  const pct = (price - base) / base * 100;
  chgEl.textContent = (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%';
  chgEl.classList.toggle('down', pct < 0);
}, 1600);

/* mosaic */
const mosaic = $('#mosaic');
mosaic.innerHTML = Array.from({ length: 100 }, (_, i) => {
  const g = i < 85 ? 'l' : i < 95 ? 'c' : 'm';
  const d = (Math.floor(i / 10) + i % 10) * 22;
  return `<i class="${g === 'l' ? '' : g}" data-g="${g}" style="transition-delay:${d}ms"></i>`;
}).join('');
new IntersectionObserver((es, o) => es.forEach(e => {
  if (!e.isIntersecting) return;
  mosaic.classList.remove('pre');
  setTimeout(() => mosaic.querySelectorAll('i').forEach(t => { t.style.transitionDelay = '0ms'; }), 1200);
  o.disconnect();
}), { threshold: .35 }).observe(mosaic);
$$('.legend button').forEach(b => b.addEventListener('click', () => {
  const on = b.getAttribute('aria-pressed') !== 'true';
  $$('.legend button').forEach(x => x.setAttribute('aria-pressed', 'false'));
  b.setAttribute('aria-pressed', String(on));
  mosaic.classList.toggle('focus', on);
  mosaic.querySelectorAll('i').forEach(t => t.classList.toggle('on', on && t.dataset.g === b.dataset.g));
}));

$$('.locker').forEach(a => a.addEventListener('click', e => {
  e.preventDefault();
  toast('Demo project: community links are placeholders');
}));

$('#copy').addEventListener('click', () => {
  const ca = $('#ca').textContent.trim();
  (navigator.clipboard ? navigator.clipboard.writeText(ca) : Promise.reject()).then(
    () => toast('Copied. Reminder: this is a demo address'),
    () => toast('Copy failed, select the address manually'));
});

/* ticket machine tabs */
const tabs = $$('[role=tab]');
function select(tab, focus) {
  tabs.forEach(t => {
    const on = t === tab;
    t.setAttribute('aria-selected', on);
    t.tabIndex = on ? 0 : -1;
    $('#' + t.getAttribute('aria-controls')).hidden = !on;
  });
  if (focus) tab.focus();
}
tabs.forEach((t, i) => {
  t.addEventListener('click', () => select(t));
  t.addEventListener('keydown', e => {
    const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (k) { e.preventDefault(); select(tabs[(i + k + tabs.length) % tabs.length], true); }
    if (e.key === 'Home') { e.preventDefault(); select(tabs[0], true); }
    if (e.key === 'End') { e.preventDefault(); select(tabs[tabs.length - 1], true); }
  });
});

/* ---------- the bath ---------- */
const cv = $('#bath'), ctx = cv.getContext('2d');
const COL = {
  sky: '#c4e1e8', sky2: '#e6f3f5', fuji: '#3f719a', fuji2: '#2c587e', snow: '#f7fbfb', hill: '#a3cbd8', hill2: '#86b9cb',
  water: 'rgba(79,163,194,', water2: 'rgba(47,127,163,', fur: '#a8663c', furD: '#8b5232', muz: '#7a4428', ear: '#673920',
  eye: '#24160d', yuzu: '#ffc52e', leaf: '#5e9c5a', tile: '#f2f7f7', grout: '#c3d8da', cloud: '#f7fbfb',
};
const P = {
  body: new Path2D('M150 250 C152 178 222 140 300 142 C382 145 432 192 432 250 Z'),
  head: new Path2D('M40 128 C80 112 120 104 160 100 C200 96 232 108 240 140 C248 172 252 205 252 250 L120 250 C100 240 80 222 62 212 C44 204 30 196 28 178 C26 158 30 136 40 128 Z'),
  muzzle: new Path2D('M40 128 C55 122 70 119 84 117 C90 145 90 182 82 214 C64 210 42 202 31 190 C26 170 28 140 40 128 Z'),
  nostril: new Path2D('M45 135 q8 3 6 12'),
  mouth: new Path2D('M33 189 q17 9 40 3'),
  jaw: new Path2D('M88 214 q48 20 110 12'),
  fur: new Path2D('M268 160 q10 -8 22 -6 M318 158 q12 -6 24 0 M296 182 q10 -7 20 -4'),
};
const COLLIDERS = [[72, 176, 48], [170, 162, 62], [312, 214, 96]];
let W = 0, H = 0, DPR = 1, waterY = 0, cs = 1, capL = 0, rimH = 0, mobile = false;
let mural = null, sprite = null, t = 0, last = 0, raf = 0, visible = true, frameFlip = false;
let blinkT = 2.5, blink = 0, squint = 0;
const yuzus = [], ripples = [], drops = [];
let dropped = 0, draining = 0;

function makeSprite() {
  const R = 64, pad = 18, s = (R + pad) * 2;
  const c = document.createElement('canvas');
  c.width = c.height = s * DPR;
  const g = c.getContext('2d');
  g.scale(DPR, DPR);
  g.translate(s / 2, s / 2);
  const grd = g.createRadialGradient(-R * .35, -R * .4, R * .1, 0, 0, R);
  grd.addColorStop(0, '#fff0a3'); grd.addColorStop(.35, '#ffd447'); grd.addColorStop(.8, '#ffbf1f'); grd.addColorStop(1, '#f2a007');
  g.fillStyle = grd;
  g.beginPath(); g.ellipse(0, 0, R, R * .94, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(214,130,0,.22)';
  for (let i = 0; i < 70; i++) {
    const a = Math.random() * Math.PI * 2, d = Math.sqrt(Math.random()) * R * .88;
    g.beginPath(); g.arc(Math.cos(a) * d, Math.sin(a) * d * .94, 1.6, 0, Math.PI * 2); g.fill();
  }
  g.fillStyle = 'rgba(255,255,255,.55)';
  g.beginPath(); g.ellipse(-R * .38, -R * .42, R * .2, R * .12, -.6, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#4a3a1c'; g.lineWidth = 4; g.lineCap = 'round';
  g.beginPath(); g.moveTo(0, -R * .9); g.lineTo(4, -R * 1.06); g.stroke();
  g.fillStyle = COL.leaf;
  g.beginPath(); g.moveTo(4, -R * 1.02);
  g.bezierCurveTo(22, -R * 1.42, 58, -R * 1.3, 66, -R * 1.12);
  g.bezierCurveTo(46, -R * .9, 18, -R * .92, 4, -R * 1.02); g.fill();
  g.strokeStyle = 'rgba(30,60,30,.35)'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(8, -R * 1.04); g.quadraticCurveTo(36, -R * 1.18, 62, -R * 1.12); g.stroke();
  sprite = { c, s, R };
}

function qpt(a, b, c, k) { const u = 1 - k; return [u * u * a[0] + 2 * u * k * b[0] + k * k * c[0], u * u * a[1] + 2 * u * k * b[1] + k * k * c[1]]; }

function makeMural() {
  const c = document.createElement('canvas');
  c.width = W * DPR; c.height = H * DPR;
  const g = c.getContext('2d');
  g.scale(DPR, DPR);
  const sky = g.createLinearGradient(0, 0, 0, waterY);
  sky.addColorStop(0, COL.sky); sky.addColorStop(1, COL.sky2);
  g.fillStyle = sky; g.fillRect(0, 0, W, waterY + 2);
  const sunR = Math.min(W, H) * (mobile ? .09 : .065);
  g.fillStyle = COL.yuzu;
  g.beginPath(); g.arc(W * (mobile ? .84 : .88), H * (mobile ? .2 : .23), sunR, 0, Math.PI * 2); g.fill();
  g.fillStyle = COL.cloud;
  const cloud = (x, y, w, h) => { g.beginPath(); g.roundRect(x, y, w, h, h / 2); g.fill(); };
  const U = Math.min(W, H) / 100;
  cloud(W * (mobile ? .52 : .62), H * .3, 18 * U, 3.2 * U);
  cloud(W * (mobile ? .6 : .7), H * .345, 26 * U, 3.2 * U);
  cloud(W * (mobile ? .08 : .44), H * .18, 15 * U, 2.8 * U);
  const baseY = waterY - H * .035, peakY = H * (mobile ? .14 : .27);
  const L = W * (mobile ? .02 : .4), R = W * (mobile ? 1.0 : 1.08), mid = (L + R) / 2, plat = (R - L) * .055;
  const p0 = [L, baseY], p2 = [mid - plat, peakY], p1 = [L + (mid - L) * .62, baseY - (baseY - peakY) * .28];
  const q0 = [mid + plat, peakY], q2 = [R, baseY], q1 = [R - (R - mid) * .62, baseY - (baseY - peakY) * .28];
  const fg = g.createLinearGradient(0, peakY, 0, baseY);
  fg.addColorStop(0, COL.fuji2); fg.addColorStop(1, COL.fuji);
  g.fillStyle = fg;
  g.beginPath(); g.moveTo(...p0); g.quadraticCurveTo(...p1, ...p2); g.lineTo(...q0); g.quadraticCurveTo(...q1, ...q2); g.closePath(); g.fill();
  const snow = [];
  for (let k = 1; k >= .7; k -= .05) snow.push(qpt(p0, p1, p2, k));
  const a = qpt(p0, p1, p2, .7), b = qpt(q2, q1, q0, .7), teeth = 7;
  for (let i = 1; i < teeth; i++) {
    const x = a[0] + (b[0] - a[0]) * i / teeth, yb = a[1] + (b[1] - a[1]) * i / teeth;
    snow.push([x, yb + (i % 2 ? -(baseY - peakY) * .07 : (baseY - peakY) * .04)]);
  }
  for (let k = .7; k <= 1.001; k += .05) snow.push(qpt(q2, q1, q0, k));
  g.fillStyle = COL.snow;
  g.beginPath(); g.moveTo(...p2); snow.forEach(p => g.lineTo(...p)); g.lineTo(...q0); g.closePath(); g.fill();
  const hills = (col, y0, amp, f, ph) => {
    g.fillStyle = col; g.beginPath(); g.moveTo(0, waterY);
    for (let x = 0; x <= W; x += 8) g.lineTo(x, y0 - Math.sin(x * f + ph) * amp - Math.sin(x * f * 2.3 + ph) * amp * .4);
    g.lineTo(W, waterY); g.closePath(); g.fill();
  };
  hills(COL.hill, waterY - H * .05, H * .018, .006, 1.3);
  hills(COL.hill2, waterY - H * .022, H * .012, .01, .2);
  g.fillStyle = '#e7f1f1'; g.fillRect(0, waterY - 7 * cs, W, 7 * cs + 2);
  g.fillStyle = COL.grout; g.fillRect(0, waterY - 1, W, 2);
  mural = c;
}

function layout() {
  const r = cv.getBoundingClientRect();
  const oldW = W, oldWater = waterY;
  W = Math.max(1, r.width); H = Math.max(1, r.height);
  DPR = Math.min(2, devicePixelRatio || 1);
  mobile = W < 768;
  cv.width = W * DPR; cv.height = H * DPR;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  waterY = H * (mobile ? .6 : .68);
  cs = mobile ? Math.min(W * .62 / 404, H * .34 / 150) : Math.min(W * .34 / 404, H * .3 / 150);
  const capX = W * (mobile ? .5 : .66);
  capL = capX - 230 * cs;
  rimH = Math.max(22, H * .055);
  makeSprite();
  makeMural();
  if (oldW) yuzus.forEach(y => { y.x = y.x / oldW * W; y.y += waterY - oldWater; });
  draw();
}

const bob = () => (reduce ? 0 : Math.sin(t * 1.1) * 2 * cs);
const toW = (lx, ly) => [capL + lx * cs, waterY + (ly - 250) * cs + bob()];
const platform = () => { const [x1, y] = toW(118, 101), [x2] = toW(214, 101); return { x1, x2, y }; };
const surf = x => waterY + (reduce ? 0 : Math.sin(x * .012 + t * 1.4) * 2.2 * cs + Math.sin(x * .031 - t * 2.1) * 1.1 * cs);

function addYuzu(x, y, o = {}) {
  const r = (o.r || 19 + Math.random() * 7) * cs * (mobile ? 1.15 : 1);
  const yz = { x, y, vx: o.vx ?? (Math.random() - .5) * 50 * cs, vy: o.vy ?? 0, r, a: (Math.random() - .5) * .8, av: (Math.random() - .5) * 2, inW: false, head: !!o.head, hx: 0, id: Math.random() * 10 };
  if (yz.head) yz.hx = (x - capL) / cs;
  if (reduce && !yz.head) { yz.y = surf(x) - r * .05; yz.vx = yz.vy = 0; yz.inW = true; }
  yuzus.push(yz);
  if (yuzus.length > 34) yuzus.splice(yuzus.findIndex(q => !q.head), 1);
  return yz;
}

function splash(x, v) {
  const k = Math.min(1, Math.abs(v) / (700 * cs));
  ripples.push({ x, t: 0, max: (40 + 60 * k) * cs, dur: 1.4 });
  if (k > .25) ripples.push({ x, t: -.18, max: (24 + 40 * k) * cs, dur: 1.2 });
  const n = Math.round(3 + 6 * k);
  for (let i = 0; i < n; i++) drops.push({ x, y: waterY - 2, vx: (Math.random() - .5) * 260 * cs * k, vy: -(140 + Math.random() * 300) * cs * k, r: (1.5 + Math.random() * 2.2) * cs });
}

function step(dt) {
  const g = 1700 * cs, pl = platform();
  const headTaken = yuzus.some(y => y.head);
  for (const y of yuzus) {
    if (y.head) {
      y.x = capL + y.hx * cs;
      y.y = pl.y - y.r * .86;
      y.a *= Math.pow(.2, dt);
      continue;
    }
    const s = surf(y.x);
    const sub = Math.max(0, Math.min(1, (y.y + y.r - s) / (2 * y.r)));
    y.vy += g * dt;
    if (!draining) y.vy -= g * 2.15 * sub * dt;
    if (sub > 0) {
      y.vx *= 1 - Math.min(1, 1.6 * dt * sub);
      y.vy *= 1 - Math.min(1, 4.2 * dt * sub);
      y.av *= 1 - Math.min(1, 2 * dt);
      y.vx += Math.sin(t * .35 + y.id) * 7 * cs * dt;
    }
    if (!y.inW && sub > .04) { y.inW = true; splash(y.x, y.vy); }
    if (sub === 0) y.inW = false;
    const py = y.y;
    y.x += y.vx * dt; y.y += y.vy * dt; y.a += y.av * dt;
    if (!draining && !headTaken && y.vy > 0 && py + y.r <= pl.y + 2 && y.y + y.r >= pl.y && y.x > pl.x1 && y.x < pl.x2) {
      y.head = true; y.hx = (y.x - capL) / cs; y.vx = y.vy = 0;
      squint = 1;
      continue;
    }
    for (const [lx, ly, lr] of COLLIDERS) {
      const [cx, cy] = toW(lx, ly), cr = lr * cs, dx = y.x - cx, dy = y.y - cy, d = Math.hypot(dx, dy);
      if (d > 0 && d < cr + y.r) {
        const nx = dx / d, ny = dy / d, o = cr + y.r - d;
        y.x += nx * o; y.y += ny * o;
        const vn = y.vx * nx + y.vy * ny;
        if (vn < 0) { y.vx -= 1.35 * vn * nx; y.vy -= 1.35 * vn * ny; y.av += (y.vx * ny - y.vy * nx) * .004 / cs; }
      }
    }
    if (y.x < y.r) { y.x = y.r; y.vx = Math.abs(y.vx) * .4; }
    if (y.x > W - y.r) { y.x = W - y.r; y.vx = -Math.abs(y.vx) * .4; }
    const floor = H - rimH * .4;
    if (y.y + y.r > floor && !draining) { y.y = floor - y.r; y.vy = -Math.abs(y.vy) * .3; }
  }
  for (let i = 0; i < yuzus.length; i++) for (let j = i + 1; j < yuzus.length; j++) {
    const a = yuzus[i], b = yuzus[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), m = a.r + b.r;
    if (d === 0 || d >= m) continue;
    const nx = dx / d, ny = dy / d, o = m - d;
    if (a.head && b.head) continue;
    if (a.head) { b.x += nx * o; b.y += ny * o; b.vx += nx * 40 * cs; }
    else if (b.head) { a.x -= nx * o; a.y -= ny * o; a.vx -= nx * 40 * cs; }
    else { a.x -= nx * o / 2; a.y -= ny * o / 2; b.x += nx * o / 2; b.y += ny * o / 2; }
    const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
    if (rv < 0) {
      const imp = -1.3 * rv / 2;
      if (!a.head) { a.vx -= imp * nx; a.vy -= imp * ny; }
      if (!b.head) { b.vx += imp * nx; b.vy += imp * ny; }
    }
  }
  if (draining) {
    draining -= dt;
    for (let i = yuzus.length - 1; i >= 0; i--) if (!yuzus[i].head && yuzus[i].y - yuzus[i].r > H) yuzus.splice(i, 1);
    if (draining <= 0) { draining = 0; updateHint(); }
  }
  for (let i = ripples.length - 1; i >= 0; i--) { ripples[i].t += dt; if (ripples[i].t > ripples[i].dur) ripples.splice(i, 1); }
  for (let i = drops.length - 1; i >= 0; i--) {
    const d = drops[i];
    d.vy += g * dt; d.x += d.vx * dt; d.y += d.vy * dt;
    if (d.vy > 0 && d.y > surf(d.x)) drops.splice(i, 1);
  }
  blinkT -= dt;
  if (blinkT <= 0) { blink = 1; blinkT = 3 + Math.random() * 4; }
  blink = Math.max(0, blink - dt * 7);
  squint = Math.max(0, squint - dt * .7);
}

function drawCapy() {
  ctx.save();
  ctx.translate(capL, waterY - 250 * cs + bob());
  ctx.scale(cs, cs);
  ctx.fillStyle = COL.fur; ctx.fill(P.body);
  ctx.fillStyle = COL.ear;
  ctx.beginPath(); ctx.ellipse(224, 106, 13, 11, -.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = COL.fur; ctx.fill(P.head);
  ctx.fillStyle = COL.muz; ctx.fill(P.muzzle);
  ctx.fillStyle = COL.ear;
  ctx.beginPath(); ctx.ellipse(204, 100, 15, 12, -.35, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#8f5530';
  ctx.beginPath(); ctx.ellipse(206, 103, 7, 5.5, -.35, 0, Math.PI * 2); ctx.fill();
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(80,40,18,.35)'; ctx.lineWidth = 4; ctx.stroke(P.jaw); ctx.stroke(P.fur);
  const open = Math.max(0, .55 - blink * .55 - squint * .45);
  ctx.save();
  ctx.beginPath(); ctx.ellipse(130, 134, 9, 8, -.15, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = COL.eye; ctx.fillRect(118, 124, 26, 22);
  ctx.fillStyle = 'rgba(255,255,255,.85)';
  ctx.beginPath(); ctx.arc(127, 137, 2.1, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = COL.fur; ctx.fillRect(116, 120, 30, 6 + (1 - open) * 15);
  ctx.restore();
  ctx.strokeStyle = COL.eye; ctx.lineWidth = 2.6;
  const ly = 126 + (1 - open) * 15;
  ctx.beginPath(); ctx.moveTo(120, ly + 1); ctx.quadraticCurveTo(130, ly - 2, 140, ly + 1); ctx.stroke();
  ctx.lineWidth = 3.4; ctx.stroke(P.nostril);
  ctx.lineWidth = 3; ctx.stroke(P.mouth);
  ctx.restore();
}

function drawYuzu(y) {
  const k = y.r / sprite.R;
  ctx.save();
  ctx.translate(y.x, y.y);
  ctx.rotate(y.a);
  ctx.scale(k, k);
  ctx.drawImage(sprite.c, -sprite.s / 2, -sprite.s / 2, sprite.s, sprite.s);
  ctx.restore();
}

function draw() {
  if (!mural) return;
  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(mural, 0, 0, W, H);
  drawCapy();
  yuzus.forEach(drawYuzu);
  const grad = ctx.createLinearGradient(0, waterY, 0, H);
  grad.addColorStop(0, COL.water + '.78)');
  grad.addColorStop(1, COL.water2 + '.96)');
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.moveTo(0, H);
  for (let x = 0; x <= W + 8; x += 8) ctx.lineTo(x, surf(x));
  ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = Math.max(1.5, 2 * cs);
  ctx.beginPath();
  for (let x = 0; x <= W + 8; x += 8) x ? ctx.lineTo(x, surf(x) + 1) : ctx.moveTo(x, surf(x) + 1);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 2;
  for (let i = 0; i < 9; i++) {
    const x = ((i * 173 + t * 14) % (W + 120)) - 60, y = waterY + (18 + (i * 37) % ((H - waterY - rimH) * .8 || 1)) ;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 30 + (i % 3) * 14, y); ctx.stroke();
  }
  for (const r of ripples) {
    if (r.t < 0) continue;
    const p = r.t / r.dur, rx = 8 * cs + r.max * (1 - Math.pow(1 - p, 2.2));
    ctx.strokeStyle = `rgba(255,255,255,${(1 - p) * .8})`; ctx.lineWidth = Math.max(1, 2.2 * cs * (1 - p * .6));
    ctx.beginPath(); ctx.ellipse(r.x, surf(r.x) + 3 * cs, rx, rx * .2, 0, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(235,248,252,.95)';
  for (const d of drops) { ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill(); }
  if (!reduce) {
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const ph = (t * .1 + i * .33) % 1, x = capL + (60 + i * 150) * cs, y = waterY - 30 * cs - ph * H * .16;
      ctx.strokeStyle = `rgba(255,255,255,${Math.sin(ph * Math.PI) * .2})`; ctx.lineWidth = 16 * cs;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.bezierCurveTo(x - 14 * cs, y - 20 * cs, x + 14 * cs, y - 34 * cs, x, y - 54 * cs); ctx.stroke();
    }
  }
  const tw = rimH * 1.1;
  ctx.fillStyle = COL.tile; ctx.fillRect(0, H - rimH, W, rimH);
  ctx.fillStyle = COL.grout; ctx.fillRect(0, H - rimH, W, 2);
  for (let x = tw; x < W; x += tw) ctx.fillRect(x, H - rimH, 2, rimH);
}

function busy() {
  return ripples.length || drops.length || draining || yuzus.some(y => !y.head && (Math.abs(y.vy) > 20 * cs || Math.abs(y.vx) > 20 * cs));
}
function frame(now) {
  raf = 0;
  const dt = Math.min(.033, (now - (last || now)) / 1000);
  last = now;
  t += dt;
  step(dt);
  frameFlip = !frameFlip;
  if (busy() || frameFlip || blink > 0) draw();
  if (visible && !document.hidden) raf = requestAnimationFrame(frame);
  else last = 0;
}
function kick() { if (!raf && visible && !reduce) raf = requestAnimationFrame(frame); }

const hintText = $('#hintText'), drain = $('#drain');
function updateHint() {
  const n = yuzus.length;
  hintText.textContent = dropped ? `${n} ${n === 1 ? 'yuzu' : 'yuzus'} in the bath` : 'Tap the water to drop a yuzu';
  drain.hidden = n < 6;
}
drain.addEventListener('click', () => {
  yuzus.forEach(y => { if (!y.head) { y.vy = 200 * cs; } });
  if (reduce) { for (let i = yuzus.length - 1; i >= 0; i--) if (!yuzus[i].head) yuzus.splice(i, 1); draw(); updateHint(); return; }
  draining = 1.6; kick();
});

cv.addEventListener('pointerdown', e => {
  const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
  const hit = yuzus.find(q => Math.hypot(q.x - x, q.y - y) < q.r * 1.15);
  if (hit) {
    hit.head = false; hit.vy = -(420 + Math.random() * 120) * cs; hit.vx = (hit.x - x) * 6 + (Math.random() - .5) * 120 * cs; hit.av = (Math.random() - .5) * 10;
  } else {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    const local = new DOMMatrix().translate(capL, waterY - 250 * cs + bob()).scale(cs);
    const inv = local.inverse(), lp = inv.transformPoint(new DOMPoint(x, y));
    const onCapy = ctx.isPointInPath(P.head, lp.x, lp.y);
    ctx.restore();
    if (onCapy) { squint = 1.4; }
    else {
      const sy = Math.min(y, waterY - 70 * cs);
      addYuzu(x, sy, { vx: (Math.random() - .5) * 40 * cs, vy: y > waterY ? 0 : 60 * cs });
      dropped++;
    }
  }
  updateHint();
  if (reduce) draw(); else kick();
});

layout();
addYuzu(capL + 166 * cs, waterY - 300 * cs, { head: true, r: 23 });
addYuzu(capL - 120 * cs, waterY, { r: 22 });
addYuzu(Math.min(W - 40 * cs, capL + 470 * cs), waterY, { r: 20 });
yuzus.forEach(y => { if (!y.head) { y.y = waterY - y.r * .05; y.inW = true; } });
step(0.016);
draw();
new ResizeObserver(() => { layout(); kick(); }).observe(cv);
new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }).observe(cv);
document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });
kick();
