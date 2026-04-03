'use strict';

/* ============================================================
   Composant : Countdown / Timer
   Compte à rebours vers une date/heure cible.
   Se masque automatiquement à 0.

   Expose : window.Countdown  →  { init() }
   Zone HTML  : #zone-countdown
   Données    : data/countdown.json
   Test       : touche D
   ============================================================ */

const Countdown = (() => {

  const POLL_INTERVAL = 2000;
  const TICK_INTERVAL = 200; // ms

  // ── ÉTAT ────────────────────────────────────────────────────

  let zone;
  let lastTimestamp = -1;
  let currentData   = null;
  let tickTimer     = null;

  // ── POLLING ─────────────────────────────────────────────────

  async function poll() {
    try {
      const res = await fetch(`data/countdown.json?t=${Date.now()}`);
      if (!res.ok) return;
      const data = await res.json();
      if (!data || data.timestamp === lastTimestamp) return;
      lastTimestamp = data.timestamp;
      currentData   = data;

      if (data.active && data.endsAt > Date.now()) {
        renderShell(data);
        startTick();
      } else {
        hide();
      }
    } catch (_) {}
  }

  // ── RENDU ────────────────────────────────────────────────────

  function renderShell(data) {
    if (zone.querySelector('.countdown-card')) return; // structure déjà en place
    zone.innerHTML = `
      <div class="countdown-card">
        <div class="countdown-accent"></div>
        <div class="countdown-inner">
          <div class="countdown-label">${esc(data.label || 'COMPTE À REBOURS')}</div>
          <div class="countdown-value" id="countdown-value">--:--</div>
          <div class="countdown-bar-track">
            <div class="countdown-bar-fill" id="countdown-fill"></div>
          </div>
        </div>
      </div>
    `;
  }

  // ── TICK ─────────────────────────────────────────────────────

  function startTick() {
    stopTick();
    tick();
    tickTimer = setInterval(tick, TICK_INTERVAL);
  }

  function stopTick() {
    if (tickTimer) { clearInterval(tickTimer); tickTimer = null; }
  }

  function tick() {
    if (!currentData) return;
    const el   = document.getElementById('countdown-value');
    const fill = document.getElementById('countdown-fill');
    if (!el) { stopTick(); return; }

    const remaining = Math.max(0, currentData.endsAt - Date.now());

    if (remaining <= 0) { hide(); return; }

    const h = Math.floor(remaining / 3600000);
    const m = Math.floor((remaining % 3600000) / 60000);
    const s = Math.floor((remaining % 60000) / 1000);

    el.textContent = h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

    if (fill && currentData.startedAt) {
      const total = currentData.endsAt - currentData.startedAt;
      const pct   = total > 0 ? Math.round((remaining / total) * 100) : 100;
      fill.style.width = pct + '%';
    }
  }

  function hide() {
    stopTick();
    zone.innerHTML = '';
    currentData = null;
  }

  // ── MODE TEST (touche D) ─────────────────────────────────────

  function onKeyDown(e) {
    if (e.key.toLowerCase() !== 'd') return;
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    const ts = Date.now();
    currentData = {
      label:     'Début du jeu',
      active:    true,
      startedAt: ts,
      endsAt:    ts + 300000, // 5 min
      timestamp: ts,
    };
    lastTimestamp = ts;
    zone.innerHTML = ''; // forcer la recréation du shell
    renderShell(currentData);
    startTick();
  }

  // ── UTILITAIRES ──────────────────────────────────────────────

  function esc(v) {
    if (v == null) return '';
    return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ── INIT ─────────────────────────────────────────────────────

  function init(cfg = {}) {
    zone = document.getElementById('zone-countdown');
    poll();
    setInterval(poll, POLL_INTERVAL);
    document.addEventListener('keydown', onKeyDown);
  }

  return { init };

})();
