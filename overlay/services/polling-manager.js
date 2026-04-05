'use strict';

/* ============================================================
   services/polling-manager.js — Gestionnaire centralisé des polls JSON
   Expose : window.Poller

   Toutes les lectures périodiques de overlay/data/ passent ici.
   Jamais de setInterval() individuel dans les composants.

   Usage :
     Poller.register({
       id:       'viewers',
       file:     'viewers.json',
       interval: 30000,
       onData:   function(data) { ... }
     });
     Poller.unregister('viewers');
     Poller.status();  // debug panel
   ============================================================ */

const Poller = (() => {
  const _registry = {}; // { id: entry }

  /* ---------------------------------------------------------- */
  /* API publique                                                */
  /* ---------------------------------------------------------- */

  /**
   * Enregistre un poll et le démarre immédiatement.
   * Si un poll avec le même id existe déjà, il est ignoré.
   *
   * @param {object}   options
   * @param {string}   options.id         Identifiant unique
   * @param {string}   options.file       Fichier dans data/ (ex: 'alert.json')
   * @param {number}   options.interval   Intervalle en ms (minimum 500)
   * @param {Function} options.onData     Callback fn(data) — appelé si timestamp change
   * @param {boolean}  [options.skipFirst=false] Ignorer la 1re lecture
   */
  function register(options) {
    const id        = options.id;
    const file      = options.file;
    const interval  = Math.max(500, options.interval || 2000);
    const onData    = options.onData;
    const skipFirst = options.skipFirst === true;

    if (_registry[id]) {
      Log.warn('poller', '"' + id + '" déjà enregistré — ignoré');
      return;
    }

    const entry = {
      id:           id,
      file:         file,
      interval:     interval,
      _timer:       null,
      _lastTs:      -1,
      _initialized: false,
    };
    _registry[id] = entry;

    async function tick() {
      try {
        const res = await fetch('data/' + file + '?t=' + Date.now());
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
      } catch (e) {
        // Fichier absent au démarrage = normal ; JSON invalide = loggué en debug
        Log.debug('poller', '"' + id + '" fetch/parse échoué:', e.message);
      }
    }

    // Premier appel immédiat, puis cycle
    tick();
    entry._timer = setInterval(tick, interval);
    Log.debug('poller', '"' + id + '" enregistré → data/' + file + ' (' + interval + 'ms)');
  }

  /**
   * Arrête un poll et le supprime du registre.
   * @param {string} id
   */
  function unregister(id) {
    const entry = _registry[id];
    if (!entry) return;
    clearInterval(entry._timer);
    delete _registry[id];
    Log.debug('poller', '"' + id + '" arrêté');
  }

  /**
   * Snapshot de tous les polls actifs — utilisé par le debug panel.
   * @returns {Array}
   */
  function status() {
    return Object.keys(_registry).map(function(id) {
      const e = _registry[id];
      return { id: e.id, file: e.file, interval: e.interval, lastTs: e._lastTs };
    });
  }

  return { register, unregister, status };
})();

window.Poller = Poller;
