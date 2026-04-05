# OBS Hotkeys et Scènes — StreamAlerts

Documentation du SceneManager : détection de la scène OBS active, profils associés, et classes CSS appliquées sur `body`.

Source : `overlay/services/scene-manager.js`

---

## Scènes reconnues et profils associés

Le SceneManager reconnaît cinq noms de scènes par défaut. Chaque scène est associée à un profil CSS qui décrit l'intention de la scène.

| Nom de scène (exact) | Profil | Classe CSS sur `body` | Usage typique |
|---|---|---|---|
| `Starting Soon` | `ambient` | `scene-starting-soon profile-ambient` | Attente avant le stream |
| `Gameplay` | `performance` | `scene-gameplay profile-performance` | Jeu actif |
| `Just Chatting` | `social` | `scene-just-chatting profile-social` | Discussion avec le chat |
| `BRB` | `minimal` | `scene-brb profile-minimal` | Pause, absence courte |
| `Ending` | `summary` | `scene-ending profile-summary` | Fin de stream, récap |

La scène par défaut (utilisée au boot ou si la scène détectée est inconnue) est `Gameplay`.

---

## Classes CSS appliquées sur `body`

A chaque changement de scène, le SceneManager :

1. Supprime toutes les classes `scene-*` et `profile-*` existantes sur `document.body`.
2. Ajoute `scene-<slug>` et `profile-<slug>` correspondant à la nouvelle scène.

La transformation en slug suit ces règles :
- Tout en minuscules
- Les caractères non alphanumériques sont remplacés par `-`
- Les tirets en début et fin sont supprimés

Exemples :

| Nom de scène | Slug scène | Slug profil |
|---|---|---|
| `Starting Soon` | `starting-soon` | `ambient` |
| `Gameplay` | `gameplay` | `performance` |
| `Just Chatting` | `just-chatting` | `social` |
| `BRB` | `brb` | `minimal` |
| `Ending` | `ending` | `summary` |

### Utilisation dans les feuilles de style

```css
/* Masquer le chat en scène BRB */
body.scene-brb #zone-chat {
  display: none;
}

/* Désactiver les effets lourds en mode performance */
body.profile-performance .heavy-effect {
  animation: none;
}

/* Style spécifique à la scène finale */
body.scene-ending .session-card {
  opacity: 1;
}
```

---

## Deux modes de détection

### Mode 1 : API native `obsstudio` (prioritaire)

Utilisé automatiquement quand l'overlay est chargé dans un **Browser Source OBS**.

OBS injecte l'objet `window.obsstudio` dans la page. Le SceneManager :

1. Appelle `obsstudio.getCurrentScene()` pour obtenir la scène initiale.
2. Appelle `obsstudio.getScenes()` pour lister toutes les scènes disponibles (stockées dans `Store`).
3. Écoute l'événement `obsSceneChanged` pour détecter les changements en temps réel.

Ce mode est sans délai — le changement de scène est notifié instantanément par OBS.

### Mode 2 : Polling `current-scene.json` (fallback)

Utilisé quand `window.obsstudio` n'est pas disponible, notamment lors des **tests dans un navigateur ordinaire**.

Le SceneManager enregistre un poller sur `overlay/data/current-scene.json` via `window.Poller`.

Format du fichier attendu :

```json
{
  "currentScene": "Gameplay",
  "timestamp": 1710000000000
}
```

| Champ | Type | Description |
|---|---|---|
| `currentScene` | string | Nom exact de la scène OBS (casse sensible) |
| `timestamp` | number (ms) | Doit changer à chaque écriture pour que le Poller détecte la mise à jour |

L'intervalle de polling est configurable via `config.json` (`scene.pollInterval`, défaut : 2000 ms).

---

## Configuration dans `config.json`

```json
{
  "scene": {
    "defaultScene": "Gameplay",
    "pollInterval": 2000
  }
}
```

| Clé | Type | Défaut | Description |
|---|---|---|---|
| `defaultScene` | string | `"Gameplay"` | Scène appliquée au boot avant la première détection |
| `pollInterval` | number (ms) | `2000` | Fréquence de lecture de `current-scene.json` (minimum : 500) |

---

## API publique du SceneManager

```js
// Scène active
SceneManager.getScene();           // "Gameplay"

// Profil actif (objet copie)
SceneManager.getProfile();         // { profile: "performance" }

// Vérifications
SceneManager.isScene('Gameplay');  // true / false
SceneManager.isProfile('social'); // true / false

// Forcer une scène (tests, overrides)
SceneManager.setScene('BRB');

// S'abonner aux changements
var unsub = SceneManager.onChange(function(sceneName, profile) {
  if (SceneManager.isProfile('performance')) {
    // désactiver les effets lourds
  }
});
// Désabonnement
unsub();
```

L'événement Bus `scene:changed` est aussi émis à chaque changement :

```js
Bus.on('scene:changed', function(payload) {
  // payload = { scene: "Just Chatting", profile: { profile: "social" } }
});
```

---

## Bonnes pratiques pour les noms de scènes

- Respecter la casse exacte : `Gameplay` et non `gameplay` ni `GAMEPLAY`.
- Éviter les caractères spéciaux (accents, `/`, `&`, `(`, `)`) dans les noms de scènes OBS pour éviter des slugs inattendus.
- Si un nom de scène non reconnu est détecté, le SceneManager applique le profil de `Gameplay` et émet un avertissement dans les logs (`Log.warn`).
- Éviter les espaces multiples ou les espaces de début/fin dans les noms de scènes OBS.

---

## Tester sans OBS (navigateur seul)

En mode navigateur, `window.obsstudio` n'existe pas. Le SceneManager bascule automatiquement en mode polling.

### Méthode 1 : modifier `current-scene.json` manuellement

Créer ou éditer le fichier `overlay/data/current-scene.json` :

```json
{
  "currentScene": "Just Chatting",
  "timestamp": 1710000001000
}
```

Le SceneManager détectera le changement au prochain cycle de polling (dans les 2 secondes par défaut) et appliquera les classes CSS correspondantes sur `body`.

Important : le `timestamp` doit changer à chaque modification, sinon le Poller ignorera la mise à jour.

### Méthode 2 : utiliser `SceneManager.setScene()` en console

Ouvrir la console du navigateur (F12) et appeler directement :

```js
SceneManager.setScene('BRB');
// body reçoit immédiatement : class="scene-brb profile-minimal"

SceneManager.setScene('Starting Soon');
// body reçoit : class="scene-starting-soon profile-ambient"
```

### Méthode 3 : vérifier avec `?debug=1`

```
http://localhost/StreamAlerts/overlay/?debug=1
```

Le panneau debug affiche les logs de `SceneManager`, dont le mode sélectionné (API native ou polling JSON) et la scène courante.

---

## Ajouter une scène personnalisée

Pour ajouter un mapping scène → profil au-delà des 5 valeurs par défaut, modifier `SCENE_PROFILES` dans `overlay/services/scene-manager.js` :

```js
var SCENE_PROFILES = {
  'Starting Soon': { profile: 'ambient'     },
  'Gameplay':      { profile: 'performance' },
  'Just Chatting': { profile: 'social'      },
  'BRB':           { profile: 'minimal'     },
  'Ending':        { profile: 'summary'     },
  // Exemple d'ajout :
  'IRL':           { profile: 'social'      },
};
```

Le nom de scène doit correspondre exactement au nom configuré dans OBS.
