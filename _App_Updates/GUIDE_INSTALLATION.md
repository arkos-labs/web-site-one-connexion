# Mise à jour de l'Application Chauffeur (App V2)

Comme je n'ai pas pu modifier directement le dépôt de l'application (Droits en lecture seule), j'ai généré les fichiers mis à jour ici.

## Instructions

Veuillez copier manuellement ces 3 fichiers dans votre projet `one-connexion-app-v2` aux emplacements suivants :

### 1. Gestion des Commandes et Realtime
**Source:** `_App_Updates/orderSlice.ts`
**Destination:** `src/stores/slices/orderSlice.ts`
**Modifications:** Integration du Realtime Supabase + Règle des 40% sur les gains.

### 2. Affichage Carte Chauffeur
**Source:** `_App_Updates/ActiveOrderCard.tsx`
**Destination:** `src/features/driver/components/ActiveOrderCard.tsx`
**Modifications:** Design Premium + Affichage du prix "Net Chauffeur" (40%).

### 3. Carte GPS
**Source:** `_App_Updates/DriverMap.tsx`
**Destination:** `src/features/driver/components/DriverMap.tsx`
**Modifications:** Ajout des tracés (Polylines) entre Chauffeur -> Pickup -> Livraison.

---

## Note Importante sur `types.ts`

Veuillez également ajouter ces deux lignes dans `src/stores/types.ts` à l'interface `OrderSlice` :

```typescript
    subscribeToAssignments: (driverId: string) => void;
    unsubscribeFromAssignments: () => void;
```

Une fois ces fichiers copiés, l'application réagira instantanément aux clics "Dispatcher" du site web !
