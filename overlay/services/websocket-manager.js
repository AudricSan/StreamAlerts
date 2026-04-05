'use strict';

/* ============================================================
   services/websocket-manager.js — Connexion WebSocket Streamer.bot
   Expose : window.WSManager

   Connexion unique à l'API WebSocket Streamer.bot.
   Gère Hello → Auth (SHA-256) → Subscribe.
   Distribue tous les événements via Bus.emit('ws:message', ...).
   Reconnexion automatique toutes les 3s si déconnexion.

   Composants clients : écouter Bus.on('ws:message', fn)
   ============================================================ */

const WSManager = (() => {
  let _ws        = null;
  let _url       = null;
  let _password  = '';
  let _retryTimer = null;

  /** Calcule base64(SHA-256(str)) via Web Crypto API. */
  async function _sha256b64(str) {
    const buf = await crypto.subtle.digest(
      'SHA-256', new TextEncoder().encode(str)
    );
    return btoa(String.fromCharCode(...new Uint8Array(buf)));
  }

  /**
   * Initializes connection using configuration.
   */
  function init() {
    const cfg = Config.get('env');
    connect(cfg.websocket, cfg.websocketPassword);
  }

  /**
   * Démarre la connexion WebSocket.
   * @param {string} url      — ex: 'ws://127.0.0.1:8080'
   * @param {string} password — mot de passe Streamer.bot
   */
  function connect(url, password) {
    if (!url) return;
    _url      = url;
    _password = password || '';
    _tryConnect();
  }

  function _tryConnect() {
    clearTimeout(_retryTimer);
    let ws;
    try { ws = new WebSocket(_url); }
    catch (_) { _scheduleRetry(); return; }
    _ws = ws;

    ws.onopen  = () => Log.debug('WS', 'socket ouverte, attente Hello...');
    ws.onerror = () => ws.close();

    ws.onclose = () => {
      Store.set('ws', 'connected', false);
      Bus.emit('ws:disconnected', {});
      Log.warn('WS', 'déconnecté — retry dans 3s');
      _scheduleRetry();
    };

    ws.onmessage = async (event) => {
      let msg;
      try { msg = JSON.parse(event.data); }
      catch (_) { return; }

      const src  = msg.event?.source;
      const type = msg.event?.type;

      // ── Hello : authentification ou souscription directe ──
      if (src === 'General' && type === 'Hello') {
        const authData = msg.data?.authentication;
        if (authData && _password.trim()) {
          const secret = await _sha256b64(_password.trim() + authData.salt);
          const hash   = await _sha256b64(secret + authData.challenge);
          ws.send(JSON.stringify({
            request: 'Authenticate', id: 'auth', authentication: hash,
          }));
        } else {
          _subscribe(ws);
        }
        return;
      }

      // ── Réponse authentification ──
      if (msg.id === 'auth') {
        if (msg.status === 'ok') {
          _subscribe(ws);
        } else {
          Log.error('WS', 'Authentification échouée — vérifier le mot de passe');
          ws.close();
        }
        return;
      }

      // ── Souscription confirmée ──
      if (msg.id === 'sub-all' && msg.status === 'ok') {
        Store.set('ws', 'connected', true);
        Bus.emit('ws:connected', {});
        Log.info('WS', `connecté à ${_url}`);
        return;
      }

      // ── Distribuer tous les événements Twitch via le Bus ──
      if (src && type) {
        Bus.emit('ws:message', { source: src, type, data: msg.data, raw: msg });
      }
    };
  }

  function _subscribe(ws) {
    ws.send(JSON.stringify({
      request: 'Subscribe',
      id:      'sub-all',
      events: {
        Twitch: ['ChatMessage', 'ClearChat', 'ChatCleared'],
      },
    }));
  }

  function _scheduleRetry() {
    _retryTimer = setTimeout(_tryConnect, 3000);
  }

  function isConnected() {
    return Store.get('ws', 'connected', false);
  }

  return { init, connect, isConnected };
})();

window.WSManager = WSManager;
