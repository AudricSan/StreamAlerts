'use strict';

/* ============================================================
   components/ticker.js — Ticker d'annonces défilant
   Expose : window.Ticker  (étend BaseComponent)
   Zone   : #zone-ticker   Données : data/ticker.json
   Test   : touche X

   JSON attendu :
     {
       "messages": ["Message 1", "Lien social", "Annonce partenaire"],
       "speed":    60,
       "timestamp": 1710000000000
     }

   Le texte défile horizontalement en boucle via CSS animation.
   La durée est calculée depuis la largeur du contenu et la vitesse
   (pixels/seconde). Le texte est dupliqué pour une boucle sans coupure.
   ============================================================ */

class TickerComponent extends BaseComponent {
  constructor() {
    super({
      name:         'ticker',
      zoneId:       'zone-ticker',
      dataFile:     'ticker.json',
      pollInterval: 5000,
      testKey:      'x',
    });

    this._currentText = null;
  }

  test() {
    this.onData({
      messages:  ['Bienvenue sur le stream !', 'Rejoignez le Discord', 'Suivez sur les réseaux'],
      speed:     60,
      timestamp: Date.now(),
    });
  }

  onData(data) {
    if (!data || !Array.isArray(data.messages) || data.messages.length === 0) {
      this.zone.hidden = true;
      return;
    }

    // Construire le texte combiné — textContent uniquement, pas d'innerHTML
    var combined = data.messages.map(function(msg) {
      return String(msg);
    }).join('  \u00B7  ');

    var speed = (typeof data.speed === 'number' && data.speed > 0)
      ? data.speed
      : (this.cfg && typeof this.cfg.speed === 'number' && this.cfg.speed > 0)
        ? this.cfg.speed
        : 60;

    // Si le texte n'a pas changé, ne pas reconstruire le DOM inutilement
    if (combined === this._currentText) return;
    this._currentText = combined;

    this.zone.innerHTML = '';

    var wrap = document.createElement('div');
    wrap.className = 'ticker-wrap';

    var content = document.createElement('div');
    content.className = 'ticker-content';

    // Texte dupliqué pour que la boucle CSS soit seamless
    var span1 = document.createElement('span');
    span1.textContent = combined + '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0';

    var span2 = document.createElement('span');
    span2.setAttribute('aria-hidden', 'true');
    span2.textContent = combined + '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0';

    content.appendChild(span1);
    content.appendChild(span2);
    wrap.appendChild(content);
    this.zone.appendChild(wrap);
    this.zone.hidden = false;

    // Calculer la durée après insertion pour obtenir la largeur réelle
    // On utilise une estimation basée sur la longueur du texte × 8px/caractère
    // (Chromium 90 ne permet pas facilement requestAnimationFrame depuis ici
    //  sans risquer un cycle layout ; l'estimation est suffisante pour le ticker)
    var estimatedWidth = combined.length * 8;
    var duration = estimatedWidth / speed;
    if (duration < 1) duration = 1;

    content.style.animationDuration = duration.toFixed(2) + 's';

    Log.debug('ticker', 'texte mis à jour, durée=' + duration.toFixed(2) + 's, vitesse=' + speed + 'px/s');
  }
}

window.Ticker = new TickerComponent();
