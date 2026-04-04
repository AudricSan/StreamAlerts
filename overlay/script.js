'use strict';

/* ============================================================
   StreamAlerts — Bootstrap
   Charge la config, positionne les zones, initialise les
   composants actifs, démarre la visibilité dynamique.
   ============================================================ */

// ── Définition des zones (id DOM + alias commandes chat) ──────

const ZONE_DEFS = {
  alerts:         { id: 'zone-alerts',          aliases: ['alerts','alertes','alerte','alert'] },
  chat:           { id: 'zone-chat',             aliases: ['chat'] },
  lastFollower:   { id: 'zone-last-follower',    aliases: ['follower','follow','lastfollow','lastfollower'] },
  lastSubscriber: { id: 'zone-last-subscriber',  aliases: ['sub','subscriber','lastsub','lastsubscriber','abonne'] },
  goal:           { id: 'zone-goal',             aliases: ['goal','objectif'] },
  subtrain:       { id: 'zone-subtrain',         aliases: ['train','subtrain'] },
  nowplaying:     { id: 'zone-nowplaying',       aliases: ['music','musique','nowplaying','chanson'] },
  queue:          { id: 'zone-queue',            aliases: ['queue','file'] },
  viewers:        { id: 'zone-viewers',          aliases: ['viewers','spectateurs'] },
  uptime:         { id: 'zone-uptime',           aliases: ['uptime','duree','direct'] },
  session:        { id: 'zone-session',          aliases: ['session','stats'] },
  countdown:      { id: 'zone-countdown',        aliases: ['countdown','compte','timer'] },
  leaderboard:    { id: 'zone-leaderboard',      aliases: ['leaderboard','top','classement'] },
  poll:           { id: 'zone-poll',             aliases: ['poll','vote','sondage'] },
  prediction:     { id: 'zone-prediction',       aliases: ['prediction','pari'] },
  hypetrain:      { id: 'zone-hypetrain',        aliases: ['hypetrain','hype'] },
};

// ── Registre des composants (cfgKey → instance) ───────────────

const COMPONENTS = {
  alerts:         window.Alerts,
  chat:           window.Chat,
  lastFollower:   window.LastFollower,
  lastSubscriber: window.LastSubscriber,
  goal:           window.Goals,
  subtrain:       window.SubTrain,
  nowplaying:     window.NowPlaying,
  queue:          window.Queue,
  viewers:        window.ViewerCount,
  uptime:         window.Uptime,
  session:        window.Session,
  countdown:      window.Countdown,
  leaderboard:    window.Leaderboard,
  poll:           window.Poll,
  prediction:     window.Prediction,
  hypetrain:      window.HypeTrain,
};

// ── Démarrage ─────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {

  // 1. Charger la configuration
  const cfg = await Config.load();

  // 2. Positionner toutes les zones
  Object.entries(ZONE_DEFS).forEach(([key, { id }]) => {
    _applyZone(id, cfg[key]);
  });

  // 3. Initialiser les composants actifs
  Object.entries(COMPONENTS).forEach(([key, component]) => {
    if (!component) return;
    if (Config.isEnabled(key)) {
      component.init(Config.get(key));
    }
  });

  // 4. Mettre à jour la barre de hint avec les touches enregistrées
  Keyboard.updateHint();

  // 5. Démarrer la visibilité dynamique
  Visibility.init(ZONE_DEFS);

  Log.info('Bootstrap', 'StreamAlerts prêt');
});

// ── Application CSS d'une zone depuis la config ───────────────
//
//  Propriétés de position (px) : top · bottom · left · right
//  Propriétés de taille   (px) : width · height · maxHeight
//  Opacité                     : opacity (0→100 converti en 0→1)
//  Désactivation permanente    : enabled: false  (non surchargeable)

function _applyZone(id, cfg) {
  const el = document.getElementById(id);
  if (!el || !cfg) return;

  ['top', 'bottom', 'left', 'right', 'width', 'height', 'maxHeight'].forEach(prop => {
    if (cfg[prop] == null) return;
    const cssProp = prop.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`);
    el.style[cssProp] = typeof cfg[prop] === 'number' ? `${cfg[prop]}px` : String(cfg[prop]);
  });

  if (cfg.opacity != null) el.style.opacity = cfg.opacity / 100;

  if (cfg.enabled === false) {
    el.hidden = true;
    el.dataset.disabled = '1'; // jamais surchargeable par visibility.json
  }
}
