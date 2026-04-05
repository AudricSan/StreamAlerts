# Dock OBS — interface de configuration (`config/`)

- Status: Done
- Priorite: Haute
- Complexite: L
- Tags: rebuild-from-zero, config, ui, obs

## Description

Page web servie par XAMPP (`/StreamAlerts/config/`) pour regler objectif, queue, musique, layout (positions, opacite, visibilite rapide), parametres globaux (durees alertes, WebSocket, etc.) **sans editer les fichiers a la main**. UI en HTML/CSS/JS vanilla, appels `fetch` vers `api.php` (lecture/ ecriture JSON).

## Objectifs

- `config/index.html`, `config/style.css`, `config/script.js`.
- Onglets ou sections alignes sur le README (Goal, Queue, Music, Layout, Config).
- Toasts ou feedback sur succes / erreur sauvegarde.

## Criteres d acceptation

- [ ] Aucune fuite XSS depuis les champs (echappement si rendu dynamique).
- [ ] Chemins relatifs corrects vers `../overlay/data/` et `./api.php`.

## Dependances

- `api.php`, structure `config.json` definie par Config DEFAULTS.

## Reference actuelle

- `config/index.html`, `config/script.js`, `config/style.css`
