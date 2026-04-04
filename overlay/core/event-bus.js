'use strict';

/* ============================================================
   core/event-bus.js — Bus d'événements global
   Expose : window.Bus

   Événements standard :
     'config:loaded'       { config }
     'ws:connected'        {}
     'ws:disconnected'     {}
     'ws:message'          { source, type, data, raw }
     'chat:message'        { user, message, color, isSub, isMod, isVip, isBroadcaster, timestamp }
     'chat:clear'          {}
     'visibility:cmd'      { action, name }
     'visibility:changed'  { key, visible }
     'component:ready'     { name }
     'log:entry'           { ts, level, scope, args }
   ============================================================ */

const Bus = (() => {
  const _listeners = {}; // { eventName: [fn, ...] }

  /**
   * S'abonne à un événement.
   * @param {string}   event
   * @param {Function} fn
   * @returns {Function} unsubscribe
   */
  function on(event, fn) {
    if (!_listeners[event]) _listeners[event] = [];
    _listeners[event].push(fn);
    return () => off(event, fn);
  }

  /**
   * Se désabonne.
   */
  function off(event, fn) {
    if (!_listeners[event]) return;
    _listeners[event] = _listeners[event].filter(f => f !== fn);
  }

  /**
   * Émet un événement.
   * Les exceptions dans les handlers sont loguées mais n'interrompent pas les autres.
   * @param {string} event
   * @param {*}      payload
   */
  function emit(event, payload) {
    if (!_listeners[event]) return;
    [..._listeners[event]].forEach(fn => {
      try { fn(payload); }
      catch (e) {
        // Éviter une récursion si l'erreur vient d'un handler 'log:entry'
        if (event !== 'log:entry') {
          console.error(`[Bus] Exception dans handler "${event}":`, e);
        }
      }
    });
  }

  /**
   * S'abonne une seule fois.
   */
  function once(event, fn) {
    const unsub = on(event, (payload) => { fn(payload); unsub(); });
  }

  return { on, off, emit, once };
})();

window.Bus = Bus;
