'use strict';

/* ============================================================
   Composant : Prediction (Paris Twitch)
   Affiche la prédiction active avec barres de points en temps réel.
   Deux options max (bleu vs rose), barre de temps décroissante.

   Expose : window.Prediction  →  { init() }
   Zone HTML  : #zone-prediction
   Données    : data/prediction.json
   Test       : touche P
   ============================================================ */

const Prediction = (() => {

  const POLL_INTERVAL = 2000;
  const TICK_INTERVAL = 200;

  const OPT_COLORS = ['#3498DB', '#E91E8C']; // bleu, rose

  // ── ÉTAT ────────────────────────────────────────────────────

  let zone;
  let lastTimestamp = -1;
  let currentData   = null;
  let tickTimer     = null;

  // ── POLLING ─────────────────────────────────────────────────

  async function poll() {
    try {
      const res = await fetch(`data/prediction.json?t=${Date.now()}`);
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
    const total  = (data.options || []).reduce((s, o) => s + (o.points || 0), 0);
    const locked = data.lockedAt && data.lockedAt <= Date.now();

    zone.innerHTML = `
      <div class="prediction-card${locked ? ' prediction-locked' : ''}">
        <div class="prediction-header">
          <span class="prediction-label">${locked ? '🔒 VERROUILLÉ' : 'PARI EN COURS'}</span>
          <span class="prediction-points">${fmtPts(total)} pts</span>
        </div>
        <div class="prediction-title">${esc(data.title || '')}</div>
        <div class="prediction-options">
          ${(data.options || []).slice(0, 2).map((o, i) => {
            const pct   = total > 0 ? Math.round((o.points / total) * 100) : 50;
            const color = OPT_COLORS[i] ?? OPT_COLORS[0];
            return `
              <div class="prediction-opt" style="--opt-color:${color}">
                <div class="prediction-opt-name">${esc(o.title)}</div>
                <div class="prediction-opt-bar-track">
                  <div class="prediction-opt-bar-fill" style="width:${pct}%"></div>
                  <div class="prediction-opt-stats">
                    <span class="prediction-opt-pct">${pct}%</span>
                    <span class="prediction-opt-pts">${fmtPts(o.points)} pts</span>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        ${!locked && data.endsAt ? `
          <div class="prediction-timer-track">
            <div class="prediction-timer-fill" id="prediction-timer-fill"></div>
          </div>
        ` : ''}
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
    const fill = document.getElementById('prediction-timer-fill');
    if (!fill) return;

    if (!currentData.endsAt) { fill.style.width = '100%'; return; }
    const remaining = Math.max(0, currentData.endsAt - Date.now());
    const duration  = currentData.endsAt - (currentData.startedAt || (currentData.endsAt - 120000));
    const pct       = duration > 0 ? Math.round((remaining / duration) * 100) : 0;
    fill.style.width = pct + '%';
  }

  function hide() {
    stopTick();
    zone.innerHTML = '';
    currentData = null;
  }

  // ── UTILITAIRES ──────────────────────────────────────────────

  function fmtPts(n) {
    if (!n) return '0';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return String(n);
  }

  function esc(v) {
    if (v == null) return '';
    return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ── MODE TEST (touche P) ─────────────────────────────────────

  function onKeyDown(e) {
    if (e.key.toLowerCase() !== 'p') return;
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    const ts = Date.now();
    currentData = {
      title:     'On gagne ce round ?',
      active:    true,
      startedAt: ts,
      endsAt:    ts + 90000,
      lockedAt:  0,
      options: [
        { title: 'Oui !',  points: 15000 },
        { title: 'Non...', points: 8000  },
      ],
      timestamp: ts,
    };
    lastTimestamp = ts;
    render(currentData);
    startTick();
  }

  // ── INIT ─────────────────────────────────────────────────────

  function init(cfg = {}) {
    zone = document.getElementById('zone-prediction');
    poll();
    setInterval(poll, POLL_INTERVAL);
    document.addEventListener('keydown', onKeyDown);
  }

  return { init };

})();
