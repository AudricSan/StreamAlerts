# Composant — Alertes (`alert.json`, touche T)

- Status: Done
- Priorite: Haute
- Complexite: L
- Tags: rebuild-from-zero, widget, alerts, twitch

## Description

File d alertes (follow, sub, resub, giftsub, raid, bits, donation, channel points, hype train) : lecture de `overlay/data/alert.json` avec `timestamp`, file interne ou queue, animations entree/sortie, duree `displayDuration` depuis config, types distincts styles, texte et images si prevus. Integration avec sons si une tache backlog le prevoyait.

## Objectifs

- `overlay/components/alerts.js`, `window.Alerts`, etend `BaseComponent`.
- `overlay/styles/alerts.css`.
- Zone `#zone-alerts`.

## Criteres d acceptation

- [ ] Donnees utilisateur echappees (pseudo, message).
- [ ] JSON invalide ou absent : pas de crash.
- [ ] Perfs : pas d animations layout lourdes (preferer transform/opacity).

## Dependances

- BaseComponent, Poller, Config, esc(), Bus si sync avec autres modules.

## Reference actuelle

- `overlay/components/alerts.js`, `streamerbot/WriteAlert.cs`
