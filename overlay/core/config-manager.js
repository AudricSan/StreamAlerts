'use strict';

/**
 * core/config-manager.js — Centralized Configuration & Persistence
 * 
 * Responsibilities:
 * - Load config.json and merge with defaults
 * - Provide getter/setter for component configs
 * - Persist changes back to local JSON files via api.php
 */
const Config = (() => {

  const DEFAULTS = {
    env:            { websocket: 'ws://127.0.0.1:8080', websocketPassword: '' },
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
    scene:          { enabled: true, defaultScene: 'Gameplay', pollInterval: 2000 },
  };

  let _cfg    = {};
  let _loaded = false;

  /**
   * Loads config.json from server.
   */
  async function load() {
    try {
      // Try to load from overlay/data/ (if called from overlay)
      // or ../overlay/data/ (if called from config)
      const isConfigUI = window.location.pathname.includes('/config/');
      const path = isConfigUI ? '../overlay/data/config.json' : 'data/config.json';
      
      const res = await fetch(`${path}?t=${Date.now()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = await res.json();
      _cfg = _merge(raw);
      Log.info('Config', 'Loaded successfully');
    } catch (e) {
      Log.warn('Config', 'Using defaults', e.message);
      _cfg = _merge({});
    }
    _loaded = true;
    Bus.emit('config:loaded', { config: _cfg });
    return _cfg;
  }

  /**
   * Returns specific component config.
   */
  function get(key) {
    return _cfg[key] || DEFAULTS[key] || {};
  }

  /**
   * Checks if a component is enabled.
   */
  function isEnabled(key) {
    return get(key).enabled !== false;
  }

  /**
   * Persists the entire config object.
   */
  async function save(newCfg = null) {
    const data = newCfg ? _merge(newCfg) : _cfg;
    
    // Basic validation
    if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
      throw new Error('Invalid configuration data');
    }

    try {
      const isConfigUI = window.location.pathname.includes('/config/');
      const apiPath = isConfigUI ? './api.php' : '../config/api.php';
      
      const res = await fetch(`${apiPath}?action=write&file=config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      
      if (result.ok) {
        _cfg = data; // Update local state only on success
        Log.info('Config', 'Saved successfully');
        Bus.emit('config:saved', { config: _cfg });
        return true;
      }
      throw new Error(result.error || 'Unknown error');
    } catch (e) {
      Log.error('Config', 'Save failed', e.message);
      throw e;
    }
  }

  function _merge(raw) {
    const result = {};
    const keys = new Set([...Object.keys(DEFAULTS), ...Object.keys(raw || {})]);
    keys.forEach(key => {
      result[key] = { ...(DEFAULTS[key] || {}), ...(raw[key] || {}) };
    });
    return result;
  }

  return { load, get, isEnabled, save, all: () => ({..._cfg}) };
})();

window.Config = Config;
