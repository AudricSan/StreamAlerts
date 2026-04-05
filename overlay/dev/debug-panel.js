'use strict';

/* ============================================================
   dev/debug-panel.js — Panneau de debug visuel
   Activé uniquement si l'URL contient ?debug=1

   Affiche en temps réel :
     - État de la connexion WebSocket (haut du panneau)
     - Polls actifs avec leur intervalle
     - Logs centralisés (tous niveaux)

   Usage : http://localhost/StreamAlerts/overlay/?debug=1

   z-index : 9999 — ne dépasse pas les alertes (z-index non fixé
   sur les zones overlay, qui restent au-dessous).
   ============================================================ */

if (location.search.indexOf('debug=1') !== -1) {
  (function() {

    // Passer en niveau debug pour tout voir
    Log.setLevel('debug');

    /* ── Conteneur principal ── */
    var panel = document.createElement('div');
    panel.id = 'debug-panel';
    panel.style.cssText = [
      'position:fixed', 'bottom:0', 'left:0', 'right:0',
      'background:rgba(0,0,0,.88)', 'color:#e0e0e0',
      'font:11px/1.4 monospace', 'padding:4px 10px 6px',
      'z-index:9999', 'max-height:200px', 'overflow-y:auto',
      'pointer-events:auto', 'border-top:1px solid #333',
    ].join(';');
    document.body.appendChild(panel);

    /* ── Ligne de statut (toujours en haut) ── */
    var statusLine = document.createElement('div');
    statusLine.style.cssText = 'color:#4fc3f7;margin-bottom:3px;border-bottom:1px solid #333;padding-bottom:3px;';
    panel.prepend(statusLine);

    function updateStatus() {
      var wsLabel = Store.get('ws', 'connected', false) ? 'WS ok' : 'WS off';
      var polls   = Poller.status();
      var pStr    = polls.map(function(p) {
        return p.id + '(' + p.interval + 'ms)';
      }).join(' | ');
      statusLine.textContent = wsLabel + '  |  Polls: ' + (pStr || '—');
    }

    setInterval(updateStatus, 2000);
    updateStatus();

    Bus.on('ws:connected',    updateStatus);
    Bus.on('ws:disconnected', updateStatus);
    Bus.on('component:ready', updateStatus);

    /* ── Logs en temps réel ── */
    var LOG_COLORS = { debug: '#888', info: '#4fc3f7', warn: '#ffb74d', error: '#ef5350' };

    // Rejouer les logs déjà enregistrés avant l'ouverture du panel
    var history = Log.getHistory();
    for (var i = 0; i < history.length; i++) {
      _addEntry(history[i]);
    }

    Bus.on('log:entry', _addEntry);

    function _addEntry(entry) {
      var el = document.createElement('div');
      el.style.color = LOG_COLORS[entry.level] || '#ccc';
      el.textContent = '[' + entry.ts + '] [' + entry.scope + '] ' + entry.args.join(' ');
      panel.appendChild(el);
      panel.scrollTop = panel.scrollHeight;
      // Garder max 60 lignes de log (children[0] = statusLine)
      while (panel.children.length > 62) {
        panel.removeChild(panel.children[1]);
      }
    }

    Log.info('debug', 'panneau activé — niveau debug ON');

  })();
}
