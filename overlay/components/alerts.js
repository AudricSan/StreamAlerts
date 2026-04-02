'use strict';

/* ============================================================
   Composant : Alertes Twitch
   Polling JSON local + file d'attente + mode test (touche T)

   Expose : window.Alerts  →  { init() }
   Zone HTML  : #alert-container  (dans #zone-alerts)
   Données    : data/alert.json
   ============================================================ */

const Alerts = (() => {

  // ── CONSTANTES ──────────────────────────────────────────────

  const POLL_INTERVAL    = 500;   // ms entre chaque lecture du JSON
  const DISPLAY_DURATION = 5500;  // ms avant que la sortie commence
  const EXIT_DURATION    = 700;   // ms pour l'animation de sortie

  const CONFIGS = {
    follow: {
      label:    'NOUVEAU FOLLOW',
      icon:     '💜',
      color:    '#9B59B6',
      colorRgb: '155, 89, 182',
    },
    sub: {
      label:    'NOUVEAU SUB',
      icon:     '⭐',
      color:    '#F1C40F',
      colorRgb: '241, 196, 15',
    },
    resub: {
      label:    'RESUB',
      icon:     '🔥',
      color:    '#E67E22',
      colorRgb: '230, 126, 34',
    },
    giftsub: {
      label:    'GIFT SUB',
      icon:     '🎁',
      color:    '#E91E8C',
      colorRgb: '233, 30, 140',
    },
    raid: {
      label:    'RAID',
      icon:     '⚔️',
      color:    '#E74C3C',
      colorRgb: '231, 76, 60',
    },
    bits: {
      label:    'BITS',
      icon:     '💎',
      color:    '#00BCD4',
      colorRgb: '0, 188, 212',
    },
    donation: {
      label:    'DONATION',
      icon:     '💚',
      color:    '#2ECC71',
      colorRgb: '46, 204, 113',
    },
    channelpoints: {
      label:    'CHANNEL POINTS',
      icon:     '✨',
      color:    '#3498DB',
      colorRgb: '52, 152, 219',
    },
    hype_train: {
      label:    'HYPE TRAIN',
      icon:     '🚂',
      color:    '#FF6B6B',
      colorRgb: '255, 107, 107',
    },
  };

  const TEST_DATA = [
    { type: 'follow',        user: 'NouvelAbonné42' },
    { type: 'sub',           user: 'SuperFan',       tier: 'Tier 1' },
    { type: 'resub',         user: 'FidèleSoutien',  months: 12, tier: 'Tier 2' },
    { type: 'giftsub',       user: 'GénéreuseÂme',   amount: 5 },
    { type: 'raid',          user: 'RaidBoss99',     amount: 250 },
    { type: 'bits',          user: 'BitsDonateur',   amount: 1500 },
    { type: 'donation',      user: 'SuperDonateur',  amount: 10 },
    { type: 'channelpoints', user: 'PointsFan',      message: 'Hydrate-toi ! 💧' },
    { type: 'hype_train',    user: 'La Communauté' },
  ];

  // ── ÉTAT ────────────────────────────────────────────────────

  let container;
  let queue         = [];
  let playing       = false;
  let lastTimestamp = 0;
  let testIndex     = 0;

  // ── POLLING ─────────────────────────────────────────────────

  async function poll() {
    try {
      const res = await fetch(`data/alert.json?t=${Date.now()}`);
      if (!res.ok) return;

      const data = await res.json();

      if (
        data &&
        typeof data.timestamp === 'number' &&
        data.timestamp > 0 &&
        data.timestamp !== lastTimestamp &&
        data.type &&
        CONFIGS[data.type]
      ) {
        lastTimestamp = data.timestamp;
        enqueue(data);
      }
    } catch (_) {
      // Fichier absent ou JSON invalide → silence
    }
  }

  // ── FILE D'ATTENTE ───────────────────────────────────────────

  function enqueue(alertData) {
    queue.push(alertData);
    if (!playing) playNext();
  }

  async function playNext() {
    if (playing || queue.length === 0) return;
    playing = true;
    await display(queue.shift());
    playing = false;
    playNext();
  }

  // ── MESSAGES ─────────────────────────────────────────────────

  function buildMessage(a) {
    if (a.message && a.message.trim()) return a.message.trim();
    switch (a.type) {
      case 'follow':       return 'vient de follow !';
      case 'sub':          return `vient de s'abonner !${a.tier ? ` — ${a.tier}` : ''}`;
      case 'resub':        return `x${a.months || '?'} mois${a.tier ? ` — ${a.tier}` : ''}`;
      case 'giftsub':      return `offre ${a.amount > 1 ? `${a.amount} subs` : 'un sub'} !`;
      case 'raid':         return `arrive en raid avec ${a.amount || '?'} viewers !`;
      case 'bits':         return `envoie ${a.amount || '?'} bits !`;
      case 'donation':     return `fait un don de ${a.amount || '?'}€ !`;
      case 'channelpoints':return 'a échangé ses points !';
      case 'hype_train':   return 'Le Hype Train démarre ! 🚂💨';
      default:             return '';
    }
  }

  function buildBadge(a) {
    switch (a.type) {
      case 'bits':     return a.amount ? `${a.amount} BITS` : null;
      case 'donation': return a.amount ? `${a.amount}€`     : null;
      case 'raid':     return a.amount ? `×${a.amount}`     : null;
      case 'giftsub':  return a.amount > 1 ? `×${a.amount}` : null;
      default:         return null;
    }
  }

  // ── CRÉATION DE CARTE ────────────────────────────────────────

  function createCard(a) {
    const cfg = CONFIGS[a.type];
    if (!cfg) return null;

    const msg   = buildMessage(a);
    const badge = buildBadge(a);

    const card = document.createElement('div');
    card.className = `alert-card ${a.type}`;
    card.style.setProperty('--alert-color',     cfg.color);
    card.style.setProperty('--alert-color-rgb', cfg.colorRgb);
    card.style.boxShadow = [
      `0 0 0 1px rgba(${cfg.colorRgb}, 0.12)`,
      `0 0 28px rgba(${cfg.colorRgb}, 0.18)`,
      `0 14px 40px rgba(0, 0, 0, 0.65)`,
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

  // ── AFFICHAGE ────────────────────────────────────────────────

  function display(alertData) {
    return new Promise((resolve) => {
      const card = createCard(alertData);
      if (!card) { resolve(); return; }

      container.appendChild(card);

      if (alertData.sound) playSound(`assets/sounds/${alertData.sound}`);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => card.classList.add('visible'));
      });

      setTimeout(() => {
        card.classList.remove('visible');
        card.classList.add('exiting');
        setTimeout(() => { card.remove(); resolve(); }, EXIT_DURATION);
      }, DISPLAY_DURATION);
    });
  }

  // ── SON ──────────────────────────────────────────────────────

  function playSound(src) {
    try {
      const audio = new Audio(src);
      audio.volume = 0.8;
      audio.play().catch(() => {});
    } catch (_) {}
  }

  // ── MODE TEST (touche T) ─────────────────────────────────────

  function onKeyDown(e) {
    if (e.key.toLowerCase() !== 't') return;
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    const base = TEST_DATA[testIndex % TEST_DATA.length];
    testIndex++;
    enqueue({ ...base, timestamp: Date.now() });
  }

  // ── UTILITAIRES ──────────────────────────────────────────────

  function esc(v) {
    if (v == null) return '';
    return String(v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── INIT (appelé par script.js) ──────────────────────────────

  function init() {
    container = document.getElementById('alert-container');
    setInterval(poll, POLL_INTERVAL);
    document.addEventListener('keydown', onKeyDown);
  }

  return { init };

})();
