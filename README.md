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
- [Mode debug](#mode-debug)
- [Structure des fichiers](#structure-des-fichiers)
- [Dépannage](#dépannage)

---

## Architecture

```
Twitch
  │  événements (follow, sub, raid, chat…)
  ▼
Streamer.bot
  ├── Alertes         → WriteAlert.cs        → overlay/data/alert.json
  ├── Last Follow     → WriteAlert.cs        → overlay/data/last_follower.json
  ├── Last Sub        → WriteAlert.cs        → overlay/data/last_subscriber.json
  ├── Goal            → WriteGoal.cs         → overlay/data/goal.json
  ├── Sub Train       → WriteSubTrain.cs     → overlay/data/subtrain.json
  ├── Musique         → WriteNowPlaying.cs   → overlay/data/nowplaying.json
  ├── Queue           → WriteQueue.cs        → overlay/data/queue.json
  ├── Spectateurs     → WriteViewers.cs      → overlay/data/viewers.json
  ├── Uptime          → WriteUptime.cs       → overlay/data/uptime.json
  ├── Stats session   → WriteSession.cs      → overlay/data/session.json
  ├── Countdown       → WriteCountdown.cs    → overlay/data/countdown.json
  ├── Leaderboard     → WriteLeaderboard.cs  → overlay/data/leaderboard.json
  ├── Sondage         → WritePoll.cs         → overlay/data/poll.json
  ├── Prédiction      → WritePrediction.cs   → overlay/data/prediction.json
  ├── Hype Train      → WriteHypeTrain.cs    → overlay/data/hypetrain.json
  ├── Visibilité      → WriteVisibility.cs   → overlay/data/visibility.json
  │
  └── Chat ──── WebSocket API (temps réel, push) ──────► overlay/components/chat.js
              + WriteChat.cs → chat.json (fallback polling si WS indisponible)

                              overlay/index.html  ←  OBS Browser Source unique
                          ┌──────────────────────────────────────────┐
                          │  core/     logger, bus, config, store     │
                          │  services/ polling, websocket, visibility │
                          │  utils/    esc(), formatters, colors       │
                          │  components/ 16 widgets indépendants      │
                          │  data/     JSON écrits par Streamer.bot   │
                          └──────────────────────────────────────────┘
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

3. Ouvre `http://localhost/StreamAlerts/` dans ton navigateur.
   Tu arrives sur le tableau de bord principal.

4. Clique sur **Overlay OBS** puis appuie sur **T** pour tester une alerte.

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
| ⚙️ **Config** | Durée des alertes, durée du sub train, paramètres WebSocket                                    |

---

## Configuration Streamer.bot

### Vue d'ensemble des triggers

| Script | Type de trigger | Commande / Événement |
| --- | --- | --- |
| `WriteAlert.cs` | ⚡ Événement Twitch | Subscribe, Follow, Raid, Bits… |
| `WriteGoal.cs` | ⚡ Événement Twitch | Mêmes actions que WriteAlert |
| `WriteSubTrain.cs` | ⚡ Événement Twitch | Subscribe, Re-Subscribe, Gift Subscription |
| `WriteViewers.cs` | ⏱ Timer (30s) | Lit le nombre de spectateurs |
| `WriteUptime.cs` | ⚡ Événement Twitch | Stream Online / Stream Offline |
| `WriteSession.cs` | ⚡ Événement Twitch | Même triggers que WriteAlert |
| `WriteLeaderboard.cs` | ⚡ Événement Twitch | Cheer, Donation |
| `WritePoll.cs` | ⚡ Événement Twitch | Poll Created / Updated / Completed |
| `WritePrediction.cs` | ⚡ Événement Twitch | Prediction Created / Updated / Resolved |
| `WriteHypeTrain.cs` | ⚡ Événement Twitch | Hype Train Start / Update / End |
| `WriteChat.cs` | 💬 Chat Message | Tous les messages (fallback WS) |
| `WriteNowPlaying.cs` | 💬 Chat Command | `!np` (mod) |
| `WriteQueue.cs` | 💬 Chat Command | `!join` `!leave` `!next` `!queue` |
| `WriteCountdown.cs` | 💬 Chat Command | `!countdown <min> [label]` / `!countdown stop` |
| `WriteVisibility.cs` | 💬 Chat Command | `!show` `!hide` `!toggle` _(optionnel)_ |

> Les scripts ⚡ doivent être sur des triggers d'événements Twitch — les placer sur un trigger Chat ne les déclenchera pas automatiquement lors des vrais événements.

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

**Où le placer :** ajouter en sous-action dans les actions qui ont déjà un trigger d'événement Twitch.

**Arguments disponibles (Set Argument) :**

| Argument        | Valeur                                              | Description                                       |
| --------------- | --------------------------------------------------- | ------------------------------------------------- |
| `goalIncrement` | `1` (ou autre)                                      | Nombre à ajouter à chaque déclenchement           |
| `goalTarget`    | `100`                                               | Objectif total (conservé si déjà dans le fichier) |
| `goalLabel`     | `"Objectif subs"`                                   | Texte affiché (conservé si déjà dans le fichier)  |
| `goalType`      | `sub` / `follow` / `bits` / `donation` / `custom`   | Couleur de la barre                               |
| `goalReset`     | `true`                                              | Remet le compteur à 0                             |

### Sub Train (WriteSubTrain.cs)

**Où le placer :** ajouter en sous-action dans les actions `Sub`, `Resub` et `Gift Sub`.

**Arguments :**

| Argument        | Valeur      | Description                          |
| --------------- | ----------- | ------------------------------------ |
| `user`          | `%user%`    | Pseudo du viewer                     |
| `trainDuration` | `60`        | Durée en secondes (défaut : 60)      |

### Musique (WriteNowPlaying.cs)

**Arguments :**

| Argument   | Valeur                   | Description                 |
| ---------- | ------------------------ | --------------------------- |
| `npTitle`  | `%input0%` ou texte fixe | Titre de la chanson         |
| `npArtist` | `%input1%` ou texte fixe | Artiste (optionnel)         |
| `npActive` | `true` / `false`         | `false` = masquer l'overlay |

### Queue (WriteQueue.cs)

| Action                       | Trigger                               | `queueCommand` |
| ---------------------------- | ------------------------------------- | -------------- |
| `[StreamAlerts] Queue Join`  | Chat Command : `!join`                | `join`         |
| `[StreamAlerts] Queue Leave` | Chat Command : `!leave`               | `leave`        |
| `[StreamAlerts] Queue Next`  | Chat Command : `!next` _(mod)_        | `next`         |
| `[StreamAlerts] Queue Open`  | Chat Command : `!queue open` _(mod)_  | `open`         |
| `[StreamAlerts] Queue Close` | Chat Command : `!queue close` _(mod)_ | `close`        |
| `[StreamAlerts] Queue Clear` | Chat Command : `!queue clear` _(mod)_ | `clear`        |

### Visibilité (WriteVisibility.cs)

**Optionnel** — les commandes `!show`/`!hide`/`!toggle` sont déjà détectées directement via le WebSocket. Ce script sert de fallback si le WebSocket est indisponible.

---

## Composants de l'overlay

| Touche test | Composant       | Fichier JSON               | Description                             |
| ----------- | --------------- | -------------------------- | --------------------------------------- |
| **T**       | Alertes         | `alert.json`               | Follow, sub, raid, bits, donation…      |
| **C**       | Chat            | `chat.json`                | Messages Twitch temps réel              |
| **L**       | Dernier follow  | `last_follower.json`       | Dernier viewer à avoir follow           |
| **L**       | Dernier sub     | `last_subscriber.json`     | Dernier viewer à s'être abonné          |
| **G**       | Objectif        | `goal.json`                | Barre de progression vers un objectif   |
| **S**       | Sub Train       | `subtrain.json`            | Compteur de subs avec barre de décompte |
| **N**       | Musique         | `nowplaying.json`          | Titre et artiste en cours               |
| **U**       | File d'attente  | `queue.json`               | File d'attente des viewers              |
| **V**       | Spectateurs     | `viewers.json`             | Nombre de viewers en direct             |
| **I**       | Uptime          | `uptime.json`              | Durée du stream depuis le début         |
| **E**       | Stats session   | `session.json`             | Follows, subs, bits, raids, dons        |
| **D**       | Compte à rebours| `countdown.json`           | Timer vers une heure cible              |
| **B**       | Classement      | `leaderboard.json`         | Top donateurs / bits du stream          |
| **O**       | Sondage         | `poll.json`                | Sondage Twitch actif en temps réel      |
| **P**       | Prédiction      | `prediction.json`          | Paris Twitch (bleu vs rose)             |
| **H**       | Hype Train      | `hypetrain.json`           | Barre de progression du Hype Train      |

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

| Composant       | Mots clés acceptés                                     |
| --------------- | ------------------------------------------------------ |
| Alertes         | `alerts` `alertes` `alerte` `alert`                    |
| Chat            | `chat`                                                 |
| Dernier follow  | `follower` `follow` `lastfollow` `lastfollower`        |
| Dernier sub     | `sub` `subscriber` `lastsub` `lastsubscriber` `abonne` |
| Objectif        | `goal` `objectif`                                      |
| Sub Train       | `train` `subtrain`                                     |
| Musique         | `music` `musique` `nowplaying` `chanson`               |
| File d'attente  | `queue` `file`                                         |
| Spectateurs     | `viewers` `spectateurs`                                |
| Uptime          | `uptime` `duree` `direct`                              |
| Stats session   | `session` `stats`                                      |
| Compte à rebours| `countdown` `compte` `timer`                           |
| Classement      | `leaderboard` `top` `classement`                       |
| Sondage         | `poll` `vote` `sondage`                                |
| Prédiction      | `prediction` `pari`                                    |
| Hype Train      | `hypetrain` `hype`                                     |

### Exemples

```
!toggle goal         → affiche ou masque le goal tracker
!hide   alertes      → masque les alertes
!show   chat         → affiche le chat
!toggle subtrain     → bascule le sub train
!hide   hype         → masque le hype train
```

La commande n'apparaît pas dans le chat overlay. L'état est persisté dans `data/visibility.json`.

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
| `pollInterval`   | `number` (ms)    | Fréquence de lecture du JSON (avancé)                  |

### Référence complète

```json
{
  "alerts": {
    "bottom": 293, "left": 633, "width": 600,
    "displayDuration": 5500,
    "opacity": 100, "enabled": true
  },
  "chat": {
    "bottom": 66, "right": 123, "width": 360, "maxHeight": 1500,
    "msgLifetime": 999999999,
    "maxMessages": 27,
    "websocket": "ws://127.0.0.1:8080",
    "websocketPassword": "...",
    "enabled": true
  },
  "lastFollower":   { "bottom": 325, "left": 770, "width": 230, "enabled": true },
  "lastSubscriber": { "bottom": 342, "left": 837, "width": 230, "enabled": true },
  "goal":      { "top": 395, "left": 680, "width": 400, "enabled": true },
  "subtrain":  { "top": 411, "right": 877, "width": 260, "duration": 60, "enabled": true },
  "nowplaying":{ "bottom": 380, "left": 642, "width": 380, "enabled": true },
  "queue":     { "top": 369, "left": 753, "width": 230, "maxVisible": 8, "enabled": true },
  "viewers":   { "top": 331, "right": 913, "width": 160, "enabled": true },
  "uptime":    { "top": 396, "right": 938, "width": 160, "enabled": true },
  "session":   { "top": 464, "left": 656, "width": 230, "enabled": true },
  "countdown": { "top": 450, "left": 660, "width": 300, "enabled": true },
  "leaderboard":{ "top": 422, "left": 695, "width": 230, "enabled": true },
  "poll":      { "top": 283, "left": 904, "width": 380, "enabled": true },
  "prediction":{ "top": 415, "right": 650, "width": 320, "enabled": true },
  "hypetrain": { "top": 520, "right": 704, "width": 300, "enabled": true }
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

| Touche | Effet                                                                                                         |
| ------ | ------------------------------------------------------------------------------------------------------------- |
| **T**  | Alerte suivante : `follow → sub → resub → giftsub → raid → bits → donation → channelpoints → hype_train → …` |
| **C**  | Message de chat simulé (cycle de 8 messages)                                                                  |
| **L**  | Simule un last follower + un last subscriber                                                                  |
| **G**  | Affiche un goal de test (47/100 subs)                                                                         |
| **S**  | Démarre un sub train de test (×7)                                                                             |
| **N**  | Affiche une musique de test                                                                                    |
| **U**  | Affiche une file d'attente de test (4 joueurs)                                                                |
| **V**  | Affiche 142 spectateurs                                                                                       |
| **I**  | Affiche l'uptime (2h34m simulées)                                                                             |
| **E**  | Affiche les stats de session (12 follows, 5 subs…)                                                            |
| **D**  | Démarre un compte à rebours de 5 minutes                                                                      |
| **B**  | Affiche un classement de test (5 entrées)                                                                     |
| **O**  | Affiche un sondage de test (60 secondes)                                                                      |
| **P**  | Affiche une prédiction de test (90 secondes)                                                                  |
| **H**  | Affiche un Hype Train niveau 2 (3 minutes)                                                                    |

---

## Mode debug

Ajoute `?debug=1` à l'URL de l'overlay pour activer le panneau de diagnostic :

```
http://localhost/StreamAlerts/overlay/?debug=1
```

Le panneau affiche en temps réel :
- **État du WebSocket** Streamer.bot (connecté / déconnecté)
- **Liste des polls actifs** avec leur fréquence
- **Logs détaillés** de tous les composants

Utile pour diagnostiquer une alerte qui ne s'affiche pas ou un problème de connexion WebSocket.

---

## Structure des fichiers

```
StreamAlerts/
├── README.md
├── CLAUDE.md
├── index.html                     ← tableau de bord principal
│
├── config/                        ← OBS Browser Dock
│   ├── index.html                 ← interface de configuration
│   └── api.php                    ← API PHP lecture/écriture JSON
│
├── streamerbot/                   ← scripts C# à coller dans Streamer.bot
│   ├── WriteAlert.cs              ← alertes + last follower/sub
│   ├── WriteChat.cs               ← chat (fallback polling)
│   ├── WriteGoal.cs               ← goal tracker
│   ├── WriteSubTrain.cs           ← sub train
│   ├── WriteNowPlaying.cs         ← musique en cours
│   ├── WriteQueue.cs              ← queue viewers
│   ├── WriteViewers.cs            ← nombre de spectateurs
│   ├── WriteUptime.cs             ← durée du stream
│   ├── WriteSession.cs            ← stats de session
│   ├── WriteCountdown.cs          ← compte à rebours
│   ├── WriteLeaderboard.cs        ← classement donateurs
│   ├── WritePoll.cs               ← sondages Twitch
│   ├── WritePrediction.cs         ← prédictions Twitch
│   ├── WriteHypeTrain.cs          ← hype train
│   └── WriteVisibility.cs         ← show/hide composants (optionnel)
│
└── overlay/                       ← URL OBS Browser Source
    ├── index.html                 ← point d'entrée
    ├── style.css                  ← tous les styles
    ├── script.js                  ← bootstrap (charge config + init composants)
    │
    ├── core/                      ← fondations (chargées en premier)
    │   ├── logger.js              ← logs centralisés
    │   ├── event-bus.js           ← communication entre composants
    │   ├── config-manager.js      ← chargement config.json + defaults
    │   ├── state-store.js         ← état partagé
    │   └── base-component.js      ← classe parente de tous les widgets
    │
    ├── services/                  ← services partagés
    │   ├── polling-manager.js     ← gestionnaire centralisé des polls JSON
    │   ├── websocket-manager.js   ← connexion WebSocket Streamer.bot
    │   └── visibility-manager.js  ← show/hide des zones
    │
    ├── utils/                     ← fonctions utilitaires
    │   ├── dom.js                 ← esc() (protection XSS)
    │   ├── time.js                ← formatCountdown(), formatUptime()
    │   └── color.js               ← gestion couleurs chat
    │
    ├── dev/                       ← outils de développement
    │   ├── keyboard-tester.js     ← raccourcis clavier centralisés
    │   └── debug-panel.js         ← panneau debug (?debug=1)
    │
    ├── components/                ← un fichier = un widget
    │   ├── alerts.js
    │   ├── chat.js
    │   ├── last-follower.js
    │   ├── last-subscriber.js
    │   ├── goals.js
    │   ├── subtrain.js
    │   ├── nowplaying.js
    │   ├── queue.js
    │   ├── viewers.js
    │   ├── uptime.js
    │   ├── session.js
    │   ├── countdown.js
    │   ├── leaderboard.js
    │   ├── poll.js
    │   ├── prediction.js
    │   └── hypetrain.js
    │
    ├── assets/
    │   ├── sounds/                ← fichiers .mp3 (follow.mp3, sub.mp3…)
    │   └── fonts/                 ← polices locales
    │
    └── data/                      ← JSON écrits par Streamer.bot  ← NE PAS ÉDITER
        ├── config.json            ← positions, tailles, durées  ← PEUT ÊTRE ÉDITÉ
        ├── visibility.json        ← état affiché/masqué de chaque composant
        ├── alert.json
        ├── chat.json
        ├── last_follower.json
        ├── last_subscriber.json
        ├── goal.json
        ├── subtrain.json
        ├── nowplaying.json
        ├── queue.json
        ├── viewers.json
        ├── uptime.json
        ├── session.json
        ├── countdown.json
        ├── leaderboard.json
        ├── poll.json
        ├── prediction.json
        └── hypetrain.json
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
2. URL et mot de passe corrects dans la page de config ?
3. Ouvre l'overlay avec `?debug=1` → le panneau doit afficher "WS connecté".

**Fallback polling :**

1. `http://localhost/StreamAlerts/overlay/data/chat.json` — le contenu change-t-il à chaque message ?
2. L'action `[StreamAlerts] Chat` a-t-elle le déclencheur `Twitch → Chat Message` ?

### Un composant reste masqué

1. Vérifie `http://localhost/StreamAlerts/overlay/data/visibility.json` — la valeur doit être `true`.
2. Dans la page de config (onglet 📐 Layout → Visibilité), le bouton est-il vert ?
3. Si `"enabled": false` est dans `config.json` pour ce composant, il est désactivé définitivement — mets `true`.

### La page de config ne sauvegarde pas

1. XAMPP Apache est-il démarré avec PHP activé ?
2. Ouvre `http://localhost/StreamAlerts/config/api.php?action=read&file=config` — doit retourner du JSON.
3. Vérifie les permissions d'écriture sur `overlay/data/`.

### Je veux diagnostiquer un problème précis

Ouvre l'overlay avec `?debug=1` dans l'URL :
```
http://localhost/StreamAlerts/overlay/?debug=1
```
Le panneau en bas de l'écran affiche tous les logs en temps réel.

### Les positions ne s'appliquent pas

1. Vérifie `http://localhost/StreamAlerts/overlay/data/config.json` — JSON valide ?
2. Recharge la Browser Source OBS (clic droit → Actualiser).
3. Ouvre l'overlay avec `?debug=1` → chercher une erreur de parsing dans les logs.
