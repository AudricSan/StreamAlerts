'use strict';

/* ============================================================
   services/scene-manager.js — Gestionnaire de scène OBS
   Expose : window.SceneManager

   Deux modes de détection (par priorité) :
     1. API native window.obsstudio (dans un Browser Source OBS)
     2. Polling de data/current-scene.json (fallback navigateur)

   Applique body.scene-<slug> et body.profile-<slug> à chaque changement.
   Émet Bus 'scene:changed' { scene, profile }.

   JSON attendu (current-scene.json) :
     { "currentScene": "Gameplay", "timestamp": 1710000000000 }

   Usage :
     SceneManager.onChange(function(sceneName, profile) {
       if (SceneManager.isProfile('performance')) pauseHeavyEffects();
     });
   ============================================================ */

const SceneManager = (() => {

  /* ── Profils de scène ─────────────────────────────────────── */
  var SCENE_PROFILES = {
    'Starting Soon': { profile: 'ambient'     },
    'Gameplay':      { profile: 'performance' },
    'Just Chatting': { profile: 'social'      },
    'BRB':           { profile: 'minimal'     },
    'Ending':        { profile: 'summary'     },
  };
  var DEFAULT_SCENE = 'Gameplay';

  /* ── État interne ─────────────────────────────────────────── */
  var _currentScene   = DEFAULT_SCENE;
  var _currentProfile = null;
  var _listeners      = [];
  var _initialized    = false;

  /* ── Initialisation ───────────────────────────────────────── */

  /**
   * Démarre le SceneManager (à appeler depuis script.js après config:loaded).
   * Lit config.scene : defaultScene, pollInterval.
   */
  function init() {
    if (_initialized) {
      Log.warn('scene', 'déjà initialisé — ignoré');
      return;
    }
    _initialized = true;

    var cfg          = Config.get('scene');
    var defaultScene = (cfg.defaultScene && typeof cfg.defaultScene === 'string')
                         ? cfg.defaultScene
                         : DEFAULT_SCENE;
    var pollInterval = (typeof cfg.pollInterval === 'number' && cfg.pollInterval >= 500)
                         ? cfg.pollInterval
                         : 2000;

    _applyScene(defaultScene, true);

    if (window.obsstudio) {
      _initObsStudio();
      Log.info('scene', 'mode natif OBS (obsstudio)');
    } else {
      Poller.register({
        id:        'scene',
        file:      'current-scene.json',
        interval:  pollInterval,
        skipFirst: false,
        onData:    function(data) { _handleData(data); },
      });
      Log.info('scene', 'mode polling JSON (défaut: ' + defaultScene + ', ' + pollInterval + 'ms)');
    }
  }

  /* ── Intégration OBS Browser Source ──────────────────────── */

  function _initObsStudio() {
    if (typeof window.obsstudio.getCurrentScene === 'function') {
      window.obsstudio.getCurrentScene(function(scene) {
        if (scene && scene.name) {
          _applyScene(scene.name, false);
          Log.debug('scene', 'scène initiale (obsstudio):', scene.name);
        }
      });
    }

    if (typeof window.obsstudio.getScenes === 'function') {
      window.obsstudio.getScenes(function(scenes) {
        if (Array.isArray(scenes)) {
          var names = scenes.map(function(s) { return s.name || s; });
          Store.set('obs', 'scenes', names); // Store.set(namespace, key, value)
          Log.debug('scene', scenes.length + ' scènes détectées');
        }
      });
    }

    window.addEventListener('obsSceneChanged', function(event) {
      var name = event && event.detail && event.detail.name;
      if (name) {
        _applyScene(name, false);
      } else if (typeof window.obsstudio.getCurrentScene === 'function') {
        window.obsstudio.getCurrentScene(function(scene) {
          if (scene && scene.name) _applyScene(scene.name, false);
        });
      }
    });
  }

  /* ── API publique ─────────────────────────────────────────── */

  /** @returns {string} Nom de la scène OBS active. */
  function getScene() { return _currentScene; }

  /** @returns {object|null} Copie du profil actif. */
  function getProfile() {
    return _currentProfile ? _shallowCopy(_currentProfile) : null;
  }

  /** Force manuellement une scène (tests, overrides). */
  function setScene(sceneName) {
    if (typeof sceneName !== 'string' || !sceneName) {
      Log.warn('scene', 'setScene : nom invalide —', String(sceneName));
      return;
    }
    _applyScene(sceneName, false);
  }

  /**
   * S'abonne aux changements de scène.
   * @param   {Function} callback  fn(sceneName, profile)
   * @returns {Function} unsubscribe
   */
  function onChange(callback) {
    if (typeof callback !== 'function') {
      Log.warn('scene', 'onChange : callback invalide');
      return function() {};
    }
    _listeners.push(callback);
    return function() {
      _listeners = _listeners.filter(function(fn) { return fn !== callback; });
    };
  }

  /** @returns {boolean} true si la scène active correspond à sceneName. */
  function isScene(sceneName)   { return _currentScene === sceneName; }

  /** @returns {boolean} true si le profil actif correspond à profileName. */
  function isProfile(profileName) {
    return !!(_currentProfile && _currentProfile.profile === profileName);
  }

  /* ── Logique interne ──────────────────────────────────────── */

  function _handleData(data) {
    if (!data || typeof data.currentScene !== 'string' || !data.currentScene) {
      Log.warn('scene', 'payload invalide — fallback sur ' + DEFAULT_SCENE);
      _applyScene(DEFAULT_SCENE, false);
      return;
    }
    _applyScene(data.currentScene, false);
  }

  function _applyScene(sceneName, silent) {
    var profile = SCENE_PROFILES[sceneName] || null;
    if (!profile) {
      Log.warn('scene', '"' + sceneName + '" inconnu — fallback profil ' + DEFAULT_SCENE);
      profile = SCENE_PROFILES[DEFAULT_SCENE] || null;
    }

    var previous  = _currentScene;
    _currentScene   = sceneName;
    _currentProfile = profile;

    _updateBodyClasses(sceneName, profile);

    if (!silent && sceneName !== previous) {
      Log.info('scene', '→ "' + sceneName + '" (profil: ' + (profile ? profile.profile : 'none') + ')');
      _notifyListeners(sceneName, profile);
    }
  }

  function _updateBodyClasses(sceneName, profile) {
    var body = document.body;
    if (!body) return;

    var toRemove = [];
    for (var i = 0; i < body.classList.length; i++) {
      var cls = body.classList[i];
      if (cls.indexOf('scene-') === 0 || cls.indexOf('profile-') === 0) {
        toRemove.push(cls);
      }
    }
    for (var j = 0; j < toRemove.length; j++) {
      body.classList.remove(toRemove[j]);
    }

    body.classList.add('scene-' + _toSlug(sceneName));
    if (profile) body.classList.add('profile-' + _toSlug(profile.profile));
  }

  function _notifyListeners(sceneName, profile) {
    var profileCopy = profile ? _shallowCopy(profile) : null;
    for (var i = 0; i < _listeners.length; i++) {
      try {
        _listeners[i](sceneName, profileCopy);
      } catch (e) {
        Log.error('scene', 'exception dans listener onChange:', e.message);
      }
    }
    Bus.emit('scene:changed', { scene: sceneName, profile: profileCopy });
  }

  function _toSlug(str) {
    return String(str)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function _shallowCopy(obj) {
    var copy = {};
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) copy[key] = obj[key];
    }
    return copy;
  }

  return { init, getScene, getProfile, setScene, onChange, isScene, isProfile };
})();

window.SceneManager = SceneManager;
