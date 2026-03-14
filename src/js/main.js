import { projectStatusData } from '/src/data/project_status.js';
/* ======================================================================
   CBGIPL — Main JavaScript
   Handles: Preloader, Navbar, Scroll Animations, Counters,
            Project Filters, Particles, Mobile Nav
   ====================================================================== */

import { threeManager } from './three-manager';
import { roadmapManager } from './roadmap-manager';

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initNavbar();
  initScrollAnimations();
  initCounters();
  initProjectFilters();
  initHeroParticles();
  initMobileNav();
  initBackToTop();
  initContactForm();
  initSmoothScroll();
  initRoadmapAnimation();
  initLeadershipTilt(); // Added initLeadershipTilt
  // initFaqAccordion(); // Added initFaqAccordion - assuming this was intended to be added as well

  // Initialize Lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }
});

/* ── PRELOADER ── */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  const totalFloors = 15;
  const initialDelay = 500;
  const floorInterval = 300;
  const totalDuration = totalFloors * floorInterval;

  const progressFill = document.getElementById('preloaderProgress');
  const percentText = document.getElementById('preloaderPercent');

  let startTime;
  let dismissed = false;

  function finishPreloader() {
    if (dismissed) return;
    dismissed = true;
    setTimeout(() => {
      if (threeManager) threeManager.fadeOut();
      preloader.classList.add('loaded');
      document.body.style.overflow = '';
    }, 800);
  }

  function updateSmoothProgress(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;

    let progress = Math.min(elapsed / totalDuration, 1);

    // Update 3D Scene
    if (threeManager && typeof threeManager.updateProgress === 'function') {
      threeManager.updateProgress(progress);
    }

    // Update UI elements
    const percent = Math.round(progress * 100);
    if (progressFill) progressFill.style.width = `${percent}%`;
    if (percentText) percentText.textContent = `${percent}%`;

    // Update Market Value Ticker
    const marketVal = document.getElementById('marketValue');
    const marketGro = document.getElementById('marketGrowth');
    if (marketVal && marketGro) {
      const startVal = 1.25;
      const endVal = 48.8;
      const currentVal = (startVal + (endVal - startVal) * progress).toFixed(1);
      const growth = Math.round(((currentVal - startVal) / startVal) * 100);
      marketVal.textContent = `$${currentVal}B`;
      marketGro.textContent = `+${growth}%`;
    }

    if (progress < 1) {
      requestAnimationFrame(updateSmoothProgress);
    } else {
      // Animation done — always dismiss after a short pause
      finishPreloader();
    }
  }

  setTimeout(() => {
    requestAnimationFrame(updateSmoothProgress);
  }, initialDelay);

  // Hard fallback — never let preloader block for more than 8 seconds
  setTimeout(() => {
    finishPreloader();
  }, 8000);
}

/* ── NAVBAR ── */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active nav link based on current page
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href === '/' && (currentPath === '/' || currentPath === '/index.html')) {
        link.classList.add('active');
      } else if (href !== '/' && currentPath.includes(href)) {
        link.classList.add('active');
      }
    });

    lastScroll = currentScroll;
  });
}

/* ── SCROLL ANIMATIONS ── */
function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => {
            entry.target.classList.add('animated');
          }, parseInt(delay));
          observer.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      rootMargin: '0px 0px -80px 0px',
      threshold: 0.1,
    }
  );

  document.querySelectorAll('[data-animate]').forEach(el => {
    observer.observe(el);
  });
}

/* ── COUNTER ANIMATION ── */
function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-count]');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
  const target = parseInt(element.dataset.count);
  const duration = 2000;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out quad
    const eased = 1 - (1 - progress) * (1 - progress);
    const current = Math.floor(eased * target);

    element.textContent = current.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = target.toLocaleString();
    }
  }

  requestAnimationFrame(update);
}

/* ── PROJECT FILTERS ── */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Active state
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      cards.forEach(card => {
        if (filter === 'all') {
          card.classList.remove('hidden');
          card.style.animation = 'fadeInUp 0.5s var(--ease) forwards';
        } else {
          const categories = card.dataset.category || '';
          if (categories.includes(filter)) {
            card.classList.remove('hidden');
            card.style.animation = 'fadeInUp 0.5s var(--ease) forwards';
          } else {
            card.classList.add('hidden');
          }
        }
      });
    });
  });
}

/* ── ROADMAP ANIMATION ── */
function initRoadmapAnimation() {
  const roadmap = document.querySelector('.roadmap-section');
  if (!roadmap) return;

  const items = document.querySelectorAll('.timeline-item');

  window.addEventListener('scroll', () => {
    const windowHeight = window.innerHeight;

    // Toggle active state for items
    items.forEach((item, index) => {
      const itemRect = item.getBoundingClientRect();
      // Active when item is centered in view
      if (itemRect.top < windowHeight * 0.6 && itemRect.bottom > windowHeight * 0.4) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  });
}

/* ── HERO PARTICLES ── */
function initHeroParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;

  const particleCount = 30;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'hero-particle';
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.width = `${Math.random() * 3 + 1}px`;
    particle.style.height = particle.style.width;
    particle.style.animationDuration = `${Math.random() * 15 + 10}s`;
    particle.style.animationDelay = `${Math.random() * 10}s`;
    particle.style.opacity = Math.random() * 0.5 + 0.1;
    container.appendChild(particle);
  }
}

/* ── MOBILE NAV ── */
function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    links.classList.toggle('open');
  });

  // Close on link click
  links.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      links.classList.remove('open');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !links.contains(e.target)) {
      toggle.classList.remove('active');
      links.classList.remove('open');
    }
  });
}

/* ── BACK TO TOP ── */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 600) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/**
 * Leadership 3D Tilt Interaction
 */
function initLeadershipTilt() {
  const cards = document.querySelectorAll('.leader-card');
  if (cards.length === 0) return;

  cards.forEach(card => {
    const frame = card.querySelector('.leader-frame');
    if (!frame) return;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = -(y - centerY) / 10;
      const rotateY = (x - centerX) / 10;

      frame.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
    });

    card.addEventListener('mouseleave', () => {
      frame.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0px)';
    });
  });
}

/* ── CONTACT FORM ── */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;

    btn.innerHTML = '<span>Sending...</span>';
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = '<span>Message Sent! ✓</span>';
      btn.style.background = 'linear-gradient(135deg, #22C55E, #16A34A)';

      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
        btn.disabled = false;
        form.reset();

        // Re-init icons
        if (window.lucide) lucide.createIcons();
      }, 2500);
    }, 1500);
  });
}

/* ── SMOOTH SCROLL ── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offset = 80;
        const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });
}

/* ── FADE IN UP KEYFRAME (for filter animations) ── */
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);


// --- Project Status Cards ---
const statusGrid = document.getElementById('status-project-grid');

if (statusGrid) {
  projectStatusData.forEach(item => {
    const isReady = item.status.includes("Ready");
    const statusColor = isReady ? '#22C55E' : '#F59E0B';
    const statusBg = isReady ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)';
    const statusBorder = isReady ? 'rgba(34, 197, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)';

    const card = document.createElement('div');
    card.className = 'glass-card';
    card.style.cssText = 'padding: 28px; border-radius: var(--radius-md); transition: transform 0.3s ease, border-color 0.3s ease;';
    card.onmouseover = function() { this.style.transform='translateY(-4px)'; this.style.borderColor='var(--gold-glimmer)'; };
    card.onmouseout = function() { this.style.transform=''; this.style.borderColor=''; };

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
        <h4 style="color: var(--white); font-size: 1rem; font-weight: 600; line-height: 1.4; flex: 1; margin-right: 12px;">${item.project}</h4>
        <span style="font-size: 0.65rem; padding: 4px 10px; border-radius: var(--radius-pill); background: ${statusBg}; color: ${statusColor}; border: 1px solid ${statusBorder}; white-space: nowrap; font-family: var(--font-accent); text-transform: uppercase; letter-spacing: 1px;">${isReady ? 'Ready' : 'Under DD'}</span>
      </div>
      <div style="display: flex; gap: 20px; align-items: center;">
        <div style="display: flex; align-items: center; gap: 6px; color: var(--text-secondary); font-size: 0.85rem;">
          <i data-lucide="map-pin" style="width: 14px; height: 14px; color: var(--gold);"></i>
          ${item.location}
        </div>
        ${item.area !== 'To be estimated' ? `<div style="display: flex; align-items: center; gap: 6px; color: var(--text-secondary); font-size: 0.85rem;"><i data-lucide="maximize" style="width: 14px; height: 14px; color: var(--gold);"></i>${item.area}</div>` : ''}
      </div>
    `;
    statusGrid.appendChild(card);
  });

  // Re-init Lucide icons for the new cards
  if (window.lucide) lucide.createIcons();
}
