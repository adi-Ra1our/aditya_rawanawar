/**
 * ADITYA B RAWANAWAR — INTERACTIVE CANVAS DESK SCRIPT
 * Spatial 2D infinite draggable desktop, macOS dock, draggable window cards, audio engine, zoom
 */

(function () {
  'use strict';

  // Sound Engine
  class CanvasSound {
    constructor() {
      this.ctx = null;
      this.enabled = true;
    }
    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) this.ctx = new AudioContext();
      }
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    }
    click() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    }
    pop() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(350, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    }
    swoosh() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(450, this.ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    }
  }

  const sfx = new CanvasSound();

  // State
  let panX = 0;
  let panY = 0;
  let zoom = 1.0;
  let isPanning = false;
  let startX = 0;
  let startY = 0;
  let highestZ = 10;

  const viewport = document.getElementById('viewport');
  const world = document.getElementById('world');
  const grid = document.getElementById('grid');
  const zoomDisplay = document.getElementById('zoom-val');

  function updateTransform() {
    world.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
    grid.style.transform = `translate(${panX % 40}px, ${panY % 40}px)`;
    if (zoomDisplay) {
      zoomDisplay.textContent = `${Math.round(zoom * 100)}%`;
    }
  }

  // Viewport Dragging (Pan)
  viewport.addEventListener('mousedown', (e) => {
    // Only pan if clicking the viewport background
    if (e.target === viewport || e.target === grid || e.target === world) {
      isPanning = true;
      startX = e.clientX - panX;
      startY = e.clientY - panY;
      viewport.style.cursor = 'grabbing';
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (!isPanning) return;
    panX = e.clientX - startX;
    panY = e.clientY - startY;
    updateTransform();
  });

  window.addEventListener('mouseup', () => {
    if (isPanning) {
      isPanning = false;
      viewport.style.cursor = 'grab';
    }
  });

  // Mouse Wheel Zoom
  viewport.addEventListener('wheel', (e) => {
    if (e.target.closest('.canvas-card__body')) return; // Allow scrolling inside cards
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    zoom = Math.min(Math.max(0.4, zoom * zoomFactor), 2.0);
    updateTransform();
  }, { passive: false });

  // Zoom Controls
  document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
    zoom = Math.min(2.0, zoom * 1.15);
    updateTransform();
    sfx.click();
  });

  document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
    zoom = Math.max(0.4, zoom / 1.15);
    updateTransform();
    sfx.click();
  });

  document.getElementById('btn-zoom-reset')?.addEventListener('click', () => {
    zoom = 1.0;
    panX = 0;
    panY = 0;
    updateTransform();
    sfx.pop();
  });

  // Draggable Window Cards
  const cards = document.querySelectorAll('.canvas-card');

  cards.forEach((card) => {
    const head = card.querySelector('.canvas-card__head');
    const closeBtn = card.querySelector('.canvas-card__close');
    let isDragging = false;
    let cardStartX = 0;
    let cardStartY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    // Bring to front on mousedown
    card.addEventListener('mousedown', () => {
      highestZ++;
      card.style.zIndex = highestZ;
    });

    if (head) {
      head.addEventListener('mousedown', (e) => {
        if (e.target.closest('.canvas-card__close')) return;
        isDragging = true;
        cardStartX = e.clientX;
        cardStartY = e.clientY;
        initialLeft = parseInt(card.style.left || '0', 10);
        initialTop = parseInt(card.style.top || '0', 10);
        head.style.cursor = 'grabbing';
        e.stopPropagation();
      });

      window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = (e.clientX - cardStartX) / zoom;
        const dy = (e.clientY - cardStartY) / zoom;
        card.style.left = `${initialLeft + dx}px`;
        card.style.top = `${initialTop + dy}px`;
      });

      window.addEventListener('mouseup', () => {
        if (isDragging) {
          isDragging = false;
          head.style.cursor = 'move';
        }
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        card.style.display = 'none';
        sfx.pop();
        // Update dock status
        const cardId = card.getAttribute('id');
        const dockItem = document.querySelector(`.dock__item[data-target="${cardId}"]`);
        if (dockItem) dockItem.setAttribute('data-open', 'false');
      });
    }
  });

  // Dock items toggle
  const dockItems = document.querySelectorAll('.dock__item[data-target]');
  dockItems.forEach((item) => {
    item.addEventListener('click', () => {
      const targetId = item.getAttribute('data-target');
      const targetCard = document.getElementById(targetId);
      if (!targetCard) return;

      if (targetCard.style.display === 'none') {
        targetCard.style.display = 'block';
        highestZ++;
        targetCard.style.zIndex = highestZ;
        item.setAttribute('data-open', 'true');
        sfx.swoosh();
      } else {
        targetCard.style.display = 'none';
        item.setAttribute('data-open', 'false');
        sfx.pop();
      }
    });
  });

  // Topbar Actions
  document.getElementById('btn-fit-all')?.addEventListener('click', () => {
    panX = 0;
    panY = 0;
    zoom = 0.85;
    updateTransform();
    sfx.pop();
  });

  document.getElementById('btn-minimise-all')?.addEventListener('click', () => {
    cards.forEach((c) => (c.style.display = 'none'));
    dockItems.forEach((i) => i.setAttribute('data-open', 'false'));
    sfx.pop();
  });

  document.getElementById('btn-sound-toggle')?.addEventListener('click', function () {
    sfx.enabled = !sfx.enabled;
    this.textContent = sfx.enabled ? 'Sound 🔊' : 'Sound 🔇';
    sfx.click();
  });

  // Theme Switcher on Canvas
  const THEMES = ['cream', 'tokyo-night', 'dracula', 'nord', 'cyber'];
  document.getElementById('btn-canvas-theme')?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'cream';
    const nextIdx = (THEMES.indexOf(current) + 1) % THEMES.length;
    const nextTheme = THEMES[nextIdx];
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('site-theme', nextTheme);
    sfx.pop();
  });

  // Load Saved Theme
  const savedTheme = localStorage.getItem('site-theme') || 'cream';
  document.documentElement.setAttribute('data-theme', savedTheme);

  // Onboarding dialog
  const onboarding = document.querySelector('.canvas-onboarding');
  const onboardingSteps = [
    {
      badge: '1 OF 4',
      title: 'This is a desk, not a page',
      desc: 'Drag the background to move around. Nothing scrolls here — everything is just somewhere in spatial space.',
    },
    {
      badge: '2 OF 4',
      title: 'Draggable Window Cards',
      desc: 'Grab any card header to move it around, close it with ✕, or reopen it from the bottom macOS dock.',
    },
    {
      badge: '3 OF 4',
      title: 'Playable Mini-Games',
      desc: 'Open the Arcade card to test your knowledge on Agentic AI and MLOps system engineering.',
    },
    {
      badge: '4 OF 4',
      title: 'Enjoy the Desk!',
      desc: 'Click themes in the top bar or toggle lo-fi audio sounds. Return to the normal website anytime.',
    },
  ];

  let currentStep = 0;
  const badgeEl = onboarding?.querySelector('.canvas-onboarding__badge');
  const titleEl = onboarding?.querySelector('h3');
  const descEl = onboarding?.querySelector('p');
  const nextBtn = document.getElementById('onboard-next');
  const skipBtn = document.getElementById('onboard-skip');

  function updateOnboarding() {
    if (!onboarding) return;
    const step = onboardingSteps[currentStep];
    if (badgeEl) badgeEl.textContent = step.badge;
    if (titleEl) titleEl.textContent = step.title;
    if (descEl) descEl.textContent = step.desc;
    if (nextBtn) nextBtn.textContent = currentStep === 3 ? 'Done' : 'Next';
  }

  nextBtn?.addEventListener('click', () => {
    if (currentStep < 3) {
      currentStep++;
      updateOnboarding();
      sfx.click();
    } else {
      if (onboarding) onboarding.style.display = 'none';
      sfx.pop();
    }
  });

  skipBtn?.addEventListener('click', () => {
    if (onboarding) onboarding.style.display = 'none';
    sfx.pop();
  });

  // Interactive Arcade Game: AI Systems & Architecture Quiz
  const questions = [
    {
      q: 'Which protocol did Aditya implement at ADE DRDO to eliminate hallucination in avionics HMI generation?',
      options: ['Formal verification & state validation', 'Zero-shot prompt hacking', 'Ignoring sensor drift', 'Random weights'],
      correct: 0,
    },
    {
      q: 'What ROC-AUC score did Aditya achieve in the MLOps Cancer Prediction Pipeline?',
      options: ['0.820', '0.916', '0.745', '0.680'],
      correct: 1,
    },
    {
      q: 'Which local LLM did Aditya integrate with Ollama for real-time incident explanations?',
      options: ['Llama-1 70B', 'Mistral 7B', 'GPT-2', 'BERT Large'],
      correct: 1,
    },
    {
      q: 'Which tool was utilized for pipeline stage versioning and dataset tracking?',
      options: ['DVC (Data Version Control)', 'FTP server', 'Google Sheets', 'Floppy disk'],
      correct: 0,
    },
  ];

  let currentQ = 0;
  let score = 0;

  function renderQuiz() {
    const quizContainer = document.getElementById('arcade-content');
    if (!quizContainer) return;

    if (currentQ >= questions.length) {
      quizContainer.innerHTML = `
        <div style="text-align: center; padding: 18px 0;">
          <h4 style="font-size: 1.3rem; font-weight: 800; color: #059669; margin-bottom: 8px;">🎉 Score: ${score} / ${questions.length}!</h4>
          <p style="font-size: 0.95rem; color: var(--ink-muted); margin-bottom: 16px;">You have mastered Aditya's engineering stack.</p>
          <button id="restart-quiz" class="btn btn--solid" style="padding: 8px 20px;">Play Again</button>
        </div>
      `;
      document.getElementById('restart-quiz')?.addEventListener('click', () => {
        currentQ = 0;
        score = 0;
        renderQuiz();
        sfx.pop();
      });
      return;
    }

    const item = questions[currentQ];
    quizContainer.innerHTML = `
      <div style="margin-bottom: 16px;">
        <span style="font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; color: var(--ink-subtle);">QUESTION ${currentQ + 1} OF ${questions.length}</span>
        <h4 style="font-size: 1.05rem; font-weight: 700; margin-top: 4px; margin-bottom: 14px;">${item.q}</h4>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${item.options
            .map(
              (opt, idx) => `
            <button class="quiz-opt s-tool" data-idx="${idx}" style="justify-content: flex-start; text-align: left; padding: 10px 14px; width: 100%;">
              <strong>${String.fromCharCode(65 + idx)}.</strong> ${opt}
            </button>
          `
            )
            .join('')}
        </div>
      </div>
    `;

    quizContainer.querySelectorAll('.quiz-opt').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const selected = parseInt(btn.getAttribute('data-idx'), 10);
        if (selected === item.correct) {
          score++;
          btn.style.backgroundColor = '#A8E6A1';
          sfx.pop();
        } else {
          btn.style.backgroundColor = '#FFB4A2';
          sfx.click();
        }
        setTimeout(() => {
          currentQ++;
          renderQuiz();
        }, 400);
      });
    });
  }

  renderQuiz();
  updateTransform();
})();
