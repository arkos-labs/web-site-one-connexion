# Migration vers les Requêtes Paginées - TODO

## Contexte

Les fonctions `getUserOrders` et `getInvoicesByUser` ont été optimisées pour supporter la pagination et la sélection explicite de champs. Pour maintenir la compatibilité avec le code existant, des versions "legacy" ont été créées.

## État Actuel

### ✅ Complété

1. **Optimisation de `supabaseQueries.ts`** :
   - ✅ Ajout du type `PaginatedResult<T>`
   - ✅ Ajout du type `OrderSummary` (champs essentiels uniquement)
   - ✅ Ajout du type `InvoiceSummary` (champs essentiels uniquement)
   - ✅ Création de `getUserOrders` paginée
   - ✅ Création de `getInvoicesByUser` paginée
   - ✅ Création de `getUserOrdersLegacy` pour rétrocompatibilité
   - ✅ Création de `getInvoicesByUserLegacy` pour rétrocompatibilité

2. **Mise à jour des imports** :
   - ✅ `src/pages/client/Orders.tsx` → utilise `getUserOrdersLegacy`
   - ✅ `src/pages/client/DashboardClient.tsx` → utilise `getUserOrdersLegacy`
   - ✅ `src/pages/client/Invoices.tsx` → utilise `getInvoicesByUserLegacy`

3. **Documentation** :
   - ✅ Création de `SUPABASE_QUERIES_OPTIMIZATION.md`
   - ✅ Création de `MIGRATION_TODO.md` (ce fichier)

## 📋 Tâches à Faire

### Priorité 1 : Migration des Composants Existants

#### 1. Migrer `src/pages/client/Orders.tsx`
- [ ] Ajouter un état pour la pagination (currentPage, itemsPerPage)
- [ ] Remplacer `getUserOrdersLegacy` par `getUserOrders`
- [ ] Mettre à jour le type de `orders` de `OrderWithDriver[]` à `PaginatedResult<OrderSummary>`
- [ ] Ajouter des contrôles de pagination (boutons Précédent/Suivant)
- [ ] Afficher le nombre total de commandes et le numéro de page
- [ ] **Note** : Vérifier si tous les champs utilisés sont dans `OrderSummary`. Si non, soit :
  - Ajouter les champs manquants à la sélection dans `getUserOrders`
  - Ou utiliser `getOrderById` pour les détails complets

#### 2. Migrer `src/pages/client/DashboardClient.tsx`
- [ ] Ajouter un état pour la pagination
- [ ] Remplacer `getUserOrdersLegacy` par `getUserOrders`
- [ ] Mettre à jour le type de `recentOrders`
- [ ] Limiter à 5 commandes (page 1, limit 5)
- [ ] **Note** : Ce composant affiche seulement les 5 dernières commandes, donc la pagination complète n'est pas nécessaire

#### 3. Migrer `src/pages/client/Invoices.tsx`
- [ ] Ajouter un état pour la pagination (currentPage, itemsPerPage)
- [ ] Remplacer `getInvoicesByUserLegacy` par `getInvoicesByUser`
- [ ] Mettre à jour le type de `invoices` de `Invoice[]` à `PaginatedResult<InvoiceSummary>`
- [ ] Ajouter des contrôles de pagination
- [ ] Afficher le nombre total de factures
- [ ] **Note** : Vérifier que `amount_ttc` est bien dans `InvoiceSummary` (actuellement il y a `amount`)

### Priorité 2 : Améliorations de l'Interface

#### 4. Créer un Composant de Pagination Réutilisable
- [ ] Créer `src/components/ui/pagination.tsx`
- [ ] Props : `currentPage`, `totalPages`, `onPageChange`
- [ ] Afficher : Précédent, numéros de pages, Suivant
- [ ] Style cohérent avec le design system

#### 5. Ajouter des Contrôles de Limite par Page
- [ ] Permettre à l'utilisateur de choisir : 10, 20, 50, 100 items par page
- [ ] Sauvegarder la préférence dans localStorage

### Priorité 3 : Optimisations Supplémentaires

#### 6. Améliorer `OrderSummary` et `InvoiceSummary`
- [ ] Vérifier que tous les champs nécessaires sont présents
- [ ] Pour `InvoiceSummary` : ajouter `amount_ttc` si nécessaire
- [ ] Pour `OrderSummary` : ajouter `reference`, `price`, `delivery_type` si nécessaire
- [ ] Ou créer des types séparés pour différents cas d'usage

#### 7. Ajouter des Index de Base de Données
- [ ] Créer un index sur `orders.client_id` pour optimiser les requêtes
- [ ] Créer un index sur `orders.created_at` pour le tri
- [ ] Créer un index sur `invoices.client_id`
- [ ] Créer un index sur `invoices.created_at`

#### 8. Implémenter le Cache Côté Client
- [ ] Utiliser React Query ou SWR pour le cache
- [ ] Invalider le cache lors des mutations
- [ ] Précharger la page suivante

### Priorité 4 : Tests et Validation

#### 9. Tests
- [ ] Tester avec 0 commandes
- [ ] Tester avec 1-10 commandes
- [ ] Tester avec 100+ commandes
- [ ] Tester la navigation entre les pages
- [ ] Tester les filtres combinés avec la pagination

#### 10. Performance
- [ ] Mesurer le temps de chargement avant/après
- [ ] Vérifier la taille des réponses réseau
- [ ] Optimiser les re-renders inutiles

## 🔧 Exemple de Migration

### Avant (Legacy)
```typescript
const [orders, setOrders] = useState<OrderWithDriver[]>([]);

const loadOrders = async () => {
  const data = await getUserOrders(clientId);
  setOrders(data);
};
```

### Après (Paginé)
```typescript
const [ordersResult, setOrdersResult] = useState<PaginatedResult<OrderSummary> | null>(null);
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(10);

const loadOrders = async () => {
  const data = await getUserOrders(clientId, currentPage, itemsPerPage);
  setOrdersResult(data);
};

// Dans le JSX
{ordersResult && (
  <>
    <div>Page {ordersResult.page} sur {ordersResult.totalPages}</div>
    <div>Total : {ordersResult.count} commandes</div>
    {ordersResult.data.map(order => ...)}
  </>
)}
```

## 📊 Gains Attendus

### Performance
- **Réduction de 90-99%** de la quantité de données transférées
- **Temps de chargement** divisé par 5-10 pour les gros historiques
- **Utilisation mémoire** réduite côté client

### Expérience Utilisateur
- Chargement quasi-instantané même avec des milliers de commandes
- Navigation fluide entre les pages
- Possibilité d'afficher plus d'informations par page si nécessaire

## 🚨 Points d'Attention

1. **Champs Manquants** : Vérifier que tous les champs utilisés dans l'UI sont bien sélectionnés
2. **Filtres** : Les filtres côté client ne fonctionneront que sur la page actuelle. Envisager de déplacer les filtres côté serveur
3. **Realtime** : Vérifier que les subscriptions Realtime fonctionnent toujours correctement avec la pagination
4. **Recherche** : La recherche actuelle ne fonctionne que sur les données chargées. Implémenter une recherche côté serveur si nécessaire

## 📅 Planning Suggéré

- **Semaine 1** : Migrer `DashboardClient.tsx` (le plus simple)
- **Semaine 2** : Créer le composant de pagination réutilisable
- **Semaine 3** : Migrer `Orders.tsx` et `Invoices.tsx`
- **Semaine 4** : Tests, optimisations, et nettoyage des fonctions legacy

## 🗑️ Nettoyage Final

Une fois toutes les migrations terminées :
- [ ] Supprimer `getUserOrdersLegacy`
- [ ] Supprimer `getInvoicesByUserLegacy`
- [ ] Mettre à jour la documentation
- [ ] Archiver ce fichier TODO
