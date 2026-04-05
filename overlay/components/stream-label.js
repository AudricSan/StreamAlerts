'use strict';

/* ============================================================
   components/stream-label.js — Texte libre / Stream Label
   Expose : window.StreamLabel  (étend BaseComponent)
   Zone   : #zone-stream-label  Données : data/stream_label.json
   Test   : touche M

   JSON attendu :
     {
       "text":      "Subathon Jour 2 🎮",
       "timestamp": 1710000000000
     }
   ============================================================ */

class StreamLabelComponent extends BaseComponent {
  constructor() {
    super({
      name:         'streamLabel',
      zoneId:       'zone-stream-label',
      dataFile:     'stream_label.json',
      pollInterval: 5000,
      testKey:      'm',
    });
  }

  test() {
    this.onData({
      text:      'Subathon Jour 2 \uD83C\uDFAE',
      timestamp: Date.now(),
    });
  }

  onData(data) {
    if (!data || !data.text || !String(data.text).trim()) {
      this.zone.hidden = true;
      return;
    }

    var text = String(data.text);

    var card = document.createElement('div');
    card.className = 'stream-label-card';

    var textEl = document.createElement('span');
    textEl.className = 'stream-label-text';
    textEl.textContent = text;

    card.appendChild(textEl);

    this.zone.innerHTML = '';
    this.zone.appendChild(card);
    this.zone.hidden = false;
  }
}

window.StreamLabel = new StreamLabelComponent();
