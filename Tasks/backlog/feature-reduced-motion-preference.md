# Respect de prefers-reduced-motion et option config animations

- Status: Backlog
- Priorité: 🟢 Basse
- Complexité: S
- Tags: accessibility, css, overlay, obs, performance

## Description

Les utilisateurs ou le systeme peuvent demander **moins d animations** (accessibilite, migraines, charge GPU dans OBS). Le projet utilise deja transitions et animations pour alertes et widgets. Il faut **respecter** la media query CSS `prefers-reduced-motion: reduce` en raccourcissant ou supprimant les transitions, et optionnellement offrir un **forcer moins d animations** dans config.json pour les Browser Sources qui ne propagent pas toujours la preference systeme.

## Objectifs

- Ajouter des regles CSS globales sous `@media (prefers-reduced-motion: reduce)` ciblant les proprietes animees (transform, opacity, animation).
- Option config `reduceMotion: true` qui ajoute une classe sur body avec les memes effets que la media query (pour override explicite).
- Verifier les composants qui utilisent setInterval pour animations : raccourcir ou desactiver si reduce.

## Critères d'acceptation

- [ ] Avec reduce-motion, les alertes restent visibles et lisibles (pas de disparition instantanee sans controle).
- [ ] Sans preference, comportement actuel conserve.
- [ ] Pas de dependance a des APIs JS recentes.
- [ ] Documenter dans README la difference entre preference OS et option config.

## Dépendances

- style.css, composants alerts et autres animations.

## Notes techniques

- `animation-duration: 0.01ms` pattern courant ; tester sur OBS Chromium.
