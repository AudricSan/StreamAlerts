'use strict';

/* ============================================================
   services/websocket-manager.js — Connexion WebSocket Streamer.bot
   Expose : window.WSManager

   Flux : Connect → Hello → Authenticate (SHA-256) → Subscribe → Events
   Distribue les événements via Bus.emit('ws:message', { source, type, data, raw }).
   Reconnexion automatique toutes les 3 s sur déconnexion.

   Les composants n'ouvrent PAS leur propre WebSocket.
   Ils écoutent : Bus.on('ws:message', fn)
   ============================================================ */

const WSManager = (() => {
  let _ws          = null;
  let _url         = '';
  let _password    = '';
  let _retryTimer  = null;
  let _intentional = false; // true = disconnect volontaire (pas de retry)

  /* ---------------------------------------------------------- */
  /* API publique                                                */
  /* ---------------------------------------------------------- */

  /** Lit la config (section env) et démarre la connexion. */
  function init() {
    const cfg = Config.get('env');
    connect(cfg.websocket, cfg.websocketPassword);
  }

  /**
   * Démarre la connexion WebSocket.
   * @param {string} url      ex: 'ws://127.0.0.1:8080'
   * @param {string} password Mot de passe Streamer.bot (peut être vide)
   */
  function connect(url, password) {
    if (!url) {
      Log.warn('ws', 'URL manquante — connexion ignorée');
      return;
    }
    _url         = url;
    _password    = password || '';
    _intentional = false;
    _tryConnect();
  }

  /** Déconnecte sans relancer. */
  function disconnect() {
    _intentional = true;
    clearTimeout(_retryTimer);
    if (_ws) _ws.close();
  }

  /** @returns {boolean} */
  function isConnected() {
    return Store.get('ws', 'connected', false);
  }

  /* ---------------------------------------------------------- */
  /* Connexion interne                                           */
  /* ---------------------------------------------------------- */

  function _tryConnect() {
    clearTimeout(_retryTimer);
    if (_ws) { try { _ws.close(); } catch (e) {} }

    let ws;
    try {
      ws = new WebSocket(_url);
    } catch (e) {
      Log.warn('ws', 'Impossible d\'ouvrir la socket:', e.message);
      _scheduleRetry();
      return;
    }
    _ws = ws;

    ws.onopen  = function() { Log.debug('ws', 'socket ouverte, attente Hello...'); };
    ws.onerror = function() { ws.close(); };

    ws.onclose = function() {
      Store.set('ws', 'connected', false);
      Bus.emit('ws:disconnected', {});
      if (!_intentional) {
        Log.warn('ws', 'déconnecté — retry dans 3 s');
        _scheduleRetry();
      }
    };

    ws.onmessage = function(event) {
      let msg;
      try {
        msg = JSON.parse(event.data);
      } catch (e) {
        Log.debug('ws', 'message non-JSON ignoré:', e.message);
        return;
      }

      _handleMessage(ws, msg);
    };
  }

  function _handleMessage(ws, msg) {
    const evtObj = msg.event && typeof msg.event === 'object' ? msg.event : null;
    const src    = evtObj ? evtObj.source : null;
    const type   = evtObj ? evtObj.type   : null;
    const mdata  = msg.data && typeof msg.data === 'object' ? msg.data : null;

    // ── Hello : authentification ou souscription directe ──────
    if (src === 'General' && type === 'Hello') {
      const authData = mdata ? mdata.authentication : null;
      if (authData && _password.trim()) {
        _authenticate(ws, authData);
      } else {
        _subscribe(ws);
      }
      return;
    }

    // ── Réponse Authenticate ───────────────────────────────────
    if (msg.id === 'auth') {
      if (msg.status === 'ok') {
        _subscribe(ws);
      } else {
        Log.error('ws', 'Authentification échouée — vérifier le mot de passe');
        ws.close();
      }
      return;
    }

    // ── Souscription confirmée ─────────────────────────────────
    if (msg.id === 'sub-all' && msg.status === 'ok') {
      Store.set('ws', 'connected', true);
      Bus.emit('ws:connected', {});
      Log.info('ws', 'connecté à ' + _url);
      return;
    }

    // ── Distribuer tous les événements via le Bus ──────────────
    if (src && type) {
      Bus.emit('ws:message', { source: src, type: type, data: mdata, raw: msg });
    }
  }

  /* ---------------------------------------------------------- */
  /* Authentification SHA-256                                    */
  /* ---------------------------------------------------------- */

  async function _authenticate(ws, authData) {
    try {
      const secret = await _sha256b64(_password.trim() + authData.salt);
      const hash   = await _sha256b64(secret + authData.challenge);
      ws.send(JSON.stringify({
        request: 'Authenticate', id: 'auth', authentication: hash,
      }));
    } catch (e) {
      Log.error('ws', 'Erreur calcul hash auth:', e.message);
      ws.close();
    }
  }

  /** Calcule base64(SHA-256(str)) via Web Crypto API (localhost = contexte sécurisé). */
  async function _sha256b64(str) {
    const buf   = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    const bytes = new Uint8Array(buf);
    let binary  = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /* ---------------------------------------------------------- */
  /* Souscription et retry                                       */
  /* ---------------------------------------------------------- */

  function _subscribe(ws) {
    ws.send(JSON.stringify({
      request: 'Subscribe',
      id:      'sub-all',
      events:  {
        Twitch: ['ChatMessage', 'ClearChat', 'ChatCleared'],
      },
    }));
  }

  function _scheduleRetry() {
    _retryTimer = setTimeout(_tryConnect, 3000);
  }

  return { init, connect, disconnect, isConnected };
})();

window.WSManager = WSManager;
