'use strict';

/* ============================================================
   Composant : Countdown / Compte à rebours
   Expose : window.Countdown  →  { init() }
   Zone    : #zone-countdown  |  Données : data/countdown.json
   Test    : touche D
   ============================================================ */

class CountdownComponent extends BaseComponent {
  constructor() {
    super({
      name:         'countdown',
      zoneId:       'zone-countdown',
      dataFile:     'countdown.json',
      pollInterval: 2000,
      testKey:      'd',
    });
    this._currentData = null;
    this._tickTimer   = null;
  }

  getTestData() {
    const ts = Date.now();
    return { label: 'Début du jeu', active: true, startedAt: ts, endsAt: ts + 300000, timestamp: ts };
  }

  onData(data) {
    this._currentData = data;
    if (data.active && data.endsAt > Date.now()) {
      this._renderShell(data);
      this._startTick();
    } else {
      this._hide();
    }
  }

  _renderShell(data) {
    if (this.zone.querySelector('.countdown-card')) return;
    this.zone.innerHTML = `
      <div class="countdown-card">
        <div class="countdown-accent"></div>
        <div class="countdown-inner">
          <div class="countdown-label">${esc(data.label || 'COMPTE À REBOURS')}</div>
          <div class="countdown-value" id="countdown-value">--:--</div>
          <div class="countdown-bar-track">
            <div class="countdown-bar-fill" id="countdown-fill"></div>
          </div>
        </div>
      </div>
    `;
  }

  _startTick() {
    this._stopTick();
    this._tick();
    this._tickTimer = setInterval(() => this._tick(), 200);
  }

  _stopTick() {
    if (this._tickTimer) { clearInterval(this._tickTimer); this._tickTimer = null; }
  }

  _tick() {
    if (!this._currentData) return;
    const el   = this.zone.querySelector('#countdown-value');
    const fill = this.zone.querySelector('#countdown-fill');
    if (!el) { this._stopTick(); return; }

    const remaining = Math.max(0, this._currentData.endsAt - Date.now());
    if (remaining <= 0) { this._hide(); return; }

    el.textContent = formatCountdown(remaining);

    if (fill && this._currentData.startedAt) {
      const total = this._currentData.endsAt - this._currentData.startedAt;
      fill.style.width = (total > 0 ? Math.round((remaining / total) * 100) : 100) + '%';
    }
  }

  _hide() {
    this._stopTick();
    this.clear();
    this._currentData = null;
  }
}

window.Countdown = new CountdownComponent();
