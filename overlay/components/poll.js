'use strict';

/* ============================================================
   components/poll.js — Sondage Twitch
   Expose : window.Poll  (étend BaseComponent)
   Zone   : #zone-poll   Données : data/poll.json
   Test   : touche O
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

  test() {
    var ts = Date.now();
    this.onData({
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
    var choices = data.choices || [];
    var total   = 0;
    for (var i = 0; i < choices.length; i++) {
      total += choices[i].votes || 0;
    }

    var votesLabel = total + ' vote' + (total !== 1 ? 's' : '');

    var choicesHtml = '';
    for (var j = 0; j < choices.length; j++) {
      var c   = choices[j];
      var pct = total > 0 ? Math.round(((c.votes || 0) / total) * 100) : 0;
      choicesHtml +=
        '<div class="poll-choice">' +
          '<div class="poll-choice-bar-track">' +
            '<div class="poll-choice-bar-fill" style="width:' + pct + '%"></div>' +
            '<div class="poll-choice-info">' +
              '<span class="poll-choice-title">' + esc(c.title) + '</span>' +
              '<span class="poll-choice-pct">'   + pct + '%</span>' +
            '</div>' +
          '</div>' +
        '</div>';
    }

    this.zone.innerHTML =
      '<div class="poll-card">' +
        '<div class="poll-header">' +
          '<span class="poll-label">SONDAGE</span>' +
          '<span class="poll-votes">' + votesLabel + '</span>' +
        '</div>' +
        '<div class="poll-title">'   + esc(data.title || '') + '</div>' +
        '<div class="poll-choices">' + choicesHtml           + '</div>' +
        '<div class="poll-timer-track">' +
          '<div class="poll-timer-fill" id="poll-timer-fill"></div>' +
        '</div>' +
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
    var fill = this.zone.querySelector('#poll-timer-fill');
    if (!fill) return;

    if (!this._currentData.endsAt) { fill.style.width = '100%'; return; }

    var remaining = Math.max(0, this._currentData.endsAt - Date.now());
    var duration  = this._currentData.endsAt - (this._currentData.startedAt || (this._currentData.endsAt - 120000));
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
