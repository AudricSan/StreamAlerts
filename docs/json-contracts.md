# JSON Contracts — StreamAlerts

Contrats de données entre Streamer.bot et l'overlay OBS.

---

## Règle universelle : `timestamp`

Tous les fichiers JSON doivent contenir un champ `timestamp` exprimé en **millisecondes Unix** (entier 64 bits).

```json
{ "timestamp": 1710000000000 }
```

Le `Poller` effectue une déduplication basée sur ce champ : si le `timestamp` ne change pas entre deux lectures, la mise à jour est ignorée et l'overlay ne réagit pas. Un `timestamp` manquant ou identique au précédent = aucune mise à jour.

Script Streamer.bot pour obtenir la valeur :

```csharp
long ts = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
```

---

## Fichiers JSON listés dans `ALLOWED`

### `alert.json`

**But :** déclencher l'affichage d'une alerte animée (follow, sub, raid…).

| Champ | Type | Requis | Description |
|---|---|---|---|
| `timestamp` | number (ms) | oui | identifiant d'unicité de l'alerte |
| `type` | string | oui | type d'alerte (voir valeurs ci-dessous) |
| `user` | string | oui | pseudo Twitch de l'utilisateur |
| `message` | string | non | message personnalisé (prioritaire sur le message généré) |
| `avatar` | string | non | URL https:// de l'avatar |
| `amount` | number | non | quantité (bits, viewers de raid, montant donation, nb gifts) |
| `months` | number | non | mois cumulés (resub uniquement) |
| `tier` | string | non | niveau d'abonnement (`Tier 1`, `Tier 2`, `Tier 3`) |
| `sound` | string | non | nom du fichier son dans `assets/sounds/` (ex: `follow.mp3`) |

Valeurs acceptées pour `type` : `follow`, `sub`, `resub`, `giftsub`, `raid`, `bits`, `donation`, `channelpoints`, `hype_train`.

Un type inconnu est silencieusement ignoré par le composant.

**Exemple minimal :**

```json
{
  "type": "follow",
  "user": "NouvelAbonné42",
  "message": "",
  "avatar": "",
  "amount": 0,
  "months": 0,
  "tier": "",
  "timestamp": 1710000000000
}
```

**Note :** `skipFirst: true` est activé sur ce composant — la dernière alerte enregistrée sur disque ne sera pas rejouée au rechargement OBS.

---

### `chat.json`

**But :** fallback polling si le WebSocket Streamer.bot est indisponible. Le mode principal est le WebSocket natif.

| Champ | Type | Requis | Description |
|---|---|---|---|
| `timestamp` | number (ms) | oui | horodatage du message (doit être unique) |
| `user` | string | oui | pseudo Twitch affiché |
| `message` | string | oui | contenu du message |
| `color` | string | non | couleur hex du pseudo (ex: `#FF6B6B`), vide = auto-attribuée |
| `isSub` | boolean | non | utilisateur abonné |
| `isMod` | boolean | non | utilisateur modérateur |
| `isVip` | boolean | non | utilisateur VIP |
| `isBroadcaster` | boolean | non | utilisateur broadcaster |

**Exemple minimal :**

```json
{
  "user": "FanAcharne",
  "color": "#FF6B6B",
  "message": "PogChamp c'est trop bien ce soir !!",
  "isSub": true,
  "isMod": false,
  "isVip": false,
  "isBroadcaster": false,
  "timestamp": 1710000000000
}
```

**Note :** les messages sont persistés dans `localStorage` (clé `streamalerts_chat`) et restaurés après un rechargement OBS pour la durée de vie configurée (`msgLifetime`).

---

### `config.json`

**But :** configuration de l'overlay (positions, tailles, durées, WebSocket). Écrit par le panneau de configuration, pas par Streamer.bot directement.

| Champ | Type | Requis | Description |
|---|---|---|---|
| `timestamp` | number (ms) | non | non utilisé par le Poller (lu une seule fois au boot) |
| `<composant>.enabled` | boolean | oui | `false` = composant définitivement désactivé |
| `<composant>.top` / `bottom` | number (px) | non | ancrage vertical |
| `<composant>.left` / `right` | number (px) | non | ancrage horizontal |
| `<composant>.width` | number (px) | non | largeur de la zone |
| `<composant>.opacity` | number (0-100) | non | opacité globale |
| `<composant>.pollInterval` | number (ms) | non | fréquence de polling |
| `chat.websocket` | string | non | URL du WebSocket Streamer.bot |
| `chat.websocketPassword` | string | non | mot de passe WebSocket |
| `chat.maxMessages` | number | non | nombre max de messages simultanés |
| `chat.msgLifetime` | number (ms) | non | durée de vie d'un message |
| `alerts.displayDuration` | number (ms) | non | durée d'affichage d'une alerte |
| `subtrain.duration` | number (s) | non | durée du sub train en secondes |
| `queue.maxVisible` | number | non | nombre d'entrées visibles dans la queue |

**Exemple minimal :**

```json
{
  "alerts": { "enabled": true, "bottom": 293, "left": 633, "width": 600 },
  "chat":   { "enabled": true, "bottom": 66,  "right": 123, "width": 360 }
}
```

---

### `goal.json`

**But :** afficher une barre de progression vers un objectif.

| Champ | Type | Requis | Description |
|---|---|---|---|
| `timestamp` | number (ms) | oui | déclenche la mise à jour |
| `label` | string | oui | texte affiché en en-tête |
| `current` | number | oui | valeur actuelle |
| `target` | number | oui | valeur cible |
| `type` | string | non | couleur : `sub`, `follow`, `bits`, `donation`, `custom` |

**Exemple minimal :**

```json
{
  "label": "Objectif subs",
  "current": 47,
  "target": 100,
  "type": "sub",
  "timestamp": 1710000000000
}
```

---

### `subtrain.json`

**But :** afficher le compteur de sub train avec barre de décompte.

| Champ | Type | Requis | Description |
|---|---|---|---|
| `timestamp` | number (ms) | oui | déclenche la mise à jour |
| `active` | boolean | oui | `true` = train en cours |
| `count` | number | oui | nombre de subs dans le train |
| `expiresAt` | number (ms) | oui | timestamp d'expiration du train |
| `lastUser` | string | non | pseudo du dernier sub |

**Exemple minimal :**

```json
{
  "count": 7,
  "active": true,
  "lastUser": "SuperFan",
  "expiresAt": 1710000060000,
  "timestamp": 1710000000000
}
```

---

### `nowplaying.json`

**But :** afficher la musique en cours de lecture.

| Champ | Type | Requis | Description |
|---|---|---|---|
| `timestamp` | number (ms) | oui | déclenche la mise à jour |
| `title` | string | oui | titre de la chanson |
| `active` | boolean | oui | `false` = masquer le widget |
| `artist` | string | non | nom de l'artiste |

**Exemple minimal :**

```json
{
  "title": "Titre de la chanson",
  "artist": "Nom de l'artiste",
  "active": true,
  "timestamp": 1710000000000
}
```

Pour masquer le widget : `"active": false` avec un nouveau `timestamp`.

---

### `queue.json`

**But :** gérer la file d'attente des viewers.

| Champ | Type | Requis | Description |
|---|---|---|---|
| `timestamp` | number (ms) | oui | déclenche la mise à jour |
| `isOpen` | boolean | oui | `true` = la queue accepte des inscriptions |
| `entries` | array | oui | liste des entrées (tableau vide = queue vide) |
| `entries[].user` | string | oui | pseudo du viewer dans la file |

**Exemple minimal :**

```json
{
  "isOpen": true,
  "entries": [
    { "user": "GamerPro99" },
    { "user": "FanAcharné" }
  ],
  "timestamp": 1710000000000
}
```

---

### `last_follower.json`

**But :** afficher le dernier viewer à avoir suivi.

| Champ | Type | Requis | Description |
|---|---|---|---|
| `timestamp` | number (ms) | oui | déclenche la mise à jour |
| `user` | string | oui | pseudo du follower |
| `avatar` | string | non | URL https:// de l'avatar |

**Exemple minimal :**

```json
{
  "user": "NouvelAbonné42",
  "avatar": "https://static-cdn.jtvnw.net/...",
  "timestamp": 1710000000000
}
```

---

### `last_subscriber.json`

**But :** afficher le dernier viewer à s'être abonné.

| Champ | Type | Requis | Description |
|---|---|---|---|
| `timestamp` | number (ms) | oui | déclenche la mise à jour |
| `user` | string | oui | pseudo du subscriber |
| `avatar` | string | non | URL https:// de l'avatar |
| `tier` | string | non | niveau (`Tier 1`, `Tier 2`, `Tier 3`) |
| `months` | number | non | mois cumulés (0 si premier sub) |

**Exemple minimal :**

```json
{
  "user": "SuperFan",
  "avatar": "",
  "tier": "Tier 1",
  "months": 0,
  "timestamp": 1710000000000
}
```

---

### `visibility.json`

**But :** persistance de l'état affiché/masqué de chaque composant.

| Champ | Type | Requis | Description |
|---|---|---|---|
| `<nom_composant>` | boolean | non | `true` = visible, `false` = masqué |

Les clés correspondent aux noms internes des composants : `alerts`, `chat`, `lastFollower`, `lastSubscriber`, `goal`, `subtrain`, `nowplaying`, `queue`, `viewers`, `uptime`, `session`, `countdown`, `leaderboard`, `poll`, `prediction`, `hypetrain`.

Un composant absent de ce fichier est considéré visible par défaut.

**Exemple minimal :**

```json
{
  "alerts": true,
  "chat": true,
  "goal": false
}
```

---

### `viewers.json`

**But :** afficher le nombre de spectateurs en direct.

| Champ | Type | Requis | Description |
|---|---|---|---|
| `timestamp` | number (ms) | oui | déclenche la mise à jour |
| `count` | number | oui | nombre de spectateurs |

**Exemple minimal :**

```json
{
  "count": 142,
  "timestamp": 1710000000000
}
```

---

### `uptime.json`

**But :** calculer et afficher la durée du stream. L'overlay calcule l'uptime de façon autonome à partir de `startedAt`.

| Champ | Type | Requis | Description |
|---|---|---|---|
| `timestamp` | number (ms) | oui | déclenche la mise à jour |
| `startedAt` | number (ms) | oui | timestamp de début de stream (`0` = masque le widget) |

**Exemple minimal :**

```json
{
  "startedAt": 1710000000000,
  "timestamp": 1710000000000
}
```

Pour masquer (fin de stream) : `"startedAt": 0`.

---

### `session.json`

**But :** afficher les statistiques cumulées de la session en cours.

| Champ | Type | Requis | Description |
|---|---|---|---|
| `timestamp` | number (ms) | oui | déclenche la mise à jour (`0` = masque le widget) |
| `follows` | number | oui | follows reçus pendant la session |
| `subs` | number | oui | subs (sub + resub + giftsub) pendant la session |
| `bits` | number | non | bits cumulés (montant total) |
| `raids` | number | non | raids reçus |
| `donations` | number | non | nombre de dons reçus |

**Exemple minimal :**

```json
{
  "follows": 12,
  "subs": 5,
  "bits": 750,
  "raids": 2,
  "donations": 3,
  "timestamp": 1710000000000
}
```

---

### `countdown.json`

**But :** afficher un compte à rebours avec barre de progression.

| Champ | Type | Requis | Description |
|---|---|---|---|
| `timestamp` | number (ms) | oui | déclenche la mise à jour |
| `active` | boolean | oui | `true` = timer actif |
| `endsAt` | number (ms) | oui | timestamp de fin |
| `label` | string | non | texte affiché en en-tête |
| `startedAt` | number (ms) | non | timestamp de départ (pour la barre de progression) |

**Exemple minimal :**

```json
{
  "label": "Début du jeu",
  "active": true,
  "startedAt": 1710000000000,
  "endsAt": 1710000300000,
  "timestamp": 1710000000000
}
```

Pour arrêter : `"active": false`.

---

### `leaderboard.json`

**But :** afficher le classement des top contributeurs.

| Champ | Type | Requis | Description |
|---|---|---|---|
| `timestamp` | number (ms) | oui | déclenche la mise à jour |
| `title` | string | oui | titre affiché en en-tête |
| `entries` | array | oui | liste triée par score décroissant |
| `entries[].user` | string | oui | pseudo du contributeur |
| `entries[].score` | number | oui | score total |

**Exemple minimal :**

```json
{
  "title": "Top Bits",
  "entries": [
    { "user": "BigSpender", "score": 12500 },
    { "user": "FanFidèle",  "score": 7300  }
  ],
  "timestamp": 1710000000000
}
```

---

### `poll.json`

**But :** afficher un sondage Twitch actif avec barres de progression et timer.

| Champ | Type | Requis | Description |
|---|---|---|---|
| `timestamp` | number (ms) | oui | déclenche la mise à jour |
| `title` | string | oui | question posée |
| `active` | boolean | oui | `false` = sondage terminé, widget masqué |
| `choices` | array | oui | liste des choix (1 à 5) |
| `choices[].title` | string | oui | texte du choix |
| `choices[].votes` | number | oui | nombre de votes pour ce choix |
| `startedAt` | number (ms) | non | timestamp de départ (pour le timer) |
| `endsAt` | number (ms) | non | timestamp de fin (pour le timer) |

**Exemple minimal :**

```json
{
  "title": "Quelle map on joue ?",
  "active": true,
  "startedAt": 1710000000000,
  "endsAt": 1710000060000,
  "choices": [
    { "title": "Dust 2",  "votes": 45 },
    { "title": "Mirage",  "votes": 30 }
  ],
  "timestamp": 1710000000000
}
```

---

### `prediction.json`

**But :** afficher une prédiction Twitch (2 options) avec points et timer.

| Champ | Type | Requis | Description |
|---|---|---|---|
| `timestamp` | number (ms) | oui | déclenche la mise à jour |
| `title` | string | oui | question posée |
| `active` | boolean | oui | `false` = widget masqué |
| `options` | array | oui | exactement 2 options |
| `options[].title` | string | oui | texte de l'option |
| `options[].points` | number | oui | points Channel Points misés |
| `startedAt` | number (ms) | non | timestamp de départ |
| `endsAt` | number (ms) | non | timestamp de fin de prise de paris |
| `lockedAt` | number (ms) | non | `> 0` = prédiction verrouillée |

**Exemple minimal :**

```json
{
  "title": "On gagne ce round ?",
  "active": true,
  "startedAt": 1710000000000,
  "endsAt": 1710000090000,
  "lockedAt": 0,
  "options": [
    { "title": "Oui !", "points": 15000 },
    { "title": "Non...", "points": 8000 }
  ],
  "timestamp": 1710000000000
}
```

---

### `hypetrain.json`

**But :** afficher la progression du Hype Train avec niveau, barre de progression et timer.

| Champ | Type | Requis | Description |
|---|---|---|---|
| `timestamp` | number (ms) | oui | déclenche la mise à jour |
| `active` | boolean | oui | `false` = widget masqué |
| `level` | number | oui | niveau actuel (1, 2, 3…) |
| `progress` | number | oui | points accumulés dans le niveau |
| `goal` | number | oui | objectif du niveau actuel |
| `endsAt` | number (ms) | oui | timestamp de fin du train |
| `startedAt` | number (ms) | non | timestamp de début |
| `duration` | number (s) | non | durée totale (défaut : 300) |
| `contributors` | array | non | top contributeurs |
| `contributors[].user` | string | non | pseudo |
| `contributors[].amount` | number | non | montant contribué |

**Exemple minimal :**

```json
{
  "level": 2,
  "progress": 68,
  "goal": 100,
  "active": true,
  "startedAt": 1710000000000,
  "endsAt": 1710000300000,
  "duration": 300,
  "contributors": [
    { "user": "TopFan", "amount": 500 }
  ],
  "timestamp": 1710000000000
}
```

---

### `current-scene.json`

**But :** indiquer la scène OBS active au SceneManager (mode fallback hors Browser Source).

| Champ | Type | Requis | Description |
|---|---|---|---|
| `timestamp` | number (ms) | oui | déclenche la mise à jour |
| `currentScene` | string | oui | nom exact de la scène OBS |

**Exemple minimal :**

```json
{
  "currentScene": "Gameplay",
  "timestamp": 1710000000000
}
```

Valeurs reconnues par défaut : `Starting Soon`, `Gameplay`, `Just Chatting`, `BRB`, `Ending`. Un nom inconnu déclenche un fallback sur `Gameplay`.

---

### `last_raid.json`

**But :** afficher le dernier raid reçu.

| Champ | Type | Requis | Description |
|---|---|---|---|
| `timestamp` | number (ms) | oui | déclenche la mise à jour |
| `user` | string | oui | pseudo de la chaîne qui a raidé |
| `viewers` | number | non | nombre de raiders |
| `avatar` | string | non | URL https:// de l'avatar |

**Exemple minimal :**

```json
{
  "user": "RaidBoss99",
  "viewers": 250,
  "avatar": "https://static-cdn.jtvnw.net/...",
  "timestamp": 1710000000000
}
```

---

### `channel_info.json`

**But :** afficher le titre et la catégorie du stream.

| Champ | Type | Requis | Description |
|---|---|---|---|
| `timestamp` | number (ms) | oui | déclenche la mise à jour |
| `title` | string | non | titre du stream |
| `category` | string | non | catégorie / jeu |
| `language` | string | non | code langue (ex: `fr`) |

Au moins `title` ou `category` doit être présent pour que le widget s'affiche.

**Exemple minimal :**

```json
{
  "title": "En train de jouer à quelque chose de super",
  "category": "Just Chatting",
  "language": "fr",
  "timestamp": 1710000000000
}
```

---

### `heartbeat.json`

**But :** confirmer que la chaîne Streamer.bot vers le disque est opérationnelle. Pas de widget associé — utilisé pour le monitoring.

| Champ | Type | Requis | Description |
|---|---|---|---|
| `timestamp` | number (ms) | oui | horodatage de la dernière écriture |
| `status` | string | oui | toujours `"ok"` |

**Exemple minimal :**

```json
{
  "timestamp": 1710000000000,
  "status": "ok"
}
```

Intervalle d'écriture recommandé : 30 secondes.
