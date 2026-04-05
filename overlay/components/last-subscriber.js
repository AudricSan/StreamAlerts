'use strict';

/* ============================================================
   components/last-subscriber.js — Dernier Sub
   Expose : window.LastSubscriber  (étend BaseComponent)
   Zone   : #zone-last-subscriber  Données : data/last_subscriber.json
   Test   : touche L  (partagée avec LastFollower)
   ============================================================ */

class LastSubscriberComponent extends BaseComponent {
  constructor() {
    super({
      name:         'lastSubscriber',
      zoneId:       'zone-last-subscriber',
      dataFile:     'last_subscriber.json',
      pollInterval: 2000,
      testKey:      'l',
    });
  }

  test() {
    this.onData({ user: 'SuperFan', avatar: '', tier: 'Tier 1', months: 0, timestamp: Date.now() });
  }

  onData(data) {
    if (!data || !data.user) { this.clear(); return; }

    var subLine   = this._buildSubLine(data);
    var avatarHtml = data.avatar
      ? '<img class="last-event-avatar" src="' + esc(data.avatar) + '" alt="" onerror="this.style.display=\'none\'">'
      : '';
    var subHtml = subLine
      ? '<div class="last-event-sub">' + esc(subLine) + '</div>'
      : '';

    this.zone.innerHTML =
      '<div class="last-event-card" style="--le-color:#F1C40F;--le-color-rgb:241,196,15;">' +
        '<div class="last-event-accent"></div>' +
        '<div class="last-event-inner">' +
          avatarHtml +
          '<div class="last-event-text">' +
            '<div class="last-event-label">' + labelFor('lastSub').toUpperCase() + '</div>' +
            '<div class="last-event-username">' + esc(data.user || 'Anonyme') + '</div>' +
            subHtml +
          '</div>' +
        '</div>' +
      '</div>';
  }

  _buildSubLine(data) {
    var parts = [];
    if (data.tier)   parts.push(data.tier);
    if (data.months) parts.push(data.months + ' mois');
    return parts.length > 0 ? parts.join(' \u2014 ') : null;
  }
}

window.LastSubscriber = new LastSubscriberComponent();
