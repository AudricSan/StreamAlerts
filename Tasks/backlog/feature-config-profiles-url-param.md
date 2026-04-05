# Profils de configuration multiples (paramètre d'URL profile)

- Status: Backlog
- Priorité: 🟢 Basse
- Complexité: L
- Tags: config, overlay, workflow, obs

## Description

Un même PC peut servir à des streams **différents** (jeu compétitif vs création, invité, chaîne secondaire) avec des **layouts d'overlay différents**. Aujourd'hui, tout repose sur un seul `overlay/data/config.json` actif.

L'idée est de permettre plusieurs fichiers de configuration nommés (ex. `config.jeu.json`, `config.irl.json`) ou un sous-dossier dédié aux profils, et de choisir le profil actif via un **paramètre d'URL** sur la Browser Source, par exemple : `overlay/?profile=jeu`. Le chargement initial de `Config.load()` doit alors résoudre le bon fichier (avec repli sur `config.json` si profil introuvable).

## Objectifs

- Définir la convention de nommage des fichiers et les règles de sécurité (pas de path traversal : valeur `profile` alphanumérique courte autorisée uniquement).
- Adapter `Config.load()` et, si besoin, `api.php` pour lire et écrire le bon fichier quand on sauve depuis le dock (sélecteur de profil dans le dock).
- Documenter comment dupliquer deux Browser Sources OBS pointant vers deux profils.

## Critères d'acceptation

- [ ] URL sans paramètre profile : comportement actuel inchangé.
- [ ] URL avec profil valide : config chargée depuis le fichier prévu.
- [ ] Profil invalide : log warn et fallback documenté.
- [ ] Sauvegarde depuis le dock cible le profil sélectionné sans écraser les autres fichiers par erreur.

## Dépendances

- `core/config-manager.js`, `config/api.php` (liste de fichiers autorisés), éventuellement UI config.

## Notes techniques

- Les JSON de données (`goal.json`, etc.) restent souvent **partagés** entre profils ; documenter si un profil doit aussi isoler les data (hors scope initial sauf besoin explicite).
