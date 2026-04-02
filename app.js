'use strict';

const S = {
  mode: 'HOME', circuitIndex: 0, energy: 'NORMAL', screen: 'home',
  circuit: null, exerciseList: null, stepIndex: 0, round: 1,
  sessionStartTime: null, restTarget: null,
  progress: {}, sessionLog: [], pendingDecayEvents: [],
  statsSort: 'recent', statsTimeFilter: '7days',
  activeChartMuscles: ['overall'], highlightMuscle: null,
  humorLine: '', currentExercise: null, swapActive: false,
  formGuideOpen: false, sessionLevelUps: [],
  swipeInProgress: false, exerciseTimerActive: false
};

// Storage
function saveProgress() {
  try {
    localStorage.setItem(CONFIG.storage.progress,   JSON.stringify(S.progress));
    localStorage.setItem(CONFIG.storage.sessionLog, JSON.stringify(S.sessionLog));
  } catch(e) {}
}
function loadProgress() {
  try {
    const p  = localStorage.getItem(CONFIG.storage.progress);
    const sl = localStorage.getItem(CONFIG.storage.sessionLog);
    if (p)  S.progress   = JSON.parse(p);
    if (sl) S.sessionLog = JSON.parse(sl);
  } catch(e) { S.progress = {}; S.sessionLog = []; }
}
function getModeData(mode) {
  switch(mode) {
    case 'HOME': return typeof DATA_HOME !== 'undefined' ? DATA_HOME : [];
    case 'CAVE': return typeof DATA_CAVE !== 'undefined' ? DATA_CAVE : [];
    case 'HANG': return typeof DATA_HANG !== 'undefined' ? DATA_HANG : [];
    default: return [];
  }
}

// Init
function init() {
  loadProgress();
  const lines = CONFIG.humorLines;
  S.humorLine = lines[Math.floor(Math.random() * lines.length)];
  const { progress: newP, decayEvents } = Engine.checkDecay(S.progress);
  if (decayEvents.length > 0) { S.progress = newP; S.pendingDecayEvents = decayEvents; saveProgress(); }

  _bindHomeEvents();
  _bindWorkoutEvents();
  _bindRestEvents();
  _bindCompleteEvents();
  _bindStatsEvents();
  _bindSwipeEvents();
  UI.renderHome(S);

  const initAudio = () => Timer.initAudio();
  document.addEventListener('touchstart', initAudio, { once: true });
  document.addEventListener('click',      initAudio, { once: true });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

// Home events
function _bindHomeEvents() {
  document.querySelectorAll('.mode-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      if (S.mode === tab.dataset.mode) return;
      S.mode = tab.dataset.mode;
      S.circuitIndex = 0;
      UI.renderHome(S);
    });
  });
  document.querySelectorAll('.energy-tab').forEach(tab => {
    tab.addEventListener('click', e => {
      e.stopPropagation();
      S.energy = tab.dataset.energy;
      UI.renderHome(S);
    });
  });
  const card = el('circuit-card');
  if (card) {
    card.addEventListener('click', () => { if (!S.swipeInProgress) _startWorkout(); });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); _startWorkout(); }
    });
  }
  el('btn-stats')    && el('btn-stats').addEventListener('click',    () => UI.renderStats(S));
  el('btn-settings') && el('btn-settings').addEventListener('click', _showSettings);
  el('derank-dismiss') && el('derank-dismiss').addEventListener('click', () => {
    S.pendingDecayEvents = [];
    UI.renderDerankBanner([]);
  });
}
function el(id) { return document.getElementById(id); }

// Swipe
function _bindSwipeEvents() {
  const card = el('circuit-card');
  if (!card) return;
  let startX = 0, startY = 0, moved = false;

  card.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX; startY = e.touches[0].clientY;
    moved = false; S.swipeInProgress = false;
  }, { passive: true });
  card.addEventListener('touchmove', e => {
    if (Math.abs(e.touches[0].clientX - startX) > 8 || Math.abs(e.touches[0].clientY - startY) > 8) moved = true;
  }, { passive: true });
  card.addEventListener('touchend', e => {
    if (!moved) return;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) < CONFIG.ui.swipeThreshold) return;
    if (Math.abs(dy) > Math.abs(dx) * 0.7) return;
    S.swipeInProgress = true;
    _changeCircuit(dx < 0 ? 1 : -1);
    setTimeout(() => { S.swipeInProgress = false; }, 50);
  }, { passive: true });

  let mouseStartX = 0, isDragging = false, mouseMoved = false;
  card.addEventListener('mousedown', e => { mouseStartX = e.clientX; isDragging = true; mouseMoved = false; });
  document.addEventListener('mousemove', e => { if (isDragging && Math.abs(e.clientX - mouseStartX) > 8) mouseMoved = true; });
  document.addEventListener('mouseup', e => {
    if (!isDragging) return; isDragging = false;
    if (!mouseMoved) return;
    const dx = e.clientX - mouseStartX;
    if (Math.abs(dx) < CONFIG.ui.swipeThreshold) return;
    S.swipeInProgress = true;
    _changeCircuit(dx < 0 ? 1 : -1);
    setTimeout(() => { S.swipeInProgress = false; }, 50);
  });
}

function _changeCircuit(dir) {
  const data = getModeData(S.mode);
  if (!data || data.length <= 1) return;
  S.circuitIndex = Math.max(0, Math.min(data.length - 1, S.circuitIndex + dir));
  const card = el('circuit-card');
  if (card) {
    card.classList.remove('card-slide');
    void card.offsetWidth;
    card.classList.add('card-slide');
  }
  UI.renderHome(S);
}

// Start workout
function _startWorkout() {
  const data = getModeData(S.mode);
  if (!data || !data.length) return;
  S.circuit      = data[S.circuitIndex] || data[0];
  S.exerciseList = Engine.buildList(S.circuit, S.energy, S.progress);
  if (!S.exerciseList || !S.exerciseList.length) return;
  S.stepIndex = 0; S.round = 1;
  S.sessionStartTime = Date.now();
  S.sessionLevelUps = []; S.swapActive = false; S.formGuideOpen = false;
  _goToStep(0);
}

function _goToStep(index) {
  if (!S.exerciseList) return;
  const maxRounds = (S.exerciseList[0] ? S.exerciseList[0].rounds : 1);
  if (index >= S.exerciseList.length) {
    if (S.round < maxRounds) { S.round++; S.stepIndex = 0; _showRestThen(() => _goToStep(0)); }
    else _completeSession();
    return;
  }
  S.stepIndex = index; S.currentExercise = S.exerciseList[index];
  S.swapActive = false; S.formGuideOpen = false;
  UI.renderWorkout(S);
  if (S.currentExercise.unit === 'sec') _startExerciseTimer(S.currentExercise.scaledReps);
}

let _exerciseTimerInterval = null;
function _startExerciseTimer(seconds) {
  _clearExerciseTimer();
  S.exerciseTimerActive = true;
  let remaining = seconds;
  const repsEl = el('workout-reps');
  _exerciseTimerInterval = setInterval(() => {
    remaining--;
    if (repsEl) repsEl.textContent = `${remaining}s`;
    if (remaining <= 0) { _clearExerciseTimer(); _exerciseDone(); }
  }, 1000);
}
function _clearExerciseTimer() {
  if (_exerciseTimerInterval) { clearInterval(_exerciseTimerInterval); _exerciseTimerInterval = null; }
  S.exerciseTimerActive = false;
}

// Workout events
function _bindWorkoutEvents() {
  el('btn-done') && el('btn-done').addEventListener('click', () => { _clearExerciseTimer(); _exerciseDone(); });
  el('btn-skip') && el('btn-skip').addEventListener('click', () => {
    _clearExerciseTimer();
    S.progress = Engine.applyXP(S.progress, S.currentExercise, 'skip');
    _goToStep(S.stepIndex + 1);
  });
  el('btn-exit') && el('btn-exit').addEventListener('click', () => {
    _clearExerciseTimer(); Timer.stop();
    const remaining = S.exerciseList ? S.exerciseList.slice(S.stepIndex) : [];
    S.progress = Engine.applyQuitPenalty(S.progress, remaining);
    saveProgress(); UI.renderHome(S);
  });
  el('btn-swap-variation') && el('btn-swap-variation').addEventListener('click', () => {
    if (!S.currentExercise) return;
    S.swapActive = !S.swapActive;
    if (S.swapActive) { S.currentExercise.displayName = S.currentExercise.variations[0].name; }
    else {
      const v = Engine.getBestVariation(S.currentExercise, S.progress);
      S.currentExercise.displayName = v ? v.name : S.currentExercise.name;
    }
    const nameEl = el('workout-ex-name');
    if (nameEl) nameEl.textContent = S.currentExercise.displayName;
    const btn = el('btn-swap-variation');
    if (btn) btn.textContent = S.swapActive ? 'REVERT' : 'SWAP';
  });
  const formToggle = el('form-guide-toggle');
  formToggle && formToggle.addEventListener('click', _toggleFormGuide);
  formToggle && formToggle.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); _toggleFormGuide(); }
  });
}

function _exerciseDone() {
  const prevLevels = {};
  (S.currentExercise.muscles || []).forEach(m => {
    prevLevels[m] = Engine.getLevelNum((S.progress[m] || {}).xp || 0);
  });
  S.progress = Engine.applyXP(S.progress, S.currentExercise, 'done');
  _checkLevelUps(S.currentExercise.muscles, prevLevels);
  const nextIndex  = S.stepIndex + 1;
  const maxRounds  = S.exerciseList[0] ? S.exerciseList[0].rounds : 1;
  if (nextIndex >= S.exerciseList.length && S.round >= maxRounds) _completeSession();
  else _showRestThen(() => _goToStep(nextIndex));
}

function _toggleFormGuide() {
  S.formGuideOpen = !S.formGuideOpen;
  const content = el('form-guide-content');
  const btn     = el('btn-form-toggle');
  if (content) content.hidden = !S.formGuideOpen;
  if (btn)     btn.textContent = S.formGuideOpen ? 'FORM -' : 'FORM +';
}

// Rest
function _showRestThen(callback) {
  const rest = S.currentExercise ? S.currentExercise.scaledRest : 60;
  S.restTarget = callback;
  UI.renderRestTimer(rest);
  Timer.start(rest, remaining => UI.updateRestTimer(remaining), () => { if (S.restTarget) S.restTarget(); });
}
function _bindRestEvents() {
  el('btn-rest-skip') && el('btn-rest-skip').addEventListener('click', () => Timer.skip());
}

// Complete
function _completeSession() {
  const trainedMuscles = S.circuit ? S.circuit.muscles : [];
  S.progress = Engine.recordHistory(S.progress, trainedMuscles);
  S.sessionLog.push({
    date: new Date().toISOString(), mode: S.mode,
    circuitId: S.circuit ? S.circuit.id : '',
    circuitTitle: S.circuit ? S.circuit.title : '',
    energy: S.energy,
    duration: Math.round((Date.now() - S.sessionStartTime) / 60000)
  });
  saveProgress();
  UI.renderComplete(S, S.sessionLevelUps);
}
function _bindCompleteEvents() {
  el('btn-complete-done') && el('btn-complete-done').addEventListener('click', () => UI.renderHome(S));
}

// Level up check
function _checkLevelUps(muscles, prevLevels) {
  muscles.forEach(m => {
    const newLevel = Engine.getLevelNum((S.progress[m] || {}).xp || 0);
    if (newLevel > (prevLevels[m] || 1)) {
      const levelData = Engine.getLevelData((S.progress[m] || {}).xp || 0);
      S.sessionLevelUps.push({ muscle: m, level: newLevel, unlocks: levelData.unlocks });
    }
  });
}

// Stats events
function _bindStatsEvents() {
  document.querySelectorAll('.sort-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      S.statsSort = tab.dataset.sort;
      document.querySelectorAll('.sort-tab').forEach(t =>
        t.classList.toggle('tab-active', t.dataset.sort === S.statsSort));
      UI.renderMuscleList(S, S.statsSort);
    });
  });
  document.querySelectorAll('.time-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      S.statsTimeFilter = tab.dataset.time;
      document.querySelectorAll('.time-tab').forEach(t =>
        t.classList.toggle('tab-active', t.dataset.time === S.statsTimeFilter));
      const days = { '7days':7, '30days':30, '90days':90, 'total':365 };
      Stats.renderChart('trend-canvas', S.progress, days[S.statsTimeFilter] || 7,
        S.activeChartMuscles, S.highlightMuscle);
    });
  });
  el('btn-stats-back') && el('btn-stats-back').addEventListener('click', () => UI.renderHome(S));

  // EXERCISES → back to HOME (not a library)
  el('btn-exercises') && el('btn-exercises').addEventListener('click', () => UI.renderHome(S));
}

// Settings overlay
function _showSettings() {
  const existing = document.getElementById('settings-panel');
  if (existing) { existing.remove(); return; }
  const panel = document.createElement('div');
  panel.id = 'settings-panel';
  panel.className = 'overlay-panel';
  panel.innerHTML = `
    <div class="overlay-header">
      <span style="font-weight:700;font-size:16px;text-transform:uppercase;letter-spacing:0.04em">Settings</span>
      <button id="settings-close" class="overlay-close">X</button>
    </div>
    <p class="overlay-body">All training data is stored locally on this device.<br>No account. No cloud. No tracking.</p>
    <button id="settings-reset" class="overlay-btn">RESET ALL DATA</button>
    <div class="overlay-footer">7Bit v9 — manfredi-23.github.io/CircuitTraining</div>
  `;
  document.body.appendChild(panel);
  void panel.offsetWidth;
  panel.classList.add('overlay-enter');
  panel.querySelector('#settings-close').addEventListener('click', () => {
    panel.classList.remove('overlay-enter');
    setTimeout(() => panel.remove(), 250);
  });
  panel.querySelector('#settings-reset').addEventListener('click', () => {
    if (confirm('Delete all training data? This cannot be undone.')) {
      localStorage.removeItem(CONFIG.storage.progress);
      localStorage.removeItem(CONFIG.storage.sessionLog);
      S.progress = {}; S.sessionLog = [];
      panel.remove(); UI.renderHome(S);
    }
  });
}

document.addEventListener('DOMContentLoaded', init);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
