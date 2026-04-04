'use strict';

/* ============================================================
   core/logger.js — Logger centralisé
   Expose : window.Log
   ============================================================ */

const Log = (() => {
  const LEVELS = { debug: 0, info: 1, warn: 2, error: 3, silent: 4 };
  const COLORS = { debug: '#888', info: '#4fc3f7', warn: '#ffb74d', error: '#ef5350' };
  const ICONS  = { debug: '⚙', info: 'ℹ', warn: '⚠', error: '✖' };

  // En production (OBS) : warn minimum. En dev (?debug) : debug.
  let _level   = LEVELS.warn;
  let _history = [];

  function setLevel(levelName) {
    _level = LEVELS[levelName] ?? LEVELS.warn;
  }

  function debug(scope, ...args) { _log('debug', scope, args); }
  function info (scope, ...args) { _log('info',  scope, args); }
  function warn (scope, ...args) { _log('warn',  scope, args); }
  function error(scope, ...args) { _log('error', scope, args); }

  function _log(level, scope, args) {
    if (LEVELS[level] < _level) return;

    const ts    = new Date().toTimeString().slice(0, 8);
    const color = COLORS[level];
    const icon  = ICONS[level];

    // eslint-disable-next-line no-console
    console[level === 'debug' ? 'log' : level](
      `%c[${ts}] ${icon} [${scope}]`, `color:${color};font-weight:bold`, ...args
    );

    const entry = { ts, level, scope, args: args.map(a => String(a)) };
    _history.push(entry);
    if (_history.length > 200) _history.shift();

    // Le debug panel s'abonne via Bus.on('log:entry', ...)
    // Bus peut ne pas être encore chargé au tout premier log — vérification défensive
    if (window.Bus) Bus.emit('log:entry', entry);
  }

  function getHistory() { return [..._history]; }

  return { setLevel, debug, info, warn, error, getHistory };
})();

window.Log = Log;
