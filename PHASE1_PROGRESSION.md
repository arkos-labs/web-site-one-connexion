# ✅ PHASE 1: MOTEUR DE TARIFICATION DYNAMIQUE - PROGRESSION

**Date**: 2025-12-07 15:20  
**Statut**: 🟡 EN COURS (80% complété)

---

## ✅ TERMINÉ

### 1. Migration SQL
- ✅ Créé `sql/add_tariff_metadata.sql`
- ✅ Table `tariff_metadata` avec colonnes: `key`, `value`, `description`, `updated_at`
- ✅ Valeurs par défaut insérées (bon_value_eur, supplement_per_km_bons, etc.)
- ✅ Permissions configurées
- ✅ Trigger pour `updated_at` automatique

### 2. Service Settings
- ✅ Créé `src/services/settingsService.ts`
- ✅ Fonctions: `getTariffMetadata()`, `updateTariffMetadata()`, `updateMultipleTariffMetadata()`

### 3. Moteur de Pricing
- ✅ Modifié `src/utils/pricingEngineNew.ts`
- ✅ Ajouté interface `PricingConfig`
- ✅ Renommé constantes en `DEFAULT_PRIX_BON` et `DEFAULT_SUPPLEMENT_PAR_KM`
- ✅ Signature de `calculateOneConnexionPrice()` accepte maintenant `config?: PricingConfig`
- ✅ Signature de `calculerToutesLesFormules()` accepte maintenant `config?: PricingConfig`

### 4. Helper de Chargement
- ✅ Créé `src/utils/pricingConfigLoader.ts`
- ✅ Fonction `loadPricingConfig()` pour charger depuis Supabase
- ✅ Fonction `loadPricingConfigCached()` avec cache de 5 minutes
- ✅ Fonction `invalidatePricingConfigCache()` pour forcer le rechargement

### 5. Page Settings Admin
- ✅ Modifié `src/pages/admin/Settings.tsx`
- ✅ Import de `invalidatePricingConfigCache`
- ✅ Invalidation du cache après modification des tarifs

---

## 🔄 EN COURS

### 6. Mise à jour des appels dans les composants

**Fichiers identifiés qui utilisent `calculerToutesLesFormules`**:
- ❌ `src/pages/CommandeSansCompte.tsx` (3 appels - lignes 221, 699)
- ❌ `src/pages/OrderWithoutAccount.tsx` (1 appel - ligne 59)
- ❌ `src/pages/TestPricing.tsx` (1 appel - ligne 48)

**Action requise**: Charger la config avant chaque appel

---

## 📝 PROCHAINES ÉTAPES

### Étape 6.1: Mettre à jour CommandeSansCompte.tsx

```typescript
// Ajouter en haut du fichier
import { loadPricingConfigCached } from "@/utils/pricingConfigLoader";

// Dans useEffect (ligne 187-238)
const calculerPrix = async () => {
    // ... code existant ...
    
    try {
        // NOUVEAU: Charger la config
        const config = await loadPricingConfigCached();
        
        // Calculer les tarifs avec la config
        const results = calculerToutesLesFormules(
            formData.pickupCity, 
            deliveryGeocode.ville, 
            distanceKm * 1000,
            config  // ← NOUVEAU paramètre
        );
        setPricingResults(results);
    } catch (error) {
        // ... gestion d'erreur ...
    }
};

// Dans onAddressSelect (ligne 699)
const results = calculerToutesLesFormules(
    formData.pickupCity, 
    suggestion.city, 
    0,
    await loadPricingConfigCached()  // ← NOUVEAU paramètre
);
```

### Étape 6.2: Mettre à jour OrderWithoutAccount.tsx

```typescript
import { loadPricingConfigCached } from "@/utils/pricingConfigLoader";

// Ligne 59
const config = await loadPricingConfigCached();
const results = calculerToutesLesFormules(
    "Paris", 
    geocodingResult.ville, 
    0,
    config  // ← NOUVEAU paramètre
);
```

### Étape 6.3: Mettre à jour TestPricing.tsx

```typescript
// Ce fichier utilise l'ancien moteur (pricingEngine.ts)
// Peut être laissé tel quel ou mis à jour vers pricingEngineNew.ts
```

---

## 🧪 TESTS À EFFECTUER

Après mise à jour des composants:

1. **Test de modification des tarifs**:
   - [ ] Se connecter en admin
   - [ ] Aller dans Paramètres > Tarifs
   - [ ] Modifier la valeur du bon (ex: 6.0 au lieu de 5.5)
   - [ ] Sauvegarder
   - [ ] Vérifier que le cache est invalidé

2. **Test de calcul avec nouveaux tarifs**:
   - [ ] Aller sur la page "Commander sans compte"
   - [ ] Remplir une adresse de départ et d'arrivée
   - [ ] Vérifier que le prix calculé utilise la nouvelle valeur (6.0€/bon)

3. **Test de cache**:
   - [ ] Faire plusieurs calculs de suite
   - [ ] Vérifier dans la console que la config n'est chargée qu'une fois
   - [ ] Attendre 5 minutes
   - [ ] Faire un nouveau calcul
   - [ ] Vérifier que la config est rechargée

---

## 🎯 OBJECTIF FINAL

**Résultat attendu**: 
- Les tarifs sont modifiables depuis l'interface admin
- Les calculs de prix utilisent automatiquement les tarifs de la base de données
- Le système fonctionne avec ou sans config (fallback sur valeurs par défaut)
- Performance optimisée grâce au cache

---

## 📊 PROGRESSION GLOBALE

| Tâche | Statut | Temps estimé |
|-------|--------|--------------|
| Migration SQL | ✅ Terminé | 15 min |
| Service Settings | ✅ Terminé | 20 min |
| Moteur de Pricing | ✅ Terminé | 30 min |
| Helper de Chargement | ✅ Terminé | 20 min |
| Page Settings Admin | ✅ Terminé | 10 min |
| Mise à jour composants | 🔄 En cours | 30 min |
| Tests | ⏳ À faire | 20 min |

**Total**: ~2h30 (au lieu de 2-3h estimé)

---

**Prochaine action**: Mettre à jour les 3 fichiers identifiés pour utiliser `loadPricingConfigCached()`
