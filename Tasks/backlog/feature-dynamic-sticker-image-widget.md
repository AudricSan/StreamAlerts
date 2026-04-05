# Widget image / sticker dynamique (logo, partenaire du jour)

- Status: Backlog
- Priorité: 🟢 Basse
- Complexité: M
- Tags: overlay, json, assets, branding

## Description

Permettre d afficher une **image** (logo partenaire, emote geante decorative, visuel promo) dont la **source** est pilotee par un fichier JSON local. Streamer.bot ou le dock met a jour le chemin ou l URL (voir contraintes securite) vers un fichier dans overlay/assets/ ou une image statique connue.

Le widget doit gerer **image manquante**, **ratio**, taille max, et ne jamais executer de script via l image. Si seules les URLs locales sont autorisees, la doc doit l indiquer clairement pour eviter SSRF ou chargement de ressources externes non voulues.

## Objectifs

- Schema JSON : timestamp, path relatif securise sous assets/ ou nom de fichier whitelisté.
- Composant leger : img avec dimensions depuis config layout.
- ALLOWED dans api.php si ecriture depuis dock.

## Critères d'acceptation

- [ ] Pas de chargement arbitraire de chemins hors dossier prevu (validation stricte du path).
- [ ] Si URL externe interdite par choix projet, documenter ; si autorisee, lister risques OBS.
- [ ] Alt text configurable ou vide pour decoratif.
- [ ] Integration visibilite et zones comme les autres widgets.

## Dépendances

- BaseComponent, Poller, api.php.

## Notes techniques

- Preferer fichiers locaux pour offline et perf ; eviter images 4K inutiles.
