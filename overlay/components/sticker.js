'use strict';

/* ============================================================
   components/sticker.js — Image dynamique / Sticker
   Expose : window.Sticker  (étend BaseComponent)
   Zone   : #zone-sticker   Données : data/sticker.json
   Test   : touche K

   JSON attendu :
     {
       "file":      "logo_partner.png",
       "alt":       "Logo partenaire",
       "timestamp": 1710000000000
     }

   Sécurité : seuls les noms de fichiers simples sont autorisés
   (pas de chemin, pas de ../, pas de backslash).
   ============================================================ */

var _STICKER_FILE_REGEX = /^[a-zA-Z0-9_\-]+\.(png|jpg|jpeg|gif|webp|svg)$/i;

function _isSafeFileName(name) {
  return typeof name === 'string' && _STICKER_FILE_REGEX.test(name);
}

class StickerComponent extends BaseComponent {
  constructor() {
    super({
      name:         'sticker',
      zoneId:       'zone-sticker',
      dataFile:     'sticker.json',
      pollInterval: 3000,
      testKey:      'k',
    });
  }

  test() {
    this.onData({
      file:      'test_sticker.png',
      alt:       'Sticker de test',
      timestamp: Date.now(),
    });
  }

  onData(data) {
    if (!data || !data.file || !_isSafeFileName(data.file)) {
      this.zone.hidden = true;
      this.zone.innerHTML = '';
      return;
    }

    var src = 'assets/images/' + data.file;
    var alt = (data.alt && typeof data.alt === 'string') ? data.alt : '';

    var img = document.createElement('img');
    img.className = 'sticker-img';
    img.src       = src;
    img.alt       = esc(alt);

    img.onerror = function() {
      Log.warn('sticker', 'Image introuvable : ' + src);
      img.style.display = 'none';
    };

    this.zone.innerHTML = '';
    this.zone.appendChild(img);
    this.zone.hidden = false;
  }
}

window.Sticker = new StickerComponent();
