'use strict';

/* ============================================================
   core/logger.js — Journalisation centralisée
   Expose : window.Log
   Chargé en premier parmi les modules core.
   ============================================================ */

const Log = (() => {
  const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
  const COLORS = { debug: '#888', info: '#4fc3f7', warn: '#ffb74d', error: '#ef5350' };
  const ICONS  = { debug: '⚙', info: 'ℹ', warn: '⚠', error: '✖' };

  // Niveau par défaut : warn (prod). Passe à debug si ?debug=1 dans l'URL.
  const _isDebug = location.search.indexOf('debug=1') !== -1;
  let _minLevel  = _isDebug ? LEVELS.debug : LEVELS.warn;
  let _history   = [];

  function setLevel(levelName) {
    if (LEVELS[levelName] !== undefined) {
      _minLevel = LEVELS[levelName];
    }
  }

  function debug(scope, ...args) { _log('debug', scope, args); }
  function info (scope, ...args) { _log('info',  scope, args); }
  function warn (scope, ...args) { _log('warn',  scope, args); }
  function error(scope, ...args) { _log('error', scope, args); }

  function _log(level, scope, args) {
    if (LEVELS[level] < _minLevel) return;

    const ts     = new Date().toTimeString().slice(0, 8);
    const method = level === 'debug' ? 'log' : level;

    // eslint-disable-next-line no-console
    console[method](
      `%c[${ts}] ${ICONS[level]} [${scope}]`,
      `color:${COLORS[level]};font-weight:bold`,
      ...args
    );

    const entry = { ts, level, scope, args: args.map(a => String(a)) };
    _history.push(entry);
    if (_history.length > 200) _history.shift();

    // Bus peut ne pas être encore chargé au premier log — vérification défensive
    if (window.Bus) Bus.emit('log:entry', entry);
  }

  function getHistory() { return _history.slice(); }
  function isDebug()    { return _isDebug; }

  return { setLevel, debug, info, warn, error, getHistory, isDebug };
})();

window.Log = Log;
