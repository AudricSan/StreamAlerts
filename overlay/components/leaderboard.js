'use strict';

/* ============================================================
   Composant : Leaderboard
   Expose : window.Leaderboard  →  { init() }
   Zone    : #zone-leaderboard  |  Données : data/leaderboard.json
   Test    : touche B
   ============================================================ */

class LeaderboardComponent extends BaseComponent {
  constructor() {
    super({
      name:         'leaderboard',
      zoneId:       'zone-leaderboard',
      dataFile:     'leaderboard.json',
      pollInterval: 5000,
      testKey:      'b',
      testData: [{
        title: 'Top Bits',
        entries: [
          { user: 'BigSpender', score: 12500 },
          { user: 'FanFidèle',  score: 7300  },
          { user: 'NiceGuy',    score: 4100  },
          { user: 'Supporter',  score: 2800  },
          { user: 'NewComer',   score: 950   },
        ],
        timestamp: 1,
      }],
    });
    this._maxEntries = 5;
  }

  onData(data) {
    if (!data.timestamp || !data.entries?.length) { this.clear(); return; }

    const entries = (data.entries || []).slice(0, this._maxEntries);
    const medals  = ['🥇', '🥈', '🥉'];

    this.zone.innerHTML = `
      <div class="leaderboard-card">
        <div class="leaderboard-header">
          <span class="leaderboard-title">${esc(data.title || 'CLASSEMENT')}</span>
        </div>
        <div class="leaderboard-list">
          ${entries.map((e, i) => `
            <div class="leaderboard-entry${i === 0 ? ' leaderboard-first' : ''}">
              <span class="leaderboard-rank">${medals[i] ?? (i + 1)}</span>
              <span class="leaderboard-user">${esc(e.user)}</span>
              <span class="leaderboard-score">${this._fmtScore(e.score)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  _fmtScore(n) {
    if (!n && n !== 0) return '—';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return String(n);
  }
}

window.Leaderboard = new LeaderboardComponent();
