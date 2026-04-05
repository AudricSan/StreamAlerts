'use strict';

/* ============================================================
   services/visibility-manager.js — Visibilité runtime des zones
   Expose : window.Visibility

   Sources de visibilité (par priorité décroissante) :
     1. Commandes chat !show / !hide / !toggle (via Bus 'visibility:cmd')
        → émises par chat.js (mod ou broadcaster uniquement)
     2. Polling data/visibility.json toutes les 1.5 s
        → fallback si WriteVisibility.cs est configuré

   Règle : un composant avec enabled:false dans config.json
   NE PEUT PAS être affiché par commande chat.
   ============================================================ */

const Visibility = (() => {
  let _zoneMap   = {}; // { cfgKey: 'zone-id' }
  let _aliasMap  = {}; // { 'alias': 'cfgKey' }

  /* ---------------------------------------------------------- */
  /* Initialisation                                              */
  /* ---------------------------------------------------------- */

  /**
   * @param {object} zoneDefs  { cfgKey: { id, aliases: [] } }
   *   Passé par script.js depuis ZONE_DEFS.
   */
  function init(zoneDefs) {
    _zoneMap  = {};
    _aliasMap = {};

    Object.keys(zoneDefs).forEach(function(key) {
      var def = zoneDefs[key];
      _zoneMap[key] = def.id;
      var aliases = def.aliases || [];
      aliases.forEach(function(a) {
        _aliasMap[a.toLowerCase()] = key;
      });
    });

    // Chargement initial de l'état + polling fallback
    _poll();
    setInterval(_poll, 1500);

    // Écouter les commandes chat (émises par chat.js)
    Bus.on('visibility:cmd', function(payload) {
      handleCmd(payload.action, payload.name);
    });

    Log.info('visibility', 'initialisé (' + Object.keys(_zoneMap).length + ' zones)');
  }

  /* ---------------------------------------------------------- */
  /* Application de la visibilité                               */
  /* ---------------------------------------------------------- */

  /**
   * Applique un objet de visibilité { cfgKey: bool } sur les zones DOM.
   * Les composants disabled (Config.isEnabled = false) sont toujours ignorés.
   * @param {object} vis  { cfgKey: boolean }
   */
  function apply(vis) {
    Object.keys(_zoneMap).forEach(function(key) {
      if (vis[key] === undefined) return;
      // Composant désactivé en dur → intouchable
      if (!Config.isEnabled(key)) return;

      var el = document.getElementById(_zoneMap[key]);
      if (!el) return;

      var visible = vis[key] !== false;
      el.hidden = !visible;
      Bus.emit('visibility:changed', { key: key, visible: visible });
    });

    // Barre de test (hint) — gérée séparément, pas dans la config composants
    var hint = document.getElementById('test-hint');
    if (hint && vis.hint !== undefined) {
      hint.hidden = (vis.hint === false);
    }
  }

  /* ---------------------------------------------------------- */
  /* Commandes chat                                              */
  /* ---------------------------------------------------------- */

  /**
   * Traite une commande !show / !hide / !toggle.
   * @param {string} action  'show' | 'hide' | 'toggle'
   * @param {string} name    alias ou cfgKey (déjà en lowercase)
   */
  async function handleCmd(action, name) {
    var cfgKey = _aliasMap[name.toLowerCase()];
    if (!cfgKey) return;

    // Vérification enabled : impossible d'afficher un composant désactivé en dur
    if (!Config.isEnabled(cfgKey)) {
      Log.warn('visibility', '"' + cfgKey + '" est disabled en config — commande ignorée');
      return;
    }

    try {
      var res = await fetch('data/visibility.json?t=' + Date.now());
      var vis = res.ok ? await res.json() : {};

      var current  = vis[cfgKey] !== false;
      if      (action === 'show')   vis[cfgKey] = true;
      else if (action === 'hide')   vis[cfgKey] = false;
      else                          vis[cfgKey] = !current;

      apply(vis);

      await fetch('../config/api.php?action=write&file=visibility', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(vis),
      });
    } catch (e) {
      Log.error('visibility', 'handleCmd échoué:', e.message);
    }
  }

  /* ---------------------------------------------------------- */
  /* Polling fallback                                            */
  /* ---------------------------------------------------------- */

  async function _poll() {
    try {
      var res = await fetch('data/visibility.json?t=' + Date.now());
      if (!res.ok) return;
      apply(await res.json());
    } catch (e) {
      Log.debug('visibility', 'poll échoué:', e.message);
    }
  }

  return { init, apply, handleCmd };
})();

window.Visibility = Visibility;
