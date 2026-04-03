'use strict';

/* ============================================================
   Composant : Uptime / Durée du stream
   Affiche le temps écoulé depuis le début du stream.
   La carte se met à jour chaque seconde de façon autonome.

   Expose : window.Uptime  →  { init() }
   Zone HTML  : #zone-uptime
   Données    : data/uptime.json  (startedAt = timestamp UNIX ms)
   Test       : touche I
   ============================================================ */

const Uptime = (() => {

  const POLL_INTERVAL = 60000; // 60s — recharge startedAt (change peu souvent)
  const TICK_INTERVAL = 1000;  // 1s — met à jour l'affichage

  // ── ÉTAT ────────────────────────────────────────────────────

  let zone;
  let startedAt     = 0;
  let lastTimestamp = -1;
  let tickTimer     = null;

  // ── POLLING ─────────────────────────────────────────────────

  async function poll() {
    try {
      const res = await fetch(`data/uptime.json?t=${Date.now()}`);
      if (!res.ok) return;
      const data = await res.json();
      if (!data || data.timestamp === lastTimestamp) return;
      lastTimestamp = data.timestamp;
      startedAt     = data.startedAt || 0;

      if (!startedAt) {
        zone.innerHTML = '';
        stopTick();
        return;
      }

      renderShell();
      renderTime();
      startTick();
    } catch (_) {}
  }

  // ── RENDU ────────────────────────────────────────────────────

  function renderShell() {
    if (zone.querySelector('.uptime-card')) return;
    zone.innerHTML = `
      <div class="uptime-card">
        <div class="uptime-accent"></div>
        <div class="uptime-inner">
          <span class="uptime-icon" aria-hidden="true">⏰</span>
          <div class="uptime-text">
            <div class="uptime-label">EN DIRECT</div>
            <div class="uptime-value" id="uptime-value">0m 00s</div>
          </div>
        </div>
      </div>
    `;
  }

  function renderTime() {
    if (!startedAt) return;
    const el = document.getElementById('uptime-value');
    if (!el) return;

    const elapsed = Math.max(0, Date.now() - startedAt);
    const h = Math.floor(elapsed / 3600000);
    const m = Math.floor((elapsed % 3600000) / 60000);
    const s = Math.floor((elapsed % 60000) / 1000);

    el.textContent = h > 0
      ? `${h}h ${String(m).padStart(2, '0')}m`
      : `${m}m ${String(s).padStart(2, '0')}s`;
  }

  // ── TICK ─────────────────────────────────────────────────────

  function startTick() {
    stopTick();
    tickTimer = setInterval(renderTime, TICK_INTERVAL);
  }

  function stopTick() {
    if (tickTimer) { clearInterval(tickTimer); tickTimer = null; }
  }

  // ── MODE TEST (touche I) ─────────────────────────────────────

  function onKeyDown(e) {
    if (e.key.toLowerCase() !== 'i') return;
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    const ts   = Date.now();
    lastTimestamp = ts;
    startedAt     = ts - 9240000; // 2h 34m
    renderShell();
    renderTime();
    startTick();
  }

  // ── INIT ─────────────────────────────────────────────────────

  function init(cfg = {}) {
    zone = document.getElementById('zone-uptime');
    poll();
    setInterval(poll, POLL_INTERVAL);
    document.addEventListener('keydown', onKeyDown);
  }

  return { init };

})();
