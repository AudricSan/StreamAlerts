'use strict';

/* ============================================================
   Composant : Now Playing
   Affiche le titre/artiste en cours de lecture.
   Masqué automatiquement si active=false ou titre vide.

   Expose : window.NowPlaying  →  { init() }
   Zone HTML  : #zone-nowplaying
   Données    : data/nowplaying.json
   Test       : touche N
   ============================================================ */

const NowPlaying = (() => {

  const POLL_INTERVAL = 3000;

  // ── ÉTAT ────────────────────────────────────────────────────

  let zone;
  let lastTimestamp = -1;

  // ── POLLING ─────────────────────────────────────────────────

  async function poll() {
    try {
      const res = await fetch(`data/nowplaying.json?t=${Date.now()}`);
      if (!res.ok) return;
      const data = await res.json();
      if (!data || data.timestamp === lastTimestamp) return;
      lastTimestamp = data.timestamp;

      if (data.active && data.title) {
        render(data);
      } else {
        zone.innerHTML = '';
      }
    } catch (_) {}
  }

  // ── RENDU ────────────────────────────────────────────────────

  function render(data) {
    zone.innerHTML = `
      <div class="nowplaying-card">
        <div class="nowplaying-accent"></div>
        <div class="nowplaying-inner">
          <span class="nowplaying-icon" aria-hidden="true">🎵</span>
          <div class="nowplaying-text">
            <div class="nowplaying-label">NOW PLAYING</div>
            <div class="nowplaying-title">${esc(data.title)}</div>
            ${data.artist ? `<div class="nowplaying-artist">${esc(data.artist)}</div>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  // ── MODE TEST (touche N) ─────────────────────────────────────

  function onKeyDown(e) {
    if (e.key.toLowerCase() !== 'n') return;
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    lastTimestamp = Date.now();
    render({ title: 'Titre de la chanson', artist: "Nom de l'artiste", active: true, timestamp: lastTimestamp });
  }

  // ── UTILITAIRES ──────────────────────────────────────────────

  function esc(v) {
    if (v == null) return '';
    return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── INIT ─────────────────────────────────────────────────────

  function init(cfg = {}) {
    zone = document.getElementById('zone-nowplaying');
    poll();
    setInterval(poll, POLL_INTERVAL);
    document.addEventListener('keydown', onKeyDown);
  }

  return { init };

})();
