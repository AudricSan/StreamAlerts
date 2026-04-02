# StreamAlerts

Overlay d'alertes Twitch **100% local**, sans dépendance externe.
Fonctionne avec **Streamer.bot** + **XAMPP** + **OBS Studio**.

---

## Sommaire

- [StreamAlerts](#streamalerts)
  - [Sommaire](#sommaire)
  - [Architecture](#architecture)
  - [Prérequis](#prérequis)
  - [Installation](#installation)
  - [Configuration OBS](#configuration-obs)
  - [Configuration Streamer.bot](#configuration-streamerbot)
    - [Vue d'ensemble de la structure finale](#vue-densemble-de-la-structure-finale)
    - [Partie 1 — Créer l'action centrale](#partie-1--créer-laction-centrale)
      - [1.1 — Créer l'action](#11--créer-laction)
      - [1.2 — Ajouter le script C#](#12--ajouter-le-script-c)
    - [Partie 2 — Créer une action par événement](#partie-2--créer-une-action-par-événement)
      - [2.1 — Créer l'action Follow](#21--créer-laction-follow)
      - [2.2 — Ajouter le déclencheur Twitch](#22--ajouter-le-déclencheur-twitch)
      - [2.3 — Ajouter le sous-action "Run Action"](#23--ajouter-le-sous-action-run-action)
      - [2.4 — Résultat attendu](#24--résultat-attendu)
    - [Partie 3 — Répéter pour chaque événement](#partie-3--répéter-pour-chaque-événement)
    - [Partie 4 — Vérifier que tout fonctionne](#partie-4--vérifier-que-tout-fonctionne)
      - [4.1 — Test depuis Streamer.bot](#41--test-depuis-streamerbot)
      - [4.2 — Test en conditions réelles](#42--test-en-conditions-réelles)
  - [Format du fichier alert.json](#format-du-fichier-alertjson)
    - [Schéma complet](#schéma-complet)
    - [Référence des champs](#référence-des-champs)
    - [Types supportés](#types-supportés)
  - [Sons](#sons)
  - [Mode test](#mode-test)
  - [Personnalisation](#personnalisation)
    - [Durée d'affichage](#durée-daffichage)
    - [Couleurs par type](#couleurs-par-type)
    - [Position de l'overlay](#position-de-loverlay)
    - [Largeur de la carte](#largeur-de-la-carte)
  - [Structure des fichiers](#structure-des-fichiers)
  - [Dépannage](#dépannage)
    - [L'alerte ne s'affiche pas](#lalerte-ne-saffiche-pas)
    - [L'alerte s'affiche une seule fois puis plus](#lalerte-saffiche-une-seule-fois-puis-plus)
    - [Pas de son](#pas-de-son)
    - [L'alerte est invisible dans OBS](#lalerte-est-invisible-dans-obs)
    - [`backdrop-filter` ne fonctionne pas dans OBS](#backdrop-filter-ne-fonctionne-pas-dans-obs)

---

## Architecture

```
Twitch
  │  événement (follow, sub, raid…)
  ▼
Streamer.bot
  │  Action événement  →  Run Action "[StreamAlerts] Écrire alerte"
  │                             │  argument alertType = "follow"
  │                             ▼
  │                       Execute C# Code (WriteAlert.cs)
  │                         lit les variables Twitch automatiquement
  │                         écrit alerts/data/alert.json
  ▼
alerts/data/alert.json   ←── écrasé à chaque événement
  │
  │  polling toutes les 500 ms (fetch + cache-buster)
  ▼
alerts/index.html        ←── overlay HTML/CSS/JS
  │  file d'attente, animations, sons
  ▼
OBS Browser Source       ←── fond transparent, 1920×1080
```

Le principe : Streamer.bot écrase un seul fichier JSON à chaque événement. L'overlay détecte le nouveau `timestamp` et met l'alerte en file d'attente. Le script C# est partagé — une seule action centrale, une valeur d'argument différente par événement.

---

## Prérequis

| Outil                                   | Version minimum | Rôle                            |
| --------------------------------------- | --------------- | ------------------------------- |
| [XAMPP](https://www.apachefriends.org/) | 8.x             | Serveur HTTP local              |
| [OBS Studio](https://obsproject.com/)   | 27+             | Browser Source                  |
| [Streamer.bot](https://streamer.bot/)   | 0.2+            | Réception des événements Twitch |
| Navigateur moderne                      | Chromium 90+    | Pour les tests                  |

---

## Installation

1. **Cloner / copier** ce dépôt dans `C:\xampp\htdocs\StreamAlerts\`
   (ou `D:\audri\Xamp\htdocs\StreamAlerts\` selon ta config XAMPP)

2. **Démarrer Apache** dans le panneau XAMPP.

3. **Vérifier** en ouvrant dans ton navigateur :
   `http://localhost/StreamAlerts/alerts/index.html`
   Tu dois voir la page avec l'indicateur "Appuie sur T pour tester".

4. Appuie sur **T** pour vérifier que les alertes s'affichent correctement.

---

## Configuration OBS

1. Dans OBS, ajoute une **Source Navigateur** (Browser Source).
2. Renseigne :

   | Paramètre                                              | Valeur                                            |
   | ------------------------------------------------------ | ------------------------------------------------- |
   | URL                                                    | `http://localhost/StreamAlerts/alerts/index.html` |
   | Largeur                                                | `1920`                                            |
   | Hauteur                                                | `1080`                                            |
   | Arrière-plan transparent                               | ✅ coché                                          |
   | Actualiser le navigateur quand la scène devient active | ✅ coché                                          |

3. Place la source au-dessus de toutes tes autres sources dans ta scène.

---

## Configuration Streamer.bot

Au lieu d'écrire le JSON à la main pour chaque événement, on utilise **un seul script C#** partagé que chaque action appelle avec un seul argument.

### Vue d'ensemble de la structure finale

```
[StreamAlerts] Écrire alerte          ← action centrale, aucun déclencheur
  └── Execute C# Code (WriteAlert.cs)

[StreamAlerts] Follow                 ← 1 action par événement
  ├── Déclencheur : Twitch → Follow
  └── Run Action → [StreamAlerts] Écrire alerte
        └── argument : alertType = follow

[StreamAlerts] Sub
  ├── Déclencheur : Twitch → Subscribe
  └── Run Action → [StreamAlerts] Écrire alerte
        └── argument : alertType = sub

... (même schéma pour les autres événements)
```

---

### Partie 1 — Créer l'action centrale

Cette action contient le script C#. Elle n'a **aucun déclencheur** : elle est appelée par les autres actions.

#### 1.1 — Créer l'action

1. Ouvre Streamer.bot et clique sur l'onglet **Actions** dans la barre du haut.
2. Dans le panneau de gauche, **clic droit dans la liste des actions** → **Add Action**.
3. Dans la fenêtre qui s'ouvre :
   - **Name** : `[StreamAlerts] Écrire alerte`
   - Laisse les autres champs par défaut.
4. Clique **OK**.

#### 1.2 — Ajouter le script C#

1. L'action est maintenant sélectionnée. Le panneau de droite affiche la liste des sous-actions (vide pour l'instant).
2. **Clic droit dans le panneau des sous-actions** → **Add Sub-Action**.
3. Dans le menu qui s'ouvre, navigue vers :
   **Core** → **C#** → **Execute C# Code**
4. La fenêtre de l'éditeur C# s'ouvre.
5. **Sélectionne tout le code existant** (Ctrl+A) et **supprime-le**.
6. Ouvre le fichier `streamerbot/WriteAlert.cs` (dans ce projet) et **copie tout son contenu**.
7. **Colle-le** dans l'éditeur Streamer.bot.
8. Clique sur **Compile** (bouton en bas de la fenêtre).
   - Tu dois voir le message : `Compile Successful` (ou similaire en vert).
   - Si une erreur apparaît, vérifie que le chemin du fichier dans le code correspond bien à ton installation.
9. Clique **Save & Close** (ou **OK**).

> L'action `[StreamAlerts] Écrire alerte` est prête. Elle ne s'exécutera jamais seule — elle attend d'être appelée.

---

### Partie 2 — Créer une action par événement

Voici le tutoriel complet pour le **Follow**. Répète exactement les mêmes étapes pour chaque autre événement, en changeant uniquement le nom de l'action, le déclencheur, et la valeur de `alertType`.

#### 2.1 — Créer l'action Follow

1. **Clic droit dans la liste des actions** → **Add Action**.
2. **Name** : `[StreamAlerts] Follow`
3. Clique **OK**.

#### 2.2 — Ajouter le déclencheur Twitch

1. Avec l'action `[StreamAlerts] Follow` sélectionnée, repère le panneau **Triggers** (en bas à gauche, ou sous la liste des actions selon ta version de Streamer.bot).
2. **Clic droit dans la zone Triggers** → **Add Trigger**.
3. Navigue vers : **Twitch** → **Channel Events** → **Follow**
4. Une fenêtre de configuration s'ouvre — laisse tout par défaut et clique **OK**.

> Le déclencheur est lié. Streamer.bot exécutera cette action dès qu'un follow arrive sur ta chaîne.

#### 2.3 — Ajouter le sous-action "Run Action"

1. **Clic droit dans le panneau des sous-actions** → **Add Sub-Action**.
2. Navigue vers : **Core** → **Actions** → **Run Action**
3. La fenêtre de configuration du sous-action s'ouvre :

   | Champ                   | Valeur                         |
   | ----------------------- | ------------------------------ |
   | **Action**              | `[StreamAlerts] Écrire alerte` |
   | **Run Immediately**     | ✅ coché                       |
   | **Wait for completion** | ✅ coché (optionnel)           |

4. Cherche l'onglet ou la section **Arguments** dans cette même fenêtre.
5. Clique sur **+** (ou **Add**) pour ajouter un argument :

   | Champ     | Valeur      |
   | --------- | ----------- |
   | **Name**  | `alertType` |
   | **Value** | `follow`    |

6. Clique **OK** pour sauvegarder.

#### 2.4 — Résultat attendu

L'action `[StreamAlerts] Follow` doit ressembler à ça :

```
[StreamAlerts] Follow
  Triggers :
    ✓ Twitch → Follow

  Sub-Actions :
    1. Run Action : [StreamAlerts] Écrire alerte
         alertType = follow
```

---

### Partie 3 — Répéter pour chaque événement

Répète la **Partie 2** pour chacun des événements ci-dessous, en changeant uniquement le **nom de l'action**, le **déclencheur Twitch**, et la **valeur de `alertType`** :

| Nom de l'action                 | Déclencheur Streamer.bot                               | `alertType`     |
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

> **Note Channel Points :** le script récupère automatiquement `%rewardTitle%` comme message affiché sous le pseudo. Aucune configuration supplémentaire nécessaire.

> **Note Hype Train :** `user` sera vide — c'est normal, le Hype Train n'est pas lié à un utilisateur spécifique. L'overlay affiche le message par défaut.

---

### Partie 4 — Vérifier que tout fonctionne

#### 4.1 — Test depuis Streamer.bot

1. Sélectionne l'action `[StreamAlerts] Follow` dans la liste.
2. En bas du panneau de sous-actions, clique sur **Test** (ou **Run**).
3. L'alerte doit apparaître dans ton overlay OBS dans les 500 ms.

Si rien ne s'affiche :

- Vérifie que XAMPP Apache est démarré.
- Ouvre `http://localhost/StreamAlerts/alerts/data/alert.json` dans le navigateur : le contenu doit avoir changé.
- Vérifie que le chemin dans `WriteAlert.cs` est correct.

#### 4.2 — Test en conditions réelles

1. Lance un stream de test sur Twitch.
2. Demande à un ami de follow / sub / raider.
3. Vérifie dans l'onglet **Log** de Streamer.bot que l'action s'est bien déclenchée (ligne verte).

---

## Format du fichier alert.json

C'est le seul fichier que Streamer.bot doit modifier. Il se trouve à :

```
alerts/data/alert.json
```

### Schéma complet

```json
{
  "type": "string  — type d'alerte (voir liste ci-dessous)",
  "user": "string  — pseudo Twitch de l'utilisateur",
  "message": "string  — message personnalisé (optionnel, remplace le message par défaut)",
  "avatar": "string  — URL de l'avatar (optionnel, laisse vide si indisponible)",
  "sound": "string  — nom du fichier son dans assets/sounds/ (ex: follow.mp3)",
  "amount": "number  — montant : bits, euros, viewers, nombre de subs",
  "months": "number  — nombre de mois (resub uniquement)",
  "tier": "string  — palier d'abonnement : 'Tier 1', 'Tier 2', 'Tier 3'",
  "timestamp": "number  — timestamp Unix en secondes — DOIT changer à chaque alerte"
}
```

### Référence des champs

| Champ       | Type   | Obligatoire      | Description                                                       |
| ----------- | ------ | ---------------- | ----------------------------------------------------------------- |
| `type`      | string | Oui              | Type de l'alerte (voir types supportés)                           |
| `user`      | string | Oui              | Pseudo affiché en grand sur la carte                              |
| `message`   | string | Non              | Texte sous le pseudo. Si vide, un message par défaut est généré   |
| `avatar`    | string | Non              | URL d'image (HTTP/HTTPS). Si vide ou erreur de chargement, ignoré |
| `sound`     | string | Non              | Fichier `.mp3` dans `assets/sounds/`. Si vide, pas de son         |
| `amount`    | number | Selon type       | Bits, euros, viewers, nombre de gift subs                         |
| `months`    | number | Resub uniquement | Nombre total de mois abonnés                                      |
| `tier`      | string | Non              | `Tier 1` / `Tier 2` / `Tier 3`                                    |
| `timestamp` | number | Oui              | Timestamp Unix (secondes). **Doit être unique à chaque alerte**   |

### Types supportés

| Valeur `type`   | Événement      | Couleur           |
| --------------- | -------------- | ----------------- |
| `follow`        | Nouveau follow | Violet `#9B59B6`  |
| `sub`           | Nouveau sub    | Or `#F1C40F`      |
| `resub`         | Resub          | Orange `#E67E22`  |
| `giftsub`       | Gift sub       | Rose `#E91E8C`    |
| `raid`          | Raid entrant   | Rouge `#E74C3C`   |
| `bits`          | Envoi de bits  | Cyan `#00BCD4`    |
| `donation`      | Donation       | Vert `#2ECC71`    |
| `channelpoints` | Channel points | Bleu `#3498DB`    |
| `hype_train`    | Hype train     | Arc-en-ciel animé |

---

## Sons

Place tes fichiers `.mp3` dans :

```
alerts/assets/sounds/
```

Noms de fichiers recommandés (correspondant aux valeurs `sound` dans les exemples) :

```
follow.mp3
sub.mp3
resub.mp3
giftsub.mp3
raid.mp3
bits.mp3
donation.mp3
channelpoints.mp3
hype_train.mp3
```

Si un fichier son est introuvable, l'alerte s'affiche quand même sans son.
Le volume par défaut est `0.8` (modifiable dans `script.js`, constante `audio.volume`).

---

## Mode test

Ouvre `http://localhost/StreamAlerts/alerts/index.html` dans ton navigateur et appuie sur la touche **T**.

Chaque appui déclenche l'alerte suivante dans ce cycle :

```
follow → sub → resub → giftsub → raid → bits → donation → channelpoints → hype_train → follow → …
```

Les alertes se mettent en file d'attente : tu peux appuyer plusieurs fois rapidement, elles s'afficheront l'une après l'autre.

---

## Personnalisation

Tous les réglages visuels se font dans `alerts/style.css` via les variables CSS.

### Durée d'affichage

Dans `alerts/script.js` :

```js
const DISPLAY_DURATION = 5500; // ms avant que la sortie commence
const EXIT_DURATION = 700; // ms pour l'animation de sortie
const POLL_INTERVAL = 500; // ms entre chaque lecture du JSON
```

### Couleurs par type

Dans `alerts/script.js`, modifie les valeurs `color` et `colorRgb` dans `ALERT_CONFIGS` :

```js
follow: {
  color:    '#9B59B6',           // couleur principale
  colorRgb: '155, 89, 182',     // même couleur en RGB (pour les opacités CSS)
},
```

### Position de l'overlay

Dans `alerts/style.css`, modifie `#alert-container` :

```css
#alert-container {
  bottom: 64px; /* distance depuis le bas */
  left: 50%; /* centré horizontalement */
}
```

Pour placer en haut à gauche par exemple :

```css
#alert-container {
  bottom: auto;
  top: 40px;
  left: 40px;
  transform: none;
  align-items: flex-start;
}
```

### Largeur de la carte

Dans `alerts/style.css` :

```css
.alert-card {
  width: 520px;
}
```

---

## Structure des fichiers

```
StreamAlerts/
├── README.md                        ← ce fichier
├── streamerbot/
│   └── WriteAlert.cs                ← script C# à coller dans Streamer.bot
├── alerts/
│   ├── index.html                   ← URL à mettre dans OBS
│   ├── style.css                    ← design, couleurs, animations
│   ├── script.js                    ← logique, polling, file d'attente
│   ├── assets/
│   │   ├── sounds/                  ← fichiers .mp3 des alertes
│   │   ├── videos/                  ← vidéos (usage futur)
│   │   ├── images/                  ← images, GIFs
│   │   └── fonts/                   ← polices locales (si hors ligne)
│   └── data/
│       ├── alert.json               ← écrit par Streamer.bot
│       ├── queue.json               ← réservé (usage futur)
│       └── examples/                ← JSONs d'exemple par type
│           ├── follow.json
│           ├── sub.json
│           ├── resub.json
│           ├── giftsub.json
│           ├── raid.json
│           ├── bits.json
│           ├── donation.json
│           ├── channelpoints.json
│           └── hype_train.json
```

---

## Dépannage

### L'alerte ne s'affiche pas

1. Vérifie que XAMPP Apache est bien démarré.
2. Ouvre `http://localhost/StreamAlerts/alerts/data/alert.json` dans ton navigateur — tu dois voir le JSON.
3. Vérifie que le `timestamp` change bien à chaque événement dans Streamer.bot.
4. Vérifie que la valeur `type` correspond exactement à l'un des types supportés.

### L'alerte s'affiche une seule fois puis plus

Le `timestamp` ne change pas entre deux événements identiques. Assure-toi que Streamer.bot injecte `%unixtime%` (ou équivalent en millisecondes) et non une valeur fixe.

### Pas de son

- Vérifie que le fichier `.mp3` existe dans `alerts/assets/sounds/`.
- Le nom du fichier dans `alert.json` est sensible à la casse.
- OBS bloque parfois l'autoplay audio : dans les paramètres de la source navigateur, active **"Contrôler l'audio via OBS"** si disponible.

### L'alerte est invisible dans OBS

- Vérifie que **"Arrière-plan transparent"** est coché dans les paramètres de la source.
- Vérifie que la source est placée au-dessus des autres dans l'ordre des calques.
- La résolution de la source doit être `1920×1080`.

### `backdrop-filter` ne fonctionne pas dans OBS

C'est normal : le `backdrop-filter` flou n'a aucun effet dans OBS car le fond est transparent côté navigateur. La carte reste lisible grâce à son fond sombre `rgba(10, 10, 20, 0.93)`.
