# 🎯 CORRECTIONS UX ESSENTIELLES

**Date**: 2025-12-07  
**Priorité**: HAUTE  
**Temps estimé**: 20 minutes

---

## 📋 2 MODIFICATIONS À FAIRE

### ✅ Modification 1 : Supprimer le bouton "Dans 1h"
**Raison** : Incohérent car il y a déjà "Choisir un créneau"

### ✅ Modification 2 : Griser "Standard" si "Dès que possible"
**Raison** : Standard n'est pas compatible avec livraison immédiate

---

## 🔧 MODIFICATION 1 : SUPPRIMER "Dans 1h"

### Fichiers à modifier (4 fichiers)

#### 1️⃣ `src/pages/CommandeSansCompte.tsx`

**Cherche** (Ctrl+F) : `Dans 1h`  
**Ligne** : ~857

**SUPPRIME ce bloc complet** :
```tsx
{/* Dans 1h */}
<button
    type="button"
    onClick={() => handleScheduleChange('in1h')}
    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
        formData.scheduleType === 'in1h'
            ? 'border-primary bg-primary/5'
            : 'border-gray-200 hover:border-primary/50'
    }`}
>
    <Clock className="h-5 w-5" />
    <div className="text-left">
        <div className="font-semibold">Dans 1h</div>
        <div className="text-xs text-muted-foreground">
            {formData.pickupTime || 'Heure automatique'}
        </div>
    </div>
</button>
```

---

#### 2️⃣ `src/components/client/QuickOrderForm.tsx`

**Cherche** : `Dans 1h`  
**Ligne** : ~562

**SUPPRIME le même type de bloc**

---

#### 3️⃣ `src/components/admin/orders/CreateOrderModal.tsx`

**Cherche** : `Dans 1h`  
**Ligne** : ~770

**SUPPRIME le même type de bloc**

---

#### 4️⃣ `src/components/admin/orders/wizard/steps/StepSchedule.tsx`

**Cherche** : `Dans 1h`  
**Ligne** : ~75

**SUPPRIME le même type de bloc**

---

## 🔒 MODIFICATION 2 : GRISER "Standard" si ASAP

### Fichiers à modifier (3 fichiers)

#### 1️⃣ `src/pages/CommandeSansCompte.tsx`

**Cherche** : `pricingResults.map`  
**Ligne** : ~600-650

**REMPLACE** :
```tsx
{pricingResults.map((result) => (
    <div
        key={result.formula}
        onClick={() => setSelectedFormula(result.formula)}
        className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
            selectedFormula === result.formula
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-primary/50'
        }`}
    >
        {/* Contenu */}
    </div>
))}
```

**PAR** :
```tsx
{pricingResults.map((result) => {
    // Désactiver Standard si "Dès que possible"
    const isStandardDisabled = formData.scheduleType === 'asap' && result.formula === 'NORMAL';
    
    return (
        <div
            key={result.formula}
            onClick={() => !isStandardDisabled && setSelectedFormula(result.formula)}
            className={`rounded-lg border-2 p-4 transition-all ${
                isStandardDisabled 
                    ? 'opacity-40 cursor-not-allowed bg-gray-100' 
                    : 'cursor-pointer'
            } ${
                selectedFormula === result.formula
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-primary/50'
            }`}
        >
            {/* Contenu existant de la carte */}
            <div className="flex items-center justify-between mb-2">
                <Badge variant={result.formula === 'NORMAL' ? 'secondary' : 'default'}>
                    {result.formula === 'NORMAL' ? 'Standard' : 
                     result.formula === 'EXPRESS' ? 'Express' : 'Flash'}
                </Badge>
                <span className="text-2xl font-bold">{result.price.toFixed(2)}€</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
                {result.formula === 'NORMAL' ? 'Livraison standard (2-4h)' :
                 result.formula === 'EXPRESS' ? 'Livraison express (1-2h)' :
                 'Livraison flash (30min-1h)'}
            </p>
            <p className="text-xs text-muted-foreground">
                {result.bons} bon{result.bons > 1 ? 's' : ''} × {result.bonValue}€
            </p>
            
            {/* Message si désactivé */}
            {isStandardDisabled && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Non disponible pour livraison immédiate
                    </p>
                </div>
            )}
        </div>
    );
})}
```

**N'oublie pas d'importer AlertCircle en haut du fichier** :
```tsx
import { AlertCircle } from "lucide-react";
```

---

#### 2️⃣ `src/components/client/QuickOrderForm.tsx`

**Même modification** que ci-dessus dans la section des formules de prix

---

#### 3️⃣ `src/components/admin/orders/CreateOrderModal.tsx`

**Même modification** que ci-dessus dans la section des formules de prix

---

## ✅ VÉRIFICATION APRÈS MODIFICATIONS

### Test 1 : Bouton "Dans 1h" supprimé

1. Va sur `/commande-sans-compte`
2. Regarde la section "Quand souhaitez-vous être livré ?"
3. ✅ Tu devrais voir seulement 2 boutons :
   - "Dès que possible"
   - "Choisir un créneau"
4. ❌ Le bouton "Dans 1h" a disparu

**Fais pareil pour** :
- Dashboard client > Nouvelle commande
- Dashboard admin > Créer une commande

---

### Test 2 : Standard grisé si ASAP

1. Va sur `/commande-sans-compte`
2. Entre une adresse de départ et d'arrivée
3. Clique sur "Dès que possible"
4. Regarde les 3 cartes de tarifs
5. ✅ La carte "Standard" doit être :
   - Grisée (opacity-40)
   - Non cliquable (cursor-not-allowed)
   - Avec un message rouge : "Non disponible pour livraison immédiate"
6. ✅ Les cartes "Express" et "Flash" restent cliquables

**Maintenant clique sur "Choisir un créneau"** :
7. ✅ La carte "Standard" redevient normale
8. ✅ Toutes les cartes sont cliquables

---

## 📊 RÉSUMÉ VISUEL

### AVANT :
```
┌─────────────────────────────────────────┐
│ Quand souhaitez-vous être livré ?       │
├─────────────────────────────────────────┤
│ [Dès que possible] [Dans 1h] [Choisir]  │ ← 3 boutons
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Formules (si ASAP sélectionné)          │
├─────────────────────────────────────────┤
│ [Standard] [Express] [Flash]            │ ← Tous cliquables
└─────────────────────────────────────────┘
```

### APRÈS :
```
┌─────────────────────────────────────────┐
│ Quand souhaitez-vous être livré ?       │
├─────────────────────────────────────────┤
│ [Dès que possible] [Choisir un créneau] │ ← 2 boutons
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Formules (si ASAP sélectionné)          │
├─────────────────────────────────────────┤
│ [Standard 🚫] [Express ✓] [Flash ✓]     │ ← Standard grisé
│  ↑ Non disponible                       │
└─────────────────────────────────────────┘
```

---

## 🎯 LOGIQUE MÉTIER

### Pourquoi griser Standard si ASAP ?

**Standard** = Livraison en 2-4h  
**Dès que possible** = Livraison immédiate (30min-1h)

➡️ **Incompatible !**

Si le client veut "Dès que possible", il doit choisir :
- ✅ **Express** (1-2h)
- ✅ **Flash** (30min-1h)
- ❌ **Standard** (trop lent)

---

## ⏱️ TEMPS ESTIMÉ

| Tâche | Temps |
|-------|-------|
| Supprimer "Dans 1h" (4 fichiers) | 10 min |
| Griser Standard (3 fichiers) | 10 min |
| **TOTAL** | **20 min** |

---

## 🐛 DÉPANNAGE

### Problème 1 : Standard toujours cliquable

**Vérifications** :
1. As-tu bien ajouté la condition `isStandardDisabled` ?
2. As-tu vérifié que `formData.scheduleType === 'asap'` ?
3. As-tu vérifié que `result.formula === 'NORMAL'` ?

**Solution** :
- Ajoute un `console.log(formData.scheduleType, result.formula)` pour débugger

---

### Problème 2 : Erreur "AlertCircle is not defined"

**Solution** :
```tsx
// En haut du fichier
import { AlertCircle } from "lucide-react";
```

---

### Problème 3 : Bouton "Dans 1h" toujours visible

**Solution** :
- Cherche dans TOUS les fichiers listés
- Il y a 4 occurrences à supprimer
- Utilise Ctrl+Shift+F (recherche globale) : `Dans 1h`

---

## 📝 CHECKLIST

Avant de tester :
- [ ] Supprimé "Dans 1h" dans CommandeSansCompte.tsx
- [ ] Supprimé "Dans 1h" dans QuickOrderForm.tsx
- [ ] Supprimé "Dans 1h" dans CreateOrderModal.tsx
- [ ] Supprimé "Dans 1h" dans StepSchedule.tsx
- [ ] Ajouté logique `isStandardDisabled` dans CommandeSansCompte.tsx
- [ ] Ajouté logique `isStandardDisabled` dans QuickOrderForm.tsx
- [ ] Ajouté logique `isStandardDisabled` dans CreateOrderModal.tsx
- [ ] Importé `AlertCircle` dans les 3 fichiers
- [ ] Sauvegardé tous les fichiers
- [ ] Vérifié qu'il n'y a pas d'erreur de compilation

Après les modifications :
- [ ] Testé sur /commande-sans-compte
- [ ] Testé sur dashboard client
- [ ] Testé sur dashboard admin
- [ ] Vérifié que Standard se grise bien
- [ ] Vérifié que "Dans 1h" a disparu partout

---

**Prêt à faire ces modifications ?** 🚀

**Veux-tu que je te guide étape par étape ?** 🤔
