'use strict';

/* ============================================================
   Composant : Viewer Count
   Expose : window.ViewerCount  →  { init() }
   Zone    : #zone-viewers  |  Données : data/viewers.json
   Test    : touche V
   ============================================================ */

class ViewersComponent extends BaseComponent {
  constructor() {
    super({
      name:         'viewers',
      zoneId:       'zone-viewers',
      dataFile:     'viewers.json',
      pollInterval: 30000,
      testKey:      'v',
      testData:     [{ count: 142, timestamp: 1 }],
    });
  }

  onData(data) {
    if (!data.timestamp) { this.clear(); return; }
    this.zone.innerHTML = `
      <div class="viewers-card">
        <div class="viewers-accent"></div>
        <div class="viewers-inner">
          <span class="viewers-icon" aria-hidden="true">👁</span>
          <div class="viewers-text">
            <div class="viewers-label">SPECTATEURS</div>
            <div class="viewers-count">${data.count ?? 0}</div>
          </div>
        </div>
      </div>
    `;
  }
}

window.ViewerCount = new ViewersComponent();
