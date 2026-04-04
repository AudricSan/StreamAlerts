'use strict';

/* ============================================================
   dev/keyboard-tester.js — Raccourcis clavier centralisés
   Expose : window.Keyboard

   Remplace les ~13 document.addEventListener('keydown', ...) individuels.
   Un seul listener global — les composants s'enregistrent via Keyboard.register().

   Génère automatiquement la barre de hint #test-hint.
   ============================================================ */

const Keyboard = (() => {
  // { key: [{ fn, label }] }
  const _bindings = {};

  /**
   * Enregistre un raccourci clavier.
   * Plusieurs handlers peuvent s'enregistrer sur la même touche.
   * @param {string}   key   — lettre unique (ex: 't', 'c')
   * @param {Function} fn    — callback()
   * @param {string}   [label] — description pour la barre de hint
   */
  function register(key, fn, label) {
    const k = key.toLowerCase();
    if (!_bindings[k]) _bindings[k] = [];
    _bindings[k].push({ fn, label: label || '' });
  }

  /**
   * Retourne tous les bindings pour générer la barre de hint.
   * @returns {{ key, label }[]}
   */
  function getAll() {
    return Object.entries(_bindings).map(([key, handlers]) => ({
      key,
      label: handlers.map(h => h.label).filter(Boolean).join(', '),
    }));
  }

  // Listener global unique
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    const handlers = _bindings[e.key.toLowerCase()];
    if (!handlers) return;
    handlers.forEach(({ fn }) => {
      try { fn(e); }
      catch (err) { Log.error('Keyboard', `handler '${e.key}' a lancé une exception`, err); }
    });
  });

  /**
   * Met à jour la barre de hint #test-hint avec les touches enregistrées.
   * Appelé par script.js après init de tous les composants.
   */
  function updateHint() {
    const bar = document.getElementById('test-hint');
    if (!bar) return;
    const entries = getAll()
      .sort((a, b) => a.key.localeCompare(b.key))
      .filter(e => e.label)
      .map(e => `<kbd>${e.key.toUpperCase()}</kbd> ${e.label}`);
    bar.innerHTML = entries.join(' &nbsp;·&nbsp; ');
  }

  return { register, getAll, updateHint };
})();

window.Keyboard = Keyboard;
