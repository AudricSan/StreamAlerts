'use strict';

/**
 * StreamAlerts — Bootstrap Layer
 * Orchestrates the initialization of all modules and components.
 */

const Bootstrap = (() => {

  const ZONE_DEFS = {
    alerts:         { id: 'zone-alerts',          aliases: ['alerts','alertes','alerte','alert'] },
    chat:           { id: 'zone-chat',             aliases: ['chat'] },
    lastFollower:   { id: 'zone-last-follower',    aliases: ['follower','follow','lastfollow','lastfollower'] },
    lastSubscriber: { id: 'zone-last-subscriber',  aliases: ['sub','subscriber','lastsub','lastsubscriber','abonne'] },
    goal:           { id: 'zone-goal',             aliases: ['goal','objectif'] },
    subtrain:       { id: 'zone-subtrain',         aliases: ['train','subtrain'] },
    nowplaying:     { id: 'zone-nowplaying',       aliases: ['music','musique','nowplaying','chanson'] },
    queue:          { id: 'zone-queue',            aliases: ['queue','file'] },
    viewers:        { id: 'zone-viewers',          aliases: ['viewers','spectateurs'] },
    uptime:         { id: 'zone-uptime',           aliases: ['uptime','duree','direct'] },
    session:        { id: 'zone-session',          aliases: ['session','stats'] },
    countdown:      { id: 'zone-countdown',        aliases: ['countdown','compte','timer'] },
    leaderboard:    { id: 'zone-leaderboard',      aliases: ['leaderboard','top','classement'] },
    poll:           { id: 'zone-poll',             aliases: ['poll','vote','sondage'] },
    prediction:     { id: 'zone-prediction',       aliases: ['prediction','pari'] },
    hypetrain:      { id: 'zone-hypetrain',        aliases: ['hypetrain','hype'] },
  };

  const COMPONENTS = {
    alerts:         window.Alerts,
    chat:           window.Chat,
    lastFollower:   window.LastFollower,
    lastSubscriber: window.LastSubscriber,
    goal:           window.Goals,
    subtrain:       window.SubTrain,
    nowplaying:     window.NowPlaying,
    queue:          window.Queue,
    viewers:        window.ViewerCount,
    uptime:         window.Uptime,
    session:        window.Session,
    countdown:      window.Countdown,
    leaderboard:    window.Leaderboard,
    poll:           window.Poll,
    prediction:     window.Prediction,
    hypetrain:      window.HypeTrain,
  };

  /**
   * Main entry point
   */
  async function run() {
    Log.info('Bootstrap', 'Starting StreamAlerts...');
    
    const cfg = await Config.load();
    
    _applyLayout(cfg);
    _initComponents(cfg);
    _startServices();
    
    Keyboard.updateHint();
    Log.info('Bootstrap', 'Ready');
  }

  function _applyLayout(cfg) {
    Object.entries(ZONE_DEFS).forEach(([key, def]) => {
      const el = document.getElementById(def.id);
      const zoneCfg = cfg[key];
      if (!el || !zoneCfg) return;

      // Position & Size
      ['top', 'bottom', 'left', 'right', 'width', 'height', 'maxHeight'].forEach(prop => {
        if (zoneCfg[prop] == null) return;
        const cssProp = prop.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`);
        el.style[cssProp] = typeof zoneCfg[prop] === 'number' ? `${zoneCfg[prop]}px` : String(zoneCfg[prop]);
      });

      // Opacity
      if (zoneCfg.opacity != null) {
        el.style.opacity = zoneCfg.opacity / 100;
      }

      // Permanent Disable
      if (zoneCfg.enabled === false) {
        el.hidden = true;
        el.dataset.disabled = '1';
      }
    });
  }

  function _initComponents(cfg) {
    Object.entries(COMPONENTS).forEach(([key, instance]) => {
      if (!instance) {
        Log.warn('Bootstrap', `Missing instance for component: ${key}`);
        return;
      }
      
      if (Config.isEnabled(key)) {
        instance.init(Config.get(key));
      } else {
        Log.debug('Bootstrap', `Component ${key} is disabled via config`);
      }
    });
  }

  function _startServices() {
    Visibility.init(ZONE_DEFS);
    SceneManager.init();
    
    // Connect WebSocket if configured
    if (window.WSManager) {
      WSManager.init();
    }
  }

  return { run };
})();

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', Bootstrap.run);
