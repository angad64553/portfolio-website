/* ==========================================================================
   Portfolio Website — Main Script
   ES6+ · No jQuery · Performance-Optimised
   ========================================================================== */

(() => {
  'use strict';

  document.body.classList.add('js-enabled');

  /* ------------------------------------------------------------
     UTILITIES
     ------------------------------------------------------------ */

  /** Simple debounce helper */
  const debounce = (fn, ms = 100) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  };

  /** Detect touch / mobile device */
  const isTouchDevice = () =>
    'ontouchstart' in window || navigator.maxTouchPoints > 0;

  /** Track mouse position globally */
  const mouse = { x: -9999, y: -9999 };
  document.addEventListener('mousemove', (e) => {
    if (isTouchDevice()) return;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  /* ================================================================
     1. PRELOADER
     ================================================================ */

  const initPreloader = () => {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    let hidden = false;
    const hide = () => {
      if (hidden) return;
      hidden = true;
      preloader.classList.add('fade-out');
      setTimeout(() => {
        preloader.remove();
        document.body.classList.add('loaded');
      }, 600);
    };

    // If page already loaded, hide immediately; otherwise wait
    if (document.readyState === 'complete') {
      setTimeout(hide, 300);
    } else {
      window.addEventListener('load', () => setTimeout(hide, 300));
    }

    setTimeout(hide, 2000);
  };

  /* ================================================================
     2. PARTICLE SYSTEM (Canvas #particles)
     ================================================================ */

  const initParticles = () => {
    const canvas = document.getElementById('particles');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const COLORS = ['#00f5ff', '#8b5cf6', '#ec4899'];

    let width, height, particles;
    let particleCount, connectDist, mouseDist;

    const updateSettings = () => {
      const isMobile = window.innerWidth < 768 || isTouchDevice();
      particleCount = isMobile ? 35 : 100;
      connectDist = isMobile ? 70 : 120;
      mouseDist = isMobile ? 0 : 180;
    };

    /** Resize canvas to fill parent / viewport */
    const resize = () => {
      width = canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight;
    };

    /** Create a single particle */
    const createParticle = () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2 + 0.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random(),
      alphaDir: (Math.random() < 0.5 ? 1 : -1) * (Math.random() * 0.008 + 0.003),
    });

    /** Seed all particles */
    const seed = () => {
      particles = Array.from({ length: particleCount }, createParticle);
    };

    /** Animation loop */
    const tick = () => {
      ctx.clearRect(0, 0, width, height);

      const len = particles.length;
      const connectDistSq = connectDist * connectDist;

      for (let i = 0; i < len; i++) {
        const p = particles[i];

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Fade in / out
        p.alpha += p.alphaDir;
        if (p.alpha <= 0.1 || p.alpha >= 1) p.alphaDir *= -1;
        p.alpha = Math.max(0, Math.min(1, p.alpha));

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();

        // Connect to nearby particles
        for (let j = i + 1; j < len; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < connectDistSq) {
            const dist = Math.sqrt(distSq);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = 'rgba(255,255,255,0.04)';
            ctx.globalAlpha = 0.04 * (1 - dist / connectDist);
            ctx.stroke();
          }
        }

        // Connect to mouse
        if (mouseDist > 0) {
          const canvasRect = canvas.getBoundingClientRect();
          const mx = mouse.x - canvasRect.left;
          const my = mouse.y - canvasRect.top;
          const mdx = p.x - mx;
          const mdy = p.y - my;
          const mDistSq = mdx * mdx + mdy * mdy;
          const mouseDistSq = mouseDist * mouseDist;

          if (mDistSq < mouseDistSq) {
            const mDist = Math.sqrt(mDistSq);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mx, my);
            ctx.strokeStyle = 'rgba(0,245,255,0.12)';
            ctx.globalAlpha = 0.12 * (1 - mDist / mouseDist);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      requestAnimationFrame(tick);
    };

    updateSettings();
    resize();
    seed();
    tick();

    window.addEventListener('resize', debounce(() => {
      const prevCount = particleCount;
      updateSettings();
      resize();
      if (prevCount !== particleCount) {
        seed();
      }
    }, 200));
  };

  /* ================================================================
     3. CURSOR GLOW
     ================================================================ */

  const initCursorGlow = () => {
    if (isTouchDevice()) return;

    const glow = document.createElement('div');
    glow.classList.add('cursor-glow');
    document.body.appendChild(glow);

    let rafId = null;

    const update = () => {
      glow.style.transform = `translate(${mouse.x}px, ${mouse.y}px) translate(-50%, -50%)`;
      rafId = null;
    };

    document.addEventListener('mousemove', () => {
      if (!rafId) rafId = requestAnimationFrame(update);
    });

    // Hide when mouse leaves the viewport
    document.addEventListener('mouseleave', () => {
      glow.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      glow.style.opacity = '';
    });
  };

  /* ================================================================
     4. STICKY HEADER
     ================================================================ */

  const initStickyHeader = () => {
    const header = document.querySelector('header');
    if (!header) return;

    const check = () => {
      header.classList.toggle('scrolled', window.scrollY > 50);
    };

    window.addEventListener('scroll', check, { passive: true });
    check(); // Run on init
  };

  /* ================================================================
     5. MOBILE NAVIGATION
     ================================================================ */

  const initMobileNav = () => {
    const toggle = document.querySelector('.menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    if (!toggle || !mobileNav) return;

    const open = () => {
      toggle.classList.add('active');
      mobileNav.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    const close = () => {
      toggle.classList.remove('active');
      mobileNav.classList.remove('active');
      document.body.style.overflow = '';
    };

    toggle.addEventListener('click', () => {
      toggle.classList.contains('active') ? close() : open();
    });

    // Close on nav-link click
    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', close);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (
        mobileNav.classList.contains('active') &&
        !mobileNav.contains(e.target) &&
        !toggle.contains(e.target)
      ) {
        close();
      }
    });
  };

  /* ================================================================
     6. SCROLL REVEAL  (IntersectionObserver)
     ================================================================ */

  const initScrollReveal = () => {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    if (!('IntersectionObserver' in window)) {
      reveals.forEach((el) => el.classList.add('active'));
      return;
    }

    const staggerSelectors = [
      '.skill-card',
      '.cert-card',
      '.edu-card',
      '.stat-card',
      '.project-card',
      '.timeline-item',
      '.skill-item',
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add('active');

          // Stagger children with proper opacity animation
          staggerSelectors.forEach((sel) => {
            entry.target.querySelectorAll(sel).forEach((child, i) => {
              child.style.opacity = '0';
              child.style.transform = 'translateY(20px)';
              child.style.transition = `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.08}s`;
              requestAnimationFrame(() => {
                child.style.opacity = '1';
                child.style.transform = 'translateY(0)';
              });
            });
          });

          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px',
      }
    );

    reveals.forEach((el) => observer.observe(el));
  };

  /* ================================================================
     7. COUNTER ANIMATION
     ================================================================ */

  const initCounters = () => {
    const counters = document.querySelectorAll('.stat-number');
    if (!counters.length) return;

    const DURATION = 1500; // ms

    const animateCounter = (el) => {
      const target = parseInt(el.dataset.target, 10) || 0;
      const start = performance.now();

      const step = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / DURATION, 1);

        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target;
        }
      };

      requestAnimationFrame(step);
    };

    if (!('IntersectionObserver' in window)) {
      counters.forEach((el) => {
        el.textContent = parseInt(el.dataset.target, 10) || 0;
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.3 }
    );

    counters.forEach((el) => observer.observe(el));
  };

  /* ================================================================
     8. TYPEWRITER EFFECT
     ================================================================ */

  const initTypewriter = () => {
    const el = document.querySelector('.typewriter-text');
    if (!el) return;

    const texts = [
      'build Moodle LMS solutions.',
      'write clean PHP code.',
      'design custom dashboards.',
      'love solving problems.',
      'am a PHP Developer.',
    ];

    const TYPE_SPEED = 80;
    const ERASE_SPEED = 40;
    const PAUSE = 2000;

    let textIdx = 0;
    let charIdx = 0;
    let isErasing = false;

    const tick = () => {
      const current = texts[textIdx];

      if (!isErasing) {
        // Typing
        charIdx++;
        el.textContent = current.slice(0, charIdx);

        if (charIdx === current.length) {
          isErasing = true;
          setTimeout(tick, PAUSE);
          return;
        }
        setTimeout(tick, TYPE_SPEED);
      } else {
        // Erasing
        charIdx--;
        el.textContent = current.slice(0, charIdx);

        if (charIdx === 0) {
          isErasing = false;
          textIdx = (textIdx + 1) % texts.length;
          setTimeout(tick, TYPE_SPEED);
          return;
        }
        setTimeout(tick, ERASE_SPEED);
      }
    };

    tick();
  };

  /* ================================================================
     9. PROJECT CARD 3D TILT
     ================================================================ */

  const initCardTilt = () => {
    const cards = document.querySelectorAll('.project-card');
    if (!cards.length) return;

    const MAX_TILT = 5; // degrees

    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;

        const rotateY = ((x - cx) / cx) * MAX_TILT;
        const rotateX = ((cy - y) / cy) * MAX_TILT;

        card.style.transition = 'transform 0.1s ease';
        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02,1.02,1.02)`;

        // CSS custom props for glow effect
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });

      card.addEventListener('mouseenter', () => {
        card.style.transition = 'transform 0.15s ease';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.5s ease';
        card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1,1,1)';
      });
    });
  };

  /* ================================================================
     10. ACTIVE NAV HIGHLIGHTING
     ================================================================ */

  const initActiveNav = () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            link.classList.toggle(
              'active',
              link.getAttribute('href') === `#${id}`
            );
          });
        });
      },
      {
        threshold: 0.3,
        rootMargin: '-80px 0px -40% 0px',
      }
    );

    sections.forEach((s) => observer.observe(s));
  };

  /* ================================================================
     11. SMOOTH SCROLL
     ================================================================ */

  const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      });
    });
  };

  /* ================================================================
     12. BACK TO TOP
     ================================================================ */

  const initBackToTop = () => {
    const btn = document.querySelector('.back-to-top');
    if (!btn) return;

    window.addEventListener(
      'scroll',
      () => {
        btn.classList.toggle('visible', window.scrollY > 500);
      },
      { passive: true }
    );

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  /* ================================================================
     13. FORM VALIDATION
     ================================================================ */

  const initFormValidation = () => {
    const form = document.getElementById('feedback-form');
    if (!form) return;

    const markInvalid = (field) => {
      field.style.borderColor = '#ef4444';
    };

    const clearInvalid = (field) => {
      field.style.borderColor = '';
    };

    // Clear red border on focus
    form.querySelectorAll('input, textarea, select').forEach((field) => {
      field.addEventListener('focus', () => clearInvalid(field));
    });

    form.addEventListener('submit', (e) => {
      let valid = true;

      form.querySelectorAll('[required]').forEach((field) => {
        if (!field.value.trim()) {
          markInvalid(field);
          valid = false;
        } else {
          clearInvalid(field);
        }
      });

      if (!valid) {
        e.preventDefault();
        return;
      }

      // Show sending state — let the form submit naturally (formsubmit.co)
      const btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Sending...';
      }
    });
  };

  /* ================================================================
     14. PROJECT CARD HOVER GLOW (injected style)
     ================================================================ */

  const initProjectGlowStyle = () => {
    const style = document.createElement('style');
    style.textContent = `
      .project-card {
        position: relative;
        overflow: hidden;
      }
      .project-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(
          600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
          rgba(0, 245, 255, 0.08),
          transparent 40%
        );
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
        z-index: 1;
      }
      .project-card:hover::before {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
  };

  /* ================================================================
     15. PARALLAX ORBS
     ================================================================ */

  const initParallaxOrbs = () => {
    if (isTouchDevice()) return;
    const orbs = document.querySelectorAll('.orb');
    if (!orbs.length) return;

    let ticking = false;

    const update = () => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (mouse.x - cx) / cx; // -1 … 1
      const dy = (mouse.y - cy) / cy;

      orbs.forEach((orb, i) => {
        // Each orb gets a unique shift magnitude (5-15px)
        const strength = 5 + ((i % 3) * 5); // 5, 10, 15
        const tx = dx * strength;
        const ty = dy * strength;
        orb.style.transform = `translate(${tx}px, ${ty}px)`;
      });

      ticking = false;
    };

    document.addEventListener('mousemove', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    });
  };

  /* ================================================================
     16. HERO SHOWCASE SPOTLIGHT
     ================================================================ */

  const initHeroShowcase = () => {
    const card = document.querySelector('.showcase-card');
    if (!card) return;

    card.addEventListener('mousemove', (e) => {
      if (isTouchDevice()) return;
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      card.style.setProperty('--spotlight-x', `${x}%`);
      card.style.setProperty('--spotlight-y', `${y}%`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--spotlight-x', '50%');
      card.style.setProperty('--spotlight-y', '50%');
    });
  };

  /* ================================================================
     INIT — Kick everything off on DOMContentLoaded
     ================================================================ */

  document.addEventListener('DOMContentLoaded', () => {
    try {
      initPreloader();
      initParticles();
      initCursorGlow();
      initStickyHeader();
      initMobileNav();
      initScrollReveal();
      initCounters();
      initTypewriter();
      initCardTilt();
      initActiveNav();
      initSmoothScroll();
      initBackToTop();
      initFormValidation();
      initProjectGlowStyle();
      initParallaxOrbs();
      initHeroShowcase();
    } catch (error) {
      console.error('Portfolio startup failed:', error);
      document.getElementById('preloader')?.remove();
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('active'));
    }
  });
})();
