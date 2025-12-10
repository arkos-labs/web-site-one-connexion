# Correction complète : Support des commandes différées pour les clients invités

## 🐛 Problème identifié

Les commandes créées via le formulaire **"Commander sans compte"** (`/commande-sans-compte`) affichaient toujours "Immédiat" même quand l'utilisateur choisissait un créneau horaire futur (ex: "13/12/2025 01:23").

### Cause racine

Le formulaire `CommandeSansCompte.tsx` collectait bien le créneau horaire dans `formData.scheduleTime`, mais :
1. Cette valeur n'était **pas transmise** à `createGuestOrder()`
2. La fonction `createGuestOrder()` ne **gérait pas** le champ `scheduleTime`
3. La fonction RPC SQL `create_guest_order_v2` ne **supportait pas** le paramètre `scheduled_pickup_time`

## ✅ Solution implémentée

### 1. Modification de `guestOrderService.ts`

**Fichier** : `src/services/guestOrderService.ts`

#### A. Interface `GuestOrderData`

Ajout du champ `scheduleTime` :

```typescript
export interface GuestOrderData {
    // ... autres champs
    
    // Horaire de prise en charge (optionnel)
    scheduleTime?: string; // Format: "2025-12-13T01:23"
    
    // ... autres champs
}
```

#### B. Fonction `createGuestOrder`

Ajout de la logique de calcul :

```typescript
export const createGuestOrder = async (orderData: GuestOrderData): Promise<GuestOrderResponse> => {
    try {
        console.log('🚀 Création commande invitée pour:', orderData.senderEmail);

        // ✅ NOUVEAU: Calculer scheduled_pickup_time si scheduleTime fourni
        let scheduledPickupTime: string | null = null;
        if (orderData.scheduleTime) {
            const scheduledDateTime = new Date(orderData.scheduleTime);
            const now = new Date();
            const diffMinutes = (scheduledDateTime.getTime() - now.getTime()) / (1000 * 60);
            
            console.log('⏰ Calcul créneau guest:', { 
                scheduleTime: orderData.scheduleTime, 
                diffMinutes, 
                isDeferred: diffMinutes > 45 
            });
            
            // Si c'est dans plus de 45 minutes, c'est une commande différée
            if (diffMinutes > 45) {
                scheduledPickupTime = scheduledDateTime.toISOString();
            }
        }

        // Appel RPC avec le nouveau paramètre
        const { data, error } = await supabase.rpc('create_guest_order_v2', {
            // ... autres paramètres
            
            // ✅ NOUVEAU: Horaire planifié
            p_scheduled_pickup_time: scheduledPickupTime,
        });
        
        // ...
    }
}
```

### 2. Modification de `CommandeSansCompte.tsx`

**Fichier** : `src/pages/CommandeSansCompte.tsx`

Transmission du `scheduleTime` à `createGuestOrder` :

```typescript
const response = await createGuestOrder({
    senderName: formData.senderName,
    senderEmail: formData.senderEmail,
    senderPhone: formData.senderPhone,
    // ... autres champs
    
    // ✅ NOUVEAU: Horaire planifié (si "Choisir un créneau" sélectionné)
    scheduleTime: formData.schedule === 'custom' ? formData.scheduleTime : undefined,
    
    billingInfo: { /* ... */ }
});
```

### 3. Migration SQL

**Fichier** : `sql/migrations/add_scheduled_pickup_to_guest_orders.sql`

Modification de la fonction RPC `create_guest_order_v2` pour accepter `p_scheduled_pickup_time` :

```sql
CREATE OR REPLACE FUNCTION create_guest_order_v2(
    -- ... paramètres existants
    p_scheduled_pickup_time TIMESTAMPTZ DEFAULT NULL  -- ✅ NOUVEAU
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order_id UUID;
    v_reference TEXT;
BEGIN
    -- Insérer la commande
    INSERT INTO orders (
        -- ... champs existants
        scheduled_pickup_time,  -- ✅ NOUVEAU
        -- ... autres champs
    ) VALUES (
        -- ... valeurs existantes
        p_scheduled_pickup_time,  -- ✅ NOUVEAU
        -- ... autres valeurs
    )
    RETURNING id INTO v_order_id;

    -- Créer un événement
    INSERT INTO order_events (
        order_id,
        event_type,
        description,
        metadata
    ) VALUES (
        v_order_id,
        'order_created',
        'Commande créée par un client invité',
        jsonb_build_object(
            'email', p_email_client,
            'is_guest', true,
            'scheduled', p_scheduled_pickup_time IS NOT NULL  -- ✅ NOUVEAU
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'order_id', v_order_id,
        'reference', v_reference,
        'message', 'Commande créée avec succès'
    );
END;
$$;
```

## 🎯 Règle métier appliquée

Une commande invitée est considérée comme **DIFFÉRÉE** si :
1. `scheduleTime` est fourni
2. **ET** la date/heure est **à plus de 45 minutes** dans le futur

Sinon, elle est considérée comme **IMMÉDIATE**.

### Exemples

**Heure actuelle** : 01:30

| Créneau choisi | Différence | Type | `scheduled_pickup_time` |
|----------------|------------|------|-------------------------|
| "Dès que possible" | - | ⚡ **Immédiat** | `null` |
| "Dans 1h" (02:30) | 60 min | 🟠 **Différé** | `2025-12-06T02:30:00Z` |
| "13/12/2025 01:23" | 7 jours | 🟠 **Différé** | `2025-12-13T01:23:00Z` |

## 📝 Comment appliquer la migration SQL

Vous devez exécuter le fichier SQL dans votre base de données Supabase :

### Option 1 : Via l'interface Supabase

1. Ouvrir Supabase Dashboard
2. Aller dans **SQL Editor**
3. Copier-coller le contenu de `sql/migrations/add_scheduled_pickup_to_guest_orders.sql`
4. Cliquer sur **Run**

### Option 2 : Via la CLI Supabase

```bash
supabase db push
```

## 🧪 Comment tester

1. **Aller sur** : `http://localhost:5173/commande-sans-compte`
2. **Remplir le formulaire**
3. **Choisir** : "Choisir un créneau"
4. **Sélectionner** : Une date/heure dans plus de 45 min (ex: demain 10:00)
5. **Soumettre** la commande
6. **Vérifier** dans l'admin :
   - ✅ Badge orange "Différé - 10:00 07/12"
   - ✅ Colonne Dispatch : "Verrouillé jusqu'à 09:15"
   - ✅ Bouton "Dispatcher" grisé avec icône 🔒

## 📊 Impact

### Avant

| Créneau choisi | Affichage | `scheduled_pickup_time` |
|----------------|-----------|-------------------------|
| Dès que possible | ⚡ Immédiat | `null` |
| Dans 1h | ⚡ Immédiat ❌ | `null` ❌ |
| 13/12/2025 01:23 | ⚡ Immédiat ❌ | `null` ❌ |

### Après

| Créneau choisi | Affichage | `scheduled_pickup_time` |
|----------------|-----------|-------------------------|
| Dès que possible | ⚡ Immédiat | `null` |
| Dans 1h | 🟠 Différé ✅ | `2025-12-06T02:30:00Z` ✅ |
| 13/12/2025 01:23 | 🟠 Différé ✅ | `2025-12-13T01:23:00Z` ✅ |

## 🔄 Fichiers modifiés

1. ✅ `src/services/guestOrderService.ts` (interface + logique)
2. ✅ `src/pages/CommandeSansCompte.tsx` (transmission du scheduleTime)
3. ✅ `sql/migrations/add_scheduled_pickup_to_guest_orders.sql` (fonction RPC)

## ⚠️ Action requise

**Vous devez exécuter la migration SQL** pour que les changements fonctionnent. Sans cela, la fonction RPC retournera une erreur car elle ne connaît pas le paramètre `p_scheduled_pickup_time`.

## 🎉 Résultat final

Maintenant, **toutes** les commandes (admin ET invité) supportent les créneaux horaires différés :

- ✅ Formulaire admin (`QuickOrderForm`)
- ✅ Formulaire invité (`CommandeSansCompte`)
- ✅ Affichage uniforme dans la liste
- ✅ Dispatch verrouillé jusqu'à -45 min
- ✅ Compteur en temps réel dans les détails

---

**Date de correction** : 06/12/2025 01:35  
**Status** : ✅ Code corrigé, migration SQL à appliquer  
**Build** : ✅ Réussi
