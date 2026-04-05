# Réinitialisation des défauts par composant (dock)

- Status: Backlog
- Priorité: 🟢 Basse
- Complexité: M
- Tags: config, dock, persistence, ux

## Description

Après expérimentations, un utilisateur peut avoir **sur-configuré** un widget (positions extrêmes, pollers trop courts) et souhaiter revenir aux **valeurs par défaut du projet** pour **ce seul composant**, sans réinitialiser toute la `config.json` ni restaurer manuellement chaque clé depuis le code source.

Le dock proposerait par onglet ou section un bouton **« Réinitialiser ce composant aux défauts »** avec confirmation (modal ou `confirm()` selon conventions actuelles), qui fusionne les `DEFAULTS` de `config-manager.js` pour la clé concernée tout en **préservant** les autres sections de la config (notamment `env`, autres widgets).

## Objectifs

- Exposer côté dock une action par composant (ou liste déroulante « composant à reset »).
- Réutiliser la même source de vérité que `DEFAULTS` (éviter duplication des nombres magiques : soit export partagé documenté, soit endpoint qui renvoie les defaults — à trancher sans npm).
- Confirmation utilisateur obligatoire avant écriture.

## Critères d'acceptation

- [ ] Un reset n'efface pas les clés d'autres composants ni `env` sauf si explicitement demandé.
- [ ] Après reset, `Config.save` / API écrit un JSON valide.
- [ ] Les positions layout (`top`, `left`, etc.) reviennent aux defaults documentés pour ce composant.
- [ ] README ou infobulle explique ce qui est reset (liste des champs).

## Dépendances

- `config-manager.js` DEFAULTS, UI config, `api.php`.

## Notes techniques

- Si les defaults JS ne sont pas accessibles depuis le dock, dupliquer minimal en PHP est une dette : mieux vaut un petit `defaults.json` généré ou maintenu à la main synchronisé avec les defaults — décision d'architecture à documenter.
