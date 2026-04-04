'use strict';

/* ============================================================
   core/base-component.js — Classe de base pour tous les composants
   Expose : window.BaseComponent

   Chaque composant étend BaseComponent et surcharge :
     setup(cfg)   — initialisation spécifique (optionnel)
     onData(data) — appelé à chaque nouvelle donnée JSON
     testData     — tableau de données de test

   Exemple minimal :
     class ViewersComponent extends BaseComponent {
       constructor() {
         super({ name:'viewers', zoneId:'zone-viewers',
                 dataFile:'viewers.json', testKey:'v' });
       }
       onData(data) { this.zone.innerHTML = `...${data.count}...`; }
     }
     window.ViewerCount = new ViewersComponent();
   ============================================================ */

class BaseComponent {
  /**
   * @param {object} options
   * @param {string}   options.name          clé config ('alerts', 'chat'…)
   * @param {string}   options.zoneId        id HTML    ('zone-alerts'…)
   * @param {string}   [options.dataFile]    fichier JSON ('alert.json'…)
   * @param {number}   [options.pollInterval] ms (défaut config-manager ou 2000)
   * @param {boolean}  [options.skipFirst]   ignorer le 1er poll (défaut false)
   * @param {string}   [options.testKey]     touche de test ('t', 'c'…)
   * @param {object[]} [options.testData]    données de test
   */
  constructor(options) {
    this.name         = options.name;
    this.zoneId       = options.zoneId;
    this.dataFile     = options.dataFile     || null;
    this.pollInterval = options.pollInterval || 2000;
    this.skipFirst    = options.skipFirst    !== undefined ? options.skipFirst : false;
    this.testKey      = options.testKey      || null;
    this.testData     = options.testData     || [];
    this._testIndex   = 0;
    this.cfg          = {};
    this.zone         = null;
  }

  // ── Cycle de vie ─────────────────────────────────────────────

  /**
   * Appelé par script.js après le chargement de config.json.
   * @param {object} cfg — section correspondante de config.json (avec defaults)
   */
  init(cfg = {}) {
    this.cfg  = cfg;
    this.zone = document.getElementById(this.zoneId);

    if (!this.zone) {
      Log.warn(this.name, `Zone #${this.zoneId} introuvable dans le DOM`);
      return;
    }

    this.setup(cfg);

    if (this.dataFile) {
      Poller.register({
        id:        this.name,
        file:      this.dataFile,
        interval:  cfg.pollInterval || this.pollInterval,
        skipFirst: this.skipFirst,
        onData:    (data) => this.onData(data),
      });
    }

    if (this.testKey) {
      Keyboard.register(this.testKey, () => this._runTest());
    }

    Log.info(this.name, 'initialisé');
    Bus.emit('component:ready', { name: this.name });
  }

  // ── Hooks à surcharger ────────────────────────────────────────

  /** Initialisation spécifique au composant (optionnel). */
  setup(cfg) {}

  /**
   * Appelé par PollingManager à chaque nouvelle donnée.
   * La déduplication par timestamp est déjà faite par Poller.
   * @param {object} data — données parsées du JSON
   */
  onData(data) {}

  // ── Données de test ───────────────────────────────────────────

  /**
   * Retourne la prochaine donnée de test (cyclic).
   * Peut être surchargé pour des données dynamiques.
   * @returns {object|null}
   */
  getTestData() {
    if (this.testData.length === 0) return null;
    return this.testData[this._testIndex++ % this.testData.length];
  }

  _runTest() {
    const data = this.getTestData();
    if (data) this.onData({ ...data, timestamp: Date.now() });
  }

  // ── Utilitaires DOM ───────────────────────────────────────────

  show()  { if (this.zone) this.zone.hidden = false; }
  hide()  { if (this.zone) this.zone.hidden = true;  }
  clear() { if (this.zone) this.zone.innerHTML = ''; }
}

window.BaseComponent = BaseComponent;
