'use strict';

/* ============================================================
   components/prediction.js — Prédiction Twitch
   Expose : window.Prediction  (étend BaseComponent)
   Zone   : #zone-prediction   Données : data/prediction.json
   Test   : touche P
   ============================================================ */

var _PREDICTION_COLORS = ['#3498DB', '#E91E8C'];

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

  test() {
    var ts = Date.now();
    this.onData({
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
    });
  }

  onData(data) {
    if (!data) return;
    this._currentData = data;
    if (data.active) {
      this._render(data);
      this._startTick();
    } else {
      this._hide();
    }
  }

  _render(data) {
    var options = (data.options || []).slice(0, 2);
    var total   = 0;
    for (var i = 0; i < options.length; i++) {
      total += options[i].points || 0;
    }

    var locked     = !!(data.lockedAt && data.lockedAt <= Date.now());
    var lockedCls  = locked ? ' prediction-locked' : '';
    var lockedLabel = locked ? '\uD83D\uDD12 VERROUILL\u00C9' : 'PARI EN COURS';

    var optsHtml = '';
    for (var j = 0; j < options.length; j++) {
      var o     = options[j];
      var pct   = total > 0 ? Math.round(((o.points || 0) / total) * 100) : 50;
      var color = _PREDICTION_COLORS[j] || _PREDICTION_COLORS[0];
      optsHtml +=
        '<div class="prediction-opt" style="--opt-color:' + color + '">' +
          '<div class="prediction-opt-name">' + esc(o.title) + '</div>' +
          '<div class="prediction-opt-bar-track">' +
            '<div class="prediction-opt-bar-fill" style="width:' + pct + '%"></div>' +
            '<div class="prediction-opt-stats">' +
              '<span class="prediction-opt-pct">' + pct + '%</span>' +
              '<span class="prediction-opt-pts">' + this._fmtPts(o.points) + ' pts</span>' +
            '</div>' +
          '</div>' +
        '</div>';
    }

    var timerHtml = !locked && data.endsAt
      ? '<div class="prediction-timer-track">' +
          '<div class="prediction-timer-fill" id="prediction-timer-fill"></div>' +
        '</div>'
      : '';

    this.zone.innerHTML =
      '<div class="prediction-card' + lockedCls + '">' +
        '<div class="prediction-header">' +
          '<span class="prediction-label">'  + lockedLabel                    + '</span>' +
          '<span class="prediction-points">' + this._fmtPts(total) + ' pts</span>' +
        '</div>' +
        '<div class="prediction-title">'   + esc(data.title || '') + '</div>' +
        '<div class="prediction-options">' + optsHtml              + '</div>' +
        timerHtml +
      '</div>';

    this._tick();
  }

  _startTick() {
    var self = this;
    this._stopTick();
    this._tickTimer = setInterval(function() { self._tick(); }, 200);
  }

  _stopTick() {
    if (this._tickTimer) { clearInterval(this._tickTimer); this._tickTimer = null; }
  }

  _tick() {
    if (!this._currentData) return;
    var fill = this.zone.querySelector('#prediction-timer-fill');
    if (!fill) return;

    if (!this._currentData.endsAt) { fill.style.width = '100%'; return; }
    var remaining = Math.max(0, this._currentData.endsAt - Date.now());
    var duration  = this._currentData.endsAt - (this._currentData.startedAt || (this._currentData.endsAt - 120000));
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
