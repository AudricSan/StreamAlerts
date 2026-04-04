'use strict';

/* ============================================================
   services/polling-manager.js — Gestionnaire centralisé des polls
   Expose : window.Poller

   Remplace les ~13 setInterval(poll, X) individuels.
   Un seul endroit pour voir, pauseer, relancer tous les polls.

   Usage :
     Poller.register({ id:'viewers', file:'viewers.json',
                       interval:30000, onData: fn });
   ============================================================ */

const Poller = (() => {
  /**
   * Structure d'une entrée :
   * {
   *   id         : string
   *   file       : string
   *   interval   : number (ms)
   *   skipFirst  : boolean
   *   onData     : Function(data)
   *   _timer     : number (setInterval handle)
   *   _lastTs    : number
   *   _initialized: boolean
   * }
   */
  const _registry = {};

  /**
   * Enregistre un poll et le démarre immédiatement.
   * @param {object} options
   * @param {string}   options.id
   * @param {string}   options.file       — nom du fichier dans data/ (ex: 'alert.json')
   * @param {number}   options.interval   — ms entre chaque lecture
   * @param {Function} options.onData     — fn(data) appelée sur nouvelles données
   * @param {boolean}  [options.skipFirst=false] — ignorer la 1re lecture
   */
  function register({ id, file, interval, onData, skipFirst = false }) {
    if (_registry[id]) {
      Log.warn('Poller', `"${id}" déjà enregistré — ignoré`);
      return;
    }

    const entry = {
      id, file, interval, skipFirst, onData,
      _timer: null, _lastTs: -1, _initialized: false,
    };
    _registry[id] = entry;

    const tick = async () => {
      try {
        const res = await fetch(`data/${file}?t=${Date.now()}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!data || typeof data.timestamp !== 'number') return;

        if (!entry._initialized) {
          entry._initialized = true;
          entry._lastTs      = data.timestamp;
          if (!skipFirst) onData(data);
          return;
        }

        if (data.timestamp !== entry._lastTs) {
          entry._lastTs = data.timestamp;
          onData(data);
        }
      } catch (_) {
        // Fichier absent ou JSON invalide → silence
      }
    };

    // Premier appel immédiat puis cycle
    tick();
    entry._timer = setInterval(tick, interval);
    Log.debug('Poller', `"${id}" → data/${file} (${interval}ms)`);
  }

  /**
   * Arrête un poll et le retire du registre.
   */
  function unregister(id) {
    const entry = _registry[id];
    if (!entry) return;
    clearInterval(entry._timer);
    delete _registry[id];
    Log.debug('Poller', `"${id}" arrêté`);
  }

  /**
   * Retourne l'état de tous les polls (pour le debug panel).
   */
  function status() {
    return Object.values(_registry).map(e => ({
      id: e.id, file: e.file, interval: e.interval, lastTs: e._lastTs,
    }));
  }

  return { register, unregister, status };
})();

window.Poller = Poller;
