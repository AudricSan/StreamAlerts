# Composant — Dernier follower (`last_follower.json`, touche L partagee)

- Status: Backlog
- Priorite: Moyenne
- Complexite: S
- Tags: rebuild-from-zero, widget, twitch

## Description

Afficher le **dernier pseudo** ayant suivi la chaine, mis a jour via `last_follower.json` (souvent ecrit par le meme flux que WriteAlert.cs). Polling avec deduplication `timestamp`.

## Objectifs

- `overlay/components/last-follower.js`, `window.LastFollower`.
- `overlay/styles/last-events.css` ou fichier dedie selon structure actuelle.
- Zone `#zone-last-follower`.

## Criteres d acceptation

- [ ] Pseudo echappe.
- [ ] Fichier absent : zone vide ou message neutre sans erreur JS.

## Dependances

- BaseComponent, Poller, Config.

## Reference actuelle

- `overlay/components/last-follower.js`, partie last follower dans `WriteAlert.cs`
