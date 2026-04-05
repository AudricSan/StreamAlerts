# Index — reconstruction StreamAlerts from scratch

- Status: Backlog
- Priorité: 🟢 Basse (méta)
- Complexité: S
- Tags: rebuild-from-zero, index

## Description

Liste ordonnee des fiches pour **repartir de zero** en conservant le perimetre fonctionnel actuel. Executer dans l ordre des numeros quand des dependances existent (noyau avant services avant composants). Les fiches 10-12 et les numeros 36, 45, 46, 47 utilisent parfois des titres ou champs ASCII (sans accents) pour compatibilite outils ; le contenu reste aligne sur le depot.

## Objectifs

- Servir de carte pour une reecriture complete sans oublier une brique.
- Relier chaque fiche au fichier source actuel (section Reference actuelle).

## Ordre suggere

1. 01 — Fondation contraintes et doc  
2. 02-07 — Noyau (Log, Bus, Config, Store, BaseComponent, utils)  
3. 08-11 — Services (Poller, WS, Visibility, Scene)  
4. 12-13 — Page overlay HTML/CSS et bootstrap script.js  
5. 14-15 — Dev (keyboard tester, debug panel)  
6. 16-31 — Un composant par fichier (alertes a hype train)  
7. 32-33 — Dock config et api.php  
8. 34 — Dashboard racine  
9. 35 — Conventions JSON data  
10. 36-50 — Scripts Streamer.bot (C#) ; fichiers 36, 45, 46, 47 suffixes alert-writer / countdown-writer / leaderboard-writer / poll-writer  

## Note

- Le fichier stub `overlay/components/lastevents.js` est legacy : non liste comme fonctionnalite a reconstruire.

## Critères d acceptation

- [ ] Toutes les fiches numerotees sont presentes dans ce dossier.

## Dependances

- Aucune

## Notes techniques

- Apres reconstruction, mettre a jour README et CLAUDE.md pour refleter tout ecart volontaire par rapport a l ancienne version.
