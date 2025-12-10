# 🔧 CORRECTIONS UX - Commande

**Date**: 2025-12-07  
**Priorité**: HAUTE  
**Temps estimé**: 30 minutes

---

## 📋 MODIFICATIONS À FAIRE

### 1. ❌ Retirer "Obligatoire pour le coursier" sur le téléphone

**Fichier**: `src/pages/CommandeSansCompte.tsx`  
**Ligne**: 464-466

**Code actuel** :
```tsx
<p className="text-xs text-muted-foreground flex items-center gap-1">
    <AlertCircle className="h-3 w-3" /> Obligatoire pour le coursier
</p>
```

**Action** : **SUPPRIMER** ces 3 lignes complètement

**Résultat attendu** :
```tsx
<Input
    id="senderPhone"
    name="senderPhone"
    type="tel"
    value={formData.senderPhone}
    onChange={handleChange}
    placeholder="06 12 34 56 78"
    required
/>
</div>  {/* Fermeture du div parent */}
```

---

### 2. ❌ Retirer le bouton "Dans 1h" (incohérent)

#### Fichier 1: `src/pages/CommandeSansCompte.tsx`

**Ligne**: ~850-870

**Code à SUPPRIMER** :
```tsx
{/* Dans 1h */}
<button
    type="button"
    onClick={() => handleScheduleChange('in1h')}
    className={`...`}
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

**Action** : Cherche le bouton "Dans 1h" et **SUPPRIME** tout le bloc `<button>...</button>`

---

#### Fichier 2: `src/components/client/QuickOrderForm.tsx`

**Ligne**: ~545-575

**Code à SUPPRIMER** :
```tsx
{/* Dans 1h */}
<button
    type="button"
    onClick={() => handleScheduleChange('in1h')}
    className={`...`}
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

**Action** : Cherche et **SUPPRIME** le bouton "Dans 1h"

---

#### Fichier 3: `src/components/admin/orders/CreateOrderModal.tsx`

**Ligne**: ~753-783

**Code à SUPPRIMER** :
```tsx
{/* Dans 1h */}
<button
    type="button"
    onClick={() => handleScheduleChange('in1h')}
    className={`...`}
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

**Action** : Cherche et **SUPPRIME** le bouton "Dans 1h"

---

#### Fichier 4: `src/components/admin/orders/wizard/steps/StepSchedule.tsx`

**Ligne**: ~70-90

**Code à SUPPRIMER** :
```tsx
{/* Dans 1h */}
<button
    type="button"
    onClick={() => handleScheduleChange('in1h')}
    className={`...`}
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

**Action** : Cherche et **SUPPRIME** le bouton "Dans 1h"

---

### 3. 🔒 Griser le tarif "Standard" quand "Dès que possible" est sélectionné

**Fichier**: `src/pages/CommandeSansCompte.tsx`  
**Ligne**: ~600-650 (section des formules de tarifs)

**Code actuel** :
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
        {/* Contenu de la carte */}
    </div>
))}
```

**Code à MODIFIER** :
```tsx
{pricingResults.map((result) => {
    // Désactiver Standard si "Dès que possible" est sélectionné
    const isDisabled = formData.scheduleType === 'asap' && result.formula === 'NORMAL';
    
    return (
        <div
            key={result.formula}
            onClick={() => !isDisabled && setSelectedFormula(result.formula)}
            className={`rounded-lg border-2 p-4 transition-all ${
                isDisabled 
                    ? 'opacity-50 cursor-not-allowed bg-gray-50' 
                    : 'cursor-pointer'
            } ${
                selectedFormula === result.formula
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-primary/50'
            }`}
        >
            {/* Contenu de la carte */}
            {isDisabled && (
                <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Non disponible pour "Dès que possible"
                </div>
            )}
        </div>
    );
})}
```

**Explication** :
- Si `scheduleType === 'asap'` ET `formula === 'NORMAL'` → carte grisée
- Ajout de `opacity-50` et `cursor-not-allowed`
- Message d'erreur en rouge
- Impossible de cliquer

---

## 🎯 RÉSULTAT ATTENDU

### Avant :
```
☐ Téléphone: "Obligatoire pour le coursier" ← À RETIRER
☐ Boutons: [Dès que possible] [Dans 1h] [Choisir] ← Retirer "Dans 1h"
☐ Tarif Standard: Toujours cliquable ← À griser si ASAP
```

### Après :
```
✅ Téléphone: Juste le champ, sans texte
✅ Boutons: [Dès que possible] [Choisir un créneau]
✅ Tarif Standard: Grisé si "Dès que possible" sélectionné
```

---

## 📝 INSTRUCTIONS DÉTAILLÉES

### Étape 1 : Retirer "Obligatoire pour le coursier"

1. Ouvre `src/pages/CommandeSansCompte.tsx`
2. Cherche (Ctrl+F) : `Obligatoire pour le coursier`
3. Supprime les lignes 464-466 :
   ```tsx
   <p className="text-xs text-muted-foreground flex items-center gap-1">
       <AlertCircle className="h-3 w-3" /> Obligatoire pour le coursier
   </p>
   ```
4. Sauvegarde

---

### Étape 2 : Retirer tous les boutons "Dans 1h"

Pour chaque fichier, cherche `Dans 1h` et supprime le bouton complet :

**Fichiers à modifier** :
1. `src/pages/CommandeSansCompte.tsx`
2. `src/components/client/QuickOrderForm.tsx`
3. `src/components/admin/orders/CreateOrderModal.tsx`
4. `src/components/admin/orders/wizard/steps/StepSchedule.tsx`

**Dans chaque fichier** :
1. Cherche (Ctrl+F) : `Dans 1h`
2. Trouve le `<button>` parent
3. Supprime tout le bloc `<button>...</button>`
4. Sauvegarde

---

### Étape 3 : Griser Standard si ASAP

1. Ouvre `src/pages/CommandeSansCompte.tsx`
2. Cherche la section où les formules de tarifs sont affichées (map sur `pricingResults`)
3. Remplace le code par celui fourni ci-dessus
4. Sauvegarde

---

## ✅ VÉRIFICATION

Après les modifications :

1. **Test 1** : Va sur `/commande-sans-compte`
   - ✅ Le champ téléphone n'a plus le texte "Obligatoire pour le coursier"

2. **Test 2** : Vérifie les boutons de planning
   - ✅ Il ne reste que 2 boutons : "Dès que possible" et "Choisir un créneau"
   - ✅ Le bouton "Dans 1h" a disparu

3. **Test 3** : Clique sur "Dès que possible"
   - ✅ La carte "Standard" devient grisée
   - ✅ Un message rouge apparaît : "Non disponible pour Dès que possible"
   - ✅ Impossible de cliquer sur Standard

4. **Test 4** : Clique sur "Choisir un créneau"
   - ✅ La carte "Standard" redevient cliquable
   - ✅ Toutes les formules sont disponibles

---

## 🐛 SI PROBLÈME

Si tu as des erreurs après modification :

1. **Erreur de compilation** :
   - Vérifie que tu as bien fermé toutes les balises
   - Vérifie les accolades `{}`

2. **Carte Standard toujours cliquable** :
   - Vérifie que `formData.scheduleType === 'asap'` est bien la condition
   - Vérifie que `result.formula === 'NORMAL'` correspond au nom de la formule

3. **Bouton "Dans 1h" toujours visible** :
   - Cherche dans tous les fichiers listés
   - Il peut y avoir plusieurs occurrences

---

## ⏱️ TEMPS ESTIMÉ

- Modification 1 (téléphone) : 2 minutes
- Modification 2 (boutons "Dans 1h") : 10 minutes
- Modification 3 (griser Standard) : 15 minutes
- Tests : 3 minutes

**Total** : ~30 minutes

---

**Veux-tu que je t'aide à faire ces modifications une par une ?** 🤔
