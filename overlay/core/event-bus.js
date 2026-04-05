'use strict';

/* ============================================================
   core/event-bus.js — Bus d'événements global (pub/sub)
   Expose : window.Bus

   Événements standard :
     'config:loaded'       { config }
     'config:saved'        { config }
     'component:ready'     { name }
     'ws:connected'        {}
     'ws:disconnected'     {}
     'ws:message'          { source, type, data, raw }
     'chat:message'        { user, message, color, isSub, isMod, isVip, isBroadcaster, timestamp }
     'chat:clear'          {}
     'visibility:cmd'      { action, name }
     'visibility:changed'  { key, visible }
     'scene:changed'       { scene, profile }
     'log:entry'           { ts, level, scope, args }
   ============================================================ */

const Bus = (() => {
  const _listeners = {}; // { eventName: [fn, ...] }

  /**
   * S'abonne à un événement.
   * @param   {string}   event
   * @param   {Function} fn
   * @returns {Function} unsubscribe
   */
  function on(event, fn) {
    if (!_listeners[event]) _listeners[event] = [];
    _listeners[event].push(fn);
    return () => off(event, fn);
  }

  /**
   * Se désabonne.
   * @param {string}   event
   * @param {Function} fn
   */
  function off(event, fn) {
    if (!_listeners[event]) return;
    _listeners[event] = _listeners[event].filter(f => f !== fn);
  }

  /**
   * Émet un événement vers tous ses abonnés.
   * Une exception dans un handler est loguée mais n'interrompt pas les autres.
   * @param {string} event
   * @param {*}      payload
   */
  function emit(event, payload) {
    if (!_listeners[event]) return;
    _listeners[event].slice().forEach(fn => {
      try {
        fn(payload);
      } catch (e) {
        // Éviter la récursion si l'erreur vient d'un handler 'log:entry'
        if (event !== 'log:entry') {
          Log.warn('bus', 'Exception dans handler "' + event + '":', e);
        }
      }
    });
  }

  /**
   * S'abonne une seule fois — se désabonne automatiquement après le premier appel.
   * @param   {string}   event
   * @param   {Function} fn
   * @returns {Function} unsubscribe
   */
  function once(event, fn) {
    const unsub = on(event, function(payload) {
      fn(payload);
      unsub();
    });
    return unsub;
  }

  return { on, off, emit, once };
})();

window.Bus = Bus;
