// =============================================================================
// app.js — State, events, swipe, localStorage, init
// Global state object: S
// Load order: config > data > engine > ui > timer > stats > app
// =============================================================================

'use strict';

// =============================================================================
// STATE
// =============================================================================
const S = {
  // Navigation
  mode:         'HOME',    // 'HOME' | 'CAVE' | 'HANG'
  circuitIndex: 0,         // current circuit within mode (0-based)
  energy:       'NORMAL',  // 'FRESH' | 'NORMAL' | 'TIRED'
  screen:       'home',    // 'home' | 'workout' | 'rest' | 'complete' | 'stats'

  // Workout session
  circuit:          null,  // current circuit object
  exerciseList:     null,  // scaled + filtered exercise list
  stepIndex:        0,     // index into exerciseList
  round:            1,     // current round (1-based)
  sessionStartTime: null,  // Date.now() on start
  restTarget:       null,  // next step after rest finishes

  // Progress / XP (persisted)
  progress:           {},  // { muscle: { xp, lastTrained, history[] } }
  sessionLog:         [],  // array of session records
  pendingDecayEvents: [],  // decay events for banner

  // Stats UI state
  statsSort:          'recent',
  statsTimeFilter:    '7days',
  activeChartMuscles: ['overall'],
  highlightMuscle:    null,

  // Misc
  humorLine:         '',
  currentExercise:   null,
  swapActive:        false,   // user swapped to base variation
  formGuideOpen:     false,   // form guide expanded state
  sessionLevelUps:   [],      // level-ups this session
  swipeInProgress:   false,   // guard tap vs swipe
  exerciseTimerActive: false  // running timed exercise countdown
};

// =============================================================================
// STORAGE
// =============================================================================
function saveProgress() {
  try {
    localStorage.setItem(CONFIG.storage.progress,   JSON.stringify(S.progress));
    localStorage.setItem(CONFIG.storage.sessionLog, JSON.stringify(S.sessionLog));
  } catch(e) {
    console.warn('7Bit: localStorage write failed', e);
  }
}

function loadProgress() {
  try {
    const p  = localStorage.getItem(CONFIG.storage.progress);
    const sl = localStorage.getItem(CONFIG.storage.sessionLog);
    if (p)  S.progress   = JSON.parse(p);
    if (sl) S.sessionLog = JSON.parse(sl);
  } catch(e) {
    console.warn('7Bit: localStorage read failed', e);
    S.progress   = {};
    S.sessionLog = [];
  }
}

// =============================================================================
// DATA HELPER
// =============================================================================
function getModeData(mode) {
  switch (mode) {
    case 'HOME': return typeof DATA_HOME !== 'undefined' ? DATA_HOME : [];
    case 'CAVE': return typeof DATA_CAVE !== 'undefined' ? DATA_CAVE : [];
    case 'HANG': return typeof DATA_HANG !== 'undefined' ? DATA_HANG : [];
    default:     return [];
  }
}

// =============================================================================
// INIT
// =============================================================================
function init() {
  loadProgress();

  // Random humor line
  const lines = CONFIG.humorLines;
  S.humorLine = lines[Math.floor(Math.random() * lines.length)];

  // Decay check on app open
  const { progress: newP, decayEvents } = Engine.checkDecay(S.progress);
  if (decayEvents.length > 0) {
    S.progress          = newP;
    S.pendingDecayEvents = decayEvents;
    saveProgress();
  }

  _bindHomeEvents();
  _bindWorkoutEvents();
  _bindRestEvents();
  _bindCompleteEvents();
  _bindStatsEvents();
  _bindSwipeEvents();

  // Initial render
  UI.renderHome(S);

  // Init audio on first touch (required by browsers)
  const initAudioOnce = () => { Timer.initAudio(); };
  document.addEventListener('touchstart', initAudioOnce, { once: true });
  document.addEventListener('click',      initAudioOnce, { once: true });

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.warn('7Bit: SW registration failed', err);
    });
  }
}

// =============================================================================
// HOME EVENTS
// =============================================================================
function _bindHomeEvents() {

  // Mode tabs
  document.querySelectorAll('.mode-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      S.mode         = tab.dataset.mode;
      S.circuitIndex = 0;
      UI.renderHome(S);
    });
  });

  // Energy tabs
  document.querySelectorAll('.energy-tab').forEach(tab => {
    tab.addEventListener('click', e => {
      e.stopPropagation(); // prevent card tap
      S.energy = tab.dataset.energy;
      UI.renderHome(S);
    });
  });

  // Card tap → start workout (guarded against swipe)
  const card = document.getElementById('circuit-card');
  if (card) {
    card.addEventListener('click', () => {
      if (!S.swipeInProgress) _startWorkout();
    });
    // Keyboard activation
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        _startWorkout();
      }
    });
  }

  // STATS button
  const statsBtn = document.getElementById('btn-stats');
  if (statsBtn) {
    statsBtn.addEventListener('click', () => UI.renderStats(S));
  }

  // Settings button
  const settingsBtn = document.getElementById('btn-settings');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', _showSettings);
  }

  // Derank banner dismiss
  const bannerDismiss = document.getElementById('derank-dismiss');
  if (bannerDismiss) {
    bannerDismiss.addEventListener('click', () => {
      S.pendingDecayEvents = [];
      UI.renderDerankBanner([]);
    });
  }
}

// =============================================================================
// SWIPE ON CARD
// =============================================================================
function _bindSwipeEvents() {
  const card = document.getElementById('circuit-card');
  if (!card) return;

  let startX = 0;
  let startY = 0;
  let moved  = false;

  // Touch
  card.addEventListener('touchstart', e => {
    startX            = e.touches[0].clientX;
    startY            = e.touches[0].clientY;
    moved             = false;
    S.swipeInProgress = false;
  }, { passive: true });

  card.addEventListener('touchmove', e => {
    const dx = Math.abs(e.touches[0].clientX - startX);
    const dy = Math.abs(e.touches[0].clientY - startY);
    if (dx > 8 || dy > 8) moved = true;
  }, { passive: true });

  card.addEventListener('touchend', e => {
    if (!moved) return;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;

    // Only horizontal swipes
    if (Math.abs(dx) < CONFIG.ui.swipeThreshold) return;
    if (Math.abs(dy) > Math.abs(dx) * 0.7)       return;

    S.swipeInProgress = true;
    _changeCircuit(dx < 0 ? 1 : -1);
    setTimeout(() => { S.swipeInProgress = false; }, 50);
  }, { passive: true });

  // Mouse drag (desktop)
  let mouseStartX  = 0;
  let isDragging   = false;
  let mouseMoved   = false;

  card.addEventListener('mousedown', e => {
    mouseStartX = e.clientX;
    isDragging  = true;
    mouseMoved  = false;
  });

  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    if (Math.abs(e.clientX - mouseStartX) > 8) mouseMoved = true;
  });

  document.addEventListener('mouseup', e => {
    if (!isDragging) return;
    isDragging = false;
    if (!mouseMoved) return;

    const dx = e.clientX - mouseStartX;
    if (Math.abs(dx) < CONFIG.ui.swipeThreshold) return;

    S.swipeInProgress = true;
    _changeCircuit(dx < 0 ? 1 : -1);
    setTimeout(() => { S.swipeInProgress = false; }, 50);
  });
}

function _changeCircuit(direction) {
  const modeData = getModeData(S.mode);
  if (!modeData || modeData.length <= 1) return;

  S.circuitIndex = Math.max(0, Math.min(modeData.length - 1, S.circuitIndex + direction));

  // Animate card
  const card = document.getElementById('circuit-card');
  if (card) {
    card.classList.add('card-swipe-anim');
    setTimeout(() => card.classList.remove('card-swipe-anim'), CONFIG.ui.cardAnimDuration);
  }

  UI.renderHome(S);
}

// =============================================================================
// START WORKOUT
// =============================================================================
function _startWorkout() {
  const modeData = getModeData(S.mode);
  if (!modeData || modeData.length === 0) return;

  S.circuit     = modeData[S.circuitIndex] || modeData[0];
  S.exerciseList = Engine.buildList(S.circuit, S.energy, S.progress);

  if (!S.exerciseList || S.exerciseList.length === 0) {
    console.warn('7Bit: buildList returned empty — check data');
    return;
  }

  S.stepIndex       = 0;
  S.round           = 1;
  S.sessionStartTime = Date.now();
  S.sessionLevelUps  = [];
  S.swapActive      = false;
  S.formGuideOpen   = false;

  _goToStep(0);
}

// =============================================================================
// WORKOUT STEP NAVIGATION
// =============================================================================
function _goToStep(index) {
  if (!S.exerciseList) return;

  const maxRounds = (S.exerciseList[0] ? S.exerciseList[0].rounds : 1);

  if (index >= S.exerciseList.length) {
    // End of exercises for this round
    if (S.round < maxRounds) {
      S.round++;
      S.stepIndex = 0;
      // Rest between rounds (use last exercise rest)
      _showRestThen(() => _goToStep(0));
    } else {
      _completeSession();
    }
    return;
  }

  S.stepIndex      = index;
  S.currentExercise = S.exerciseList[index];
  S.swapActive     = false;
  S.formGuideOpen  = false;
  UI.renderWorkout(S);

  // If it's a timed exercise, auto-start a countdown in the reps display
  if (S.currentExercise.unit === 'sec') {
    _startExerciseTimer(S.currentExercise.scaledReps);
  }
}

// -------------------------------------------------------------------------
// Exercise timer (for timed holds/hangs) — runs in the workout screen
// Shows countdown in the reps area, auto-advances to rest when done
// -------------------------------------------------------------------------
let _exerciseTimerInterval = null;

function _startExerciseTimer(seconds) {
  _clearExerciseTimer();
  S.exerciseTimerActive = true;

  let remaining = seconds;
  const repsEl  = document.getElementById('workout-reps');

  _exerciseTimerInterval = setInterval(() => {
    remaining--;
    if (repsEl) repsEl.textContent = `${remaining}s`;

    if (remaining <= 0) {
      _clearExerciseTimer();
      // Auto-mark as done
      _exerciseDone();
    }
  }, 1000);
}

function _clearExerciseTimer() {
  if (_exerciseTimerInterval) {
    clearInterval(_exerciseTimerInterval);
    _exerciseTimerInterval = null;
  }
  S.exerciseTimerActive = false;
}

// =============================================================================
// WORKOUT EVENTS
// =============================================================================
function _bindWorkoutEvents() {

  // DONE
  const doneBtn = document.getElementById('btn-done');
  if (doneBtn) {
    doneBtn.addEventListener('click', () => {
      _clearExerciseTimer();
      _exerciseDone();
    });
  }

  // SKIP
  const skipBtn = document.getElementById('btn-skip');
  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      _clearExerciseTimer();
      S.progress = Engine.applyXP(S.progress, S.currentExercise, 'skip');
      _goToStep(S.stepIndex + 1);
    });
  }

  // EXIT
  const exitBtn = document.getElementById('btn-exit');
  if (exitBtn) {
    exitBtn.addEventListener('click', () => {
      _clearExerciseTimer();
      Timer.stop();
      const remaining = S.exerciseList ? S.exerciseList.slice(S.stepIndex) : [];
      S.progress = Engine.applyQuitPenalty(S.progress, remaining);
      saveProgress();
      UI.renderHome(S);
    });
  }

  // VARIATION SWAP
  const swapBtn = document.getElementById('btn-swap-variation');
  if (swapBtn) {
    swapBtn.addEventListener('click', () => {
      if (!S.currentExercise) return;
      S.swapActive = !S.swapActive;

      if (S.swapActive) {
        S.currentExercise.displayName = S.currentExercise.variations[0].name;
        swapBtn.textContent = 'REVERT';
      } else {
        const v = Engine.getBestVariation(S.currentExercise, S.progress);
        S.currentExercise.displayName = v ? v.name : S.currentExercise.name;
        swapBtn.textContent = 'SWAP';
      }

      document.getElementById('workout-ex-name').textContent = S.currentExercise.displayName;
    });
  }

  // FORM GUIDE TOGGLE
  const formToggleArea = document.getElementById('form-guide-toggle');
  if (formToggleArea) {
    formToggleArea.addEventListener('click', _toggleFormGuide);
    formToggleArea.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); _toggleFormGuide(); }
    });
  }
}

function _exerciseDone() {
  const prevLevels = {};
  (S.currentExercise.muscles || []).forEach(m => {
    prevLevels[m] = Engine.getLevelNum((S.progress[m] || {}).xp || 0);
  });

  S.progress = Engine.applyXP(S.progress, S.currentExercise, 'done');
  _checkLevelUps(S.currentExercise.muscles, prevLevels);

  const nextIndex   = S.stepIndex + 1;
  const maxRounds   = S.exerciseList[0] ? S.exerciseList[0].rounds : 1;
  const isLastEx    = nextIndex >= S.exerciseList.length;
  const isLastRound = S.round >= maxRounds;

  if (isLastEx && isLastRound) {
    _completeSession();
  } else {
    _showRestThen(() => _goToStep(nextIndex));
  }
}

function _toggleFormGuide() {
  S.formGuideOpen = !S.formGuideOpen;
  const content   = document.getElementById('form-guide-content');
  const btn       = document.getElementById('btn-form-toggle');
  if (content) content.hidden = !S.formGuideOpen;
  if (btn)     btn.textContent = S.formGuideOpen ? 'FORM -' : 'FORM +';
}

// =============================================================================
// REST TIMER
// =============================================================================
function _showRestThen(callback) {
  const rest = S.currentExercise ? S.currentExercise.scaledRest : 60;
  S.restTarget = callback;
  UI.renderRestTimer(rest);

  Timer.start(rest,
    remaining => UI.updateRestTimer(remaining),
    () => { if (S.restTarget) S.restTarget(); }
  );
}

function _bindRestEvents() {
  const skipBtn = document.getElementById('btn-rest-skip');
  if (skipBtn) {
    skipBtn.addEventListener('click', () => Timer.skip());
  }
}

// =============================================================================
// COMPLETE SESSION
// =============================================================================
function _completeSession() {
  const trainedMuscles = S.circuit ? S.circuit.muscles : [];
  S.progress = Engine.recordHistory(S.progress, trainedMuscles);

  S.sessionLog.push({
    date:         new Date().toISOString(),
    mode:         S.mode,
    circuitId:    S.circuit ? S.circuit.id    : '',
    circuitTitle: S.circuit ? S.circuit.title : '',
    energy:       S.energy,
    duration:     Math.round((Date.now() - S.sessionStartTime) / 60000)
  });

  saveProgress();
  UI.renderComplete(S, S.sessionLevelUps);
}

function _bindCompleteEvents() {
  const doneBtn = document.getElementById('btn-complete-done');
  if (doneBtn) {
    doneBtn.addEventListener('click', () => UI.renderHome(S));
  }
}

// =============================================================================
// LEVEL UP CHECK
// =============================================================================
function _checkLevelUps(muscles, prevLevels) {
  muscles.forEach(m => {
    const newLevel = Engine.getLevelNum((S.progress[m] || {}).xp || 0);
    if (newLevel > (prevLevels[m] || 1)) {
      const levelData = Engine.getLevelData((S.progress[m] || {}).xp || 0);
      S.sessionLevelUps.push({
        muscle: m,
        level:  newLevel,
        unlocks: levelData.unlocks
      });
    }
  });
}

// =============================================================================
// STATS EVENTS
// =============================================================================
function _bindStatsEvents() {

  // Sort tabs
  document.querySelectorAll('.sort-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      S.statsSort = tab.dataset.sort;
      document.querySelectorAll('.sort-tab').forEach(t =>
        t.classList.toggle('tab-active', t.dataset.sort === S.statsSort)
      );
      UI.renderMuscleList(S, S.statsSort);
    });
  });

  // Time filter tabs
  document.querySelectorAll('.time-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      S.statsTimeFilter = tab.dataset.time;
      document.querySelectorAll('.time-tab').forEach(t =>
        t.classList.toggle('tab-active', t.dataset.time === S.statsTimeFilter)
      );
      const days = { '7days': 7, '30days': 30, '90days': 90, 'total': 365 };
      Stats.renderChart('trend-canvas', S.progress, days[S.statsTimeFilter] || 7,
                        S.activeChartMuscles, S.highlightMuscle);
    });
  });

  // Back from stats
  const backBtn = document.getElementById('btn-stats-back');
  if (backBtn) {
    backBtn.addEventListener('click', () => UI.renderHome(S));
  }

  // Exercises button (within stats screen)
  const exBtn = document.getElementById('btn-exercises');
  if (exBtn) {
    exBtn.addEventListener('click', _showExerciseLibrary);
  }
}

// =============================================================================
// SETTINGS
// =============================================================================
function _showSettings() {
  // Minimal settings panel — v9 spec has no complex settings
  const panel = document.getElementById('settings-panel');
  if (panel) {
    panel.hidden = !panel.hidden;
    return;
  }

  // Build inline panel if not present
  const homeScreen = document.getElementById('home-screen');
  const newPanel   = document.createElement('div');
  newPanel.id      = 'settings-panel';
  newPanel.style.cssText = [
    'position:fixed','inset:0','background:rgba(228,226,221,0.97)',
    'z-index:50','display:flex','flex-direction:column',
    'padding:48px 24px 24px','gap:20px','font-family:inherit'
  ].join(';');

  newPanel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center">
      <span style="font-weight:700;font-size:16px;text-transform:uppercase">Settings</span>
      <button id="settings-close" style="font-size:16px;font-weight:600;
        background:none;border:none;cursor:pointer;font-family:inherit">X</button>
    </div>
    <div style="font-size:13px;color:rgba(24,22,16,0.6);line-height:1.6">
      All training data is stored locally on this device.<br>
      No account. No cloud. No tracking.
    </div>
    <button id="settings-reset" style="
      padding:16px 24px;border:2px solid #181610;border-radius:12px;
      font-family:inherit;font-weight:600;font-size:14px;letter-spacing:0.05em;
      text-transform:uppercase;cursor:pointer;background:none;color:#181610">
      RESET ALL DATA
    </button>
    <div style="font-size:11px;color:rgba(24,22,16,0.4);margin-top:auto">
      7Bit v9 — manfredi-23.github.io/CircuitTraining
    </div>
  `;

  document.body.appendChild(newPanel);

  document.getElementById('settings-close').addEventListener('click', () => {
    newPanel.remove();
  });

  document.getElementById('settings-reset').addEventListener('click', () => {
    if (confirm('Delete all training data? This cannot be undone.')) {
      localStorage.removeItem(CONFIG.storage.progress);
      localStorage.removeItem(CONFIG.storage.sessionLog);
      S.progress   = {};
      S.sessionLog = [];
      newPanel.remove();
      UI.renderHome(S);
    }
  });
}

// =============================================================================
// EXERCISE LIBRARY
// =============================================================================
function _showExerciseLibrary() {
  const modeData = getModeData(S.mode);
  if (!modeData) return;

  const panel = document.createElement('div');
  panel.style.cssText = [
    'position:fixed','inset:0','background:rgba(228,226,221,0.98)',
    'z-index:50','display:flex','flex-direction:column',
    'padding:48px 24px 24px','gap:16px','overflow-y:auto',
    'font-family:inherit','-webkit-overflow-scrolling:touch'
  ].join(';');

  let html = `
    <div style="display:flex;justify-content:space-between;align-items:center;flex-shrink:0">
      <span style="font-weight:700;font-size:16px;text-transform:uppercase">EXERCISES — ${S.mode}</span>
      <button id="exlib-close" style="font-size:16px;font-weight:600;
        background:none;border:none;cursor:pointer;font-family:inherit">X</button>
    </div>
  `;

  modeData.forEach(circuit => {
    html += `
      <div style="border:2px solid #181610;border-radius:12px;padding:16px">
        <div style="font-weight:700;font-size:14px;text-transform:uppercase;
          margin-bottom:4px">${circuit.title}</div>
        <div style="font-size:12px;color:rgba(24,22,16,0.5);
          margin-bottom:12px;border-bottom:1px solid rgba(24,22,16,0.15);
          padding-bottom:8px">${circuit.subtitle}</div>
    `;
    circuit.exercises.forEach(ex => {
      const level = Engine.getMuscleLevel(S.progress, ex.muscles[0] || 'chest');
      const variation = Engine.getBestVariation(ex, S.progress);
      const name = variation ? variation.name : ex.name;
      html += `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;
          padding:8px 0;border-bottom:1px solid rgba(24,22,16,0.08)">
          <span style="font-size:13px;flex:1">${name}</span>
          <span style="font-size:12px;color:rgba(24,22,16,0.4);
            margin-left:8px">${ex.baseReps}${ex.unit === 'sec' ? 's' : ''}</span>
        </div>
      `;
    });
    html += `</div>`;
  });

  panel.innerHTML = html;
  document.body.appendChild(panel);

  document.getElementById('exlib-close').addEventListener('click', () => panel.remove());
}

// =============================================================================
// BOOT
// =============================================================================
document.addEventListener('DOMContentLoaded', init);
