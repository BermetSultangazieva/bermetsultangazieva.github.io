/* =============================================================
   Bermet Sultangazieva — Personal Website
   Vanilla JS, no dependencies. Organised into small modules:
     1. Footer year
     2. Navbar: shadow on scroll + scroll progress bar
     3. Mobile menu toggle
     4. Scrollspy: highlight active nav link
     5. Scroll reveal (IntersectionObserver)
     6. Hero animated particle network (canvas)
   All features degrade gracefully and respect reduced-motion.
   ============================================================= */
(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  /* ---------- 1. FOOTER YEAR ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 2. NAVBAR SHADOW + PROGRESS BAR ---------- */
  const navbar = document.getElementById('navbar');
  const progress = document.getElementById('navProgress');

  function onScroll() {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (navbar) navbar.classList.toggle('scrolled', y > 12);

    if (progress) {
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (y / docHeight) * 100 : 0;
      progress.style.width = pct + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 3. MOBILE MENU ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.querySelector('.nav-links');

  function closeMenu() {
    if (!navLinks) return;
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      const open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    // Close after picking a destination
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
  }

  /* ---------- 4. SCROLLSPY (active nav link) ---------- */
  const linkMap = new Map();
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    const id = a.getAttribute('href').replace('#', '');
    linkMap.set(id, a);
  });

  const spyTargets = Array.from(linkMap.keys())
    .map(function (id) {
      return document.getElementById(id);
    })
    .filter(Boolean);

  if ('IntersectionObserver' in window && spyTargets.length) {
    const spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            linkMap.forEach(function (el) {
              el.classList.remove('active');
            });
            const active = linkMap.get(entry.target.id);
            if (active) active.classList.add('active');
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    spyTargets.forEach(function (t) {
      spy.observe(t);
    });
  }

  /* ---------- 5. SCROLL REVEAL ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) {
      el.classList.add('is-visible');
    });
  } else {
    const revealObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            // Tiny stagger when several items reveal together
            const delay = Math.min(i * 70, 280);
            setTimeout(function () {
              entry.target.classList.add('is-visible');
            }, delay);
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 }
    );
    reveals.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* ---------- 6. SEGMENTED TABS (experience + leadership) ---------- */
  // Each `.tabbed` group is self-contained: its tabs only toggle the panels
  // that live inside the same group, so multiple tab sets coexist safely.
  document.querySelectorAll('.tabbed').forEach(function (group) {
    const tabs = group.querySelectorAll('.seg-tab');
    const panels = group.querySelectorAll('.seg-panel');

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        const panelId = tab.getAttribute('data-panel');

        tabs.forEach(function (t) {
          const selected = t === tab;
          t.classList.toggle('active', selected);
          t.setAttribute('aria-selected', String(selected));
        });

        panels.forEach(function (panel) {
          const show = panel.id === panelId;
          panel.classList.toggle('active', show);
          if (show) {
            panel.removeAttribute('hidden');
            // Items in a previously hidden panel never tripped the reveal
            // observer, so reveal them when their tab opens.
            panel.querySelectorAll('.reveal').forEach(function (el) {
              el.classList.add('is-visible');
            });
          } else {
            panel.setAttribute('hidden', '');
          }
        });
      });
    });
  });

  /* ---------- 7. HERO PARTICLE NETWORK ---------- */
  // A quiet "neural network" of drifting nodes connected by lines —
  // subtle, on-brand for an ML researcher, disabled for reduced motion.
  const canvas = document.getElementById('heroCanvas');
  if (canvas && canvas.getContext && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let width, height, dpr, nodes, raf;
    const NAVY = '58, 110, 165'; // matches --navy-500
    const GREEN = '127, 209, 168'; // matches --green-400

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Node count scales with area, capped for performance
      const count = Math.min(70, Math.floor((width * height) / 16000));
      nodes = [];
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.8 + 1,
          green: Math.random() < 0.25
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      const linkDist = 130;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        // Wrap around edges
        if (n.x < -20) n.x = width + 20;
        if (n.x > width + 20) n.x = -20;
        if (n.y < -20) n.y = height + 20;
        if (n.y > height + 20) n.y = -20;

        // Connecting lines
        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const dx = n.x - m.x;
          const dy = n.y - m.y;
          const dist = Math.hypot(dx, dy);
          if (dist < linkDist) {
            const alpha = (1 - dist / linkDist) * 0.18;
            ctx.strokeStyle = 'rgba(' + NAVY + ',' + alpha + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.stroke();
          }
        }

        // Node dot
        ctx.fillStyle = 'rgba(' + (n.green ? GREEN : NAVY) + ',0.55)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }

    function start() {
      resize();
      cancelAnimationFrame(raf);
      draw();
    }

    // Pause when the hero scrolls out of view to save cycles
    const heroSection = document.getElementById('hero');
    if ('IntersectionObserver' in window && heroSection) {
      const heroObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            draw();
          } else {
            cancelAnimationFrame(raf);
          }
        });
      });
      heroObs.observe(heroSection);
    }

    let resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(start, 200);
    });

    start();
  }
})();
