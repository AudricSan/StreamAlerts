'use strict';

/* ============================================================
   Composant : Hype Train (temps réel)
   Barre de progression du Hype Train actif.
   Différent de l'alerte : persistant pendant tout le train.

   Expose : window.HypeTrain  →  { init() }
   Zone HTML  : #zone-hypetrain
   Données    : data/hypetrain.json
   Test       : touche H
   ============================================================ */

const HypeTrain = (() => {

  const POLL_INTERVAL = 1000;
  const TICK_INTERVAL = 80; // ms — barre de temps fluide

  // ── ÉTAT ────────────────────────────────────────────────────

  let zone;
  let lastTimestamp = -1;
  let currentData   = null;
  let tickTimer     = null;

  // ── POLLING ─────────────────────────────────────────────────

  async function poll() {
    try {
      const res = await fetch(`data/hypetrain.json?t=${Date.now()}`);
      if (!res.ok) return;
      const data = await res.json();
      if (!data || data.timestamp === lastTimestamp) return;
      lastTimestamp = data.timestamp;
      currentData   = data;

      if (data.active && data.endsAt > Date.now()) {
        render(data);
        startTick();
      } else {
        hide();
      }
    } catch (_) {}
  }

  // ── RENDU ────────────────────────────────────────────────────

  function render(data) {
    const pct       = Math.min(100, Math.max(0, Math.round((data.progress / (data.goal || 100)) * 100)));
    const topUsers  = (data.contributors || []).slice(0, 3).map(c => esc(c.user)).join(' · ');

    zone.innerHTML = `
      <div class="hypetrain-card">
        <div class="hypetrain-accent"></div>
        <div class="hypetrain-inner">
          <span class="hypetrain-icon" aria-hidden="true">🚂</span>
          <div class="hypetrain-text">
            <div class="hypetrain-label">HYPE TRAIN</div>
            <div class="hypetrain-level">Niveau ${data.level || 1}</div>
            ${topUsers ? `<div class="hypetrain-top">${topUsers}</div>` : ''}
          </div>
          <div class="hypetrain-pct">${pct}%</div>
        </div>
        <div class="hypetrain-progress-track">
          <div class="hypetrain-progress-fill" style="width:${pct}%"></div>
        </div>
        <div class="hypetrain-timer-track">
          <div class="hypetrain-timer-fill" id="hypetrain-timer-fill"></div>
        </div>
      </div>
    `;
    startTick();
  }

  // ── TICK ─────────────────────────────────────────────────────

  function startTick() {
    stopTick();
    tickTimer = setInterval(tick, TICK_INTERVAL);
  }

  function stopTick() {
    if (tickTimer) { clearInterval(tickTimer); tickTimer = null; }
  }

  function tick() {
    if (!currentData) return;
    const fill = document.getElementById('hypetrain-timer-fill');
    if (!fill) { stopTick(); return; }

    const remaining = Math.max(0, currentData.endsAt - Date.now());
    const total     = currentData.duration
      ? currentData.duration * 1000
      : (currentData.endsAt - (currentData.startedAt || currentData.endsAt - 300000));
    const pct = total > 0 ? Math.round((remaining / total) * 100) : 0;
    fill.style.width = pct + '%';

    if (remaining <= 0) hide();
  }

  function hide() {
    stopTick();
    zone.innerHTML = '';
    currentData = null;
  }

  // ── UTILITAIRES ──────────────────────────────────────────────

  function esc(v) {
    if (v == null) return '';
    return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ── MODE TEST (touche H) ─────────────────────────────────────

  function onKeyDown(e) {
    if (e.key.toLowerCase() !== 'h') return;
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    const ts = Date.now();
    currentData = {
      level:      2,
      progress:   68,
      goal:       100,
      active:     true,
      startedAt:  ts - 120000,
      endsAt:     ts + 180000,
      duration:   300,
      contributors: [
        { user: 'TopFan',  amount: 500 },
        { user: 'SubLord', amount: 300 },
        { user: 'Hype4ever', amount: 200 },
      ],
      timestamp: ts,
    };
    lastTimestamp = ts;
    render(currentData);
  }

  // ── INIT ─────────────────────────────────────────────────────

  function init(cfg = {}) {
    zone = document.getElementById('zone-hypetrain');
    poll();
    setInterval(poll, POLL_INTERVAL);
    document.addEventListener('keydown', onKeyDown);
  }

  return { init };

})();
