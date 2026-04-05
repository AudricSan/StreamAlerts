'use strict';

/* ============================================================
   components/leaderboard.js — Classement
   Expose : window.Leaderboard  (étend BaseComponent)
   Zone   : #zone-leaderboard   Données : data/leaderboard.json
   Test   : touche B
   ============================================================ */

class LeaderboardComponent extends BaseComponent {
  constructor() {
    super({
      name:         'leaderboard',
      zoneId:       'zone-leaderboard',
      dataFile:     'leaderboard.json',
      pollInterval: 5000,
      testKey:      'b',
    });
    this._maxEntries = 5;
  }

  test() {
    this.onData({
      title: 'Top Bits',
      entries: [
        { user: 'BigSpender', score: 12500 },
        { user: 'FanFidèle',  score: 7300  },
        { user: 'NiceGuy',    score: 4100  },
        { user: 'Supporter',  score: 2800  },
        { user: 'NewComer',   score: 950   },
      ],
      timestamp: Date.now(),
    });
  }

  onData(data) {
    if (!data || !data.timestamp || !data.entries || data.entries.length === 0) {
      this.clear();
      return;
    }

    var entries = data.entries.slice(0, this._maxEntries);
    var medals  = ['\uD83E\uDD47', '\uD83E\uDD48', '\uD83E\uDD49']; // 🥇🥈🥉

    var listHtml = '';
    for (var i = 0; i < entries.length; i++) {
      var e       = entries[i];
      var rank    = i < medals.length ? medals[i] : String(i + 1);
      var firstCls = i === 0 ? ' leaderboard-first' : '';
      listHtml +=
        '<div class="leaderboard-entry' + firstCls + '">' +
          '<span class="leaderboard-rank">'  + rank                       + '</span>' +
          '<span class="leaderboard-user">'  + esc(e.user)                + '</span>' +
          '<span class="leaderboard-score">' + this._fmtScore(e.score)    + '</span>' +
        '</div>';
    }

    this.zone.innerHTML =
      '<div class="leaderboard-card">' +
        '<div class="leaderboard-header">' +
          '<span class="leaderboard-title">' + esc(data.title || 'CLASSEMENT') + '</span>' +
        '</div>' +
        '<div class="leaderboard-list">' + listHtml + '</div>' +
      '</div>';
  }

  _fmtScore(n) {
    if (n == null || (n !== 0 && !n)) return '\u2014';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return String(n);
  }
}

window.Leaderboard = new LeaderboardComponent();
