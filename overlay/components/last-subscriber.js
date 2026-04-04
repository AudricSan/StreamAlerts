'use strict';

/* ============================================================
   Composant : Dernier Sub
   Expose : window.LastSubscriber  →  { init() }
   Zone    : #zone-last-subscriber  |  Données : data/last_subscriber.json
   Test    : touche L  (partagée avec LastFollower)
   ============================================================ */

class LastSubscriberComponent extends BaseComponent {
  constructor() {
    super({
      name:         'lastSubscriber',
      zoneId:       'zone-last-subscriber',
      dataFile:     'last_subscriber.json',
      pollInterval: 2000,
      testKey:      'l',
      testData:     [{ user: 'SuperFan', avatar: '', tier: 'Tier 1', months: 0, timestamp: 1 }],
    });
  }

  onData(data) {
    if (!data.user) { this.clear(); return; }
    const subLine = this._buildSubLine(data);
    this.zone.innerHTML = `
      <div class="last-event-card" style="--le-color:#F1C40F;--le-color-rgb:241,196,15;">
        <div class="last-event-accent"></div>
        <div class="last-event-inner">
          ${data.avatar ? `<img class="last-event-avatar" src="${esc(data.avatar)}" alt="" onerror="this.style.display='none'">` : ''}
          <div class="last-event-text">
            <div class="last-event-label">DERNIER SUB</div>
            <div class="last-event-username">${esc(data.user || 'Anonyme')}</div>
            ${subLine ? `<div class="last-event-sub">${esc(subLine)}</div>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  _buildSubLine(data) {
    const parts = [];
    if (data.tier)   parts.push(data.tier);
    if (data.months) parts.push(`${data.months} mois`);
    return parts.join(' — ') || null;
  }
}

window.LastSubscriber = new LastSubscriberComponent();
