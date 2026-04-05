'use strict';

/* ============================================================
   utils/time.js — Formatage des durées
   Chargé après core/, avant services/ et components/.
   ============================================================ */

/**
 * Formate un temps restant (ms) en "MM:SS" ou "H:MM:SS".
 * @param  {number} ms
 * @returns {string}
 */
function formatCountdown(ms) {
  var total = Math.max(0, Math.floor(ms / 1000));
  var h = Math.floor(total / 3600);
  var m = Math.floor((total % 3600) / 60);
  var s = total % 60;
  return h > 0
    ? h + ':' + _pad(m) + ':' + _pad(s)
    : _pad(m) + ':' + _pad(s);
}

/**
 * Formate un temps écoulé (ms) en "Xh YYm" ou "Ym ZZs".
 * @param  {number} ms
 * @returns {string}
 */
function formatUptime(ms) {
  var total = Math.max(0, Math.floor(ms / 1000));
  var h = Math.floor(total / 3600);
  var m = Math.floor((total % 3600) / 60);
  var s = total % 60;
  return h > 0 ? h + 'h ' + _pad(m) + 'm' : m + 'm ' + _pad(s) + 's';
}

function _pad(n) {
  var s = String(n);
  return s.length < 2 ? '0' + s : s;
}

window.formatCountdown = formatCountdown;
window.formatUptime    = formatUptime;
