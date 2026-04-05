'use strict';

/* ============================================================
   core/state-store.js — Store clé/valeur par namespace
   Expose : window.Store

   USAGE TEMPORAIRE UNIQUEMENT — ne pas substituer à la
   persistance JSON (config.json, données Streamer.bot).

   Usage :
     Store.set('chat', 'wsActive', true);
     Store.get('chat', 'wsActive', false);  // false = valeur par défaut
     Store.watch('chat', 'wsActive', fn);   // retourne unsubscribe
     Store.clear('chat');                   // vide un namespace
     Store.dump('chat');                    // snapshot (debug)
   ============================================================ */

const Store = (() => {
  const _data     = {}; // { namespace: { key: value } }
  const _watchers = {}; // { 'namespace.key': [fn, ...] }

  /**
   * Définit une valeur. Notifie les watchers si la valeur change.
   */
  function set(namespace, key, value) {
    if (!_data[namespace]) _data[namespace] = {};
    const old = _data[namespace][key];
    _data[namespace][key] = value;
    if (old !== value) _notify(namespace + '.' + key, value, old);
  }

  /**
   * Lit une valeur. Retourne defaultValue si absente.
   * @param {string} namespace
   * @param {string} key
   * @param {*}      [defaultValue]
   */
  function get(namespace, key, defaultValue) {
    if (!_data[namespace]) return defaultValue;
    const val = _data[namespace][key];
    return val !== undefined ? val : defaultValue;
  }

  /**
   * Observe un changement de valeur.
   * @param   {string}   namespace
   * @param   {string}   key
   * @param   {Function} fn(newVal, oldVal)
   * @returns {Function} unsubscribe
   */
  function watch(namespace, key, fn) {
    const k = namespace + '.' + key;
    if (!_watchers[k]) _watchers[k] = [];
    _watchers[k].push(fn);
    return function() {
      _watchers[k] = (_watchers[k] || []).filter(function(f) { return f !== fn; });
    };
  }

  /**
   * Vide un namespace entier (ou tout le store si non fourni).
   */
  function clear(namespace) {
    if (namespace) {
      delete _data[namespace];
    } else {
      Object.keys(_data).forEach(function(k) { delete _data[k]; });
    }
  }

  /**
   * Retourne un snapshot d'un namespace (pour le debug panel).
   */
  function dump(namespace) {
    return Object.assign({}, _data[namespace] || {});
  }

  function _notify(k, newVal, oldVal) {
    (_watchers[k] || []).forEach(function(fn) {
      try {
        fn(newVal, oldVal);
      } catch (e) {
        Log.warn('store', 'Exception dans watcher "' + k + '":', e);
      }
    });
  }

  return { set, get, watch, clear, dump };
})();

window.Store = Store;
