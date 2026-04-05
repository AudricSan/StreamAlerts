'use strict';

/* ============================================================
   components/uptime.js — Durée du stream
   Expose : window.Uptime  (étend BaseComponent)
   Zone   : #zone-uptime   Données : data/uptime.json
   Test   : touche I
   ============================================================ */

class UptimeComponent extends BaseComponent {
  constructor() {
    super({
      name:         'uptime',
      zoneId:       'zone-uptime',
      dataFile:     'uptime.json',
      pollInterval: 60000,
      testKey:      'i',
    });
    this._startedAt = 0;
    this._tickTimer = null;
  }

  test() {
    this.onData({ startedAt: Date.now() - 9240000, timestamp: Date.now() }); // ~2h34m
  }

  onData(data) {
    if (!data) return;
    this._startedAt = data.startedAt || 0;
    if (!this._startedAt) {
      this._stopTick();
      this.clear();
      return;
    }
    this._renderShell();
    this._renderTime();
    this._startTick();
  }

  _renderShell() {
    if (this.zone.querySelector('.uptime-card')) return;
    this.zone.innerHTML =
      '<div class="uptime-card">' +
        '<div class="uptime-accent"></div>' +
        '<div class="uptime-inner">' +
          '<span class="uptime-icon" aria-hidden="true">\u23F0</span>' +
          '<div class="uptime-text">' +
            '<div class="uptime-label">EN DIRECT</div>' +
            '<div class="uptime-value" id="uptime-value">0m 00s</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  _renderTime() {
    var el = this.zone.querySelector('#uptime-value');
    if (!el || !this._startedAt) return;
    el.textContent = formatUptime(Date.now() - this._startedAt);
  }

  _startTick() {
    var self = this;
    this._stopTick();
    this._tickTimer = setInterval(function() { self._renderTime(); }, 1000);
  }

  _stopTick() {
    if (this._tickTimer) { clearInterval(this._tickTimer); this._tickTimer = null; }
  }
}

window.Uptime = new UptimeComponent();
