'use strict';

/* ============================================================
   components/quote.js — Citation du jour
   Expose : window.Quote  (étend BaseComponent)
   Zone   : #zone-quote   Données : data/quote.json
   Test   : touche Q

   JSON attendu :
     {
       "text":      "La persévérance est la clé.",
       "author":    "Inconnu",
       "timestamp": 1710000000000
     }
   ============================================================ */

class QuoteComponent extends BaseComponent {
  constructor() {
    super({
      name:         'quote',
      zoneId:       'zone-quote',
      dataFile:     'quote.json',
      pollInterval: 5000,
      testKey:      'q',
    });
  }

  test() {
    this.onData({
      text:      'La persévérance est la clé du succès.',
      author:    'Test Auteur',
      timestamp: Date.now(),
    });
  }

  onData(data) {
    if (!data || !data.text) { this.clear(); return; }

    var text   = String(data.text);
    var author = (data.author && String(data.author).trim()) ? String(data.author) : '';

    var card = document.createElement('div');
    card.className = 'quote-card';

    var textEl = document.createElement('p');
    textEl.className = 'quote-text';
    textEl.textContent = '\u201C' + text + '\u201D';

    card.appendChild(textEl);

    if (author) {
      var authorEl = document.createElement('span');
      authorEl.className = 'quote-author';
      authorEl.textContent = '\u2014\u00A0' + author;
      card.appendChild(authorEl);
    }

    this.zone.innerHTML = '';
    this.zone.appendChild(card);
  }
}

window.Quote = new QuoteComponent();
