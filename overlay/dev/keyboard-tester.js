'use strict';

/* ============================================================
   dev/keyboard-tester.js — Raccourcis clavier centralisés
   Expose : window.Keyboard

   Remplace les multiples document.addEventListener('keydown')
   individuels. Un seul listener global ; les composants
   s'enregistrent via Keyboard.register() dans leur init().

   Génère automatiquement la barre de hint #test-hint.
   Toujours chargé — actif dans le navigateur et dans OBS.
   ============================================================ */

const Keyboard = (() => {
  const _bindings = {}; // { key: [{ fn, label }, ...] }

  /**
   * Enregistre un raccourci clavier.
   * Plusieurs handlers peuvent coexister sur la même touche.
   * @param {string}   key     Lettre unique (ex: 't', 'c')
   * @param {Function} fn      Callback sans argument
   * @param {string}   [label] Description pour la barre de hint
   */
  function register(key, fn, label) {
    var k = key.toLowerCase();
    if (!_bindings[k]) _bindings[k] = [];
    _bindings[k].push({ fn: fn, label: label || '' });
  }

  /**
   * Retourne tous les bindings (pour le hint et le debug panel).
   * @returns {Array} [{ key, label }, ...]
   */
  function getAll() {
    return Object.keys(_bindings).map(function(key) {
      var handlers = _bindings[key];
      var labels   = handlers.map(function(h) { return h.label; })
                             .filter(function(l) { return !!l; });
      return { key: key, label: labels.join(', ') };
    });
  }

  /* Listener global unique — capturé une seule fois à l'init du fichier */
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    var handlers = _bindings[e.key.toLowerCase()];
    if (!handlers) return;
    handlers.forEach(function(binding) {
      try {
        binding.fn();
      } catch (err) {
        Log.error('keyboard', 'exception sur touche "' + e.key + '":', err);
      }
    });
  });

  /**
   * Met à jour #test-hint avec les touches enregistrées.
   * Appelé par script.js après l'init de tous les composants.
   */
  function updateHint() {
    var bar = document.getElementById('test-hint');
    if (!bar) return;

    var entries = getAll()
      .filter(function(e) { return !!e.label; })
      .sort(function(a, b) { return a.key.localeCompare(b.key); })
      .map(function(e) {
        return '<kbd>' + e.key.toUpperCase() + '</kbd> ' + e.label;
      });

    bar.innerHTML = entries.join(' &nbsp;&middot;&nbsp; ');
    bar.hidden    = entries.length === 0;
  }

  return { register, getAll, updateHint };
})();

window.Keyboard = Keyboard;
