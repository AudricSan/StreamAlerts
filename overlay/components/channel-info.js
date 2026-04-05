'use strict';

/* ============================================================
   components/channel-info.js — Infos chaîne (titre + catégorie)
   Expose : window.ChannelInfo  (étend BaseComponent)
   Zone   : #zone-channel-info  Données : data/channel_info.json
   Test   : touche I

   JSON attendu :
     {
       "title":     "Titre du stream",
       "category":  "Just Chatting",
       "language":  "fr",
       "timestamp": 1710000000000
     }
   ============================================================ */

class ChannelInfoComponent extends BaseComponent {
  constructor() {
    super({
      name:         'channelInfo',
      zoneId:       'zone-channel-info',
      dataFile:     'channel_info.json',
      pollInterval: 10000,
      testKey:      'i',
    });
  }

  test() {
    this.onData({
      title:     'En train de jouer à quelque chose de super',
      category:  'Just Chatting',
      language:  'fr',
      timestamp: Date.now(),
    });
  }

  onData(data) {
    if (!data || (!data.title && !data.category)) { this.clear(); return; }

    var titleHtml = data.title
      ? '<div class="channel-info-title">' + esc(data.title) + '</div>'
      : '';

    var categoryHtml = data.category
      ? '<div class="channel-info-category">' + esc(data.category) + '</div>'
      : '';

    this.zone.innerHTML =
      '<div class="channel-info-card">' +
        '<div class="channel-info-inner">' +
          titleHtml +
          categoryHtml +
        '</div>' +
      '</div>';
  }
}

window.ChannelInfo = new ChannelInfoComponent();
