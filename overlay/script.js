'use strict';

/* ============================================================
   script.js — Bootstrap de l'overlay StreamAlerts
   Dernière couche chargée. Orchestre tout le démarrage.

   Ordre d'exécution :
     DOMContentLoaded
       └─ Config.load()
           ├─ _applyLayout()    positionne les zones DOM
           ├─ _initComponents() appelle instance.init(cfg) sur chaque widget
           └─ _startServices()  Visibility, SceneManager, WSManager
   ============================================================ */

/* ── Définitions des zones ─────────────────────────────────
   Chaque entrée associe une clé config à un id DOM et des alias
   de commandes chat (!show <alias>).
   Utilisé par Visibility.init() et _applyLayout().
   ─────────────────────────────────────────────────────────── */
var ZONE_DEFS = {
  alerts:         { id: 'zone-alerts',         aliases: ['alerts','alertes','alerte','alert'] },
  chat:           { id: 'zone-chat',            aliases: ['chat'] },
  lastFollower:   { id: 'zone-last-follower',   aliases: ['follower','follow','lastfollow','lastfollower'] },
  lastSubscriber: { id: 'zone-last-subscriber', aliases: ['sub','subscriber','lastsub','lastsubscriber','abonne'] },
  goal:           { id: 'zone-goal',            aliases: ['goal','objectif'] },
  subtrain:       { id: 'zone-subtrain',        aliases: ['train','subtrain'] },
  nowplaying:     { id: 'zone-nowplaying',      aliases: ['music','musique','nowplaying','chanson'] },
  queue:          { id: 'zone-queue',           aliases: ['queue','file'] },
  viewers:        { id: 'zone-viewers',         aliases: ['viewers','spectateurs'] },
  uptime:         { id: 'zone-uptime',          aliases: ['uptime','duree','direct'] },
  session:        { id: 'zone-session',         aliases: ['session','stats'] },
  countdown:      { id: 'zone-countdown',       aliases: ['countdown','compte','timer'] },
  leaderboard:    { id: 'zone-leaderboard',     aliases: ['leaderboard','top','classement'] },
  poll:           { id: 'zone-poll',            aliases: ['poll','vote','sondage'] },
  prediction:     { id: 'zone-prediction',      aliases: ['prediction','pari'] },
  hypetrain:      { id: 'zone-hypetrain',       aliases: ['hypetrain','hype'] },
  lastRaid:       { id: 'zone-last-raid',        aliases: ['raid','lastraid','shoutout'] },
  channelInfo:    { id: 'zone-channel-info',     aliases: ['channelinfo','titre','game','jeu'] },
  quote:          { id: 'zone-quote',            aliases: ['quote','citation'] },
  streamLabel:    { id: 'zone-stream-label',     aliases: ['label','streamlabel'] },
  sticker:        { id: 'zone-sticker',          aliases: ['sticker','image'] },
  ticker:         { id: 'zone-ticker',           aliases: ['ticker','annonce'] },
};

/* ── Instances des composants ──────────────────────────────
   Associe chaque clé config à son singleton window.*.
   Une instance manquante génère un warn et est ignorée.
   ─────────────────────────────────────────────────────────── */
var COMPONENTS = {
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
  lastRaid:       window.LastRaid,
  channelInfo:    window.ChannelInfo,
  quote:          window.Quote,
  streamLabel:    window.StreamLabel,
  sticker:        window.Sticker,
  ticker:         window.Ticker,
};

/* ── Bootstrap ─────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', function() {
  Config.load().then(function(cfg) {
    _applyLayout(cfg);
    _initComponents(cfg);
    _startServices();
    if (window.Keyboard) Keyboard.updateHint();
    Log.info('bootstrap', 'StreamAlerts prêt');
  }).catch(function(e) {
    Log.error('bootstrap', 'Config.load() échoué:', e.message);
  });
});

/* ── Application du layout ─────────────────────────────────
   Applique position / taille / opacité sur chaque zone DOM
   à partir de la config fusionnée.
   Les zones avec enabled:false sont masquées et marquées
   data-disabled pour que Visibility les ignore ensuite.
   ─────────────────────────────────────────────────────────── */
function _applyLayout(cfg) {
  // ── Échelle globale et safe zone ───────────────────────────
  var layoutCfg = cfg.layout || {};
  var scale      = (typeof layoutCfg.rootScale === 'number' && layoutCfg.rootScale > 0)
                    ? layoutCfg.rootScale : 1;
  var margin     = (layoutCfg.safeMargin && typeof layoutCfg.safeMargin === 'object')
                    ? layoutCfg.safeMargin : {};
  var mt = Number(margin.top)    || 0;
  var mr = Number(margin.right)  || 0;
  var mb = Number(margin.bottom) || 0;
  var ml = Number(margin.left)   || 0;

  if (scale !== 1 || mt || mr || mb || ml) {
    document.body.style.transformOrigin = 'top left';
    document.body.style.transform       = 'scale(' + scale + ')';
    document.body.style.padding         = mt + 'px ' + mr + 'px ' + mb + 'px ' + ml + 'px';
    Log.debug('bootstrap', 'layout scale=' + scale + ' safeMargin=' + [mt,mr,mb,ml].join('/'));
  }

  // ── Reduced motion ─────────────────────────────────────────
  if (layoutCfg.reduceMotion === true) {
    document.body.classList.add('reduce-motion');
    Log.debug('bootstrap', 'reduceMotion activé');
  }

  // ── Font scales ────────────────────────────────────────────
  var chatScale   = (typeof layoutCfg.chatFontScale   === 'number' && layoutCfg.chatFontScale   > 0) ? layoutCfg.chatFontScale   : 1;
  var globalScale = (typeof layoutCfg.globalFontScale === 'number' && layoutCfg.globalFontScale > 0) ? layoutCfg.globalFontScale : 1;
  // Clamp manuellement entre 0.5 et 3 (clamp() CSS non supporté sur Chromium 90)
  chatScale   = chatScale   < 0.5 ? 0.5 : chatScale   > 3 ? 3 : chatScale;
  globalScale = globalScale < 0.5 ? 0.5 : globalScale > 3 ? 3 : globalScale;
  if (chatScale !== 1)   document.documentElement.style.setProperty('--chat-font-scale',   String(chatScale));
  if (globalScale !== 1) document.documentElement.style.setProperty('--global-font-scale', String(globalScale));

  var LAYOUT_PROPS = ['top', 'bottom', 'left', 'right', 'width', 'height'];

  Object.keys(ZONE_DEFS).forEach(function(key) {
    var def     = ZONE_DEFS[key];
    var el      = document.getElementById(def.id);
    var zoneCfg = cfg[key];
    if (!el || !zoneCfg) return;

    // Propriétés de position / taille (valeurs en px)
    LAYOUT_PROPS.forEach(function(prop) {
      if (zoneCfg[prop] != null) {
        el.style[prop] = zoneCfg[prop] + 'px';
      }
    });

    // maxHeight séparé (camelCase)
    if (zoneCfg.maxHeight != null) {
      el.style.maxHeight = zoneCfg.maxHeight + 'px';
    }

    // Opacité (0-100 → 0-1)
    if (zoneCfg.opacity != null) {
      el.style.opacity = String(zoneCfg.opacity / 100);
    }

    // Désactivation permanente : masquer + marquer le DOM
    if (zoneCfg.enabled === false) {
      el.hidden = true;
      el.dataset.disabled = '1';
    }
  });
}

/* ── Initialisation des composants ─────────────────────────
   Chaque composant reçoit sa section de config.
   Config.isEnabled() vérifié ici en amont ; BaseComponent
   le re-vérifie également dans init() pour sécurité.
   ─────────────────────────────────────────────────────────── */
function _initComponents(cfg) {
  Object.keys(COMPONENTS).forEach(function(key) {
    var instance = COMPONENTS[key];

    if (!instance) {
      Log.warn('bootstrap', 'composant manquant : ' + key);
      return;
    }

    if (!Config.isEnabled(key)) {
      Log.debug('bootstrap', key + ' désactivé — init ignorée');
      return;
    }

    try {
      instance.init(Config.get(key));
    } catch (e) {
      Log.error('bootstrap', 'Erreur init ' + key + ':', e.message);
    }
  });
}

/* ── Démarrage des services ─────────────────────────────── */
function _startServices() {
  Visibility.init(ZONE_DEFS);

  if (window.SceneManager)   SceneManager.init();
  if (window.WSManager)      WSManager.init();
  if (window.StaleMonitor)   StaleMonitor.init(Config.get('staleMonitor'));
  _initScenePresets();
}

/* ── Presets de visibilité par scène ───────────────────────
   Lit config.scenePresets.presets :
     { "NomScène": { "cfgKey": true/false, … } }
   et applique le preset via Visibility.apply() à chaque
   changement de scène OBS.
   Les composants disabled en config restent non affichables.
   ─────────────────────────────────────────────────────────── */
function _initScenePresets() {
  if (!window.SceneManager) {
    Log.warn('bootstrap', 'scenePresets : SceneManager absent — ignoré');
    return;
  }

  var presetsCfg = Config.get('scenePresets');
  if (!presetsCfg || presetsCfg.enabled === false) {
    Log.debug('bootstrap', 'scenePresets désactivé');
    return;
  }

  var presets = (presetsCfg.presets && typeof presetsCfg.presets === 'object')
    ? presetsCfg.presets : {};

  if (Object.keys(presets).length === 0) {
    Log.warn('bootstrap', 'scenePresets activé mais aucun preset défini');
    return;
  }

  SceneManager.onChange(function(sceneName) {
    var preset = presets[sceneName];
    if (!preset) {
      Log.debug('bootstrap', 'scenePresets : aucun preset pour "' + sceneName + '"');
      return;
    }
    Log.info('bootstrap', 'scenePresets : applique preset "' + sceneName + '"');
    Visibility.apply(preset);
  });

  Log.info('bootstrap', 'scenePresets initialisé (' + Object.keys(presets).length + ' scènes)');
}
