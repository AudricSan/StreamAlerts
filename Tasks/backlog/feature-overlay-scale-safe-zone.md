# Échelle globale et zone sûre (résolutions / ultrawide)

- Status: Backlog
- Priorité: 🟡 Moyenne
- Complexité: M
- Tags: overlay, layout, obs, responsive, config

## Description

L’overlay est pensé pour du **1920×1080**, mais certains setups utilisent du **1440p**, du **1728×1080**, ou des **sources navigateur redimensionnées** dans OBS. Sans adaptation, les zones positionnées en pixels peuvent paraître décalées ou trop petites.

Cette fonctionnalité ajoute des paramètres de **mise à l’échelle** et/ou de **marges (safe zone)** appliqués au conteneur racine de l’overlay : par exemple `rootScale: 0.85` ou `safeMargin: { top, right, bottom, left }` en pixels ou pourcentages, lus depuis `config.json` et appliqués via `transform: scale()` sur un wrapper ou ajustement des dimensions de la scène documenté.

## Objectifs

- Étendre la config avec des clés documentées (niveau global, pas par widget obligatoirement au premier jet).
- Appliquer le facteur d’échelle au bootstrap (`script.js` ou CSS sur `#overlay-root` / `body`).
- Documenter la méthode recommandée dans OBS (taille du Browser Source vs scale dans la config).

## Critères d'acceptation

- [ ] Défaut : comportement identique à l’existant (scale 1, marges 0).
- [ ] Pas de régression sur les animations `transform` des widgets (éviter double transformation conflictuelle ou documenter l’ordre).
- [ ] Compatible Chromium 90 ; pas de `clamp()` ou unités exotiques si non supportées dans le contexte cible.
- [ ] Le dock permet d’éditer ces valeurs ou le README explique l’édition manuelle du JSON.

## Dépendances

- `overlay/index.html` structure DOM racine, `script.js` `_applyLayout`, `config-manager.js` DEFAULTS.

## Notes techniques

- Préférer `transform-origin: top left` ou centré selon design ; tester avec plusieurs zones ancrées top/bottom.
