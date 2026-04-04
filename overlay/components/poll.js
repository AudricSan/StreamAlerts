'use strict';

/* ============================================================
   Composant : Poll (Sondage Twitch)
   Expose : window.Poll  →  { init() }
   Zone    : #zone-poll  |  Données : data/poll.json
   Test    : touche O
   ============================================================ */

class PollComponent extends BaseComponent {
  constructor() {
    super({
      name:         'poll',
      zoneId:       'zone-poll',
      dataFile:     'poll.json',
      pollInterval: 2000,
      testKey:      'o',
    });
    this._currentData = null;
    this._tickTimer   = null;
  }

  getTestData() {
    const ts = Date.now();
    return {
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
    const total = (data.choices || []).reduce((s, c) => s + (c.votes || 0), 0);

    this.zone.innerHTML = `
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
    this._tick(); // mise à jour immédiate de la barre de temps
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
    const fill = document.getElementById('poll-timer-fill');
    if (!fill) return;

    if (!this._currentData.endsAt) { fill.style.width = '100%'; return; }

    const remaining = Math.max(0, this._currentData.endsAt - Date.now());
    const duration  = this._currentData.endsAt - (this._currentData.startedAt || (this._currentData.endsAt - 120000));
    fill.style.width = (duration > 0 ? Math.round((remaining / duration) * 100) : 0) + '%';

    if (remaining <= 0 && this._currentData.active) {
      this._currentData.active = false;
      this._hide();
    }
  }

  _hide() {
    this._stopTick();
    this.clear();
    this._currentData = null;
  }
}

window.Poll = new PollComponent();
