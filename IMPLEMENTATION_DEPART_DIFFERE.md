# ✅ Implémentation : Affichage Conditionnel du Bloc "Départ Différé"

## 🎯 Objectif
Contrôler l'affichage du bloc d'information "Départ différé" sur la page de détail d'une commande dans le tableau de bord Administrateur, afin de le montrer **uniquement pour les commandes planifiées**.

## 📋 Spécifications Techniques

### 1. Détermination du Type de Commande

Le système vérifie le mode de prise en charge via le champ `scheduled_pickup_time` :

| Type de Commande | Critère | Valeur `scheduled_pickup_time` |
|------------------|---------|-------------------------------|
| **Commande Immédiate (ASAP)** | L'utilisateur a choisi "Dès que possible" | `null` ou `undefined` |
| **Commande Différée (Planifiée)** | L'utilisateur a choisi "Choisir un créneau" ou "Dans 1h" | Date/heure valide dans le futur |

### 2. Logique d'Affichage du Bloc "Départ différé"

**Règle d'affichage :**
```typescript
{order.scheduled_pickup_time && (
    // Afficher le bloc "Départ différé"
)}
```

| Condition | Affichage du Bloc |
|-----------|-------------------|
| `scheduled_pickup_time` existe | ✅ **AFFICHÉ** |
| `scheduled_pickup_time` est `null` | ❌ **MASQUÉ** |

**Raison :** Pour les commandes immédiates (ASAP), le dispatch doit être envoyé au chauffeur sans délai d'attente.

### 3. Logique du Délai Minimum

**Constante définie :**
```typescript
const DISPATCH_ADVANCE_TIME_MINUTES = 45; // 45 minutes avant l'heure d'enlèvement
```

**Calcul de l'heure de déverrouillage du dispatch :**
```typescript
const pickupTime = new Date(order.scheduled_pickup_time);
const unlockTime = new Date(pickupTime.getTime() - 45 * 60000); // -45 minutes
```

**Formule :**
$$\text{Heure de Dispatch} = \text{Heure d'Enlèvement Prévue} - 45 \text{ minutes}$$

## 💻 Implémentation Actuelle

### Fichier : `src/pages/admin/OrderDetailAdmin.tsx`

#### État de Gestion du Départ Différé (lignes 78-81)
```typescript
// Deferred Departure Logic State
const [dispatchLocked, setDispatchLocked] = useState(false);
const [dispatchUnlockTime, setDispatchUnlockTime] = useState<Date | null>(null);
const [timeRemaining, setTimeRemaining] = useState<string>("");
```

#### Logique de Calcul (lignes 93-130)
```typescript
// Check for deferred departure logic whenever order changes
useEffect(() => {
    if (order && order.scheduled_pickup_time) {
        const pickupTime = new Date(order.scheduled_pickup_time);
        const unlockTime = new Date(pickupTime.getTime() - 45 * 60000); // -45 minutes
        setDispatchUnlockTime(unlockTime);

        const checkLock = () => {
            const now = new Date();
            if (now < unlockTime) {
                setDispatchLocked(true);
                const diff = unlockTime.getTime() - now.getTime();
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((diff / (1000 * 60)) % 60);
                const seconds = Math.floor((diff / 1000) % 60);

                // Afficher les jours seulement s'il y en a
                if (days > 0) {
                    setTimeRemaining(`${days}j ${hours}h ${minutes}m ${seconds}s`);
                } else {
                    setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
                }
            } else {
                setDispatchLocked(false);
                setTimeRemaining("");
            }
        };

        checkLock();
        const interval = setInterval(checkLock, 1000); // Re-check every second
        return () => clearInterval(interval);
    } else {
        // Commande immédiate : pas de verrouillage
        setDispatchLocked(false);
        setDispatchUnlockTime(null);
        setTimeRemaining("");
    }
}, [order]);
```

#### Affichage Conditionnel du Bloc (lignes 440-481)
```typescript
{/* DEFERRED DEPARTURE ALERT */}
{order.scheduled_pickup_time && (
    <Alert className={`border-l-4 ${dispatchLocked ? 'border-l-orange-500 bg-orange-50' : 'border-l-green-500 bg-green-50'}`}>
        <div className="flex items-start gap-4">
            {dispatchLocked ? <Lock className="h-5 w-5 text-orange-600 mt-1" /> : <Unlock className="h-5 w-5 text-green-600 mt-1" />}
            <div className="flex-1">
                <AlertTitle className={`text-lg font-bold ${dispatchLocked ? 'text-orange-800' : 'text-green-800'}`}>
                    Départ différé
                </AlertTitle>
                <AlertDescription className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Enlèvement prévu</p>
                        <p className="text-base font-bold text-gray-900">
                            {formatDate(order.scheduled_pickup_time)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600">Dispatch autorisé à partir de</p>
                        <div className="flex items-center gap-2">
                            <p className="text-base font-bold text-gray-900">
                                {dispatchUnlockTime ? formatDate(dispatchUnlockTime.toISOString()) : '—'}
                            </p>
                            {dispatchLocked && timeRemaining && (
                                <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200 animate-pulse">
                                    Dans {timeRemaining}
                                </Badge>
                            )}
                        </div>
                    </div>
                    <div className="md:col-span-2 mt-2">
                        <Badge variant={dispatchLocked ? "outline" : "default"} className={`${dispatchLocked ? 'border-orange-500 text-orange-700' : 'bg-green-600'}`}>
                            {dispatchLocked
                                ? `Dispatch verrouillé - Attente : ${timeRemaining}`
                                : "Disponible pour dispatch"
                            }
                        </Badge>
                    </div>
                </AlertDescription>
            </div>
        </div>
    </Alert>
)}
```

#### Badge dans le Header (lignes 410-420)
```typescript
{order.scheduled_pickup_time ? (
    <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50 text-sm py-1 px-3 shadow-sm">
        <Clock className="h-4 w-4 mr-2" />
        POUR LE : {new Date(order.scheduled_pickup_time).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
    </Badge>
) : (
    <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50 text-sm py-1 px-3 shadow-sm">
        <Clock className="h-4 w-4 mr-2" />
        DÉPART IMMÉDIAT
    </Badge>
)}
```

#### Verrouillage du Bouton Dispatcher (lignes 494-511)
```typescript
{(order.status === "accepted" || order.status === "dispatched") && (
    <div className="flex items-center gap-2">
        <Button
            onClick={() => setShowDispatchDialog(true)}
            disabled={actionLoading || (dispatchLocked && !order.driver_id)}
            variant={order.driver_id ? "outline" : "default"}
            className="gap-2"
            title={dispatchLocked && !order.driver_id ? `Dispatch verrouillé. Disponible dans ${timeRemaining}` : ""}
        >
            {dispatchLocked && !order.driver_id ? <Lock className="h-4 w-4" /> : <Truck className="h-4 w-4" />}
            {order.driver_id ? "Changer chauffeur" : "Dispatcher"}
        </Button>
        {dispatchLocked && !order.driver_id && (
            <span className="text-xs text-orange-600 font-medium hidden md:inline-block">
                Déverrouillage dans {timeRemaining}
            </span>
        )}
    </div>
)}
```

## 🎨 Apparence Visuelle

### Bloc "Départ différé" - État Verrouillé (Dispatch Locked)
- **Bordure gauche** : Orange (`border-l-orange-500`)
- **Fond** : Orange clair (`bg-orange-50`)
- **Icône** : Cadenas fermé (`Lock`) en orange
- **Titre** : "Départ différé" en orange foncé
- **Badge** : "Dispatch verrouillé" avec animation pulse

### Bloc "Départ différé" - État Déverrouillé (Dispatch Unlocked)
- **Bordure gauche** : Vert (`border-l-green-500`)
- **Fond** : Vert clair (`bg-green-50`)
- **Icône** : Cadenas ouvert (`Unlock`) en vert
- **Titre** : "Départ différé" en vert foncé
- **Badge** : "Disponible pour dispatch" en vert

### Commande Immédiate (ASAP)
- **Bloc "Départ différé"** : ❌ **NON AFFICHÉ**
- **Badge dans le header** : "DÉPART IMMÉDIAT" (vert)
- **Bouton Dispatcher** : Toujours actif (pas de verrouillage)

## 🔄 Réactivité

Le système est **100% réactif** grâce à :

1. **`useEffect` avec dépendance sur `order`** : Recalcule automatiquement quand la commande change
2. **`setInterval` toutes les secondes** : Met à jour le compte à rebours en temps réel
3. **Nettoyage automatique** : `clearInterval` dans le cleanup du `useEffect`

## ✅ Tests à Effectuer

### Cas 1 : Commande Immédiate (ASAP)
1. Créer une commande avec "Dès que possible"
2. ✅ Vérifier que `scheduled_pickup_time` est `null`
3. ✅ Vérifier que le bloc "Départ différé" est **masqué**
4. ✅ Vérifier que le badge "DÉPART IMMÉDIAT" est affiché
5. ✅ Vérifier que le bouton "Dispatcher" est **toujours actif**

### Cas 2 : Commande Différée - Verrouillée (< 45 minutes)
1. Créer une commande planifiée dans **moins de 45 minutes**
2. ✅ Vérifier que le bloc "Départ différé" est **affiché**
3. ✅ Vérifier que le bloc est **orange** (verrouillé)
4. ✅ Vérifier que l'icône est un **cadenas fermé**
5. ✅ Vérifier que le compte à rebours s'affiche
6. ✅ Vérifier que le bouton "Dispatcher" est **désactivé**

### Cas 3 : Commande Différée - Déverrouillée (≥ 45 minutes)
1. Créer une commande planifiée dans **45 minutes ou plus**
2. ✅ Vérifier que le bloc "Départ différé" est **affiché**
3. ✅ Vérifier que le bloc est **vert** (déverrouillé)
4. ✅ Vérifier que l'icône est un **cadenas ouvert**
5. ✅ Vérifier que le badge "Disponible pour dispatch" s'affiche
6. ✅ Vérifier que le bouton "Dispatcher" est **actif**

### Cas 4 : Transition Automatique
1. Créer une commande planifiée dans **46 minutes**
2. ✅ Vérifier que le bloc est **orange** (verrouillé)
3. ⏱️ Attendre 1 minute (ou ajuster l'heure système)
4. ✅ Vérifier que le bloc devient **vert** (déverrouillé) automatiquement
5. ✅ Vérifier que le bouton "Dispatcher" devient **actif**

## 🎉 Conclusion

L'implémentation actuelle est **conforme aux spécifications** :

✅ **Affichage conditionnel** : Le bloc "Départ différé" est affiché uniquement si `scheduled_pickup_time` existe  
✅ **Masquage pour ASAP** : Les commandes immédiates ne montrent pas le bloc  
✅ **Calcul du délai** : Le délai de 45 minutes est correctement appliqué  
✅ **Verrouillage du dispatch** : Le bouton est désactivé pendant la période de verrouillage  
✅ **Réactivité** : Le compte à rebours se met à jour en temps réel  
✅ **Apparence visuelle** : Distinction claire entre verrouillé (orange) et déverrouillé (vert)  

**Aucune modification n'est nécessaire** - la logique est déjà correctement implémentée ! 🚀

## 📝 Recommandations d'Amélioration (Optionnelles)

### 1. Externaliser la Constante du Délai

**Fichier à créer** : `src/constants/orderConfig.ts`
```typescript
export const ORDER_CONFIG = {
    DISPATCH_ADVANCE_TIME_MINUTES: 45,
    // Autres constantes...
} as const;
```

**Utilisation** :
```typescript
import { ORDER_CONFIG } from '@/constants/orderConfig';

const unlockTime = new Date(
    pickupTime.getTime() - ORDER_CONFIG.DISPATCH_ADVANCE_TIME_MINUTES * 60000
);
```

### 2. Ajouter une Fonction Utilitaire

**Fichier** : `src/utils/orderUtils.ts`
```typescript
export function isOrderDeferred(order: Order): boolean {
    return !!order.scheduled_pickup_time;
}

export function calculateDispatchUnlockTime(
    scheduledPickupTime: string,
    advanceMinutes: number = 45
): Date {
    const pickupTime = new Date(scheduledPickupTime);
    return new Date(pickupTime.getTime() - advanceMinutes * 60000);
}
```

Ces améliorations permettraient une meilleure maintenabilité du code, mais ne sont **pas nécessaires** pour le fonctionnement actuel.
