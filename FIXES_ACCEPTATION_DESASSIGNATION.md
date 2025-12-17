# Corrections - Acceptation et désassignation de courses

## Problèmes identifiés et résolus

### 1. ❌ **L'admin ne voit pas clairement que le chauffeur a accepté**

**Problème** : Le badge montrait seulement "En Course" sans distinction entre "assigné" et "accepté par le chauffeur".

**Solution** :
- ✅ Badge **"✓ Acceptée"** en couleur **TEAL** quand `status === 'driver_accepted'`
- ✅ Texte supplémentaire "Chauffeur prêt" pour clarifier
- ✅ Avatar du chauffeur en couleur teal quand il a accepté
- ✅ Carte de la course en fond teal avec icône checkmark

**Fichier modifié** : `src/pages/admin/Dispatch.tsx`

### 2. ❌ **Quand l'admin retire la course, le chauffeur la garde**

**Problème** : Le chauffeur continuait à voir la course dans son app même après que l'admin l'ait retirée.

**Causes** :
1. La fonction `unassignOrder` ne vérifiait pas les statuts `'dispatched'` et `'driver_accepted'`
2. Le dashboard chauffeur n'écoutait pas les changements quand `driver_id` devient `null`

**Solutions** :

#### A. Service de désassignation (`orderAssignment.ts`)
```typescript
// AVANT
.in('status', ['assigned', 'in_progress'])

// APRÈS
.in('status', ['assigned', 'dispatched', 'driver_accepted', 'in_progress'])
```

#### B. Dashboard chauffeur (`driver/Dashboard.tsx`)
- ✅ Ajout d'un second canal Realtime pour détecter les désassignations
- ✅ Écoute les UPDATE où `driver_id` passe de `driverId` à `null`
- ✅ Notification toast "Une course vous a été retirée"
- ✅ Rafraîchissement automatique de la liste

## Affichage dans le Dispatch

### États visuels du chauffeur

| Statut | Badge | Couleur Avatar | Indication |
|--------|-------|----------------|------------|
| Disponible | "Disponible" | Vert | Prêt pour une nouvelle course |
| Course assignée | "En Course" | Bleu | Course assignée mais pas encore acceptée |
| **Course acceptée** | **"✓ Acceptée"** | **Teal** | **Chauffeur a confirmé + "Chauffeur prêt"** |
| En livraison | "En Course" | Bleu | Livraison en cours |

### Détails de la course

Quand le chauffeur a accepté :
- 🎨 Fond **teal** au lieu de blanc
- ✅ Icône **CheckCircle** au lieu de Package
- 📝 Texte **"ACCEPTÉE"** en gras
- 🔵 Bordure teal

## Flux complet mis à jour

1. **Admin assigne** → Statut: `dispatched`, Chauffeur: `busy`, Badge: "En Course" (bleu)
2. **Chauffeur accepte** → Statut: `driver_accepted`, Badge: **"✓ Acceptée" (teal)** ✨
3. **Chauffeur démarre** → Statut: `in_progress`, Badge: "En Course" (bleu)
4. **Chauffeur termine** → Statut: `delivered`, Chauffeur: `online`

### Si l'admin retire la course

À n'importe quel moment (dispatched, driver_accepted, in_progress) :
- ✅ La course est retirée de la liste du chauffeur **instantanément**
- ✅ Le chauffeur reçoit une notification "Une course vous a été retirée"
- ✅ Le statut du chauffeur repasse à `online` s'il n'a plus d'autres courses

## Fichiers modifiés

1. **`src/services/orderAssignment.ts`**
   - Fonction `unassignOrder` : ajout de `'dispatched'` et `'driver_accepted'` dans la vérification

2. **`src/pages/admin/Dispatch.tsx`**
   - Badge conditionnel avec couleur teal pour `driver_accepted`
   - Avatar avec couleur teal
   - Texte "Chauffeur prêt"
   - Carte de course avec fond teal

3. **`src/pages/driver/Dashboard.tsx`**
   - Double canal Realtime (assigned + unassigned)
   - Détection des désassignations
   - Toast de notification

4. **`src/services/driverOrderActions.ts`**
   - Mise à jour du statut chauffeur à `'busy'` lors de l'acceptation

## Tests à effectuer

- [ ] Admin assigne une course → Chauffeur la voit avec badge "Nouvelle" (orange)
- [ ] Chauffeur accepte → Admin voit badge **"✓ Acceptée"** en **teal** + "Chauffeur prêt"
- [ ] Admin retire la course → Chauffeur ne la voit plus + reçoit notification
- [ ] Chauffeur démarre → Badge passe à "En Course" (bleu)
- [ ] Chauffeur termine → Chauffeur repasse "Disponible" (vert)
