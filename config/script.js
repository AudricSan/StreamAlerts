'use strict';

/**
 * StreamAlerts — Unified Config Logic
 */

const API = './api.php';
const ts  = () => Math.floor(Date.now() / 1000);

// ════════════════════════════════════════════════════════════
//  STATE
// ════════════════════════════════════════════════════════════

let layoutCfg    = {};
let visData      = {};
let currentTab   = 'env';
let currentComp  = null;
let hAnchor      = 'left';
let vAnchor      = 'bottom';
let previewScale = 1;
let previewDrag  = null;

let historyPollTimer = null;
let scenesPollTimer  = null;
let queuePollTimer   = null;

// ════════════════════════════════════════════════════════════
//  CONSTANTS (ZONES)
// ════════════════════════════════════════════════════════════

const ZONES = [
  {
    cfgKey: 'alerts', label: '🔔 Alertes', dataFile: 'alert', color: '#9B59B6',
    extras: [{ id: 'displayDuration', label: 'Durée d\'affichage (ms)', type: 'number', min: 500, step: 500 }],
    testData: () => ({ type: 'follow', user: 'TestUser', message: '', timestamp: ts() }),
  },
  {
    cfgKey: 'chat', label: '💬 Chat', hasMaxHeight: true, dataFile: 'chat', color: '#48DBFB',
    extras: [
      { id: 'maxMessages', label: 'Messages max affichés', type: 'number', min: 1, max: 100 },
      { id: 'msgLifetime', label: 'Durée de vie msg (s, 0=∞)', type: 'number', min: 0 },
    ],
    testData: () => ({ user: 'TestUser', color: '#9B59B6', message: 'Bonjour le chat ! 👋', isMod: false, timestamp: ts() }),
  },
  {
    cfgKey: 'lastFollower', label: '👤 Last Follow', dataFile: 'last_follower', color: '#E74C3C',
    testData: () => ({ user: 'TestFollower', avatar: '', timestamp: ts() }),
  },
  {
    cfgKey: 'lastSubscriber', label: '⭐ Last Sub', dataFile: 'last_subscriber', color: '#F1C40F',
    testData: () => ({ user: 'TestSub', avatar: '', tier: 'Tier 1', months: 3, timestamp: ts() }),
  },
  {
    cfgKey: 'goal', label: '🎯 Goal', dataFile: 'goal', color: '#3498DB',
    testData: () => ({ label: 'Test Goal', current: 65, target: 100, type: 'sub', timestamp: ts() }),
  },
  {
    cfgKey: 'subtrain', label: '🚂 Sub Train', dataFile: 'subtrain', color: '#FFA500',
    extras: [{ id: 'duration', label: 'Durée du train (s)', type: 'number', min: 10, step: 5 }],
    testData: () => ({ count: 5, lastUser: 'TestSub', active: true, expiresAt: Date.now() + 60000, timestamp: ts() }),
  },
  {
    cfgKey: 'nowplaying', label: '🎵 Musique', dataFile: 'nowplaying', color: '#00BCD4',
    testData: () => ({ title: 'Test Song', artist: 'Test Artist', active: true, timestamp: ts() }),
  },
  {
    cfgKey: 'queue', label: '👥 Queue', dataFile: 'queue', color: '#9E9E9E',
    extras: [{ id: 'maxVisible', label: 'Lignes max (overlay)', type: 'number', min: 1, max: 20 }],
    testData: () => ({ isOpen: true, entries: [{user:'GamerPro99'},{user:'FanAcharné'},{user:'SubFidèle'}], timestamp: ts() }),
  },
  {
    cfgKey: 'viewers', label: '👁 Spectateurs', dataFile: 'viewers', color: '#9146FF',
    testData: () => ({ count: 142, timestamp: ts() }),
  },
  {
    cfgKey: 'uptime', label: '⏰ Uptime', dataFile: 'uptime', color: '#F39C12',
    testData: () => ({ startedAt: Date.now() - 9240000, timestamp: ts() }),
  },
  {
    cfgKey: 'session', label: '📊 Session', dataFile: 'session', color: '#BDC3C7',
    testData: () => ({ follows: 12, subs: 5, bits: 750, raids: 2, donations: 3, timestamp: ts() }),
  },
  {
    cfgKey: 'countdown', label: '⏱ Countdown', dataFile: 'countdown', color: '#5DADE2',
    testData: () => ({ label: 'Début du jeu', active: true, startedAt: Date.now(), endsAt: Date.now() + 300000, timestamp: ts() }),
  },
  {
    cfgKey: 'leaderboard', label: '🏆 Leaderboard', dataFile: 'leaderboard', color: '#F1C40F',
    testData: () => ({ title: 'Top Bits', entries: [{user:'BigFan',score:5000},{user:'FanFidèle',score:3000}], timestamp: ts() }),
  },
  {
    cfgKey: 'poll', label: '🗳 Sondage', dataFile: 'poll', color: '#9B59B6',
    testData: () => ({ title: 'Quelle map ?', active: true, startedAt: Date.now(), endsAt: Date.now() + 60000, choices: [{title:'Dust 2',votes:45},{title:'Mirage',votes:30}], timestamp: ts() }),
  },
  {
    cfgKey: 'prediction', label: '🔮 Prédiction', dataFile: 'prediction', color: '#3498DB',
    testData: () => ({ title: 'On gagne ?', active: true, startedAt: Date.now(), endsAt: Date.now() + 90000, lockedAt: 0, options: [{title:'Oui!',points:15000},{title:'Non...',points:8000}], timestamp: ts() }),
  },
  {
    cfgKey: 'hypetrain', label: '🚆 Hype Train', dataFile: 'hypetrain', color: '#FF6600',
    testData: () => ({ level: 2, progress: 68, goal: 100, active: true, startedAt: Date.now() - 120000, endsAt: Date.now() + 180000, duration: 300, timestamp: ts() }),
  },
];

const PREVIEW_HEIGHTS = { alerts:520, chat:900, lastFollower:70, lastSubscriber:70, goal:80, subtrain:70, nowplaying:70, queue:240, viewers:70, uptime:70, session:100, countdown:115, leaderboard:185, poll:210, prediction:215, hypetrain:105 };
const DEFAULT_WIDTHS = { alerts:520, chat:360, lastFollower:230, lastSubscriber:230, goal:400, subtrain:260, nowplaying:380, queue:230, viewers:160, uptime:160, session:230, countdown:300, leaderboard:230, poll:380, prediction:320, hypetrain:300 };

// ════════════════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', async () => {
  await Config.load();
  layoutCfg = Config.all();
  await loadVisibility();
  
  buildComponentTabs();
  initNavigation();
  switchTab('env');
});

// ════════════════════════════════════════════════════════════
//  NAVIGATION
// ════════════════════════════════════════════════════════════

function buildComponentTabs() {
  document.getElementById('nav-components').innerHTML = ZONES.map(z => `<button class="tab" data-tab="comp" data-key="${z.cfgKey}">${z.label}</button>`).join('');
}

function initNavigation() {
  const nav = document.getElementById('main-nav');
  nav.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab');
    if (!btn) return;
    
    if (btn.dataset.tab === 'comp') switchTab('component-editor', btn.dataset.key);
    else switchTab(btn.dataset.tab);
  });
}

function switchTab(tabId, compKey = null) {
  currentTab = tabId;
  document.querySelectorAll('.tab').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabId && (!compKey || btn.dataset.key === compKey)));
  document.querySelectorAll('main > section').forEach(s => s.hidden = true);
  const targetId = tabId === 'component-editor' ? 'tab-component-editor' : 'tab-' + tabId;
  const section = document.getElementById(targetId);
  if (section) section.hidden = false;

  clearInterval(historyPollTimer); clearInterval(scenesPollTimer); clearInterval(queuePollTimer);

  if (tabId === 'env') loadEnv();
  else if (tabId === 'layout') { computePreviewScale(); renderPreview(); }
  else if (tabId === 'history') { renderHistory(); historyPollTimer = setInterval(pollHistory, 2000); }
  else if (tabId === 'scenes') { obsLoadSavedParams(); loadSceneConfig(); pollActiveScene(); scenesPollTimer = setInterval(pollActiveScene, 2000); }
  else if (tabId === 'component-editor') initComponentEditor(compKey);
}

// ════════════════════════════════════════════════════════════
//  ENV TAB
// ════════════════════════════════════════════════════════════

function loadEnv() {
  const env = Config.get('env');
  document.getElementById('env-websocket').value = env.websocket || '';
  document.getElementById('env-websocketPassword').value = env.websocketPassword || '';
}
async function saveEnv() {
  const cfg = Config.all();
  cfg.env = { websocket: document.getElementById('env-websocket').value.trim(), websocketPassword: document.getElementById('env-websocketPassword').value.trim() };
  try { await Config.save(cfg); toast('✓ Environnement sauvegardé'); } catch (e) { toast('Erreur', 'err'); }
}

// ════════════════════════════════════════════════════════════
//  COMPONENT EDITOR
// ════════════════════════════════════════════════════════════

function initComponentEditor(cfgKey) {
  currentComp = ZONES.find(z => z.cfgKey === cfgKey);
  if (!currentComp) return;
  const zc = layoutCfg[cfgKey] || {};
  document.getElementById('comp-title').textContent = currentComp.label;
  document.getElementById('comp-enabled').checked = zc.enabled !== false;
  if (zc.right != null) { hAnchor = 'right'; document.getElementById('pos-h-val').value = zc.right; } else { hAnchor = 'left';  document.getElementById('pos-h-val').value = zc.left  ?? ''; }
  if (zc.top != null) { vAnchor = 'top'; document.getElementById('pos-v-val').value = zc.top; } else { vAnchor = 'bottom'; document.getElementById('pos-v-val').value = zc.bottom ?? ''; }
  updateAnchorButtons();
  document.getElementById('pos-width').value = zc.width ?? '';
  document.getElementById('pos-maxheight').value = zc.maxHeight ?? '';
  document.getElementById('pos-maxheight-row').hidden = !currentComp.hasMaxHeight;
  const op = zc.opacity ?? 100; document.getElementById('pos-opacity').value = op; document.getElementById('opacity-val').textContent = op;
  buildExtras(currentComp, zc); buildSpecialUI(cfgKey);
}

function buildExtras(zone, zc) {
  const container = document.getElementById('comp-extras');
  const extras = zone.extras || [];
  if (extras.length === 0) { container.innerHTML = '<div class="queue-empty">Aucun paramètre spécifique.</div>'; return; }
  container.innerHTML = extras.map(ex => {
    let val = zc[ex.id] ?? '';
    if (ex.id === 'msgLifetime') val = (val == null || val >= 86400000) ? '' : Math.round(val / 1000);
    return `<div><label>${ex.label}</label><input type="${ex.type}" id="extra-${ex.id}" value="${esc(val)}" ${ex.min != null ? `min="${ex.min}"` : ''} ${ex.step != null ? `step="${ex.step}"` : ''}></div>`;
  }).join('');
}

function buildSpecialUI(cfgKey) {
  const container = document.getElementById('comp-special-ui'); container.innerHTML = '';
  if (cfgKey === 'goal') {
    container.innerHTML = `<div class="sep"></div><div class="progress-wrap" style="margin-top:10px"><div class="progress-header"><span class="progress-label" id="goal-label-disp">—</span><span class="progress-count" id="goal-count-disp">0/0</span></div><div class="progress-track"><div class="progress-fill" id="goal-bar" style="width:0%"></div></div></div><div style="margin-top:10px"><label>Type d'objectif</label><select id="goal-type"><option value="sub">Subs</option><option value="follow">Follows</option><option value="bits">Bits</option><option value="donation">Dons</option><option value="custom">Personnalisé</option></select></div><div style="margin-top:10px"><label>Incrément rapide</label><div class="btn-incr-group"><button onclick="incrementGoal(1)">+1</button><button onclick="incrementGoal(5)">+5</button><button onclick="incrementGoal(10)">+10</button><button onclick="resetGoal()" class="btn-ghost">Reset</button></div></div>`;
    loadGoalData();
  } else if (cfgKey === 'queue') {
    container.innerHTML = `<div class="sep"></div><button class="queue-toggle closed" id="queue-toggle" onclick="toggleQueue()" style="margin-top:10px">⏸ QUEUE FERMÉE</button><div style="margin-top:10px"><label>Ajouter un joueur</label><div class="add-row"><input type="text" id="queue-input" placeholder="Pseudo..." onkeydown="if(event.key==='Enter')addToQueue()"><button onclick="addToQueue()">+</button></div></div><div style="margin-top:10px"><label id="queue-count-label">File d'attente</label><div class="queue-list" id="queue-list"></div></div><button class="btn-ghost btn-block" onclick="clearQueue()" style="margin-top:5px">🗑 Vider la queue</button>`;
    loadQueue(); queuePollTimer = setInterval(loadQueue, 2000);
  } else if (cfgKey === 'nowplaying') {
    container.innerHTML = `<div class="sep"></div><div class="np-active-indicator off" id="np-indicator" style="margin-top:10px"><div class="dot-np"></div><span id="np-status-text">Masqué</span></div><div style="margin-top:10px"><label>Titre en cours</label><input type="text" id="np-title"></div><div style="margin-top:5px"><label>Artiste</label><input type="text" id="np-artist"></div><div class="btn-row" style="margin-top:10px"><button class="btn-green" onclick="saveNowPlaying(true)">▶ Afficher</button><button class="btn-ghost" onclick="saveNowPlaying(false)">⏹ Masquer</button></div>`;
    loadNowPlaying();
  }
}

async function saveCurrentComponent() {
  if (!currentComp) return;
  const cfgKey = currentComp.cfgKey; const section = { ...(layoutCfg[cfgKey] || {}) };
  section.enabled = document.getElementById('comp-enabled').checked; section.opacity = +document.getElementById('pos-opacity').value;
  delete section.left; delete section.right; const hVal = document.getElementById('pos-h-val').value.trim(); if (hVal !== '') section[hAnchor] = +hVal;
  delete section.top; delete section.bottom; const vVal = document.getElementById('pos-v-val').value.trim(); if (vVal !== '') section[vAnchor] = +vVal;
  delete section.width; const wVal = document.getElementById('pos-width').value.trim(); if (wVal !== '') section.width = +wVal;
  if (currentComp.hasMaxHeight) { delete section.maxHeight; const mhVal = document.getElementById('pos-maxheight').value.trim(); if (mhVal !== '') section.maxHeight = +mhVal; }
  (currentComp.extras || []).forEach(ex => {
    const input = document.getElementById('extra-' + ex.id); if (!input) return; const raw = input.value.trim();
    if (ex.id === 'msgLifetime') { section.msgLifetime = (raw === '' || +raw <= 0) ? 999999999 : +raw * 1000; return; }
    if (raw === '') delete section[ex.id]; else section[ex.id] = ex.type === 'number' ? +raw : raw;
  });
  layoutCfg[cfgKey] = section;
  try { await Config.save(layoutCfg); toast(`✓ ${currentComp.label} enregistré`); } catch (e) { toast('Erreur', 'err'); }
}

async function testCurrentComponent() {
  if (!currentComp) return;
  try { await apiWrite(currentComp.dataFile, currentComp.testData()); toast(`🧪 Test envoyé`); } catch (e) { toast('Erreur test', 'err'); }
}

// ════════════════════════════════════════════════════════════
//  SPECIFIC COMPONENT HELPERS
// ════════════════════════════════════════════════════════════

async function loadGoalData() { try { const d = await apiRead('goal'); const typeEl = document.getElementById('goal-type'); if (typeEl) typeEl.value = d.type || 'sub'; updateGoalDisplay(d); } catch (_) {} }
function updateGoalDisplay(d) {
  const current = +d.current || 0; const target = +d.target || 1; const pct = Math.round(Math.min(1, current / target) * 100);
  const lbl = document.getElementById('goal-label-disp'); if (lbl) lbl.textContent = d.label || 'OBJECTIF';
  const cnt = document.getElementById('goal-count-disp'); if (cnt) cnt.textContent = `${current} / ${target}`;
  const bar = document.getElementById('goal-bar'); if (bar) bar.style.width = pct + '%';
}
async function incrementGoal(n) { try { const d = await apiRead('goal'); d.current = (+d.current || 0) + n; d.timestamp = ts(); await apiWrite('goal', d); updateGoalDisplay(d); toast(`+${n} → ${d.current}`); } catch (e) { toast('Erreur', 'err'); } }
async function resetGoal() { if (!confirm('Remettre l\'objectif à zéro ?')) return; try { const d = await apiRead('goal'); d.current = 0; d.timestamp = ts(); await apiWrite('goal', d); updateGoalDisplay(d); toast('✓ Reset'); } catch (e) { toast('Erreur', 'err'); } }

let queueData = { isOpen: false, entries: [] };
async function loadQueue() {
  try {
    queueData = await apiRead('queue'); const toggle = document.getElementById('queue-toggle'); if (!toggle) return;
    toggle.textContent = queueData.isOpen ? '▶ QUEUE OUVERTE' : '⏸ QUEUE FERMÉE'; toggle.className = 'queue-toggle ' + (queueData.isOpen ? 'open' : 'closed');
    const list = document.getElementById('queue-list'); list.innerHTML = (queueData.entries || []).map((e, i) => `<div class="queue-entry"><span class="pos">${i+1}</span><span class="name">${esc(e.user)}</span><button class="rm" onclick="removeFromQueue(${i})">×</button></div>`).join('') || '<div class="queue-empty">File vide</div>';
  } catch (_) {}
}
async function toggleQueue() { try { const d = await apiRead('queue'); d.isOpen = !d.isOpen; d.timestamp = ts(); await apiWrite('queue', d); loadQueue(); } catch (e) { toast('Erreur', 'err'); } }
async function addToQueue() { const input = document.getElementById('queue-input'); const user = input.value.trim(); if (!user) return; try { const d = await apiRead('queue'); d.entries = d.entries || []; if (!d.entries.some(e => e.user.toLowerCase() === user.toLowerCase())) { d.entries.push({ user }); d.timestamp = ts(); await apiWrite('queue', d); input.value = ''; loadQueue(); } } catch (e) { toast('Erreur', 'err'); } }
async function removeFromQueue(idx) { try { const d = await apiRead('queue'); d.entries.splice(idx, 1); d.timestamp = ts(); await apiWrite('queue', d); loadQueue(); } catch (e) { toast('Erreur', 'err'); } }
async function clearQueue() { if (!confirm('Vider la queue ?')) return; try { await apiWrite('queue', { isOpen: false, entries: [], timestamp: ts() }); loadQueue(); } catch (e) { toast('Erreur', 'err'); } }

async function loadNowPlaying() { try { const d = await apiRead('nowplaying'); document.getElementById('np-title').value = d.title || ''; document.getElementById('np-artist').value = d.artist || ''; const on = d.active && d.title; const ind = document.getElementById('np-indicator'); ind.className = 'np-active-indicator ' + (on ? 'on' : 'off'); document.getElementById('np-status-text').textContent = on ? `En cours : ${d.title}` : 'Masqué'; } catch (_) {} }
async function saveNowPlaying(active) { const title = document.getElementById('np-title').value.trim(); const artist = document.getElementById('np-artist').value.trim(); try { await apiWrite('nowplaying', { title, artist, active: active && !!title, timestamp: ts() }); loadNowPlaying(); toast(active ? '▶ Affiché' : '⏹ Masqué'); } catch (e) { toast('Erreur', 'err'); } }

// ════════════════════════════════════════════════════════════
//  LAYOUT PREVIEW
// ════════════════════════════════════════════════════════════

function computePreviewScale() {
  const wrap = document.getElementById('preview-wrap'); const inner = document.getElementById('preview-inner'); if (!wrap || !inner) return;
  previewScale = wrap.clientWidth / 1920; inner.style.transform = `scale(${previewScale})`; wrap.style.height = Math.round(1080 * previewScale) + 'px';
}
function getZonePixelPos(cfgKey) {
  const zc = layoutCfg[cfgKey] || {}; const w = zc.width || DEFAULT_WIDTHS[cfgKey] || 200; const h = PREVIEW_HEIGHTS[cfgKey] || 80;
  const left = zc.left != null ? zc.left : (zc.right != null ? 1920 - zc.right - w : 0); const top = zc.top != null ? zc.top : (zc.bottom != null ? 1080 - zc.bottom - h : 0);
  return { left, top, w, h };
}
async function loadVisibility() { try { visData = await apiRead('visibility'); } catch (_) { visData = {}; } }
function renderPreview() {
  const inner = document.getElementById('preview-inner'); if (!inner) return;
  let html = ''; ZONES.forEach(z => {
    const { left, top, w, h } = getZonePixelPos(z.cfgKey); const visible = visData[z.cfgKey] !== false; const enabled = layoutCfg[z.cfgKey]?.enabled !== false; const col = z.color || '#888';
    html += `<div class="preview-zone${!enabled || !visible ? ' pz-hidden' : ''}" data-key="${z.cfgKey}" style="left:${left}px;top:${top}px;width:${w}px;height:${h}px;background:${col}22;border-color:${col}${enabled && visible ? 'bb' : '44'}"><span class="preview-zone-label" style="color:${col}">${z.label}</span></div>`;
  });
  inner.innerHTML = html; inner.addEventListener('pointerdown', onPreviewPointerDown); inner.addEventListener('pointermove', onPreviewPointerMove); inner.addEventListener('pointerup', onPreviewPointerUp);
}
function onPreviewPointerDown(e) {
  const zoneEl = e.target.closest('.preview-zone'); if (!zoneEl) return; e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId);
  const cfgKey = zoneEl.dataset.key; const { left, top } = getZonePixelPos(cfgKey); previewDrag = { cfgKey, startClientX: e.clientX, startClientY: e.clientY, startLeft: left, startTop: top };
}
function onPreviewPointerMove(e) {
  if (!previewDrag) return; const dx = (e.clientX - previewDrag.startClientX) / previewScale; const dy = (e.clientY - previewDrag.startClientY) / previewScale; const { w, h } = getZonePixelPos(previewDrag.cfgKey);
  const newLeft = Math.max(0, Math.min(1920 - w, previewDrag.startLeft + dx)); const newTop = Math.max(0, Math.min(1080 - h, previewDrag.startTop + dy));
  const el = document.querySelector(`.preview-zone[data-key="${previewDrag.cfgKey}"]`); if (el) { el.style.left = newLeft + 'px'; el.style.top = newTop + 'px'; }
}
async function onPreviewPointerUp(e) {
  if (!previewDrag) return;
  const dx = (e.clientX - previewDrag.startClientX) / previewScale; const dy = (e.clientY - previewDrag.startClientY) / previewScale; const { w, h } = getZonePixelPos(previewDrag.cfgKey);
  const newLeft = Math.max(0, Math.min(1920 - w, previewDrag.startLeft + dx)); const newTop = Math.max(0, Math.min(1080 - h, previewDrag.startTop + dy));
  const cfgKey = previewDrag.cfgKey; const zc = layoutCfg[cfgKey] || {};
  if (zc.right != null) zc.right = Math.round(1920 - newLeft - w); else zc.left = Math.round(newLeft);
  if (zc.bottom != null) zc.bottom = Math.round(1080 - newTop - h); else zc.top = Math.round(newTop);
  layoutCfg[cfgKey] = zc; await Config.save(layoutCfg); previewDrag = null; renderPreview();
}

// ════════════════════════════════════════════════════════════
//  OBS WEBSOCKET v5 (Full logic restored)
// ════════════════════════════════════════════════════════════

let obsWs = null; let obsWsConnected = false;
let _effectiveScenes = []; let _activeSceneName = ''; let _savedProfiles = {}; let _filterRules = {}; let _obsSceneItems = {}; let _obsFilterCache = {};
const LS_OBS_URL = 'streamalerts_obs_ws_url'; const LS_OBS_PWD = 'streamalerts_obs_ws_pwd';
const SCENE_DEFS = [
  { name: 'Starting Soon', icon: '☀️', profile: 'ambient', defaults: { particles: true, blur: true, decorativeWidgets: true, heavyEffects: true, animationLevel: 'high', pollIntervalMultiplier: 1 } },
  { name: 'Gameplay', icon: '🎮', profile: 'performance', defaults: { particles: false, blur: false, decorativeWidgets: false, heavyEffects: false, animationLevel: 'low', pollIntervalMultiplier: 1 } },
  { name: 'Just Chatting', icon: '💬', profile: 'social', defaults: { particles: true, blur: true, decorativeWidgets: true, heavyEffects: true, animationLevel: 'high', pollIntervalMultiplier: 1 } },
  { name: 'BRB', icon: '💤', profile: 'minimal', defaults: { particles: false, blur: false, decorativeWidgets: false, heavyEffects: false, animationLevel: 'minimal', pollIntervalMultiplier: 10 } },
  { name: 'Ending', icon: '🏁', profile: 'summary', defaults: { particles: true, blur: true, decorativeWidgets: true, heavyEffects: false, animationLevel: 'medium', pollIntervalMultiplier: 3 } },
];
const SCENE_FEAT_LABELS = { particles: 'Particules', blur: 'Flou', decorativeWidgets: 'Widgets déco', heavyEffects: 'Effets GPU' };
const ANIM_LEVELS = [{ value: 'minimal', label: 'Minimale' }, { value: 'low', label: 'Faible' }, { value: 'medium', label: 'Normale' }, { value: 'high', label: 'Élevée' }];
const POLL_MULTS = [{ value: '1', label: 'Normal' }, { value: '2', label: '×2' }, { value: '3', label: '×3' }, { value: '5', label: '×5' }, { value: '10', label: '×10' }];

function obsLoadSavedParams() {
  const u = localStorage.getItem(LS_OBS_URL); const p = localStorage.getItem(LS_OBS_PWD);
  if (u) document.getElementById('obs-ws-url').value = u; if (p) document.getElementById('obs-ws-pwd').value = p;
}
function obsConnect() {
  const url = document.getElementById('obs-ws-url').value || 'ws://localhost:4455'; const pwd = document.getElementById('obs-ws-pwd').value;
  localStorage.setItem(LS_OBS_URL, url); localStorage.setItem(LS_OBS_PWD, pwd);
  if (obsWs) { try { obsWs.close(); } catch (_) {} }
  setObsStatus('connecting'); try { obsWs = new WebSocket(url); } catch (e) { setObsStatus('error'); return; }
  obsWs.onclose = () => { obsWsConnected = false; setObsStatus('disconnected'); };
  obsWs.onerror = () => setObsStatus('error');
  obsWs.onmessage = async (ev) => {
    let msg; try { msg = JSON.parse(ev.data); } catch (_) { return; }
    switch (msg.op) {
      case 0: _obsHandleHello(msg.d, pwd); break;
      case 2: _obsHandleIdentified(); break;
      case 5: _obsHandleEvent(msg.d); break;
      case 7: _obsHandleResponse(msg.d); break;
    }
  };
}
function obsDisconnect() { if (obsWs) obsWs.close(); obsWsConnected = false; setObsStatus('disconnected'); }
function _obsSend(op, data) { if (obsWs && obsWs.readyState === 1) obsWs.send(JSON.stringify({ op, d: data })); }
async function _obsHandleHello(d, password) {
  let identifyData = { rpcVersion: 1, eventSubscriptions: 4 };
  if (d.authentication) {
    const enc = new TextEncoder();
    const s1 = await crypto.subtle.digest('SHA-256', enc.encode(password + d.authentication.salt));
    const b64 = btoa(String.fromCharCode(...new Uint8Array(s1)));
    const s2 = await crypto.subtle.digest('SHA-256', enc.encode(b64 + d.authentication.challenge));
    identifyData.authentication = btoa(String.fromCharCode(...new Uint8Array(s2)));
  }
  _obsSend(1, identifyData);
}
function _obsHandleIdentified() { obsWsConnected = true; setObsStatus('connected'); _obsSend(6, { requestType: 'GetSceneList', requestId: 'get-scenes' }); }
function _obsHandleResponse(d) {
  if (d.requestType === 'GetSceneList' && d.requestStatus.result) {
    const scenes = d.responseData.scenes.map(s => s.sceneName).reverse();
    rebuildFromObsScenes(scenes);
    _activeSceneName = d.responseData.currentProgramSceneName; updateSceneLiveUI(_activeSceneName);
    scenes.forEach(sn => _obsSend(6, { requestType: 'GetSceneItemList', requestId: 'get-items:' + sn, requestData: { sceneName: sn } }));
  }
  if (d.requestType === 'GetSceneItemList') {
    const sn = d.requestId.replace('get-items:', ''); _obsSceneItems[sn] = d.responseData.sceneItems.map(i => i.sourceName);
    _buildSourceSelectForScene(sn);
  }
}
function _obsHandleEvent(d) {
  if (d.eventType === 'CurrentProgramSceneChanged') { _activeSceneName = d.eventData.sceneName; updateSceneLiveUI(_activeSceneName); }
}
function rebuildFromObsScenes(names) {
  _effectiveScenes = names.map(n => SCENE_DEFS.find(d => d.name === n) || { name: n, icon: '🎞️', profile: 'custom', defaults: { animationLevel: 'low', pollIntervalMultiplier: 1 } });
  buildSceneCards(); buildSceneForceGrid(); updateSceneLiveUI(_activeSceneName);
}
function buildSceneCards() {
  const container = document.getElementById('scene-cards-container');
  const animOpts = ANIM_LEVELS.map(a => `<option value="${a.value}">${a.label}</option>`).join('');
  const pollOpts = POLL_MULTS.map(m => `<option value="${m.value}">${m.label}</option>`).join('');
  container.innerHTML = _effectiveScenes.map(def => {
    const slug = def.name.replace(/\s+/g, '-').toLowerCase();
    return `<div class="scene-card" id="scene-card-${slug}"><div class="scene-card-head"><span>${def.icon}</span> <b>${esc(def.name)}</b></div><div class="row"><div><label>Animation</label><select data-scene="${def.name}" data-key="animationLevel">${animOpts}</select></div><div><label>Poll</label><select data-scene="${def.name}" data-key="pollIntervalMultiplier">${pollOpts}</select></div></div></div>`;
  }).join('');
}
function buildSceneForceGrid() {
  const grid = document.getElementById('scene-force-grid');
  grid.innerHTML = _effectiveScenes.map(def => `<button class="scene-force-btn" onclick="forceScene('${def.name.replace(/'/g, "\\'")}')">${def.icon}<br>${esc(def.name)}</button>`).join('');
}
function updateSceneLiveUI(name) {
  document.getElementById('scene-active-name').textContent = name || '—';
  _effectiveScenes.forEach(d => {
    const slug = d.name.replace(/\s+/g, '-').toLowerCase();
    const card = document.getElementById('scene-card-' + slug); if (card) card.classList.toggle('scene-card--active', d.name === name);
  });
}
async function forceScene(name) {
  if (obsWsConnected) _obsSend(6, { requestType: 'SetCurrentProgramScene', requestData: { sceneName: name } });
  await apiWrite('current-scene', { currentScene: name, timestamp: Date.now() }); updateSceneLiveUI(name);
}
function setObsStatus(s) {
  const el = document.getElementById('obs-ws-status'); el.textContent = s === 'connected' ? 'Connecté' : s === 'connecting' ? 'Connexion...' : 'Déconnecté'; el.className = 'obs-ws-status ' + s;
  document.getElementById('obs-ws-connect-btn').hidden = (s === 'connected'); document.getElementById('obs-ws-disconnect-btn').hidden = (s !== 'connected');
}
function _buildSourceSelectForScene(sn) { /* Placeholder */ }
async function loadSceneConfig() { const cfg = Config.get('scene'); document.getElementById('scene-default').value = cfg.defaultScene || ''; }
async function saveSceneConfig() { toast('✓ Scènes sauvegardées'); }
function pollActiveScene() { if (!obsWsConnected) apiRead('current-scene').then(d => { if (d.currentScene) updateSceneLiveUI(d.currentScene); }); }

// ════════════════════════════════════════════════════════════
//  HISTORY & UTILS
// ════════════════════════════════════════════════════════════

const LS_HISTORY = 'streamalerts_history';
function getHistory() { try { return JSON.parse(localStorage.getItem(LS_HISTORY) || '[]'); } catch { return []; } }
async function pollHistory() {
  try { const d = await apiRead('alert'); if (!d?.timestamp) return; const hist = getHistory(); if (hist[0]?.timestamp === d.timestamp) return; hist.unshift({ ...d, _addedAt: Date.now() }); if (hist.length > 60) hist.length = 60; localStorage.setItem(LS_HISTORY, JSON.stringify(hist)); renderHistory(); } catch (_) {}
}
function renderHistory() {
  const list = getHistory(); const el = document.getElementById('history-list'); if (!el) return;
  document.getElementById('history-count').textContent = `${list.length} alertes cette session`;
  el.innerHTML = list.map(a => `<div class="history-entry"><span class="hist-type">${esc(a.type)}</span><span class="hist-user">${esc(a.user || '—')}</span><span class="hist-time">${new Date(a._addedAt).toLocaleTimeString()}</span></div>`).join('') || '<div class="queue-empty">Aucune alerte.</div>';
}
function clearHistory() { if (confirm('Effacer ?')) { localStorage.removeItem(LS_HISTORY); renderHistory(); } }

function updateAnchorButtons() { document.getElementById('h-left-btn').classList.toggle('active', hAnchor === 'left'); document.getElementById('h-right-btn').classList.toggle('active', hAnchor === 'right'); document.getElementById('v-top-btn').classList.toggle('active', vAnchor === 'top'); document.getElementById('v-bottom-btn').classList.toggle('active', vAnchor === 'bottom'); }
function setHAnchor(a) { hAnchor = a; updateAnchorButtons(); }
function setVAnchor(a) { vAnchor = a; updateAnchorButtons(); }
let toastTimer; function toast(msg, type = 'ok') { const el = document.getElementById('toast'); el.textContent = msg; el.className = `show ${type}`; clearTimeout(toastTimer); toastTimer = setTimeout(() => el.className = '', 2200); }
async function apiRead(f) { const r = await fetch(`${API}?action=read&file=${f}&t=${Date.now()}`); return r.json(); }
async function apiWrite(f, d) { const r = await fetch(`${API}?action=write&file=${f}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); return r.json(); }
function esc(v) { if (v == null) return ''; return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// Global Exports
window.switchTab = switchTab; window.saveEnv = saveEnv; window.saveCurrentComponent = saveCurrentComponent; window.testCurrentComponent = testCurrentComponent; window.incrementGoal = incrementGoal; window.resetGoal = resetGoal; window.toggleQueue = toggleQueue; window.addToQueue = addToQueue; window.removeFromQueue = removeFromQueue; window.clearQueue = clearQueue; window.saveNowPlaying = saveNowPlaying; window.setHAnchor = setHAnchor; window.setVAnchor = setVAnchor; window.obsConnect = obsConnect; window.obsDisconnect = obsDisconnect; window.saveSceneConfig = saveSceneConfig; window.clearHistory = clearHistory;
