/* ============================================================
   NEUROSPHERE — script.js
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

qsa('.cards-grid, .booklets-grid, .podcast-list, .donate-tiers, .team-grid').forEach(g =>
  groupObserver.observe(g)
);

/* ── Sphere parallax ─────────────────────────────────────── */
function sphereParallax() {
  qsa('.sphere-wrap').forEach(wrap => {
    const parent = wrap.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    const mid    = rect.top + rect.height / 2 - window.innerHeight / 2;
    const offset = mid * 0.04;
    wrap.style.transform = `translateY(${offset}px)`;
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
