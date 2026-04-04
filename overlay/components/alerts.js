'use strict';

/* ============================================================
   Composant : Alertes Twitch
   Expose : window.Alerts  →  { init() }
   Zone    : #zone-alerts  |  Données : data/alert.json
   Test    : touche T  (cycle sur tous les types)

   skipFirst: true — ne rejoue pas la dernière alerte au reload OBS.
   ============================================================ */

const _ALERT_TYPES = {
  follow:       { label: 'NOUVEAU FOLLOW',  icon: '💜', color: '#9B59B6', rgb: '155, 89, 182' },
  sub:          { label: 'NOUVEAU SUB',     icon: '⭐', color: '#F1C40F', rgb: '241, 196, 15' },
  resub:        { label: 'RESUB',           icon: '🔥', color: '#E67E22', rgb: '230, 126, 34' },
  giftsub:      { label: 'GIFT SUB',        icon: '🎁', color: '#E91E8C', rgb: '233, 30, 140' },
  raid:         { label: 'RAID',            icon: '⚔️', color: '#E74C3C', rgb: '231, 76, 60'  },
  bits:         { label: 'BITS',            icon: '💎', color: '#00BCD4', rgb: '0, 188, 212'  },
  donation:     { label: 'DONATION',        icon: '💚', color: '#2ECC71', rgb: '46, 204, 113' },
  channelpoints:{ label: 'CHANNEL POINTS',  icon: '✨', color: '#3498DB', rgb: '52, 152, 219' },
  hype_train:   { label: 'HYPE TRAIN',      icon: '🚂', color: '#FF6B6B', rgb: '255, 107, 107'},
};

class AlertsComponent extends BaseComponent {
  constructor() {
    super({
      name:         'alerts',
      zoneId:       'zone-alerts',
      dataFile:     'alert.json',
      pollInterval: 500,
      skipFirst:    true, // ne pas rejouer la dernière alerte au démarrage
      testKey:      't',
      testData: [
        { type: 'follow',        user: 'NouvelAbonné42' },
        { type: 'sub',           user: 'SuperFan',       tier: 'Tier 1'  },
        { type: 'resub',         user: 'FidèleSoutien',  months: 12, tier: 'Tier 2' },
        { type: 'giftsub',       user: 'GénéreuseÂme',   amount: 5   },
        { type: 'raid',          user: 'RaidBoss99',     amount: 250 },
        { type: 'bits',          user: 'BitsDonateur',   amount: 1500 },
        { type: 'donation',      user: 'SuperDonateur',  amount: 10  },
        { type: 'channelpoints', user: 'PointsFan',      message: 'Hydrate-toi ! 💧' },
        { type: 'hype_train',    user: 'La Communauté'  },
      ],
    });
    this._container  = null;
    this._queue      = [];
    this._playing    = false;
    this._displayDur = 5500;
  }

  setup(cfg) {
    this._container  = document.getElementById('alert-container');
    this._displayDur = cfg.displayDuration ?? 5500;
  }

  // ── Données ──────────────────────────────────────────────────

  onData(data) {
    if (!_ALERT_TYPES[data.type]) return;
    this._enqueue(data);
  }

  // ── File d'attente ───────────────────────────────────────────

  _enqueue(data) {
    this._queue.push(data);
    if (!this._playing) this._playNext();
  }

  async _playNext() {
    if (this._playing || this._queue.length === 0) return;
    this._playing = true;
    await this._display(this._queue.shift());
    this._playing = false;
    this._playNext();
  }

  // ── Construction de la carte ─────────────────────────────────

  _buildMessage(a) {
    if (a.message && a.message.trim()) return a.message.trim();
    switch (a.type) {
      case 'follow':        return 'vient de follow !';
      case 'sub':           return `vient de s'abonner !${a.tier ? ` — ${a.tier}` : ''}`;
      case 'resub':         return `x${a.months || '?'} mois${a.tier ? ` — ${a.tier}` : ''}`;
      case 'giftsub':       return `offre ${a.amount > 1 ? `${a.amount} subs` : 'un sub'} !`;
      case 'raid':          return `arrive en raid avec ${a.amount || '?'} viewers !`;
      case 'bits':          return `envoie ${a.amount || '?'} bits !`;
      case 'donation':      return `fait un don de ${a.amount || '?'}€ !`;
      case 'channelpoints': return 'a échangé ses points !';
      case 'hype_train':    return 'Le Hype Train démarre ! 🚂💨';
      default:              return '';
    }
  }

  _buildBadge(a) {
    switch (a.type) {
      case 'bits':     return a.amount ? `${a.amount} BITS` : null;
      case 'donation': return a.amount ? `${a.amount}€`     : null;
      case 'raid':     return a.amount ? `×${a.amount}`     : null;
      case 'giftsub':  return a.amount > 1 ? `×${a.amount}` : null;
      default:         return null;
    }
  }

  _createCard(a) {
    const cfg   = _ALERT_TYPES[a.type];
    const msg   = this._buildMessage(a);
    const badge = this._buildBadge(a);

    const card = document.createElement('div');
    card.className = `alert-card ${a.type}`;
    card.style.setProperty('--alert-color',     cfg.color);
    card.style.setProperty('--alert-color-rgb', cfg.rgb);
    card.style.boxShadow = [
      `0 0 0 1px rgba(${cfg.rgb}, 0.12)`,
      `0 0 28px rgba(${cfg.rgb}, 0.18)`,
      `0 14px 40px rgba(0,0,0,0.65)`,
    ].join(', ');

    card.innerHTML = `
      <div class="alert-accent-bar"></div>
      <div class="alert-inner">
        <div class="alert-icon" aria-hidden="true">${cfg.icon}</div>
        <div class="alert-text">
          <div class="alert-type-label">${cfg.label}</div>
          <div class="alert-username">${esc(a.user || 'Anonyme')}</div>
          ${msg   ? `<div class="alert-message">${esc(msg)}</div>`   : ''}
        </div>
        ${badge ? `<div class="alert-badge">${esc(badge)}</div>` : ''}
        ${a.avatar ? `<img class="alert-avatar" src="${esc(a.avatar)}" alt="" onerror="this.style.display='none'">` : ''}
      </div>
    `;
    return card;
  }

  // ── Affichage ────────────────────────────────────────────────

  _display(alertData) {
    return new Promise((resolve) => {
      const card = this._createCard(alertData);
      if (!card) { resolve(); return; }

      this._container.appendChild(card);

      if (alertData.sound) {
        try {
          const audio = new Audio(`assets/sounds/${alertData.sound}`);
          audio.volume = 0.8;
          audio.play().catch(() => {});
        } catch (_) {}
      }

      requestAnimationFrame(() => {
        requestAnimationFrame(() => card.classList.add('visible'));
      });

      setTimeout(() => {
        card.classList.remove('visible');
        card.classList.add('exiting');
        setTimeout(() => { card.remove(); resolve(); }, 700);
      }, this._displayDur);
    });
  }
}

window.Alerts = new AlertsComponent();
