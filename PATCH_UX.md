# 🔧 PATCH AUTOMATIQUE - Corrections UX

**IMPORTANT** : Copie-colle ces modifications exactement comme indiqué.

---

## FICHIER 1 : src/pages/CommandeSansCompte.tsx

### Modification 1 : Supprimer le bouton "Dans 1h"

**Lignes 851-858 à SUPPRIMER** :

Cherche ces lignes et supprime-les complètement :
```tsx
                                        <Button
                                            type="button"
                                            variant={formData.schedule === "1h" ? "cta" : "outline"}
                                            onClick={() => handleSelectChange("schedule", "1h")}
                                            className={formData.schedule === "1h" ? "text-white" : ""}
                                        >
                                            Dans 1h
                                        </Button>
```

---

### Modification 2 : Griser Standard si ASAP

**Lignes 806-835 à REMPLACER** :

**AVANT** (lignes 806-835) :
```tsx
                                            {[
                                                { id: "standard", label: "Standard", icon: Truck, pricingKey: "NORMAL" },
                                                { id: "express", label: "Express", icon: Clock, pricingKey: "EXPRESS" },
                                                { id: "flash", label: "Flash", icon: Zap, pricingKey: "URGENCE" },
                                            ].map((f) => {
                                                const price = pricingResults ? pricingResults[f.pricingKey as FormuleNew] : null;

                                                return (
                                                    <div
                                                        key={f.id}
                                                        className={`cursor-pointer rounded-lg border-2 p-3 text-center transition-all ${formData.formula === f.id
                                                            ? "border-[#FFCC00] bg-[#FFCC00]/10"
                                                            : "border-gray-100 hover:border-gray-200"
                                                            }`}
                                                        onClick={() => handleSelectChange("formula", f.id)}
                                                    >
                                                        <f.icon className={`h-5 w-5 mx-auto mb-1 ${formData.formula === f.id ? "text-[#0B2D55]" : "text-gray-400"
                                                            }`} />
                                                        <span className={`text-xs font-bold block ${formData.formula === f.id ? "text-[#0B2D55]" : "text-gray-500"
                                                            }`}>
                                                            {f.label}
                                                        </span>
                                                        {price && (
                                                            <span className="text-xs font-bold text-[#0B2D55] mt-1 block">
                                                                {price.totalEuros.toFixed(2)}€
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
```

**APRÈS** (REMPLACE par ce code) :
```tsx
                                            {[
                                                { id: "standard", label: "Standard", icon: Truck, pricingKey: "NORMAL" },
                                                { id: "express", label: "Express", icon: Clock, pricingKey: "EXPRESS" },
                                                { id: "flash", label: "Flash", icon: Zap, pricingKey: "URGENCE" },
                                            ].map((f) => {
                                                const price = pricingResults ? pricingResults[f.pricingKey as FormuleNew] : null;
                                                // Désactiver Standard si "Dès que possible"
                                                const isDisabled = formData.schedule === "asap" && f.id === "standard";

                                                return (
                                                    <div
                                                        key={f.id}
                                                        className={`rounded-lg border-2 p-3 text-center transition-all ${
                                                            isDisabled 
                                                                ? "opacity-40 cursor-not-allowed bg-gray-100" 
                                                                : "cursor-pointer"
                                                        } ${formData.formula === f.id
                                                            ? "border-[#FFCC00] bg-[#FFCC00]/10"
                                                            : "border-gray-100 hover:border-gray-200"
                                                        }`}
                                                        onClick={() => !isDisabled && handleSelectChange("formula", f.id)}
                                                    >
                                                        <f.icon className={`h-5 w-5 mx-auto mb-1 ${formData.formula === f.id ? "text-[#0B2D55]" : "text-gray-400"
                                                            }`} />
                                                        <span className={`text-xs font-bold block ${formData.formula === f.id ? "text-[#0B2D55]" : "text-gray-500"
                                                            }`}>
                                                            {f.label}
                                                        </span>
                                                        {price && (
                                                            <span className="text-xs font-bold text-[#0B2D55] mt-1 block">
                                                                {price.totalEuros.toFixed(2)}€
                                                            </span>
                                                        )}
                                                        {isDisabled && (
                                                            <div className="mt-2 pt-2 border-t border-gray-200">
                                                                <p className="text-[10px] text-red-600 flex items-center justify-center gap-1">
                                                                    <AlertCircle className="h-3 w-3" />
                                                                    Non disponible
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
```

---

## RÉSUMÉ DES CHANGEMENTS

### CommandeSansCompte.tsx :
1. ✅ Supprimé bouton "Dans 1h" (lignes 851-858)
2. ✅ Ajouté logique `isDisabled` pour griser Standard si ASAP
3. ✅ Ajouté message "Non disponible" en rouge

---

## INSTRUCTIONS

1. Ouvre `src/pages/CommandeSansCompte.tsx`
2. Va à la ligne 851
3. Supprime les lignes 851-858 (bouton "Dans 1h")
4. Va à la ligne 806
5. Remplace les lignes 806-835 par le nouveau code ci-dessus
6. Sauvegarde (Ctrl+S)
7. Vérifie qu'il n'y a pas d'erreur de compilation

---

## TEST

1. Va sur http://localhost:8081/commande-sans-compte
2. Entre une adresse
3. Clique sur "Dès que possible"
4. ✅ La carte "Standard" doit être grisée
5. ✅ Le bouton "Dans 1h" a disparu

---

**C'EST TOUT POUR CommandeSansCompte.tsx !**

Les autres fichiers (QuickOrderForm, CreateOrderModal, etc.) suivent la même logique.
Veux-tu que je continue avec les autres fichiers ?
