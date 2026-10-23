# Site de gestion des stocks de bières

Le but est de faire un site très simple à naviguer et s'intégrant très facilement avec la BDD

On doit pouvoir par exemple pouvoir avoir très rapidement accès aux nombre de bières en stock de chaque type, le type de bière ayant eu la dernière livraison, les fûts ouverts qui périment bientôt, le nombre de bières vendues par soirée & au total sur l'année, etc. On doit aussi pouvoir éditer très facilement les données, sans passer par trop de boutons "valider" et autres

## Données

Ceci est la représentation mentale rapide des données, et pas nécessairement comment la BDD doit implémenter ces données.

Bières :
- Nom
- Degré d'alcool
- Prix d'achat

(il faudrait supprimer la colonne prix de vente actuellement présente dans la DB, elle sera inutile)

Fûts :
- Nom
- Degré d'alcool
- Prix d'achat
- Statut du fût (fermé, ouvert, vidé)
- Si le fût est ouvert, date de péremption (3 semaines après ouverture)

Livraisons :
- Date
- Bières livrées
- Fûts livrés
- (Peut-être) fûts vides rendus

Zythos (soirées) :
- Date
- Nom (optionel)
- Bières sorties des stocks avant
- Bières rentrées dans les stocks après (donc non vendues à la soirée) 

## Visualisation

Pour la plupart des tables, capacité de cacher/montrer certaines colonnes par confort. Pour tous les tableaux, sauf mention contraire, les propriétés de chaque ligne provenant de la DB doivent être éditable (exemple : pour la liste des soirées, le nom et la date doivent être éditables, mais ça n'aurait pas de sens d'éditer le nombre de bières vendues car c'est un aggrégat)

Liste des types bières, pour chaque type :
- Possibilité d'éditer  (changer nom, alcool, prix d'achat)
- Nombre de bière du type actuellement en stock
- Date de dernière livraison

Page détail d'un type de bière :
- Historique des soirées, tableau éditable + graphe montrant les ventes théoriques (sorties stocks - rentrées stocks) au long des soirées
- Historique des livraisons, tableau éditable

Liste livraisons :
- Date
- Coût total théorique (fûts + bières)
- Total bières livrées
- Total fûts livrés

Détail livraison :
- Bar graph pour les types de bière livrées & quantités, + table pour l'édition des données
- Table pour les fûts livrés

Liste soirées :
- Tableau bières sorties + rentrées sur la soirée, avec bar graph montrant les bières non vendues et les bières vendues (le total devrait donc être les bières sorties au début)

Pour les fûts, à voir

## Tests

Les tests utilisent une base dédiée sur le même serveur que `DATABASE_URL`, suffixée par `_test` (ou `TEST_DATABASE_URL` si défini). Elle est créée et son schéma est poussé automatiquement, puis vidée avant chaque test.

- `npm test` : tests unitaires et requêtes de statistiques (vitest)
- `npm run test:e2e` : tests end-to-end dans un navigateur (Playwright, nécessite `npx playwright install chromium` une première fois). Ils lancent leur propre serveur de dev sur le port 5198, dans `.svelte-kit-e2e`, pour ne pas interférer avec un `npm run dev` en cours
