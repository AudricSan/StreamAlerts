'use strict';

/* ============================================================
   components/alerts.js — Alertes Twitch
   Expose : window.Alerts  (étend BaseComponent)
   Zone   : #zone-alerts   Données : data/alert.json
   Test   : touche T  (cycle sur tous les types d'alerte)

   skipFirst: true — ne rejoue pas la dernière alerte au reload OBS.
   ============================================================ */

var _ALERT_TYPES = {
  follow:        { label: 'NOUVEAU FOLLOW',  icon: '💜', color: '#9B59B6', rgb: '155, 89, 182'  },
  sub:           { label: 'NOUVEAU SUB',     icon: '⭐', color: '#F1C40F', rgb: '241, 196, 15'  },
  resub:         { label: 'RESUB',           icon: '🔥', color: '#E67E22', rgb: '230, 126, 34'  },
  giftsub:       { label: 'GIFT SUB',        icon: '🎁', color: '#E91E8C', rgb: '233, 30, 140'  },
  raid:          { label: 'RAID',            icon: '⚔️', color: '#E74C3C', rgb: '231, 76, 60'   },
  bits:          { label: 'BITS',            icon: '💎', color: '#00BCD4', rgb: '0, 188, 212'   },
  donation:      { label: 'DONATION',        icon: '💚', color: '#2ECC71', rgb: '46, 204, 113'  },
  channelpoints: { label: 'CHANNEL POINTS',  icon: '✨', color: '#3498DB', rgb: '52, 152, 219'  },
  hype_train:    { label: 'HYPE TRAIN',      icon: '🚂', color: '#FF6B6B', rgb: '255, 107, 107' },
};

var _ALERT_TEST_DATA = [
  { type: 'follow',        user: 'NouvelAbonné42' },
  { type: 'sub',           user: 'SuperFan',       tier: 'Tier 1' },
  { type: 'resub',         user: 'FidèleSoutien',  months: 12, tier: 'Tier 2' },
  { type: 'giftsub',       user: 'GénéreuseÂme',   amount: 5 },
  { type: 'raid',          user: 'RaidBoss99',     amount: 250 },
  { type: 'bits',          user: 'BitsDonateur',   amount: 1500 },
  { type: 'donation',      user: 'SuperDonateur',  amount: 10 },
  { type: 'channelpoints', user: 'PointsFan',      message: 'Hydrate-toi !' },
  { type: 'hype_train',    user: 'La Communauté' },
];

class AlertsComponent extends BaseComponent {
  constructor() {
    super({
      name:         'alerts',
      zoneId:       'zone-alerts',
      dataFile:     'alert.json',
      pollInterval: 500,
      skipFirst:    true,
      testKey:      't',
    });
    this._container  = null;
    this._queue      = [];
    this._playing    = false;
    this._displayDur = 5500;
    this._testIndex  = 0;
    this._sounds     = null; // config sons (section alerts.sounds)
    this._audioPool  = {};   // { alertType: HTMLAudioElement }
  }

  setup(cfg) {
    this._container  = document.getElementById('alert-container');
    this._displayDur = cfg.displayDuration != null ? cfg.displayDuration : 5500;
    this._sounds     = (cfg.sounds && typeof cfg.sounds === 'object') ? cfg.sounds : null;
    this._preloadSounds();
  }

  /* ── Préchargement des objets Audio ─────────────────────── */

  _preloadSounds() {
    var sounds = this._sounds;
    if (!sounds || sounds.enabled === false || sounds.mute) return;
    var byType = (sounds.byType && typeof sounds.byType === 'object') ? sounds.byType : {};
    var types  = Object.keys(byType);
    for (var i = 0; i < types.length; i++) {
      var type = types[i];
      var file = byType[type];
      if (!file || typeof file !== 'string' || !file.trim()) continue;
      try {
        var audio = new Audio('assets/sounds/' + file);
        audio.preload = 'auto';
        this._audioPool[type] = audio;
      } catch (e) {
        Log.warn('alerts', 'son introuvable pour ' + type + ':', file);
      }
    }
  }

  _playSound(alertType) {
    var sounds = this._sounds;
    if (!sounds || sounds.enabled === false || sounds.mute) return;
    var audio = this._audioPool[alertType];
    if (!audio) return;
    try {
      audio.volume  = typeof sounds.volume === 'number' ? Math.min(1, Math.max(0, sounds.volume)) : 0.8;
      audio.currentTime = 0;
      audio.play().catch(function() {});
    } catch (e) {}
  }

  /* ── Données ─────────────────────────────────────────────── */

  onData(data) {
    if (!data || !_ALERT_TYPES[data.type]) return;
    this._enqueue(data);
  }

  /* ── Test ────────────────────────────────────────────────── */

  test() {
    var data = _ALERT_TEST_DATA[this._testIndex % _ALERT_TEST_DATA.length];
    this._testIndex++;
    this._enqueue(Object.assign({}, data, { timestamp: Date.now() }));
  }

  /* ── File d'attente ──────────────────────────────────────── */

  _enqueue(data) {
    this._queue.push(data);
    if (!this._playing) this._playNext();
  }

  _playNext() {
    if (this._playing || this._queue.length === 0) return;
    var self = this;
    this._playing = true;
    this._display(this._queue.shift()).then(function() {
      self._playing = false;
      self._playNext();
    });
  }

  /* ── Construction du message ─────────────────────────────── */

  _buildMessage(a) {
    if (a.message && a.message.trim()) return a.message.trim();
    var amt = a.amount;
    switch (a.type) {
      case 'follow':        return 'vient de follow !';
      case 'sub':           return 'vient de s\'abonner !' + (a.tier ? ' — ' + a.tier : '');
      case 'resub':         return 'x' + (a.months || '?') + ' mois' + (a.tier ? ' — ' + a.tier : '');
      case 'giftsub':       return 'offre ' + (amt > 1 ? amt + ' subs' : 'un sub') + ' !';
      case 'raid':          return 'arrive en raid avec ' + (amt || '?') + ' viewers !';
      case 'bits':          return 'envoie ' + (amt || '?') + ' bits !';
      case 'donation':      return 'fait un don de ' + (amt || '?') + '\u20AC !';
      case 'channelpoints': return 'a \u00E9chang\u00E9 ses points !';
      case 'hype_train':    return 'Le Hype Train démarre !';
      default:              return '';
    }
  }

  _buildBadge(a) {
    var amt = a.amount;
    switch (a.type) {
      case 'bits':     return amt ? String(amt) + ' BITS' : null;
      case 'donation': return amt ? String(amt) + '\u20AC'      : null;
      case 'raid':     return amt ? '\u00D7' + String(amt)     : null;
      case 'giftsub':  return amt > 1 ? '\u00D7' + String(amt) : null;
      default:         return null;
    }
  }

  /* ── Création de la carte HTML ───────────────────────────── */

  _createCard(a) {
    var def   = _ALERT_TYPES[a.type];
    var msg   = this._buildMessage(a);
    var badge = this._buildBadge(a);

    var card = document.createElement('div');
    card.className = 'alert-card ' + a.type;
    card.style.setProperty('--alert-color',     def.color);
    card.style.setProperty('--alert-color-rgb', def.rgb);
    card.style.boxShadow = [
      '0 0 0 1px rgba(' + def.rgb + ', 0.12)',
      '0 0 28px rgba(' + def.rgb + ', 0.18)',
      '0 14px 40px rgba(0,0,0,0.65)',
    ].join(', ');

    var msgHtml   = msg   ? '<div class="alert-message">'  + esc(msg)   + '</div>'  : '';
    var badgeHtml = badge ? '<div class="alert-badge">'    + esc(badge) + '</div>'  : '';
    var avatarHtml = (a.avatar && /^https?:\/\//i.test(a.avatar))
      ? '<img class="alert-avatar" src="' + esc(a.avatar) + '" alt="" onerror="this.style.display=\'none\'">'
      : '';

    card.innerHTML =
      '<div class="alert-accent-bar"></div>' +
      '<div class="alert-inner">' +
        '<div class="alert-icon" aria-hidden="true">' + def.icon + '</div>' +
        '<div class="alert-text">' +
          '<div class="alert-type-label">' + def.label + '</div>' +
          '<div class="alert-username">' + esc(a.user || 'Anonyme') + '</div>' +
          msgHtml +
        '</div>' +
        badgeHtml +
        avatarHtml +
      '</div>';

    return card;
  }

  /* ── Affichage avec animations ───────────────────────────── */

  _display(alertData) {
    var self = this;
    return new Promise(function(resolve) {
      var card = self._createCard(alertData);

      self._container.appendChild(card);

      // Son par type (géré via config alerts.sounds)
      self._playSound(alertData.type);

      // Animation entrée (double rAF pour forcer le reflow)
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          card.classList.add('visible');
        });
      });

      setTimeout(function() {
        card.classList.remove('visible');
        card.classList.add('exiting');
        setTimeout(function() {
          if (card.parentNode) card.parentNode.removeChild(card);
          resolve();
        }, 700);
      }, self._displayDur);
    });
  }
}

window.Alerts = new AlertsComponent();
