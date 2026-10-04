/* ============================================================
   NEUROSPHERE script.js
   Multi-page: scroll progress, reveal animations, nav,
   hamburger, sphere parallax + sparkles
   ============================================================ */

const qs  = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ── DOM refs ────────────────────────────────────────────── */
const navbar      = qs('#navbar');
const scrollBar   = qs('#scrollProgress');
const hamburger   = qs('#hamburger');
const navMenu     = qs('#navMenu');
const navLinks    = qsa('.nav-link, .nav-sublink');

/* ── Navbar: glass + shadow on scroll ───────────────────── */
function handleNavScroll() {
  navbar.classList.toggle('scrolled', window.scrollY > 24);
}

/* ── Scroll progress bar ─────────────────────────────────── */
function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct       = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  if (scrollBar) scrollBar.style.width = pct + '%';
}

/* ── Hamburger ───────────────────────────────────────────── */
if (hamburger) {
  hamburger.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
  });
}

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

document.addEventListener('click', e => {
  if (navbar && !navbar.contains(e.target)) {
    navMenu.classList.remove('open');
    hamburger.classList.remove('open');
  }
});

/* ── Scroll-reveal with IntersectionObserver ────────────── */
const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
);

qsa('.reveal, .reveal-item').forEach(el => revealObserver.observe(el));

/* ── Staggered card groups ───────────────────────────────── */
const groupObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      qsa('.reveal-item', entry.target).forEach((item, i) => {
        setTimeout(() => item.classList.add('visible'), i * 90);
      });
      groupObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.06 }
);

qsa('.cards-grid, .booklets-grid, .podcast-list, .donate-tiers, .team-grid, .newsletter-grid').forEach(g =>
  groupObserver.observe(g)
);

/* ── Newsletter reader: click a cover to read page by page ──── */
(function () {
  const reader = qs('#nlReader');
  if (!reader) return;
  const pagesEl = qs('#nlPages', reader);
  const titleEl = qs('#nlTitle', reader);
  const countEl = qs('#nlCount', reader);
  const dlEl    = qs('#nlDownload', reader);
  const closeEl = qs('#nlClose', reader);
  let lastFocus = null;

  function open(tile) {
    const dir = tile.dataset.pages, n = +tile.dataset.count;
    titleEl.textContent = tile.dataset.title;
    dlEl.href = tile.dataset.pdf;
    pagesEl.innerHTML = '';
    for (let i = 1; i <= n; i++) {
      const img = document.createElement('img');
      img.src = `${dir}/${String(i).padStart(2, '0')}.jpg`;
      img.alt = `${tile.dataset.title}, page ${i} of ${n}`;
      img.loading = i <= 2 ? 'eager' : 'lazy';
      img.decoding = 'async';
      img.dataset.page = i;
      pagesEl.appendChild(img);
    }
    countEl.textContent = `Page 1 of ${n}`;
    lastFocus = document.activeElement;
    reader.hidden = false;
    document.body.style.overflow = 'hidden';
    pagesEl.scrollTop = 0;
    closeEl.focus();
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) countEl.textContent = `Page ${en.target.dataset.page} of ${n}`; });
    }, { root: pagesEl, threshold: 0.5 });
    qsa('img', pagesEl).forEach(img => io.observe(img));
    reader._io = io;
  }
  function close() {
    reader.hidden = true;
    document.body.style.overflow = '';
    if (reader._io) reader._io.disconnect();
    pagesEl.innerHTML = '';
    if (lastFocus) lastFocus.focus();
  }

  qsa('.newsletter-poster').forEach(tile => {
    tile.addEventListener('click', () => open(tile));
    tile.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(tile); }
    });
  });
  closeEl.addEventListener('click', close);
  reader.addEventListener('click', e => { if (e.target === reader || e.target === pagesEl) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !reader.hidden) close(); });
})();

/* ── Sphere parallax ─────────────────────────────────────── */
function sphereParallax() {
  qsa('.sphere-wrap').forEach(wrap => {
    const parent = wrap.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    const mid    = rect.top + rect.height / 2 - window.innerHeight / 2;
    const offset = mid * 0.04;
    wrap.style.transform = `translateY(${offset}px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg))`;
  });
}

/* ── Sphere scale-in on page load ────────────────────────── */
function initSphereEntrance() {
  const heroWrap = qs('.page-hero .sphere-wrap');
  if (!heroWrap) return;
  heroWrap.style.opacity    = '0';
  heroWrap.style.transform  = 'scale(0.82)';
  heroWrap.style.transition = 'none';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      heroWrap.style.transition = 'opacity 0.6s ease, transform 0.75s cubic-bezier(0.34,1.56,0.64,1)';
      heroWrap.style.opacity    = '1';
      heroWrap.style.transform  = 'scale(1)';
    });
  });
}

/* ── Sparkle effect (hero sphere only) ──────────────────── */
function createSparkle(container) {
  const size  = Math.random() * 6 + 3;
  const angle = Math.random() * Math.PI * 2;
  const r     = 130 + Math.random() * 80;
  const s     = document.createElement('div');
  s.style.cssText = `
    position:absolute;pointer-events:none;z-index:5;
    width:${size}px;height:${size}px;border-radius:50%;
    background:rgba(255,255,255,0.9);
    left:${210 + r * Math.cos(angle)}px;
    top:${210 + r * Math.sin(angle)}px;
    transform:translate(-50%,-50%) scale(0);
    animation:sparkleAnim ${0.7 + Math.random() * 0.5}s ease-out forwards;
  `;
  container.appendChild(s);
  setTimeout(() => s.remove(), 1300);
}

const style = document.createElement('style');
style.textContent = `
  @keyframes sparkleAnim {
    0%   { transform:translate(-50%,-50%) scale(0); opacity:1; }
    60%  { transform:translate(-50%,-50%) scale(1.5); opacity:.8; }
    100% { transform:translate(-50%,-50%) scale(.2); opacity:0; }
  }
  @keyframes ripple { to { transform:scale(2.6); opacity:0; } }
`;
document.head.appendChild(style);

const heroWrap = qs('.page-hero .sphere-wrap');
if (heroWrap) {
  setInterval(() => createSparkle(heroWrap), 750);
}

/* ── Button ripple ───────────────────────────────────────── */
document.addEventListener('click', e => {
  const btn = e.target.closest('.btn-primary, .btn-secondary');
  if (!btn) return;
  const rect   = btn.getBoundingClientRect();
  const size   = Math.max(rect.width, rect.height);
  const circle = document.createElement('span');
  circle.style.cssText = `
    position:absolute;border-radius:50%;pointer-events:none;
    background:rgba(255,255,255,0.38);
    width:${size}px;height:${size}px;
    left:${e.clientX - rect.left - size / 2}px;
    top:${e.clientY - rect.top  - size / 2}px;
    transform:scale(0);
    animation:ripple 0.55s ease-out forwards;
  `;
  if (getComputedStyle(btn).position === 'static') btn.style.position = 'relative';
  btn.style.overflow = 'hidden';
  btn.appendChild(circle);
  setTimeout(() => circle.remove(), 600);
});

/* ── Unified scroll listener ─────────────────────────────── */
window.addEventListener('scroll', () => {
  handleNavScroll();
  updateScrollProgress();
  sphereParallax();
}, { passive: true });

/* ── Init ────────────────────────────────────────────────── */
handleNavScroll();
updateScrollProgress();
initSphereEntrance();

/* Living sphere: twinkling sparkles + gentle pointer tilt */
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.sphere-wrap').forEach(wrap => {
    for (let i = 0; i < 7; i++) {
      const s = document.createElement('span');
      s.className = 'sphere-spark';
      const a = Math.random() * Math.PI * 2, r = 38 + Math.random() * 14;
      s.style.left = (50 + Math.cos(a) * r) + '%';
      s.style.top = (50 + Math.sin(a) * r) + '%';
      const size = 8 + Math.random() * 12;
      s.style.width = s.style.height = size + 'px';
      s.style.animationDelay = (-Math.random() * 2.8).toFixed(2) + 's';
      s.style.animationDuration = (2.2 + Math.random() * 1.8).toFixed(2) + 's';
      wrap.appendChild(s);
    }
    if (reduce) return;
    const hero = wrap.closest('.page-hero') || wrap;
    hero.addEventListener('mousemove', e => {
      const b = wrap.getBoundingClientRect();
      const x = (e.clientX - (b.left + b.width / 2)) / b.width;
      const y = (e.clientY - (b.top + b.height / 2)) / b.height;
      wrap.style.setProperty('--tilt-y', (x * 14).toFixed(2) + 'deg');
      wrap.style.setProperty('--tilt-x', (-y * 14).toFixed(2) + 'deg');
      if (!/rotateX/.test(wrap.style.transform)) wrap.style.transform = 'rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg))';
    });
    hero.addEventListener('mouseleave', () => { wrap.style.setProperty('--tilt-x', '0deg'); wrap.style.setProperty('--tilt-y', '0deg'); });
  });
})();

/* Fit text inside paper elements: shrink it until nothing overflows the paper area */
(function () {
  const SEL = '.benefit-card, .floral-intro, .matcha-intro, .wavy-intro, .torn-intro, .card, .chapter-card, .research-card.note-card, .announce p, .camera-intro p, .podcast-phone p';
  const TXT = 'h3, h4, p, a, span';
  function fit(box) {
    const parts = box.matches('p') ? [box] : [box, ...box.querySelectorAll(TXT)];
    parts.forEach(el => { el.style.fontSize = ''; });
    const base = parts.map(el => parseFloat(getComputedStyle(el).fontSize));
    const over = () => box.scrollHeight > box.clientHeight + 1 || box.scrollWidth > box.clientWidth + 1;
    let k = 1;
    while (over() && k > 0.55) {
      k -= 0.04;
      parts.forEach((el, i) => { el.style.fontSize = (base[i] * k).toFixed(2) + 'px'; });
    }
  }
  function fitAll() { document.querySelectorAll(SEL).forEach(fit); }
  let t;
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(fitAll, 120); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);
  window.addEventListener('load', fitAll);
  fitAll();
})();
