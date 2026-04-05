'use strict';

/* ============================================================
   components/last-follower.js — Dernier Follow
   Expose : window.LastFollower  (étend BaseComponent)
   Zone   : #zone-last-follower  Données : data/last_follower.json
   Test   : touche L
   ============================================================ */

class LastFollowerComponent extends BaseComponent {
  constructor() {
    super({
      name:         'lastFollower',
      zoneId:       'zone-last-follower',
      dataFile:     'last_follower.json',
      pollInterval: 2000,
      testKey:      'l',
    });
  }

  test() {
    this.onData({ user: 'NouvelAbonné42', avatar: '', timestamp: Date.now() });
  }

  onData(data) {
    if (!data || !data.user) { this.clear(); return; }

    var avatarHtml = data.avatar
      ? '<img class="last-event-avatar" src="' + esc(data.avatar) + '" alt="" onerror="this.style.display=\'none\'">'
      : '';

    this.zone.innerHTML =
      '<div class="last-event-card" style="--le-color:#9B59B6;--le-color-rgb:155,89,182;">' +
        '<div class="last-event-accent"></div>' +
        '<div class="last-event-inner">' +
          avatarHtml +
          '<div class="last-event-text">' +
            '<div class="last-event-label">' + labelFor('lastFollow').toUpperCase() + '</div>' +
            '<div class="last-event-username">' + esc(data.user || 'Anonyme') + '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }
}

window.LastFollower = new LastFollowerComponent();
