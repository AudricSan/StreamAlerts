# Bandeau défilant (annonces, réseaux, sponsors)

- Status: Backlog
- Priorité: 🟢 Basse
- Complexité: M
- Tags: overlay, ticker, json, ui, branding

## Description

Ajouter un **ticker** horizontal (texte défilant) alimenté par un fichier JSON local (message unique ou liste rotative), modifiable via Streamer.bot ou le dock, pour annonces, liens sociaux ou messages partenaires.

## Objectifs

- Schéma JSON avec `timestamp`, texte(s), vitesse / direction optionnelles, activation on/off.
- Nouveau composant + zone + config + éventuelle entrée `api.php` pour écriture depuis le dock.
- Animation basée sur `transform` / CSS pour limiter la charge OBS.

## Critères d’acceptation

- [ ] Contenu affiché échappé (pas d’HTML arbitraire depuis le JSON).
- [ ] Si le fichier est absent ou invalide, la zone ne casse pas le bootstrap.
- [ ] Paramètres de vitesse documentés et bornés (valeurs extrêmes ne figent pas le navigateur).
- [ ] Intégration visibilité (`!hide` / dock) comme les autres zones.

## Dépendances

- Pattern `BaseComponent`, `Poller`, `visibility.json`.

## Notes techniques

- Préférer `requestAnimationFrame` ou CSS `animation` simple selon complexité.
- Dupliquer le texte dans le DOM pour boucle infinie si nécessaire, en limitant les nœuds.
