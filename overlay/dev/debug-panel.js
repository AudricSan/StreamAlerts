'use strict';

/* ============================================================
   dev/debug-panel.js — Panneau de debug visuel
   Activé uniquement si l'URL contient ?debug=1

   Affiche en temps réel :
     - État de la connexion WebSocket
     - Liste des polls actifs
     - Logs centralisés (niveau debug)

   Usage : http://localhost/StreamAlerts/overlay/?debug=1
   ============================================================ */

if (new URLSearchParams(location.search).has('debug')) {
  (() => {
    // Passer en niveau debug pour voir tout
    Log.setLevel('debug');

    const panel = document.createElement('div');
    panel.id = 'debug-panel';
    panel.style.cssText = [
      'position:fixed', 'bottom:0', 'left:0', 'right:0',
      'background:rgba(0,0,0,.88)', 'color:#e0e0e0',
      'font:11px/1.4 monospace', 'padding:4px 10px 6px',
      'z-index:9999', 'max-height:200px', 'overflow-y:auto',
      'pointer-events:auto', 'border-top:1px solid #333',
    ].join(';');
    document.body.appendChild(panel);

    // ── Ligne de statut ──────────────────────────────────────
    const statusLine = document.createElement('div');
    statusLine.style.cssText = 'color:#4fc3f7;margin-bottom:3px;border-bottom:1px solid #333;padding-bottom:3px;';
    panel.prepend(statusLine);

    function updateStatus() {
      const ws    = Store.get('ws', 'connected') ? '🟢 WS connecté' : '🔴 WS déconnecté';
      const polls = Poller.status();
      const pStr  = polls.map(p => `${p.id}(${p.interval}ms)`).join(' | ');
      statusLine.textContent = `${ws}  |  Polls: ${pStr || '—'}`;
    }

    const _statusTimer = setInterval(updateStatus, 2000);
    // Mise à jour immédiate après que le store soit populé
    Bus.on('ws:connected',    updateStatus);
    Bus.on('ws:disconnected', updateStatus);
    Bus.on('component:ready', updateStatus);

    // ── Logs en temps réel ───────────────────────────────────
    const COLORS = { debug: '#888', info: '#4fc3f7', warn: '#ffb74d', error: '#ef5350' };

    // Afficher les logs déjà enregistrés avant le panel
    Log.getHistory().forEach(addEntry);

    Bus.on('log:entry', addEntry);

    function addEntry({ ts, level, scope, args }) {
      const el = document.createElement('div');
      el.style.color = COLORS[level] || '#ccc';
      el.textContent = `[${ts}] [${scope}] ${args.join(' ')}`;
      panel.appendChild(el);
      panel.scrollTop = panel.scrollHeight;
      // Garder max 60 lignes de log (+ 1 status)
      while (panel.children.length > 62) panel.removeChild(panel.children[1]);
    }

    Log.info('Debug', 'Panel activé — mode debug ON');
  })();
}
