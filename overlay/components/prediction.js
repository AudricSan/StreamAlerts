'use strict';

/* ============================================================
   Composant : Prediction (Paris Twitch)
   Expose : window.Prediction  →  { init() }
   Zone    : #zone-prediction  |  Données : data/prediction.json
   Test    : touche P
   ============================================================ */

const _PREDICTION_COLORS = ['#3498DB', '#E91E8C'];

class PredictionComponent extends BaseComponent {
  constructor() {
    super({
      name:         'prediction',
      zoneId:       'zone-prediction',
      dataFile:     'prediction.json',
      pollInterval: 2000,
      testKey:      'p',
    });
    this._currentData = null;
    this._tickTimer   = null;
  }

  getTestData() {
    const ts = Date.now();
    return {
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
  }

  onData(data) {
    this._currentData = data;
    if (data.active) {
      this._render(data);
      this._startTick();
    } else {
      this._hide();
    }
  }

  _render(data) {
    const total  = (data.options || []).reduce((s, o) => s + (o.points || 0), 0);
    const locked = data.lockedAt && data.lockedAt <= Date.now();

    this.zone.innerHTML = `
      <div class="prediction-card${locked ? ' prediction-locked' : ''}">
        <div class="prediction-header">
          <span class="prediction-label">${locked ? '🔒 VERROUILLÉ' : 'PARI EN COURS'}</span>
          <span class="prediction-points">${this._fmtPts(total)} pts</span>
        </div>
        <div class="prediction-title">${esc(data.title || '')}</div>
        <div class="prediction-options">
          ${(data.options || []).slice(0, 2).map((o, i) => {
            const pct   = total > 0 ? Math.round((o.points / total) * 100) : 50;
            const color = _PREDICTION_COLORS[i] ?? _PREDICTION_COLORS[0];
            return `
              <div class="prediction-opt" style="--opt-color:${color}">
                <div class="prediction-opt-name">${esc(o.title)}</div>
                <div class="prediction-opt-bar-track">
                  <div class="prediction-opt-bar-fill" style="width:${pct}%"></div>
                  <div class="prediction-opt-stats">
                    <span class="prediction-opt-pct">${pct}%</span>
                    <span class="prediction-opt-pts">${this._fmtPts(o.points)} pts</span>
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
    this._tick();
  }

  _startTick() {
    this._stopTick();
    this._tickTimer = setInterval(() => this._tick(), 200);
  }

  _stopTick() {
    if (this._tickTimer) { clearInterval(this._tickTimer); this._tickTimer = null; }
  }

  _tick() {
    if (!this._currentData) return;
    const fill = document.getElementById('prediction-timer-fill');
    if (!fill) return;

    if (!this._currentData.endsAt) { fill.style.width = '100%'; return; }
    const remaining = Math.max(0, this._currentData.endsAt - Date.now());
    const duration  = this._currentData.endsAt - (this._currentData.startedAt || (this._currentData.endsAt - 120000));
    fill.style.width = (duration > 0 ? Math.round((remaining / duration) * 100) : 0) + '%';
  }

  _fmtPts(n) {
    if (!n) return '0';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return String(n);
  }

  _hide() {
    this._stopTick();
    this.clear();
    this._currentData = null;
  }
}

window.Prediction = new PredictionComponent();
