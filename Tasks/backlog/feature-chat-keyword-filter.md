# Filtrage du chat par mots-clés (liste noire / liste blanche)

- Status: Backlog
- Priorité: 🟢 Basse
- Complexité: M
- Tags: chat, moderation, config, overlay

## Description

Le chat overlay affiche les messages tels qu’ils arrivent (sous réserve des règles Twitch côté plateforme). Pour réduire le **spam**, les **mots déclencheurs indésirables** ou certaines **commandes répétées**, on peut offrir un filtre **côté overlay** configurable : liste de sous-chaînes interdites (insensible à la casse optionnelle) ou mode « n’afficher que les messages contenant X » (liste blanche) pour des usages très spécifiques.

Important : ce filtre **ne remplace pas** la modération Twitch ; il améliore seulement le confort visuel. Il doit être **désactivable** et limité en taille de listes pour éviter une recherche O(n×m) trop lourde à chaque message.

## Objectifs

- Ajouter dans `config.json` (section `chat`) les options : `filterMode: off | blacklist | whitelist`, tableaux de chaînes, options `caseInsensitive`, `matchWholeWord` si pertinent.
- Implémenter le filtre dans `chat.js` sur le chemin WebSocket et le chemin polling, avant rendu DOM.
- Journaliser en `Log.debug` le nombre de messages filtrés si `?debug=1`, sans spam en production.

## Critères d'acceptation

- [ ] Désactivé par défaut ; aucun changement de comportement sans config explicite.
- [ ] Pas d’exécution de regex arbitraires depuis JSON non validés (risque ReDoS) — préférer listes de chaînes ou regex **whitelistées** très limitées si absolument nécessaire.
- [ ] Le message affiché reste entièrement échappé comme aujourd’hui.
- [ ] Performance : pas de freeze sur rafales de messages avec listes de taille raisonnable (ex. < 50 entrées).

## Dépendances

- `overlay/components/chat.js`, `config-manager.js`.

## Notes techniques

- Normaliser Unicode / accents si besoin (complexité vs valeur) ; documenter les limites.
