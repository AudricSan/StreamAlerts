'use strict';

/* ============================================================
   StreamAlerts — Point d'entrée unique
   Initialise tous les composants actifs de l'overlay OBS.

   Pour ajouter un composant :
     1. Crée components/moncomposant.js  (expose window.MonComposant)
     2. Ajoute <script src="components/moncomposant.js"> dans index.html
     3. Décommente MonComposant.init() ci-dessous
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Composants actifs ──────────────────────────────────────

  Alerts.init();

  // ── Composants futurs (décommenter quand prêt) ─────────────

  // Chat.init();
  // Goals.init();
  // NowPlaying.init();
  // Counter.init();

});
