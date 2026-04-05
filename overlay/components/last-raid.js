'use strict';

/* ============================================================
   components/last-raid.js — Dernier Raid
   Expose : window.LastRaid  (étend BaseComponent)
   Zone   : #zone-last-raid  Données : data/last_raid.json
   Test   : touche R

   JSON attendu :
     {
       "user":      "NomDeLaChaine",
       "viewers":   250,
       "avatar":    "https://...",
       "timestamp": 1710000000000
     }
   ============================================================ */

function _isSafeUrl(url) {
  return typeof url === 'string' && /^https?:\/\//i.test(url);
}

class LastRaidComponent extends BaseComponent {
  constructor() {
    super({
      name:         'lastRaid',
      zoneId:       'zone-last-raid',
      dataFile:     'last_raid.json',
      pollInterval: 2000,
      testKey:      'r',
    });
  }

  test() {
    this.onData({ user: 'RaidBoss99', viewers: 250, avatar: '', timestamp: Date.now() });
  }

  onData(data) {
    if (!data || !data.user) { this.clear(); return; }

    var viewersHtml = (data.viewers != null && data.viewers > 0)
      ? '<div class="last-event-sub">' + esc(String(data.viewers)) + ' viewers</div>'
      : '';

    var avatarHtml = (_isSafeUrl(data.avatar))
      ? '<img class="last-event-avatar" src="' + esc(data.avatar) + '" alt="" onerror="this.style.display=\'none\'">'
      : '';

    this.zone.innerHTML =
      '<div class="last-event-card" style="--le-color:#E74C3C;--le-color-rgb:231,76,60;">' +
        '<div class="last-event-accent"></div>' +
        '<div class="last-event-inner">' +
          avatarHtml +
          '<div class="last-event-text">' +
            '<div class="last-event-label">' + labelFor('lastRaid').toUpperCase() + '</div>' +
            '<div class="last-event-username">' + esc(data.user || 'Anonyme') + '</div>' +
            viewersHtml +
          '</div>' +
        '</div>' +
      '</div>';
  }
}

window.LastRaid = new LastRaidComponent();
