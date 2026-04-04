'use strict';

/* ============================================================
   core/config-manager.js — Gestionnaire de configuration
   Expose : window.Config

   Charge data/config.json, fusionne avec les valeurs par défaut,
   expose Config.get(key) pour chaque composant.
   ============================================================ */

const Config = (() => {

  // Valeurs par défaut pour chaque section (pollInterval en ms)
  const DEFAULTS = {
    alerts:         { enabled: true, displayDuration: 5500, pollInterval: 500  },
    chat:           { enabled: true, msgLifetime: 30000, maxMessages: 14, pollInterval: 300 },
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
  };

  let _cfg    = {};
  let _loaded = false;

  /**
   * Charge config.json et fusionne avec les defaults.
   * Émet 'config:loaded' via Bus.
   * @returns {Promise<object>}
   */
  async function load() {
    try {
      const res = await fetch(`data/config.json?t=${Date.now()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = await res.json();
      _cfg = _merge(raw);
      Log.info('Config', 'config.json chargé');
    } catch (e) {
      Log.warn('Config', 'config.json introuvable — defaults utilisés', String(e.message || e));
      _cfg = _merge({});
    }
    _loaded = true;
    Bus.emit('config:loaded', { config: _cfg });
    return _cfg;
  }

  /**
   * Retourne la section de configuration d'un composant.
   * @param {string} key - 'alerts', 'chat', etc.
   * @returns {object}
   */
  function get(key) {
    return _cfg[key] || DEFAULTS[key] || {};
  }

  /**
   * Vérifie si un composant est activé.
   * @param {string} key
   * @returns {boolean}
   */
  function isEnabled(key) {
    return get(key).enabled !== false;
  }

  /**
   * Retourne la configuration complète.
   * @returns {object}
   */
  function all() {
    return { ..._cfg };
  }

  function _merge(raw) {
    const result = {};
    const keys = new Set([...Object.keys(DEFAULTS), ...Object.keys(raw || {})]);
    keys.forEach(key => {
      result[key] = { ...(DEFAULTS[key] || {}), ...(raw[key] || {}) };
    });
    return result;
  }

  return { load, get, isEnabled, all };
})();

window.Config = Config;
