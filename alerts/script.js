'use strict';

/* ============================================================
   STREAM ALERTS OVERLAY — script.js
   Polling JSON local + file d'attente + mode test (touche T)
   ============================================================ */

// ── CONSTANTES ────────────────────────────────────────────────

const POLL_INTERVAL      = 500;   // ms entre chaque lecture du JSON
const DISPLAY_DURATION   = 5500;  // ms avant que l'alerte commence à sortir
const EXIT_DURATION      = 700;   // ms pour l'animation de sortie

// Configuration par type d'alerte
const ALERT_CONFIGS = {
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

// Alertes de test (touche T pour cycler)
const TEST_ALERTS = [
  { type: 'follow',       user: 'NouvelAbonné42' },
  { type: 'sub',          user: 'SuperFan',       tier: 'Tier 1' },
  { type: 'resub',        user: 'FidèleSoutien',  months: 12,  tier: 'Tier 2' },
  { type: 'giftsub',      user: 'GénéreuseÂme',   amount: 5 },
  { type: 'raid',         user: 'RaidBoss99',     amount: 250 },
  { type: 'bits',         user: 'BitsDonateur',   amount: 1500 },
  { type: 'donation',     user: 'SuperDonateur',  amount: 10 },
  { type: 'channelpoints',user: 'PointsFan',      message: 'Hydrate-toi ! 💧' },
  { type: 'hype_train',   user: 'La Communauté' },
];

// ── ÉTAT ──────────────────────────────────────────────────────

const container    = document.getElementById('alert-container');
const alertQueue   = [];
let   isPlaying    = false;
let   lastTimestamp = 0;
let   testIndex    = 0;

// ── POLLING ───────────────────────────────────────────────────

async function pollAlertFile() {
  try {
    const res = await fetch(`data/alert.json?t=${Date.now()}`);
    if (!res.ok) return;

    const data = await res.json();

    // Déclencher uniquement si timestamp nouveau et valide
    if (
      data &&
      typeof data.timestamp === 'number' &&
      data.timestamp > 0 &&
      data.timestamp !== lastTimestamp &&
      data.type &&
      ALERT_CONFIGS[data.type]
    ) {
      lastTimestamp = data.timestamp;
      enqueueAlert(data);
    }
  } catch (_) {
    // Fichier absent ou JSON invalide → on attend le prochain tick
  }
}

// ── FILE D'ATTENTE ────────────────────────────────────────────

function enqueueAlert(alertData) {
  alertQueue.push(alertData);
  if (!isPlaying) playNext();
}

async function playNext() {
  if (isPlaying || alertQueue.length === 0) return;

  isPlaying = true;
  const alert = alertQueue.shift();
  await displayAlert(alert);
  isPlaying = false;

  playNext(); // Alerte suivante si présente
}

// ── CONSTRUCTION DU MESSAGE ───────────────────────────────────

function buildMessage(alert) {
  // Message personnalisé Streamer.bot en priorité
  if (alert.message && alert.message.trim()) return alert.message.trim();

  switch (alert.type) {
    case 'follow':
      return 'vient de follow !';
    case 'sub':
      return `vient de s'abonner !${alert.tier ? ` — ${alert.tier}` : ''}`;
    case 'resub':
      return `x${alert.months || '?'} mois${alert.tier ? ` — ${alert.tier}` : ''}`;
    case 'giftsub':
      return `offre ${(alert.amount > 1) ? `${alert.amount} subs` : 'un sub'} !`;
    case 'raid':
      return `arrive en raid avec ${alert.amount || '?'} viewers !`;
    case 'bits':
      return `envoie ${alert.amount || '?'} bits !`;
    case 'donation':
      return `fait un don de ${alert.amount || '?'}€ !`;
    case 'channelpoints':
      return 'a échangé ses points !';
    case 'hype_train':
      return 'Le Hype Train démarre ! 🚂💨';
    default:
      return '';
  }
}

// Badge montant (affiché à droite pour bits / donation / raid / giftsub)
function buildBadge(alert) {
  switch (alert.type) {
    case 'bits':     return alert.amount ? `${alert.amount} BITS`  : null;
    case 'donation': return alert.amount ? `${alert.amount}€`      : null;
    case 'raid':     return alert.amount ? `×${alert.amount}`      : null;
    case 'giftsub':  return alert.amount > 1 ? `×${alert.amount}`  : null;
    default:         return null;
  }
}

// ── CRÉATION DE LA CARTE ──────────────────────────────────────

function createCard(alertData) {
  const config = ALERT_CONFIGS[alertData.type];
  if (!config) return null;

  const message = buildMessage(alertData);
  const badge   = buildBadge(alertData);

  const card = document.createElement('div');
  card.className = `alert-card ${alertData.type}`;

  // Variables CSS de couleur
  card.style.setProperty('--alert-color', config.color);
  card.style.setProperty('--alert-color-rgb', config.colorRgb);

  // Ombre colorée
  card.style.boxShadow = [
    `0 0 0 1px rgba(${config.colorRgb}, 0.12)`,
    `0 0 28px rgba(${config.colorRgb}, 0.18)`,
    `0 14px 40px rgba(0, 0, 0, 0.65)`,
  ].join(', ');

  // Avatar (optionnel)
  const avatarHTML = alertData.avatar
    ? `<img class="alert-avatar"
            src="${esc(alertData.avatar)}"
            alt=""
            onerror="this.style.display='none'">`
    : '';

  // Badge montant (optionnel)
  const badgeHTML = badge
    ? `<div class="alert-badge">${esc(badge)}</div>`
    : '';

  // Message (optionnel)
  const messageHTML = message
    ? `<div class="alert-message">${esc(message)}</div>`
    : '';

  card.innerHTML = `
    <div class="alert-accent-bar"></div>
    <div class="alert-inner">
      <div class="alert-icon" aria-hidden="true">${config.icon}</div>
      <div class="alert-text">
        <div class="alert-type-label">${config.label}</div>
        <div class="alert-username">${esc(alertData.user || 'Anonyme')}</div>
        ${messageHTML}
      </div>
      ${badgeHTML}
      ${avatarHTML}
    </div>
  `;

  return card;
}

// ── AFFICHAGE AVEC CYCLE DE VIE ───────────────────────────────

function displayAlert(alertData) {
  return new Promise((resolve) => {
    const card = createCard(alertData);
    if (!card) { resolve(); return; }

    container.appendChild(card);

    // Son (ignoré si absent ou autoplay bloqué)
    if (alertData.sound) {
      playSound(`assets/sounds/${alertData.sound}`);
    }

    // Double rAF pour forcer le reflow avant d'appliquer la transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        card.classList.add('visible');
      });
    });

    // Déclenchement de la sortie après DISPLAY_DURATION
    setTimeout(() => {
      card.classList.remove('visible');
      card.classList.add('exiting');

      setTimeout(() => {
        card.remove();
        resolve();
      }, EXIT_DURATION);

    }, DISPLAY_DURATION);
  });
}

// ── SON ───────────────────────────────────────────────────────

function playSound(src) {
  try {
    const audio = new Audio(src);
    audio.volume = 0.8;
    audio.play().catch(() => {});
  } catch (_) {}
}

// ── UTILITAIRES ───────────────────────────────────────────────

/** Échappement HTML minimal pour les données externes */
function esc(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── MODE TEST (touche T) ──────────────────────────────────────

document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() !== 't') return;
  if (e.ctrlKey || e.altKey || e.metaKey) return;

  const base  = TEST_ALERTS[testIndex % TEST_ALERTS.length];
  const alert = { ...base, timestamp: Date.now() };
  testIndex++;
  enqueueAlert(alert);
});

// ── DÉMARRAGE ─────────────────────────────────────────────────

setInterval(pollAlertFile, POLL_INTERVAL);
