# Widget « dernier raid » (shoutout)

- Status: Backlog
- Priorité: 🟡 Moyenne
- Complexité: M
- Tags: overlay, streamerbot, json, widget, twitch

## Description

Afficher sur l’overlay la **dernière chaîne ayant raid** (et éventuellement le nombre de viewers), sur le même principe que `last_follower` / `last_subscriber`.

## Objectifs

- Ajouter un fichier JSON écrit par Streamer.bot (ex. `last_raid.json`) avec `timestamp` obligatoire.
- Créer un composant overlay (`BaseComponent`), zone DOM, entrées dans `script.js`, `index.html`, `config-manager.js`, visibilité et raccourci clavier de test.
- Documenter le trigger Streamer.bot (événement Raid) dans le README.

## Critères d’acceptation

- [ ] `last_raid.json` respecte la convention `timestamp` (ms) et champs documentés.
- [ ] Script C# dédié (ou extension de `WriteAlert.cs`) écrit le fichier vers `overlay/data/`.
- [ ] Le widget s’affiche correctement et ignore les JSON invalides ou absents.
- [ ] `api.php` autorise lecture/écriture si le dock doit pousser un reset manuel (optionnel).
- [ ] README et CLAUDE.md mis à jour si de nouveaux fichiers ou zones sont ajoutés.

## Dépendances

- Aucune dépendance bloquante ; alignement sur le pattern des composants « last * » existants.

## Notes techniques

- Réutiliser `esc()` pour tout texte utilisateur (nom de chaîne).
- Ne pas dupliquer de boucle de polling hors `Poller`.
- Chemins absolus Windows dans les scripts C# à documenter pour l’utilisateur.
