// ---------------------- Data ----------------------
const PROJECTS = {
  games: [
    { title: "Orb Runner", blurb: "Endless runner on HTML5 Canvas.", tags: ["JS", "Canvas"], url: "#" },
    { title: "Nebula Quest", blurb: "Grid-based puzzle with A* pathfinding.", tags: ["TS", "Pathfinding"], url: "#" },
    { title: "Retro Blaster", blurb: "Space shooter with sprite sheets.", tags: ["JS", "Sprites"], url: "#" }
  ],
  apps: [
    { title: "StudyBuddy", blurb: "Flashcards + spaced repetition.", tags: ["React", "IndexedDB"], url: "#" },
    { title: "MealMap", blurb: "Macro-friendly recipes & grocery lists.", tags: ["React", "API"], url: "#" },
    { title: "TaskJet", blurb: "Minimal, keyboard-first task manager.", tags: ["TS", "PWA"], url: "#" }
  ],
  websites: [
    { title: "Artfolio", blurb: "Artist portfolio with lazy-loaded galleries.", tags: ["Next.js", "SSR"], url: "#" },
    { title: "UW Hacks", blurb: "Hackathon landing page with schedule.", tags: ["Tailwind", "a11y"], url: "#" },
    { title: "DataViz Lab", blurb: "Interactive charts and dashboards.", tags: ["D3", "Charts"], url: "#" }
  ],
  robotics: [
    { title: "LineFollower", blurb: "PID-tuned line follower.", tags: ["C++", "Arduino"], url: "#" },
    { title: "ArmControl", blurb: "Inverse kinematics demo.", tags: ["Python", "ROS"], url: "#" },
    { title: "MazeBot", blurb: "Wall-following maze solver.", tags: ["C", "Sensors"], url: "#" }
  ]
};

const CATEGORIES = [
  { key: "games", label: "Games", icon: "🎮", hue: "linear-gradient(135deg, #ff76b9, #b579ff, #7d5fff)" },
  { key: "apps", label: "Apps", icon: "📱", hue: "linear-gradient(135deg, #7fffd4, #50f0a1, #52e3ff)" },
  { key: "websites", label: "Websites", icon: "🌐", hue: "linear-gradient(135deg, #ffc178, #ff7aa2, #ff76b9)" },
  { key: "robotics", label: "Robotics", icon: "🤖", hue: "linear-gradient(135deg, #c9ff66, #6ef27e, #4fe2a4)" }
];

// ---------------------- Utilities ----------------------

// parametric ellipse point from angle in degrees (for future use/debug)
function ellipsePoint(cx, cy, rx, ry, deg) {
  const t = (deg * Math.PI) / 180;
  return { x: cx + rx * Math.cos(t), y: cy + ry * Math.sin(t) };
}

// pick angles with a minimum separation (in degrees)
function pickSeparatedAngles(count, minSepDeg, rand) {
  const angles = [];
  let guard = 0;
  while (angles.length < count && guard++ < 1000) {
    const a = rand() * 360;
    if (angles.every(b => {
      const d = Math.abs(a - b) % 360;
      const sep = Math.min(d, 360 - d);
      return sep >= minSepDeg;
    })) angles.push(a);
  }
  // if RNG unlucky, sort + spread evenly as fallback
  if (angles.length < count) {
    for (let i = 0; i < count; i++) angles[i] = (i * 360) / count;
  }
  return angles;
}

function hashStr(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

function makeRng(seed) {
  let x = seed >>> 0;
  return () => { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; };
}

const rng = makeRng;
// ---------------------- Orbit Layout ----------------------
function layoutOrbits() {
  // figure out the max planet so we can make safe track spacing
  const tmpRng = rng(123456); // stable seed for a quick max estimate
  let maxSize = 0;
  CATEGORIES.forEach(c => {
    const r = rng(hashStr(c.key));
    const size = 56 + Math.round(r() * 36);
    if (size > maxSize) maxSize = size;
  });
  const bandGap = Math.ceil(maxSize * 0.9); // gap between bands based on size

  // center radius set (you can tweak these base radii)
  const baseBands = [120, 150, 180, 210];
  const bands = baseBands.map((b, i) => b + i * 0); // easy hook if you want to fan them more

  // group categories by band index (here 1:1, but scalable)
  const byBand = new Map();
  CATEGORIES.forEach((c, i) => {
    const bi = i % bands.length;
    if (!byBand.has(bi)) byBand.set(bi, []);
    byBand.get(bi).push(c);
  });

  // For each band, compute a shared angle set with min separation
  const layout = {};
  byBand.forEach((cats, bi) => {
    const rxBase = bands[bi] + bi * bandGap * 0.0; // optional global offset
    // small random jitter per band so tracks don’t look perfectly concentric
    const bandRng = rng(0xC0FFEE + bi);
    const rxJitter = (bandRng() - 0.5) * 6; // ±3px
    const rx = rxBase + rxJitter;

    // keep ellipses slightly different per band for variety
    const ry = rx * (0.74 + bandRng() * 0.18);

    // choose angles with minimum separation; account for visual size on this band
    const minSepDeg = Math.max(30, (maxSize / rx) * (180 / Math.PI) * 2.2); // size-aware
    const angles = pickSeparatedAngles(cats.length, minSepDeg, bandRng);

    cats.forEach((cat, idx) => {
      const r = rng(hashStr(cat.key));
      const angle = (angles[idx] + r() * 12) % 360;    // a little per-planet jitter
      const orbitDuration = 12 + r() * 20;             // 12–32s
      const spin = 8 + r() * 12;                       // icon spin
      const size = 56 + Math.round(r() * 36);          // 56–92px
      const dir = r() > 0.5 ? 'rev' : 'fwd';
      const delay = -(r() * orbitDuration).toFixed(2); // desync

      layout[cat.key] = { rx, ry, angle, orbitDuration, spin, size, dir, delay };
    });
  });

  return layout;
}


// ---------------------- DOM Builders ----------------------
const orbitsSvg = document.querySelector('.orbits');
const planetsRoot = document.getElementById('planets');

function buildOrbits(layout) {
  orbitsSvg.innerHTML = '';
  const c = 210; // center for 420 viewBox
  Object.values(layout).forEach((cfg, idx) => {
    const ell = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    ell.setAttribute('cx', String(c));
    ell.setAttribute('cy', String(c));
    ell.setAttribute('rx', String(cfg.rx));
    ell.setAttribute('ry', String(cfg.ry));
    ell.setAttribute('stroke-dasharray', `${6 + (idx % 3)} ${(6 + (idx % 3)) * 1.6}`);
    orbitsSvg.appendChild(ell);
  });
}

function buildPlanets(layout) {
  planetsRoot.innerHTML = '';

  CATEGORIES.forEach((cat) => {
    const cfg = layout[cat.key];

    // --- static angle wrapper (NOT animated) ---
    const angleWrap = document.createElement('div');
    angleWrap.className = 'planet-wrap';           // you can keep this class for sizing if you like
    angleWrap.style.position = 'absolute';
    angleWrap.style.left = '50%';
    angleWrap.style.top = '50%';
    angleWrap.style.transformOrigin = '0 0';
    angleWrap.style.transform = `rotate(${cfg.angle}deg)`; // static starting angle only

    // --- animated rotator (ONLY animation lives here) ---
    const rotator = document.createElement('div');
    rotator.style.transformOrigin = '0 0';
    // ensure both keyframes exist (orbit & orbitRev)
    rotator.style.animation = `${cfg.dir === 'rev' ? 'orbitRev' : 'orbit'} ${cfg.orbitDuration}s linear infinite`;
    rotator.style.animationDelay = `${cfg.delay}s`;

    // --- ellipse scale must match track ---
    const pathScale = document.createElement('div');
    pathScale.className = 'planet-path';
    pathScale.style.transformOrigin = 'left center';
    pathScale.style.transform = `scaleY(${(cfg.ry / cfg.rx).toFixed(6)})`;

    // --- place node on the radius ---
    const anchor = document.createElement('div');
    anchor.style.transform = `translateX(${cfg.rx}px)`;

    // --- the planet button ---
    const node = document.createElement('button');
    node.className = 'planet';
    node.style.background = cat.hue;
    node.style.width = `${cfg.size}px`;
    node.style.height = `${cfg.size}px`;
    node.style.transform = `translate(-50%, -50%)`;
    node.setAttribute('aria-label', `${cat.label} projects`);
    node.innerHTML = `
      <span class="icon" style="animation: spin ${cfg.spin}s linear infinite">${cat.icon}</span>
      <span class="small">📁</span>
      <span class="label">${cat.label}</span>
    `;
    node.addEventListener('click', () => openModal(cat.key));

    // assemble
    anchor.appendChild(node);
    pathScale.appendChild(anchor);
    rotator.appendChild(pathScale);
    angleWrap.appendChild(rotator);
    planetsRoot.appendChild(angleWrap);
  });
}


// ---------------------- Modal ----------------------
const modal = document.getElementById('modal');
const modalGrid = document.getElementById('modal-desc');
const modalTitle = document.getElementById('modal-title');

function openModal(key) {
  const items = PROJECTS[key] || [];
  modalTitle.textContent = `${capitalize(key)} Projects`;
  modalGrid.innerHTML = items.map((p, i) => `
      <a class="card" href="${p.url}" ${p.url && p.url.startsWith('#') ? '' : 'target="_blank" rel="noreferrer"'} >
        <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:8px">
          <h4>${p.title}</h4>
          <span style="font-size:12px; color:rgba(255,255,255,.6)">${i + 1}</span>
        </div>
        <p>${p.blurb}</p>
        <div class="badges">
          ${p.tags.map(t => `<span class="badge">${t}</span>`).join('')}
        </div>
      </a>
    `).join('');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  modal.setAttribute('aria-hidden', 'true');
}

modal.addEventListener('click', (e) => {
  if (e.target.matches('[data-close], .modal-backdrop')) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') closeModal();
});

function capitalize(s) { return s ? s[0].toUpperCase() + s.slice(1) : s; }

// ---------------------- Starfield ----------------------
function makeStarfield() {
  const root = document.getElementById('starfield');
  const W = window.innerWidth, H = window.innerHeight;

  // soft glows
  const blob1 = document.createElement('div');
  blob1.style.position = 'absolute';
  blob1.style.left = '-160px'; blob1.style.top = '-160px';
  blob1.style.width = '380px'; blob1.style.height = '380px';
  blob1.style.borderRadius = '999px';
  blob1.style.background = 'rgba(240, 64, 255, .25)';
  blob1.style.filter = 'blur(64px)';
  root.appendChild(blob1);

  const blob2 = document.createElement('div');
  blob2.style.position = 'absolute';
  blob2.style.right = '-200px'; blob2.style.bottom = '-200px';
  blob2.style.width = '520px'; blob2.style.height = '520px';
  blob2.style.borderRadius = '999px';
  blob2.style.background = 'rgba(64, 220, 255, .22)';
  blob2.style.filter = 'blur(80px)';
  root.appendChild(blob2);

  // stars
  const stars = 200;
  for (let i = 0; i < stars; i++) {
    const s = document.createElement('span');
    s.className = 'star';
    const size = Math.random() * 2 + 0.6;
    s.style.width = `${size}px`;
    s.style.height = `${size}px`;
    s.style.left = `${Math.random() * W}px`;
    s.style.top = `${Math.random() * H}px`;
    s.style.opacity = (0.35 + Math.random() * 0.65).toFixed(2);
    s.style.setProperty('--dur', `${4 + Math.random() * 6}s`);
    s.style.setProperty('--delay', `${Math.random() * 6}s`);
    s.style.setProperty('--drift-dur', `${6 + Math.random() * 8}s`);
    s.style.setProperty('--drift', `${(Math.random() - .5) * 60}px`);
    root.appendChild(s);
  }

  // comets
  for (let i = 0; i < 5; i++) {
    const c = document.createElement('span');
    c.className = 'comet';
    c.style.left = `${Math.random() * W}px`;
    c.style.top = `${Math.random() * H}px`;
    const angle = -45 + Math.random() * 20;
    c.style.setProperty('--angle', `${angle}deg`);
    c.style.setProperty('--comet-dur', `${6 + Math.random() * 6}s`);
    c.style.setProperty('--comet-delay', `${Math.random() * 8}s`);
    root.appendChild(c);
  }
}

// ---------------------- Skills ----------------------
const SKILLS = ["JavaScript", "TypeScript", "React", "Tailwind", "Node", "Python", "C/C++", "Java", "HTML5 Canvas", "D3", "Git", "Arduino", "ROS", "SQL", "Unit Testing"];
function renderSkills() {
  const ul = document.getElementById('skills-list');
  ul.innerHTML = SKILLS.map(s => `<li>${s}</li>`).join('');
}

// ---------------------- Sanity Tests (console) ----------------------
function runSanityTests() {
  const results = [];
  for (const c of CATEGORIES) {
    results.push(`Category key '${c.key}' in PROJECTS: ${Object.prototype.hasOwnProperty.call(PROJECTS, c.key) ? 'OK' : 'MISSING'}`);
  }
  for (const [k, arr] of Object.entries(PROJECTS)) {
    const sample = (arr || [])[0];
    const ok = sample && typeof sample.title === 'string' && Array.isArray(sample.tags);
    results.push(`Projects '${k}' shape check: ${ok ? 'OK' : 'BAD'}`);
  }
  const catKeys = new Set(CATEGORIES.map(c => c.key));
  for (const k of Object.keys(PROJECTS)) {
    results.push(`Category present for '${k}': ${catKeys.has(k) ? 'OK' : 'MISSING'}`);
  }
  console.group('CosmicPortfolio Sanity Tests');
  results.forEach(r => console.log(r));
  console.groupEnd();
}

// ---------------------- Init ----------------------
(function init() {
  document.getElementById('year').textContent = new Date().getFullYear();
  renderSkills();
  makeStarfield();

  // INITIAL RENDER (missing before)
  const layout = layoutOrbits();
  buildOrbits(layout);
  buildPlanets(layout);

  // Rebuild on resize
  let _resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(() => {
      const layout = layoutOrbits();
      buildOrbits(layout);
      buildPlanets(layout);
    }, 120);
  });

  runSanityTests();
})();

