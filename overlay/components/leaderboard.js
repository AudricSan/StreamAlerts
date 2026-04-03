'use strict';

/* ============================================================
   Composant : Leaderboard
   Classement des meilleurs contributeurs (bits, dons…).

   Expose : window.Leaderboard  →  { init() }
   Zone HTML  : #zone-leaderboard
   Données    : data/leaderboard.json
   Test       : touche B
   ============================================================ */

const Leaderboard = (() => {

  const POLL_INTERVAL = 5000;
  const MAX_ENTRIES   = 5;

  // ── ÉTAT ────────────────────────────────────────────────────

  let zone;
  let lastTimestamp = -1;

  // ── POLLING ─────────────────────────────────────────────────

  async function poll() {
    try {
      const res = await fetch(`data/leaderboard.json?t=${Date.now()}`);
      if (!res.ok) return;
      const data = await res.json();
      if (!data || data.timestamp === lastTimestamp) return;
      lastTimestamp = data.timestamp;
      if (!data.timestamp || !data.entries?.length) { zone.innerHTML = ''; return; }
      render(data);
    } catch (_) {}
  }

  // ── RENDU ────────────────────────────────────────────────────

  function render(data) {
    const entries = (data.entries || []).slice(0, MAX_ENTRIES);
    const medals  = ['🥇', '🥈', '🥉'];

    zone.innerHTML = `
      <div class="leaderboard-card">
        <div class="leaderboard-header">
          <span class="leaderboard-title">${esc(data.title || 'CLASSEMENT')}</span>
        </div>
        <div class="leaderboard-list">
          ${entries.map((e, i) => `
            <div class="leaderboard-entry${i === 0 ? ' leaderboard-first' : ''}">
              <span class="leaderboard-rank">${medals[i] ?? (i + 1)}</span>
              <span class="leaderboard-user">${esc(e.user)}</span>
              <span class="leaderboard-score">${fmtScore(e.score)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ── UTILITAIRES ──────────────────────────────────────────────

  function fmtScore(n) {
    if (!n && n !== 0) return '—';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return String(n);
  }

  function esc(v) {
    if (v == null) return '';
    return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ── MODE TEST (touche B) ─────────────────────────────────────

  function onKeyDown(e) {
    if (e.key.toLowerCase() !== 'b') return;
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    lastTimestamp = Date.now();
    render({
      title: 'Top Bits',
      entries: [
        { user: 'BigSpender',  score: 12500 },
        { user: 'FanFidèle',   score: 7300  },
        { user: 'NiceGuy',     score: 4100  },
        { user: 'Supporter',   score: 2800  },
        { user: 'NewComer',    score: 950   },
      ],
      timestamp: lastTimestamp,
    });
  }

  // ── INIT ─────────────────────────────────────────────────────

  function init(cfg = {}) {
    zone = document.getElementById('zone-leaderboard');
    poll();
    setInterval(poll, POLL_INTERVAL);
    document.addEventListener('keydown', onKeyDown);
  }

  return { init };

})();
