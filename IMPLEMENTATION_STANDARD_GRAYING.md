# ✅ Implémentation : Grisement de la Formule Standard

## 🎯 Objectif
Assurer que le composant de sélection des Formules (Standard, Express, Flash) applique la logique de grisement à la formule "Standard" en fonction du mode de prise en charge choisi, de manière uniforme dans les interfaces Admin et Client.

## 📋 Logique Déployée

La formule **"Standard"** est **GRISÉE et non sélectionnable** selon les règles suivantes :

| Prise en Charge Sélectionnée | Condition pour Griser "Standard" |
|-------------------------------|----------------------------------|
| **"Dès que possible" (ASAP)** | TOUJOURS GRISÉE |
| **"Choisir un créneau"** | GRISÉE si l'heure de début du créneau choisi est dans **moins de 60 minutes** (1 heure) par rapport à l'heure actuelle |
| **"Choisir un créneau"** | ACCESSIBLE (non grisée) si l'heure de début du créneau choisi est **60 minutes ou plus** dans le futur |

## 💻 Composants Implémentés

### ✅ 1. QuickOrderForm.tsx (Interface Client)
**Fichier:** `src/components/client/QuickOrderForm.tsx`

**État:**
```typescript
const [isStandardDisabled, setIsStandardDisabled] = useState(false);
const [orderType, setOrderType] = useState<'immediate' | 'deferred'>('immediate');
```

**Logique (lignes 214-232):**
```typescript
useEffect(() => {
    if (orderType === 'immediate') {
        // Condition A: "Dès que possible" sélectionné → griser Standard
        setIsStandardDisabled(true);
    } else if (orderType === 'deferred') {
        // Condition B: Vérifier le délai du créneau choisi
        if (formData.pickupDate && formData.pickupTime) {
            const now = new Date();
            const selectedDateTime = new Date(`${formData.pickupDate}T${formData.pickupTime}`);
            const delayInMinutes = (selectedDateTime.getTime() - now.getTime()) / (1000 * 60);
            
            // Si le délai est strictement inférieur à 60 minutes → griser Standard
            setIsStandardDisabled(delayInMinutes < 60);
        } else {
            setIsStandardDisabled(false);
        }
    }
}, [orderType, formData.pickupDate, formData.pickupTime]);
```

**Application (ligne 458):**
```typescript
const isDisabled = !pricingResults || !!pricingError || (f.id === "NORMAL" && isStandardDisabled);
```

---

### ✅ 2. CreateOrderModal.tsx (Interface Admin - Modal Simple)
**Fichier:** `src/components/admin/orders/CreateOrderModal.tsx`

**État:**
```typescript
const [isStandardDisabled, setIsStandardDisabled] = useState(false);
const [orderType, setOrderType] = useState<'immediate' | 'deferred'>('immediate');
```

**Logique (lignes 323-341):**
```typescript
useEffect(() => {
    if (orderType === 'immediate') {
        setIsStandardDisabled(true);
    } else if (orderType === 'deferred') {
        if (formData.pickupDate && formData.pickupTime) {
            const now = new Date();
            const selectedDateTime = new Date(`${formData.pickupDate}T${formData.pickupTime}`);
            const delayInMinutes = (selectedDateTime.getTime() - now.getTime()) / (1000 * 60);
            setIsStandardDisabled(delayInMinutes < 60);
        } else {
            setIsStandardDisabled(false);
        }
    }
}, [orderType, formData.pickupDate, formData.pickupTime]);
```

**Application (ligne 700):**
```typescript
const isDisabled = !pricingResults || !!pricingError || (f.id === "NORMAL" && isStandardDisabled);
```

---

### ✅ 3. CommandeSansCompte.tsx (Interface Sans Compte)
**Fichier:** `src/pages/CommandeSansCompte.tsx`

**État:**
```typescript
const [isStandardDisabled, setIsStandardDisabled] = useState(false);
// schedule: "asap" | "slot"
```

**Logique (lignes 247-269):**
```typescript
useEffect(() => {
    if (formData.schedule === 'asap') {
        setIsStandardDisabled(true);
    } else if (formData.schedule === 'slot') {
        if (formData.scheduleTime) {
            const now = new Date();
            const selectedDateTime = new Date(formData.scheduleTime);
            const delayInMinutes = (selectedDateTime.getTime() - now.getTime()) / (1000 * 60);
            setIsStandardDisabled(delayInMinutes < 60);
        } else {
            setIsStandardDisabled(false);
        }
    } else {
        setIsStandardDisabled(false);
    }
}, [formData.schedule, formData.scheduleTime]);
```

**Application (ligne 839):**
```typescript
const isDisabled = !pricingResults || !!pricingError || (f.id === "standard" && isStandardDisabled);
```

---

### ✅ 4. OrderWizardModal.tsx + StepFormula.tsx (Interface Admin - Wizard)
**Fichiers:** 
- `src/components/admin/orders/wizard/OrderWizardModal.tsx`
- `src/components/admin/orders/wizard/steps/StepFormula.tsx`

**État (OrderWizardModal):**
```typescript
const [isStandardDisabled, setIsStandardDisabled] = useState(false);
// scheduleType: 'immediate' | 'in1h' | 'deferred'
```

**Logique (OrderWizardModal, lignes 209-233):**
```typescript
useEffect(() => {
    if (formData.scheduleType === 'immediate' || formData.scheduleType === 'in1h') {
        // "Dès que possible" ou "Dans 1h" → griser Standard
        setIsStandardDisabled(true);
    } else if (formData.scheduleType === 'deferred') {
        if (formData.pickupDate && formData.pickupTime) {
            const now = new Date();
            const selectedDateTime = new Date(`${formData.pickupDate}T${formData.pickupTime}`);
            const delayInMinutes = (selectedDateTime.getTime() - now.getTime()) / (1000 * 60);
            setIsStandardDisabled(delayInMinutes < 60);
        } else {
            setIsStandardDisabled(false);
        }
    } else {
        setIsStandardDisabled(false);
    }
}, [formData.scheduleType, formData.pickupDate, formData.pickupTime]);
```

**Passage au composant (OrderWizardModal, ligne 326):**
```typescript
<StepFormula
    formData={formData}
    updateFormData={updateFormData}
    pricingResults={pricingResults}
    isCalculating={isCalculatingPrice}
    error={pricingError}
    isStandardDisabled={isStandardDisabled}  // ← Nouveau prop
    onNext={() => handleStepComplete('formula')}
    onBack={() => setCurrentStep('package')}
/>
```

**Interface mise à jour (StepFormula):**
```typescript
interface StepFormulaProps {
    formData: OrderFormData;
    updateFormData: (data: Partial<OrderFormData>) => void;
    pricingResults: Record<FormuleNew, CalculTarifaireResult> | null;
    isCalculating: boolean;
    error: string | null;
    isStandardDisabled: boolean;  // ← Nouveau prop
    onNext: () => void;
    onBack: () => void;
}
```

**Application (StepFormula):**
```typescript
const isDisabled = f.id === "NORMAL" && isStandardDisabled;

// Styling conditionnel
className={`relative rounded-xl border-2 p-4 transition-all duration-200 flex flex-col items-center justify-center text-center gap-2 group
    ${isDisabled
        ? "opacity-50 cursor-not-allowed bg-gray-50 border-gray-200"
        : isSelected
            ? "border-blue-600 bg-blue-50/50 shadow-md ring-1 ring-blue-600 cursor-pointer"
            : "border-gray-100 hover:border-blue-200 hover:bg-gray-50 cursor-pointer"
    }
`}

// Désactivation du clic
onClick={() => {
    if (!isDisabled) {
        updateFormData({ formula: f.id as FormuleNew });
    }
}}
```

---

## 🎨 Apparence Visuelle

Lorsque la formule Standard est grisée :
- **Opacité réduite** : `opacity-50`
- **Curseur** : `cursor-not-allowed`
- **Fond** : `bg-gray-50`
- **Bordure** : `border-gray-200`
- **Icône** : `text-gray-300`
- **Texte** : `text-gray-400`
- **Prix** : Non affiché

---

## 🔄 Réactivité

La logique est **réactive** grâce aux `useEffect` qui surveillent :
- Le mode de prise en charge (`orderType`, `schedule`, `scheduleType`)
- La date de prise en charge (`pickupDate`)
- L'heure de prise en charge (`pickupTime`, `scheduleTime`)

**Dès qu'un de ces paramètres change, l'état de la formule Standard est recalculé automatiquement.**

---

## ✅ Tests à Effectuer

### Cas 1 : "Dès que possible" (ASAP)
1. Sélectionner "Dès que possible"
2. ✅ Vérifier que la formule Standard est **grisée**
3. ✅ Vérifier qu'on ne peut **pas cliquer** dessus

### Cas 2 : "Choisir un créneau" < 60 minutes
1. Sélectionner "Choisir un créneau"
2. Choisir une date/heure dans **moins de 60 minutes**
3. ✅ Vérifier que la formule Standard est **grisée**
4. ✅ Vérifier le message d'alerte affiché

### Cas 3 : "Choisir un créneau" ≥ 60 minutes
1. Sélectionner "Choisir un créneau"
2. Choisir une date/heure dans **60 minutes ou plus**
3. ✅ Vérifier que la formule Standard est **accessible**
4. ✅ Vérifier qu'on peut la sélectionner

---

## 📝 Messages Informatifs

Des messages d'alerte sont affichés pour informer l'utilisateur :

**QuickOrderForm & CreateOrderModal :**
```tsx
{orderType === 'deferred' && isStandardDisabled && formData.pickupDate && formData.pickupTime && (
    <p className="text-sm text-amber-600 flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        La formule Standard n'est pas disponible pour un créneau dans moins d'1 heure
    </p>
)}
```

**CommandeSansCompte :**
```tsx
{formData.schedule === "slot" && isStandardDisabled && formData.scheduleTime && (
    <p className="text-sm text-amber-600 flex items-center gap-2 mt-2">
        <AlertCircle className="h-4 w-4" />
        La formule Standard n'est pas disponible pour un créneau dans moins d'1 heure
    </p>
)}
```

---

## 🎉 Conclusion

La logique de grisement de la formule Standard est maintenant **uniformément implémentée** dans toutes les interfaces :
- ✅ Interface Client (`QuickOrderForm.tsx`)
- ✅ Interface Admin - Modal Simple (`CreateOrderModal.tsx`)
- ✅ Interface Admin - Wizard (`OrderWizardModal.tsx` + `StepFormula.tsx`)
- ✅ Interface Sans Compte (`CommandeSansCompte.tsx`)

La logique est **réactive**, **cohérente** et **visuellement claire** pour l'utilisateur.
