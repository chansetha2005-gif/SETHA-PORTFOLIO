/* =====================================================
   SETHA CHAN — PORTFOLIO SCRIPT
   Vanilla JS. Each feature is an isolated init function
   so it can be found, tested, and edited independently.
   ===================================================== */

(() => {
  'use strict';

  const NAV_SHADOW_Y = 20;
  const BACK_TO_TOP_Y = 500;
  const LOADER_TYPE_MS = 45;
  const LOADER_HOLD_MS = 350;
  const COUNTER_MS = 1200;
  const PARTICLE_COUNT = 26;
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  /** Parse an integer from a data attribute; fall back if missing or NaN. */
  function parseNumber(value, fallback = 0) {
    const n = Number.parseInt(value, 10);
    return Number.isFinite(n) ? n : fallback;
  }

  /** Clamp a number into [min, max]. */
  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function onReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  }

  /**
   * Observe elements once they enter the viewport, then unobserve.
   * No-ops when the list is empty so callers don't need extra guards.
   */
  function observeOnce(elements, onEnter, options) {
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        onEnter(entry.target);
        observer.unobserve(entry.target);
      });
    }, options);

    elements.forEach((el) => observer.observe(el));
  }

  function animateCounter(el, target, suffix) {
    if (!el) return;

    if (prefersReducedMotion()) {
      el.textContent = target + suffix;
      return;
    }

    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / COUNTER_MS, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  function navbarOffset() {
    const navbar = $('#navbar');
    return navbar ? navbar.offsetHeight - 1 : 0;
  }

  function scrollToHash(hash) {
    if (!hash || hash === '#') return false;
    const target = $(hash);
    if (!target) return false;

    window.scrollTo({
      top: target.offsetTop - navbarOffset(),
      behavior: prefersReducedMotion() ? 'auto' : 'smooth'
    });
    return true;
  }

  /* -----------------------------------------------
     1. LOADING ANIMATION (terminal boot sequence)
  ------------------------------------------------ */
  function initLoader() {
    const loader = $('#loader');
    const loaderText = $('#loaderText');
    if (!loader) return;

    if (!loaderText || prefersReducedMotion()) {
      loader.classList.add('hide');
      return;
    }

    const bootLine = 'booting portfolio...';
    let bootIndex = 0;

    function typeBoot() {
      if (bootIndex <= bootLine.length) {
        loaderText.textContent = bootLine.slice(0, bootIndex);
        bootIndex += 1;
        setTimeout(typeBoot, LOADER_TYPE_MS);
      } else {
        setTimeout(() => loader.classList.add('hide'), LOADER_HOLD_MS);
      }
    }

    typeBoot();
  }

  /* -----------------------------------------------
     2. NAVBAR + MOBILE MENU + ACTIVE SECTION
  ------------------------------------------------ */
  function initNavigation() {
    const navbar = $('#navbar');
    const hamburger = $('#hamburger');
    const mobileMenu = $('#mobileMenu');
    const sections = $$('section[id]');
    const navLinks = $$('.nav-link[data-nav]');
    const backToTop = $('#backToTop');

    function closeMobileMenu() {
      if (!hamburger || !mobileMenu) return;
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }

    function updateActiveNavLink() {
      if (!sections.length) return;

      let currentId = sections[0].id;
      const scrollPos = window.scrollY + window.innerHeight * 0.35;

      sections.forEach((sec) => {
        if (scrollPos >= sec.offsetTop) currentId = sec.id;
      });

      navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
      });
    }

    function onScroll() {
      const y = window.scrollY;
      if (navbar) navbar.classList.toggle('scrolled', y > NAV_SHADOW_Y);
      if (backToTop) backToTop.classList.toggle('show', y > BACK_TO_TOP_Y);
      updateActiveNavLink();
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        onScroll();
        ticking = false;
      });
    }, { passive: true });

    $$('[data-nav]').forEach((link) => {
      link.addEventListener('click', (event) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#') && scrollToHash(href)) {
          event.preventDefault();
          closeMobileMenu();
        }
      });
    });

    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.toggle('open');
        hamburger.classList.toggle('active', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
      });

      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMobileMenu();
      });
    }

    if (backToTop) {
      backToTop.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: prefersReducedMotion() ? 'auto' : 'smooth'
        });
      });
    }

    onScroll();
  }

  /* -----------------------------------------------
     3. SCROLL REVEAL ANIMATIONS
  ------------------------------------------------ */
  function initReveal() {
    observeOnce($$('.reveal'), (el) => el.classList.add('in-view'), { threshold: 0.15 });
  }

  /* -----------------------------------------------
     4. ANIMATED SKILL PROGRESS BARS
  ------------------------------------------------ */
  function initSkillBars() {
    observeOnce($$('.skill-card'), (card) => {
      const fill = $('.progress-fill', card);
      const percentLabel = $('.skill-percent', card);
      if (!fill) return;

      const target = clamp(parseNumber(fill.dataset.fill, 0), 0, 100);

      if (prefersReducedMotion()) {
        fill.style.width = `${target}%`;
        if (percentLabel) percentLabel.textContent = `${target}%`;
        return;
      }

      fill.style.width = `${target}%`;
      animateCounter(percentLabel, target, '%');
    }, { threshold: 0.3 });
  }

  /* -----------------------------------------------
     5. ANIMATED NUMBER COUNTERS (stats section)
  ------------------------------------------------ */
  function initStatCounters() {
    const statNums = $$('.stat-num');
    if (!statNums.length) return;

    // Render the final value immediately for users who don't want motion,
    // or in any case where the section is already on-screen at load.
    statNums.forEach((el) => {
      const target = parseNumber(el.dataset.count, 0);
      const suffix = el.dataset.suffix || '';
      if (prefersReducedMotion()) {
        el.textContent = target + suffix;
        el.dataset.counted = 'true';
      }
    });

    observeOnce(statNums, (el) => {
      if (el.dataset.counted === 'true') return;
      const target = parseNumber(el.dataset.count, 0);
      const suffix = el.dataset.suffix || '';
      animateCounter(el, target, suffix);
      el.dataset.counted = 'true';
    }, { threshold: 0.4 });
  }

  /* -----------------------------------------------
     6. FLOATING HERO CARDS + MOUSE PARALLAX
  ------------------------------------------------ */
  function initHeroParallax() {
    const heroSection = $('.hero');
    const avatarFrame = $('#avatarFrame');
    const floatCards = $$('[data-float]');
    if (!heroSection || !avatarFrame || prefersReducedMotion()) return;

    heroSection.addEventListener('mousemove', (event) => {
      const { innerWidth, innerHeight } = window;
      if (!innerWidth || !innerHeight) return;

      const x = (event.clientX / innerWidth - 0.5) * 2;
      const y = (event.clientY / innerHeight - 0.5) * 2;

      avatarFrame.style.transform = `rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;

      floatCards.forEach((card, i) => {
        const depth = (i + 1) * 4;
        card.style.marginLeft = `${x * depth}px`;
        card.style.marginTop = `${y * depth}px`;
      });
    });

    heroSection.addEventListener('mouseleave', () => {
      avatarFrame.style.transform = 'rotateY(0) rotateX(0)';
      floatCards.forEach((card) => {
        card.style.marginLeft = '';
        card.style.marginTop = '';
      });
    });
  }

  /* -----------------------------------------------
     7. PARTICLES (subtle background effect)
  ------------------------------------------------ */
  function initParticles() {
    const container = $('#particles');
    if (!container || prefersReducedMotion()) return;

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const particle = document.createElement('span');
      particle.className = 'particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.bottom = '-10px';
      particle.style.animationDuration = `${8 + Math.random() * 10}s`;
      particle.style.animationDelay = `${Math.random() * 10}s`;
      particle.style.opacity = String(0.2 + Math.random() * 0.4);
      fragment.appendChild(particle);
    }

    container.appendChild(fragment);
  }

  /* -----------------------------------------------
     8. TYPING ANIMATION FOR DEVELOPER TITLE
  ------------------------------------------------ */
  function initTypingTitle() {
    const typingEl = $('#typingTitle');
    if (!typingEl) return;

    const phrases = [
      'Future Full-Stack Developer.',
      'Building My Skills, One Project at a Time.',
      'Turning Curiosity Into Code.'
    ];

    if (prefersReducedMotion()) {
      typingEl.textContent = phrases[0];
      return;
    }

    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function typeLoop() {
      const current = phrases[phraseIndex];
      if (!current) return;

      if (!deleting) {
        charIndex += 1;
        typingEl.textContent = current.slice(0, charIndex);
        if (charIndex === current.length) {
          deleting = true;
          setTimeout(typeLoop, 1600);
          return;
        }
      } else {
        charIndex -= 1;
        typingEl.textContent = current.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
        }
      }

      setTimeout(typeLoop, deleting ? 35 : 65);
    }

    typeLoop();
  }

  /* -----------------------------------------------
     9. CONTACT FORM VALIDATION
  ------------------------------------------------ */
  function initContactForm() {
    const form = $('#contactForm');
    const formSuccess = $('#formSuccess');
    if (!form) return;

    const validators = {
      fullName: (value) => value.trim().length >= 2 || 'Please enter your full name.',
      email: (value) => EMAIL_PATTERN.test(value.trim()) || 'Please enter a valid email address.',
      subject: (value) => value.trim().length >= 3 || 'Please enter a subject.',
      message: (value) => value.trim().length >= 10 || 'Message should be at least 10 characters.'
    };

    function setFieldState(field, isValid, message) {
      const input = form.elements[field];
      const errorEl = document.getElementById(`err-${field}`);
      if (!input) return;

      input.classList.toggle('invalid', !isValid);
      input.setAttribute('aria-invalid', String(!isValid));
      if (errorEl) errorEl.textContent = isValid ? '' : message;
    }

    function validateField(field) {
      const input = form.elements[field];
      const validator = validators[field];
      if (!input || !validator) return true;

      const result = validator(input.value);
      const isValid = result === true;
      setFieldState(field, isValid, isValid ? '' : result);
      return isValid;
    }

    function validateForm() {
      return Object.keys(validators).every(validateField);
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      if (!validateForm()) {
        formSuccess?.classList.remove('show');
        const firstInvalid = form.querySelector('.invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      formSuccess?.classList.add('show');
      form.reset();

      Object.keys(validators).forEach((field) => setFieldState(field, true, ''));
      setTimeout(() => formSuccess?.classList.remove('show'), 6000);
    });

    Object.keys(validators).forEach((field) => {
      const input = form.elements[field];
      if (!input) return;

      input.addEventListener('input', () => {
        if (validators[field](input.value) === true) setFieldState(field, true, '');
      });

      input.addEventListener('blur', () => {
        if (input.value.trim()) validateField(field);
      });
    });
  }

  /* -----------------------------------------------
     10. DOWNLOAD CV PLACEHOLDER
  ------------------------------------------------ */
  function initDownloadCv() {
    const downloadCv = $('#downloadCv');
    if (!downloadCv) return;

    const href = downloadCv.getAttribute('href');
    const hasFile = href && href !== '#' && !href.startsWith('javascript:');
    if (hasFile) return;

    downloadCv.addEventListener('click', (event) => {
      event.preventDefault();
      window.alert(
        'Add your CV file (e.g. cv.pdf) to the project folder and update the link in index.html (#downloadCv) to point to it.'
      );
    });
  }

  onReady(() => {
    initLoader();
    initNavigation();
    initReveal();
    initSkillBars();
    initStatCounters();
    initHeroParallax();
    initParticles();
    initTypingTitle();
    initContactForm();
    initDownloadCv();
  });
})();
