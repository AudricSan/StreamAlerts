'use strict';

/* ============================================================
   Composant : Goal Tracker
   Barre de progression vers un objectif (subs, follows, bits…)

   Expose : window.Goals  →  { init() }
   Zone HTML  : #zone-goal
   Données    : data/goal.json
   Test       : touche G
   ============================================================ */

const Goals = (() => {

  const POLL_INTERVAL = 2000;

  const TYPE_COLORS = {
    sub:      { color: '#F1C40F', rgb: '241, 196, 15'  },
    follow:   { color: '#9B59B6', rgb: '155, 89, 182'  },
    bits:     { color: '#00BCD4', rgb: '0, 188, 212'   },
    donation: { color: '#2ECC71', rgb: '46, 204, 113'  },
    custom:   { color: '#3498DB', rgb: '52, 152, 219'  },
  };

  // ── ÉTAT ────────────────────────────────────────────────────

  let zone;
  let lastTimestamp = -1;

  // ── POLLING ─────────────────────────────────────────────────

  async function poll() {
    try {
      const res = await fetch(`data/goal.json?t=${Date.now()}`);
      if (!res.ok) return;
      const data = await res.json();
      if (!data || data.timestamp === lastTimestamp) return;
      lastTimestamp = data.timestamp;
      if (data.timestamp === 0) { zone.innerHTML = ''; return; }
      render(data);
    } catch (_) {}
  }

  // ── RENDU ────────────────────────────────────────────────────

  function render(data) {
    const cfg   = TYPE_COLORS[data.type] || TYPE_COLORS.custom;
    const ratio = Math.min(1, Math.max(0, (data.current || 0) / (data.target || 1)));
    const pct   = Math.round(ratio * 100);

    zone.innerHTML = `
      <div class="goal-card" style="--goal-color:${cfg.color};--goal-color-rgb:${cfg.rgb};">
        <div class="goal-accent"></div>
        <div class="goal-inner">
          <div class="goal-header">
            <span class="goal-label">${esc(data.label || 'OBJECTIF')}</span>
            <span class="goal-count">${data.current}<span class="goal-sep">/</span>${data.target}</span>
          </div>
          <div class="goal-bar-track">
            <div class="goal-bar-fill" style="width:${pct}%"></div>
          </div>
        </div>
      </div>
    `;
  }

  // ── MODE TEST (touche G) ─────────────────────────────────────

  function onKeyDown(e) {
    if (e.key.toLowerCase() !== 'g') return;
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    lastTimestamp = Date.now();
    render({ label: 'Objectif subs', current: 47, target: 100, type: 'sub', timestamp: lastTimestamp });
  }

  // ── UTILITAIRES ──────────────────────────────────────────────

  function esc(v) {
    if (v == null) return '';
    return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── INIT ─────────────────────────────────────────────────────

  function init(cfg = {}) {
    zone = document.getElementById('zone-goal');
    poll();
    setInterval(poll, POLL_INTERVAL);
    document.addEventListener('keydown', onKeyDown);
  }

  return { init };

})();
