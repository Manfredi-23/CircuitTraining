// =============================================================================
// timer.js — Rest timer with audio beeps and visual flash
// =============================================================================

'use strict';

const Timer = (() => {

  let _countdown = null;
  let _onTick = null;
  let _onDone = null;
  let _remaining = 0;
  let _audioCtx = null;

  // -------------------------------------------------------------------------
  // Audio context (lazy init on first user gesture)
  // -------------------------------------------------------------------------
  function _getAudioCtx() {
    if (!_audioCtx) {
      try {
        _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch(e) {
        console.warn('7Bit: AudioContext not available');
      }
    }
    return _audioCtx;
  }

  // -------------------------------------------------------------------------
  // _beep: generate a short beep tone
  // freq: Hz, duration: ms, volume: 0-1
  // -------------------------------------------------------------------------
  function _beep(freq, duration, volume) {
    const ctx = _getAudioCtx();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(freq, ctx.currentTime);

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration / 1000);
  }

  // -------------------------------------------------------------------------
  // _warningBeeps: 3 short beeps for warning phase
  // -------------------------------------------------------------------------
  function _warningBeeps() {
    _beep(880, 100, 0.3);
    setTimeout(() => _beep(880, 100, 0.3), 150);
    setTimeout(() => _beep(880, 100, 0.3), 300);
  }

  // -------------------------------------------------------------------------
  // _doneBeep: longer lower tone for timer complete
  // -------------------------------------------------------------------------
  function _doneBeep() {
    _beep(440, 400, 0.5);
    setTimeout(() => _beep(660, 600, 0.4), 450);
  }

  // -------------------------------------------------------------------------
  // _flashScreen: brief visual flash on rest timer screen
  // -------------------------------------------------------------------------
  function _flashScreen() {
    const flash = document.getElementById('timer-flash');
    if (!flash) return;
    flash.classList.add('flash-active');
    setTimeout(() => flash.classList.remove('flash-active'), CONFIG.ui.restFlashDuration);
  }

  // -------------------------------------------------------------------------
  // start: begin countdown
  // seconds: integer, onTick(remaining), onDone()
  // -------------------------------------------------------------------------
  function start(seconds, onTick, onDone) {
    stop(); // clear any existing
    _remaining = seconds;
    _onTick = onTick;
    _onDone = onDone;

    if (_onTick) _onTick(_remaining);

    _countdown = setInterval(() => {
      _remaining -= 1;

      if (_remaining === CONFIG.ui.restWarningAt) {
        _warningBeeps();
        _flashScreen();
      }

      if (_onTick) _onTick(_remaining);

      if (_remaining <= 0) {
        stop();
        _doneBeep();
        _flashScreen();
        if (_onDone) _onDone();
      }
    }, 1000);
  }

  // -------------------------------------------------------------------------
  // stop: clear the countdown interval
  // -------------------------------------------------------------------------
  function stop() {
    if (_countdown) {
      clearInterval(_countdown);
      _countdown = null;
    }
  }

  // -------------------------------------------------------------------------
  // skip: stop timer and immediately call done
  // -------------------------------------------------------------------------
  function skip() {
    stop();
    if (_onDone) _onDone();
  }

  // -------------------------------------------------------------------------
  // getRemaining: current seconds remaining
  // -------------------------------------------------------------------------
  function getRemaining() {
    return _remaining;
  }

  // -------------------------------------------------------------------------
  // initAudio: call on first user tap to warm up AudioContext
  // -------------------------------------------------------------------------
  function initAudio() {
    _getAudioCtx();
  }

  // -------------------------------------------------------------------------
  // formatTime: seconds → "M:SS"
  // -------------------------------------------------------------------------
  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  return { start, stop, skip, getRemaining, initAudio, formatTime };

})();
