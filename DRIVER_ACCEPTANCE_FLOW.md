# Flux d'acceptation de course par le chauffeur

## Problème résolu
Quand le chauffeur accepte une course sur son application mobile, l'admin doit voir cette acceptation en temps réel dans le Dispatch.

## Solution implémentée

### 1. **Nouveau statut : `driver_accepted`**
- Ajouté à la contrainte SQL de la table `orders`
- Ajouté aux types TypeScript (`OrderStatus`, `OrderEventType`)
- Ajouté aux constantes avec label "Chauffeur a accepté" et couleur teal

### 2. **Service d'acceptation côté chauffeur** (`driverOrderActions.ts`)
Fonction `acceptOrderByDriver(orderId, driverId)` qui :
- ✅ Met à jour le statut de la commande à `'driver_accepted'`
- ✅ Met à jour le statut du chauffeur à `'busy'` (CRITIQUE pour l'affichage dans Dispatch)
- ✅ Crée un événement dans l'historique

### 3. **Mise à jour du Dispatch** (`Dispatch.tsx`)
- ✅ Écoute en temps réel les changements de statut `driver_accepted`
- ✅ Affiche les courses acceptées avec un badge TEAL "ACCEPTÉE"
- ✅ Affiche le chauffeur comme "En Course" avec fond teal quand il accepte
- ✅ Récupère les courses avec statut `driver_accepted` dans `fetchActiveDeliveries`

### 4. **Dashboard chauffeur** (`driver/Dashboard.tsx`)
Page où le chauffeur peut :
- Voir ses courses assignées en temps réel
- Accepter une course (bouton vert "Accepter la course")
- Démarrer la livraison
- Marquer comme livrée
- Ouvrir l'itinéraire dans Google Maps

## Flux complet

1. **Admin assigne une course** (Dispatch)
   - Statut: `pending_acceptance` → `dispatched`
   - Chauffeur: `online` → `busy`
   - Le chauffeur reçoit une notification

2. **Chauffeur accepte** (App mobile)
   - Statut: `dispatched` → `driver_accepted`
   - Chauffeur: reste `busy`
   - ✅ **L'admin voit instantanément** le badge "ACCEPTÉE" en teal

3. **Chauffeur démarre**
   - Statut: `driver_accepted` → `in_progress`

4. **Chauffeur termine**
   - Statut: `in_progress` → `delivered`
   - Chauffeur: `busy` → `online`

## Clés importantes

### Dans la table `orders`
- `driver_id` = `user_id` du chauffeur (Auth ID)

### Dans la table `drivers`
- `user_id` = Auth ID (utilisé pour les requêtes)
- `id` = UUID (clé primaire)

### Dans `activeDeliveries` (Dispatch)
On utilise **les deux clés** pour la compatibilité :
```typescript
setActiveDeliveries(prev => ({
    ...prev,
    [driver.user_id]: order,  // Auth ID
    [driver.id]: order        // UUID
}));
```

## Vérifications

Pour que l'admin voie l'acceptation, il faut :
1. ✅ Le statut de la commande passe à `driver_accepted`
2. ✅ Le statut du chauffeur est `busy`
3. ✅ Le Realtime est activé sur la table `orders`
4. ✅ Le Dispatch écoute les changements avec `driver_accepted` dans la liste des statuts actifs
