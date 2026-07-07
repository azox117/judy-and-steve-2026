/**
 * ============================================================
 *  Judy Lam & Steve Huang — Wedding Website
 *  main.js  ·  Core interactions
 * ============================================================
 *
 *  Sections handled:
 *    1. Password Gate
 *    2. Navigation (fixed, mobile, active-link)
 *    3. Scroll-triggered animations
 *    4. Hero parallax
 *    5. Countdown timer
 *    6. FAQ accordion
 *    7. Gallery lightbox
 * ============================================================
 */

(function () {
  'use strict';

  /* --------------------------------------------------------
   *  1. PASSWORD GATE
   * ------------------------------------------------------ */

  const PASSWORD = 'Tanklychee2026';

  const gate         = document.getElementById('password-gate');
  const gateForm     = gate?.querySelector('form') ?? gate?.querySelector('.password-form');
  const gateInput    = gate?.querySelector('input[type="text"], input[type="password"]');
  const gateError    = gate?.querySelector('.gate-error');

  function unlockSite() {
    sessionStorage.setItem('authenticated', 'true');
    gate.classList.add('hidden');            // triggers CSS opacity/visibility transition
    document.body.style.overflow = '';       // re-enable scrolling
  }

  function initGate() {
    if (!gate) return;

    // Already authenticated this session — skip the gate
    if (sessionStorage.getItem('authenticated') === 'true') {
      gate.style.display = 'none';
      document.body.style.overflow = '';
      return;
    }

    // Lock scroll while gate is visible
    document.body.style.overflow = 'hidden';
    gate.classList.remove('hidden');

    // After the fade-out transition, hide completely so it can't trap focus
    gate.addEventListener('transitionend', () => {
      if (gate.classList.contains('hidden')) {
        gate.style.display = 'none';
      }
    });

    // Listen for form submission (or button click if no <form>)
    const submitTarget = gateForm ?? gate;
    submitTarget.addEventListener('submit', (e) => {
      e.preventDefault();
      const value = gateInput?.value.trim();

      if (value === PASSWORD) {
        unlockSite();
      } else {
        // Shake animation — remove then re-add so it can replay
        const shakeEl = gateForm ?? gate;
        shakeEl.classList.remove('shake');
        void shakeEl.offsetWidth;           // force reflow
        shakeEl.classList.add('shake');

        if (gateError) {
          gateError.textContent = 'Incorrect password. Please try again.';
          gateError.style.display = 'block';
        }
      }
    });
  }

  /* --------------------------------------------------------
   *  2. NAVIGATION
   * ------------------------------------------------------ */

  const nav           = document.querySelector('nav');
  const navLinks      = document.querySelectorAll('nav a[href^="#"]');
  const hamburger     = document.getElementById('nav-toggle');
  const mobileMenu    = document.querySelector('.nav-links, .nav-menu, .mobile-menu');
  const SCROLL_THRESHOLD = 100;

  /** Add / remove 'scrolled' class on the navbar */
  function handleNavScroll() {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > SCROLL_THRESHOLD);
  }

  /** Smooth-scroll to a section, accounting for fixed-nav height */
  function scrollToSection(id) {
    const target = document.querySelector(id);
    if (!target) return;
    const navHeight = nav?.offsetHeight ?? 0;
    const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  /** Close the mobile menu */
  function closeMobileMenu() {
    hamburger?.classList.remove('active', 'open');
    mobileMenu?.classList.remove('active', 'open');
    document.body.classList.remove('menu-open');
  }

  /** Active-link highlighting via IntersectionObserver */
  function initActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach((link) => {
              link.classList.toggle(
                'active',
                link.getAttribute('href') === `#${id}`
              );
            });
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px' }
    );

    sections.forEach((section) => observer.observe(section));
  }

  function initNav() {
    // Scroll-based background change
    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll(); // set initial state

    // Smooth-scroll links
    navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        scrollToSection(href);
        closeMobileMenu();
      });
    });

    // Hamburger toggle
    hamburger?.addEventListener('click', (e) => {
      e.stopPropagation();
      hamburger.classList.toggle('active');
      hamburger.classList.toggle('open');
      mobileMenu?.classList.toggle('active');
      mobileMenu?.classList.toggle('open');
      document.body.classList.toggle('menu-open');
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
      if (
        mobileMenu?.classList.contains('active') &&
        !mobileMenu.contains(e.target) &&
        !hamburger?.contains(e.target)
      ) {
        closeMobileMenu();
      }
    });

    initActiveLink();
  }

  /* --------------------------------------------------------
   *  3. SCROLL ANIMATIONS
   * ------------------------------------------------------ */

  function initScrollAnimations() {
    const animatedElements = document.querySelectorAll(
      '.fade-in-up, .fade-in-left, .fade-in-right'
    );
    if (!animatedElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);   // animate only once
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    animatedElements.forEach((el) => observer.observe(el));
  }

  /* --------------------------------------------------------
   *  4. HERO PARALLAX
   * ------------------------------------------------------ */

  function initParallax() {
    const hero = document.getElementById('hero');
    if (!hero) return;

    let ticking = false;

    function updateParallax() {
      const scrolled = window.scrollY;
      const heroBg = document.querySelector('.hero-bg');
      if (!heroBg) return;
      // Move background slower than scroll for depth effect
      heroBg.style.transform = `translateY(${scrolled * 0.4}px)`;
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
  }

  /* --------------------------------------------------------
   *  5. COUNTDOWN TIMER
   * ------------------------------------------------------ */

  // ── Change this date to the actual wedding date/time ──
  const WEDDING_DATE = new Date('2026-10-10T17:00:00');

  function initCountdown() {
    const container = document.getElementById('countdown');
    if (!container) return;

    function pad(n) {
      return String(n).padStart(2, '0');
    }

    function update() {
      const now  = new Date();
      const diff = WEDDING_DATE - now;

      if (diff <= 0) {
        container.innerHTML = '<span class="countdown-message">Today is the day! 🎉</span>';
        return;
      }

      const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours   = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      container.innerHTML = `
        <div class="countdown-box">
          <span class="countdown-value">${days}</span>
          <span class="countdown-label">Days</span>
        </div>
        <div class="countdown-box">
          <span class="countdown-value">${pad(hours)}</span>
          <span class="countdown-label">Hours</span>
        </div>
        <div class="countdown-box">
          <span class="countdown-value">${pad(minutes)}</span>
          <span class="countdown-label">Minutes</span>
        </div>
        <div class="countdown-box">
          <span class="countdown-value">${pad(seconds)}</span>
          <span class="countdown-label">Seconds</span>
        </div>
      `;
    }

    update();
    setInterval(update, 1000);
  }

  /* --------------------------------------------------------
   *  6. FAQ ACCORDION
   * ------------------------------------------------------ */

  function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    if (!faqItems.length) return;

    // Use event delegation on each item's question/header
    faqItems.forEach((item) => {
      const question = item.querySelector('.faq-question, .faq-header');
      if (!question) return;

      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');

        // Close all other items first (single-open accordion)
        faqItems.forEach((other) => {
          if (other !== item) {
            other.classList.remove('active');
            const answer = other.querySelector('.faq-answer, .faq-body');
            if (answer) answer.style.maxHeight = null;
          }
        });

        // Toggle the clicked item
        item.classList.toggle('active', !isOpen);
        const answer = item.querySelector('.faq-answer, .faq-body');
        if (answer) {
          answer.style.maxHeight = !isOpen
            ? `${answer.scrollHeight}px`
            : null;
        }
      });
    });
  }

  /* --------------------------------------------------------
   *  7. GALLERY LIGHTBOX
   * ------------------------------------------------------ */

  function initLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    if (!galleryItems.length) return;

    // Build an ordered list of full-size URLs
    const images = Array.from(galleryItems).map((item) => {
      const img = item.querySelector('img');
      return img?.dataset.full || img?.src || '';
    });
    let currentIndex = 0;

    // Use the existing lightbox in the HTML
    const overlay    = document.getElementById('lightbox');
    if (!overlay) return;

    const lightboxImg = document.getElementById('lightbox-image');
    const btnClose    = overlay.querySelector('.lightbox-close');
    const btnPrev     = overlay.querySelector('.lightbox-prev');
    const btnNext     = overlay.querySelector('.lightbox-next');

    function openLightbox(index) {
      currentIndex = index;
      lightboxImg.src = images[currentIndex];
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    function showPrev() {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      lightboxImg.src = images[currentIndex];
    }

    function showNext() {
      currentIndex = (currentIndex + 1) % images.length;
      lightboxImg.src = images[currentIndex];
    }

    // Click handlers on gallery items
    galleryItems.forEach((item, i) => {
      item.style.cursor = 'pointer';
      item.addEventListener('click', () => openLightbox(i));
    });

    btnClose?.addEventListener('click', closeLightbox);
    btnPrev?.addEventListener('click', showPrev);
    btnNext?.addEventListener('click', showNext);

    // Close on overlay background click (not on the image itself)
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeLightbox();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!overlay.classList.contains('active')) return;
      if (e.key === 'Escape')      closeLightbox();
      if (e.key === 'ArrowLeft')   showPrev();
      if (e.key === 'ArrowRight')  showNext();
    });
  }

  /* --------------------------------------------------------
   *  INIT — kick everything off on DOMContentLoaded
   * ------------------------------------------------------ */

  document.addEventListener('DOMContentLoaded', () => {
    initGate();
    initNav();
    initScrollAnimations();
    initParallax();
    initCountdown();
    initFaqAccordion();
    initLightbox();
  });
})();
