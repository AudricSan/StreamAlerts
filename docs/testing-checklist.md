# Testing Checklist — StreamAlerts

Checklist de tests manuels pour valider l'overlay avant et après une modification.

Ouvrir l'overlay dans le navigateur : `http://localhost/StreamAlerts/overlay/`

---

## Démarrage et chargement

| # | Précondition | Étapes | Résultat attendu |
|---|---|---|---|
| 1 | XAMPP Apache démarré, Streamer.bot lancé | Ouvrir `http://localhost/StreamAlerts/overlay/` | Page blanche transparente, aucune erreur rouge dans la console (F12) |
| 2 | Overlay ouvert | Ouvrir la console F12, onglet Console | Aucun `console.log()` brut, aucun `Uncaught ReferenceError`, aucun `404` sur les scripts JS |
| 3 | Overlay ouvert | Attendre 3 secondes | Les logs `Log.info` sur l'initialisation des composants s'affichent en mode debug (`?debug=1`), aucune exception |

---

## Mode debug

| # | Précondition | Étapes | Résultat attendu |
|---|---|---|---|
| 4 | Overlay ouvert | Ajouter `?debug=1` à l'URL : `http://localhost/StreamAlerts/overlay/?debug=1` | Un panneau de debug apparaît en bas de l'écran avec l'état WebSocket, les pollers actifs et les logs en temps réel |
| 5 | Mode debug actif | Observer le panneau | L'état WebSocket s'affiche (`ws:connected` ou `ws:disconnected`), les pollers listés correspondent aux composants activés |

---

## Tests des widgets — touches clavier

| # | Précondition | Étapes | Résultat attendu |
|---|---|---|---|
| 6 | Overlay ouvert dans le navigateur | Appuyer sur **T** (répéter 9 fois) | Chaque pression affiche une alerte différente : follow, sub, resub, giftsub, raid, bits, donation, channelpoints, hype_train — puis le cycle recommence |
| 7 | Overlay ouvert | Appuyer sur **C** (répéter 8 fois) | Chaque pression ajoute un message de chat simulé différent dans la zone chat |
| 8 | Overlay ouvert | Appuyer sur **L** | Un widget "DERNIER FOLLOW" et un widget "DERNIER SUB" apparaissent simultanément |
| 9 | Overlay ouvert | Appuyer sur **G** | Un goal tracker apparaît avec la valeur "47 / 100" et une barre de progression |
| 10 | Overlay ouvert | Appuyer sur **S** | Un sub train apparaît avec "×7" et une barre de décompte qui s'écoule |
| 11 | Overlay ouvert | Appuyer sur **N** | Un widget "NOW PLAYING" apparaît avec un titre et un artiste fictifs |
| 12 | Overlay ouvert | Appuyer sur **U** | Une file d'attente apparaît avec 4 joueurs fictifs et le statut "OUVERTE" |
| 13 | Overlay ouvert | Appuyer sur **V** | Un widget "SPECTATEURS" apparaît avec la valeur 142 |
| 14 | Overlay ouvert | Appuyer sur **I** | Un widget uptime apparaît et le compteur s'incrémente chaque seconde (temps simulé ~2h34m) |
| 15 | Overlay ouvert | Appuyer sur **E** | Un widget de stats de session apparaît avec follows, subs, bits, raids, dons |
| 16 | Overlay ouvert | Appuyer sur **D** | Un compte à rebours de 5 minutes démarre et la barre de progression se réduit |
| 17 | Overlay ouvert | Appuyer sur **B** | Un classement de 5 entrées apparaît avec médailles |
| 18 | Overlay ouvert | Appuyer sur **O** | Un sondage de test apparaît avec 3 choix et un timer de 60 secondes |
| 19 | Overlay ouvert | Appuyer sur **P** | Une prédiction de test apparaît avec 2 options et un timer de 90 secondes |
| 20 | Overlay ouvert | Appuyer sur **H** | Un Hype Train niveau 2 apparaît avec 3 contributeurs et un timer de 3 minutes |

---

## Test JSON manquant

| # | Précondition | Étapes | Résultat attendu |
|---|---|---|---|
| 21 | Overlay chargé et fonctionnel | Renommer `overlay/data/goal.json` en `goal.json.bak`, puis attendre le prochain cycle de polling (2 secondes) | Le widget goal s'efface silencieusement. Aucune erreur fatale. Les autres composants continuent de fonctionner |
| 22 | Après test 21 | Remettre `goal.json.bak` en `goal.json`, attendre 2 secondes | Le widget goal réapparaît avec les données précédentes |

---

## Test JSON malformé

| # | Précondition | Étapes | Résultat attendu |
|---|---|---|---|
| 23 | Overlay chargé et fonctionnel | Éditer `overlay/data/viewers.json`, supprimer le crochet fermant `}` pour le corrompre volontairement, enregistrer | Le widget viewers s'efface ou reste inchangé. Un message `Log.error` apparaît dans la console debug. Aucun crash des autres composants |
| 24 | Après test 23 | Restaurer un JSON valide dans `viewers.json` | Le widget reprend son fonctionnement normal au prochain cycle de polling |

---

## Test WebSocket indisponible

| # | Précondition | Étapes | Résultat attendu |
|---|---|---|---|
| 25 | Overlay chargé avec WebSocket connecté | Arrêter Streamer.bot ou désactiver son serveur WebSocket | Le panneau debug affiche `ws:disconnected`. Le chat bascule automatiquement en mode polling JSON (log `chat: WebSocket KO — polling repris`) |
| 26 | Après test 25, WebSocket déconnecté | Envoyer un message dans le chat Twitch (ou modifier `chat.json` manuellement) | Le message apparaît via polling JSON (délai possible jusqu'à 300ms) |
| 27 | Après test 25 | Redémarrer Streamer.bot et reconnecter le WebSocket | L'overlay se reconnecte automatiquement après le délai de reconnexion. Le chat repasse en mode WebSocket (log `chat: WebSocket actif — polling suspendu`) |

---

## Test des commandes de visibilité

| # | Précondition | Étapes | Résultat attendu |
|---|---|---|---|
| 28 | WebSocket connecté, widget goal visible | En tant que modérateur ou broadcaster, envoyer dans le chat : `!hide goal` | Le widget goal disparaît. La commande n'apparaît pas dans le chat overlay |
| 29 | Après test 28, goal masqué | Envoyer : `!show goal` | Le widget goal réapparaît |
| 30 | Widget alertes visible | Envoyer : `!toggle alertes` | Le widget alertes disparaît. Renvoyer `!toggle alertes` le fait réapparaître |

---

## Test reload OBS

| # | Précondition | Étapes | Résultat attendu |
|---|---|---|---|
| 31 | Des messages de chat sont affichés dans l'overlay | Recharger la page (F5 ou clic droit OBS → Actualiser la source) | Les messages de chat survivants (dans leur durée de vie) réapparaissent automatiquement depuis le `localStorage` |

---

## Bonnes pratiques de test

- Toujours tester dans le navigateur avant de valider dans OBS Browser Source.
- Utiliser `?debug=1` pour diagnostiquer tout problème de polling ou de connexion WebSocket.
- Après chaque modification d'un fichier JS, recharger la page et vérifier la console pour détecter les erreurs de syntaxe.
- Tester les cas de dégradation (JSON absent, WebSocket KO) autant que les cas nominaux.
