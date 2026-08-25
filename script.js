/* =====================================================
   SETHA CHAN — PORTFOLIO SCRIPT
   Vanilla JS only. Organized by feature so it's easy
   to find and edit each interaction.
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* -----------------------------------------------
     1. LOADING ANIMATION (terminal boot sequence)
  ------------------------------------------------ */
  const loader = document.getElementById('loader');
  const loaderText = document.getElementById('loaderText');
  const bootLine = 'booting portfolio...';
  let bootIndex = 0;

  function typeBoot(){
    if (bootIndex <= bootLine.length){
      loaderText.textContent = bootLine.slice(0, bootIndex);
      bootIndex++;
      setTimeout(typeBoot, 45);
    } else {
      setTimeout(() => loader.classList.add('hide'), 350);
    }
  }
  typeBoot();

  /* -----------------------------------------------
     2. NAVBAR: scroll shadow + smooth scroll
  ------------------------------------------------ */
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
    toggleBackToTop();
    updateActiveNavLink();
  });

  document.querySelectorAll('[data-nav]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')){
        e.preventDefault();
        const target = document.querySelector(href);
        if (target){
          window.scrollTo({
            top: target.offsetTop - (document.getElementById('navbar').offsetHeight - 1),
            behavior: 'smooth'
          });
        }
        closeMobileMenu();
      }
    });
  });

  /* -----------------------------------------------
     3. MOBILE HAMBURGER MENU
  ------------------------------------------------ */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  function closeMobileMenu(){
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  /* -----------------------------------------------
     4. ACTIVE NAV LINK WHILE SCROLLING
  ------------------------------------------------ */
  const sections = document.querySelectorAll('section[id]');
  const navLinkEls = document.querySelectorAll('.nav-link[data-nav]');

  function updateActiveNavLink(){
    let currentId = sections[0] ? sections[0].id : '';
    const scrollPos = window.scrollY + window.innerHeight * 0.35;

    sections.forEach(sec => {
      if (scrollPos >= sec.offsetTop){
        currentId = sec.id;
      }
    });

    navLinkEls.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
    });
  }

  /* -----------------------------------------------
     5. SCROLL REVEAL ANIMATIONS
  ------------------------------------------------ */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => revealObserver.observe(el));

  /* -----------------------------------------------
     6. ANIMATED SKILL PROGRESS BARS
  ------------------------------------------------ */
  const skillCards = document.querySelectorAll('.skill-card');

  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        const card = entry.target;
        const fill = card.querySelector('.progress-fill');
        const percentLabel = card.querySelector('.skill-percent');
        const target = parseInt(fill.dataset.fill, 10);

        fill.style.width = target + '%';
        animateCounter(percentLabel, target, '%');

        skillObserver.unobserve(card);
      }
    });
  }, { threshold: 0.3 });

  skillCards.forEach(card => skillObserver.observe(card));

  /* -----------------------------------------------
     7. ANIMATED NUMBER COUNTERS (stats section)
  ------------------------------------------------ */
  const statNumbers = document.querySelectorAll('.stat-num');

  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        animateCounter(el, target, suffix);
        statObserver.unobserve(el);
      }
    });
  }, { threshold: 0.4 });

  statNumbers.forEach(el => statObserver.observe(el));

  function animateCounter(el, target, suffix){
    const duration = 1200;
    const start = performance.now();

    function step(now){
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value = Math.round(eased * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* -----------------------------------------------
     8. FLOATING HERO CARDS + MOUSE PARALLAX
  ------------------------------------------------ */
  const heroSection = document.querySelector('.hero');
  const floatCards = document.querySelectorAll('[data-float]');
  const avatarFrame = document.getElementById('avatarFrame');

  heroSection.addEventListener('mousemove', (e) => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth - 0.5) * 2;   // -1 to 1
    const y = (e.clientY / innerHeight - 0.5) * 2;

    avatarFrame.style.transform = `rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;

    floatCards.forEach((card, i) => {
      const depth = (i + 1) * 4;
      card.style.marginLeft = `${x * depth}px`;
      card.style.marginTop = `${y * depth}px`;
    });
  });

  heroSection.addEventListener('mouseleave', () => {
    avatarFrame.style.transform = 'rotateY(0) rotateX(0)';
  });

  /* -----------------------------------------------
     9. PARTICLES (subtle background effect)
  ------------------------------------------------ */
  const particlesContainer = document.getElementById('particles');
  const PARTICLE_COUNT = 26;

  for (let i = 0; i < PARTICLE_COUNT; i++){
    const p = document.createElement('span');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.bottom = '-10px';
    p.style.animationDuration = (8 + Math.random() * 10) + 's';
    p.style.animationDelay = (Math.random() * 10) + 's';
    p.style.opacity = (0.2 + Math.random() * 0.4).toString();
    particlesContainer.appendChild(p);
  }

  /* -----------------------------------------------
     10. TYPING ANIMATION FOR DEVELOPER TITLE
  ------------------------------------------------ */
  const typingEl = document.getElementById('typingTitle');
  const phrases = [
    'Future Full-Stack Developer.',
    'Building My Skills, One Project at a Time.',
    'Turning Curiosity Into Code.'
  ];
  let phraseIndex = 0, charIndex = 0, deleting = false;

  function typeLoop(){
    const current = phrases[phraseIndex];

    if (!deleting){
      charIndex++;
      typingEl.textContent = current.slice(0, charIndex);
      if (charIndex === current.length){
        deleting = true;
        setTimeout(typeLoop, 1600);
        return;
      }
    } else {
      charIndex--;
      typingEl.textContent = current.slice(0, charIndex);
      if (charIndex === 0){
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
    }
    setTimeout(typeLoop, deleting ? 35 : 65);
  }
  typeLoop();

  /* -----------------------------------------------
     11. BACK TO TOP BUTTON
  ------------------------------------------------ */
  const backToTop = document.getElementById('backToTop');

  function toggleBackToTop(){
    backToTop.classList.toggle('show', window.scrollY > 500);
  }

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* -----------------------------------------------
     12. CONTACT FORM VALIDATION
  ------------------------------------------------ */
  const form = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  const validators = {
    fullName: (v) => v.trim().length >= 2 || 'Please enter your full name.',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Please enter a valid email address.',
    subject: (v) => v.trim().length >= 3 || 'Please enter a subject.',
    message: (v) => v.trim().length >= 10 || 'Message should be at least 10 characters.'
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    Object.keys(validators).forEach(field => {
      const input = form.elements[field];
      const errorEl = document.getElementById(`err-${field}`);
      const result = validators[field](input.value);

      if (result === true){
        input.classList.remove('invalid');
        errorEl.textContent = '';
      } else {
        input.classList.add('invalid');
        errorEl.textContent = result;
        isValid = false;
      }
    });

    if (isValid){
      formSuccess.classList.add('show');
      form.reset();
      setTimeout(() => formSuccess.classList.remove('show'), 6000);
    } else {
      formSuccess.classList.remove('show');
    }
  });

  // Clear individual field errors as the user types
  Object.keys(validators).forEach(field => {
    const input = form.elements[field];
    input.addEventListener('input', () => {
      if (validators[field](input.value) === true){
        input.classList.remove('invalid');
        document.getElementById(`err-${field}`).textContent = '';
      }
    });
  });

  /* -----------------------------------------------
     13. DOWNLOAD CV PLACEHOLDER
  ------------------------------------------------ */
  const downloadCv = document.getElementById('downloadCv');
  downloadCv.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Add your CV file (e.g. cv.pdf) to the project folder and update the link in index.html (#downloadCv) to point to it.');
  });

  /* Initialize nav state on load */
  updateActiveNavLink();
});
