'use strict';

/* ============================================================
   Composant : Poll (Sondage Twitch)
   Affiche le sondage actif avec les votes en temps réel.
   Barre de temps décroissante. Se masque automatiquement.

   Expose : window.Poll  →  { init() }
   Zone HTML  : #zone-poll
   Données    : data/poll.json
   Test       : touche O
   ============================================================ */

const Poll = (() => {

  const POLL_INTERVAL = 2000;
  const TICK_INTERVAL = 200;

  // ── ÉTAT ────────────────────────────────────────────────────

  let zone;
  let lastTimestamp = -1;
  let currentData   = null;
  let tickTimer     = null;

  // ── POLLING ─────────────────────────────────────────────────

  async function poll() {
    try {
      const res = await fetch(`data/poll.json?t=${Date.now()}`);
      if (!res.ok) return;
      const data = await res.json();
      if (!data || data.timestamp === lastTimestamp) return;
      lastTimestamp = data.timestamp;
      currentData   = data;

      if (data.active) {
        render(data);
        startTick();
      } else {
        hide();
      }
    } catch (_) {}
  }

  // ── RENDU ────────────────────────────────────────────────────

  function render(data) {
    const total = (data.choices || []).reduce((s, c) => s + (c.votes || 0), 0);

    zone.innerHTML = `
      <div class="poll-card">
        <div class="poll-header">
          <span class="poll-label">SONDAGE</span>
          <span class="poll-votes">${total} vote${total !== 1 ? 's' : ''}</span>
        </div>
        <div class="poll-title">${esc(data.title || '')}</div>
        <div class="poll-choices">
          ${(data.choices || []).map(c => {
            const pct = total > 0 ? Math.round((c.votes / total) * 100) : 0;
            return `
              <div class="poll-choice">
                <div class="poll-choice-bar-track">
                  <div class="poll-choice-bar-fill" style="width:${pct}%"></div>
                  <div class="poll-choice-info">
                    <span class="poll-choice-title">${esc(c.title)}</span>
                    <span class="poll-choice-pct">${pct}%</span>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        <div class="poll-timer-track">
          <div class="poll-timer-fill" id="poll-timer-fill"></div>
        </div>
      </div>
    `;
    tick();
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
    const fill = document.getElementById('poll-timer-fill');
    if (!fill) return;

    if (!currentData.endsAt) { fill.style.width = '100%'; return; }

    const remaining = Math.max(0, currentData.endsAt - Date.now());
    const duration  = currentData.endsAt - (currentData.startedAt || (currentData.endsAt - 120000));
    const pct       = duration > 0 ? Math.round((remaining / duration) * 100) : 0;
    fill.style.width = pct + '%';

    if (remaining <= 0 && currentData.active) {
      currentData.active = false;
      hide();
    }
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

  // ── MODE TEST (touche O) ─────────────────────────────────────

  function onKeyDown(e) {
    if (e.key.toLowerCase() !== 'o') return;
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    const ts = Date.now();
    currentData = {
      title:     'Quelle map on joue ?',
      active:    true,
      startedAt: ts,
      endsAt:    ts + 60000,
      choices: [
        { title: 'Dust 2',  votes: 45 },
        { title: 'Mirage',  votes: 30 },
        { title: 'Inferno', votes: 15 },
      ],
      timestamp: ts,
    };
    lastTimestamp = ts;
    render(currentData);
    startTick();
  }

  // ── INIT ─────────────────────────────────────────────────────

  function init(cfg = {}) {
    zone = document.getElementById('zone-poll');
    poll();
    setInterval(poll, POLL_INTERVAL);
    document.addEventListener('keydown', onKeyDown);
  }

  return { init };

})();
