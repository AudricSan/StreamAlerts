'use strict';

/* ============================================================
   Composant : Dernier Follow & Dernier Sub
   Polling JSON local — affichage persistant

   Expose : window.LastEvents  →  { init() }
   Zones HTML  : #zone-last-follower  /  #zone-last-subscriber
   Données     : data/last_follower.json  /  data/last_subscriber.json
   ============================================================ */

const LastEvents = (() => {

  // ── CONSTANTES ──────────────────────────────────────────────

  const POLL_INTERVAL = 2000; // ms

  const FOLLOWER_CFG = {
    label:    'DERNIER FOLLOW',
    color:    '#9B59B6',
    colorRgb: '155, 89, 182',
  };

  const SUBSCRIBER_CFG = {
    label:    'DERNIER SUB',
    color:    '#F1C40F',
    colorRgb: '241, 196, 15',
  };

  const TEST_FOLLOWER = {
    user: 'NouvelAbonné42',
    avatar: '',
    timestamp: 1,
  };

  const TEST_SUBSCRIBER = {
    user: 'SuperFan',
    avatar: '',
    tier: 'Tier 1',
    months: 0,
    timestamp: 1,
  };

  // ── ÉTAT ────────────────────────────────────────────────────

  let lastFollowerTs   = -1;
  let lastSubscriberTs = -1;

  // ── POLLING ─────────────────────────────────────────────────

  async function poll() {
    const [fRes, sRes] = await Promise.all([
      fetch(`data/last_follower.json?t=${Date.now()}`).catch(() => null),
      fetch(`data/last_subscriber.json?t=${Date.now()}`).catch(() => null),
    ]);

    if (fRes?.ok) {
      const data = await fRes.json().catch(() => null);
      if (data?.user && data.timestamp !== lastFollowerTs) {
        lastFollowerTs = data.timestamp;
        render('zone-last-follower', FOLLOWER_CFG, data, null);
      }
    }

    if (sRes?.ok) {
      const data = await sRes.json().catch(() => null);
      if (data?.user && data.timestamp !== lastSubscriberTs) {
        lastSubscriberTs = data.timestamp;
        render('zone-last-subscriber', SUBSCRIBER_CFG, data, buildSubLine(data));
      }
    }
  }

  // ── RENDU ────────────────────────────────────────────────────

  function buildSubLine(data) {
    const parts = [];
    if (data.tier)   parts.push(data.tier);
    if (data.months) parts.push(`${data.months} mois`);
    return parts.join(' — ') || null;
  }

  function render(zoneId, cfg, data, subLine) {
    const zone = document.getElementById(zoneId);
    if (!zone) return;

    zone.innerHTML = `
      <div class="last-event-card" style="--le-color:${cfg.color};--le-color-rgb:${cfg.colorRgb};">
        <div class="last-event-accent"></div>
        <div class="last-event-inner">
          ${data.avatar ? `<img class="last-event-avatar" src="${esc(data.avatar)}" alt="" onerror="this.style.display='none'">` : ''}
          <div class="last-event-text">
            <div class="last-event-label">${cfg.label}</div>
            <div class="last-event-username">${esc(data.user || 'Anonyme')}</div>
            ${subLine ? `<div class="last-event-sub">${esc(subLine)}</div>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  // ── MODE TEST (touche L) ─────────────────────────────────────

  function onKeyDown(e) {
    if (e.key.toLowerCase() !== 'l') return;
    if (e.ctrlKey || e.altKey || e.metaKey) return;

    const fData = { ...TEST_FOLLOWER,    timestamp: Date.now() };
    const sData = { ...TEST_SUBSCRIBER,  timestamp: Date.now() };

    lastFollowerTs   = fData.timestamp;
    lastSubscriberTs = sData.timestamp;

    render('zone-last-follower',   FOLLOWER_CFG,   fData, null);
    render('zone-last-subscriber', SUBSCRIBER_CFG, sData, buildSubLine(sData));
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

  // ── INIT (appelé par script.js) ──────────────────────────────

  function init(cfg = {}) {
    poll();
    setInterval(poll, POLL_INTERVAL);
    document.addEventListener('keydown', onKeyDown);
  }

  return { init };

})();
