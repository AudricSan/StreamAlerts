'use strict';

/* ============================================================
   Composant : Chat overlay
   Affiche les messages du chat Twitch en temps réel.

   Expose : window.Chat  →  { init() }
   Zone HTML  : #zone-chat
   Données    : data/chat.json
   Test       : touche C pour simuler des messages
   ============================================================ */

const Chat = (() => {

  // ── CONSTANTES ──────────────────────────────────────────────

  const POLL_INTERVAL = 300;    // ms — plus rapide que les alertes
  const EXPIRE_ANIM            = 600;   // ms pour l'animation de sortie
  const MSG_LIFETIME_DEFAULT   = 30000; // ms — surchargeable via config.json
  const MAX_MESSAGES_DEFAULT   = 14;    // — surchargeable via config.json
  const LS_KEY                 = 'streamalerts_chat'; // clé localStorage

  let msgLifetime = MSG_LIFETIME_DEFAULT;
  let maxMessages = MAX_MESSAGES_DEFAULT;

  // Palette de fallback pour les users sans couleur Twitch
  const FALLBACK_COLORS = [
    '#FF6B6B', '#FF9F43', '#FECA57', '#48DBFB',
    '#FF9FF3', '#54A0FF', '#A29BFE', '#00CEC9',
    '#FD79A8', '#6C5CE7', '#00B894', '#E17055',
  ];

  // Icônes de badges
  const BADGES = {
    broadcaster: { icon: '📺', title: 'Broadcaster' },
    moderator: { icon: '⚔️', title: 'Modérateur' },
    vip: { icon: '💎', title: 'VIP' },
    subscriber: { icon: '⭐', title: 'Abonné' },
  };

  // Messages de test (touche C)
  const TEST_MSGS = [
    { user: 'NouveauVenu', color: '', message: "Salut tout le monde ! Premier stream ici", isSub: false, isMod: false, isVip: false, isBroadcaster: false },
    { user: 'FanAcharne', color: '#FF6B6B', message: "PogChamp c'est trop bien ce soir !!", isSub: true, isMod: false, isVip: false, isBroadcaster: false },
    { user: 'ModéReateur', color: '#54A0FF', message: "Bienvenue à tous les nouveaux viewers !", isSub: true, isMod: true, isVip: false, isBroadcaster: false },
    { user: 'VipLégendaire', color: '#FECA57', message: "GG les gars, on est presque au goal !", isSub: true, isMod: false, isVip: true, isBroadcaster: false },
    { user: 'SubFidèle', color: '#FF9FF3', message: "J'adore le contenu, continue comme ça !", isSub: true, isMod: false, isVip: false, isBroadcaster: false },
    { user: 'JusteLà', color: '#48DBFB', message: "LUL t'as vu ce qui vient de se passer ?", isSub: false, isMod: false, isVip: false, isBroadcaster: false },
    { user: 'AutreGars', color: '#A29BFE', message: "Ce stream est vraiment incroyable Clap", isSub: false, isMod: false, isVip: false, isBroadcaster: false },
    { user: 'ChatActif', color: '#00B894', message: "Hype pour la suite, on y croit !", isSub: true, isMod: false, isVip: false, isBroadcaster: false },
  ];

  // ── ÉTAT ────────────────────────────────────────────────────

  let container;
  let lastTimestamp = 0;
  let initialized   = false; // true après le premier poll (fallback uniquement)
  let wsConnected   = false; // true quand le WebSocket Streamer.bot est actif
  let testIndex = 0;
  let colorCache = {}; // pseudo → couleur assignée
  let colorCursor = 0;

  // ── LOCALSTORAGE ─────────────────────────────────────────────

  // Charge les messages non expirés depuis localStorage
  function lsLoad() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return [];
      const now = Date.now();
      return JSON.parse(raw).filter(m => m.addedAt && (now - m.addedAt) < msgLifetime);
    } catch (_) { return []; }
  }

  // Sauvegarde un message (sans dupliquer)
  function lsSave(data, addedAt) {
    try {
      const msgs = lsLoad();
      if (msgs.some(m => m.data.timestamp === data.timestamp)) return;
      msgs.push({ data, addedAt });
      localStorage.setItem(LS_KEY, JSON.stringify(msgs.slice(-maxMessages)));
    } catch (_) {}
  }

  // Supprime un message par son timestamp
  function lsRemove(timestamp) {
    try {
      const msgs = lsLoad().filter(m => m.data.timestamp !== timestamp);
      localStorage.setItem(LS_KEY, JSON.stringify(msgs));
    } catch (_) {}
  }

  // ── COULEUR ─────────────────────────────────────────────────

  // Vérifie si une couleur hex Twitch est utilisable (pas vide, pas #000000)
  function isValidColor(hex) {
    if (!hex || hex.trim() === '') return false;
    const h = hex.replace('#', '').toLowerCase();
    return h !== '000000' && /^[0-9a-f]{6}$/.test(h);
  }

  // Récupère ou assigne une couleur pour un pseudo
  function getColor(user, rawColor) {
    if (isValidColor(rawColor)) return rawColor;
    if (!colorCache[user]) {
      colorCache[user] = FALLBACK_COLORS[colorCursor % FALLBACK_COLORS.length];
      colorCursor++;
    }
    return colorCache[user];
  }

  // ── BADGES ──────────────────────────────────────────────────

  function buildBadgesHTML(msg) {
    const list = [];
    if (msg.isBroadcaster) list.push(BADGES.broadcaster);
    else if (msg.isMod) list.push(BADGES.moderator);
    if (msg.isVip) list.push(BADGES.vip);
    if (msg.isSub) list.push(BADGES.subscriber);

    if (list.length === 0) return '';

    return `<span class="chat-badges" aria-hidden="true">${list.map(b => `<span class="chat-badge" title="${b.title}">${b.icon}</span>`).join('')
      }</span>`;
  }

  // ── CRÉATION D'UN MESSAGE ────────────────────────────────────

  function createMsgEl(data) {
    const color = getColor(data.user, data.color);
    const badges = buildBadgesHTML(data);

    const el = document.createElement('div');
    el.className = 'chat-msg';
    el.style.setProperty('--msg-color', color);

    el.innerHTML =
      `${badges}` +
      `<span class="chat-username">${esc(data.user)}</span>` +
      `<span class="chat-sep">: </span>` +
      `<span class="chat-text">${esc(data.message)}</span>`;

    return el;
  }

  // ── AFFICHAGE ────────────────────────────────────────────────

  // remainingLifetime : durée restante en ms (utilisé pour la restauration depuis LS)
  function addMessage(data, remainingLifetime) {
    if (!data.message || !data.user) return;

    // Supprimer le plus ancien si on atteint la limite
    const existing = container.querySelectorAll('.chat-msg');
    if (existing.length >= maxMessages) {
      removeMessage(existing[0], true);
    }

    const el = createMsgEl(data);
    container.appendChild(el);

    // Entrée : mesure la hauteur réelle puis anime (évite le saut brutal des messages existants)
    requestAnimationFrame(() => {
      el.style.maxHeight  = el.scrollHeight + 'px';
      el.style.marginTop  = '3px';
      requestAnimationFrame(() => el.classList.add('visible'));
    });

    // Expiration automatique
    const lifetime = remainingLifetime ?? msgLifetime;
    const expiryTimer = setTimeout(() => removeMessage(el, false), lifetime);
    el._expiryTimer = expiryTimer;
    el._msgTimestamp = data.timestamp;

    // Sauvegarder en localStorage uniquement pour les nouveaux messages (pas la restauration)
    if (remainingLifetime == null) {
      lsSave(data, Date.now());
    }
  }

  function removeMessage(el, immediate) {
    if (!el || !el.parentNode) return;
    clearTimeout(el._expiryTimer);
    lsRemove(el._msgTimestamp);

    if (immediate) {
      el.remove();
      return;
    }

    el.classList.remove('visible');
    el.classList.add('expiring');
    // Anime la hauteur vers 0 pour que les messages du dessous remontent doucement
    requestAnimationFrame(() => {
      el.style.maxHeight = '0';
      el.style.marginTop = '0';
    });
    setTimeout(() => el.remove(), EXPIRE_ANIM);
  }

  // ── API WEBSOCKET STREAMER.BOT ───────────────────────────────
  // Connexion à l'API WebSocket native de Streamer.bot.
  // Souscrit directement aux événements Twitch.ChatMessage — aucune action C# requise.
  // Authentification SHA-256 si un mot de passe est configuré.
  // Si la connexion échoue ou se coupe, le polling JSON reprend automatiquement.

  // Calcule base64(SHA-256(str)) via Web Crypto API
  async function sha256b64(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return btoa(String.fromCharCode(...new Uint8Array(buf)));
  }

  function connectStreamerbot(url, password) {
    if (!url) return;

    function tryConnect() {
      let ws;
      try { ws = new WebSocket(url); } catch (_) { return; }

      ws.onmessage = async (event) => {
        let msg;
        try { msg = JSON.parse(event.data); } catch (_) { return; }

        const src  = msg.event?.source;
        const type = msg.event?.type;

        // ── Hello : authentification puis souscription ──
        if (src === 'General' && type === 'Hello') {
          const authData = msg.data?.authentication;
          if (authData && password && password.trim()) {
            // Authentification : secret = SHA256(password + salt), auth = SHA256(secret + challenge)
            const secret = await sha256b64(password.trim() + authData.salt);
            const hash   = await sha256b64(secret + authData.challenge);
            ws.send(JSON.stringify({ request: 'Authenticate', id: 'auth', authentication: hash }));
          } else {
            subscribe(ws);
          }
          return;
        }

        // ── Réponse à l'authentification ──
        if (msg.id === 'auth') {
          if (msg.status === 'ok') { subscribe(ws); }
          else { console.warn('[Chat] Authentification Streamer.bot échouée — vérifier le mot de passe.'); }
          return;
        }

        // ── Souscription confirmée ──
        if (msg.id === 'sub-chat' && msg.status === 'ok') {
          wsConnected = true;
          return;
        }

        // ── Événement ChatMessage ──
        if (src === 'Twitch' && type === 'ChatMessage') {
          const m = msg.data?.message;
          if (!m?.message || !m?.displayName) return;
          addMessage({
            user:          m.displayName,
            message:       m.message,
            color:         m.color         || '',
            isSub:         !!m.isSubscriber,
            isMod:         !!m.isModerator,
            isVip:         !!m.isVip,
            isBroadcaster: !!m.isBroadcaster,
            timestamp:     Date.now(),
          });
        }
      };

      ws.onclose = () => {
        wsConnected  = false;
        initialized  = false; // le polling reprend proprement
        setTimeout(tryConnect, 3000);
      };

      ws.onerror = () => ws.close();
    }

    function subscribe(ws) {
      ws.send(JSON.stringify({
        request: 'Subscribe',
        id:      'sub-chat',
        events:  { Twitch: ['ChatMessage'] },
      }));
    }

    tryConnect();
  }

  // ── POLLING (fallback si WebSocket indisponible) ──────────────

  async function poll() {
    if (wsConnected) return; // WebSocket actif → pas besoin de polling
    try {
      const res = await fetch(`data/chat.json?t=${Date.now()}`);
      if (!res.ok) return;

      const data = await res.json();

      if (!data || typeof data.timestamp !== 'number' || data.timestamp <= 0) return;

      if (!initialized) {
        initialized   = true;
        lastTimestamp = data.timestamp;
        // Afficher si le message est récent et pas déjà restauré depuis localStorage
        const isRecent     = (Date.now() - data.timestamp) < msgLifetime;
        const alreadyShown = [...container.querySelectorAll('.chat-msg')]
          .some(el => el._msgTimestamp === data.timestamp);
        if (isRecent && !alreadyShown && data.user && data.message) {
          addMessage(data);
        }
        return;
      }

      if (data.timestamp !== lastTimestamp && data.user && data.message) {
        lastTimestamp = data.timestamp;
        addMessage(data);
      }
    } catch (_) {
      // Fichier absent ou malformé → silence
    }
  }

  // ── MODE TEST (touche C) ─────────────────────────────────────

  function onKeyDown(e) {
    if (e.key.toLowerCase() !== 'c') return;
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    const base = TEST_MSGS[testIndex % TEST_MSGS.length];
    testIndex++;
    addMessage({ ...base, timestamp: Date.now() });
  }

  // ── UTILITAIRES ──────────────────────────────────────────────

  function esc(v) {
    if (v == null) return '';
    return String(v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── INIT ─────────────────────────────────────────────────────

  function init(cfg = {}) {
    container = document.getElementById('zone-chat');
    if (cfg.msgLifetime != null) msgLifetime = cfg.msgLifetime;
    if (cfg.maxMessages != null) maxMessages = cfg.maxMessages;

    // Restaurer les messages survivants depuis localStorage (après rechargement OBS)
    const now = Date.now();
    lsLoad().forEach(({ data, addedAt }) => {
      const remaining = msgLifetime - (now - addedAt);
      if (remaining > 500) addMessage(data, remaining);
    });

    // WebSocket Streamer.bot (temps réel) — fallback sur polling si indisponible
    connectStreamerbot(cfg.websocket, cfg.websocketPassword);
    setInterval(poll, POLL_INTERVAL);
    document.addEventListener('keydown', onKeyDown);
  }

  return { init };

})();
