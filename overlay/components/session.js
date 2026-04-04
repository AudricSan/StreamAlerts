'use strict';

/* ============================================================
   Composant : Session Stats
   Expose : window.Session  →  { init() }
   Zone    : #zone-session  |  Données : data/session.json
   Test    : touche E
   ============================================================ */

const _SESSION_STATS = [
  { icon: '♥',  label: 'Follows',   key: 'follows'   },
  { icon: '⭐', label: 'Subs',      key: 'subs'      },
  { icon: '💎', label: 'Bits',      key: 'bits'      },
  { icon: '⚔️', label: 'Raids',     key: 'raids'     },
  { icon: '💰', label: 'Dons',      key: 'donations' },
];

class SessionComponent extends BaseComponent {
  constructor() {
    super({
      name:         'session',
      zoneId:       'zone-session',
      dataFile:     'session.json',
      pollInterval: 3000,
      testKey:      'e',
      testData:     [{ follows: 12, subs: 5, bits: 750, raids: 2, donations: 3, timestamp: 1 }],
    });
  }

  onData(data) {
    if (!data.timestamp) { this.clear(); return; }

    const visible = _SESSION_STATS.filter(s =>
      (data[s.key] ?? 0) > 0 || s.key === 'follows' || s.key === 'subs'
    );

    this.zone.innerHTML = `
      <div class="session-card">
        <div class="session-accent"></div>
        <div class="session-inner">
          <div class="session-label">SESSION</div>
          <div class="session-grid">
            ${visible.map(s => `
              <div class="session-stat">
                <span class="session-stat-icon">${s.icon}</span>
                <span class="session-stat-value">${esc(data[s.key] ?? 0)}</span>
                <span class="session-stat-name">${s.label}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }
}

window.Session = new SessionComponent();
