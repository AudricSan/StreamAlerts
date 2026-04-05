'use strict';

/**
 * StreamAlerts — Config UI Logic
 * Handles tabs, form interactions, layout preview, and persistence.
 */

const API = './api.php';
const ts  = () => Math.floor(Date.now() / 1000);

// ════════════════════════════════════════════════════════════
//  STATE & CONSTANTS
// ════════════════════════════════════════════════════════════

let visData      = {};
let layoutCfg    = {};
let currentZone  = null;
let hAnchor      = 'left';
let vAnchor      = 'bottom';
let previewScale = 1;
let previewDrag  = null;
let previewOpen  = false;

const ZONES = [
  {
    cfgKey: 'alerts', label: '🔔 Alertes', dataFile: 'alert', color: '#9B59B6',
    extras: [
      { id: 'displayDuration', label: 'Durée d\'affichage (ms)', type: 'number', min: 500, step: 500, placeholder: '5500' },
    ],
    testData: () => ({ type: 'follow', user: 'TestUser', message: '', timestamp: ts() }),
  },
  {
    cfgKey: 'chat', label: '💬 Chat', hasMaxHeight: true, dataFile: 'chat', color: '#48DBFB',
    extras: [
      { id: 'websocket',         label: 'URL WebSocket',               type: 'text',   placeholder: 'ws://127.0.0.1:8080' },
      { id: 'websocketPassword', label: 'Mot de passe WebSocket',      type: 'password', placeholder: '...' },
      { id: 'maxMessages',       label: 'Messages max affichés',       type: 'number', min: 1, max: 100, placeholder: '27' },
      { id: 'msgLifetime',       label: 'Durée de vie msg (s, vide=∞)', type: 'number', min: 0, placeholder: '' },
    ],
    testData: () => ({ user: 'TestUser', color: '#9B59B6', message: 'Bonjour le chat ! 👋', isMod: false, timestamp: ts() }),
  },
  {
    cfgKey: 'lastFollower', label: '👤 Last Follow', dataFile: 'last_follower', color: '#E74C3C', extras: [],
    testData: () => ({ user: 'TestFollower', avatar: '', timestamp: ts() }),
  },
  {
    cfgKey: 'lastSubscriber', label: '⭐ Last Sub', dataFile: 'last_subscriber', color: '#F1C40F', extras: [],
    testData: () => ({ user: 'TestSub', avatar: '', tier: 'Tier 1', months: 3, timestamp: ts() }),
  },
  {
    cfgKey: 'goal', label: '🎯 Goal', dataFile: 'goal', color: '#3498DB', extras: [],
    testData: () => ({ label: 'Test Goal', current: 65, target: 100, type: 'sub', timestamp: ts() }),
  },
  {
    cfgKey: 'subtrain', label: '🚂 Sub Train', dataFile: 'subtrain', color: '#FFA500',
    extras: [
      { id: 'duration', label: 'Durée du train (s)', type: 'number', min: 10, step: 5, placeholder: '60' },
    ],
    testData: () => ({ count: 5, lastUser: 'TestSub', active: true, expiresAt: Date.now() + 60000, timestamp: ts() }),
  },
  {
    cfgKey: 'nowplaying', label: '🎵 Musique', dataFile: 'nowplaying', color: '#00BCD4', extras: [],
    testData: () => ({ title: 'Test Song', artist: 'Test Artist', active: true, timestamp: ts() }),
  },
  {
    cfgKey: 'queue', label: '👥 Queue', dataFile: 'queue', color: '#9E9E9E',
    extras: [
      { id: 'maxVisible', label: 'Lignes max (overlay)', type: 'number', min: 1, max: 20, placeholder: '8' },
    ],
    testData: () => ({ isOpen: true, entries: [{user:'GamerPro99'},{user:'FanAcharné'},{user:'SubFidèle'},{user:'NewVenu'}], timestamp: ts() }),
  },
  {
    cfgKey: 'viewers', label: '👁 Spectateurs', dataFile: 'viewers', color: '#9146FF', extras: [],
    testData: () => ({ count: 142, timestamp: ts() }),
  },
  {
    cfgKey: 'uptime', label: '⏰ Uptime', dataFile: 'uptime', color: '#F39C12', extras: [],
    testData: () => ({ startedAt: Date.now() - 9240000, timestamp: ts() }),
  },
  {
    cfgKey: 'session', label: '📊 Session', dataFile: 'session', color: '#BDC3C7', extras: [],
    testData: () => ({ follows: 12, subs: 5, bits: 750, raids: 2, donations: 3, timestamp: ts() }),
  },
  {
    cfgKey: 'countdown', label: '⏱ Countdown', dataFile: 'countdown', color: '#5DADE2', extras: [],
    testData: () => ({ label: 'Début du jeu', active: true, startedAt: Date.now(), endsAt: Date.now() + 300000, timestamp: ts() }),
  },
  {
    cfgKey: 'leaderboard', label: '🏆 Leaderboard', dataFile: 'leaderboard', color: '#F1C40F', extras: [],
    testData: () => ({ title: 'Top Bits', entries: [{user:'BigFan',score:5000},{user:'FanFidèle',score:3000},{user:'NewComer',score:950}], timestamp: ts() }),
  },
  {
    cfgKey: 'poll', label: '🗳 Sondage', dataFile: 'poll', color: '#9B59B6', extras: [],
    testData: () => ({ title: 'Quelle map ?', active: true, startedAt: Date.now(), endsAt: Date.now() + 60000, choices: [{title:'Dust 2',votes:45},{title:'Mirage',votes:30},{title:'Inferno',votes:15}], timestamp: ts() }),
  },
  {
    cfgKey: 'prediction', label: '🔮 Prédiction', dataFile: 'prediction', color: '#3498DB', extras: [],
    testData: () => ({ title: 'On gagne ?', active: true, startedAt: Date.now(), endsAt: Date.now() + 90000, lockedAt: 0, options: [{title:'Oui!',points:15000},{title:'Non...',points:8000}], timestamp: ts() }),
  },
  {
    cfgKey: 'hypetrain', label: '🚆 Hype Train', dataFile: 'hypetrain', color: '#FF6600', extras: [],
    testData: () => ({ level: 2, progress: 68, goal: 100, active: true, startedAt: Date.now() - 120000, endsAt: Date.now() + 180000, duration: 300, contributors: [{user:'TopFan',amount:500}], timestamp: ts() }),
  },
];

const PREVIEW_HEIGHTS = {
  alerts:520, chat:900, lastFollower:70, lastSubscriber:70,
  goal:80, subtrain:70, nowplaying:70, queue:240,
  viewers:70, uptime:70, session:100, countdown:115,
  leaderboard:185, poll:210, prediction:215, hypetrain:105,
};

const DEFAULT_WIDTHS = {
  alerts:520, chat:360, lastFollower:230, lastSubscriber:230,
  goal:400, subtrain:260, nowplaying:380, queue:230,
  viewers:160, uptime:160, session:230, countdown:300,
  leaderboard:230, poll:380, prediction:320, hypetrain:300,
};

// ════════════════════════════════════════════════════════════
//  API WRAPPERS
// ════════════════════════════════════════════════════════════

async function apiRead(file) {
  const r = await fetch(`${API}?action=read&file=${file}&t=${Date.now()}`);
  if (!r.ok) throw new Error('Lecture impossible');
  return r.json();
}

async function apiWrite(file, data) {
  const r = await fetch(`${API}?action=write&file=${file}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data),
  });
  if (!r.ok) throw new Error('Écriture impossible');
  return r.json();
}

// ════════════════════════════════════════════════════════════
//  UI UTILS
// ════════════════════════════════════════════════════════════

let toastTimer;
function toast(msg, type = 'ok') {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.className = `show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = ''; }, 2200);
}

function esc(v) {
  if (v == null) return '';
  return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ════════════════════════════════════════════════════════════
//  TABS MANAGEMENT
// ════════════════════════════════════════════════════════════

let activeTab = 'goal';
let queuePollTimer   = null;
let historyPollTimer = null;
let scenesPollTimer  = null;
let visPollTimer     = null;

function initTabs() {
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('section').forEach(s => s.hidden = true);
      btn.classList.add('active');
      activeTab = btn.dataset.tab;
      document.getElementById('tab-' + activeTab).hidden = false;

      clearInterval(queuePollTimer);
      clearInterval(historyPollTimer);
      clearInterval(scenesPollTimer);
      clearInterval(visPollTimer);

      if      (activeTab === 'queue')   { loadQueue(); queuePollTimer = setInterval(loadQueue, 2000); }
      else if (activeTab === 'goal')    loadGoal();
      else if (activeTab === 'music')   loadNowPlaying();
      else if (activeTab === 'cfg')     { loadConfig(); renderProfileSelect(); }
      else if (activeTab === 'scenes')  {
        obsLoadSavedParams();
        loadSceneConfig();
        pollActiveScene();
        scenesPollTimer = setInterval(pollActiveScene, 2000);
        if (!obsWsConnected && localStorage.getItem(LS_OBS_URL)) {
          obsConnect();
        }
      }
      else if (activeTab === 'history') {
        renderHistory();
        historyPollTimer = setInterval(pollHistory, 2000);
      }
      else if (activeTab === 'layout')  {
        loadLayout();
        loadVisibility();
        visPollTimer = setInterval(loadVisibility, 2000);
      }
    });
  });
}

// ════════════════════════════════════════════════════════════
//  VISIBILITY
// ════════════════════════════════════════════════════════════

function buildVisGrid() {
  const zonesHtml = ZONES.map(z => `
    <button class="vis-btn vis-on" id="vis-btn-${z.cfgKey}" onclick="toggleVisibility('${z.cfgKey}')">
      <span>${z.label}</span>
      <span class="vis-icon" id="vis-icon-${z.cfgKey}">👁</span>
    </button>
  `).join('');
  const hintHtml = `
    <button class="vis-btn vis-on" id="vis-btn-hint" onclick="toggleVisibility('hint')" style="grid-column:1/-1;opacity:0.7">
      <span>⌨️ Aide (raccourcis)</span>
      <span class="vis-icon" id="vis-icon-hint">👁</span>
    </button>
  `;
  document.getElementById('vis-grid').innerHTML = zonesHtml + hintHtml;
}

async function loadVisibility() {
  try { visData = await apiRead('visibility'); } catch (_) { visData = {}; }
  renderVisGrid();
}

function renderVisGrid() {
  const keys = [...ZONES.map(z => z.cfgKey), 'hint'];
  keys.forEach(cfgKey => {
    const btn  = document.getElementById('vis-btn-'  + cfgKey);
    const icon = document.getElementById('vis-icon-' + cfgKey);
    if (!btn || !icon) return;
    const on = visData[cfgKey] !== false;
    btn.className    = 'vis-btn ' + (on ? 'vis-on' : 'vis-off');
    icon.textContent = on ? '👁' : '🚫';
  });
}

async function toggleVisibility(cfgKey) {
  try {
    const vis    = await apiRead('visibility');
    const wasOn  = vis[cfgKey] !== false;
    vis[cfgKey]  = !wasOn;
    await apiWrite('visibility', vis);
    visData = vis;
    renderVisGrid();
    const label = cfgKey === 'hint' ? '⌨️ Aide' : ZONES.find(z => z.cfgKey === cfgKey)?.label;
    toast(vis[cfgKey] ? `👁 ${label} affiché` : `🚫 ${label} masqué`);
  } catch (e) { toast('Erreur', 'err'); }
}

// ════════════════════════════════════════════════════════════
//  GOAL
// ════════════════════════════════════════════════════════════

async function loadGoal() {
  try {
    const d = await apiRead('goal');
    document.getElementById('goal-label').value   = d.label   || '';
    document.getElementById('goal-current').value = d.current ?? 0;
    document.getElementById('goal-target').value  = d.target  ?? 100;
    document.getElementById('goal-type').value    = d.type    || 'sub';
    updateGoalDisplay(d);
  } catch (_) {}
}

function updateGoalDisplay(d) {
  const current = +d.current || 0;
  const target  = +d.target  || 1;
  const pct     = Math.round(Math.min(1, current / target) * 100);
  document.getElementById('goal-label-disp').textContent = d.label || 'OBJECTIF';
  document.getElementById('goal-count-disp').textContent = `${current} / ${target}`;
  document.getElementById('goal-bar').style.width = pct + '%';
}

async function saveGoal() {
  try {
    const d = {
      label:     document.getElementById('goal-label').value.trim() || 'Objectif subs',
      current:   +document.getElementById('goal-current').value || 0,
      target:    +document.getElementById('goal-target').value  || 100,
      type:      document.getElementById('goal-type').value,
      timestamp: ts(),
    };
    await apiWrite('goal', d);
    updateGoalDisplay(d);
    toast('✓ Goal sauvegardé');
  } catch (e) { toast('Erreur : ' + e.message, 'err'); }
}

async function incrementGoal(n) {
  try {
    const d = await apiRead('goal');
    d.current   = (+d.current || 0) + n;
    d.timestamp = ts();
    document.getElementById('goal-current').value = d.current;
    await apiWrite('goal', d);
    updateGoalDisplay(d);
    toast(`+${n} → ${d.current}/${d.target}`);
  } catch (e) { toast('Erreur', 'err'); }
}

async function resetGoal() {
  try {
    const d = await apiRead('goal');
    d.current   = 0;
    d.timestamp = ts();
    document.getElementById('goal-current').value = 0;
    await apiWrite('goal', d);
    updateGoalDisplay(d);
    toast('✓ Goal remis à zéro');
  } catch (e) { toast('Erreur', 'err'); }
}

// ════════════════════════════════════════════════════════════
//  QUEUE
// ════════════════════════════════════════════════════════════

let queueData = { isOpen: false, entries: [], timestamp: 0 };

async function loadQueue() {
  try { queueData = await apiRead('queue'); renderQueue(); } catch (_) {}
}

function renderQueue() {
  const d = queueData;
  const toggle = document.getElementById('queue-toggle');
  if (!toggle) return;

  if (d.isOpen) {
    toggle.textContent = '▶ QUEUE OUVERTE — cliquer pour fermer';
    toggle.className   = 'queue-toggle open';
  } else {
    toggle.textContent = '⏸ QUEUE FERMÉE — cliquer pour ouvrir';
    toggle.className   = 'queue-toggle closed';
  }

  const n = (d.entries || []).length;
  document.getElementById('queue-count-label').textContent =
    `File d'attente — ${n} joueur${n > 1 ? 's' : ''}`;

  const list = document.getElementById('queue-list');
  if (n === 0) { list.innerHTML = '<div class="queue-empty">File vide</div>'; return; }

  list.innerHTML = d.entries.map((e, i) => `
    <div class="queue-entry">
      <span class="pos">${i + 1}</span>
      <span class="name">${esc(e.user)}</span>
      <button class="rm" onclick="removeFromQueue(${i})" title="Retirer">×</button>
    </div>
  `).join('');
}

async function toggleQueue() {
  try {
    const d = await apiRead('queue');
    d.isOpen = !d.isOpen; d.timestamp = ts(); queueData = d;
    await apiWrite('queue', d); renderQueue();
    toast(d.isOpen ? '✓ Queue ouverte' : '✓ Queue fermée');
  } catch (e) { toast('Erreur', 'err'); }
}

async function addToQueue() {
  const input = document.getElementById('queue-input');
  const user  = input.value.trim();
  if (!user) return;
  try {
    const d = await apiRead('queue');
    if ((d.entries || []).some(e => e.user.toLowerCase() === user.toLowerCase())) {
      toast(`${user} est déjà dans la queue`, 'err'); return;
    }
    d.entries = d.entries || [];
    d.entries.push({ user });
    d.timestamp = ts(); queueData = d;
    await apiWrite('queue', d); input.value = ''; renderQueue();
    toast(`✓ ${user} ajouté`);
  } catch (e) { toast('Erreur', 'err'); }
}

async function removeFromQueue(idx) {
  try {
    const d = await apiRead('queue');
    const removed = d.entries.splice(idx, 1)[0];
    d.timestamp = ts(); queueData = d;
    await apiWrite('queue', d); renderQueue();
    if (removed) toast(`✓ ${removed.user} retiré`);
  } catch (e) { toast('Erreur', 'err'); }
}

async function clearQueue() {
  if (!confirm('Vider toute la queue ?')) return;
  try {
    const d = await apiRead('queue');
    d.entries = []; d.timestamp = ts(); queueData = d;
    await apiWrite('queue', d); renderQueue(); toast('✓ Queue vidée');
  } catch (e) { toast('Erreur', 'err'); }
}

// ════════════════════════════════════════════════════════════
//  NOW PLAYING
// ════════════════════════════════════════════════════════════

async function loadNowPlaying() {
  try {
    const d = await apiRead('nowplaying');
    document.getElementById('np-title').value  = d.title  || '';
    document.getElementById('np-artist').value = d.artist || '';
    const on  = d.active && d.title;
    const ind = document.getElementById('np-indicator');
    ind.className = 'np-active-indicator ' + (on ? 'on' : 'off');
    document.getElementById('np-status-text').textContent = on ? `En cours : ${d.title}` : 'Masqué';
  } catch (_) {}
}

async function saveNowPlaying(active) {
  try {
    const title  = document.getElementById('np-title').value.trim();
    const artist = document.getElementById('np-artist').value.trim();
    const d = { title, artist, active: active && title !== '', timestamp: ts() };
    await apiWrite('nowplaying', d);
    await loadNowPlaying();
    toast(active && title ? `▶ ${title}` : '⏹ Masqué');
  } catch (e) { toast('Erreur', 'err'); }
}

// ════════════════════════════════════════════════════════════
//  LAYOUT — Positions, taille, apparence, paramètres
// ════════════════════════════════════════════════════════════

function buildCompGrid() {
  document.getElementById('comp-grid').innerHTML = ZONES.map(z =>
    `<button class="comp-btn" data-key="${z.cfgKey}" onclick="selectZone('${z.cfgKey}')">${z.label}</button>`
  ).join('');
}

async function loadLayout() {
  try { layoutCfg = await Config.load(); } catch (_) { layoutCfg = {}; }
  buildCompGrid();
  buildVisGrid();
  if (currentZone) selectZone(currentZone.cfgKey);
}

function selectZone(cfgKey) {
  currentZone = ZONES.find(z => z.cfgKey === cfgKey);
  if (!currentZone) return;

  document.querySelectorAll('.comp-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.key === cfgKey));

  const zc = layoutCfg[cfgKey] || {};

  document.getElementById('pos-enabled').checked = zc.enabled !== false;

  if (zc.right != null) { hAnchor = 'right'; document.getElementById('pos-h-val').value = zc.right; }
  else                  { hAnchor = 'left';  document.getElementById('pos-h-val').value = zc.left  ?? ''; }

  if (zc.top != null) { vAnchor = 'top';    document.getElementById('pos-v-val').value = zc.top;    }
  else                { vAnchor = 'bottom'; document.getElementById('pos-v-val').value = zc.bottom ?? ''; }

  document.getElementById('pos-width').value = zc.width ?? '';

  const mhRow = document.getElementById('pos-maxheight-row');
  mhRow.hidden = !currentZone.hasMaxHeight;
  if (currentZone.hasMaxHeight) document.getElementById('pos-maxheight').value = zc.maxHeight ?? '';

  const op = zc.opacity ?? 100;
  document.getElementById('pos-opacity').value = op;
  document.getElementById('opacity-val').textContent = op;

  buildExtras(currentZone, zc);
  updateAnchorButtons();
  document.getElementById('pos-editor-title').textContent = currentZone.label;
  document.getElementById('pos-editor').hidden = false;
}

function setHAnchor(s) { hAnchor = s; updateAnchorButtons(); }
function setVAnchor(s) { vAnchor = s; updateAnchorButtons(); }

function updateAnchorButtons() {
  document.getElementById('h-left-btn').classList.toggle('active',  hAnchor === 'left');
  document.getElementById('h-right-btn').classList.toggle('active', hAnchor === 'right');
  document.getElementById('v-top-btn').classList.toggle('active',    vAnchor === 'top');
  document.getElementById('v-bottom-btn').classList.toggle('active', vAnchor === 'bottom');
}

function buildExtras(zone, zc) {
  const section   = document.getElementById('pos-extras-section');
  const container = document.getElementById('pos-extras');
  const extras    = zone.extras || [];

  if (extras.length === 0) { section.hidden = true; return; }

  section.hidden = false;
  container.innerHTML = extras.map(ex => {
    const val = getExtraVal(ex, zc);
    const inputAttrs = [
      `type="${ex.type}"`,
      `id="extra-${ex.id}"`,
      ex.min  != null ? `min="${ex.min}"`   : '',
      ex.max  != null ? `max="${ex.max}"`   : '',
      ex.step != null ? `step="${ex.step}"` : '',
      `placeholder="${ex.placeholder ?? ''}"`,
      `value="${esc(String(val ?? ''))}"`,
    ].filter(Boolean).join(' ');

    return `
      <div>
        <label>${ex.label}</label>
        <input ${inputAttrs}>
      </div>
    `;
  }).join('');
}

function getExtraVal(ex, zc) {
  if (ex.id === 'msgLifetime') {
    const ms = zc.msgLifetime;
    return (ms == null || ms >= 86400000) ? '' : Math.round(ms / 1000);
  }
  return zc[ex.id] ?? '';
}

async function savePosition() {
  if (!currentZone) return;
  const cfgKey = currentZone.cfgKey;
  const section = { ...(layoutCfg[cfgKey] || {}) };

  section.enabled = document.getElementById('pos-enabled').checked;

  delete section.left; delete section.right;
  const hVal = document.getElementById('pos-h-val').value.trim();
  if (hVal !== '') section[hAnchor] = +hVal;

  delete section.top; delete section.bottom;
  const vVal = document.getElementById('pos-v-val').value.trim();
  if (vVal !== '') section[vAnchor] = +vVal;

  delete section.width;
  const wVal = document.getElementById('pos-width').value.trim();
  if (wVal !== '') section.width = +wVal;

  if (currentZone.hasMaxHeight) {
    delete section.maxHeight;
    const mhVal = document.getElementById('pos-maxheight').value.trim();
    if (mhVal !== '') section.maxHeight = +mhVal;
  }

  section.opacity = +document.getElementById('pos-opacity').value;

  (currentZone.extras || []).forEach(ex => {
    const input = document.getElementById('extra-' + ex.id);
    if (!input) return;
    const raw = input.value.trim();
    if (ex.id === 'msgLifetime') {
      section.msgLifetime = (raw === '' || +raw <= 0) ? 999999999 : +raw * 1000;
      return;
    }
    if (raw === '') { delete section[ex.id]; }
    else { section[ex.id] = ex.type === 'number' ? +raw : raw; }
  });

  layoutCfg[cfgKey] = section;

  try {
    await Config.save(layoutCfg);
    toast(`✓ ${currentZone.label} appliqué`);
  } catch (e) { toast('Erreur : ' + e.message, 'err'); }
}

async function testComponent() {
  if (!currentZone) return;
  try {
    await apiWrite(currentZone.dataFile, currentZone.testData());
    toast(`🧪 Test ${currentZone.label}`);
  } catch (e) { toast('Erreur test', 'err'); }
}

// ════════════════════════════════════════════════════════════
//  CONFIG (GENERAL)
// ════════════════════════════════════════════════════════════

async function loadConfig() {
  try {
    const cfg = await Config.load();
    document.getElementById('cfg-alert-dur').value = cfg.alerts?.displayDuration ?? 5500;
    document.getElementById('cfg-train-dur').value = cfg.subtrain?.duration      ?? 60;
  } catch (_) {}

  try {
    const lf = await apiRead('last_follower');
    document.getElementById('cfg-last-follower').textContent = lf.user || '—';
  } catch (_) {}

  try {
    const ls = await apiRead('last_subscriber');
    const s  = [ls.user, ls.tier, ls.months ? `${ls.months} mois` : ''].filter(Boolean).join(' · ');
    document.getElementById('cfg-last-subscriber').textContent = s || '—';
  } catch (_) {}
}

async function saveConfig() {
  try {
    const cfg = await Config.load();
    cfg.alerts              = cfg.alerts   || {};
    cfg.subtrain            = cfg.subtrain || {};
    cfg.alerts.displayDuration = +document.getElementById('cfg-alert-dur').value || 5500;
    cfg.subtrain.duration      = +document.getElementById('cfg-train-dur').value  || 60;
    await Config.save(cfg);
    toast('✓ Config sauvegardée');
  } catch (e) { toast('Erreur', 'err'); }
}

// ════════════════════════════════════════════════════════════
//  PREVIEW (DRAG & DROP)
// ════════════════════════════════════════════════════════════

function togglePreview() {
  previewOpen = !previewOpen;
  const wrap = document.getElementById('preview-wrap');
  const btn  = document.getElementById('preview-toggle-btn');
  wrap.hidden = !previewOpen;
  btn.textContent = previewOpen ? 'Masquer' : 'Afficher';
  if (previewOpen) { computePreviewScale(); renderPreview(); }
}

function computePreviewScale() {
  const wrap  = document.getElementById('preview-wrap');
  const inner = document.getElementById('preview-inner');
  if (!wrap || !inner) return;
  previewScale = wrap.clientWidth / 1920;
  inner.style.transform = `scale(${previewScale})`;
  wrap.style.height = Math.round(1080 * previewScale) + 'px';
}

function getZonePixelPos(cfgKey) {
  const zc = layoutCfg[cfgKey] || {};
  const w  = zc.width   || DEFAULT_WIDTHS[cfgKey]   || 200;
  const h  = PREVIEW_HEIGHTS[cfgKey] || 80;
  const left = zc.left   != null ? zc.left   : (zc.right  != null ? 1920 - zc.right  - w : 0);
  const top  = zc.top    != null ? zc.top    : (zc.bottom != null ? 1080 - zc.bottom - h : 0);
  return { left, top, w, h };
}

function renderPreview() {
  const inner = document.getElementById('preview-inner');
  if (!inner) return;

  let html = `
    <div class="preview-grid-line" style="left:480px;top:0;width:1px;height:1080px"></div>
    <div class="preview-grid-line" style="left:960px;top:0;width:1px;height:1080px"></div>
    <div class="preview-grid-line" style="left:1440px;top:0;width:1px;height:1080px"></div>
    <div class="preview-grid-line" style="left:0;top:270px;width:1920px;height:1px"></div>
    <div class="preview-grid-line" style="left:0;top:540px;width:1920px;height:1px"></div>
    <div class="preview-grid-line" style="left:0;top:810px;width:1920px;height:1px"></div>
  `;

  ZONES.forEach(z => {
    const { left, top, w, h } = getZonePixelPos(z.cfgKey);
    const visible  = visData[z.cfgKey] !== false;
    const selected = currentZone?.cfgKey === z.cfgKey;
    const col      = z.color || '#888';

    html += `
      <div class="preview-zone${selected ? ' pz-selected' : ''}${!visible ? ' pz-hidden' : ''}"
           data-key="${z.cfgKey}"
           style="left:${left}px;top:${top}px;width:${w}px;height:${h}px;
                  background:${col}22;border-color:${col}${visible ? 'bb' : '44'}">
        <span class="preview-zone-label" style="color:${col}">${z.label}</span>
      </div>
    `;
  });

  inner.innerHTML = html;
  inner.addEventListener('pointerdown', onPreviewPointerDown);
  inner.addEventListener('pointermove', onPreviewPointerMove);
  inner.addEventListener('pointerup',   onPreviewPointerUp);
}

function onPreviewPointerDown(e) {
  const zoneEl = e.target.closest('.preview-zone');
  if (!zoneEl) return;
  e.preventDefault();
  e.currentTarget.setPointerCapture(e.pointerId);
  const cfgKey = zoneEl.dataset.key;
  const { left, top } = getZonePixelPos(cfgKey);
  previewDrag = { cfgKey, startClientX: e.clientX, startClientY: e.clientY, startLeft: left, startTop: top };
  selectZone(cfgKey);
}

function onPreviewPointerMove(e) {
  if (!previewDrag) return;
  const dx = (e.clientX - previewDrag.startClientX) / previewScale;
  const dy = (e.clientY - previewDrag.startClientY) / previewScale;
  const { w, h } = getZonePixelPos(previewDrag.cfgKey);
  const newLeft = Math.max(0, Math.min(1920 - w, previewDrag.startLeft + dx));
  const newTop  = Math.max(0, Math.min(1080 - h, previewDrag.startTop  + dy));
  const hVal = hAnchor === 'left' ? Math.round(newLeft) : Math.round(1920 - newLeft - w);
  const vVal = vAnchor === 'top'  ? Math.round(newTop)  : Math.round(1080 - newTop  - h);
  document.getElementById('pos-h-val').value = hVal;
  document.getElementById('pos-v-val').value = vVal;
  const el = document.querySelector(`.preview-zone[data-key="${previewDrag.cfgKey}"]`);
  if (el) { el.style.left = newLeft + 'px'; el.style.top = newTop + 'px'; }
}

async function onPreviewPointerUp(e) {
  if (!previewDrag) return;
  await savePosition();
  previewDrag = null;
  if (previewOpen) renderPreview();
}

// ════════════════════════════════════════════════════════════
//  IMPORT / EXPORT
// ════════════════════════════════════════════════════════════

async function exportConfig() {
  try {
    const cfg  = await Config.load();
    const blob = new Blob([JSON.stringify(cfg, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), {
      href: url,
      download: `streamalerts-config-${new Date().toISOString().slice(0,10)}.json`,
    });
    a.click();
    URL.revokeObjectURL(url);
    toast('✓ Config exportée');
  } catch (e) { toast('Erreur export', 'err'); }
}

function importConfig(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (ev) => {
    try {
      const cfg = JSON.parse(ev.target.result);
      await Config.save(cfg);
      layoutCfg = cfg;
      toast('✓ Config importée — rechargez l\'overlay');
    } catch (e) { toast('Fichier invalide', 'err'); }
    input.value = '';
  };
  reader.readAsText(file);
}

// ════════════════════════════════════════════════════════════
//  PROFILS
// ════════════════════════════════════════════════════════════

const LS_PROFILES = 'streamalerts_profiles';

function getProfiles() {
  try { return JSON.parse(localStorage.getItem(LS_PROFILES) || '[]'); }
  catch { return []; }
}

function saveProfiles(list) {
  localStorage.setItem(LS_PROFILES, JSON.stringify(list));
}

function renderProfileSelect() {
  const sel   = document.getElementById('profile-select');
  if (!sel) return;
  const list  = getProfiles();
  const cur   = sel.value;
  sel.innerHTML = '<option value="">— aucun profil —</option>' +
    list.map((p, i) => `<option value="${i}" ${String(i) === cur ? 'selected' : ''}>${esc(p.name)}</option>`).join('');
}

async function saveProfile() {
  const sel   = document.getElementById('profile-select');
  const list  = getProfiles();
  const idx   = parseInt(sel.value, 10);
  const cfg   = await Config.load().catch(() => ({}));

  if (!isNaN(idx) && list[idx]) {
    list[idx].config = cfg;
    saveProfiles(list);
    toast(`✓ Profil "${list[idx].name}" mis à jour`);
  } else {
    const name = prompt('Nom du nouveau profil :');
    if (!name) return;
    list.push({ name: name.trim(), config: cfg });
    saveProfiles(list);
    renderProfileSelect();
    document.getElementById('profile-select').value = String(list.length - 1);
    toast(`✓ Profil "${name}" créé`);
  }
}

async function loadProfile() {
  const sel = document.getElementById('profile-select');
  const idx = parseInt(sel.value, 10);
  const list = getProfiles();
  if (isNaN(idx) || !list[idx]) { toast('Sélectionner un profil', 'err'); return; }
  try {
    await Config.save(list[idx].config);
    layoutCfg = list[idx].config;
    if (currentZone) selectZone(currentZone.cfgKey);
    if (previewOpen) renderPreview();
    toast(`✓ Profil "${list[idx].name}" chargé`);
  } catch (e) { toast('Erreur', 'err'); }
}

function newProfile() {
  const name = prompt('Nom du profil :');
  if (!name) return;
  const list = getProfiles();
  list.push({ name: name.trim(), config: {} });
  saveProfiles(list);
  renderProfileSelect();
  document.getElementById('profile-select').value = String(list.length - 1);
  toast(`✓ Profil "${name}" créé (vide)`);
}

function deleteProfile() {
  const sel  = document.getElementById('profile-select');
  const idx  = parseInt(sel.value, 10);
  const list = getProfiles();
  if (isNaN(idx) || !list[idx]) { toast('Sélectionner un profil', 'err'); return; }
  if (!confirm(`Supprimer le profil "${list[idx].name}" ?`)) return;
  list.splice(idx, 1);
  saveProfiles(list);
  renderProfileSelect();
  toast('✓ Profil supprimé');
}

// ════════════════════════════════════════════════════════════
//  ALERT HISTORY
// ════════════════════════════════════════════════════════════

const LS_HISTORY  = 'streamalerts_history';
const MAX_HISTORY = 60;
let   lastAlertTs = -1;

const HIST_COLORS = {
  follow:        { bg:'rgba(46,204,113,0.18)',  fg:'#2ECC71' },
  sub:           { bg:'rgba(241,196,15,0.18)',  fg:'#F1C40F' },
  resub:         { bg:'rgba(241,196,15,0.18)',  fg:'#F1C40F' },
  giftsub:       { bg:'rgba(255,165,0,0.18)',   fg:'#FFA500' },
  raid:          { bg:'rgba(230,126,34,0.18)',  fg:'#E67E22' },
  bits:          { bg:'rgba(0,188,212,0.18)',   fg:'#00BCD4' },
  donation:      { bg:'rgba(52,152,219,0.18)',  fg:'#3498DB' },
  channelpoints: { bg:'rgba(155,89,182,0.18)', fg:'#9B59B6' },
  hype_train:    { bg:'rgba(255,80,80,0.18)',   fg:'#FF5050' },
};

function getHistory() {
  try { return JSON.parse(localStorage.getItem(LS_HISTORY) || '[]'); }
  catch { return []; }
}

async function pollHistory() {
  try {
    const d = await apiRead('alert');
    if (!d?.timestamp || d.timestamp === lastAlertTs) return;
    lastAlertTs = d.timestamp;
    const hist = getHistory();
    hist.unshift({ ...d, _addedAt: Date.now() });
    if (hist.length > MAX_HISTORY) hist.length = MAX_HISTORY;
    localStorage.setItem(LS_HISTORY, JSON.stringify(hist));
    renderHistory();
  } catch (_) {}
}

function renderHistory() {
  const list = getHistory();
  const el   = document.getElementById('history-list');
  const cnt  = document.getElementById('history-count');
  if (!el) return;
  cnt.textContent = `${list.length} alerte${list.length !== 1 ? 's' : ''} cette session`;
  if (list.length === 0) {
    el.innerHTML = '<div class="queue-empty">Aucune alerte — en attente d\'événements Twitch…</div>';
    return;
  }
  el.innerHTML = list.map(a => {
    const type = a.type || 'unknown';
    const col  = HIST_COLORS[type] || { bg:'rgba(255,255,255,0.08)', fg:'#aaa' };
    const ago  = fmtAgo(a._addedAt);
    let detail = '';
    if (a.amount) detail = `+${a.amount}`;
    else if (a.months) detail = `${a.months} mois`;
    return `
      <div class="history-entry">
        <span class="hist-type" style="background:${col.bg};color:${col.fg}">${esc(type)}</span>
        <span class="hist-user">${esc(a.user || '—')}</span>
        ${detail ? `<span class="hist-detail">${esc(detail)}</span>` : ''}
        <span class="hist-time">${ago}</span>
      </div>
    `;
  }).join('');
}

function fmtAgo(ts) {
  if (!ts) return '';
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60)   return `il y a ${s}s`;
  if (s < 3600) return `il y a ${Math.floor(s/60)}min`;
  return `il y a ${Math.floor(s/3600)}h`;
}

function clearHistory() {
  if (!confirm('Effacer tout l\'historique ?')) return;
  localStorage.removeItem(LS_HISTORY);
  lastAlertTs = -1;
  renderHistory();
  toast('✓ Historique effacé');
}

// ════════════════════════════════════════════════════════════
//  OBS SCENES & WEBSOCKET
// ════════════════════════════════════════════════════════════

const SCENE_DEFS = [
  { name: 'Starting Soon', icon: '☀️', profile: 'ambient',     defaults: { particles: true,  blur: true,  decorativeWidgets: true,  heavyEffects: true,  animationLevel: 'high',    pollIntervalMultiplier: 1  } },
  { name: 'Gameplay',      icon: '🎮', profile: 'performance', defaults: { particles: false, blur: false, decorativeWidgets: false, heavyEffects: false, animationLevel: 'low',     pollIntervalMultiplier: 1  } },
  { name: 'Just Chatting', icon: '💬', profile: 'social',      defaults: { particles: true,  blur: true,  decorativeWidgets: true,  heavyEffects: true,  animationLevel: 'high',    pollIntervalMultiplier: 1  } },
  { name: 'BRB',           icon: '💤', profile: 'minimal',     defaults: { particles: false, blur: false, decorativeWidgets: false, heavyEffects: false, animationLevel: 'minimal', pollIntervalMultiplier: 10 } },
  { name: 'Ending',        icon: '🏁', profile: 'summary',     defaults: { particles: true,  blur: true,  decorativeWidgets: true,  heavyEffects: false, animationLevel: 'medium',  pollIntervalMultiplier: 3  } },
];

let _effectiveScenes = [];
let _activeSceneName = '';
let _savedProfiles   = {};
let _filterRules     = {};
let _obsSceneItems   = {};
let _obsFilterCache  = {};

const SCENE_FEAT_LABELS = { particles: 'Particules', blur: 'Flou', decorativeWidgets: 'Widgets déco', heavyEffects: 'Effets GPU' };
const ANIM_LEVELS = [{ value: 'minimal', label: 'Minimale' }, { value: 'low', label: 'Faible' }, { value: 'medium',  label: 'Normale'  }, { value: 'high', label: 'Élevée' }];
const POLL_MULTS = [{ value: '1', label: 'Normal' }, { value: '2', label: '×2' }, { value: '3', label: '×3' }, { value: '5', label: '×5' }, { value: '10', label: '×10 (lent)' }];
const PROFILE_UNKNOWN = { particles: false, blur: false, decorativeWidgets: false, heavyEffects: false, animationLevel: 'low', pollIntervalMultiplier: 1 };

function _sceneSlug(name) { return name.replace(/\s+/g, '-').replace(/[^a-z0-9\-]/gi, '').toLowerCase(); }

function buildSceneCards() {
  const container = document.getElementById('scene-cards-container');
  if (!container) return;
  const animOpts = ANIM_LEVELS.map(a => `<option value="${a.value}">${a.label}</option>`).join('');
  const pollOpts = POLL_MULTS.map(m => `<option value="${m.value}">${m.label}</option>`).join('');

  container.innerHTML = _effectiveScenes.map(def => {
    const sn      = esc(def.name);
    const slug    = _sceneSlug(def.name);
    const snEscJs = def.name.replace(/'/g, "\\'");
    const featToggles = Object.keys(SCENE_FEAT_LABELS).map(key => 
      `<label class="toggle-switch scene-feat"><input type="checkbox" data-scene="${sn}" data-key="${key}"><span class="toggle-track"></span><span class="toggle-label-text">${SCENE_FEAT_LABELS[key]}</span></label>`
    ).join('');

    return `
      <div class="scene-card" id="scene-card-${slug}">
        <div class="scene-card-head"><span class="scene-card-icon">${def.icon}</span><span class="scene-card-name">${sn}</span><span class="scene-badge">${esc(def.profile)}</span></div>
        <div class="scene-feat-grid">${featToggles}</div>
        <div class="row">
          <div><label>Animation</label><select data-scene="${sn}" data-key="animationLevel">${animOpts}</select></div>
          <div><label>Polling</label><select data-scene="${sn}" data-key="pollIntervalMultiplier">${pollOpts}</select></div>
        </div>
        <button class="scene-filters-toggle" id="ft-${slug}" onclick="toggleSceneFilters('${slug}')">▸ Filtres automatiques</button>
        <div class="scene-filters-body" id="fb-${slug}" style="display:none">
          <div id="fr-${slug}"></div>
          <div class="scene-filter-add">
            <select id="fa-src-${slug}" onchange="onSceneFilterSourceChange('${slug}','${snEscJs}')"><option value="">— Source —</option></select>
            <select id="fa-flt-${slug}"><option value="">— Filtre —</option></select>
            <select id="fa-sta-${slug}"><option value="true">ON</option><option value="false">OFF</option></select>
            <button class="btn-add-filter" onclick="addFilterRule('${slug}','${snEscJs}')">+ Ajouter</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

function buildSceneForceGrid() {
  const grid = document.getElementById('scene-force-grid');
  if (!grid) return;
  grid.innerHTML = _effectiveScenes.map(def => {
    const sn   = esc(def.name);
    const slug = _sceneSlug(def.name);
    return `<button class="scene-force-btn" id="force-btn-${slug}" onclick="forceScene('${sn.replace(/'/g, "\\'")}')">${def.icon}<br>${sn}</button>`;
  }).join('');
}

const OBS_PLACEHOLDER_HTML = `<div class="scene-not-connected"><div class="scene-not-connected-icon">🔌</div><div class="scene-not-connected-title">WebSocket OBS non connecté</div><div class="scene-not-connected-desc">Connectez-vous à OBS WebSocket ci-dessus<br>pour détecter et configurer vos scènes</div></div>`;

function _showObsPlaceholder() {
  const container = document.getElementById('scene-cards-container');
  const grid      = document.getElementById('scene-force-grid');
  if (container) container.innerHTML = OBS_PLACEHOLDER_HTML;
  if (grid)      grid.innerHTML      = '';
}

function rebuildFromObsScenes(sceneNames) {
  _effectiveScenes = sceneNames.map(name => {
    const preset = SCENE_DEFS.find(d => d.name === name);
    return preset || { name: name, icon: '🎞️', profile: 'custom', defaults: { ...PROFILE_UNKNOWN } };
  });
  const container = document.getElementById('scene-cards-container');
  const grid      = document.getElementById('scene-force-grid');
  if (container) container.innerHTML = '';
  if (grid)      grid.innerHTML      = '';
  buildSceneCards();
  buildSceneForceGrid();
  _buildSourceSelects();
  const defaultSel = document.getElementById('scene-default');
  if (defaultSel) {
    const prevVal = defaultSel.value;
    defaultSel.innerHTML = _effectiveScenes.map(d => `<option value="${esc(d.name)}">${d.icon} ${esc(d.name)}</option>`).join('');
    defaultSel.value = prevVal;
  }
  _fillSceneValues();
  _renderAllFilterRules();
  updateSceneLiveUI(_activeSceneName);
}

async function loadSceneConfig() {
  _showObsPlaceholder();
  let cfg;
  try { cfg = await Config.load(); } catch (_) { cfg = {}; }
  const sceneCfg = cfg.scene || {};
  const pollEl   = document.getElementById('scene-poll-interval');
  if (pollEl) pollEl.value = sceneCfg.pollInterval || 2000;
  _savedProfiles = sceneCfg.profiles    || {};
  _filterRules   = sceneCfg.filterRules || {};
}

function _fillSceneValues(profiles) {
  profiles = profiles || _savedProfiles;
  _effectiveScenes.forEach(def => {
    const overrides = profiles[def.name] || {};
    const p = { ...def.defaults, ...overrides };
    Object.keys(SCENE_FEAT_LABELS).forEach(key => {
      const el = document.querySelector(`input[data-scene="${def.name}"][data-key="${key}"]`);
      if (el) el.checked = !!p[key];
    });
    const animEl = document.querySelector(`select[data-scene="${def.name}"][data-key="animationLevel"]`);
    if (animEl) animEl.value = p.animationLevel || 'low';
    const multEl = document.querySelector(`select[data-scene="${def.name}"][data-key="pollIntervalMultiplier"]`);
    if (multEl) multEl.value = String(p.pollIntervalMultiplier || 1);
  });
}

async function saveSceneConfig() {
  if (_effectiveScenes.length === 0) { toast('Connectez OBS WebSocket pour sauvegarder', 'err'); return; }
  try {
    const cfg = await Config.load().catch(() => ({}));
    cfg.scene = cfg.scene || {};
    const defaultEl = document.getElementById('scene-default');
    const pollEl    = document.getElementById('scene-poll-interval');
    if (defaultEl) cfg.scene.defaultScene = defaultEl.value;
    if (pollEl)    cfg.scene.pollInterval  = +pollEl.value || 2000;
    const profiles = {};
    _effectiveScenes.forEach(def => {
      const overrides = {};
      Object.keys(SCENE_FEAT_LABELS).forEach(key => {
        const el = document.querySelector(`input[data-scene="${def.name}"][data-key="${key}"]`);
        if (el) overrides[key] = el.checked;
      });
      const animEl = document.querySelector(`select[data-scene="${def.name}"][data-key="animationLevel"]`);
      if (animEl) overrides.animationLevel = animEl.value;
      const multEl = document.querySelector(`select[data-scene="${def.name}"][data-key="pollIntervalMultiplier"]`);
      if (multEl) overrides.pollIntervalMultiplier = +multEl.value;
      profiles[def.name] = overrides;
    });
    cfg.scene.profiles    = profiles;
    cfg.scene.filterRules = _filterRules;
    await Config.save(cfg);
    toast('✓ Scènes sauvegardées');
  } catch (e) { toast('Erreur : ' + e.message, 'err'); }
}

async function forceScene(name) {
  try {
    if (obsWsConnected) {
      _obsSend(6, { requestType: 'SetCurrentProgramScene', requestId: 'set-scene', requestData: { sceneName: name } });
    }
    await apiWrite('current-scene', { currentScene: name, timestamp: Date.now() });
    toast('🎬 ' + name);
    _activeSceneName = name;
    updateSceneLiveUI(name);
  } catch (e) { toast('Erreur', 'err'); }
}

async function pollActiveScene() {
  if (obsWsConnected) return;
  try {
    const d = await apiRead('current-scene');
    const name = (d && d.currentScene) ? d.currentScene : '—';
    if (name !== _activeSceneName) { _activeSceneName = name; updateSceneLiveUI(name); }
  } catch (_) {}
}

function updateSceneLiveUI(name) {
  const nameEl    = document.getElementById('scene-active-name');
  const profileEl = document.getElementById('scene-active-profile');
  if (nameEl) nameEl.textContent = name || '—';
  const def = _effectiveScenes.find(d => d.name === name);
  if (profileEl) profileEl.textContent = def ? def.profile : '—';
  _effectiveScenes.forEach(d => {
    const slug = _sceneSlug(d.name);
    const card = document.getElementById('scene-card-' + slug);
    const btn  = document.getElementById('force-btn-' + slug);
    if (card) card.classList.toggle('scene-card--active', d.name === name);
    if (btn)  btn.classList.toggle('active', d.name === name);
  });
}

// ════════════════════════════════════════════════════════════
//  OBS WEBSOCKET CLIENT
// ════════════════════════════════════════════════════════════

let obsWs          = null;
let obsWsConnected = false;
const LS_OBS_URL = 'streamalerts_obs_ws_url';
const LS_OBS_PWD = 'streamalerts_obs_ws_pwd';

function obsLoadSavedParams() {
  const urlEl = document.getElementById('obs-ws-url');
  const pwdEl = document.getElementById('obs-ws-pwd');
  const savedUrl = localStorage.getItem(LS_OBS_URL);
  const savedPwd = localStorage.getItem(LS_OBS_PWD);
  if (urlEl && savedUrl) urlEl.value = savedUrl;
  if (pwdEl && savedPwd) pwdEl.value = savedPwd;
}

function obsConnect() {
  const url = (document.getElementById('obs-ws-url').value.trim()) || 'ws://localhost:4455';
  const pwd =  document.getElementById('obs-ws-pwd').value.trim();
  localStorage.setItem(LS_OBS_URL, url);
  localStorage.setItem(LS_OBS_PWD, pwd);
  if (obsWs) { try { obsWs.close(); } catch (_) {} obsWs = null; }
  setObsStatus('connecting');
  try {
    obsWs = new WebSocket(url);
  } catch (e) {
    setObsStatus('error');
    toast('URL invalide', 'err');
    return;
  }
  obsWs.onclose = () => { obsWsConnected = false; setObsStatus('disconnected'); };
  obsWs.onerror = () => { setObsStatus('error'); };
  obsWs.onmessage = (ev) => {
    let msg;
    try { msg = JSON.parse(ev.data); } catch (_) { return; }
    switch (msg.op) {
      case 0: _obsHandleHello(msg.d, pwd);  break;
      case 2: _obsHandleIdentified(msg.d);  break;
      case 5: _obsHandleEvent(msg.d);       break;
      case 7: _obsHandleResponse(msg.d);    break;
    }
  };
}

function obsDisconnect() {
  if (obsWs) { try { obsWs.close(); } catch (_) {} obsWs = null; }
  obsWsConnected   = false;
  _effectiveScenes = [];
  _obsSceneItems   = {};
  _obsFilterCache  = {};
  setObsStatus('disconnected');
  _showObsPlaceholder();
}

function _obsSend(op, data) {
  if (!obsWs || obsWs.readyState !== WebSocket.OPEN) return;
  obsWs.send(JSON.stringify({ op: op, d: data }));
}

async function _obsHandleHello(d, password) {
  const identifyData = { rpcVersion: 1, eventSubscriptions: 4 };
  if (d.authentication) {
    if (!password) { setObsStatus('error'); toast('OBS requiert un mot de passe', 'err'); return; }
    try {
      const enc = new TextEncoder();
      const s1  = await crypto.subtle.digest('SHA-256', enc.encode(password + d.authentication.salt));
      const b64 = btoa(String.fromCharCode.apply(null, new Uint8Array(s1)));
      const s2  = await crypto.subtle.digest('SHA-256', enc.encode(b64 + d.authentication.challenge));
      identifyData.authentication = btoa(String.fromCharCode.apply(null, new Uint8Array(s2)));
    } catch (e) { setObsStatus('error'); toast('Erreur d\'authentification', 'err'); return; }
  }
  _obsSend(1, identifyData);
}

function _obsHandleIdentified() {
  obsWsConnected = true;
  setObsStatus('connected');
  _obsSend(6, { requestType: 'GetSceneList', requestId: 'get-scenes' });
}

function _obsHandleResponse(d) {
  if (!d.requestStatus || !d.requestStatus.result) return;
  if (d.requestType === 'GetSceneList') {
    const rd     = d.responseData || {};
    const scenes = (rd.scenes || []).map(s => s.sceneName || s.name || '').filter(Boolean).reverse();
    setObsStatus('connected', scenes.length);
    rebuildFromObsScenes(scenes);
    const current = rd.currentProgramSceneName || '';
    if (current) { _activeSceneName = current; updateSceneLiveUI(current); }
    scenes.forEach(sn => _obsSend(6, { requestType: 'GetSceneItemList', requestId: 'get-scene-items:' + sn, requestData: { sceneName: sn } }));
  }
  if (d.requestType === 'GetSceneItemList') {
    const sceneName = (d.requestId || '').slice('get-scene-items:'.length);
    const items     = (d.responseData && d.responseData.sceneItems) || [];
    const sources = [...new Set(items.map(i => i.sourceName).filter(Boolean))].sort();
    _obsSceneItems[sceneName] = sources;
    _buildSourceSelectForScene(sceneName);
  }
  if (d.requestType === 'GetSourceFilterList') {
    const srcName = (d.requestId || '').replace('get-filters:', '');
    const filters = (d.responseData && d.responseData.filters) || [];
    const fNames  = filters.map(f => f.filterName || '').filter(Boolean);
    _obsFilterCache[srcName] = fNames;
    _effectiveScenes.forEach(def => {
      const slug = _sceneSlug(def.name);
      const srcSel = document.getElementById('fa-src-' + slug);
      if (srcSel && srcSel.value === srcName) _populateFilterSelect(document.getElementById('fa-flt-' + slug), fNames);
    });
  }
}

function _obsHandleEvent(d) {
  if (d.eventType === 'CurrentProgramSceneChanged') {
    const name = d.eventData && d.eventData.sceneName;
    if (name) { _activeSceneName = name; updateSceneLiveUI(name); _applySceneFilters(name); }
  }
  if (['SceneCreated', 'SceneRemoved', 'SceneNameChanged'].includes(d.eventType)) _obsSend(6, { requestType: 'GetSceneList', requestId: 'get-scenes' });
}

function toggleSceneFilters(slug) {
  const body = document.getElementById('fb-' + slug);
  const btn  = document.getElementById('ft-' + slug);
  if (!body) return;
  const open = body.style.display !== 'none';
  body.style.display = open ? 'none' : 'flex';
  if (btn) { btn.classList.toggle('open', !open); btn.textContent = (open ? '▸' : '▾') + ' Filtres automatiques'; }
}

function onSceneFilterSourceChange(slug, sceneName) {
  const srcSel = document.getElementById('fa-src-' + slug);
  const fltSel = document.getElementById('fa-flt-' + slug);
  if (!srcSel || !fltSel) return;
  const src = srcSel.value;
  if (!src) { fltSel.innerHTML = '<option value="">— Filtre —</option>'; return; }
  if (_obsFilterCache[src]) _populateFilterSelect(fltSel, _obsFilterCache[src]);
  else { fltSel.innerHTML = '<option value="">Chargement…</option>'; _obsSend(6, { requestType: 'GetSourceFilterList', requestId: 'get-filters:' + src, requestData: { sourceName: src } }); }
}

function _populateFilterSelect(fltSel, filters) {
  fltSel.innerHTML = '<option value="">— Filtre —</option>' + filters.map(f => `<option value="${esc(f)}">${esc(f)}</option>`).join('');
}

function _buildSourceSelectForScene(sceneName) {
  const slug = _sceneSlug(sceneName);
  const srcSel = document.getElementById('fa-src-' + slug);
  if (!srcSel) return;
  const sources = _obsSceneItems[sceneName] || [];
  const prevVal = srcSel.value;
  srcSel.innerHTML = '<option value="">— Source —</option>' + sources.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('');
  if (prevVal) srcSel.value = prevVal;
}

function _buildSourceSelects() { _effectiveScenes.forEach(def => _buildSourceSelectForScene(def.name)); }

function addFilterRule(slug, sceneName) {
  const src = document.getElementById('fa-src-' + slug).value;
  const flt = document.getElementById('fa-flt-' + slug).value;
  const ena = document.getElementById('fa-sta-' + slug).value === 'true';
  if (!src || !flt) { toast('Sélectionnez une source et un filtre', 'err'); return; }
  if (!_filterRules[sceneName]) _filterRules[sceneName] = [];
  _filterRules[sceneName].push({ source: src, filter: flt, enabled: ena });
  _renderFilterRules(slug, sceneName);
}

function removeFilterRule(slug, sceneName, idx) {
  if (_filterRules[sceneName]) { _filterRules[sceneName].splice(idx, 1); _renderFilterRules(slug, sceneName); }
}

function _renderFilterRules(slug, sceneName) {
  const container = document.getElementById('fr-' + slug);
  if (!container) return;
  const rules = _filterRules[sceneName] || [];
  if (rules.length === 0) { container.innerHTML = '<div class="scene-filter-empty">Aucune règle configurée</div>'; return; }
  container.innerHTML = rules.map((r, i) => {
    const snEscJs = sceneName.replace(/'/g, "\\'");
    return `<div class="scene-filter-rule"><span class="scene-filter-rule-source">${esc(r.source)}</span><span class="scene-filter-rule-filter">→ ${esc(r.filter)}</span><span class="scene-filter-rule-state ${r.enabled ? 'on' : 'off'}">${r.enabled ? 'ON' : 'OFF'}</span><button class="scene-filter-rule-rm" onclick="removeFilterRule('${slug}','${snEscJs}',${i})">✕</button></div>`;
  }).join('');
}

function _renderAllFilterRules() { _effectiveScenes.forEach(def => _renderFilterRules(_sceneSlug(def.name), def.name)); }

function _applySceneFilters(sceneName) {
  const rules = _filterRules[sceneName] || [];
  rules.forEach((r, i) => _obsSend(6, { requestType: 'SetSourceFilterEnabled', requestId: 'set-filter-' + i, requestData: { sourceName: r.source, filterName: r.filter, filterEnabled: r.enabled } }));
}

function setObsStatus(state, sceneCount) {
  const el = document.getElementById('obs-ws-status');
  if (!el) return;
  const texts = { disconnected: 'Non connecté', connecting: 'Connexion en cours…', connected: sceneCount != null ? `Connecté · ${sceneCount} scène${sceneCount > 1 ? 's' : ''}` : 'Connecté', error: 'Impossible de se connecter' };
  el.textContent = texts[state] || state;
  el.className = 'obs-ws-status ' + state;
  document.getElementById('obs-ws-connect-btn').hidden = (state === 'connected' || state === 'connecting');
  document.getElementById('obs-ws-disconnect-btn').hidden = (state !== 'connected');
}

// ════════════════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  loadGoal();
  // Auto-connect OBS if we have a URL saved (optional, matches existing behavior)
  if (localStorage.getItem(LS_OBS_URL)) {
    obsLoadSavedParams();
  }
});
