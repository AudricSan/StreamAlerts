'use strict';

/* ============================================================
   Composant : Session Stats
   Affiche les statistiques accumulées depuis le début du stream :
   follows, subs, bits, raids, dons.

   Expose : window.Session  →  { init() }
   Zone HTML  : #zone-session
   Données    : data/session.json
   Test       : touche E
   ============================================================ */

const Session = (() => {

  const POLL_INTERVAL = 3000;

  // ── ÉTAT ────────────────────────────────────────────────────

  let zone;
  let lastTimestamp = -1;

  // ── POLLING ─────────────────────────────────────────────────

  async function poll() {
    try {
      const res = await fetch(`data/session.json?t=${Date.now()}`);
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
    const STATS = [
      { icon: '♥', label: 'Follows',   key: 'follows'   },
      { icon: '⭐', label: 'Subs',      key: 'subs'      },
      { icon: '💎', label: 'Bits',      key: 'bits'      },
      { icon: '⚔️', label: 'Raids',     key: 'raids'     },
      { icon: '💰', label: 'Dons',      key: 'donations' },
    ];

    // Affiche toutes les stats, même à 0, pour les 2 premières (follows, subs)
    const visible = STATS.filter(s =>
      (data[s.key] ?? 0) > 0 || s.key === 'follows' || s.key === 'subs'
    );

    zone.innerHTML = `
      <div class="session-card">
        <div class="session-accent"></div>
        <div class="session-inner">
          <div class="session-label">SESSION</div>
          <div class="session-grid">
            ${visible.map(s => `
              <div class="session-stat">
                <span class="session-stat-icon">${s.icon}</span>
                <span class="session-stat-value">${data[s.key] ?? 0}</span>
                <span class="session-stat-name">${s.label}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // ── MODE TEST (touche E) ─────────────────────────────────────

  function onKeyDown(e) {
    if (e.key.toLowerCase() !== 'e') return;
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    lastTimestamp = Date.now();
    render({
      follows: 12, subs: 5, bits: 750, raids: 2, donations: 3,
      timestamp: lastTimestamp,
    });
  }

  // ── INIT ─────────────────────────────────────────────────────

  function init(cfg = {}) {
    zone = document.getElementById('zone-session');
    poll();
    setInterval(poll, POLL_INTERVAL);
    document.addEventListener('keydown', onKeyDown);
  }

  return { init };

})();
