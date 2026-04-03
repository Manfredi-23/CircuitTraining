// =============================================================================
// stats.js — Stats calculations, trend scoring, chart rendering
// =============================================================================

'use strict';

const Stats = (() => {

  // -------------------------------------------------------------------------
  // calcTrendScore: compute a 0-100 score for a muscle group on a given day
  // Based on level, XP progress within level, behaviour modifiers, decay
  // -------------------------------------------------------------------------
  function calcTrendScore(muscleData) {
    if (!muscleData) return 0;

    const xp = muscleData.xp || 0;
    const level = Engine.getLevelNum(xp);
    const progress = Engine.getProgressInLevel(xp);

    // Foundation: level contributes most of the score (0-70 range)
    const levelScore = ((level - 1) / 6) * 70;

    // Progress within level (0-20 range, smooths transitions)
    const progressScore = progress * 20;

    // Behaviour modifier from recent history (0-10 range)
    const behaviourScore = _calcBehaviourScore(muscleData);

    return Math.min(100, Math.max(0, levelScore + progressScore + behaviourScore));
  }

  function _calcBehaviourScore(muscleData) {
    if (!muscleData.history || muscleData.history.length === 0) return 0;
    const recent = muscleData.history.slice(-10);
    if (recent.length < 2) return 0;

    // Look for XP growth in recent history
    const first = recent[0].xp;
    const last = recent[recent.length - 1].xp;
    const growth = last - first;

    // Clamp to +5 / -5
    return Math.max(-5, Math.min(5, growth));
  }

  // -------------------------------------------------------------------------
  // getMuscleTrendData: returns array of { date, score } for a muscle
  // over last N days (for the graph)
  // -------------------------------------------------------------------------
  function getMuscleTrendData(muscleData, days) {
    if (!muscleData || !muscleData.history || muscleData.history.length === 0) {
      return _emptyTrendData(days);
    }

    const now = new Date();
    const result = [];

    for (let d = days - 1; d >= 0; d--) {
      const target = new Date(now);
      target.setDate(target.getDate() - d);
      const dateStr = target.toISOString().split('T')[0];

      // Find history entries on or before this date
      const relevantHistory = muscleData.history.filter(h => {
        return new Date(h.date) <= target;
      });

      // Use the most recent entry up to this date to simulate the muscle state
      let score = 0;
      if (relevantHistory.length > 0) {
        const latestEntry = relevantHistory[relevantHistory.length - 1];
        const syntheticData = { ...muscleData, xp: latestEntry.xp, history: relevantHistory };
        score = calcTrendScore(syntheticData);
      }

      result.push({ date: dateStr, score });
    }

    // Apply smoothing: 3-point moving average
    return _smooth(result);
  }

  function _emptyTrendData(days) {
    const now = new Date();
    const result = [];
    for (let d = days - 1; d >= 0; d--) {
      const target = new Date(now);
      target.setDate(target.getDate() - d);
      result.push({ date: target.toISOString().split('T')[0], score: 0 });
    }
    return result;
  }

  function _smooth(data) {
    if (data.length < 3) return data;
    return data.map((point, i) => {
      if (i === 0 || i === data.length - 1) return point;
      const avg = (data[i-1].score + point.score + data[i+1].score) / 3;
      return { ...point, score: Math.round(avg * 10) / 10 };
    });
  }

  // -------------------------------------------------------------------------
  // getOverallTrendData: average of all muscle groups
  // -------------------------------------------------------------------------
  function getOverallTrendData(progress, days) {
    const allMuscleData = CONFIG.muscleGroups.map(m => getMuscleTrendData(progress[m], days));

    if (allMuscleData.length === 0) return _emptyTrendData(days);
    const length = allMuscleData[0].length;

    return allMuscleData[0].map((_, i) => {
      const avg = allMuscleData.reduce((sum, muscle) => sum + (muscle[i] ? muscle[i].score : 0), 0) / allMuscleData.length;
      return {
        date: allMuscleData[0][i].date,
        score: Math.round(avg * 10) / 10
      };
    });
  }

  // -------------------------------------------------------------------------
  // getSortedMuscles: returns muscle list sorted by strongest/weakest/recent
  // -------------------------------------------------------------------------
  function getSortedMuscles(progress, sort) {
    const muscles = CONFIG.muscleGroups.map(m => {
      const pg = progress[m] || { xp: 0, lastTrained: null, history: [] };
      const level = Engine.getLevelNum(pg.xp);
      const trend = Engine.getTrend(progress, m);
      const lastTrained = pg.lastTrained ? new Date(pg.lastTrained) : new Date(0);
      return { muscle: m, level, trend, lastTrained };
    });

    switch (sort) {
      case 'strongest':
        return muscles.sort((a, b) => b.level - a.level);
      case 'weakest':
        return muscles.sort((a, b) => a.level - b.level);
      case 'recent':
        return muscles.sort((a, b) => b.lastTrained - a.lastTrained);
      default:
        return muscles;
    }
  }

  // -------------------------------------------------------------------------
  // renderChart: draw the trend chart on a canvas element
  // -------------------------------------------------------------------------
  function renderChart(canvasId, progress, days, activeMuslces, highlightMuscle) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    const PAD = { top: 16, right: 16, bottom: 24, left: 32 };
    const chartW = W - PAD.left - PAD.right;
    const chartH = H - PAD.top - PAD.bottom;

    // Clear
    ctx.clearRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = 'rgba(24,22,16,0.12)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    for (let i = 0; i <= 4; i++) {
      const y = PAD.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(PAD.left, y);
      ctx.lineTo(PAD.left + chartW, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    const overallData = getOverallTrendData(progress, days);
    const maxScore = 100;

    function xPos(i) {
      return PAD.left + (i / (overallData.length - 1)) * chartW;
    }
    function yPos(score) {
      return PAD.top + chartH - (score / maxScore) * chartH;
    }

    // Draw each active non-overall muscle as dashed grey
    if (activeMuslces) {
      activeMuslces.forEach(m => {
        if (m === 'overall') return;
        const data = getMuscleTrendData(progress[m], days);
        ctx.beginPath();
        ctx.setLineDash([3, 5]);
        ctx.strokeStyle = m === highlightMuscle ? '#E64D19' : 'rgba(24,22,16,0.25)';
        ctx.lineWidth = m === highlightMuscle ? 2 : 1;
        data.forEach((pt, i) => {
          if (i === 0) ctx.moveTo(xPos(i), yPos(pt.score));
          else ctx.lineTo(xPos(i), yPos(pt.score));
        });
        ctx.stroke();
        ctx.setLineDash([]);
      });
    }

    // Overall line — solid black
    ctx.beginPath();
    ctx.setLineDash([]);
    ctx.strokeStyle = '#181610';
    ctx.lineWidth = 2;
    overallData.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(xPos(i), yPos(pt.score));
      else ctx.lineTo(xPos(i), yPos(pt.score));
    });
    ctx.stroke();

    // Date labels (first and last)
    ctx.fillStyle = 'rgba(24,22,16,0.5)';
    ctx.font = '10px "Kode Mono", monospace';
    ctx.textAlign = 'left';
    if (overallData.length > 0) {
      ctx.fillText(overallData[0].date.slice(5), PAD.left, H - 4);
      ctx.textAlign = 'right';
      ctx.fillText(overallData[overallData.length - 1].date.slice(5), PAD.left + chartW, H - 4);
    }
  }

  // -------------------------------------------------------------------------
  // getLastSession: returns { mode, circuitTitle } from session log
  // -------------------------------------------------------------------------
  function getLastSession(sessionLog) {
    if (!sessionLog || sessionLog.length === 0) return null;
    return sessionLog[sessionLog.length - 1];
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------
  return {
    calcTrendScore,
    getMuscleTrendData,
    getOverallTrendData,
    getSortedMuscles,
    renderChart,
    getLastSession
  };

})();
