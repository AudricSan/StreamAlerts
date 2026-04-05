# Sons d’alerte par type d’événement

- Status: Done
- Priorité: 🟡 Moyenne
- Complexité: M
- Tags: overlay, audio, alerts, config, obs

## Description

Jouer un **fichier audio local** dans l’overlay lors du déclenchement d’une alerte, avec un mapping **type d’alerte → fichier** (follow, sub, raid, bits, etc.) et réglages de volume dans la configuration.

## Objectifs

- Étendre `config.json` (section alertes ou dédiée) : chemins relatifs aux assets, volume global et/ou par type, option mute.
- Au moment où le composant alertes affiche une alerte, déclencher `HTMLAudioElement` (ou équivalent compatible Chromium 90+) sans bloquer l’UI.
- Documenter l’emplacement des fichiers (ex. `overlay/assets/sounds/`).

## Critères d’acceptation

- [ ] Aucun son si désactivé ou fichier manquant ; pas d’erreur console bloquante.
- [ ] Volume et mute respectés après chargement de la config.
- [ ] Pas de fuite mémoire évidente (pas de dizaines d’instances audio simultanées non contrôlées).
- [ ] Compatible contraintes projet : pas de npm, pas de modules ES.
- [ ] Dock ou `config.json` permet d’ajuster les paramètres (au minimum édition JSON documentée).

## Dépendances

- Composant `alerts.js` et structure actuelle de `alert.json` / types d’alerte.

## Notes techniques

- Précharger ou réutiliser des objets Audio par type pour limiter la latence.
- Respecter les politiques d’autoplay du navigateur / OBS (souvent OK après interaction ou dans OBS).
