'use strict';

// /* ============================================================
//    services/scene-manager.js — Gestionnaire de scène OBS
//    Expose : window.SceneManager

//    Réagit aux changements de scène OBS (via data/current-scene.json)
//    et permet aux composants d'optimiser leur comportement.

//    Données attendues dans data/current-scene.json :
//      {
//        "currentScene": "Gameplay",
//        "timestamp": 1710000000000
//      }

//    Utilisation dans un composant :
//      SceneManager.onChange(function(sceneName, profile) {
//        if (SceneManager.isProfile('performance')) pauseHeavyEffects();
//      });

//    Utilisation CSS (classes automatiques sur <body>) :
//      body.scene-gameplay    { /* styles spécifiques gameplay */ }
//      body.profile-minimal   { /* styles profil minimal       */ }
//    ============================================================ */

const SceneManager = (() => {

  // ── Profils de scène ──────────────────────────────────────────
  // Associe chaque nom de scène OBS à un profil (identifiant CSS).
  // Utilisé pour injecter body.scene-* et body.profile-* dans l'overlay.

  var SCENE_PROFILES = {
    'Starting Soon': { profile: 'ambient'     },
    'Gameplay':      { profile: 'performance' },
    'Just Chatting': { profile: 'social'      },
    'BRB':           { profile: 'minimal'     },
    'Ending':        { profile: 'summary'     },
  };

  var DEFAULT_SCENE = 'Gameplay';

  // ── État interne ──────────────────────────────────────────────

  var _currentScene   = DEFAULT_SCENE;
  var _currentProfile = null;        // copie du profil actif
  var _listeners      = [];          // callbacks onChange
  var _initialized    = false;

  // ── Initialisation ────────────────────────────────────────────

  /**
   * Démarre le SceneManager.
   * À appeler depuis le bootstrap (script.js), après Config.load().
   * Lit la section "scene" de config.json pour :
   *   - defaultScene : scène de repli  (défaut : 'Gameplay')
   *   - pollInterval : ms entre polls  (défaut : 2000)
   */
  function init() {
    if (_initialized) {
      Log.warn('SceneManager', 'déjà initialisé — ignoré');
      return;
    }
    _initialized = true;

    // Lire la config utilisateur
    var cfg          = (window.Config && Config.get('scene')) || {};
    var defaultScene = (cfg.defaultScene && typeof cfg.defaultScene === 'string')
                         ? cfg.defaultScene
                         : DEFAULT_SCENE;
    var pollInterval = (cfg.pollInterval && typeof cfg.pollInterval === 'number' && cfg.pollInterval >= 500)
                         ? cfg.pollInterval
                         : 2000;

    // Appliquer la scène par défaut immédiatement (sans notifier)
    _applyScene(defaultScene, true);

    // Source de détection : API native OBS en priorité, JSON polling en fallback
    if (window.obsstudio) {
      _initObsStudio();
      Log.info('SceneManager', 'mode natif OBS Browser Source (obsstudio)');
    } else {
      Poller.register({
        id:        'scene',
        file:      'current-scene.json',
        interval:  pollInterval,
        skipFirst: false,
        onData:    function(data) { _handleData(data); },
      });
      Log.info('SceneManager', 'mode polling JSON (scène par défaut : ' + defaultScene
        + ', interval : ' + pollInterval + 'ms)');
    }
  }

  // ── Intégration OBS Browser Source ───────────────────────────

  /**
   * Utilise l'API native window.obsstudio disponible dans les Browser Sources OBS.
   * Récupère la scène courante au démarrage et écoute les changements en temps réel.
   * Stocke la liste des scènes dans Store pour le debug panel.
   *
   * Doc OBS : https://github.com/obsproject/obs-browser#javascript-bindings
   */
  function _initObsStudio() {
    // Scène courante au démarrage
    if (typeof window.obsstudio.getCurrentScene === 'function') {
      window.obsstudio.getCurrentScene(function(scene) {
        if (scene && scene.name) {
          _applyScene(scene.name, false);
          Log.debug('SceneManager', 'scène initiale (obsstudio) :', scene.name);
        }
      });
    }

    // Liste de toutes les scènes (pour Store / debug)
    if (typeof window.obsstudio.getScenes === 'function') {
      window.obsstudio.getScenes(function(scenes) {
        if (Array.isArray(scenes)) {
          var names = scenes.map(function(s) { return s.name || s; });
          if (window.Store) Store.set('obs.scenes', names);
          Log.debug('SceneManager', scenes.length + ' scènes détectées');
        }
      });
    }

    // Événement natif déclenché par OBS à chaque changement de scène
    window.addEventListener('obsSceneChanged', function(event) {
      var name = event && event.detail && event.detail.name;
      if (name) {
        _applyScene(name, false);
      } else if (typeof window.obsstudio.getCurrentScene === 'function') {
        // Fallback : re-interroger OBS si event.detail est vide
        window.obsstudio.getCurrentScene(function(scene) {
          if (scene && scene.name) _applyScene(scene.name, false);
        });
      }
    });
  }

  // ── API publique ──────────────────────────────────────────────

  /**
   * Retourne le nom de la scène OBS active.
   * @returns {string}
   */
  function getScene() {
    return _currentScene;
  }

  /**
   * Retourne une copie du profil actif, ou null si inconnu.
   * Propriétés : profile (string — ex: 'performance', 'social')
   * @returns {object|null}
   */
  function getProfile() {
    if (!_currentProfile) return null;
    return _shallowCopy(_currentProfile);
  }

  /**
   * Force la transition vers une scène.
   * Utile pour les tests ou les overrides manuels.
   * @param {string} sceneName
   */
  function setScene(sceneName) {
    if (typeof sceneName !== 'string' || !sceneName) {
      Log.warn('SceneManager', 'setScene : nom de scène invalide', String(sceneName));
      return;
    }
    _applyScene(sceneName, false);
  }

  /**
   * S'abonne aux changements de scène.
   * Le callback reçoit (sceneName: string, profile: object|null).
   * @param {Function} callback
   * @returns {Function} unsubscribe — appeler pour se désabonner
   */
  function onChange(callback) {
    if (typeof callback !== 'function') {
      Log.warn('SceneManager', 'onChange : callback invalide');
      return function() {};
    }
    _listeners.push(callback);
    return function() {
      _listeners = _listeners.filter(function(fn) { return fn !== callback; });
    };
  }

  /**
   * Retourne true si la scène active correspond au nom donné.
   * @param {string} sceneName
   * @returns {boolean}
   */
  function isScene(sceneName) {
    return _currentScene === sceneName;
  }

  /**
   * Retourne true si le profil actif correspond au nom donné.
   * Ex : isProfile('performance')
   * @param {string} profileName
   * @returns {boolean}
   */
  function isProfile(profileName) {
    return !!(_currentProfile && _currentProfile.profile === profileName);
  }

  // ── Logique interne ───────────────────────────────────────────

  /**
   * Gère les données reçues depuis le Poller.
   * @param {object} data — payload parsé de current-scene.json
   */
  function _handleData(data) {
    if (!data || typeof data.currentScene !== 'string' || !data.currentScene) {
      Log.warn('SceneManager', 'payload invalide reçu — fallback sur', DEFAULT_SCENE, data);
      _applyScene(DEFAULT_SCENE, false);
      return;
    }
    _applyScene(data.currentScene, false);
  }

  /**
   * Applique une nouvelle scène :
   * 1. Résout le profil correspondant
   * 2. Met à jour les classes CSS sur <body>
   * 3. Notifie les abonnés
   * @param {string}  sceneName
   * @param {boolean} silent — si true, pas de notification (init)
   */
  function _applyScene(sceneName, silent) {
    var isSame = (sceneName === _currentScene && _initialized && !silent);

    // Résoudre le profil depuis SCENE_PROFILES
    var profile = SCENE_PROFILES[sceneName] || null;

    if (!profile) {
      Log.warn('SceneManager', 'profil inconnu pour "' + sceneName + '" — fallback sur ' + DEFAULT_SCENE);
      profile = SCENE_PROFILES[DEFAULT_SCENE] || null;
    }

    var previousScene = _currentScene;
    _currentScene     = sceneName;
    _currentProfile   = profile;

    // Mettre à jour les classes CSS sur document.body
    _updateBodyClasses(sceneName, profile);

    if (!silent && sceneName !== previousScene) {
      Log.info('SceneManager', 'scène → "' + sceneName + '" (profil: ' + profile.profile + ')');
    }

    // Notifier les abonnés (sauf init silencieux ou scène identique)
    if (!silent && !isSame) {
      _notifyListeners(sceneName, profile);
    }
  }

  /**
   * Remplace les classes scene-* et profile-* sur <body>.
   */
  function _updateBodyClasses(sceneName, profile) {
    var body = document.body;
    if (!body) return;

    // Retirer toutes les classes scene-* et profile-*
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

    // Ajouter les nouvelles classes
    var sceneSlug   = _toSlug(sceneName);
    var profileSlug = profile ? _toSlug(profile.profile) : '';

    body.classList.add('scene-' + sceneSlug);
    if (profileSlug) {
      body.classList.add('profile-' + profileSlug);
    }

  }

  /**
   * Appelle tous les callbacks enregistrés.
   */
  function _notifyListeners(sceneName, profile) {
    var profileCopy = profile ? _shallowCopy(profile) : null;
    for (var i = 0; i < _listeners.length; i++) {
      try {
        _listeners[i](sceneName, profileCopy);
      } catch (e) {
        Log.error('SceneManager', 'exception dans un listener onChange', String(e.message || e));
      }
    }
    Bus.emit('scene:changed', { scene: sceneName, profile: profileCopy });
  }

  /**
   * Convertit un nom de scène en slug CSS valide.
   * Ex : "Just Chatting" → "just-chatting"
   *      "Starting Soon" → "starting-soon"
   */
  function _toSlug(str) {
    return String(str)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Copie superficielle d'un objet (compatible Chromium 90).
   */
  function _shallowCopy(obj) {
    var copy = {};
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        copy[key] = obj[key];
      }
    }
    return copy;
  }

  // ── API exposée ───────────────────────────────────────────────

  return {
    init:       init,
    getScene:   getScene,
    getProfile: getProfile,
    setScene:   setScene,
    onChange:   onChange,
    isScene:    isScene,
    isProfile:  isProfile,
  };

})();

window.SceneManager = SceneManager;