'use strict';

/* ============================================================
   components/session.js — Statistiques de session
   Expose : window.Session  (étend BaseComponent)
   Zone   : #zone-session   Données : data/session.json
   Test   : touche E
   ============================================================ */

var _SESSION_STATS = [
  { icon: '\u2665', label: 'Follows',   key: 'follows'   },
  { icon: '\u2B50', label: 'Subs',      key: 'subs'      },
  { icon: '\uD83D\uDC8E', label: 'Bits', key: 'bits'     },
  { icon: '\u2694\uFE0F', label: 'Raids', key: 'raids'   },
  { icon: '\uD83D\uDCB0', label: 'Dons', key: 'donations'},
];

class SessionComponent extends BaseComponent {
  constructor() {
    super({
      name:         'session',
      zoneId:       'zone-session',
      dataFile:     'session.json',
      pollInterval: 3000,
      testKey:      'e',
    });
  }

  test() {
    this.onData({ follows: 12, subs: 5, bits: 750, raids: 2, donations: 3, timestamp: Date.now() });
  }

  onData(data) {
    if (!data || !data.timestamp) { this.clear(); return; }

    // Afficher toujours follows et subs, les autres uniquement si > 0
    var visible = [];
    for (var i = 0; i < _SESSION_STATS.length; i++) {
      var s = _SESSION_STATS[i];
      var val = data[s.key] != null ? data[s.key] : 0;
      if (val > 0 || s.key === 'follows' || s.key === 'subs') {
        visible.push({ stat: s, value: val });
      }
    }

    var gridHtml = '';
    for (var j = 0; j < visible.length; j++) {
      var item = visible[j];
      gridHtml +=
        '<div class="session-stat">' +
          '<span class="session-stat-icon">'  + item.stat.icon  + '</span>' +
          '<span class="session-stat-value">' + esc(item.value) + '</span>' +
          '<span class="session-stat-name">'  + item.stat.label + '</span>' +
        '</div>';
    }

    this.zone.innerHTML =
      '<div class="session-card">' +
        '<div class="session-accent"></div>' +
        '<div class="session-inner">' +
          '<div class="session-label">SESSION</div>' +
          '<div class="session-grid">' + gridHtml + '</div>' +
        '</div>' +
      '</div>';
  }
}

window.Session = new SessionComponent();
