'use strict';

/* ============================================================
   components/subtrain.js — Sub Train
   Expose : window.SubTrain  (étend BaseComponent)
   Zone   : #zone-subtrain   Données : data/subtrain.json
   Test   : touche S
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
    this._duration    = 60;
    this._currentData = null;
    this._tickTimer   = null;
  }

  setup(cfg) {
    if (cfg.duration != null) this._duration = cfg.duration;
  }

  test() {
    var ts = Date.now();
    this.onData({ count: 7, active: true, lastUser: 'SuperFan', expiresAt: ts + this._duration * 1000, timestamp: ts });
  }

  onData(data) {
    if (!data) return;
    this._currentData = data;
    if (data.active && data.expiresAt > Date.now()) {
      this._render(data);
    } else {
      this._hide();
    }
  }

  _render(data) {
    var lastUserHtml = data.lastUser
      ? '<div class="subtrain-last">' + esc(data.lastUser) + '</div>'
      : '';

    this.zone.innerHTML =
      '<div class="subtrain-card">' +
        '<div class="subtrain-accent"></div>' +
        '<div class="subtrain-inner">' +
          '<span class="subtrain-icon" aria-hidden="true">\uD83D\uDE82</span>' +
          '<div class="subtrain-text">' +
            '<div class="subtrain-label">SUB TRAIN</div>' +
            '<div class="subtrain-count">\u00D7' + (data.count || 0) + '</div>' +
          '</div>' +
          lastUserHtml +
        '</div>' +
        '<div class="subtrain-bar-track">' +
          '<div class="subtrain-bar-fill" id="subtrain-fill"></div>' +
        '</div>' +
      '</div>';

    this._startTick();
  }

  _startTick() {
    var self = this;
    this._stopTick();
    this._tickTimer = setInterval(function() { self._tick(); }, 80);
  }

  _stopTick() {
    if (this._tickTimer) { clearInterval(this._tickTimer); this._tickTimer = null; }
  }

  _tick() {
    if (!this._currentData) return;
    var fill = this.zone.querySelector('#subtrain-fill');
    if (!fill) { this._stopTick(); return; }

    var remaining = Math.max(0, this._currentData.expiresAt - Date.now());
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
