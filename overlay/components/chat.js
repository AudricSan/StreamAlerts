'use strict';

/* ============================================================
   components/chat.js — Chat overlay Twitch
   Expose : window.Chat  (étend BaseComponent)
   Zone   : #zone-chat   Données : WebSocket (fallback chat.json)
   Test   : touche C

   Mode primaire  : WebSocket Streamer.bot (via Bus 'ws:message')
   Mode fallback  : polling data/chat.json si WS indisponible
   Persistance    : localStorage (messages survivent au reload OBS)
   ============================================================ */

var _CHAT_BADGES = {
  broadcaster: { icon: '📺', title: 'Broadcaster' },
  moderator:   { icon: '⚔️', title: 'Modérateur'  },
  vip:         { icon: '💎', title: 'VIP'          },
  subscriber:  { icon: '⭐', title: 'Abonné'       },
};

var _CHAT_TEST_DATA = [
  { user: 'NouveauVenu',   color: '',        message: 'Salut tout le monde ! Premier stream ici',  isSub: false, isMod: false, isVip: false, isBroadcaster: false },
  { user: 'FanAcharne',    color: '#FF6B6B', message: "PogChamp c'est trop bien ce soir !!",       isSub: true,  isMod: false, isVip: false, isBroadcaster: false },
  { user: 'ModéReateur',   color: '#54A0FF', message: 'Bienvenue à tous les nouveaux viewers !',   isSub: true,  isMod: true,  isVip: false, isBroadcaster: false },
  { user: 'VipLégendaire', color: '#FECA57', message: 'GG les gars, on est presque au goal !',     isSub: true,  isMod: false, isVip: true,  isBroadcaster: false },
  { user: 'SubFidèle',     color: '#FF9FF3', message: "J'adore le contenu, continue comme ça !",  isSub: true,  isMod: false, isVip: false, isBroadcaster: false },
  { user: 'JusteLà',       color: '#48DBFB', message: 'LUL t\'as vu ce qui vient de se passer ?', isSub: false, isMod: false, isVip: false, isBroadcaster: false },
  { user: 'AutreGars',     color: '#A29BFE', message: 'Ce stream est vraiment incroyable Clap',    isSub: false, isMod: false, isVip: false, isBroadcaster: false },
  { user: 'ChatActif',     color: '#00B894', message: 'Hype pour la suite, on y croit !',          isSub: true,  isMod: false, isVip: false, isBroadcaster: false },
];

class ChatComponent extends BaseComponent {
  constructor() {
    super({
      name:         'chat',
      zoneId:       'zone-chat',
      dataFile:     'chat.json',
      pollInterval: 300,
      testKey:      'c',
    });
    this._msgLifetime = 30000;
    this._maxMessages = 14;
    this._getColor    = null;
    this._LS_KEY      = 'streamalerts_chat';
    this._testIndex   = 0;

    // Filtrage mots-clés
    this._filterMode          = 'off';
    this._filterList          = [];
    this._filterCaseSensitive = false;

    // Style atténué commandes
    this._dimModCommands = false;
    this._dimBotCommands = false;
    this._hideCommands   = false;

    // Mentions
    this._highlightMentions = [];

    // Batching même utilisateur
    this._batchSameUser = false;
    this._batchWindowMs = 10000;
    this._lastMsgUser   = null;
    this._lastMsgTime   = 0;
    this._lastMsgEl     = null;
  }

  /* ── Init ─────────────────────────────────────────────────── */

  setup(cfg) {
    var self = this;
    this._msgLifetime = cfg.msgLifetime != null ? cfg.msgLifetime : 30000;
    this._maxMessages = cfg.maxMessages != null ? cfg.maxMessages : 14;
    this._getColor    = createColorAssigner();

    // Filtrage mots-clés
    this._filterMode          = cfg.filterMode || 'off';
    this._filterList          = Array.isArray(cfg.filterList) ? cfg.filterList : [];
    this._filterCaseSensitive = cfg.filterCaseSensitive === true;

    // Style atténué commandes
    this._dimModCommands = cfg.dimModCommands === true;
    this._dimBotCommands = cfg.dimBotCommands === true;
    this._hideCommands   = cfg.hideCommands   === true;

    // Mentions
    this._highlightMentions = Array.isArray(cfg.highlightMentions) ? cfg.highlightMentions : [];

    // Batching même utilisateur
    this._batchSameUser = cfg.batchSameUser === true;
    this._batchWindowMs = typeof cfg.batchWindowMs === 'number' ? cfg.batchWindowMs : 10000;

    this._restoreFromLS();

    // Événements WebSocket
    Bus.on('ws:message', function(msg) { self._onWsMessage(msg); });

    Bus.on('ws:connected', function() {
      Log.info('chat', 'WebSocket actif — polling suspendu');
      Poller.unregister('chat');
    });

    Bus.on('ws:disconnected', function() {
      Log.info('chat', 'WebSocket KO — polling repris');
      Poller.register({
        id:       self.name,
        file:     self.dataFile,
        interval: self.cfg.pollInterval || self.pollInterval,
        onData:   function(data) { self.onData(data); },
      });
    });

    if (cfg.websocket) {
      WSManager.connect(cfg.websocket, cfg.websocketPassword || '');
    }
  }

  /* ── Test ────────────────────────────────────────────────── */

  test() {
    var data = _CHAT_TEST_DATA[this._testIndex % _CHAT_TEST_DATA.length];
    this._testIndex++;
    this._addMessage(Object.assign({}, data, { timestamp: Date.now() }), null);
  }

  /* ── Données fallback (polling JSON) ─────────────────────── */

  onData(data) {
    if (WSManager.isConnected()) return;
    if (!data || !data.user || !data.message) return;
    this._addMessage(data, null);
  }

  /* ── WebSocket ───────────────────────────────────────────── */

  _onWsMessage(msg) {
    if (!msg || msg.source !== 'Twitch') return;

    if (msg.type === 'ClearChat' || msg.type === 'ChatCleared') {
      this._clearAll();
      return;
    }

    if (msg.type === 'ChatMessage') {
      var mdata = msg.data && msg.data.message ? msg.data.message : null;
      if (!mdata || !mdata.message || !mdata.displayName) return;
      this._addMessage({
        user:          mdata.displayName,
        message:       mdata.message,
        color:         mdata.color         || '',
        isSub:         !!mdata.isSubscriber,
        isMod:         !!mdata.isModerator,
        isVip:         !!mdata.isVip,
        isBroadcaster: !!mdata.isBroadcaster,
        timestamp:     Date.now(),
      }, null);
    }
  }

  /* ── Filtrage mots-clés ──────────────────────────────────── */

  _isFiltered(message) {
    if (this._filterMode === 'off') return false;
    if (!message) return false;

    var list = this._filterList;
    if (!list || list.length === 0) return false;

    var haystack = this._filterCaseSensitive ? message : message.toLowerCase();

    if (this._filterMode === 'blacklist') {
      for (var i = 0; i < list.length; i++) {
        var entry = list[i];
        if (typeof entry !== 'string' || entry.length === 0) continue;
        var needle = this._filterCaseSensitive ? entry : entry.toLowerCase();
        if (haystack.indexOf(needle) !== -1) return true;
      }
      return false;
    }

    if (this._filterMode === 'whitelist') {
      for (var j = 0; j < list.length; j++) {
        var wentry = list[j];
        if (typeof wentry !== 'string' || wentry.length === 0) continue;
        var wneedle = this._filterCaseSensitive ? wentry : wentry.toLowerCase();
        if (haystack.indexOf(wneedle) !== -1) return false;
      }
      return true;
    }

    return false;
  }

  /* ── Gestion des messages ─────────────────────────────────── */

  _addMessage(data, remainingLifetime) {
    if (!data || !data.message || !data.user) return;
    var self = this;

    // Commandes mod/broadcaster — ne pas afficher dans le chat
    if (data.isMod || data.isBroadcaster) {
      var cmd = data.message.trim();

      if (cmd.toLowerCase() === '!clear') {
        this._clearAll();
        return;
      }

      var visMatch = cmd.match(/^!(show|hide|toggle)\s+(\S+)/i);
      if (visMatch) {
        Bus.emit('visibility:cmd', {
          action: visMatch[1].toLowerCase(),
          name:   visMatch[2].toLowerCase(),
        });
        return;
      }
    }

    // Détection commande (message commençant par '!')
    var isCommand = data.message.trim().charAt(0) === '!';

    // Masquer les commandes si configuré
    if (this._hideCommands && isCommand) return;

    // Filtrage par mots-clés
    if (this._isFiltered(data.message)) return;

    // Détection si le message doit être atténué
    var isDim = isCommand && this._dimModCommands && (data.isMod || data.isBroadcaster);

    // Détection mention
    var isHighlight = false;
    if (this._highlightMentions.length > 0) {
      var msgLower = data.message.toLowerCase();
      for (var i = 0; i < this._highlightMentions.length; i++) {
        var m = this._highlightMentions[i];
        if (typeof m === 'string' && m.length > 0 && msgLower.indexOf(m.toLowerCase()) !== -1) {
          isHighlight = true;
          break;
        }
      }
    }

    // Batching même utilisateur
    if (this._batchSameUser && remainingLifetime == null) {
      var now = Date.now();
      if (
        this._lastMsgUser === data.user &&
        this._lastMsgEl   !== null &&
        this._lastMsgEl.parentNode &&
        (now - this._lastMsgTime) < this._batchWindowMs
      ) {
        var extraEl = document.createElement('div');
        extraEl.className = 'chat-msg-extra';
        extraEl.textContent = data.message;
        this._lastMsgEl.appendChild(extraEl);
        this._lastMsgTime = now;
        return;
      }
    }

    // Supprimer le plus ancien si on dépasse la limite
    var existing = this.zone.querySelectorAll('.chat-msg');
    if (existing.length >= this._maxMessages) {
      this._removeMessage(existing[0], true);
    }

    var el = this._createMsgEl(data, isCommand, isDim, isHighlight);
    this.zone.appendChild(el);

    // Mise à jour état batching
    if (this._batchSameUser) {
      this._lastMsgUser = data.user;
      this._lastMsgTime = Date.now();
      this._lastMsgEl   = el;
    }

    requestAnimationFrame(function() {
      el.style.maxHeight = el.scrollHeight + 'px';
      el.style.marginTop = '3px';
      requestAnimationFrame(function() { el.classList.add('visible'); });
    });

    var lifetime = remainingLifetime != null ? remainingLifetime : this._msgLifetime;
    el._expiryTimer  = setTimeout(function() { self._removeMessage(el, false); }, lifetime);
    el._msgTimestamp = data.timestamp;

    if (remainingLifetime == null) this._lsSave(data, Date.now());
  }

  _removeMessage(el, immediate) {
    if (!el || !el.parentNode) return;
    clearTimeout(el._expiryTimer);
    this._lsRemove(el._msgTimestamp);

    if (immediate) {
      el.parentNode.removeChild(el);
      return;
    }

    var self = this;
    el.classList.remove('visible');
    el.classList.add('expiring');
    requestAnimationFrame(function() {
      el.style.maxHeight = '0';
      el.style.marginTop = '0';
    });
    setTimeout(function() {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 600);
  }

  _clearAll() {
    var msgs = this.zone.querySelectorAll('.chat-msg');
    for (var i = 0; i < msgs.length; i++) {
      this._removeMessage(msgs[i], true);
    }
    this._lastMsgUser = null;
    this._lastMsgTime = 0;
    this._lastMsgEl   = null;
    try { localStorage.removeItem(this._LS_KEY); } catch (e) {}
  }

  /* ── Création du DOM d'un message ────────────────────────── */

  _createMsgEl(data, isCommand, isDim, isHighlight) {
    var color  = this._getColor(data.user, data.color);
    var badges = this._buildBadgesHTML(data);

    var el = document.createElement('div');
    var cls = 'chat-msg';
    if (isDim)       cls += ' chat-msg--dim';
    if (isHighlight) cls += ' chat-msg--highlight';
    el.className = cls;
    el.style.setProperty('--msg-color', color);
    el.innerHTML =
      badges +
      '<span class="chat-username">' + esc(data.user)    + '</span>' +
      '<span class="chat-sep">: </span>' +
      '<span class="chat-text">'     + esc(data.message) + '</span>';
    return el;
  }

  _buildBadgesHTML(msg) {
    var list = [];
    if (msg.isBroadcaster) list.push(_CHAT_BADGES.broadcaster);
    else if (msg.isMod)    list.push(_CHAT_BADGES.moderator);
    if (msg.isVip)         list.push(_CHAT_BADGES.vip);
    if (msg.isSub)         list.push(_CHAT_BADGES.subscriber);
    if (list.length === 0) return '';

    var html = '<span class="chat-badges" aria-hidden="true">';
    for (var i = 0; i < list.length; i++) {
      html += '<span class="chat-badge" title="' + list[i].title + '">' + list[i].icon + '</span>';
    }
    html += '</span>';
    return html;
  }

  /* ── LocalStorage ────────────────────────────────────────── */

  _lsLoad() {
    try {
      var raw = localStorage.getItem(this._LS_KEY);
      if (!raw) return [];
      var now  = Date.now();
      var self = this;
      return JSON.parse(raw).filter(function(m) {
        return m.addedAt && (now - m.addedAt) < self._msgLifetime;
      });
    } catch (e) { return []; }
  }

  _lsSave(data, addedAt) {
    try {
      var msgs = this._lsLoad();
      for (var i = 0; i < msgs.length; i++) {
        if (msgs[i].data.timestamp === data.timestamp) return;
      }
      msgs.push({ data: data, addedAt: addedAt });
      localStorage.setItem(this._LS_KEY, JSON.stringify(msgs.slice(-this._maxMessages)));
    } catch (e) {}
  }

  _lsRemove(timestamp) {
    try {
      var msgs = this._lsLoad().filter(function(m) {
        return m.data.timestamp !== timestamp;
      });
      localStorage.setItem(this._LS_KEY, JSON.stringify(msgs));
    } catch (e) {}
  }

  _restoreFromLS() {
    var now  = Date.now();
    var self = this;
    var saved = this._lsLoad();
    for (var i = 0; i < saved.length; i++) {
      var entry     = saved[i];
      var remaining = self._msgLifetime - (now - entry.addedAt);
      if (remaining > 500) self._addMessage(entry.data, remaining);
    }
  }
}

window.Chat = new ChatComponent();
