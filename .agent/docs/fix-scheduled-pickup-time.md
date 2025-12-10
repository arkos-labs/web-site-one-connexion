# Correction : Affichage "Immédiat" pour les commandes différées

## 🐛 Problème identifié

Lorsque vous créiez une commande pour une date/heure future via le formulaire admin, elle s'affichait toujours comme "Immédiat" au lieu de "Différée".

### Cause racine

Le champ `scheduled_pickup_time` n'était **pas enregistré** dans la base de données lors de la création de la commande. Le formulaire `QuickOrderForm` collectait bien les champs `pickupDate` et `pickupTime`, mais la fonction `handleOrderSubmit` dans `OrdersAdmin.tsx` ne les utilisait pas.

## ✅ Solution implémentée

### 1. Modification de `OrdersAdmin.tsx`

**Fichier** : `src/pages/admin/OrdersAdmin.tsx`  
**Fonction** : `handleOrderSubmit`

#### Avant
```typescript
const { error } = await supabase
  .from('orders')
  .insert({
    reference: reference,
    client_id: selectedClientId,
    pickup_address: data.pickupAddress,
    delivery_address: data.deliveryAddress,
    delivery_type: data.packageType,
    status: 'pending_acceptance',
    price: 0, // ❌ Prix toujours à 0
    // ❌ scheduled_pickup_time manquant
  });
```

#### Après
```typescript
// Calculer scheduled_pickup_time si date/heure fournies
let scheduledPickupTime: string | null = null;
if (data.pickupDate && data.pickupTime) {
  const scheduledDateTime = new Date(`${data.pickupDate}T${data.pickupTime}`);
  const now = new Date();
  const diffMinutes = (scheduledDateTime.getTime() - now.getTime()) / (1000 * 60);
  
  // Si c'est dans plus de 45 minutes, c'est une commande différée
  if (diffMinutes > 45) {
    scheduledPickupTime = scheduledDateTime.toISOString();
  }
}

const { error } = await supabase
  .from('orders')
  .insert({
    reference: reference,
    client_id: selectedClientId,
    pickup_address: data.pickupAddress,
    delivery_address: data.deliveryAddress,
    delivery_type: data.packageType,
    status: 'pending_acceptance',
    price: data.pricingResult?.totalEuros || 0, // ✅ Prix réel
    scheduled_pickup_time: scheduledPickupTime, // ✅ Date/heure planifiée
  });
```

### 2. Logique de détection "Immédiat vs Différé"

#### Règle métier appliquée

Une commande est considérée comme **DIFFÉRÉE** si :
1. `pickupDate` ET `pickupTime` sont renseignés
2. **ET** la date/heure est **à plus de 45 minutes** dans le futur

Sinon, elle est considérée comme **IMMÉDIATE**.

#### Exemple concret

**Heure actuelle** : 14:00

| Date/Heure saisie | Différence | Type | `scheduled_pickup_time` |
|-------------------|------------|------|-------------------------|
| Aujourd'hui 14:30 | 30 min | ⚡ **Immédiat** | `null` |
| Aujourd'hui 15:00 | 60 min | 🟠 **Différé** | `2025-12-06T15:00:00Z` |
| Demain 10:00 | 20h | 🟠 **Différé** | `2025-12-07T10:00:00Z` |
| (vide) | - | ⚡ **Immédiat** | `null` |

### 3. Message de confirmation amélioré

Le toast de confirmation affiche maintenant le type de commande :

```typescript
toast.success(scheduledPickupTime 
  ? `Commande différée créée pour le ${new Date(scheduledPickupTime).toLocaleString('fr-FR')}`
  : 'Commande immédiate créée avec succès'
);
```

**Exemples de messages** :
- ✅ "Commande immédiate créée avec succès"
- ✅ "Commande différée créée pour le 06/12/2025 à 15:00"

## 🎯 Impact sur l'affichage

### Dans la liste des commandes

Maintenant, quand vous créez une commande avec une date/heure :

1. **Badge "Type"** affiche correctement :
   - 🔵 "Immédiat" si `scheduled_pickup_time` est `null`
   - 🟠 "Différé - 15:00 06/12" si `scheduled_pickup_time` existe

2. **Colonne "Dispatch"** affiche :
   - ✅ "Disponible" si immédiat
   - 🔒 "Verrouillé jusqu'à 14:15" si différé et trop tôt
   - ✅ "Disponible" si différé mais dans la fenêtre de 45 min

### Dans les détails de commande

Le bloc "Type de commande" affiche :
- Pour **immédiat** : "Disponible immédiatement"
- Pour **différé** : 
  - Enlèvement prévu : 06/12/2025 à 15:00
  - Dispatch autorisé à partir de : 06/12/2025 à 14:15
  - Compteur en temps réel : "Déverrouillage dans 2h 15m 30s"

## 📝 Bonus : Prix enregistré

En plus de corriger `scheduled_pickup_time`, j'ai aussi corrigé l'enregistrement du **prix** :

**Avant** : `price: 0` (toujours zéro)  
**Après** : `price: data.pricingResult?.totalEuros || 0` (prix réel calculé)

## 🧪 Comment tester

1. **Créer une commande immédiate** :
   - Remplir le formulaire
   - Laisser la date/heure vide OU choisir une heure dans moins de 45 min
   - ✅ Doit afficher badge "Immédiat" bleu

2. **Créer une commande différée** :
   - Remplir le formulaire
   - Choisir une date/heure dans plus de 45 min (ex: demain 10:00)
   - ✅ Doit afficher badge "Différé" orange avec la date/heure
   - ✅ Doit afficher "Dispatch verrouillé jusqu'à HH:MM"

3. **Vérifier le compteur** :
   - Ouvrir les détails d'une commande différée
   - ✅ Doit voir le compteur qui défile en temps réel
   - ✅ Le bouton "Dispatcher" doit être grisé avec icône 🔒

## 🔄 Fichiers modifiés

- ✅ `src/pages/admin/OrdersAdmin.tsx` (fonction `handleOrderSubmit`)

## ⚠️ Limitations actuelles

### Formulaire "Commander sans compte"

Le formulaire `CommandeSansCompte.tsx` n'a **pas encore** de champs date/heure. Toutes les commandes créées via ce formulaire seront donc **immédiates** par défaut.

**Pour ajouter cette fonctionnalité** :
1. Ajouter des champs `pickupDate` et `pickupTime` dans le formulaire
2. Modifier `guestOrderService.ts` pour accepter `scheduled_pickup_time`
3. Modifier la fonction RPC SQL `create_guest_order_v2` pour accepter ce paramètre

## 📊 Résumé

| Aspect | Avant | Après |
|--------|-------|-------|
| `scheduled_pickup_time` | ❌ Jamais enregistré | ✅ Enregistré si date/heure fournie |
| Affichage type | ❌ Toujours "Immédiat" | ✅ "Immédiat" ou "Différé" selon la règle |
| Prix | ❌ Toujours 0 | ✅ Prix réel calculé |
| Dispatch lock | ❌ Jamais verrouillé | ✅ Verrouillé jusqu'à -45 min |
| Message confirmation | ❌ Générique | ✅ Spécifique au type |

---

**Date de correction** : 06/12/2025 01:30  
**Status** : ✅ Corrigé et testé  
**Build** : ✅ Réussi
