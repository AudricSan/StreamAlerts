# Page overlay — HTML, zones et chargement des CSS

- Status: Backlog
- Priorite: Haute
- Complexite: M
- Tags: rebuild-from-zero, overlay, html, css

## Description

Construire `overlay/index.html` : conteneur plein ecran (reference 1920x1080), une zone DOM par widget (`#zone-alerts`, `#zone-chat`, etc.) avec structure interne minimale, inclusion de `styles/main.css` et des feuilles par composant (`alerts.css`, `chat.css`, etc.), puis les scripts dans l ordre impose par la fondation.

## Objectifs

- Liste des zones identique a `ZONE_DEFS` / README.
- Fond transparent adapte a OBS.
- Pas de modules ES.

## Criteres d acceptation

- [ ] Toutes les zones referencees par les composants existent dans le DOM.
- [ ] Ordre des balises `script` strictement respecte.

## Dependances

- Fondation (regles de chargement).

## Reference actuelle

- `overlay/index.html`, `overlay/styles/*.css`
