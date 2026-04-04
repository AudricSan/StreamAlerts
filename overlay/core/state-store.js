'use strict';

/* ============================================================
   core/state-store.js — Store clé/valeur par namespace
   Expose : window.Store

   Usage :
     Store.set('chat', 'wsActive', true);
     Store.get('chat', 'wsActive', false);  // false = valeur par défaut
     Store.watch('chat', 'wsActive', (v) => Log.info('Chat', `WS ${v}`));
   ============================================================ */

const Store = (() => {
  const _data     = {}; // { namespace: { key: value } }
  const _watchers = {}; // { 'namespace.key': [fn] }

  /**
   * Définit une valeur. Notifie les watchers si la valeur change.
   */
  function set(namespace, key, value) {
    if (!_data[namespace]) _data[namespace] = {};
    const old = _data[namespace][key];
    _data[namespace][key] = value;
    if (old !== value) _notify(`${namespace}.${key}`, value, old);
  }

  /**
   * Lit une valeur.
   * @param {string} namespace
   * @param {string} key
   * @param {*}      [defaultValue]
   */
  function get(namespace, key, defaultValue) {
    const val = _data[namespace]?.[key];
    return val !== undefined ? val : defaultValue;
  }

  /**
   * Observe un changement de valeur.
   * @returns {Function} unsubscribe
   */
  function watch(namespace, key, fn) {
    const k = `${namespace}.${key}`;
    if (!_watchers[k]) _watchers[k] = [];
    _watchers[k].push(fn);
    return () => {
      _watchers[k] = (_watchers[k] || []).filter(f => f !== fn);
    };
  }

  /**
   * Retourne tout le contenu d'un namespace (pour le debug panel).
   */
  function dump(namespace) {
    return { ...(_data[namespace] || {}) };
  }

  function _notify(k, newVal, oldVal) {
    (_watchers[k] || []).forEach(fn => {
      try { fn(newVal, oldVal); } catch (_) {}
    });
  }

  return { set, get, watch, dump };
})();

window.Store = Store;
