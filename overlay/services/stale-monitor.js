'use strict';

/* ============================================================
   services/stale-monitor.js — Indicateur de mode dégradé
   Expose : window.StaleMonitor

   Surveille deux signaux :
     1. Déconnexion WebSocket (via Bus 'ws:connected' / 'ws:disconnected')
     2. Timestamps trop vieux sur les fichiers JSON critiques

   Affiche un indicateur discret (#stale-indicator) quand les
   conditions sont réunies. Configurable et désactivable.

   Config (section staleMonitor dans config.json) :
     enabled        {boolean} — false par défaut
     wsThreshold    {number}  — secondes avant alerte WS (défaut 30)
     dataThreshold  {number}  — secondes pour timestamp périmé (défaut 120)
     watchFiles     {Array}   — fichiers à surveiller (ex. ['chat','viewers'])
     debugOnly      {boolean} — si true, visible seulement en mode ?debug=1

   L'indicateur n'est jamais montré aux viewers en production si
   debugOnly:true (comportement par défaut).
   ============================================================ */

const StaleMonitor = (() => {

  // État interne
  var _cfg          = null;
  var _wsConnected  = true;
  var _wsLostAt     = null;   // Date.now() au moment de la déconnexion
  var _lastDataTs   = {};     // { file: timestamp_ms }
  var _watchFiles   = [];     // liste des fichiers surveillés
  var _indicator    = null;   // élément DOM
  var _checkTimer   = null;
  var _visible      = false;
  var _isDebugMode  = false;

  /* ── Initialisation ───────────────────────────────────────── */

  function init(cfg) {
    _cfg = cfg || {};

    if (!_cfg.enabled) {
      Log.debug('stale', 'désactivé en config');
      return;
    }

    // Mode debug ?
    _isDebugMode = window.location.search.indexOf('debug=1') !== -1;
    var debugOnly = _cfg.debugOnly !== false; // true par défaut

    if (debugOnly && !_isDebugMode) {
      Log.debug('stale', 'debugOnly — indicateur masqué hors ?debug=1');
      return;
    }

    _createIndicator();
    _listenBus();

    // Polling initial des timestamps (puis rafraîchi à chaque _check)
    _watchFiles = Array.isArray(_cfg.watchFiles) ? _cfg.watchFiles : ['chat', 'viewers'];
    _initDataTimestamps(_watchFiles);

    // Check périodique
    _checkTimer = setInterval(_check, 5000);
    Log.info('stale', 'initialisé (wsThreshold=' + (_cfg.wsThreshold || 30) + 's)');
  }

  /* ── Création de l'élément DOM ────────────────────────────── */

  function _createIndicator() {
    if (_indicator) return;
    _indicator = document.createElement('div');
    _indicator.id = 'stale-indicator';
    _indicator.setAttribute('aria-live', 'polite');
    _indicator.setAttribute('aria-atomic', 'true');
    _indicator.hidden = true;
    document.body.appendChild(_indicator);
  }

  /* ── Écoute du Bus ────────────────────────────────────────── */

  function _listenBus() {
    Bus.on('ws:connected', function() {
      _wsConnected = true;
      _wsLostAt    = null;
      _check();
    });
    Bus.on('ws:disconnected', function() {
      _wsConnected = false;
      if (!_wsLostAt) _wsLostAt = Date.now();
      _check();
    });

    // Mise à jour des timestamps à chaque réception de données
    Bus.on('ws:message', function() {
      _wsConnected = true;
      _wsLostAt    = null;
    });
  }

  /* ── Surveillance des timestamps JSON ────────────────────── */

  function _initDataTimestamps(files) {
    // Rafraîchit les timestamps de chaque fichier surveillé.
    // Appelé au démarrage puis à chaque _check() pour éviter les
    // faux positifs permanents (bug : valeur figée au boot).
    for (var i = 0; i < files.length; i++) {
      (function(file) {
        fetch('data/' + file + '.json?t=' + Date.now())
          .then(function(res) { return res.ok ? res.json() : null; })
          .then(function(data) {
            if (data && data.timestamp) {
              _lastDataTs[file] = data.timestamp;
            }
          })
          .catch(function() {});
      })(files[i]);
    }
  }

  /* ── Vérification de l'état ───────────────────────────────── */

  function _check() {
    if (!_indicator) return;

    // Rafraîchit les timestamps avant chaque évaluation
    // (évite les faux positifs permanents après le seuil initial)
    _initDataTimestamps(_watchFiles);

    var wsThreshold   = Number(_cfg.wsThreshold)   || 30;
    var dataThreshold = Number(_cfg.dataThreshold)  || 120;
    var now           = Date.now();
    var reasons       = [];

    // WS déconnecté depuis trop longtemps ?
    if (!_wsConnected && _wsLostAt) {
      var wsAge = (now - _wsLostAt) / 1000;
      if (wsAge >= wsThreshold) {
        reasons.push('WS ' + Math.round(wsAge) + 's');
      }
    }

    // Timestamps de fichiers périmés ?
    var files = Object.keys(_lastDataTs);
    for (var i = 0; i < files.length; i++) {
      var ts  = _lastDataTs[files[i]];
      var age = (now - ts) / 1000;
      if (age >= dataThreshold) {
        reasons.push(files[i] + ' ' + Math.round(age) + 's');
      }
    }

    var shouldShow = reasons.length > 0;
    if (shouldShow !== _visible) {
      _visible = shouldShow;
      _render(shouldShow, reasons);
    }
  }

  /* ── Rendu ────────────────────────────────────────────────── */

  function _render(show, reasons) {
    if (!_indicator) return;
    if (!show) {
      _indicator.hidden = true;
      return;
    }
    // Le contenu est uniquement du texte statique + données internes — pas de données utilisateur
    _indicator.textContent = 'Mode dégradé : ' + reasons.join(', ');
    _indicator.hidden = false;
    Log.warn('stale', 'mode dégradé actif (' + reasons.join(', ') + ')');
  }

  return { init };
})();

window.StaleMonitor = StaleMonitor;
