'use strict';

/* ============================================================
   Composant : Viewer Count
   Affiche le nombre de spectateurs en direct.

   Expose : window.ViewerCount  →  { init() }
   Zone HTML  : #zone-viewers
   Données    : data/viewers.json
   Test       : touche V
   ============================================================ */

const ViewerCount = (() => {

  const POLL_INTERVAL = 30000; // 30s — Streamer.bot met à jour via timer

  // ── ÉTAT ────────────────────────────────────────────────────

  let zone;
  let lastTimestamp = -1;

  // ── POLLING ─────────────────────────────────────────────────

  async function poll() {
    try {
      const res = await fetch(`data/viewers.json?t=${Date.now()}`);
      if (!res.ok) return;
      const data = await res.json();
      if (!data || data.timestamp === lastTimestamp) return;
      lastTimestamp = data.timestamp;
      if (!data.timestamp) { zone.innerHTML = ''; return; }
      render(data);
    } catch (_) {}
  }

  // ── RENDU ────────────────────────────────────────────────────

  function render(data) {
    zone.innerHTML = `
      <div class="viewers-card">
        <div class="viewers-accent"></div>
        <div class="viewers-inner">
          <span class="viewers-icon" aria-hidden="true">👁</span>
          <div class="viewers-text">
            <div class="viewers-label">SPECTATEURS</div>
            <div class="viewers-count">${data.count ?? 0}</div>
          </div>
        </div>
      </div>
    `;
  }

  // ── MODE TEST (touche V) ─────────────────────────────────────

  function onKeyDown(e) {
    if (e.key.toLowerCase() !== 'v') return;
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    lastTimestamp = Date.now();
    render({ count: 142, timestamp: lastTimestamp });
  }

  // ── INIT ─────────────────────────────────────────────────────

  function init(cfg = {}) {
    zone = document.getElementById('zone-viewers');
    poll();
    setInterval(poll, POLL_INTERVAL);
    document.addEventListener('keydown', onKeyDown);
  }

  return { init };

})();
