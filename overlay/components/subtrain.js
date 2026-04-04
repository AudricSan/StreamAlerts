'use strict';

/* ============================================================
   Composant : Sub Train
   Expose : window.SubTrain  →  { init() }
   Zone    : #zone-subtrain  |  Données : data/subtrain.json
   Test    : touche S
   ============================================================ */

class SubTrainComponent extends BaseComponent {
  constructor() {
    super({
      name:         'subtrain',
      zoneId:       'zone-subtrain',
      dataFile:     'subtrain.json',
      pollInterval: 500,
      testKey:      's',
    });
    this._duration    = 60; // secondes (surchargé par config)
    this._currentData = null;
    this._tickTimer   = null;
  }

  setup(cfg) {
    if (cfg.duration != null) this._duration = cfg.duration;
  }

  getTestData() {
    const ts = Date.now();
    return { count: 7, active: true, lastUser: 'SuperFan', expiresAt: ts + this._duration * 1000, timestamp: ts };
  }

  onData(data) {
    this._currentData = data;
    if (data.active && data.expiresAt > Date.now()) {
      this._render(data);
    } else {
      this._hide();
    }
  }

  _render(data) {
    this.zone.innerHTML = `
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
    this._startTick();
  }

  _startTick() {
    this._stopTick();
    this._tickTimer = setInterval(() => this._tick(), 80);
  }

  _stopTick() {
    if (this._tickTimer) { clearInterval(this._tickTimer); this._tickTimer = null; }
  }

  _tick() {
    if (!this._currentData) return;
    const fill = this.zone.querySelector('#subtrain-fill');
    if (!fill) { this._stopTick(); return; }

    const remaining = Math.max(0, this._currentData.expiresAt - Date.now());
    fill.style.width = Math.round((remaining / (this._duration * 1000)) * 100) + '%';

    if (remaining <= 0) this._hide();
  }

  _hide() {
    this._stopTick();
    this.clear();
    this._currentData = null;
  }
}

window.SubTrain = new SubTrainComponent();
