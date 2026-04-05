'use strict';

/* ============================================================
   utils/dom.js — Utilitaires DOM partagés
   Chargé après core/, avant services/ et components/.
   ============================================================ */

/**
 * Échappe les caractères HTML dangereux.
 * Utiliser sur TOUT contenu utilisateur (pseudo Twitch, messages, titres…)
 * avant injection dans innerHTML ou dans des attributs HTML.
 *
 * @param  {*} v  — valeur quelconque
 * @returns {string}
 */
function esc(v) {
  if (v == null) return '';
  return String(v)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#39;');
}

window.esc = esc;

/**
 * Retourne le libellé configuré pour une clé donnée.
 * Consulte Config.get('labels.<key>') ; retourne `key` en fallback.
 *
 * @param  {string} key  — clé du libellé (ex. 'viewers', 'goal', …)
 * @returns {string}
 */
function labelFor(key) {
  if (window.Config && typeof Config.get === 'function') {
    var val = Config.get('labels.' + key);
    if (val != null && val !== '') return val;
  }
  return key;
}

window.labelFor = labelFor;
