'use strict';

/* ============================================================
   components/viewers.js — Nombre de spectateurs
   Expose : window.ViewerCount  (étend BaseComponent)
   Zone   : #zone-viewers       Données : data/viewers.json
   Test   : touche V
   ============================================================ */

class ViewersComponent extends BaseComponent {
  constructor() {
    super({
      name:         'viewers',
      zoneId:       'zone-viewers',
      dataFile:     'viewers.json',
      pollInterval: 30000,
      testKey:      'v',
    });
  }

  test() {
    this.onData({ count: 142, timestamp: Date.now() });
  }

  onData(data) {
    if (!data || !data.timestamp) { this.clear(); return; }

    var count = data.count != null ? data.count : 0;

    this.zone.innerHTML =
      '<div class="viewers-card">' +
        '<div class="viewers-accent"></div>' +
        '<div class="viewers-inner">' +
          '<span class="viewers-icon" aria-hidden="true">\uD83D\uDC41</span>' +
          '<div class="viewers-text">' +
            '<div class="viewers-label">' + labelFor('viewers').toUpperCase() + '</div>' +
            '<div class="viewers-count">' + esc(count) + '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }
}

window.ViewerCount = new ViewersComponent();
