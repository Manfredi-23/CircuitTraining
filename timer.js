'use strict';

const Timer = (() => {
  let _countdown = null, _onTick = null, _onDone = null, _remaining = 0;
  let _audioCtx = null;

  function _getAudioCtx() {
    if (!_audioCtx) {
      try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
    }
    return _audioCtx;
  }

  function _beep(freq, duration, volume) {
    const ctx = _getAudioCtx(); if (!ctx) return;
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration/1000);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + duration/1000);
  }

  function _warningBeeps() {
    _beep(880, 80, 0.25);
    setTimeout(() => _beep(880, 80, 0.25), 130);
    setTimeout(() => _beep(1100, 120, 0.3), 280);
  }

  function _doneBeep() {
    _beep(523, 150, 0.4);
    setTimeout(() => _beep(659, 150, 0.4), 160);
    setTimeout(() => _beep(784, 300, 0.5), 320);
  }

  function _flashScreen() {
    const flash = document.getElementById('timer-flash');
    if (!flash) return;
    flash.classList.add('flash-active');
    setTimeout(() => flash.classList.remove('flash-active'), 300);
  }

  function start(seconds, onTick, onDone) {
    stop();
    _remaining = seconds; _onTick = onTick; _onDone = onDone;
    if (_onTick) _onTick(_remaining);

    _countdown = setInterval(() => {
      _remaining -= 1;

      // Warning pulse animation on ring
      if (_remaining === CONFIG.ui.restWarningAt) {
        _warningBeeps(); _flashScreen();
        const ring = document.getElementById('rest-ring-fill');
        if (ring) ring.closest('svg') && ring.closest('svg').classList.add('rest-warning-ring');
      }

      if (_onTick) _onTick(_remaining);

      if (_remaining <= 0) {
        stop(); _doneBeep(); _flashScreen();
        if (_onDone) _onDone();
      }
    }, 1000);
  }

  function stop() {
    if (_countdown) { clearInterval(_countdown); _countdown = null; }
  }

  function skip() { stop(); if (_onDone) _onDone(); }
  function getRemaining() { return _remaining; }
  function initAudio() { _getAudioCtx(); }

  function formatTime(seconds) {
    const m = Math.floor(Math.max(0,seconds) / 60);
    const s = Math.max(0,seconds) % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  return { start, stop, skip, getRemaining, initAudio, formatTime };
})();
