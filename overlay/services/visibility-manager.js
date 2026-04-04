'use strict';

/* ============================================================
   services/visibility-manager.js — Visibilité runtime des zones
   Expose : window.Visibility

   Poll data/visibility.json toutes les 1.5s.
   Répond aux commandes !show / !hide / !toggle du chat
   (via Bus.on('visibility:cmd', ...)).
   ============================================================ */

const Visibility = (() => {
  // Rempli par init() depuis ZONE_DEFS de script.js
  let _zoneMap  = {}; // { cfgKey: 'zone-id' }
  let _aliasMap = {}; // { 'alias': 'cfgKey' }
  let _current  = {};

  /**
   * Initialise avec la définition des zones et démarre le polling.
   * @param {object} zoneDefs — { cfgKey: { id, aliases[] } }
   */
  function init(zoneDefs) {
    _zoneMap  = {};
    _aliasMap = {};
    Object.entries(zoneDefs).forEach(([key, { id, aliases }]) => {
      _zoneMap[key] = id;
      (aliases || []).forEach(a => { _aliasMap[a.toLowerCase()] = key; });
    });

    _poll();
    setInterval(_poll, 1500);

    // Écouter les commandes depuis le chat
    Bus.on('visibility:cmd', ({ action, name }) => handleCmd(action, name));

    Log.info('Visibility', 'initialisé');
  }

  /**
   * Applique un objet de visibilité { cfgKey: bool } sur les zones DOM.
   * Ne surcharge jamais une zone désactivée en dur (data-disabled).
   */
  function apply(vis) {
    _current = { ..._current, ...vis };
    Object.entries(_zoneMap).forEach(([key, id]) => {
      const el = document.getElementById(id);
      if (!el || el.dataset.disabled) return;
      if (vis[key] !== undefined) {
        const visible = vis[key] !== false;
        el.hidden = !visible;
        Bus.emit('visibility:changed', { key, visible });
      }
    });
    // Barre de test
    const hint = document.getElementById('test-hint');
    if (hint && vis.hint !== undefined) hint.hidden = (vis.hint === false);
  }

  /**
   * Traite une commande !show / !hide / !toggle depuis le chat.
   * @param {string} action — 'show', 'hide', 'toggle'
   * @param {string} name   — alias ou clé de composant
   */
  async function handleCmd(action, name) {
    const cfgKey = _aliasMap[name.toLowerCase()];
    if (!cfgKey) return;

    try {
      const res = await fetch(`data/visibility.json?t=${Date.now()}`);
      const vis = res.ok ? await res.json() : {};

      const current = vis[cfgKey] !== false;
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
      Log.error('Visibility', 'handleCmd échoué', String(e.message || e));
    }
  }

  async function _poll() {
    try {
      const res = await fetch(`data/visibility.json?t=${Date.now()}`);
      if (!res.ok) return;
      apply(await res.json());
    } catch (_) {}
  }

  return { init, apply, handleCmd };
})();

window.Visibility = Visibility;
