'use strict';

/* ============================================================
   utils/dom.js — Utilitaires DOM partagés
   Chargé avant tous les composants.
   ============================================================ */

/**
 * Échappe les caractères HTML dangereux.
 * À utiliser sur TOUT contenu utilisateur injecté dans innerHTML.
 * @param {*} v
 * @returns {string}
 */
function esc(v) {
  if (v == null) return '';
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

window.esc = esc;
