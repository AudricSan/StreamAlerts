'use strict';

/* ============================================================
   Composant : Queue Viewers
   Liste des viewers en file d'attente pour jouer.

   Commandes chat (Streamer.bot) :
     !join             → rejoindre (si queue ouverte)
     !leave            → partir
     !next             → (mod/broadcaster) passer au suivant
     !queue open/close → (mod/broadcaster) ouvrir / fermer
     !queue clear      → (mod/broadcaster) vider

   Expose : window.Queue  →  { init() }
   Zone HTML  : #zone-queue
   Données    : data/queue.json
   Test       : touche U (evite conflit avec Q=quitter)
   ============================================================ */

const Queue = (() => {

  const POLL_INTERVAL = 1000;
  let   maxVisible    = 8;

  // ── ÉTAT ────────────────────────────────────────────────────

  let zone;
  let lastTimestamp = -1;

  // ── POLLING ─────────────────────────────────────────────────

  async function poll() {
    try {
      const res = await fetch(`data/queue.json?t=${Date.now()}`);
      if (!res.ok) return;
      const data = await res.json();
      if (!data || data.timestamp === lastTimestamp) return;
      lastTimestamp = data.timestamp;

      const hasContent = data.isOpen || (data.entries && data.entries.length > 0);
      if (!hasContent) { zone.innerHTML = ''; return; }
      render(data);
    } catch (_) {}
  }

  // ── RENDU ────────────────────────────────────────────────────

  function render(data) {
    const all     = data.entries || [];
    const entries = all.slice(0, maxVisible);
    const more    = all.length - maxVisible;

    zone.innerHTML = `
      <div class="queue-card">
        <div class="queue-header">
          <span class="queue-title">QUEUE</span>
          <span class="queue-badge ${data.isOpen ? 'queue-open' : 'queue-closed'}">
            ${data.isOpen ? 'OUVERTE' : 'FERMÉE'}
          </span>
          ${all.length > 0 ? `<span class="queue-total">${all.length}</span>` : ''}
        </div>
        ${entries.length > 0 ? `
          <div class="queue-list">
            ${entries.map((e, i) => `
              <div class="queue-entry${i === 0 ? ' queue-first' : ''}">
                <span class="queue-pos">${i + 1}</span>
                <span class="queue-user">${esc(e.user)}</span>
              </div>
            `).join('')}
            ${more > 0 ? `<div class="queue-more">+${more} autres</div>` : ''}
          </div>
        ` : `<div class="queue-empty">Aucun joueur</div>`}
      </div>
    `;
  }

  // ── MODE TEST (touche U) ─────────────────────────────────────

  function onKeyDown(e) {
    if (e.key.toLowerCase() !== 'u') return;
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    lastTimestamp = Date.now();
    render({
      isOpen:  true,
      entries: [
        { user: 'GamerPro99' },
        { user: 'FanAcharné' },
        { user: 'SubFidèle' },
        { user: 'NouveauJoueur' },
      ],
      timestamp: lastTimestamp,
    });
  }

  // ── UTILITAIRES ──────────────────────────────────────────────

  function esc(v) {
    if (v == null) return '';
    return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── INIT ─────────────────────────────────────────────────────

  function init(cfg = {}) {
    zone        = document.getElementById('zone-queue');
    maxVisible  = cfg.maxVisible || 8;
    poll();
    setInterval(poll, POLL_INTERVAL);
    document.addEventListener('keydown', onKeyDown);
  }

  return { init };

})();
