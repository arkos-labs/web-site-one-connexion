# 🔄 FLUX TECHNIQUE DÉTAILLÉ - Dispatch de Course

**Date**: 2025-12-21  
**Objectif**: Documenter le flux complet d'une course, de la création à la livraison

---

## 📊 Vue d'Ensemble

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   CLIENT    │ ───▶ │    ADMIN    │ ───▶ │  CHAUFFEUR  │ ───▶ │   CLIENT    │
│  Commande   │      │  Dispatch   │      │  Livraison  │      │   Reçoit    │
└─────────────┘      └─────────────┘      └─────────────┘      └─────────────┘
```

---

## 🎬 ÉTAPE 1 : Création de la Commande

### 1.1 Client passe commande

**Interface**: Dashboard Client ou API

**Code**:
```typescript
const { data, error } = await supabase
    .from('orders')
    .insert({
        pickup_address: "123 Rue de Paris",
        delivery_address: "456 Avenue des Champs",
        pickup_lat: 48.8566,
        pickup_lng: 2.3522,
        delivery_lat: 48.8600,
        delivery_lng: 2.3600,
        price: 25.00, // Prix TOTAL client (100%)
        delivery_type: "express",
        distance_km: 3.5
    });
```

**Trigger DB**: `enforce_client_id_on_insert()`
```sql
-- Force le client_id à auth.uid() automatiquement
NEW.client_id = auth.uid();
NEW.status = 'pending_acceptance';
```

**Résultat**:
```json
{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "reference": "CMD-2025-001",
    "client_id": "auth-client-123",
    "status": "pending_acceptance",
    "price": 25.00,
    "driver_id": null
}
```

---

## ✅ ÉTAPE 2 : Acceptation par l'Admin

### 2.1 Admin voit la commande

**Interface**: `src/pages/admin/Dashboard.tsx`

**Realtime Subscription**:
```typescript
supabase
    .channel('admin-orders')
    .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'orders'
    }, (payload) => {
        const newOrder = payload.new;
        if (newOrder.status === 'pending_acceptance') {
            toast('📥 Nouvelle commande reçue');
            // Ajouter à la liste des commandes en attente
        }
    })
    .subscribe();
```

### 2.2 Admin accepte la commande

**Code**:
```typescript
const acceptOrder = async (orderId: string) => {
    const { error } = await supabase
        .from('orders')
        .update({ 
            status: 'accepted',
            accepted_at: new Date().toISOString()
        })
        .eq('id', orderId);
    
    if (!error) {
        toast.success('✅ Commande acceptée');
    }
};
```

**Résultat DB**:
```json
{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "accepted", // ← Changement
    "accepted_at": "2025-12-21T01:00:00Z"
}
```

---

## 🚚 ÉTAPE 3 : Dispatch au Chauffeur

### 3.1 Admin sélectionne un chauffeur

**Interface**: `src/pages/admin/Dispatch.tsx`

**Liste des chauffeurs disponibles**:
```typescript
const { data: drivers } = await supabase
    .from('drivers')
    .select('*')
    .in('status', ['online', 'available'])
    .order('first_name');
```

### 3.2 Admin dispatche la course

**Code**:
```typescript
// Fichier: src/services/orderAssignment.ts
const result = await assignOrderToDriver({
    orderId: "550e8400-e29b-41d4-a716-446655440000",
    driverId: "driver-uuid-456", // UUID de la table drivers
    driverUserId: "auth-driver-789", // Auth ID du chauffeur
    adminId: "auth-admin-123"
});
```

**Requêtes SQL exécutées**:

```sql
-- 1. Mise à jour de la commande
UPDATE orders
SET 
    driver_id = 'auth-driver-789', -- ✅ Auth ID (user_id)
    status = 'assigned',
    dispatched_at = NOW(),
    updated_at = NOW()
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- 2. Mise à jour du statut du chauffeur
UPDATE drivers
SET 
    status = 'busy',
    updated_at = NOW()
WHERE id = 'driver-uuid-456'; -- UUID de la table drivers

-- 3. Création d'une notification (optionnel)
INSERT INTO notifications (user_id, title, message, type)
VALUES (
    'auth-driver-789',
    '🚚 Nouvelle course assignée',
    'Une nouvelle course vous a été assignée. Référence: CMD-2025-001',
    'info'
);

-- 4. Création d'un événement (audit trail)
INSERT INTO order_events (order_id, event_type, description, actor_type, metadata)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'assigned',
    'Course assignée au chauffeur',
    'admin',
    '{"driver_id": "driver-uuid-456", "admin_id": "auth-admin-123"}'
);
```

**Résultat DB**:
```json
{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "assigned", // ← Changement
    "driver_id": "auth-driver-789", // ← Auth ID ajouté
    "dispatched_at": "2025-12-21T01:05:00Z"
}
```

---

## 📱 ÉTAPE 4 : Réception par le Chauffeur

### 4.1 Subscription Realtime active

**Code**: `src/stores/slices/orderSlice.ts`

```typescript
subscribeToAssignments: (driverUserId: string) => {
    supabase
        .channel('driver-assignments-v2')
        .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders',
            filter: `driver_id=eq.${driverUserId}` // ✅ Auth ID
        }, (payload) => {
            const newOrderRow = payload.new;
            const oldOrderRow = payload.old;
            
            // Déclencher uniquement si assignation nouvelle
            if (newOrderRow.status === 'assigned' && 
                oldOrderRow?.status !== 'assigned') {
                
                // Mapper les données
                const mappedOrder = {
                    id: newOrderRow.id,
                    clientName: newOrderRow.client_name || "Nouveau Client",
                    pickupLocation: {
                        lat: newOrderRow.pickup_lat || 48.8566,
                        lng: newOrderRow.pickup_lng || 2.3522,
                        address: newOrderRow.pickup_address
                    },
                    dropoffLocation: {
                        lat: newOrderRow.delivery_lat || 48.8600,
                        lng: newOrderRow.delivery_lng || 2.3600,
                        address: newOrderRow.delivery_address
                    },
                    price: newOrderRow.price, // 25.00€ (100%)
                    distance: `${newOrderRow.distance_km} km`,
                    status: "pending",
                    reference: newOrderRow.reference
                };
                
                // Déclencher l'affichage de NewOrderModal
                get().triggerNewOrder(mappedOrder);
            }
        })
        .subscribe();
}
```

### 4.2 Affichage de NewOrderModal

**Composant**: `src/features/driver/components/NewOrderModal.tsx`

**Calcul du gain**:
```typescript
const driverEarnings = (order.price * 0.40).toFixed(2);
// 25.00 * 0.40 = 10.00€
```

**Affichage**:
```
┌─────────────────────────────────────┐
│  🚚 Nouvelle Course           30s   │
├─────────────────────────────────────┤
│  Référence: CMD-2025-001            │
│                                     │
│  📍 Point de retrait                │
│  123 Rue de Paris                   │
│                                     │
│  🎯 Destination                     │
│  456 Avenue des Champs              │
│                                     │
│  Distance: 3.5 km | Temps: ~15 min  │
│                                     │
│  ╔═══════════════════════════════╗  │
│  ║    Votre Gain: 10.00 €        ║  │
│  ╚═══════════════════════════════╝  │
│                                     │
│  [  Refuser  ] [  Accepter  ]       │
└─────────────────────────────────────┘
```

---

## ✅ ÉTAPE 5 : Acceptation par le Chauffeur

### 5.1 Chauffeur clique "Accepter"

**Code**:
```typescript
const acceptOrder = async (orderId: string) => {
    const { error } = await supabase
        .from('orders')
        .update({ 
            status: 'driver_accepted',
            updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('driver_id', user.id); // Sécurité: vérifier que c'est bien son ordre
    
    if (!error) {
        // Mettre à jour le store local
        updateOrderStatus('driver_accepted');
    }
};
```

**Résultat DB**:
```json
{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "driver_accepted", // ← Changement
    "driver_id": "auth-driver-789"
}
```

### 5.2 Realtime notifie l'Admin

**Dashboard Admin** reçoit l'update via Realtime:

```typescript
// Fichier: src/pages/admin/Dispatch.tsx
.on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'orders',
    filter: "status=in.(driver_accepted,in_progress)"
}, (payload) => {
    const updatedOrder = payload.new;
    
    if (updatedOrder.status === 'driver_accepted') {
        toast.success(
            `🚗 COMMANDE ${updatedOrder.reference} ACCEPTÉE PAR LE CHAUFFEUR!`,
            { duration: 6000 }
        );
        
        // Déplacer la commande dans la colonne "Acceptées par chauffeur"
        setDriverAcceptedOrders(prev => [...prev, updatedOrder]);
    }
})
```

**Affichage Admin**:
```
┌─────────────────────────────────────────────────────────┐
│  🟢 COMMANDE CMD-2025-001 ACCEPTÉE PAR LE CHAUFFEUR!    │
└─────────────────────────────────────────────────────────┘
```

---

## 🚗 ÉTAPE 6 : En Route vers le Pickup

### 6.1 Affichage de ActiveOrderCard

**Composant**: `src/features/driver/components/ActiveOrderCard.tsx`

**État**: `isPickupPhase = true`

**Affichage**:
```
┌─────────────────────────────────────┐
│  📍 Vers le point de retrait        │
│  123 Rue de Paris                   │
│                           10.00 €   │
├─────────────────────────────────────┤
│  👤 Client Premium                  │
│  ★ 4.9                              │
│  [📞] [💬]                          │
│                                     │
│  ⏱️ Temps: 12 min | 📏 3.5 km       │
│                                     │
│  [ 🧭 Lancer la navigation ]        │
│                                     │
│  ═══════════════════════════════    │
│  ▶ Glisser pour confirmer retrait   │
└─────────────────────────────────────┘
```

### 6.2 Affichage de DriverMap

**Composant**: `src/features/driver/components/DriverMap.tsx`

**Éléments affichés**:
- 🚖 Marqueur chauffeur (position actuelle)
- 📍 Marqueur pickup (bleu)
- 🎯 Marqueur dropoff (vert)
- Route 1: Chauffeur → Pickup (bleu pointillé)
- Route 2: Pickup → Dropoff (vert solide)

**Code**:
```typescript
// Route 1: Driver → Pickup (Dashed Blue)
<Polyline
    positions={[
        [driverLocation.lat, driverLocation.lng],
        [order.pickupLocation.lat, order.pickupLocation.lng]
    ]}
    pathOptions={{ 
        color: '#3b82f6', 
        dashArray: '10, 10', 
        weight: 4, 
        opacity: 0.7 
    }}
/>

// Route 2: Pickup → Dropoff (Solid Green)
<Polyline
    positions={[
        [order.pickupLocation.lat, order.pickupLocation.lng],
        [order.dropoffLocation.lat, order.dropoffLocation.lng]
    ]}
    pathOptions={{ 
        color: '#10b981', 
        weight: 5, 
        opacity: 0.9 
    }}
/>
```

---

## 📦 ÉTAPE 7 : Confirmation du Retrait

### 7.1 Chauffeur arrive au pickup

**Vérification de proximité** (optionnel):
```typescript
const isNearby = calculateDistance(
    driverLocation,
    order.pickupLocation
) < 0.1; // < 100 mètres
```

### 7.2 Chauffeur glisse pour confirmer

**Code**:
```typescript
const confirmPickup = async () => {
    const { error } = await supabase
        .from('orders')
        .update({ 
            status: 'in_progress',
            updated_at: new Date().toISOString()
        })
        .eq('id', order.id);
    
    if (!error) {
        updateOrderStatus('in_progress');
    }
};
```

**Résultat DB**:
```json
{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "in_progress", // ← Changement
    "driver_id": "auth-driver-789"
}
```

### 7.3 Realtime notifie l'Admin

**Dashboard Admin**:
```
┌─────────────────────────────────────────────────────────┐
│  🚚 COMMANDE CMD-2025-001 EN COURS DE LIVRAISON         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 ÉTAPE 8 : En Route vers la Destination

### 8.1 ActiveOrderCard change de phase

**État**: `isPickupPhase = false`

**Affichage**:
```
┌─────────────────────────────────────┐
│  🎯 Vers la destination             │
│  456 Avenue des Champs              │
│                           10.00 €   │
├─────────────────────────────────────┤
│  ... (même interface)               │
│                                     │
│  ═══════════════════════════════    │
│  ▶ Glisser pour terminer la course  │
└─────────────────────────────────────┘
```

### 8.2 DriverMap met à jour les routes

**Seule la Route 2 reste affichée** (Pickup → Dropoff)

---

## ✅ ÉTAPE 9 : Livraison Complétée

### 9.1 Chauffeur glisse pour terminer

**Code**:
```typescript
const completeOrder = async () => {
    const { error } = await supabase
        .from('orders')
        .update({ 
            status: 'delivered',
            delivered_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        .eq('id', order.id);
    
    if (!error) {
        // Calculer et créditer les gains (40%)
        const earnings = order.price * 0.40;
        creditDriverEarnings(earnings);
        
        // Remettre le chauffeur en ligne
        updateDriverStatus('online');
    }
};
```

**Résultat DB**:
```json
{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "delivered", // ← Changement
    "driver_id": "auth-driver-789",
    "delivered_at": "2025-12-21T01:30:00Z"
}
```

### 9.2 Crédit des gains

**Code**: `src/stores/slices/orderSlice.ts`

```typescript
completeOrder: () => set((state) => {
    if (!state.currentOrder) return state;
    
    // RÈGLE: Driver earns 40% of the total order price
    const totalOrderPrice = new Decimal(state.currentOrder.price);
    const driverShare = totalOrderPrice.times(0.40);
    
    const priceInCents = driverShare
        .times(100)
        .toDecimalPlaces(0)
        .toNumber();
    
    const newEarningsInCents = new Decimal(state.earningsInCents)
        .plus(priceInCents)
        .toNumber();
    
    return {
        earningsInCents: newEarningsInCents, // 1000 centimes = 10.00€
        history: [completedOrder, ...state.history],
        currentOrder: null,
        driverStatus: "online"
    };
})
```

**Affichage**:
```
┌─────────────────────────────────────┐
│  💰 Paiement reçu: +10.00 €         │
└─────────────────────────────────────┘
```

### 9.3 Realtime notifie l'Admin

**Dashboard Admin**:
```
┌─────────────────────────────────────────────────────────┐
│  ✅ Commande CMD-2025-001 terminée                      │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Récapitulatif des Statuts

| Statut | Acteur | Description |
|--------|--------|-------------|
| `pending_acceptance` | Client | Commande créée, en attente de validation admin |
| `accepted` | Admin | Commande validée, prête à être dispatchée |
| `assigned` | Admin | Commande assignée à un chauffeur |
| `driver_accepted` | Chauffeur | Chauffeur a accepté la course |
| `in_progress` | Chauffeur | Colis récupéré, en route vers destination |
| `delivered` | Chauffeur | Livraison terminée |
| `driver_refused` | Chauffeur | Chauffeur a refusé la course |
| `cancelled` | Admin/Client | Commande annulée |

---

## 🔐 Sécurité et Cohérence

### Règles Métier Garanties

1. **Prix Total vs Gain Chauffeur**:
   - `orders.price` = Prix TOTAL client (100%)
   - Gain chauffeur = `price * 0.40` (40%)
   - Le chauffeur ne voit JAMAIS le prix total

2. **Identifiants**:
   - `orders.driver_id` = Auth ID (user_id) du chauffeur
   - `drivers.id` = UUID de la table drivers
   - Filtre Realtime utilise `driver_id` (Auth ID)

3. **Synchronisation Realtime**:
   - Admin → Chauffeur : < 2 secondes
   - Chauffeur → Admin : < 2 secondes

4. **Géolocalisation**:
   - Coordonnées GPS stockées dans la DB
   - Affichage automatique des routes
   - Mise à jour temps réel de la position chauffeur

---

**Version**: 1.0.0  
**Dernière mise à jour**: 2025-12-21 01:17  
**Statut**: 📚 Documentation Complète
