'use strict';

/* ============================================================
   utils/color.js — Gestion des couleurs (chat, badges…)
   ============================================================ */

const _FALLBACK_COLORS = [
  '#FF6B6B', '#FF9F43', '#FECA57', '#48DBFB',
  '#FF9FF3', '#54A0FF', '#A29BFE', '#00CEC9',
  '#FD79A8', '#6C5CE7', '#00B894', '#E17055',
];

/**
 * Vérifie si une couleur hex Twitch est utilisable.
 * @param {string} hex
 * @returns {boolean}
 */
function isValidColor(hex) {
  if (!hex || hex.trim() === '') return false;
  const h = hex.replace('#', '').toLowerCase();
  return h !== '000000' && /^[0-9a-f]{6}$/.test(h);
}

/**
 * Crée un assigner de couleur avec cache propre par composant.
 * Usage : const getColor = createColorAssigner();
 *         const color = getColor('pseudo', '#ff0000');
 * @returns {Function}
 */
function createColorAssigner() {
  const cache  = {};
  let   cursor = 0;
  return function getColor(user, rawColor) {
    if (isValidColor(rawColor)) return rawColor;
    if (!cache[user]) {
      cache[user] = _FALLBACK_COLORS[cursor % _FALLBACK_COLORS.length];
      cursor++;
    }
    return cache[user];
  };
}

window.isValidColor        = isValidColor;
window.createColorAssigner = createColorAssigner;
