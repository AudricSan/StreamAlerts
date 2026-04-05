'use strict';

/* ============================================================
   core/base-component.js — Classe de base de tous les widgets
   Expose : window.BaseComponent

   Cycle de vie :
     constructor()  → déclarer name, zoneId, dataFile, pollInterval, testKey
     init(cfg)      → appelé par script.js après config:loaded
       └─ setup(cfg)  → hook utilisateur (initialisation, rendu initial)
     onData(data)   → appelé à chaque nouvelle donnée JSON (hook utilisateur)
     test()         → données fictives pour le mode test (hook utilisateur)

   Voir CLAUDE.md §Component Pattern pour un exemple complet.
   ============================================================ */

class BaseComponent {
  /**
   * @param {object}  options
   * @param {string}  options.name           Clé config ('alerts', 'chat'…)
   * @param {string}  options.zoneId         ID DOM ('zone-alerts'…)
   * @param {string}  [options.dataFile]     Fichier JSON à poller ('alert.json'…)
   * @param {number}  [options.pollInterval] Intervalle par défaut en ms
   * @param {string}  [options.testKey]      Touche de test clavier
   */
  constructor(options) {
    this.name         = options.name;
    this.zoneId       = options.zoneId;
    this.dataFile     = options.dataFile     || null;
    this.pollInterval = options.pollInterval || 2000;
    this.testKey      = options.testKey      || null;
    this.skipFirst    = options.skipFirst    === true;

    this.cfg     = {};
    this.zone    = null;
    this._unsubs = [];
  }

  /* ---------------------------------------------------------- */
  /* Bootstrap                                                   */
  /* ---------------------------------------------------------- */

  /**
   * Initialise le composant.
   * Appelé par script.js une fois la config chargée.
   * @param {object} cfg  Section de config correspondant à this.name
   */
  init(cfg) {
    cfg = cfg || {};

    // Vérification enabled (désactivation permanente via config)
    if (!Config.isEnabled(this.name)) {
      Log.info(this.name, 'désactivé — init ignorée');
      return;
    }

    this.cfg  = cfg;
    this.zone = document.getElementById(this.zoneId);

    if (!this.zone) {
      Log.warn(this.name, 'zone #' + this.zoneId + ' introuvable dans le DOM');
      return;
    }

    // Hook utilisateur : initialisation et rendu initial
    try {
      this.setup(cfg);
    } catch (e) {
      Log.error(this.name, 'Erreur dans setup():', e);
    }

    // Enregistrement du poller JSON
    if (this.dataFile) {
      Poller.register({
        id:        this.name,
        file:      this.dataFile,
        interval:  cfg.pollInterval || this.pollInterval,
        skipFirst: this.skipFirst,
        onData:    (data) => { this._safeOnData(data); },
      });
    }

    // Raccourci clavier de test
    if (this.testKey && window.Keyboard) {
      Keyboard.register(this.testKey, () => { this._runTest(); });
    }

    Log.info(this.name, 'initialisé');
    Bus.emit('component:ready', { name: this.name });
  }

  /* ---------------------------------------------------------- */
  /* Hooks à surcharger dans les sous-classes                    */
  /* ---------------------------------------------------------- */

  /** Initialisation et rendu initial. */
  setup(cfg) {}

  /** Appelé à chaque nouvelles données JSON reçues du Poller. */
  onData(data) {}

  /** Données fictives pour le mode test (touche testKey). */
  test() {}

  /* ---------------------------------------------------------- */
  /* Helpers internes                                            */
  /* ---------------------------------------------------------- */

  _safeOnData(data) {
    try {
      this.onData(data);
    } catch (e) {
      Log.error(this.name, 'Erreur dans onData():', e);
    }
  }

  _runTest() {
    try {
      this.test();
    } catch (e) {
      Log.error(this.name, 'Erreur dans test():', e);
    }
  }

  /* ---------------------------------------------------------- */
  /* Helpers publics                                             */
  /* ---------------------------------------------------------- */

  /**
   * S'abonne au Bus et enregistre l'unsubscribe pour un nettoyage futur.
   * @param   {string}   event
   * @param   {Function} fn
   * @returns {Function} unsubscribe
   */
  subscribe(event, fn) {
    const unsub = Bus.on(event, fn);
    this._unsubs.push(unsub);
    return unsub;
  }

  show()  { if (this.zone) this.zone.hidden = false; }
  hide()  { if (this.zone) this.zone.hidden = true;  }
  clear() { if (this.zone) this.zone.innerHTML = '';  }
}

window.BaseComponent = BaseComponent;
