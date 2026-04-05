'use strict';

/**
 * core/base-component.js — Improved Base class for all overlay widgets.
 * 
 * Provides a standardized lifecycle:
 *   constructor()  — Setup metadata (name, zoneId, etc.)
 *   init(cfg)      — Bootstrap (DOM, Config, Poller, Keyboard)
 *   onMount(cfg)   — Initial rendering / setup (override this)
 *   onData(data)   — Called on new JSON data (override this)
 *   onUnmount()    — Cleanup (optional override)
 */
class BaseComponent {
  /**
   * @param {object} options
   * @param {string}   options.name          Config key ('alerts', 'chat'…)
   * @param {string}   options.zoneId        DOM ID ('zone-alerts'…)
   * @param {string}   [options.dataFile]    JSON filename ('alert.json'…)
   * @param {number}   [options.pollInterval] Default ms (if not in config)
   * @param {boolean}  [options.skipFirst]   Skip first poll on load
   * @param {string}   [options.testKey]     Keyboard test shortcut
   * @param {object[]} [options.testData]    Mock data for testing
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
    this.isMounted    = false;
    this._unsubs      = [];
  }

  /**
   * Bootstrap the component.
   * Called by script.js after config is loaded.
   */
  init(cfg = {}) {
    this.cfg  = cfg;
    this.zone = document.getElementById(this.zoneId);

    if (!this.zone) {
      Log.warn(this.name, `Zone #${this.zoneId} not found in DOM`);
      return;
    }

    // Call user setup (setup is the legacy hook, onMount is the new one)
    this.setup(cfg);
    this.onMount(cfg);
    this.isMounted = true;

    // Register Polling
    if (this.dataFile) {
      Poller.register({
        id:        this.name,
        file:      this.dataFile,
        interval:  cfg.pollInterval || this.pollInterval,
        skipFirst: this.skipFirst,
        onData:    (data) => this._safeOnData(data),
      });
    }

    // Register Keyboard Test
    if (this.testKey) {
      Keyboard.register(this.testKey, () => this._runTest());
    }

    Log.info(this.name, 'initialized');
    Bus.emit('component:ready', { name: this.name });
  }

  /**
   * Cleanup component (useful if we ever support hot-reloading)
   */
  destroy() {
    if (this.dataFile) Poller.unregister(this.name);
    this._unsubs.forEach(unsub => unsub());
    this.onUnmount();
    this.isMounted = false;
  }

  // ── Lifecycle Hooks (Override these) ───────────────────────────

  /** Legacy hook for setup. Use onMount in new code. */
  setup(cfg) {}

  /** Main entry point for component setup and initial render. */
  onMount(cfg) {}

  /** Handle new incoming data. */
  onData(data) {}

  /** Handle component removal. */
  onUnmount() {}

  // ── Internal Helpers ──────────────────────────────────────────

  _safeOnData(data) {
    try {
      this.onData(data);
    } catch (err) {
      Log.error(this.name, 'Error in onData:', err);
    }
  }

  /**
   * Subscribe to Bus and auto-cleanup on destroy.
   */
  subscribe(event, fn) {
    const unsub = Bus.on(event, fn);
    this._unsubs.push(unsub);
    return unsub;
  }

  // ── Test System ──────────────────────────────────────────────

  getTestData() {
    if (this.testData.length === 0) return null;
    return this.testData[this._testIndex++ % this.testData.length];
  }

  _runTest() {
    const data = this.getTestData();
    if (data) this._safeOnData({ ...data, timestamp: Date.now() });
  }

  // ── DOM Helpers ──────────────────────────────────────────────

  show()  { if (this.zone) this.zone.hidden = false; }
  hide()  { if (this.zone) this.zone.hidden = true;  }
  clear() { if (this.zone) this.zone.innerHTML = ''; }
}

window.BaseComponent = BaseComponent;
