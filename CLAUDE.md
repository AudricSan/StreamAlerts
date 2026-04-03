# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Contexte

StreamAlerts est un overlay Twitch local (sans serveur backend) servi par XAMPP. Il s'affiche dans OBS Studio via une Browser Source pointant vers `http://localhost/StreamAlerts/overlay/`.

Flux de données :
```
Twitch → Streamer.bot → JSON files → Overlay (polling/WebSocket) → OBS
```

## Démarrage

- **Serveur** : XAMPP doit tourner avec Apache actif.
- **URL de l'overlay** : `http://localhost/StreamAlerts/overlay/`
- **Aucun build requis** — HTML/CSS/JS vanilla, pas de bundler.
- **Tests manuels** : ouvrir l'overlay dans le navigateur, appuyer sur `T` (alerte test) ou `C` (message chat test).

## Architecture

### Overlay (`overlay/`)

| Fichier | Rôle |
|---------|------|
| `index.html` | Point d'entrée, définit les 5 zones (`#zone-alerts`, `#zone-chat`, `#zone-goal`, `#zone-nowplaying`, `#zone-counter`) |
| `script.js` | Charge `config.json`, applique le positionnement CSS sur chaque zone, initialise les composants |
| `style.css` | Tous les styles du canvas 1920×1080 |
| `components/alerts.js` | Composant alertes — expose `window.Alerts` |
| `components/chat.js` | Composant chat — expose `window.Chat` |
| `components/goals.js` etc. | Composants futurs (non implémentés) |

### Pattern des composants

Chaque composant est une IIFE qui expose un objet global (`window.Alerts`, `window.Chat`). Ils reçoivent `config` (section correspondante de `config.json`) via `init(config)` appelé dans `script.js`.

### Données (`overlay/data/`)

- `config.json` — configuration des zones (positions, tailles, durées, WebSocket)
- `alert.json` — alerte courante écrite par Streamer.bot (pollee toutes les 500 ms)
- `chat.json` — message chat fallback (pollé toutes les 300 ms si WebSocket KO)
- Les exemples sont dans `data/examples/`

### Intégration Streamer.bot (`streamerbot/`)

Scripts C# exécutés par Streamer.bot :
- `WriteAlert.cs` — écrit `alert.json` sur chaque événement Twitch (follow, sub, raid, bits…)
- `WriteChat.cs` — écrit `chat.json` (fallback polling uniquement ; le WebSocket est la méthode principale)

### Chemins absolus

Les scripts C# écrivent vers `D:\audri\Xamp\htdocs\StreamAlerts\overlay\data\`. Si le projet est déplacé, ces chemins doivent être mis à jour dans `WriteAlert.cs` et `WriteChat.cs`.

## Configuration (`config.json`)

Toutes les positions sont en pixels sur un canvas 1920×1080. Les propriétés de positionnement (`top`, `bottom`, `left`, `right`) acceptent : un nombre (→ `px`), une chaîne (`"auto"`, `"50%"`), ou être omises. Formule de centrage : `left = (1920 - width) / 2`.

Exemple minimal pour le WebSocket chat :
```json
"chat": {
  "websocket": "ws://127.0.0.1:8080",
  "websocketPassword": "..."
}
```

## Composant Alerts (`alerts.js`)

- Polling `alert.json` via `timestamp` pour détecter les nouvelles alertes
- File d'attente : une alerte à la fois, durée `displayDuration` (défaut 5500 ms)
- Protection XSS : toujours utiliser la fonction locale `esc()` pour tout contenu utilisateur injecté en HTML
- Types supportés : `follow`, `sub`, `resub`, `giftsub`, `raid`, `bits`, `donation`, `channelpoints`, `hype_train`

## Composant Chat (`chat.js`)

- **Mode primaire** : WebSocket Streamer.bot (port 8080) avec auth SHA-256
- **Fallback** : polling `chat.json` si WebSocket indisponible
- Persistance via `localStorage` (les messages survivent aux changements de scène OBS)
- Protection XSS : utiliser `esc()` pour tout contenu injecté en HTML

## Compatibilité navigateur

Le projet cible le moteur Chromium intégré à OBS (≥ v90). Ne pas utiliser d'APIs incompatibles avec cette version.
