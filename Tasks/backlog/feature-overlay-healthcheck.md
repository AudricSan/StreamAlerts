# Page ou endpoint de healthcheck (diagnostic local)

- Status: Backlog
- Priorité: 🟡 Moyenne
- Complexité: S
- Tags: devops, diagnostic, xampp, json, ux

## Description

Offrir un **point de contrôle unique** (page HTML légère ou réponse JSON minimale) permettant de vérifier rapidement que l’installation StreamAlerts est **opérationnelle** avant un live : Apache répond, le dossier `overlay/data/` est accessible, les fichiers JSON attendus existent (ou sont créables), et éventuellement que les `timestamp` des fichiers « vivants » (chat, viewers, etc.) ne sont pas anormalement anciens.

L’objectif est de réduire le temps de débogage quand « rien ne s’affiche » : le streamer ou un mod peut ouvrir une URL et voir un résumé vert/orange/rouge sans lire la console OBS.

## Objectifs

- Définir l’URL (ex. `http://localhost/StreamAlerts/health/` ou `health.html` à la racine) et ce qu’elle vérifie exactement (liste figée ou configurable).
- Afficher clairement : serveur OK, chemins data OK, liste des fichiers manquants, âge du dernier `timestamp` pour quelques JSON clés.
- Rester **100 % local** : pas d’appel réseau externe obligatoire ; compatible hébergement XAMPP actuel.
- Documenter l’usage dans le README (section dépannage).

## Critères d'acceptation

- [ ] Une seule URL documentée donne un diagnostic lisible en moins de 10 secondes.
- [ ] Aucune fuite d’informations sensibles (mots de passe WebSocket, chemins système complets si jugés trop exposés sur un LAN).
- [ ] Si PHP est utilisé, réutiliser les mêmes garde-fous que `api.php` (pas d’accès arbitraire au disque).
- [ ] Fonctionne sans JavaScript côté client si possible (HTML généré côté serveur), ou page statique + fetch JSON local si choix documenté.

## Dépendances

- Structure actuelle `overlay/data/`, éventuellement `config/api.php` pour une action `health` en lecture seule.

## Notes techniques

- Ne pas ajouter npm ni build : PHP statique ou HTML + petit script JS autorisé selon conventions du repo.
- Prévoir un mode « JSON » (`?format=json`) pour outillage futur ou scripts.
