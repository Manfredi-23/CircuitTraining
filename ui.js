'use strict';

const UI = (() => {

  function el(id)         { return document.getElementById(id); }
  function setText(id, t) { const e = el(id); if (e) e.textContent = t; }
  function show(id)       { const e = el(id); if (e) e.hidden = false; }
  function hide(id)       { const e = el(id); if (e) e.hidden = true;  }

  function setScreen(name) {
    document.querySelectorAll('[data-screen]').forEach(s => {
      const show = s.dataset.screen === name;
      if (show && s.hidden) {
        s.hidden = false;
        // Trigger entrance animation
        s.classList.remove('screen-enter');
        void s.offsetWidth; // reflow
        s.classList.add('screen-enter');
      } else if (!show) {
        s.hidden = true;
        s.classList.remove('screen-enter');
      }
    });
  }

  function _modeData(mode) {
    switch (mode) {
      case 'HOME': return typeof DATA_HOME !== 'undefined' ? DATA_HOME : [];
      case 'CAVE': return typeof DATA_CAVE !== 'undefined' ? DATA_CAVE : [];
      case 'HANG': return typeof DATA_HANG !== 'undefined' ? DATA_HANG : [];
      default: return [];
    }
  }

  // -------------------------------------------------------------------------
  // renderHome
  // -------------------------------------------------------------------------
  function renderHome(S) {
    setScreen('home');
    setText('humor-line', S.humorLine || '');

    document.querySelectorAll('.mode-tab').forEach(tab => {
      const active = tab.dataset.mode === S.mode;
      tab.classList.toggle('tab-active', active);
      tab.setAttribute('aria-selected', active);
    });

    const modeData = _modeData(S.mode);
    if (!modeData || modeData.length === 0) return;
    const circuit = modeData[S.circuitIndex] || modeData[0];
    _renderCard(circuit, S, modeData.length);
    renderDerankBanner(S.pendingDecayEvents);
  }

  function _renderCard(circuit, S, totalCircuits) {
    setText('card-title',    circuit.title);
    setText('card-subtitle', circuit.subtitle);
    setText('card-num',      circuit.circuitNum);
    setText('card-duration', `${circuit.duration || 35} min.`);

    // Illustration — SVG or PNG, both work as <img src>
    const img = el('card-illustration');
    if (img) {
      img.src = circuit.illustration;
      img.alt = circuit.title;
      // Animate illustration on change
      img.classList.remove('illus-pop');
      void img.offsetWidth;
      img.classList.add('illus-pop');
    }

    // --- DOTS: remapped muscle level (1-7) → 1-3 dots filled ---
    // Use lowest muscle level in the circuit muscles
    const minMuscleLevel = circuit.muscles.reduce((min, m) => {
      return Math.min(min, Engine.getMuscleLevel(S.progress, m));
    }, 7);
    // Remap: L1-2 → 1 dot, L3-4 → 2 dots, L5-7 → 3 dots
    const filledDots = minMuscleLevel <= 2 ? 1 : minMuscleLevel <= 4 ? 2 : 3;

    const dotContainer = el('circuit-dots');
    if (dotContainer) {
      dotContainer.innerHTML = '';
      for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        dot.className = 'dot' + (i < filledDots ? ' dot-filled' : '');
        dotContainer.appendChild(dot);
      }
    }

    // Energy tabs
    document.querySelectorAll('.energy-tab').forEach(tab => {
      const active = tab.dataset.energy === S.energy;
      tab.classList.toggle('tab-active', active);
      tab.setAttribute('aria-selected', active);
    });
  }

  // -------------------------------------------------------------------------
  // renderWorkout
  // -------------------------------------------------------------------------
  function renderWorkout(S) {
    setScreen('workout');
    const ex = S.currentExercise;
    if (!ex) return;

    setText('workout-mode-label',   `${S.mode} / ${S.circuit.circuitNum}`);
    setText('workout-energy-badge',  S.energy);
    const total = S.exerciseList ? S.exerciseList.length : 1;
    setText('workout-step', `${S.stepIndex + 1} / ${total}`);

    const pct = total > 1 ? (S.stepIndex / (total - 1)) * 100 : 0;
    const bar = el('workout-progress-fill');
    if (bar) bar.style.width = `${pct}%`;

    setText('workout-round', `Round ${S.round} / ${ex.rounds || 1}`);

    // Exercise name — animate swap
    const nameEl = el('workout-ex-name');
    if (nameEl) {
      nameEl.classList.remove('ex-name-enter');
      void nameEl.offsetWidth;
      nameEl.textContent = ex.displayName || ex.name;
      nameEl.classList.add('ex-name-enter');
    }

    const tagContainer = el('workout-muscles');
    if (tagContainer) {
      tagContainer.innerHTML = '';
      (ex.muscles || []).forEach(m => {
        const lvl = Engine.getMuscleLevel(S.progress, m);
        const tag = document.createElement('span');
        tag.className   = 'muscle-tag';
        tag.textContent = `${m} L${lvl}`;
        tagContainer.appendChild(tag);
      });
    }

    const repsEl = el('workout-reps');
    if (repsEl) {
      repsEl.classList.remove('reps-pop');
      void repsEl.offsetWidth;
      repsEl.textContent = ex.unit === 'sec' ? `${ex.scaledReps}s` : `x${ex.scaledReps}`;
      repsEl.classList.add('reps-pop');
    }

    if (ex.note) { setText('workout-note', ex.note); show('workout-note'); }
    else         { hide('workout-note'); }

    _renderVariationSwap(ex, S);
    const formContent = el('form-guide-content');
    const formBtn     = el('btn-form-toggle');
    if (formContent) formContent.hidden = true;
    if (formBtn)     formBtn.textContent = 'FORM +';
    _buildFormGuide(ex);
    if (ex.form) show('form-guide-section');
    else         hide('form-guide-section');
  }

  function _renderVariationSwap(ex, S) {
    const swapSection = el('workout-swap');
    if (!swapSection) return;
    if (ex.variations && ex.variations.length > 1 && ex.activeVariation && ex.activeVariation.minLevel > 1) {
      setText('workout-base-name', ex.variations[0].name);
      const btn = el('btn-swap-variation');
      if (btn) btn.textContent = S.swapActive ? 'REVERT' : 'SWAP';
      show('workout-swap');
    } else {
      hide('workout-swap');
    }
  }

  function _buildFormGuide(ex) {
    const container = el('form-guide-content');
    if (!container || !ex.form) return;
    container.innerHTML = '';
    [
      { key:'setup',     label:'SETUP'     },
      { key:'execution', label:'EXECUTION' },
      { key:'cue',       label:'CUE'       },
      { key:'breathing', label:'BREATHING' },
      { key:'mistakes',  label:'MISTAKES'  }
    ].forEach(sec => {
      if (!ex.form[sec.key]) return;
      const div   = document.createElement('div');
      div.className = 'form-section';
      const label = document.createElement('span');
      label.className   = 'form-label';
      label.textContent = sec.label;
      const text  = document.createElement('p');
      text.className   = 'form-text';
      text.textContent = ex.form[sec.key];
      div.appendChild(label);
      div.appendChild(text);
      container.appendChild(div);
    });
  }

  // -------------------------------------------------------------------------
  // renderRestTimer
  // -------------------------------------------------------------------------
  function renderRestTimer(seconds) {
    setScreen('rest');
    _updateRestDisplay(seconds);
    // Animate the ring on new rest
    const ring = el('rest-ring-fill');
    if (ring) {
      ring.dataset.total = seconds;
      _updateRestRing(seconds, seconds);
    }
  }

  function updateRestTimer(seconds) {
    _updateRestDisplay(seconds);
    const ring = el('rest-ring-fill');
    if (ring) {
      const total = parseInt(ring.dataset.total) || seconds;
      _updateRestRing(seconds, total);
    }
  }

  function _updateRestDisplay(seconds) {
    setText('rest-time', Timer.formatTime(seconds));
    const restEl = el('rest-time');
    if (restEl) restEl.classList.toggle('rest-warning', seconds <= CONFIG.ui.restWarningAt && seconds > 0);
  }

  function _updateRestRing(remaining, total) {
    const ring = el('rest-ring-fill');
    if (!ring) return;
    const circumference = 2 * Math.PI * 54; // r=54
    const progress = total > 0 ? remaining / total : 0;
    ring.style.strokeDashoffset = circumference * (1 - progress);
  }

  // -------------------------------------------------------------------------
  // renderComplete
  // -------------------------------------------------------------------------
  function renderComplete(S, levelUps) {
    setScreen('complete');
    const mins = S.sessionStartTime ? Math.round((Date.now() - S.sessionStartTime) / 60000) : 0;
    setText('complete-duration', `${mins} min.`);
    setText('complete-mode',     `${S.mode} — ${S.circuit ? S.circuit.title : ''}`);
    setText('complete-energy',    S.energy);

    const luContainer = el('levelup-list');
    if (luContainer) {
      luContainer.innerHTML = '';
      (levelUps || []).forEach((lu, i) => {
        const item = document.createElement('div');
        item.className = 'levelup-item';
        item.style.animationDelay = `${i * 120}ms`;
        item.textContent = `${lu.muscle.toUpperCase()} > L${lu.level} — ${lu.unlocks}`;
        luContainer.appendChild(item);
      });
    }
  }

  // -------------------------------------------------------------------------
  // renderStats — matches Figma design
  // -------------------------------------------------------------------------
  function renderStats(S) {
    setScreen('stats');
    const progress = S.progress || {};
    const overall  = Engine.getOverallLevel(progress);

    setText('stats-overall-num', overall.toString().padStart(2, '0'));

    const interp = Engine.getStatInterpretation(progress, S.sessionLog);
    setText('stats-interpretation', interp);

    const last = Stats.getLastSession(S.sessionLog);
    if (last) {
      setText('stats-last', `${last.mode} [${last.circuitTitle}]`);
      show('stats-last-row');
    } else {
      hide('stats-last-row');
    }

    document.querySelectorAll('.sort-tab').forEach(t =>
      t.classList.toggle('tab-active', t.dataset.sort === (S.statsSort || 'recent'))
    );
    renderMuscleList(S, S.statsSort || 'recent');

    document.querySelectorAll('.time-tab').forEach(t =>
      t.classList.toggle('tab-active', t.dataset.time === (S.statsTimeFilter || '7days'))
    );
    const days = { '7days':7, '30days':30, '90days':90, 'total':365 };
    Stats.renderChart('trend-canvas', progress,
      days[S.statsTimeFilter || '7days'] || 7, S.activeChartMuscles, S.highlightMuscle);
  }

  function renderMuscleList(S, sort) {
    const container = el('muscle-list');
    if (!container) return;
    container.innerHTML = '';
    const sorted = Stats.getSortedMuscles(S.progress || {}, sort);
    sorted.forEach((item, i) => {
      const row = document.createElement('div');
      row.className = 'muscle-row';
      row.style.animationDelay = `${i * 30}ms`;
      row.classList.add('muscle-row-enter');

      if (item.trend === 'down') {
        const bar = document.createElement('span');
        bar.className = 'decline-bar';
        row.appendChild(bar);
      }

      const name = document.createElement('span');
      name.className   = 'muscle-name';
      name.textContent = item.muscle;
      row.appendChild(name);

      const level = document.createElement('span');
      level.className   = 'muscle-level';
      level.textContent = `Lvl${item.level.toString().padStart(2, '0')}`;
      row.appendChild(level);

      const trend = document.createElement('span');
      trend.className   = 'muscle-trend';
      trend.textContent = item.trend === 'up' ? '^' : item.trend === 'down' ? 'v' : '-';
      row.appendChild(trend);

      container.appendChild(row);
    });
  }

  function renderDerankBanner(decayEvents) {
    const banner = el('derank-banner');
    if (!banner) return;
    if (!decayEvents || decayEvents.length === 0) { banner.hidden = true; return; }
    const event = decayEvents[0];
    const templates = CONFIG.derankMessages;
    let msg = templates[Math.floor(Math.random() * templates.length)];
    msg = msg.replace('{muscle}', event.muscle.charAt(0).toUpperCase() + event.muscle.slice(1))
             .replace('{level}', event.level);
    setText('derank-text', msg);
    banner.hidden = false;
  }

  return {
    setScreen, renderHome, renderWorkout,
    renderRestTimer, updateRestTimer,
    renderComplete, renderStats, renderMuscleList, renderDerankBanner
  };

})();
