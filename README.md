# StreamAlerts

Overlay Twitch **100% local**, sans dépendance externe.
Fonctionne avec **Streamer.bot** + **XAMPP** + **OBS Studio**.

---

## Sommaire

- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration OBS](#configuration-obs)
- [Configuration Streamer.bot](#configuration-streamerbot)
  - [Activer le serveur WebSocket](#activer-le-serveur-websocket)
  - [Alertes](#alertes--action-centrale--actions-par-événement)
  - [Chat](#chat--optionnel--fallback-polling-uniquement)
- [Personnalisation via config.json](#personnalisation-via-configjson)
- [Sons](#sons)
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
  ├── Alertes  →  WriteAlert.cs  →  overlay/data/alert.json
  │                                      │  polling (500 ms)
  │                                      ▼
  │                          overlay/components/alerts.js
  │
  └── Chat  ──── WebSocket API ──────────────────────────►  overlay/components/chat.js
               (temps réel, push)         │
               + WriteChat.cs  →  chat.json  (fallback polling si WS indisponible)
                                              │
                                    overlay/index.html
                                ┌──────────────────────────┐
                                │  data/config.json        │  ← positions & tailles
                                │  components/alerts.js    │  ← actif
                                │  components/chat.js      │  ← actif
                                │  components/goals.js     │  ← futur
                                └──────────────────────────┘
                                              │
                                              ▼
                                  OBS — 1 seul Browser Source
                                  1920×1080, fond transparent
```

---

## Prérequis

| Outil                                   | Version      | Rôle                            |
| --------------------------------------- | ------------ | ------------------------------- |
| [XAMPP](https://www.apachefriends.org/) | 8.x          | Serveur HTTP local              |
| [OBS Studio](https://obsproject.com/)   | 27+          | Browser Source                  |
| [Streamer.bot](https://streamer.bot/)   | 0.2+         | Réception des événements Twitch |
| Navigateur moderne                      | Chromium 90+ | Tests                           |

---

## Installation

1. Copie ce dépôt dans `C:\xampp\htdocs\StreamAlerts\`
   _(ou le chemin correspondant à ton installation XAMPP)_

2. Démarre **Apache** dans le panneau XAMPP.

3. Ouvre `http://localhost/StreamAlerts/overlay/index.html` dans ton navigateur.
   Tu dois voir l'indicateur de test en bas de la page.

4. Appuie sur **T** puis **C** pour vérifier que les alertes et le chat fonctionnent.

---

## Configuration OBS

Ajoute une **Source Navigateur** (Browser Source) avec ces paramètres :

| Paramètre                                | Valeur                                             |
| ---------------------------------------- | -------------------------------------------------- |
| URL                                      | `http://localhost/StreamAlerts/overlay/index.html` |
| Largeur                                  | `1920`                                             |
| Hauteur                                  | `1080`                                             |
| Arrière-plan transparent                 | ✅ coché                                           |
| Actualiser quand la scène devient active | ❌ décoché                                         |

> **Important :** laisser "Actualiser quand la scène devient active" coché provoque un rechargement de la page à chaque changement de scène, ce qui efface l'historique du chat.

Place cette source **au-dessus** de toutes les autres dans ta scène.

---

## Configuration Streamer.bot

### Activer le serveur WebSocket

Le chat utilise l'API WebSocket native de Streamer.bot pour recevoir les messages en temps réel.

1. Dans Streamer.bot : `Servers/Clients` → `WebSocket Server`
2. Coche **Enabled** et clique **Start**
3. Note le port (par défaut : `8080`) et le mot de passe éventuel

Mets à jour `overlay/data/config.json` avec ces valeurs :

```json
"chat": {
  "websocket": "ws://127.0.0.1:8080",
  "websocketPassword": "ton_mot_de_passe"
}
```

Laisse `websocketPassword` vide (`""`) si aucun mot de passe n'est configuré.

---

### Alertes — action centrale + actions par événement

Le script `streamerbot/WriteAlert.cs` est partagé entre tous les événements d'alerte.
Chaque événement appelle l'action centrale avec un seul argument.

#### Action centrale (à créer une seule fois)

1. **Clic droit** dans la liste des actions → **Add Action**
2. Nom : `[StreamAlerts] Écrire alerte`
3. **Clic droit** dans les sous-actions → **Add Sub-Action** → **Core → C# → Execute C# Code**
4. Colle le contenu de `streamerbot/WriteAlert.cs`
5. Clique **Compile** → vérifie `Compile Successful` → **Save & Close**

#### Une action par événement (exemple : Follow)

1. **Add Action** → Nom : `[StreamAlerts] Follow`
2. **Clic droit Triggers** → **Add Trigger** → `Twitch → Channel Events → Follow`
3. **Add Sub-Action** → **Core → Actions → Run Action**
   - Action : `[StreamAlerts] Écrire alerte`
   - Run Immediately : ✅
   - Dans l'onglet **Arguments** → **+** → `alertType` = `follow`

#### Tableau des événements

| Action                          | Déclencheur                                            | `alertType`     |
| ------------------------------- | ------------------------------------------------------ | --------------- |
| `[StreamAlerts] Follow`         | Twitch → Channel Events → **Follow**                   | `follow`        |
| `[StreamAlerts] Sub`            | Twitch → Channel Events → **Subscribe**                | `sub`           |
| `[StreamAlerts] Resub`          | Twitch → Channel Events → **Re-Subscribe**             | `resub`         |
| `[StreamAlerts] Gift Sub`       | Twitch → Channel Events → **Gift Subscription**        | `giftsub`       |
| `[StreamAlerts] Raid`           | Twitch → Channel Events → **Raid**                     | `raid`          |
| `[StreamAlerts] Bits`           | Twitch → Channel Events → **Cheer**                    | `bits`          |
| `[StreamAlerts] Donation`       | StreamElements → **Tip** _(ou Streamlabs → Donation)_  | `donation`      |
| `[StreamAlerts] Channel Points` | Twitch → Channel Events → **Channel Point Redemption** | `channelpoints` |
| `[StreamAlerts] Hype Train`     | Twitch → Channel Events → **Hype Train Start**         | `hype_train`    |

---

### Chat — optionnel (fallback polling uniquement)

Grâce au WebSocket, **aucune action C# n'est requise pour le chat**. L'overlay souscrit directement aux événements `Twitch.ChatMessage` de Streamer.bot.

L'action `WriteChat.cs` reste utile uniquement comme **fallback** : si le WebSocket est indisponible, l'overlay bascule automatiquement sur le polling du fichier `chat.json`.

Pour créer le fallback :

1. **Add Action** → Nom : `[StreamAlerts] Chat`
2. **Clic droit Triggers** → **Add Trigger** → `Twitch → Chat Message`
3. **Add Sub-Action** → **Core → C# → Execute C# Code**
4. Colle le contenu de `streamerbot/WriteChat.cs`
5. **Compile** → **Save & Close**

> Le script filtre les messages vides et les messages système.

---

## Personnalisation via config.json

**Tout se configure dans un seul fichier :**

```
overlay/data/config.json
```

Pas besoin de modifier le CSS ou le JS. Modifie le fichier, recharge l'overlay dans OBS.

### Positions et tailles

Toutes les valeurs sont en **pixels**, dans un canvas 1920 × 1080.

```
  (0,0) ──────────────────── (1920,0)
    │                              │
    │    left=X  →  X px du bord gauche
    │    right=X →  X px du bord droit
    │    top=Y   →  Y px du haut
    │    bottom=Y→  Y px du bas
    │                              │
  (0,1080) ────────────────(1920,1080)
```

### Référence complète

```json
{
  "alerts": {
    "bottom": 64,          // distance depuis le bas (px)
    "left": 700,           // distance depuis la gauche (px)
    "width": 520,          // largeur de la zone (px)
    "displayDuration": 5500 // durée d'affichage d'une alerte (ms)
  },

  "chat": {
    "bottom": 80,          // distance depuis le bas (px)
    "right": 24,           // distance depuis la droite (px)
    "width": 380,          // largeur de la zone (px)
    "maxHeight": 660,      // hauteur maximale de la zone (px)
    "msgLifetime": 30000,  // durée avant disparition d'un message (ms)
    "maxMessages": 14,     // nombre maximum de messages visibles
    "websocket": "ws://127.0.0.1:8080",  // URL du serveur WebSocket Streamer.bot
    "websocketPassword": ""              // mot de passe (laisser vide si aucun)
  }
}
```

Propriétés de position : `top` · `bottom` · `left` · `right`
Propriétés de taille : `width` · `height` · `maxHeight`

**Valeurs acceptées :**

| Type            | Exemple  | Résultat CSS           |
| --------------- | -------- | ---------------------- |
| Nombre entier   | `64`     | `64px`                 |
| Chaîne CSS      | `"auto"` | `auto`                 |
| Pourcentage     | `"50%"`  | `50%`                  |
| Absent / `null` | —        | propriété non modifiée |

### Calculer le centrage horizontal

Pour centrer horizontalement une zone de largeur `W` sur un canvas de 1920 px :

```
left = (1920 - W) / 2

Exemples :
  width 520  →  left = (1920 - 520) / 2  =  700
  width 380  →  left = (1920 - 380) / 2  =  770
  width 400  →  left = (1920 - 400) / 2  =  760
```

---

## Format des fichiers de données

### alert.json

Écrit par `WriteAlert.cs` à chaque événement d'alerte.

```json
{
  "type": "follow",
  "user": "PseudoTwitch",
  "message": "",
  "avatar": "https://…",
  "sound": "follow.mp3",
  "amount": 0,
  "months": 0,
  "tier": "",
  "timestamp": 1711900000
}
```

| Champ       | Description                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------------------- |
| `type`      | Type d'alerte : `follow` `sub` `resub` `giftsub` `raid` `bits` `donation` `channelpoints` `hype_train` |
| `user`      | Pseudo affiché en grand                                                                                 |
| `message`   | Message personnalisé — si vide, un texte par défaut est généré                                          |
| `avatar`    | URL de l'avatar (optionnel)                                                                             |
| `sound`     | Nom du fichier `.mp3` dans `assets/sounds/` (optionnel)                                                 |
| `amount`    | Bits / euros / viewers / nombre de gift subs                                                            |
| `months`    | Mois d'abonnement cumulés (resub uniquement)                                                            |
| `tier`      | `Tier 1` / `Tier 2` / `Tier 3`                                                                          |
| `timestamp` | Timestamp Unix en secondes — **doit changer à chaque alerte**                                           |

### chat.json

Écrit par `WriteChat.cs` — utilisé uniquement comme fallback si le WebSocket est indisponible.

```json
{
  "user": "PseudoTwitch",
  "color": "#FF6B6B",
  "message": "Bonjour le chat !",
  "isSub": false,
  "isMod": false,
  "isVip": false,
  "isBroadcaster": false,
  "timestamp": 1711901000597
}
```

---

## Sons

Place tes fichiers `.mp3` dans `overlay/assets/sounds/`.

Noms attendus par défaut :

```
follow.mp3 · sub.mp3 · resub.mp3 · giftsub.mp3 · raid.mp3
bits.mp3 · donation.mp3 · channelpoints.mp3 · hype_train.mp3
```

Si un fichier est introuvable, l'alerte s'affiche quand même sans son.
Volume par défaut : `0.8` — modifiable dans `overlay/components/alerts.js`.

---

## Mode test

Ouvre `http://localhost/StreamAlerts/overlay/index.html` dans ton navigateur.

| Touche | Effet                                                                                                                                  |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| **T**  | Déclenche l'alerte suivante dans le cycle : `follow → sub → resub → giftsub → raid → bits → donation → channelpoints → hype_train → …` |
| **C**  | Ajoute un message de chat simulé (cycle de 8 messages différents)                                                                      |

Les alertes se mettent en file d'attente — appuie plusieurs fois rapidement pour les voir s'enchaîner.

---

## Structure des fichiers

```
StreamAlerts/
├── README.md
├── streamerbot/
│   ├── WriteAlert.cs          ← script C# pour les alertes
│   └── WriteChat.cs           ← script C# pour le chat (fallback polling)
└── overlay/                   ← UN SEUL Browser Source OBS
    ├── index.html             ← URL OBS
    ├── style.css              ← styles (zones + composants)
    ├── script.js              ← charge config.json, init les composants
    ├── components/
    │   ├── alerts.js          ← alertes Twitch        (actif)
    │   ├── chat.js            ← chat overlay          (actif, WebSocket + fallback)
    │   ├── goals.js           ← objectif / goal bar   (futur)
    │   ├── nowplaying.js      ← musique en cours      (futur)
    │   └── counter.js         ← compteur d'events     (futur)
    ├── assets/
    │   ├── sounds/            ← fichiers .mp3
    │   ├── images/
    │   ├── videos/
    │   └── fonts/
    └── data/
        ├── config.json        ← positions, tailles, durées, WebSocket  ← À ÉDITER
        ├── alert.json         ← écrit par Streamer.bot
        ├── chat.json          ← écrit par Streamer.bot (fallback)
        ├── goal.json          ← futur
        ├── nowplaying.json    ← futur
        └── examples/          ← JSONs d'exemple par type
```

---

## Dépannage

### L'alerte ne s'affiche pas

1. XAMPP Apache est-il démarré ?
2. Ouvre `http://localhost/StreamAlerts/overlay/data/alert.json` — le contenu doit avoir changé après l'événement.
3. Le `timestamp` change-t-il à chaque événement ? Vérifie dans Streamer.bot que le script se compile et s'exécute (onglet Log).
4. La valeur `type` correspond-elle exactement à l'un des types supportés ?

### Le chat ne s'affiche pas

**Vérification WebSocket (méthode principale) :**

1. Dans Streamer.bot, `Servers/Clients → WebSocket Server` → le serveur est-il démarré ?
2. L'URL et le mot de passe dans `config.json` correspondent-ils aux paramètres du serveur ?
3. Ouvre la console du navigateur (F12) — une ligne `[Chat] Authentification Streamer.bot échouée` indique un mauvais mot de passe.

**Vérification fallback polling :**

1. Ouvre `http://localhost/StreamAlerts/overlay/data/chat.json` — le contenu doit changer à chaque message.
2. Vérifie que l'action `[StreamAlerts] Chat` a bien le déclencheur `Twitch → Chat Message`.
3. Vérifie que `WriteChat.cs` compile sans erreur.

### Le chat "flashe" ou se recharge à chaque message

Vérifie que l'option **"Actualiser quand la scène devient active"** est bien **décochée** dans les propriétés de la Browser Source OBS. Vérifie aussi qu'aucune sous-action Streamer.bot ne rafraîchit la source.

### Les messages Channel Points apparaissent dans le chat

Dans Streamer.bot, le déclencheur `Chat Message` se déclenche aussi pour les échanges de Channel Points.
Pour les exclure, ajoute une condition dans l'action Chat :
**Add Condition** → `isRedemption` → `equals` → `false`.

### Pas de son

- Vérifie que le fichier `.mp3` existe dans `overlay/assets/sounds/`.
- Le nom est sensible à la casse.
- OBS peut bloquer l'autoplay audio — active **"Contrôler l'audio via OBS"** dans les paramètres de la source si disponible.

### L'overlay est invisible dans OBS

- **Arrière-plan transparent** doit être coché.
- La source doit être au-dessus des autres calques.
- La résolution doit être `1920 × 1080`.

### Les positions dans config.json ne s'appliquent pas

- Vérifie que XAMPP sert bien le fichier : `http://localhost/StreamAlerts/overlay/data/config.json`
- Recharge la Browser Source dans OBS (clic droit → Actualiser).
- Vérifie la console du navigateur (F12) pour des erreurs de parsing JSON.
