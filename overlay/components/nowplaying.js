'use strict';

/* ============================================================
   components/nowplaying.js — Musique en cours
   Expose : window.NowPlaying  (étend BaseComponent)
   Zone   : #zone-nowplaying   Données : data/nowplaying.json
   Test   : touche N
   ============================================================ */

class NowPlayingComponent extends BaseComponent {
  constructor() {
    super({
      name:         'nowplaying',
      zoneId:       'zone-nowplaying',
      dataFile:     'nowplaying.json',
      pollInterval: 3000,
      testKey:      'n',
    });
  }

  test() {
    this.onData({ title: 'Titre de la chanson', artist: "Nom de l'artiste", active: true, timestamp: Date.now() });
  }

  onData(data) {
    if (!data || !data.active || !data.title) { this.clear(); return; }

    var artistHtml = data.artist
      ? '<div class="nowplaying-artist">' + esc(data.artist) + '</div>'
      : '';

    this.zone.innerHTML =
      '<div class="nowplaying-card">' +
        '<div class="nowplaying-accent"></div>' +
        '<div class="nowplaying-inner">' +
          '<span class="nowplaying-icon" aria-hidden="true">\uD83C\uDFB5</span>' +
          '<div class="nowplaying-text">' +
            '<div class="nowplaying-label">NOW PLAYING</div>' +
            '<div class="nowplaying-title">' + esc(data.title) + '</div>' +
            artistHtml +
          '</div>' +
        '</div>' +
      '</div>';
  }
}

window.NowPlaying = new NowPlayingComponent();
