# StreamAlerts

Overlay Twitch **100% local**, sans dépendance externe.
Fonctionne avec **Streamer.bot** + **XAMPP** + **OBS Studio**.

---

## Sommaire

- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration OBS](#configuration-obs)
- [Page de configuration (OBS Dock)](#page-de-configuration-obs-dock)
- [Configuration Streamer.bot](#configuration-streamerbot)
- [Composants de l'overlay](#composants-de-loverlay)
- [Visibilité — commandes chat](#visibilité--commandes-chat)
- [Personnalisation via config.json](#personnalisation-via-configjson)
- [Mode test](#mode-test)
- [Structure des fichiers](#structure-des-fichiers)
- [Dépannage](#dépannage)

---

## Architecture

```
Twitch
  │  événements (follow, sub, raid, chat…)
  ▼
Streamer.bot
  ├── Alertes      → WriteAlert.cs      → overlay/data/alert.json          (polling 500 ms)
  ├── Last Follow  → WriteAlert.cs      → overlay/data/last_follower.json   (polling 2 s)
  ├── Last Sub     → WriteAlert.cs      → overlay/data/last_subscriber.json (polling 2 s)
  ├── Goal         → WriteGoal.cs       → overlay/data/goal.json            (polling 2 s)
  ├── Sub Train    → WriteSubTrain.cs   → overlay/data/subtrain.json        (polling 500 ms)
  ├── Musique      → WriteNowPlaying.cs → overlay/data/nowplaying.json      (polling 3 s)
  ├── Queue        → WriteQueue.cs      → overlay/data/queue.json           (polling 1 s)
  ├── Visibilité   → WriteVisibility.cs → overlay/data/visibility.json      (polling 1,5 s)
  │
  └── Chat ──── WebSocket API ─────────────────────────► overlay/components/chat.js
              (temps réel, push)          │
              + WriteChat.cs → chat.json  (fallback polling si WS indisponible)

                              overlay/index.html  ←  OBS Browser Source unique
                          ┌──────────────────────────────────┐
                          │  data/config.json                │  ← positions, tailles, durées
                          │  data/visibility.json            │  ← affichage/masquage runtime
                          │  components/alerts.js            │
                          │  components/chat.js              │
                          │  components/lastevents.js        │
                          │  components/goals.js             │
                          │  components/subtrain.js          │
                          │  components/nowplaying.js        │
                          │  components/queue.js             │
                          └──────────────────────────────────┘
                                        │
                                        ▼
                            OBS — 1 seul Browser Source
                            1920×1080, fond transparent

  config/index.html  ←  OBS Browser Dock (gestion sans toucher au code)
```

---

## Prérequis

| Outil                                   | Version      | Rôle                            |
| --------------------------------------- | ------------ | ------------------------------- |
| [XAMPP](https://www.apachefriends.org/) | 8.x          | Serveur HTTP + PHP local        |
| [OBS Studio](https://obsproject.com/)   | 27+          | Browser Source + Dock           |
| [Streamer.bot](https://streamer.bot/)   | 0.2+         | Réception des événements Twitch |
| Navigateur moderne                      | Chromium 90+ | Tests                           |

---

## Installation

1. Copie ce dépôt dans `D:\audri\Xamp\htdocs\StreamAlerts\`
   _(adapte le chemin si ton XAMPP est ailleurs — pense à mettre à jour les chemins absolus dans les scripts C#)_

2. Démarre **Apache** dans le panneau XAMPP.

3. Ouvre `http://localhost/StreamAlerts/overlay/` dans ton navigateur.
   Tu dois voir l'indicateur de test en bas de la page.

4. Appuie sur **T** pour tester une alerte, **C** pour un message de chat.

---

## Configuration OBS

### Browser Source (overlay)

Ajoute une **Source Navigateur** avec ces paramètres :

| Paramètre                                | Valeur                                   |
| ---------------------------------------- | ---------------------------------------- |
| URL                                      | `http://localhost/StreamAlerts/overlay/` |
| Largeur                                  | `1920`                                   |
| Hauteur                                  | `1080`                                   |
| Arrière-plan transparent                 | ✅ coché                                 |
| Actualiser quand la scène devient active | ❌ décoché                               |

> **Important :** l'option "Actualiser" efface l'historique du chat à chaque changement de scène.

Place cette source **au-dessus** de toutes les autres dans ta scène.

---

## Page de configuration (OBS Dock)

Une interface web de gestion est disponible à `http://localhost/StreamAlerts/config/`.
Elle permet de tout régler **sans toucher au code**.

### Ajouter le Dock dans OBS

1. OBS → menu **Vue** → **Docks** → **Dock de navigateur personnalisé**
2. URL : `http://localhost/StreamAlerts/config/`
3. Dimensions suggérées : 400 × 750

### Onglets disponibles

| Onglet        | Fonctions                                                                                      |
| ------------- | ---------------------------------------------------------------------------------------------- |
| 🎯 **Goal**   | Définir label/valeur/objectif/type, incrément rapide, reset                                    |
| 👥 **Queue**  | Ouvrir/fermer la queue, ajouter/retirer des joueurs manuellement                               |
| 🎵 **Music**  | Afficher/masquer la musique en cours, titre et artiste                                         |
| 📐 **Layout** | Visibilité rapide de chaque zone, position/taille/opacité, paramètres spécifiques, bouton Test |
| ⚙️ **Config** | Durée des alertes, durée du sub train, last follower/sub affiché                               |

---

## Configuration Streamer.bot

### Vue d'ensemble des triggers

| Script | Type de trigger | Commande / Événement |
| --- | --- | --- |
| `WriteAlert.cs` | ⚡ Événement Twitch | Subscribe, Follow, Raid, Bits… |
| `WriteGoal.cs` | ⚡ Événement Twitch | Mêmes actions que WriteAlert |
| `WriteSubTrain.cs` | ⚡ Événement Twitch | Subscribe, Re-Subscribe, Gift Subscription |
| `WriteChat.cs` | 💬 Chat Message | Tous les messages (fallback WS) |
| `WriteNowPlaying.cs` | 💬 Chat Command | `!np` (mod) |
| `WriteQueue.cs` | 💬 Chat Command | `!join` `!leave` `!next` `!queue` |
| `WriteVisibility.cs` | 💬 Chat Command | `!show` `!hide` `!toggle` _(optionnel)_ |

> Les scripts ⚡ doivent absolument être sur des triggers d'événements Twitch — les placer sur un trigger Chat ne les déclenchera pas automatiquement lors des vrais événements.

---

### Activer le serveur WebSocket

Le chat utilise l'API WebSocket native de Streamer.bot.

1. Streamer.bot → `Servers/Clients` → `WebSocket Server`
2. Coche **Enabled** → **Start**
3. Configure URL et mot de passe dans la page de config (onglet 📐 Layout → 💬 Chat → Paramètres)

### Alertes (WriteAlert.cs)

Le script `streamerbot/WriteAlert.cs` gère **tous** les types d'alertes ainsi que les last follower et last subscriber.

#### Créer l'action centrale

1. Clic droit dans la liste des actions → **Add Action** → Nom : `[StreamAlerts] Écrire alerte`
2. Add Sub-Action → **Core → C# → Execute C# Code** → colle `WriteAlert.cs` → **Compile** → **Save & Close**

#### Créer une action par événement

| Action         | Déclencheur                                        | `alertType`     |
| -------------- | -------------------------------------------------- | --------------- |
| Follow         | Twitch → Channel Events → Follow                   | `follow`        |
| Sub            | Twitch → Channel Events → Subscribe                | `sub`           |
| Resub          | Twitch → Channel Events → Re-Subscribe             | `resub`         |
| Gift Sub       | Twitch → Channel Events → Gift Subscription        | `giftsub`       |
| Raid           | Twitch → Channel Events → Raid                     | `raid`          |
| Bits           | Twitch → Channel Events → Cheer                    | `bits`          |
| Donation       | StreamElements → Tip                               | `donation`      |
| Channel Points | Twitch → Channel Events → Channel Point Redemption | `channelpoints` |
| Hype Train     | Twitch → Channel Events → Hype Train Start         | `hype_train`    |

Chaque action appelle l'action centrale avec l'argument `alertType` correspondant.
Les alertes `follow`, `sub`, `resub`, `giftsub` mettent aussi à jour automatiquement `last_follower.json` et `last_subscriber.json`.

### Chat — fallback polling (WriteChat.cs)

Le WebSocket gère le chat en temps réel. `WriteChat.cs` sert uniquement de fallback si le WebSocket est indisponible.

1. **Add Action** → `[StreamAlerts] Chat`
2. Trigger : `Twitch → Chat Message`
3. Sub-Action → C# → `WriteChat.cs` → Compile → Save

### Goal (WriteGoal.cs)

> ⚠️ **Trigger d'événement requis — pas un trigger Chat.**
> Ce script doit se déclencher automatiquement quand un follow, sub ou bits arrive sur Twitch.
> Le placer sur un trigger Chat ne l'incrémentera que si quelqu'un tape une commande manuellement.

**Où le placer :** ajouter en sous-action dans les actions qui ont déjà un trigger d'événement Twitch — c'est-à-dire les mêmes actions que `WriteAlert.cs`.

**Exemple — objectif de subs (dans `[StreamAlerts] Sub`) :**

```
Trigger  : Twitch → Channel Events → Subscribe
Sub-actions :
  1. Set Argument  →  alertType       = sub
  2. Run Action    →  [StreamAlerts] Écrire alerte    ← déjà présent
  3. Set Argument  →  goalIncrement   = 1
  4. Set Argument  →  goalType        = sub
  5. Execute C#    →  WriteGoal.cs                    ← à ajouter
```

**Arguments disponibles (Set Argument) :**

| Argument        | Valeur                                             | Description                                       |
| --------------- | -------------------------------------------------- | ------------------------------------------------- |
| `goalIncrement` | `1` (ou autre)                                     | Nombre à ajouter à chaque déclenchement           |
| `goalTarget`    | `100`                                              | Objectif total (conservé si déjà dans le fichier) |
| `goalLabel`     | `"Objectif subs"`                                  | Texte affiché (conservé si déjà dans le fichier)  |
| `goalType`      | `sub` / `follow` / `bits` / `donation` / `custom`  | Couleur de la barre                               |
| `goalReset`     | `true`                                             | Remet le compteur à 0 (reset manuel)              |

> `goalTarget` et `goalLabel` ne sont à passer qu'une seule fois. Le script les conserve ensuite automatiquement.

---

### Sub Train (WriteSubTrain.cs)

> ⚠️ **Trigger d'événement requis — pas un trigger Chat.**
> Ce script doit se déclencher automatiquement à chaque sub/resub/giftsub Twitch.
> Le placer sur un trigger Chat ne démarrera le train que si un mod tape une commande manuellement.

**Où le placer :** ajouter en sous-action dans les actions `[StreamAlerts] Sub`, `[StreamAlerts] Resub` et `[StreamAlerts] Gift Sub`, après `WriteAlert.cs`.

**Arguments à passer (Set Argument) :**

| Argument        | Valeur Streamer.bot | Description                                       |
| --------------- | ------------------- | ------------------------------------------------- |
| `user`          | `%user%`            | Pseudo du viewer (variable automatique)           |
| `trainDuration` | `60`                | Durée du train en secondes (optionnel, défaut 60) |

**Exemple dans `[StreamAlerts] Sub` :**

```
Trigger  : Twitch → Channel Events → Subscribe
Sub-actions :
  1. Set Argument  →  alertType       = sub
  2. Run Action    →  [StreamAlerts] Écrire alerte    ← déjà présent
  3. Set Argument  →  user            = %user%
  4. Set Argument  →  trainDuration   = 60
  5. Execute C#    →  WriteSubTrain.cs                ← à ajouter
```

Répéter pour `[StreamAlerts] Resub` (trigger `Re-Subscribe`) et `[StreamAlerts] Gift Sub` (trigger `Gift Subscription`).

---

### Musique (WriteNowPlaying.cs)

Affiche le titre et l'artiste en cours de lecture.

**Où le placer :** créer une action dédiée `[StreamAlerts] Now Playing`.

**Triggers possibles (choisir selon ton setup) :**

| Méthode                                       | Trigger Streamer.bot                             |
| --------------------------------------------- | ------------------------------------------------ |
| Commande chat `!np Titre - Artiste`           | Twitch → Chat Message → Command `!np`            |
| Mise à jour automatique via fichier texte OBS | Core → Timer (toutes les 10 s) + lecture fichier |
| Contrôle manuel                               | Aucun trigger — gérer depuis la page de config   |

**Arguments à passer (Set Argument) :**

| Argument   | Valeur                   | Description                 |
| ---------- | ------------------------ | --------------------------- |
| `npTitle`  | `%input0%` ou texte fixe | Titre de la chanson         |
| `npArtist` | `%input1%` ou texte fixe | Artiste (optionnel)         |
| `npActive` | `true` / `false`         | `false` = masquer l'overlay |

**Exemple avec commande chat `!np` :**

```
Trigger  : Twitch → Chat Message → Command : !np  (mod uniquement)
Sub-actions :
  1. Set Argument  →  npTitle   = %input0%
  2. Set Argument  →  npArtist  = %input1%
  3. Set Argument  →  npActive  = true
  4. Execute C#    →  WriteNowPlaying.cs
```

**Pour masquer :** créer une action `[StreamAlerts] Stop Music` avec `npActive = false`.

---

### Queue (WriteQueue.cs)

Gère la file d'attente des viewers via des commandes chat.

**Où le placer :** créer **une action par commande** (ou une action centrale appelée par plusieurs).

**Actions à créer :**

| Action                       | Trigger                               | Arguments                                                                            |
| ---------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------ |
| `[StreamAlerts] Queue Join`  | Chat Command : `!join`                | `queueCommand=join` · `user=%user%`                                                  |
| `[StreamAlerts] Queue Leave` | Chat Command : `!leave`               | `queueCommand=leave` · `user=%user%`                                                 |
| `[StreamAlerts] Queue Next`  | Chat Command : `!next` _(mod)_        | `queueCommand=next` · `isModerator=%isModerator%` · `isBroadcaster=%isBroadcaster%`  |
| `[StreamAlerts] Queue Open`  | Chat Command : `!queue open` _(mod)_  | `queueCommand=open` · `isModerator=%isModerator%` · `isBroadcaster=%isBroadcaster%`  |
| `[StreamAlerts] Queue Close` | Chat Command : `!queue close` _(mod)_ | `queueCommand=close` · `isModerator=%isModerator%` · `isBroadcaster=%isBroadcaster%` |
| `[StreamAlerts] Queue Clear` | Chat Command : `!queue clear` _(mod)_ | `queueCommand=clear` · `isModerator=%isModerator%` · `isBroadcaster=%isBroadcaster%` |

> **Astuce :** `!queue open` / `!queue close` / `!queue clear` peuvent être configurés comme une seule commande `!queue` avec `%input0%` comme valeur de `queueCommand`.

**Structure type d'une action (ex: `!join`) :**

```
Trigger  : Twitch → Chat Message → Command : !join
Sub-actions :
  1. Set Argument  →  queueCommand  = join
  2. Set Argument  →  user          = %user%
  3. Execute C#    →  WriteQueue.cs
```

> Les commandes `next`, `open`, `close`, `clear` sont automatiquement rejetées si l'utilisateur n'est pas modérateur ou broadcaster.

---

### Visibilité (WriteVisibility.cs)

**Optionnel** — les commandes `!show`/`!hide`/`!toggle` sont déjà détectées directement via le WebSocket dans l'overlay. Ce script sert de **fallback** si le WebSocket est indisponible (mode polling uniquement).

**Où le placer :** créer une action `[StreamAlerts] Visibility`, déclenchée par 3 commandes chat.

**Actions à créer :**

| Action                      | Trigger                  | Arguments                                                                             |
| --------------------------- | ------------------------ | ------------------------------------------------------------------------------------- |
| `[StreamAlerts] Visibility` | Chat Command : `!show`   | `rawInput=%rawInput%` · `isModerator=%isModerator%` · `isBroadcaster=%isBroadcaster%` |
| _(même action)_             | Chat Command : `!hide`   | idem                                                                                  |
| _(même action)_             | Chat Command : `!toggle` | idem                                                                                  |

**Structure de l'action :**

```
Triggers : !show  /  !hide  /  !toggle
Sub-actions :
  1. Set Argument  →  rawInput       = %rawInput%
  2. Set Argument  →  isModerator    = %isModerator%
  3. Set Argument  →  isBroadcaster  = %isBroadcaster%
  4. Execute C#    →  WriteVisibility.cs
```

> Le script vérifie lui-même les permissions. Une commande d'un viewer lambda est ignorée silencieusement.

---

## Composants de l'overlay

| Touche test | Composant   | Fichier JSON                                  | Description                             |
| ----------- | ----------- | --------------------------------------------- | --------------------------------------- |
| **T**       | Alertes     | `alert.json`                                  | Follow, sub, raid, bits, donation…      |
| **C**       | Chat        | `chat.json`                                   | Messages Twitch temps réel              |
| **L**       | Last Events | `last_follower.json` / `last_subscriber.json` | Dernier follow et dernier sub           |
| **G**       | Goal        | `goal.json`                                   | Barre de progression vers un objectif   |
| **S**       | Sub Train   | `subtrain.json`                               | Compteur de subs avec barre de décompte |
| **N**       | Musique     | `nowplaying.json`                             | Titre et artiste en cours               |
| **U**       | Queue       | `queue.json`                                  | File d'attente des viewers              |

---

## Visibilité — commandes chat

Les modérateurs et le broadcaster peuvent afficher/masquer n'importe quel composant depuis le chat Twitch. La commande est détectée directement via le WebSocket — **aucune action Streamer.bot requise**.

### Syntaxe

```
!show   <composant>    → afficher
!hide   <composant>    → masquer
!toggle <composant>    → basculer l'état
```

### Alias acceptés

| Composant   | Mots clés acceptés                                     |
| ----------- | ------------------------------------------------------ |
| Alertes     | `alerts` `alertes` `alerte` `alert`                    |
| Chat        | `chat`                                                 |
| Last Follow | `follower` `follow` `lastfollow` `lastfollower`        |
| Last Sub    | `sub` `subscriber` `lastsub` `lastsubscriber` `abonne` |
| Goal        | `goal` `objectif`                                      |
| Sub Train   | `train` `subtrain`                                     |
| Musique     | `music` `musique` `nowplaying` `chanson`               |
| Queue       | `queue` `file`                                         |

### Exemples

```
!toggle goal         → affiche ou masque le goal tracker
!hide   alertes      → masque les alertes
!show   chat         → affiche le chat
!toggle subtrain     → bascule le sub train
```

La commande n'apparaît pas dans le chat overlay. L'état est persisté dans `data/visibility.json`.

La page de config (onglet 📐 Layout) affiche les mêmes boutons et se synchronise automatiquement.

---

## Personnalisation via config.json

Tout se configure dans `overlay/data/config.json` — ou via la page de config (sans toucher aux fichiers).

### Propriétés communes à toutes les zones

| Propriété        | Type             | Description                                            |
| ---------------- | ---------------- | ------------------------------------------------------ |
| `top` / `bottom` | `number` (px)    | Ancrage vertical                                       |
| `left` / `right` | `number` (px)    | Ancrage horizontal                                     |
| `width`          | `number` (px)    | Largeur de la zone                                     |
| `opacity`        | `number` (0-100) | Opacité globale du composant                           |
| `enabled`        | `boolean`        | `false` = désactivé définitivement (non surchargeable) |

### Référence complète

```json
{
  "alerts": {
    "bottom": 500,
    "left": 450,
    "width": 600,
    "displayDuration": 5500,
    "opacity": 100,
    "enabled": true
  },

  "chat": {
    "bottom": 60,
    "right": 53,
    "width": 360,
    "maxHeight": 1500,
    "msgLifetime": 999999999,
    "maxMessages": 27,
    "websocket": "ws://127.0.0.1:8080",
    "websocketPassword": "..."
  },

  "lastFollower": {
    "bottom": 55,
    "left": 245,
    "width": 230
  },

  "lastSubscriber": {
    "bottom": 48,
    "left": 695,
    "width": 230
  },

  "goal": {
    "top": 20,
    "left": 760,
    "width": 400
  },

  "subtrain": {
    "top": 20,
    "right": 20,
    "width": 260,
    "duration": 60
  },

  "nowplaying": {
    "bottom": 20,
    "left": 20,
    "width": 380
  },

  "queue": {
    "top": 20,
    "left": 20,
    "width": 230,
    "maxVisible": 8
  }
}
```

### Centrage horizontal

```
left = (1920 - width) / 2

Exemples :
  width 600  →  left = (1920 - 600) / 2  =  660
  width 400  →  left = (1920 - 400) / 2  =  760
```

---

## Mode test

Ouvre `http://localhost/StreamAlerts/overlay/` dans ton navigateur.

| Touche | Effet                                                                                                        |
| ------ | ------------------------------------------------------------------------------------------------------------ |
| **T**  | Alerte suivante : `follow → sub → resub → giftsub → raid → bits → donation → channelpoints → hype_train → …` |
| **C**  | Message de chat simulé (cycle de 8 messages)                                                                 |
| **L**  | Simule un last follower et un last subscriber                                                                |
| **G**  | Affiche un goal de test                                                                                      |
| **S**  | Démarre un sub train de test                                                                                 |
| **N**  | Affiche une musique de test                                                                                  |
| **U**  | Affiche une queue de test                                                                                    |

---

## Structure des fichiers

```
StreamAlerts/
├── README.md
├── CLAUDE.md
│
├── config/                        ← OBS Browser Dock
│   ├── index.html                 ← interface de configuration
│   └── api.php                    ← API PHP lecture/écriture JSON
│
├── offline/
│   └── index.html                 ← page "Stream Offline" (scène OBS dédiée)
│
├── streamerbot/                   ← scripts C# à coller dans Streamer.bot
│   ├── WriteAlert.cs              ← alertes + last follower/sub
│   ├── WriteChat.cs               ← chat (fallback polling)
│   ├── WriteGoal.cs               ← goal tracker
│   ├── WriteSubTrain.cs           ← sub train
│   ├── WriteNowPlaying.cs         ← musique en cours
│   ├── WriteQueue.cs              ← queue viewers
│   └── WriteVisibility.cs         ← show/hide composants (optionnel)
│
└── overlay/                       ← URL OBS Browser Source
    ├── index.html
    ├── style.css
    ├── script.js                  ← charge config.json + visibility.json, init composants
    ├── components/
    │   ├── alerts.js              ← alertes Twitch
    │   ├── chat.js                ← chat WebSocket + polling fallback
    │   ├── lastevents.js          ← last follower / last subscriber
    │   ├── goals.js               ← goal tracker
    │   ├── subtrain.js            ← sub train avec décompte
    │   ├── nowplaying.js          ← musique en cours
    │   └── queue.js               ← queue viewers
    ├── assets/
    │   ├── sounds/                ← fichiers .mp3 (follow.mp3, sub.mp3…)
    │   ├── fonts/                 ← polices locales
    │   └── images/
    └── data/
        ├── config.json            ← positions, tailles, durées, WebSocket   ← À ÉDITER
        ├── visibility.json        ← état affiché/masqué de chaque composant
        ├── alert.json             ← écrit par Streamer.bot
        ├── chat.json              ← écrit par Streamer.bot (fallback)
        ├── last_follower.json     ← écrit par Streamer.bot
        ├── last_subscriber.json   ← écrit par Streamer.bot
        ├── goal.json              ← écrit par Streamer.bot ou la page config
        ├── subtrain.json          ← écrit par Streamer.bot
        ├── nowplaying.json        ← écrit par Streamer.bot ou la page config
        ├── queue.json             ← écrit par Streamer.bot ou la page config
        └── examples/             ← JSONs d'exemple par type
```

---

## Dépannage

### L'overlay ne s'affiche pas

1. XAMPP Apache est-il démarré ?
2. Ouvre `http://localhost/StreamAlerts/overlay/` dans le navigateur — la page doit se charger.
3. Vérifie que la source OBS a **Arrière-plan transparent** coché et la résolution `1920 × 1080`.

### Une alerte ne s'affiche pas

1. Ouvre `http://localhost/StreamAlerts/overlay/data/alert.json` — le `timestamp` doit changer à chaque événement.
2. Vérifie dans Streamer.bot (onglet Log) que `WriteAlert.cs` compile et s'exécute sans erreur.
3. Le champ `type` doit correspondre exactement : `follow`, `sub`, `resub`, `giftsub`, `raid`, `bits`, `donation`, `channelpoints`, `hype_train`.

### Le chat ne s'affiche pas

**WebSocket (méthode principale) :**

1. Streamer.bot → `Servers/Clients → WebSocket Server` → serveur démarré ?
2. URL et mot de passe corrects dans la page de config (onglet 📐 Layout → 💬 Chat) ?
3. Console du navigateur (F12) → chercher `[Chat] Authentification échouée`.

**Fallback polling :**

1. `http://localhost/StreamAlerts/overlay/data/chat.json` — le contenu change-t-il à chaque message ?
2. L'action `[StreamAlerts] Chat` a-t-elle le déclencheur `Twitch → Chat Message` ?

### Un composant reste masqué

1. Vérifie `http://localhost/StreamAlerts/overlay/data/visibility.json` — la valeur doit être `true`.
2. Dans la page de config (onglet 📐 Layout → Visibilité), le bouton est-il vert ?
3. Si `enabled: false` est dans `config.json` pour ce composant, il est désactivé définitivement — retire la propriété ou mets `true`.

### La page de config ne sauvegarde pas

1. XAMPP Apache est-il démarré avec PHP activé ?
2. Ouvre `http://localhost/StreamAlerts/config/api.php?action=read&file=config` — doit retourner du JSON.
3. Vérifie les permissions d'écriture sur `overlay/data/`.

### Les positions ne s'appliquent pas

1. Vérifie `http://localhost/StreamAlerts/overlay/data/config.json` — JSON valide ?
2. Recharge la Browser Source OBS (clic droit → Actualiser).
3. Console du navigateur (F12) → erreurs de parsing JSON ?
