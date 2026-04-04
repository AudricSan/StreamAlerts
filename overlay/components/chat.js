'use strict';

/* ============================================================
   Composant : Chat overlay
   Expose : window.Chat  →  { init() }
   Zone    : #zone-chat  |  Données : data/chat.json (fallback)
   Test    : touche C

   Mode primaire  : WebSocket Streamer.bot (via WSManager + Bus)
   Mode fallback  : polling data/chat.json si WS indisponible
   Persistance    : localStorage (messages survivent au reload OBS)
   ============================================================ */

const _CHAT_BADGES = {
  broadcaster: { icon: '📺', title: 'Broadcaster' },
  moderator:   { icon: '⚔️', title: 'Modérateur'  },
  vip:         { icon: '💎', title: 'VIP'          },
  subscriber:  { icon: '⭐', title: 'Abonné'       },
};

class ChatComponent extends BaseComponent {
  constructor() {
    super({
      name:         'chat',
      zoneId:       'zone-chat',
      dataFile:     'chat.json',
      pollInterval: 300,
      testKey:      'c',
      testData: [
        { user: 'NouveauVenu',   color: '',        message: "Salut tout le monde ! Premier stream ici", isSub: false, isMod: false, isVip: false, isBroadcaster: false },
        { user: 'FanAcharne',    color: '#FF6B6B', message: "PogChamp c'est trop bien ce soir !!", isSub: true, isMod: false, isVip: false, isBroadcaster: false },
        { user: 'ModéReateur',   color: '#54A0FF', message: "Bienvenue à tous les nouveaux viewers !", isSub: true, isMod: true, isVip: false, isBroadcaster: false },
        { user: 'VipLégendaire', color: '#FECA57', message: "GG les gars, on est presque au goal !", isSub: true, isMod: false, isVip: true, isBroadcaster: false },
        { user: 'SubFidèle',     color: '#FF9FF3', message: "J'adore le contenu, continue comme ça !", isSub: true, isMod: false, isVip: false, isBroadcaster: false },
        { user: 'JusteLà',       color: '#48DBFB', message: "LUL t'as vu ce qui vient de se passer ?", isSub: false, isMod: false, isVip: false, isBroadcaster: false },
        { user: 'AutreGars',     color: '#A29BFE', message: "Ce stream est vraiment incroyable Clap", isSub: false, isMod: false, isVip: false, isBroadcaster: false },
        { user: 'ChatActif',     color: '#00B894', message: "Hype pour la suite, on y croit !", isSub: true, isMod: false, isVip: false, isBroadcaster: false },
      ],
    });
    this._msgLifetime = 30000;
    this._maxMessages = 14;
    this._getColor    = null; // assigné dans setup()
    this._LS_KEY      = 'streamalerts_chat';
  }

  // ── Init ─────────────────────────────────────────────────────

  setup(cfg) {
    this._msgLifetime = cfg.msgLifetime ?? 30000;
    this._maxMessages = cfg.maxMessages ?? 14;
    this._getColor    = createColorAssigner();

    // Restaurer les messages survivants depuis localStorage
    this._restoreFromLS();

    // Écouter les événements WebSocket distribués par WSManager
    Bus.on('ws:message', (msg) => this._onWsMessage(msg));
    Bus.on('ws:connected', () => {
      Log.info('Chat', 'WebSocket actif — polling suspendu');
      Poller.unregister('chat');
    });
    Bus.on('ws:disconnected', () => {
      Log.info('Chat', 'WebSocket KO — polling repris');
      Poller.register({
        id:       this.name,
        file:     this.dataFile,
        interval: this.cfg.pollInterval || this.pollInterval,
        onData:   (data) => this.onData(data),
      });
    });

    // Démarrer la connexion WebSocket si configurée
    if (cfg.websocket) {
      WSManager.connect(cfg.websocket, cfg.websocketPassword);
    }
  }

  // ── Données (fallback polling) ────────────────────────────────

  onData(data) {
    // WebSocket actif → le polling JSON est ignoré
    if (WSManager.isConnected()) return;
    if (!data.user || !data.message) return;
    this._addMessage(data);
  }

  // ── WebSocket ─────────────────────────────────────────────────

  _onWsMessage({ source, type, data }) {
    if (source !== 'Twitch') return;

    if (type === 'ClearChat' || type === 'ChatCleared') {
      this._clearAll();
      return;
    }

    if (type === 'ChatMessage') {
      const m = data?.message;
      if (!m?.message || !m?.displayName) return;
      this._addMessage({
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
  }

  // ── Messages ──────────────────────────────────────────────────

  _addMessage(data, remainingLifetime) {
    if (!data.message || !data.user) return;

    // Commandes modérateur / broadcaster uniquement
    if (data.isMod || data.isBroadcaster) {
      const cmd = data.message.trim();

      if (cmd.toLowerCase() === '!clear') {
        this._clearAll();
        return;
      }

      const visMatch = cmd.match(/^!(show|hide|toggle)\s+(\S+)/i);
      if (visMatch) {
        Bus.emit('visibility:cmd', {
          action: visMatch[1].toLowerCase(),
          name:   visMatch[2].toLowerCase(),
        });
        return; // ne pas afficher la commande dans le chat
      }
    }

    // Supprimer le plus ancien si on dépasse la limite
    const existing = this.zone.querySelectorAll('.chat-msg');
    if (existing.length >= this._maxMessages) {
      this._removeMessage(existing[0], true);
    }

    const el = this._createMsgEl(data);
    this.zone.appendChild(el);

    requestAnimationFrame(() => {
      el.style.maxHeight = el.scrollHeight + 'px';
      el.style.marginTop = '3px';
      requestAnimationFrame(() => el.classList.add('visible'));
    });

    const lifetime = remainingLifetime ?? this._msgLifetime;
    el._expiryTimer  = setTimeout(() => this._removeMessage(el, false), lifetime);
    el._msgTimestamp = data.timestamp;

    if (remainingLifetime == null) this._lsSave(data, Date.now());
  }

  _removeMessage(el, immediate) {
    if (!el || !el.parentNode) return;
    clearTimeout(el._expiryTimer);
    this._lsRemove(el._msgTimestamp);

    if (immediate) { el.remove(); return; }

    el.classList.remove('visible');
    el.classList.add('expiring');
    requestAnimationFrame(() => {
      el.style.maxHeight = '0';
      el.style.marginTop = '0';
    });
    setTimeout(() => el.remove(), 600);
  }

  _clearAll() {
    Array.from(this.zone.querySelectorAll('.chat-msg'))
      .forEach(el => this._removeMessage(el, true));
    try { localStorage.removeItem(this._LS_KEY); } catch (_) {}
  }

  // ── Création du DOM d'un message ─────────────────────────────

  _createMsgEl(data) {
    const color  = this._getColor(data.user, data.color);
    const badges = this._buildBadgesHTML(data);

    const el = document.createElement('div');
    el.className = 'chat-msg';
    el.style.setProperty('--msg-color', color);
    el.innerHTML =
      badges +
      `<span class="chat-username">${esc(data.user)}</span>` +
      `<span class="chat-sep">: </span>` +
      `<span class="chat-text">${esc(data.message)}</span>`;
    return el;
  }

  _buildBadgesHTML(msg) {
    const list = [];
    if (msg.isBroadcaster) list.push(_CHAT_BADGES.broadcaster);
    else if (msg.isMod)    list.push(_CHAT_BADGES.moderator);
    if (msg.isVip)         list.push(_CHAT_BADGES.vip);
    if (msg.isSub)         list.push(_CHAT_BADGES.subscriber);
    if (list.length === 0) return '';
    return `<span class="chat-badges" aria-hidden="true">${
      list.map(b => `<span class="chat-badge" title="${b.title}">${b.icon}</span>`).join('')
    }</span>`;
  }

  // ── LocalStorage ─────────────────────────────────────────────

  _lsLoad() {
    try {
      const raw = localStorage.getItem(this._LS_KEY);
      if (!raw) return [];
      const now = Date.now();
      return JSON.parse(raw).filter(m => m.addedAt && (now - m.addedAt) < this._msgLifetime);
    } catch (_) { return []; }
  }

  _lsSave(data, addedAt) {
    try {
      const msgs = this._lsLoad();
      if (msgs.some(m => m.data.timestamp === data.timestamp)) return;
      msgs.push({ data, addedAt });
      localStorage.setItem(this._LS_KEY, JSON.stringify(msgs.slice(-this._maxMessages)));
    } catch (_) {}
  }

  _lsRemove(timestamp) {
    try {
      const msgs = this._lsLoad().filter(m => m.data.timestamp !== timestamp);
      localStorage.setItem(this._LS_KEY, JSON.stringify(msgs));
    } catch (_) {}
  }

  _restoreFromLS() {
    const now = Date.now();
    this._lsLoad().forEach(({ data, addedAt }) => {
      const remaining = this._msgLifetime - (now - addedAt);
      if (remaining > 500) this._addMessage(data, remaining);
    });
  }
}

window.Chat = new ChatComponent();
