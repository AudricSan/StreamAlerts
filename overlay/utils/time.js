'use strict';

/* ============================================================
   utils/time.js — Formatage du temps
   ============================================================ */

/**
 * Formate un temps restant (ms) en "MM:SS" ou "H:MM:SS".
 * @param {number} ms
 * @returns {string}
 */
function formatCountdown(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0
    ? `${h}:${_pad(m)}:${_pad(s)}`
    : `${_pad(m)}:${_pad(s)}`;
}

/**
 * Formate un temps écoulé (ms) en "Xh YYm" ou "Ym ZZs".
 * @param {number} ms
 * @returns {string}
 */
function formatUptime(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0 ? `${h}h ${_pad(m)}m` : `${m}m ${_pad(s)}s`;
}

function _pad(n) { return String(n).padStart(2, '0'); }

window.formatCountdown = formatCountdown;
window.formatUptime    = formatUptime;
