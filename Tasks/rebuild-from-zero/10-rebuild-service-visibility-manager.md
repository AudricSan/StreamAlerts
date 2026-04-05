# Service — Visibilite des zones (`window.Visibility`)

- Status: Backlog
- Priorite: Haute
- Complexite: M
- Tags: rebuild-from-zero, services, visibility, chat

## Description

Gerer l affichage runtime des zones overlay : etat lu depuis `visibility.json` (polling ou init), commandes chat `!show`, `!hide`, `!toggle` et alias (WebSocket en priorite, fallback JSON via WriteVisibility.cs), respect du flag `enabled: false` dans la config (desactivation definitive). Persister les changements dans `overlay/data/visibility.json` selon le mecanisme actuel (API PHP ou autre).

## Objectifs

- Fichier `overlay/services/visibility-manager.js`.
- Table alias vers cle composant alignee sur `ZONE_DEFS` du bootstrap.
- Evenements Bus (`visibility:changed`, etc.) si le projet les utilise.

## Criteres d acceptation

- [ ] Un composant `enabled: false` dans config ne peut pas etre affiche par commande chat.
- [ ] Etats coherents apres reload de la Browser Source.

## Dependances

- Bus, WSManager, Config, Poller ou fetch initial, `api.php` si ecriture.

## Reference actuelle

- `overlay/services/visibility-manager.js`
