'use strict';

/* ============================================================
   StreamAlerts — Point d'entrée unique

   Ordre de démarrage :
     1. Chargement de data/config.json
     2. Application des positions/tailles sur chaque zone
     3. Initialisation des composants actifs
     4. Polling de data/visibility.json (show/hide runtime)

   Commandes chat (modérateur/broadcaster) :
     !show   <composant>   — afficher
     !hide   <composant>   — masquer
     !toggle <composant>   — basculer
   Détectées dans chat.js → window.StreamAlerts.handleVisibilityCmd()
   ============================================================ */

// ── Correspondance cfgKey → zone HTML + alias commandes ──────

const ZONE_MAP = {
  alerts:         { id: 'zone-alerts',         aliases: ['alerts','alertes','alerte','alert'] },
  chat:           { id: 'zone-chat',            aliases: ['chat'] },
  lastFollower:   { id: 'zone-last-follower',   aliases: ['follower','follow','lastfollow','lastfollower'] },
  lastSubscriber: { id: 'zone-last-subscriber', aliases: ['sub','subscriber','lastsub','lastsubscriber','abonne'] },
  goal:           { id: 'zone-goal',            aliases: ['goal','objectif'] },
  subtrain:       { id: 'zone-subtrain',        aliases: ['train','subtrain'] },
  nowplaying:     { id: 'zone-nowplaying',      aliases: ['music','musique','nowplaying','chanson'] },
  queue:          { id: 'zone-queue',           aliases: ['queue','file'] },
};

// Table alias → cfgKey (utilisée par handleVisibilityCmd)
const ALIAS_MAP = {};
Object.entries(ZONE_MAP).forEach(([key, {aliases}]) =>
  aliases.forEach(a => { ALIAS_MAP[a] = key; }));

document.addEventListener('DOMContentLoaded', async () => {

  // ── 1. Config ────────────────────────────────────────────────
  const cfg = await loadConfig();

  // ── 2. Positionnement des zones ──────────────────────────────
  applyZone('zone-alerts',          cfg.alerts);
  applyZone('zone-chat',            cfg.chat);
  applyZone('zone-last-follower',   cfg.lastFollower);
  applyZone('zone-last-subscriber', cfg.lastSubscriber);
  applyZone('zone-goal',            cfg.goal);
  applyZone('zone-subtrain',        cfg.subtrain);
  applyZone('zone-nowplaying',      cfg.nowplaying);
  applyZone('zone-queue',           cfg.queue);
  applyZone('zone-counter',         cfg.counter);

  // ── 3. Composants actifs ─────────────────────────────────────
  if (cfg.alerts?.enabled     !== false) Alerts.init(cfg.alerts         || {});
  if (cfg.chat?.enabled       !== false) Chat.init(cfg.chat             || {});
  if (cfg.goal?.enabled       !== false) Goals.init(cfg.goal            || {});
  if (cfg.subtrain?.enabled   !== false) SubTrain.init(cfg.subtrain     || {});
  if (cfg.nowplaying?.enabled !== false) NowPlaying.init(cfg.nowplaying || {});
  if (cfg.queue?.enabled      !== false) Queue.init(cfg.queue           || {});
  LastEvents.init(); // enabled géré via applyZone (hidden si disabled)

  // ── 4. Visibilité dynamique ──────────────────────────────────
  await pollVisibility();
  setInterval(pollVisibility, 1500);

});

// ── Chargement du fichier de configuration ───────────────────

async function loadConfig() {
  try {
    const res = await fetch(`data/config.json?t=${Date.now()}`);
    if (res.ok) return await res.json();
  } catch (_) {}
  console.warn('[StreamAlerts] config.json introuvable — positions par défaut utilisées.');
  return {};
}

// ── Application d'une zone depuis la config ──────────────────
//
//  Propriétés de position (px) : top · bottom · left · right
//  Propriétés de taille   (px) : width · height · maxHeight
//  Opacité                     : opacity (0-100)
//  Désactivation permanente    : enabled: false

function applyZone(id, cfg) {
  const el = document.getElementById(id);
  if (!el || !cfg) return;

  const PX_PROPS = ['top', 'bottom', 'left', 'right', 'width', 'height', 'maxHeight'];
  PX_PROPS.forEach(prop => {
    if (cfg[prop] == null) return;
    const cssProp = prop.replace(/([A-Z])/g, c => `-${c.toLowerCase()}`);
    const val = cfg[prop];
    el.style[cssProp] = typeof val === 'number' ? `${val}px` : String(val);
  });

  // Opacité (0-100 → 0-1)
  if (cfg.opacity != null) el.style.opacity = cfg.opacity / 100;

  // Désactivation permanente (enabled: false) — non surchargeable par visibility.json
  if (cfg.enabled === false) {
    el.hidden = true;
    el.dataset.disabled = '1';
  }
}

// ── Visibilité dynamique (data/visibility.json) ──────────────

function applyVisibility(vis) {
  Object.entries(ZONE_MAP).forEach(([key, {id}]) => {
    const el = document.getElementById(id);
    if (!el || el.dataset.disabled) return; // jamais surcharger un disabled permanent
    if (vis[key] !== undefined) el.hidden = (vis[key] === false);
  });
}

async function pollVisibility() {
  try {
    const res = await fetch(`data/visibility.json?t=${Date.now()}`);
    if (!res.ok) return;
    applyVisibility(await res.json());
  } catch (_) {}
}

// ── Interface globale — utilisée par chat.js ─────────────────
//
//  Appelée quand un modérateur tape !show / !hide / !toggle dans le chat.
//  Met à jour visibility.json via l'API puis applique immédiatement.

window.StreamAlerts = {

  async handleVisibilityCmd(action, name) {
    const cfgKey = ALIAS_MAP[name.toLowerCase()];
    if (!cfgKey) return;

    try {
      const res = await fetch(`data/visibility.json?t=${Date.now()}`);
      const vis  = res.ok ? await res.json() : {};

      const current = vis[cfgKey] !== false;
      if      (action === 'show')   vis[cfgKey] = true;
      else if (action === 'hide')   vis[cfgKey] = false;
      else                          vis[cfgKey] = !current; // toggle

      applyVisibility(vis);

      // Persiste la modification dans le fichier
      await fetch('../config/api.php?action=write&file=visibility', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(vis),
      });
    } catch (_) {}
  },

};
