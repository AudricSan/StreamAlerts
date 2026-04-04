'use strict';

/* ============================================================
   Composant : Dernier Follow
   Expose : window.LastFollower  →  { init() }
   Zone    : #zone-last-follower  |  Données : data/last_follower.json
   Test    : touche L  (partagée avec LastSubscriber)
   ============================================================ */

class LastFollowerComponent extends BaseComponent {
  constructor() {
    super({
      name:         'lastFollower',
      zoneId:       'zone-last-follower',
      dataFile:     'last_follower.json',
      pollInterval: 2000,
      testKey:      'l',
      testData:     [{ user: 'NouvelAbonné42', avatar: '', timestamp: 1 }],
    });
  }

  onData(data) {
    if (!data.user) { this.clear(); return; }
    this.zone.innerHTML = `
      <div class="last-event-card" style="--le-color:#9B59B6;--le-color-rgb:155,89,182;">
        <div class="last-event-accent"></div>
        <div class="last-event-inner">
          ${data.avatar ? `<img class="last-event-avatar" src="${esc(data.avatar)}" alt="" onerror="this.style.display='none'">` : ''}
          <div class="last-event-text">
            <div class="last-event-label">DERNIER FOLLOW</div>
            <div class="last-event-username">${esc(data.user || 'Anonyme')}</div>
          </div>
        </div>
      </div>
    `;
  }
}

window.LastFollower = new LastFollowerComponent();
