'use strict';

/* ============================================================
   Composant : Hype Train (persistant pendant tout le train)
   Expose : window.HypeTrain  →  { init() }
   Zone    : #zone-hypetrain  |  Données : data/hypetrain.json
   Test    : touche H
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

  getTestData() {
    const ts = Date.now();
    return {
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
    };
  }

  onData(data) {
    this._currentData = data;
    if (data.active && data.endsAt > Date.now()) {
      this._render(data);
    } else {
      this._hide();
    }
  }

  _render(data) {
    const pct      = Math.min(100, Math.max(0, Math.round((data.progress / (data.goal || 100)) * 100)));
    const topUsers = (data.contributors || []).slice(0, 3).map(c => esc(c.user)).join(' · ');

    this.zone.innerHTML = `
      <div class="hypetrain-card">
        <div class="hypetrain-accent"></div>
        <div class="hypetrain-inner">
          <span class="hypetrain-icon" aria-hidden="true">🚂</span>
          <div class="hypetrain-text">
            <div class="hypetrain-label">HYPE TRAIN</div>
            <div class="hypetrain-level">Niveau ${data.level || 1}</div>
            ${topUsers ? `<div class="hypetrain-top">${topUsers}</div>` : ''}
          </div>
          <div class="hypetrain-pct">${pct}%</div>
        </div>
        <div class="hypetrain-progress-track">
          <div class="hypetrain-progress-fill" style="width:${pct}%"></div>
        </div>
        <div class="hypetrain-timer-track">
          <div class="hypetrain-timer-fill" id="hypetrain-timer-fill"></div>
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
    const fill = this.zone.querySelector('#hypetrain-timer-fill');
    if (!fill) { this._stopTick(); return; }

    const remaining = Math.max(0, this._currentData.endsAt - Date.now());
    const total     = this._currentData.duration
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
