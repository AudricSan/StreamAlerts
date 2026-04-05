'use strict';

/* ============================================================
   components/hypetrain.js — Hype Train
   Expose : window.HypeTrain  (étend BaseComponent)
   Zone   : #zone-hypetrain   Données : data/hypetrain.json
   Test   : touche H
   ============================================================ */

class HypeTrainComponent extends BaseComponent {
  constructor() {
    super({
      name:         'hypetrain',
      zoneId:       'zone-hypetrain',
      dataFile:     'hypetrain.json',
      pollInterval: 1000,
      testKey:      'h',
    });
    this._currentData = null;
    this._tickTimer   = null;
  }

  test() {
    var ts = Date.now();
    this.onData({
      level:        2,
      progress:     68,
      goal:         100,
      active:       true,
      startedAt:    ts - 120000,
      endsAt:       ts + 180000,
      duration:     300,
      contributors: [
        { user: 'TopFan',    amount: 500 },
        { user: 'SubLord',   amount: 300 },
        { user: 'Hype4ever', amount: 200 },
      ],
      timestamp: ts,
    });
  }

  onData(data) {
    if (!data) return;
    this._currentData = data;
    if (data.active && data.endsAt > Date.now()) {
      this._render(data);
    } else {
      this._hide();
    }
  }

  _render(data) {
    var pct  = Math.min(100, Math.max(0, Math.round(((data.progress || 0) / (data.goal || 100)) * 100)));
    var contributors = data.contributors || [];
    var topParts = [];
    for (var i = 0; i < Math.min(3, contributors.length); i++) {
      topParts.push(esc(contributors[i].user));
    }
    var topHtml = topParts.length > 0
      ? '<div class="hypetrain-top">' + topParts.join(' \u00B7 ') + '</div>'
      : '';

    this.zone.innerHTML =
      '<div class="hypetrain-card">' +
        '<div class="hypetrain-accent"></div>' +
        '<div class="hypetrain-inner">' +
          '<span class="hypetrain-icon" aria-hidden="true">\uD83D\uDE82</span>' +
          '<div class="hypetrain-text">' +
            '<div class="hypetrain-label">HYPE TRAIN</div>' +
            '<div class="hypetrain-level">Niveau ' + (data.level || 1) + '</div>' +
            topHtml +
          '</div>' +
          '<div class="hypetrain-pct">' + pct + '%</div>' +
        '</div>' +
        '<div class="hypetrain-progress-track">' +
          '<div class="hypetrain-progress-fill" style="width:' + pct + '%"></div>' +
        '</div>' +
        '<div class="hypetrain-timer-track">' +
          '<div class="hypetrain-timer-fill" id="hypetrain-timer-fill"></div>' +
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
    var fill = this.zone.querySelector('#hypetrain-timer-fill');
    if (!fill) { this._stopTick(); return; }

    var remaining = Math.max(0, this._currentData.endsAt - Date.now());
    var total = this._currentData.duration
      ? this._currentData.duration * 1000
      : (this._currentData.endsAt - (this._currentData.startedAt || this._currentData.endsAt - 300000));

    fill.style.width = (total > 0 ? Math.round((remaining / total) * 100) : 0) + '%';

    if (remaining <= 0) this._hide();
  }

  _hide() {
    this._stopTick();
    this.clear();
    this._currentData = null;
  }
}

window.HypeTrain = new HypeTrainComponent();
