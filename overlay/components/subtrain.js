'use strict';

/* ============================================================
   Composant : Sub Train
   Barre qui se remplit à chaque sub et se vide sur une durée.
   S'efface automatiquement quand expiresAt est dépassé.

   Expose : window.SubTrain  →  { init() }
   Zone HTML  : #zone-subtrain
   Données    : data/subtrain.json
   Test       : touche S
   ============================================================ */

const SubTrain = (() => {

  const POLL_INTERVAL    = 500; // ms
  const DURATION_DEFAULT = 60;  // secondes

  // ── ÉTAT ────────────────────────────────────────────────────

  let zone;
  let duration     = DURATION_DEFAULT;
  let lastTimestamp = -1;
  let currentData  = null;
  let tickTimer    = null;

  // ── POLLING ─────────────────────────────────────────────────

  async function poll() {
    try {
      const res = await fetch(`data/subtrain.json?t=${Date.now()}`);
      if (!res.ok) return;
      const data = await res.json();
      if (!data || data.timestamp === lastTimestamp) return;
      lastTimestamp = data.timestamp;
      currentData   = data;

      if (data.active && data.expiresAt > Date.now()) {
        render(data);
      } else {
        hide();
      }
    } catch (_) {}
  }

  // ── RENDU ────────────────────────────────────────────────────

  function render(data) {
    zone.innerHTML = `
      <div class="subtrain-card">
        <div class="subtrain-accent"></div>
        <div class="subtrain-inner">
          <span class="subtrain-icon" aria-hidden="true">🚂</span>
          <div class="subtrain-text">
            <div class="subtrain-label">SUB TRAIN</div>
            <div class="subtrain-count">×${data.count}</div>
          </div>
          ${data.lastUser ? `<div class="subtrain-last">${esc(data.lastUser)}</div>` : ''}
        </div>
        <div class="subtrain-bar-track">
          <div class="subtrain-bar-fill" id="subtrain-fill"></div>
        </div>
      </div>
    `;

    startTick();
  }

  // ── COUNTDOWN ────────────────────────────────────────────────

  function startTick() {
    if (tickTimer) clearInterval(tickTimer);
    tickTimer = setInterval(tick, 80);
  }

  function tick() {
    if (!currentData) return;
    const fill = document.getElementById('subtrain-fill');
    if (!fill) { clearInterval(tickTimer); return; }

    const remaining = Math.max(0, currentData.expiresAt - Date.now());
    const ratio     = remaining / (duration * 1000);
    fill.style.width = Math.round(ratio * 100) + '%';

    if (remaining <= 0) hide();
  }

  function hide() {
    if (tickTimer) { clearInterval(tickTimer); tickTimer = null; }
    zone.innerHTML = '';
  }

  // ── MODE TEST (touche S) ─────────────────────────────────────

  function onKeyDown(e) {
    if (e.key.toLowerCase() !== 's') return;
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    const ts   = Date.now();
    currentData = {
      count:    7,
      active:   true,
      lastUser: 'SuperFan',
      expiresAt: ts + duration * 1000,
      timestamp: ts,
    };
    lastTimestamp = ts;
    render(currentData);
  }

  // ── UTILITAIRES ──────────────────────────────────────────────

  function esc(v) {
    if (v == null) return '';
    return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── INIT ─────────────────────────────────────────────────────

  function init(cfg = {}) {
    zone = document.getElementById('zone-subtrain');
    if (cfg.duration != null) duration = cfg.duration;
    poll();
    setInterval(poll, POLL_INTERVAL);
    document.addEventListener('keydown', onKeyDown);
  }

  return { init };

})();
