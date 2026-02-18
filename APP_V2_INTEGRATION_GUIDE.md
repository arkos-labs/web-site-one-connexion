# 🔧 GUIDE D'INTÉGRATION - App Chauffeur V2

**Repository**: `one-connexion-app-v2`  
**Date**: 2025-12-21  
**Objectif**: Intégrer les corrections de synchronisation Realtime

---

## 📦 Fichiers à Mettre à Jour

### 1. `src/stores/slices/orderSlice.ts`

**Source**: `web-site-one-connexion/_App_Updates/orderSlice.ts`

**Changements critiques**:
- ✅ Ligne 102: Paramètre `driverUserId` au lieu de `driverId`
- ✅ Ligne 113: Filtre Realtime corrigé (`driver_id=eq.${driverUserId}`)
- ✅ Lignes 119-147: Mapping GPS complet (pickup/delivery coordinates)
- ✅ Lignes 157-162: Logs de débogage améliorés

**Action**:
```bash
# Copier le fichier mis à jour
cp ../web-site-one-connexion/_App_Updates/orderSlice.ts src/stores/slices/orderSlice.ts
```

---

### 2. `src/features/driver/components/ActiveOrderCard.tsx`

**Source**: `web-site-one-connexion/_App_Updates/ActiveOrderCard.tsx`

**Changements**:
- ✅ Lignes 18-24: Documentation de la règle des 40%
- ✅ Calcul sécurisé avec `toFixed(2)`

**Action**:
```bash
cp ../web-site-one-connexion/_App_Updates/ActiveOrderCard.tsx src/features/driver/components/ActiveOrderCard.tsx
```

---

### 3. `src/features/driver/components/DriverMap.tsx`

**Source**: `web-site-one-connexion/_App_Updates/DriverMap.tsx`

**Fonctionnalités**:
- ✅ Affichage des 2 routes (Chauffeur→Pickup, Pickup→Dropoff)
- ✅ Marqueurs personnalisés (🚖, bleu, vert)
- ✅ Contrôle de caméra intelligent

**Action**:
```bash
cp ../web-site-one-connexion/_App_Updates/DriverMap.tsx src/features/driver/components/DriverMap.tsx
```

---

## 🔌 Vérification de l'Appel de Subscription

### Fichier: `src/features/driver/DriverHomeScreen.tsx` (ou équivalent)

**Code à vérifier**:
```typescript
import { useAppStore } from '@/stores/useAppStore';
import { useEffect } from 'react';

export const DriverHomeScreen = () => {
    const { user } = useAuth(); // Récupérer l'utilisateur connecté
    const { subscribeToAssignments, unsubscribeFromAssignments } = useAppStore();
    
    useEffect(() => {
        if (user?.id) {
            // ✅ CRITIQUE: Passer user.id (Auth ID), PAS driver.id (UUID)
            console.log('🔌 Subscribing to assignments for Auth ID:', user.id);
            subscribeToAssignments(user.id);
        }
        
        return () => {
            console.log('🔌 Unsubscribing from assignments');
            unsubscribeFromAssignments();
        };
    }, [user?.id, subscribeToAssignments, unsubscribeFromAssignments]);
    
    // ... reste du composant
};
```

**Points d'attention**:
- ⚠️ **NE PAS** utiliser `driver.id` (UUID de la table drivers)
- ✅ **UTILISER** `user.id` (Auth ID de Supabase Auth)
- ✅ Vérifier que `user.id` existe avant de subscribe

---

## 🆕 Création de NewOrderModal (Si inexistant)

### Fichier: `src/features/driver/components/NewOrderModal.tsx`

```typescript
import { useState, useEffect } from 'react';
import { Order } from '@/types';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { MapPin, Clock, Navigation } from 'lucide-react';

interface NewOrderModalProps {
    order: Order;
    onAccept: (orderId: string) => void;
    onReject: (orderId: string) => void;
}

export const NewOrderModal = ({ order, onAccept, onReject }: NewOrderModalProps) => {
    const [timeLeft, setTimeLeft] = useState(30); // 30 secondes pour accepter
    
    // ========================================
    // RÈGLE MÉTIER : 40% pour le chauffeur
    // ========================================
    const driverEarnings = (order.price * 0.40).toFixed(2);
    
    // Timer de 30 secondes
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    onReject(order.id); // Auto-refus après 30s
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        
        return () => clearInterval(timer);
    }, [order.id, onReject]);
    
    return (
        <Modal isOpen={true} className="fixed inset-0 z-50 flex items-end">
            <div className="bg-white w-full rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-slate-900">
                        🚚 Nouvelle Course
                    </h2>
                    <div className="bg-red-100 text-red-600 px-3 py-1 rounded-full font-bold">
                        {timeLeft}s
                    </div>
                </div>
                
                {/* Référence */}
                <p className="text-slate-500 mb-6">
                    Référence: <span className="font-mono font-bold">{order.reference}</span>
                </p>
                
                {/* Itinéraire */}
                <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                        <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                        <div>
                            <p className="text-xs text-blue-600 font-bold uppercase">Point de retrait</p>
                            <p className="text-slate-900 font-medium">{order.pickupLocation.address}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                        <Navigation className="w-5 h-5 text-green-600 mt-1" />
                        <div>
                            <p className="text-xs text-green-600 font-bold uppercase">Destination</p>
                            <p className="text-slate-900 font-medium">{order.dropoffLocation.address}</p>
                        </div>
                    </div>
                </div>
                
                {/* Détails */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-2 text-slate-500 mb-1">
                            <Navigation className="w-4 h-4" />
                            <span className="text-xs font-medium">Distance</span>
                        </div>
                        <p className="text-lg font-bold text-slate-900">{order.distance}</p>
                    </div>
                    
                    <div className="p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-2 text-slate-500 mb-1">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs font-medium">Temps estimé</span>
                        </div>
                        <p className="text-lg font-bold text-slate-900">~15 min</p>
                    </div>
                </div>
                
                {/* Gain */}
                <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6 rounded-2xl mb-6 text-center">
                    <p className="text-white/80 text-sm font-bold uppercase tracking-wider mb-1">
                        Votre Gain
                    </p>
                    <p className="text-white text-5xl font-black">
                        {driverEarnings} €
                    </p>
                </div>
                
                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        onClick={() => onReject(order.id)}
                        variant="outline"
                        className="h-14 text-lg font-bold border-2 border-slate-300 hover:bg-slate-100"
                    >
                        Refuser
                    </Button>
                    <Button
                        onClick={() => onAccept(order.id)}
                        className="h-14 text-lg font-bold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-green-200"
                    >
                        Accepter
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
```

---

## 🧪 Tests de Validation

### Test 1 : Réception de Course

**Prérequis**:
- Chauffeur connecté et "En ligne"
- Admin connecté au Dashboard

**Étapes**:
1. Admin dispatche une course au chauffeur
2. Vérifier la console de l'app chauffeur:
   ```
   📡 [OrderSlice] Subscribing to assignments for Driver Auth ID: abc-123-def
   🔔 [OrderSlice] Order UPDATE received: { orderId: ..., newStatus: 'assigned' }
   ✅ [OrderSlice] New order mapped and triggered
   ```
3. Vérifier que NewOrderModal s'affiche
4. Vérifier que le gain affiché = 40% du prix total

**Résultat attendu**: ✅ Modal s'affiche en < 2 secondes

---

### Test 2 : Affichage GPS

**Étapes**:
1. Accepter la course
2. Vérifier que ActiveOrderCard s'affiche
3. Vérifier que DriverMap affiche:
   - ✅ Marqueur chauffeur (🚖)
   - ✅ Marqueur pickup (bleu)
   - ✅ Marqueur dropoff (vert)
   - ✅ Route 1: Chauffeur → Pickup (bleu pointillé)
   - ✅ Route 2: Pickup → Dropoff (vert solide)

**Résultat attendu**: ✅ Tous les éléments visibles

---

### Test 3 : Refus de Course

**Étapes**:
1. Refuser la course dans NewOrderModal
2. Vérifier que la course revient dans "En Attribution" sur le Dashboard
3. Vérifier que le statut du chauffeur repasse à "En ligne"

**Résultat attendu**: ✅ Synchronisation correcte

---

## 🐛 Débogage

### Problème : Le chauffeur ne reçoit pas les courses

**Vérifications**:
1. ✅ Vérifier que `subscribeToAssignments()` est appelé avec `user.id` (Auth ID)
2. ✅ Vérifier les logs de la console:
   ```
   📡 [OrderSlice] Subscribing to assignments for Driver Auth ID: ...
   ✅ [OrderSlice] Successfully subscribed to driver assignments
   ```
3. ✅ Vérifier que `orders.driver_id` dans Supabase contient bien l'Auth ID

**Solution**:
```typescript
// Dans la console du navigateur
console.log('User Auth ID:', user.id);
console.log('Driver ID from DB:', driver.id); // Ne PAS utiliser celui-ci !
```

---

### Problème : Les coordonnées GPS ne s'affichent pas

**Vérifications**:
1. ✅ Vérifier que `pickup_lat`, `pickup_lng`, `delivery_lat`, `delivery_lng` existent dans la DB
2. ✅ Vérifier les logs:
   ```
   ✅ [OrderSlice] New order mapped and triggered: {
       pickupLocation: { lat: 48.8566, lng: 2.3522, address: "..." },
       dropoffLocation: { lat: 48.8600, lng: 2.3600, address: "..." }
   }
   ```

**Solution**:
Si les coordonnées sont dans un objet JSON (`pickup_location`), le code gère déjà ce cas:
```typescript
lat: newOrderRow.pickup_location?.latitude || newOrderRow.pickup_lat || 48.8566
```

---

## 📊 Checklist d'Intégration

- [ ] Copier `orderSlice.ts` mis à jour
- [ ] Copier `ActiveOrderCard.tsx` mis à jour
- [ ] Copier `DriverMap.tsx` mis à jour
- [ ] Vérifier l'appel de `subscribeToAssignments(user.id)`
- [ ] Créer/Mettre à jour `NewOrderModal.tsx`
- [ ] Tester le dispatch Admin → Chauffeur
- [ ] Tester l'affichage GPS
- [ ] Tester le refus de course
- [ ] Vérifier le calcul des 40%
- [ ] Tester la géolocalisation temps réel

---

**Version**: 1.0.0  
**Dernière mise à jour**: 2025-12-21 01:17  
**Statut**: 📋 Prêt pour Intégration
