'use strict';

/* ============================================================
   core/config-manager.js — Configuration centralisée
   Expose : window.Config

   Usage :
     Config.get('chat')              → objet section entier
     Config.get('chat.maxMessages')  → valeur imbriquée
     Config.isEnabled('goal')        → boolean
     Config.load()                   → Promise
     Config.save(newCfg)             → Promise
   ============================================================ */

const Config = (() => {

  /* Valeurs par défaut fonctionnelles par composant.
     Les positions / tailles viennent de config.json (spécifiques à chaque streamer). */
  const DEFAULTS = {
    env:            { websocket: 'ws://127.0.0.1:8080', websocketPassword: '' },
    layout:         {
      rootScale:      1,
      safeMargin:     { top: 0, right: 0, bottom: 0, left: 0 },
      reduceMotion:   false,
      chatFontScale:  1,
      globalFontScale: 1,
    },
    alerts:         {
      enabled: true, displayDuration: 5500, pollInterval: 500,
      sounds: {
        enabled:  false,
        volume:   0.8,
        mute:     false,
        byType: {
          follow:        'follow.mp3',
          sub:           'sub.mp3',
          resub:         'sub.mp3',
          giftsub:       'giftsub.mp3',
          raid:          'raid.mp3',
          bits:          'bits.mp3',
          donation:      'donation.mp3',
          channelpoints: '',
          hype_train:    '',
        },
      },
    },
    chat:           {
      enabled: true, msgLifetime: 30000, maxMessages: 14, pollInterval: 300,
      filterMode:          'off',
      filterList:          [],
      filterCaseSensitive: false,
      dimModCommands:      false,
      dimBotCommands:      false,
      hideCommands:        false,
      highlightMentions:   [],
      batchSameUser:       false,
      batchWindowMs:       10000,
    },
    lastFollower:   { enabled: true, pollInterval: 2000 },
    lastSubscriber: { enabled: true, pollInterval: 2000 },
    goal:           { enabled: true, pollInterval: 2000 },
    subtrain:       { enabled: true, duration: 60, pollInterval: 500  },
    nowplaying:     { enabled: true, pollInterval: 3000 },
    queue:          { enabled: true, maxVisible: 8, pollInterval: 1000 },
    viewers:        { enabled: true, pollInterval: 30000 },
    uptime:         { enabled: true, pollInterval: 60000 },
    session:        { enabled: true, pollInterval: 3000 },
    countdown:      { enabled: true, pollInterval: 2000 },
    leaderboard:    { enabled: true, pollInterval: 5000 },
    poll:           { enabled: true, pollInterval: 2000 },
    prediction:     { enabled: true, pollInterval: 2000 },
    hypetrain:      { enabled: true, pollInterval: 1000 },
    lastRaid:       { enabled: true, pollInterval: 2000 },
    channelInfo:    { enabled: true, pollInterval: 10000 },
    staleMonitor:   {
      enabled:           false,
      wsThreshold:       30,
      dataThreshold:     120,
      watchFiles:        ['chat', 'viewers'],
      debugOnly:         true,
    },
    scene:          { enabled: true, defaultScene: 'Gameplay', pollInterval: 2000 },
    scenePresets:   {
      enabled: false,
      presets: {
        'Gameplay':      { chat: true,  alerts: true,  goal: true,  subtrain: true,  countdown: false, leaderboard: false },
        'Just Chatting': { chat: true,  alerts: true,  goal: false, subtrain: false, countdown: false, leaderboard: true  },
        'BRB':           { chat: false, alerts: false, goal: false, subtrain: false, countdown: true,  leaderboard: false },
        'Starting Soon': { chat: false, alerts: false, goal: false, subtrain: false, countdown: true,  leaderboard: false },
        'Ending':        { chat: true,  alerts: false, goal: true,  subtrain: false, countdown: false, leaderboard: true  },
      },
    },

    // ── Nouveaux widgets ────────────────────────────────────────
    quote:       { enabled: true, pollInterval: 5000 },
    streamLabel: { enabled: true, pollInterval: 5000 },
    sticker:     { enabled: true, pollInterval: 3000 },
    ticker:      { enabled: true, pollInterval: 5000, speed: 60 },

    // ── Améliorations chat ──────────────────────────────────────
    // (chat.filterMode, batchSameUser, etc. fusionnés dans la section chat via _merge)
    // Les clés suivantes étendent la section chat existante :
    // filterMode: 'off' | 'blacklist' | 'whitelist'
    // filterList: []  (tableau de chaînes)
    // filterCaseSensitive: false
    // dimModCommands: false
    // dimBotCommands: false
    // hideCommands: false
    // highlightMentions: []  (ex. ['NomDuStreamer'])
    // batchSameUser: false
    // batchWindowMs: 10000

    // ── Labels i18n ─────────────────────────────────────────────
    labels: {
      goal:        'Objectif',
      viewers:     'Spectateurs',
      uptime:      'En direct depuis',
      queue:       'File d\'attente',
      session:     'Session',
      leaderboard: 'Classement',
      nowplaying:  'En écoute',
      subtrain:    'Sub Train',
      lastFollow:  'Dernier follow',
      lastSub:     'Dernier sub',
      lastRaid:    'Dernier raid',
      countdown:   'Compte à rebours',
      ticker:      '',
      quote:       '',
      streamLabel: '',
    },

    // ── Profils de configuration ─────────────────────────────────
    // (géré via ?profile=nom dans l'URL — clé réservée pour Config.load())
  };

  let _cfg           = {};
  let _loaded        = false;
  let _activeProfile = '';

  /* ---------------------------------------------------------- */
  /* Détection du profil depuis l'URL                           */
  /* ---------------------------------------------------------- */

  (function _detectProfile() {
    try {
      var urlParams    = window.location.search;
      var profileMatch = urlParams.match(/[?&]profile=([a-zA-Z0-9\-]{1,32})/);
      if (profileMatch) _activeProfile = profileMatch[1];
    } catch (e) {}
  })();

  /* ---------------------------------------------------------- */
  /* Chargement                                                  */
  /* ---------------------------------------------------------- */

  async function load() {
    var configFile = _activeProfile ? 'config-' + _activeProfile : 'config';

    try {
      const isConfigUI = window.location.pathname.indexOf('/config/') !== -1;
      const path = isConfigUI
        ? '../overlay/data/' + configFile + '.json'
        : 'data/' + configFile + '.json';

      Log.info('config', 'profil: ' + (_activeProfile || 'défaut'));

      const res = await fetch(path + '?t=' + Date.now());
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const raw = await res.json();
      _cfg = _merge(raw);
      Log.info('config', 'chargée');
    } catch (e) {
      Log.warn('config', 'fichier absent ou invalide — defaults utilisés', e.message);
      _cfg = _merge({});
    }
    _loaded = true;
    Bus.emit('config:loaded', { config: _cfg });
    return _cfg;
  }

  /* ---------------------------------------------------------- */
  /* Profil actif                                               */
  /* ---------------------------------------------------------- */

  function activeProfile() {
    return _activeProfile;
  }

  /* ---------------------------------------------------------- */
  /* Accesseurs                                                  */
  /* ---------------------------------------------------------- */

  /**
   * Retourne une valeur de config par clé simple ou chemin pointé.
   * Config.get('chat')              → { enabled, maxMessages, … }
   * Config.get('chat.maxMessages')  → 14
   */
  function get(keyPath) {
    const parts = typeof keyPath === 'string' ? keyPath.split('.') : [String(keyPath)];
    let cur = _cfg;
    for (let i = 0; i < parts.length; i++) {
      if (cur == null || typeof cur !== 'object') return undefined;
      cur = cur[parts[i]];
    }
    // Pour une clé de premier niveau manquante, repli sur DEFAULTS
    if (cur === undefined && parts.length === 1) {
      return DEFAULTS[parts[0]] || {};
    }
    return cur;
  }

  /**
   * Retourne true si le composant est actif.
   * Un composant est désactivé uniquement si enabled === false explicitement.
   */
  function isEnabled(key) {
    return get(key + '.enabled') !== false;
  }

  /* ---------------------------------------------------------- */
  /* Sauvegarde (dock config → api.php)                         */
  /* ---------------------------------------------------------- */

  async function save(newCfg) {
    const data = _merge(newCfg || _cfg);

    if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
      throw new Error('Config.save : données invalides');
    }

    try {
      const isConfigUI = window.location.pathname.indexOf('/config/') !== -1;
      const apiPath    = isConfigUI ? './api.php' : '../config/api.php';
      const configFile = _activeProfile ? 'config-' + _activeProfile : 'config';

      const res = await fetch(apiPath + '?action=write&file=' + configFile, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);

      const result = await res.json();
      if (!result.ok) throw new Error(result.error || 'Erreur inconnue');

      _cfg = data; // Mise à jour locale uniquement après succès
      Log.info('config', 'sauvegardée');
      Bus.emit('config:saved', { config: _cfg });
      return true;
    } catch (e) {
      Log.error('config', 'sauvegarde échouée', e.message);
      throw e;
    }
  }

  /* ---------------------------------------------------------- */
  /* Helpers internes                                            */
  /* ---------------------------------------------------------- */

  /** Fusionne raw avec DEFAULTS — shallow merge par section. */
  function _merge(raw) {
    const result = {};
    const src = raw || {};
    const allKeys = Object.keys(DEFAULTS).concat(
      Object.keys(src).filter(k => !(k in DEFAULTS))
    );
    allKeys.forEach(function(key) {
      result[key] = Object.assign({}, DEFAULTS[key] || {}, src[key] || {});
    });
    return result;
  }

  function all() {
    return Object.assign({}, _cfg);
  }

  return { load, get, isEnabled, save, all, activeProfile };
})();

window.Config = Config;
