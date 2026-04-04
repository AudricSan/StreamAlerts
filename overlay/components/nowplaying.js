'use strict';

/* ============================================================
   Composant : Now Playing
   Expose : window.NowPlaying  →  { init() }
   Zone    : #zone-nowplaying  |  Données : data/nowplaying.json
   Test    : touche N
   ============================================================ */

class NowPlayingComponent extends BaseComponent {
  constructor() {
    super({
      name:         'nowplaying',
      zoneId:       'zone-nowplaying',
      dataFile:     'nowplaying.json',
      pollInterval: 3000,
      testKey:      'n',
      testData:     [{ title: 'Titre de la chanson', artist: "Nom de l'artiste", active: true, timestamp: 1 }],
    });
  }

  onData(data) {
    if (!data.active || !data.title) { this.clear(); return; }
    this.zone.innerHTML = `
      <div class="nowplaying-card">
        <div class="nowplaying-accent"></div>
        <div class="nowplaying-inner">
          <span class="nowplaying-icon" aria-hidden="true">🎵</span>
          <div class="nowplaying-text">
            <div class="nowplaying-label">NOW PLAYING</div>
            <div class="nowplaying-title">${esc(data.title)}</div>
            ${data.artist ? `<div class="nowplaying-artist">${esc(data.artist)}</div>` : ''}
          </div>
        </div>
      </div>
    `;
  }
}

window.NowPlaying = new NowPlayingComponent();
