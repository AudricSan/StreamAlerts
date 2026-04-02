'use strict';

/* ============================================================
   StreamAlerts — Point d'entrée unique

   Ordre de démarrage :
     1. Chargement de data/config.json
     2. Application des positions/tailles sur chaque zone
     3. Initialisation des composants actifs

   Pour ajouter un composant :
     1. Crée  components/moncomposant.js  (expose window.MonComposant)
     2. Ajoute <script src="components/moncomposant.js"> dans index.html
     3. Ajoute sa section dans data/config.json
     4. Appelle applyZone() + MonComposant.init() ci-dessous
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {

  // ── 1. Config ────────────────────────────────────────────────
  const cfg = await loadConfig();

  // ── 2. Positionnement des zones ──────────────────────────────
  applyZone('zone-alerts',     cfg.alerts);
  applyZone('zone-chat',       cfg.chat);
  applyZone('zone-goal',       cfg.goal);
  applyZone('zone-nowplaying', cfg.nowplaying);
  applyZone('zone-counter',    cfg.counter);

  // ── 3. Composants actifs ─────────────────────────────────────
  Alerts.init(cfg.alerts     || {});
  Chat.init(cfg.chat         || {});

  // Composants futurs — décommenter quand le fichier est créé :
  // Goals.init(cfg.goal        || {});
  // NowPlaying.init(cfg.nowplaying || {});
  // Counter.init(cfg.counter   || {});

});

// ── Chargement du fichier de configuration ───────────────────

async function loadConfig() {
  try {
    const res = await fetch(`data/config.json?t=${Date.now()}`);
    if (res.ok) return await res.json();
  } catch (_) {}
  console.warn('[StreamAlerts] config.json introuvable — positions par défaut utilisées.');
  return {};
}

// ── Application d'une zone depuis la config ──────────────────
//
//  Propriétés de position (px) : top · bottom · left · right
//  Propriétés de taille   (px) : width · height · maxHeight
//
//  Exemple dans config.json :
//    "alerts": { "bottom": 64, "left": 700, "width": 520 }

function applyZone(id, cfg) {
  const el = document.getElementById(id);
  if (!el || !cfg) return;

  const PX_PROPS = ['top', 'bottom', 'left', 'right', 'width', 'height', 'maxHeight'];
  PX_PROPS.forEach(prop => {
    if (cfg[prop] == null) return;
    // maxHeight → max-height
    const cssProp = prop.replace(/([A-Z])/g, c => `-${c.toLowerCase()}`);
    const val = cfg[prop];
    // Nombre  → ajoute px   (ex: 64 → "64px")
    // Chaîne  → passe tel quel  (ex: "auto", "50%", "0")
    el.style[cssProp] = typeof val === 'number' ? `${val}px` : String(val);
  });
}
