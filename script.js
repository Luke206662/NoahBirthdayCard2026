// 1. Confetti Burst Function
const VBUCK_IMAGE_PATH = './Noah/vbucks.png';
const GOLDVBUCK_IMAGE_PATH = './Noah/goldVbuckCard.webp';
const PURPLEVBUCK_IMAGE_PATH = './Noah/purpleVbuckCard.jpg';
const BLUEVBUCK_IMAGE_PATH = './Noah/blueVbuckCard.jpg';

function fireConfetti() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 40,
      spread: 100,
      origin: { y: 0.7 },
      scalar: 0.8,
      disableForReducedMotion: true
    });
  }
}

// 3. Button Click Event for Confetti
const confettiBtn = document.getElementById('confetti-btn');
if (confettiBtn) {
  confettiBtn.addEventListener('click', () => {
    fireConfetti();
  });
}

// 4. Photo Carousel and Slap Logic
const carousel = document.querySelector('[data-carousel]');
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
const prevBtn = document.querySelector('.carousel-btn.prev');
const nextBtn = document.querySelector('.carousel-btn.next');

const mainPhoto = document.getElementById('main-photo');
const slapBtn = document.getElementById('slap-btn');
const slapCountEl = document.getElementById('slap-count');

let slapMode = false;
let slapTotal = 0;

const achievementDefinitions = {
  'update': {
    title: 'A Whole New You',
    text: 'Update to the latest version of yourself.'
  },
  'open': {
    title: 'Let The Fun Begin',
    text: 'Open the birthday card.'
  },
  'slap-1': {
    title: 'A Quick Hit',
    text: 'Slap yourself one time.'
  },
  'slap-10': {
    title: 'No Pain, No Gain',
    text: 'Slap yourself ten times.'
  },
  'slap-100': {
    title: 'Masochism',
    text: 'Slap yourself one hundred times.'
  },
  'carousel-survivor': {
    title: 'The Hall of Shame',
    text: 'View each embarrassing photo in turn.'
  },
      'game-player': {
    title: 'A Walk In The Park',
    text: 'Play the mini-game and successfully achieved a score of 10.'
  },
  'existential-dread': {
    title: 'Contemplating Existence',
    text: 'Stare at the death counter for way too long.'
  },
      'fortune-cookie': {
    title: 'Freaky Friday Fortune',
    text: 'Find a fortune cookie and read its message.'
  },
  'end-of-line': {
    title: 'The Bitter End',
    text: 'Make it to the end of the card.'
  },
  'watch-world-burn': {
    title: 'Watch The World Burn',
    text: 'Let the timer run to zero and watch the apocalypse descend'
  },
    'menu-explorer': {
    title: 'Snooping Around',
    text: 'Open up the menu because you are nosy.'
  },
    'party-animal': {
    title: 'Party Rock Anthem - LMFAO',
    text: 'Activate party mode for 5 seconds.'
  },
  'vbucks-scammed': {
    title: 'Totally Legit Investment',
    text: 'Get scammed for free V-bucks.'
  },
  'professional-procrastinator': {
    title: 'Nothing Better To Do',
    text: 'Become addicted to this birthday card.'
  },
};

sessionStorage.removeItem('birthdayCardAchievements');
localStorage.removeItem('birthdayCardAchievements');
const triggeredAchievements = new Set();
const achievementContainer = document.createElement('div');

const achievementPanel = document.getElementById('achievement-panel');
const achievementList = document.getElementById('achievement-list');
const achievementTotal = document.getElementById('achievement-total');
const achievementClose = document.getElementById('achievement-close');

function renderAchievementPanel() {
  if (!achievementPanel || !achievementList || !achievementTotal) return;

  const definitions = Object.entries(achievementDefinitions);
  const earnedCount = definitions.filter(([achievementId]) => triggeredAchievements.has(achievementId)).length;

  achievementTotal.innerHTML = `
    <div class="achievement-total-ring" aria-label="${earnedCount} of ${definitions.length} achievements earned">
      <strong>${earnedCount}/${definitions.length}</strong>
      <span>earned</span>
    </div>
  `;

  achievementList.innerHTML = definitions.map(([achievementId, achievement]) => {
    const earned = triggeredAchievements.has(achievementId);
    return `
      <article class="achievement-entry ${earned ? 'earned' : 'locked'}">
        <div class="achievement-status" aria-hidden="true">${earned ? '✓' : '◆'}</div>
        <div class="achievement-copy">
          <h4>${achievement.title}</h4>
          ${earned ? `<p>${achievement.text}</p>` : ''}
        </div>
        <span class="achievement-state">${earned ? 'Unlocked' : 'Locked'}</span>
      </article>
    `;
  }).join('');
}

function openAchievementPanel() {
  if (!achievementPanel) return;
  renderAchievementPanel();
  achievementPanel.classList.remove('hidden');
  document.body.classList.add('achievement-modal-open');
  achievementClose?.focus();
}

function closeAchievementPanel() {
  if (!achievementPanel) return;
  achievementPanel.classList.add('hidden');
  document.body.classList.remove('achievement-modal-open');
}

achievementClose?.addEventListener('click', closeAchievementPanel);
achievementPanel?.addEventListener('click', (event) => {
  if (event.target === achievementPanel) closeAchievementPanel();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && achievementPanel && !achievementPanel.classList.contains('hidden')) {
    closeAchievementPanel();
  }
});
achievementContainer.className = 'achievement-toast-container';
document.body.appendChild(achievementContainer);

function updateSlapCounter() {
  if (slapCountEl) {
    slapCountEl.textContent = new Intl.NumberFormat('en-GB').format(slapTotal);
  }
}

function showAchievementToast(achievementId) {
  if (triggeredAchievements.has(achievementId)) return;

  const achievement = achievementDefinitions[achievementId];
  if (!achievement) return;

  triggeredAchievements.add(achievementId);

  const toast = document.createElement('div');
  toast.className = 'achievement-toast';
  toast.innerHTML = `
    <div class="achievement-badge">Achievement unlocked</div>
    <div class="achievement-title">${achievement.title}</div>
    <div class="achievement-text">${achievement.text}</div>
  `;

  achievementContainer.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('visible');
  });

  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 350);
  }, 4200);
}

function maybeTriggerSlapAchievements() {
  if (slapTotal === 1) {
    showAchievementToast('slap-1');
  } else if (slapTotal === 10) {
    showAchievementToast('slap-10');
  } else if (slapTotal === 100) {
    showAchievementToast('slap-100');
  }
}

function setSlapMode(enabled) {
  slapMode = enabled;

  if (slapBtn) {
    slapBtn.classList.toggle('active', enabled);
    slapBtn.textContent = enabled ? '🎯 Slap mode on' : '👋 Slap the photo';
  }

  if (mainPhoto) {
    mainPhoto.classList.toggle('slap-ready', enabled);
  }

  document.body.classList.toggle('slap-mode', enabled);
}

function triggerSlapBurst() {
  if (!mainPhoto) return;

  slapTotal += 1;
  updateSlapCounter();
  maybeTriggerSlapAchievements();

  mainPhoto.classList.remove('slapping');
  void mainPhoto.offsetWidth;
  mainPhoto.classList.add('slapping');

  confetti({
    particleCount: 70,
    spread: 90,
    startVelocity: 28,
    scalar: 1.1,
    origin: {
      x: Math.random(),
      y: Math.random() * 0.6 + 0.2
    },
    angle: Math.random() * 160 + 10,
    gravity: 0.9,
    ticks: 120,
    disableForReducedMotion: true
  });
}

if (carousel && slides.length > 0) {
  let currentIndex = 0;
  const carouselTrack = carousel.querySelector('.carousel-track');
  const carouselVisitedSlides = new Set([0]);
  const dotsContainer = document.querySelector('.carousel-dots');

  dotsContainer.innerHTML = '';
  slides.forEach((slide, index) => {
    const dot = document.createElement('button');
    dot.className = index === 0 ? 'dot active' : 'dot';
    dot.type = 'button';
    dot.dataset.index = String(index);
    dot.setAttribute('aria-label', `Go to photo ${index + 1}`);
    dot.addEventListener('click', () => showSlide(index));
    dotsContainer.appendChild(dot);
  });

  function fitActiveSlide() {
    if (!carouselTrack) return;

    const activeSlide = slides[currentIndex];
    const activeImage = activeSlide?.querySelector('img');
    if (!activeImage?.naturalWidth || !activeImage?.naturalHeight) return;

    const availableWidth = Math.min(carousel.clientWidth, 620);
    const maxHeight = window.innerWidth < 480 ? 420 : 520;
    const scale = Math.min(1, availableWidth / activeImage.naturalWidth, maxHeight / activeImage.naturalHeight);

    carouselTrack.style.width = `${Math.round(activeImage.naturalWidth * scale)}px`;
    carouselTrack.style.height = `${Math.round(activeImage.naturalHeight * scale)}px`;
  }

  function showSlide(index) {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentIndex);
    });

    dotsContainer.querySelectorAll('.dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });

    const activeImage = slides[currentIndex]?.querySelector('img');
    if (activeImage?.complete) {
      fitActiveSlide();
    } else {
      activeImage?.addEventListener('load', fitActiveSlide, { once: true });
    }

    carouselVisitedSlides.add(currentIndex);
    if (carouselVisitedSlides.size === slides.length) {
      showAchievementToast('carousel-survivor');
    }
  }

  prevBtn?.addEventListener('click', () => showSlide(currentIndex - 1));
  nextBtn?.addEventListener('click', () => showSlide(currentIndex + 1));

  showSlide(currentIndex);
  window.addEventListener('resize', fitActiveSlide);
}

mainPhoto?.addEventListener('click', () => {
  if (!slapMode) return;
  triggerSlapBurst();
});

slapBtn?.addEventListener('click', () => {
  setSlapMode(!slapMode);
});

updateSlapCounter();
window.showAchievementToast = showAchievementToast;

const selfDestructSection = document.getElementById('message-self-destruct');
const selfDestructBox = selfDestructSection?.querySelector('.self-destruct-box');
const selfDestructTime = document.getElementById('self-destruct-time');
const selfDestructStatus = document.getElementById('self-destruct-status');
const selfDestructWires = selfDestructSection?.querySelectorAll('.bomb-wire') || [];
const solderToggle = document.getElementById('solder-toggle');

let selfDestructSeconds = 10;
let selfDestructInterval = null;
let selfDestructCut = false;
let solderMode = false;

function renderSelfDestructTime() {
  if (selfDestructTime) {
    selfDestructTime.textContent = `00:${String(selfDestructSeconds).padStart(2, '0')}`;
  }
}

function stopSelfDestructTimer() {
  if (selfDestructInterval) {
    clearInterval(selfDestructInterval);
    selfDestructInterval = null;
  }
}

function resetSelfDestructTimer() {
  stopSelfDestructTimer();
  selfDestructSeconds = 10;
  selfDestructCut = false;
  renderSelfDestructTime();
  selfDestructWires.forEach((wire) => {
    wire.classList.remove('cut');
    wire.removeAttribute('disabled');
  });
  solderMode = false;
  solderToggle?.classList.remove('active');
  solderToggle?.setAttribute('aria-pressed', 'false');
  selfDestructBox?.classList.remove('timer-cut', 'timer-ended', 'timer-running');
  if (selfDestructStatus) selfDestructStatus.textContent = 'Waiting for message';
}

function startCountdown() {
  if (selfDestructCut || selfDestructInterval || selfDestructSeconds <= 0) return;
  selfDestructInterval = setInterval(() => {
    if (selfDestructCut) {
      stopSelfDestructTimer();
      return;
    }

    selfDestructSeconds -= 1;
    renderSelfDestructTime();

    if (selfDestructSeconds <= 0) {
      stopSelfDestructTimer();
      selfDestructBox?.classList.remove('timer-running');
      selfDestructBox?.classList.add('timer-ended');
      selfDestructWires.forEach((wire) => wire.setAttribute('disabled', 'true'));
      showAchievementToast('watch-world-burn');
      triggerWorldExplosion();
    }
  }, 1000);
}

function startSelfDestructTimer() {
  if (selfDestructCut || selfDestructInterval) return;
  resetSelfDestructTimer();
  selfDestructBox?.classList.add('timer-running');
  if (selfDestructStatus) selfDestructStatus.textContent = 'Detonation in progress';
  startCountdown();
}

selfDestructWires.forEach((wire) => {
  wire.addEventListener('click', () => {
    if (selfDestructSeconds <= 0) return;

    if (solderMode && wire.classList.contains('cut')) {
      wire.classList.remove('cut');
      solderMode = false;
      selfDestructCut = false;
      solderToggle?.classList.remove('active');
      solderToggle?.setAttribute('aria-pressed', 'false');
      selfDestructWires.forEach((otherWire) => otherWire.removeAttribute('disabled'));
      selfDestructBox?.classList.remove('timer-cut');
      selfDestructBox?.classList.add('timer-running');
      if (selfDestructStatus) selfDestructStatus.textContent = `Wire resoldered - countdown resumed at 00:${String(selfDestructSeconds).padStart(2, '0')}`;
      startCountdown();
      return;
    }

    if (solderMode) return;
    if (selfDestructCut) return;
    selfDestructCut = true;
    stopSelfDestructTimer();
    wire.classList.add('cut');
    selfDestructWires.forEach((otherWire) => otherWire.setAttribute('disabled', 'true'));
    selfDestructBox?.classList.remove('timer-running');
    selfDestructBox?.classList.add('timer-cut');
    if (selfDestructStatus) {
      const wireName = wire.classList.contains('bomb-wire-red') ? 'Red' : 'Blue';
      selfDestructStatus.textContent = `${wireName} wire cut - timer stopped at 00:${String(selfDestructSeconds).padStart(2, '0')}`;
    }
  });
});

solderToggle?.addEventListener('click', () => {
  solderMode = !solderMode;
  solderToggle.classList.toggle('active', solderMode);
  solderToggle.setAttribute('aria-pressed', String(solderMode));

  selfDestructWires.forEach((wire) => {
    if (wire.classList.contains('cut') && solderMode) {
      wire.removeAttribute('disabled');
    } else if (wire.classList.contains('cut')) {
      wire.setAttribute('disabled', 'true');
    }
  });
});

const worldEndScreen = document.getElementById('world-end-screen');
const worldEndActions = document.getElementById('world-end-actions');
const timeTravelButton = document.getElementById('time-travel-button');
const endItAllButton = document.getElementById('end-it-all-button');

function triggerWorldExplosion() {
  document.documentElement.classList.add('screen-shaking');
  document.body.classList.add('screen-shaking');

  setTimeout(() => {
    document.documentElement.classList.remove('screen-shaking');
    document.body.classList.remove('screen-shaking');
    worldEndScreen?.classList.remove('hidden');
    worldEndScreen?.classList.add('fade-in');
    worldEndActions?.classList.remove('hidden');
    document.body.classList.add('world-end-modal-open');
  }, 900);
}

timeTravelButton?.addEventListener('click', () => {
  worldEndScreen?.classList.add('hidden');
  document.body.classList.remove('world-end-modal-open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

endItAllButton?.addEventListener('click', () => {
  worldEndActions?.classList.add('hidden');
});

if (selfDestructSection && 'IntersectionObserver' in window) {
  const timerObserver = new IntersectionObserver((entries) => {
    if (entries[0]?.isIntersecting) {
      startSelfDestructTimer();
    } else {
      stopSelfDestructTimer();
      resetSelfDestructTimer();
    }
  }, { threshold: 0.35 });
  timerObserver.observe(selfDestructSection);
}

window.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menu-toggle');
  const menuPanel = document.getElementById('menu-panel');
  const fortuneCookie = document.getElementById('fortune-cookie');
  const fortuneBox = fortuneCookie?.closest('.fortune-box');
  const fortuneSlip = document.getElementById('fortune-slip');
  const newFortuneButton = document.getElementById('new-fortune-cookie');
  const fortunes = [
    'You will soon face a difficult decision involving two different streaming services and watch neither of them.',
    'A glorious nap is in your immediate future, provided you ignore all adult responsibilities.',
    'Your next major financial investment will be an iced coffee you didn\'t really need.',
    'Expect a sudden burst of motivation to clean your room, which will vanish the moment you sit down.',
    'A text message containing only a single emoji will change your evening plans.',
    'You will spend twenty minutes looking for the phone that is currently in your hand.',
    'Patience is a virtue, especially when waiting for the microwave beep before the timer hits zero.',
    'An old sock lost in the laundry dryer will return when you least expect it.',
    'Great wisdom will come to you while standing blankly in front of an open refrigerator.',
    'You will soon triumph over a stubborn jar lid that everyone else failed to open.',
    'Adventure awaits in the kitchen, where you will successfully burn water.',
    'Your capacity for procrastination will reach a magnificent new personal record today.',
    'A mysterious itch will appear on your back precisely out of reach.',
    'You will make a brilliant plan for tomorrow that you will completely ignore by noon.',
    'Good fortune favors those who find the remote control hidden between the couch cushions.'
  ];
  let fortuneStage = 0;
  let remainingFortunes = [];

  function getRandomIndex(maxExclusive) {
    if (typeof crypto === 'undefined' || typeof crypto.getRandomValues !== 'function') {
      return Math.floor(Math.random() * maxExclusive);
    }

    const randomBuffer = new Uint32Array(1);
    const randomLimit = Math.floor(0x100000000 / maxExclusive) * maxExclusive;
    let randomValue;

    do {
      crypto.getRandomValues(randomBuffer);
      randomValue = randomBuffer[0];
    } while (randomValue >= randomLimit);

    return randomValue % maxExclusive;
  }

  function selectRandomFortune() {
    if (remainingFortunes.length === 0) {
      remainingFortunes = [...fortunes];

      for (let i = remainingFortunes.length - 1; i > 0; i -= 1) {
        const randomIndex = getRandomIndex(i + 1);
        [remainingFortunes[i], remainingFortunes[randomIndex]] =
          [remainingFortunes[randomIndex], remainingFortunes[i]];
      }
    }

    return remainingFortunes.pop();
  }

  function interactWithFortune() {
    if (fortuneStage === 0) {
      fortuneStage = 1;
      fortuneCookie?.classList.remove('fortune-wrapped');
      fortuneCookie?.classList.add('fortune-unwrapped');
      fortuneCookie?.setAttribute('aria-label', 'Click to break the assembled fortune cookie');
      return;
    }

    if (fortuneStage === 1) {
      fortuneStage = 2;
      const randomFortune = selectRandomFortune();
      fortuneCookie?.classList.remove('fortune-unwrapped');
      fortuneCookie?.classList.add('fortune-open');
      fortuneBox?.classList.add('fortune-open');
      fortuneCookie?.setAttribute('aria-label', 'Broken fortune cookie');
      if (fortuneSlip) fortuneSlip.textContent = randomFortune;
      showAchievementToast('fortune-cookie');
      fortuneCookie?.removeAttribute('tabindex');
      fortuneCookie?.setAttribute('aria-disabled', 'true');
      if (newFortuneButton) newFortuneButton.hidden = false;
    }
  }

  function resetFortuneCookie() {
    fortuneStage = 0;
    fortuneCookie?.classList.remove('fortune-unwrapped', 'fortune-open');
    fortuneCookie?.classList.add('fortune-wrapped');
    fortuneBox?.classList.remove('fortune-open');
    if (fortuneSlip) fortuneSlip.textContent = '';
    fortuneCookie?.setAttribute('aria-label', 'Click to break the red wrapper');
    fortuneCookie?.setAttribute('tabindex', '0');
    fortuneCookie?.removeAttribute('aria-disabled');
    if (newFortuneButton) newFortuneButton.hidden = true;
  }

  fortuneCookie?.addEventListener('click', interactWithFortune);
  fortuneCookie?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      interactWithFortune();
    }
  });
  newFortuneButton?.addEventListener('click', resetFortuneCookie);

  const updatePopup = document.getElementById('update-popup');
  const updateDownloadButton = document.getElementById('update-download-btn');
  const updateProgress = updatePopup?.querySelector('.update-progress');
  const updateProgressFill = document.getElementById('update-progress-fill');
  const updateProgressTrack = updatePopup?.querySelector('.update-progress-track');
  const updatePercent = document.getElementById('update-percent');
  const updateStatus = document.getElementById('update-status');

  document.body.classList.add('update-modal-open');

  updateDownloadButton?.addEventListener('click', () => {
    if (!updatePopup || updateDownloadButton.disabled) return;

    updateDownloadButton.disabled = true;
    updateDownloadButton.textContent = 'Downloading...';
    updateProgress?.classList.remove('hidden');

    let progress = 0;
    const stages = [
      'Preparing download...',
      'Resetting past year...',
      'Increasing age...',
      'Setting future...',
      'Finishing update...'
    ];

    const downloadTimer = window.setInterval(() => {
      progress = Math.min(100, progress + Math.floor(Math.random() * 7) + 3);
      if (updateProgressFill) updateProgressFill.style.width = `${progress}%`;
      if (updatePercent) updatePercent.textContent = `${progress}%`;
      updateProgressTrack?.setAttribute('aria-valuenow', String(progress));

      const stageIndex = Math.min(stages.length - 1, Math.floor(progress / 21));
      if (updateStatus) updateStatus.textContent = stages[stageIndex];

      if (progress >= 100) {
        window.clearInterval(downloadTimer);
        updateDownloadButton.textContent = 'Installed';
        if (updateStatus) updateStatus.textContent = 'Update complete';
        showAchievementToast('update');

        window.setTimeout(() => {
          vbucksAdUnlockedAt = Date.now() + 20_000;
          updatePopup.classList.add('hidden');
          document.body.classList.remove('update-modal-open');
          showAchievementToast('open');
          if (typeof window.startAdTimer === 'function') {
            window.startAdTimer();
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 450);
      }
    }, 120);
  });

  menuToggle?.addEventListener('click', () => {
    if (!menuPanel) return;
    const willOpen = menuPanel.classList.contains('hidden');
    menuPanel.classList.toggle('hidden', !willOpen);
    menuToggle.setAttribute('aria-expanded', String(willOpen));
    if (willOpen) {
      showAchievementToast('menu-explorer');
    }
  });

  document.querySelectorAll('[data-action="achievements"]').forEach((button) => {
    button.addEventListener('click', () => {
      menuPanel?.classList.add('hidden');
      menuToggle?.setAttribute('aria-expanded', 'false');
      openAchievementPanel();
    });
  });

  const partyToggle = document.querySelector('[data-action="party"]');
  let partyTimer = null;
  partyToggle?.addEventListener('click', () => {
    const enabled = partyToggle.getAttribute('aria-pressed') !== 'true';
    partyToggle.setAttribute('aria-pressed', String(enabled));
    document.body.classList.toggle('party-mode', enabled);

    if (partyTimer) {
      clearTimeout(partyTimer);
      partyTimer = null;
    }

    if (enabled) {
      partyTimer = setTimeout(() => {
        if (partyToggle.getAttribute('aria-pressed') === 'true') {
          showAchievementToast('party-animal');
        }
        partyTimer = null;
      }, 5000);
    }
  });

  setTimeout(() => showAchievementToast('professional-procrastinator'), 60 * 1000);

  const endMarker = document.querySelector('footer');
  if (endMarker && 'IntersectionObserver' in window) {
    const endObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        showAchievementToast('end-of-line');
        endObserver.disconnect();
      }
    }, { threshold: 0.5 });
    endObserver.observe(endMarker);
  }

  const countdownPanels = document.querySelectorAll('.timeline-panel');
  const deathCounter = countdownPanels[1];
  if (deathCounter && 'IntersectionObserver' in window) {
    let countdownTimer = null;
    const countdownObserver = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        countdownTimer = setTimeout(() => {
          showAchievementToast('existential-dread');
          countdownTimer = null;
        }, 10_000);
      } else if (countdownTimer) {
        clearTimeout(countdownTimer);
        countdownTimer = null;
      }
    }, { threshold: 0.35 });
    countdownObserver.observe(deathCounter);
  }
});

// 5. Countdown Timer
const startDate = new Date('2005-11-07T00:00:00');
const targetDate = new Date('2085-11-07T00:00:00');
const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = MS_PER_SECOND * 60;
const MS_PER_HOUR = MS_PER_MINUTE * 60;
const MS_PER_DAY = MS_PER_HOUR * 24;
const MS_PER_YEAR = MS_PER_DAY * 365.2425;
const MS_PER_MONTH = MS_PER_YEAR / 12;

function getElapsedTotals(now) {
  const diffMs = Math.max(0, now.getTime() - startDate.getTime());

  return {
    years: Math.floor(diffMs / MS_PER_YEAR),
    months: Math.floor(diffMs / MS_PER_MONTH),
    days: Math.floor(diffMs / MS_PER_DAY),
    hours: Math.floor(diffMs / MS_PER_HOUR),
    minutes: Math.floor(diffMs / MS_PER_MINUTE),
    seconds: Math.floor(diffMs / MS_PER_SECOND)
  };
}

function getRemainingTotals(now) {
  const diffMs = Math.max(0, targetDate.getTime() - now.getTime());

  return {
    years: Math.floor(diffMs / MS_PER_YEAR),
    months: Math.floor(diffMs / MS_PER_MONTH),
    days: Math.floor(diffMs / MS_PER_DAY),
    hours: Math.floor(diffMs / MS_PER_HOUR),
    minutes: Math.floor(diffMs / MS_PER_MINUTE),
    seconds: Math.floor(diffMs / MS_PER_SECOND)
  };
}

function updateCountdown() {
  const now = new Date();
  const elapsed = getElapsedTotals(now);
  const remaining = getRemainingTotals(now);

  const elapsedEls = {
    years: document.getElementById('elapsed-years'),
    months: document.getElementById('elapsed-months'),
    days: document.getElementById('elapsed-days'),
    hours: document.getElementById('elapsed-hours'),
    minutes: document.getElementById('elapsed-minutes'),
    seconds: document.getElementById('elapsed-seconds')
  };

  const remainingEls = {
    years: document.getElementById('remaining-years'),
    months: document.getElementById('remaining-months'),
    days: document.getElementById('remaining-days'),
    hours: document.getElementById('remaining-hours'),
    minutes: document.getElementById('remaining-minutes'),
    seconds: document.getElementById('remaining-seconds')
  };

  const formatNumber = (value) => new Intl.NumberFormat('en-GB').format(value);

  Object.entries(elapsed).forEach(([key, value]) => {
    if (elapsedEls[key]) elapsedEls[key].textContent = formatNumber(value);
  });

  Object.entries(remaining).forEach(([key, value]) => {
    if (remainingEls[key]) remainingEls[key].textContent = formatNumber(value);
  });

}

updateCountdown();
setInterval(updateCountdown, 1000);

// 6. Fullscreen Ad Overlay
const adOverlay = document.createElement('div');
adOverlay.className = 'vbucks-ad-overlay hidden';
adOverlay.innerHTML = `
  <div class="vbucks-ad">
    <button class="vbucks-close" aria-label="Close ad">×</button>
    <div class="vbucks-header">LIMITED OFFER</div>
    <div class="vbucks-title">FREE V-BUCKS</div>
    <img class="vbucks-image" src="${VBUCK_IMAGE_PATH}" alt="Free bonus image" />
    <div class="vbucks-subtitle">Claim your bonus reward now</div>
    <div class="scam-warning">Definitely not a scam. Pls Click.</div>
    <div class="vbucks-box">8,000 V-Bucks</div>
    <button class="vbucks-button" type="button">Claim now</button>
  </div>
`;
document.body.appendChild(adOverlay);

function createChaosTokens() {
  chaosScene.innerHTML = '';

  const floatImages = [
    { src: VBUCK_IMAGE_PATH, className: 'chaos-vbucks-logo', alt: 'V-Bucks logo' },
    { src: BLUEVBUCK_IMAGE_PATH, className: 'chaos-blue-card', alt: 'Blue V-Bucks card' },
    { src: GOLDVBUCK_IMAGE_PATH, className: 'chaos-gold-card', alt: 'Gold V-Bucks card' },
    { src: PURPLEVBUCK_IMAGE_PATH, className: 'chaos-purple-card', alt: 'Purple V-Bucks card' }
  ];

  floatImages.forEach((imageDef) => {
    const img = document.createElement('img');
    img.src = imageDef.src;
    img.alt = imageDef.alt;
    img.className = `chaos-image ${imageDef.className}`;
    const imageIndex = floatImages.indexOf(imageDef);
    const xPositions = window.innerWidth < 480 ? [24, 76, 24, 76] : [20, 40, 60, 80];
    const yPositions = window.innerWidth < 480 ? [28, 28, 72, 72] : [30, 70, 30, 70];
    const xJitter = window.innerWidth < 480 ? 10 : 7;
    const yJitter = 12;
    img.style.setProperty('--x', `${xPositions[imageIndex] + (Math.random() * xJitter * 2 - xJitter)}%`);
    img.style.setProperty('--y', `${yPositions[imageIndex] + (Math.random() * yJitter * 2 - yJitter)}%`);
    img.style.setProperty('--size', `${window.innerWidth < 480 ? 72 + Math.random() * 28 : 90 + Math.random() * 56}px`);
    img.style.setProperty('--spin', `${(Math.random() * 760 - 380).toFixed(0)}deg`);
    img.style.setProperty('--drift-x', `${(-90 + Math.random() * 180).toFixed(0)}px`);
    img.style.setProperty('--drift-y', `${(-100 + Math.random() * 200).toFixed(0)}px`);
    img.style.setProperty('--duration', `${(0.8 + Math.random() * 1.6).toFixed(2)}s`);
    chaosScene.appendChild(img);
  });

  const tokenCount = window.innerWidth < 480 ? 54 : 42;

  for (let i = 0; i < tokenCount; i += 1) {
    const token = document.createElement('div');
    token.className = 'vbucks-token';
    const labels = ['V-BUCKS', 'FREE BUCKS', 'V-BUCKS!', 'CLAIM!', 'BUCKS!', 'SCAM!'];
    token.textContent = labels[Math.floor(Math.random() * labels.length)];
    token.style.setProperty('--x', `${12 + Math.random() * 76}%`);
    token.style.setProperty('--y', `${12 + Math.random() * 76}%`);
    const baseSize = window.innerWidth < 480 ? 28 : 26;
    token.style.setProperty('--size', `${baseSize + Math.random() * (window.innerWidth < 480 ? 46 : 54)}px`);
    token.style.setProperty('--delay', `${(Math.random() * 1.5).toFixed(2)}s`);
    token.style.setProperty('--spin', `${(Math.random() * 760 - 380).toFixed(0)}deg`);
    token.style.setProperty('--drift-x', `${(-70 + Math.random() * 140).toFixed(0)}px`);
    token.style.setProperty('--drift-y', `${(-80 + Math.random() * 160).toFixed(0)}px`);
    token.style.setProperty('--duration', `${(0.5 + Math.random() * 1).toFixed(2)}s`);
    chaosScene.appendChild(token);
  }
}

const chaosScene = document.createElement('div');
chaosScene.className = 'vbucks-chaos hidden';
document.body.appendChild(chaosScene);

createChaosTokens();

window.__birthdayGame = Object.assign(window.__birthdayGame || {}, {
  started: false,
  playing: false,
  paused: true,
  gameOver: false,
});

let adTimerHandle = null;
let vbucksAdUnlockedAt = Infinity;

function clearAdTimer() {
  if (adTimerHandle) {
    clearTimeout(adTimerHandle);
    adTimerHandle = null;
  }
}

function pauseAdTimer() {
  clearAdTimer();
  if (window.__birthdayGame) {
    window.__birthdayGame.paused = true;
  }
}

function startAdTimer() {
  clearAdTimer();

  const gameState = window.__birthdayGame || {};
  if (!Number.isFinite(vbucksAdUnlockedAt)) {
    gameState.paused = true;
    return;
  }
  if (gameState.playing) {
    gameState.paused = true;
    return;
  }

  gameState.paused = false;

  const remainingCooldown = Math.max(0, vbucksAdUnlockedAt - Date.now());
  const delay = remainingCooldown > 0
    ? remainingCooldown
    : 20_000 + Math.floor(Math.random() * 20_001);

  adTimerHandle = setTimeout(() => {
    const latestState = window.__birthdayGame || {};
    if (latestState && !latestState.playing) {
      showAdPopup();
    }
    if (!adOverlay.classList.contains('hidden')) {
      gameState.paused = true;
    } else {
      startAdTimer();
    }
  }, delay);
}

function showAdPopup() {
  const gameState = window.__birthdayGame || {};
  if (gameState.playing || Date.now() < vbucksAdUnlockedAt) {
    return false;
  }

  adOverlay.classList.remove('hidden');
  document.body.classList.add('vbucks-ad-modal-open');
  return true;
}

function hideAdPopup() {
  adOverlay.classList.add('hidden');
  document.body.classList.remove('vbucks-ad-modal-open');
}

function startVbucksChaos() {
  showAchievementToast('vbucks-scammed');
  hideAdPopup();
  chaosScene.classList.remove('hidden');
  document.body.classList.add('vbucks-chaos-active');
  createChaosTokens();

  setTimeout(() => {
    chaosScene.classList.add('hidden');
    document.body.classList.remove('vbucks-chaos-active');
    createChaosTokens();
    startAdTimer();
  }, 5000);
}

const gameCanvas = document.getElementById('gameCanvas');

document.addEventListener('pointerdown', (event) => {
  const targetIsGameCanvas = !!gameCanvas && (event.target === gameCanvas || gameCanvas.contains(event.target));

  if (!targetIsGameCanvas && window.__birthdayGame && window.__birthdayGame.started && !window.__birthdayGame.gameOver) {
    window.__birthdayGame.playing = false;
    pauseAdTimer();
  }
});

adOverlay.querySelector('.vbucks-close')?.addEventListener('click', () => {
  hideAdPopup();
  startAdTimer();
});
adOverlay.querySelector('.vbucks-button')?.addEventListener('click', startVbucksChaos);
window.startAdTimer = startAdTimer;
window.pauseAdTimer = pauseAdTimer;