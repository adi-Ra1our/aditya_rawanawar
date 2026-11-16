/**
 * ADITYA B RAWANAWAR PORTFOLIO — CORE SCRIPT
 * Theme switching, sticky scroll spy, 3D flip card, mobile drawer, sound synthesis
 */

(function () {
  'use strict';

  // 1. Audio Engine (Synthesized Tactile Neo-Brutalist Clicks using Web Audio API)
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.muted = false;
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playClick() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    }

    playPop() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.09, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    }
  }

  const sound = new SoundEngine();

  // Attach sound to interactive elements
  document.addEventListener('click', (e) => {
    const target = e.target.closest('button, a, .mark, .s-tool, .doc__row, .portrait');
    if (target) {
      sound.playClick();
    }
  });

  // 2. Theme Management
  const THEMES = ['cream', 'tokyo-night', 'dracula', 'nord', 'cyber'];
  let currentThemeIndex = 0;

  function initTheme() {
    const savedTheme = localStorage.getItem('site-theme') || 'cream';
    setTheme(savedTheme);

    const themeButtons = document.querySelectorAll('.themepick');
    themeButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'cream';
        const next = current === 'cream' ? 'tokyo-night' : 'cream';
        setTheme(next);
        sound.playPop();
      });
    });
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('site-theme', theme);

    // Update icon
    const themeButtons = document.querySelectorAll('.themepick');
    themeButtons.forEach((btn) => {
      btn.innerHTML =
        theme === 'tokyo-night' || theme === 'dracula' || theme === 'nord' || theme === 'cyber'
          ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`
          : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`;
      btn.setAttribute('title', theme === 'cream' ? 'Switch to dark theme' : 'Switch to light theme');
    });
  }

  // 3. Mobile Navigation Drawer
  function initMobileDrawer() {
    const menuBtn = document.querySelector('.bar__menu');
    const drawer = document.querySelector('.drawer');
    const closeBtn = document.querySelector('.drawer__close');
    const backdrop = document.querySelector('.drawer__backdrop');
    const drawerLinks = document.querySelectorAll('.drawer__links a');

    if (!menuBtn || !drawer) return;

    function openDrawer() {
      drawer.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
      drawer.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    menuBtn.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (backdrop) backdrop.addEventListener('click', closeDrawer);

    drawerLinks.forEach((link) => {
      link.addEventListener('click', closeDrawer);
    });
  }

  // 4. Experience Scroll Spy (Left Sticky Indicator)
  function initScrollSpy() {
    const jobs = document.querySelectorAll('.job');
    const navItems = document.querySelectorAll('.xp__nav li');

    if (!jobs.length || !navItems.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navItems.forEach((li) => {
              const link = li.querySelector('a');
              if (link && link.getAttribute('href') === `#${id}`) {
                li.classList.add('is-active');
              } else {
                li.classList.remove('is-active');
              }
            });
          }
        });
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0.1,
      }
    );

    jobs.forEach((job) => observer.observe(job));
  }

  // 5. 3D Flippable Portrait Card
  function initPortrait() {
    const portrait = document.querySelector('.portrait');
    if (!portrait) return;

    portrait.addEventListener('click', () => {
      portrait.classList.toggle('is-flipped');
      sound.playPop();
    });
  }

  // 6. Screenshot Carousel on Case Study Pages
  function initCarousels() {
    const carousels = document.querySelectorAll('.shots');

    carousels.forEach((carousel) => {
      const slides = carousel.querySelectorAll('.shots__slide');
      const prevBtn = carousel.querySelector('.shots__btn--prev');
      const nextBtn = carousel.querySelector('.shots__btn--next');
      const dots = carousel.querySelectorAll('.shots__dot');
      const countEl = carousel.querySelector('.shots__count');

      let currentIdx = 0;
      const total = slides.length;

      function updateSlide(idx) {
        currentIdx = idx;
        slides.forEach((slide, i) => {
          slide.classList.toggle('is-active', i === currentIdx);
        });
        dots.forEach((dot, i) => {
          dot.classList.toggle('is-active', i === currentIdx);
        });
        if (countEl) {
          countEl.textContent = `${currentIdx + 1} / ${total}`;
        }
        if (prevBtn) prevBtn.disabled = currentIdx === 0;
        if (nextBtn) nextBtn.disabled = currentIdx === total - 1;
      }

      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          if (currentIdx > 0) {
            updateSlide(currentIdx - 1);
            sound.playClick();
          }
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          if (currentIdx < total - 1) {
            updateSlide(currentIdx + 1);
            sound.playClick();
          }
        });
      }

      dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
          updateSlide(i);
          sound.playClick();
        });
      });

      // Keyboard navigation
      window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' && currentIdx > 0) {
          updateSlide(currentIdx - 1);
        } else if (e.key === 'ArrowRight' && currentIdx < total - 1) {
          updateSlide(currentIdx + 1);
        }
      });
    });
  }

  // 7. Back to Top Button
  function initBackToTop() {
    const totop = document.querySelector('.totop');
    if (!totop) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        totop.style.opacity = '1';
        totop.style.pointerEvents = 'auto';
      } else {
        totop.style.opacity = '0';
        totop.style.pointerEvents = 'none';
      }
    });

    totop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Initialize all on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMobileDrawer();
    initScrollSpy();
    initPortrait();
    initCarousels();
    initBackToTop();
  });
})();
