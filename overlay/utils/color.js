'use strict';

/* ============================================================
   utils/color.js — Gestion des couleurs (chat, badges…)
   Chargé après core/, avant services/ et components/.
   ============================================================ */

var _CHAT_COLORS = [
  '#FF6B6B', '#FF9F43', '#FECA57', '#48DBFB',
  '#FF9FF3', '#54A0FF', '#A29BFE', '#00CEC9',
  '#FD79A8', '#6C5CE7', '#00B894', '#E17055',
];

/**
 * Vérifie si une couleur hex Twitch est exploitable (non vide, non noir).
 * @param  {string} hex
 * @returns {boolean}
 */
function isValidColor(hex) {
  if (!hex || hex.trim() === '') return false;
  var h = hex.replace('#', '').toLowerCase();
  return h !== '000000' && /^[0-9a-f]{6}$/.test(h);
}

/**
 * Crée un assigner de couleur avec cache propre par composant.
 * Retourne toujours une couleur valide : la couleur Twitch si dispo,
 * sinon une couleur de fallback persistante pour ce pseudo.
 *
 * Usage :
 *   var getColor = createColorAssigner();
 *   var color = getColor('pseudo', '#ff0000');
 *
 * @returns {Function} getColor(user, rawColor) → string
 */
function createColorAssigner() {
  var cache  = {};
  var cursor = 0;
  return function(user, rawColor) {
    if (isValidColor(rawColor)) return rawColor;
    if (!cache[user]) {
      cache[user] = _CHAT_COLORS[cursor % _CHAT_COLORS.length];
      cursor++;
    }
    return cache[user];
  };
}

window.isValidColor        = isValidColor;
window.createColorAssigner = createColorAssigner;
