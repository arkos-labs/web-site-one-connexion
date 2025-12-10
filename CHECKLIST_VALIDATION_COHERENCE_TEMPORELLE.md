# ✅ Checklist de Validation - Cohérence Temporelle

## 🎯 Objectif
Valider que la logique de cohérence temporelle fonctionne correctement dans toutes les interfaces.

---

## 📋 Tests à Effectuer

### 🔵 **Interface Client** (`QuickOrderForm.tsx`)

#### Test 1.1 : Bouton "Dans 1h" Supprimé
- [ ] Ouvrir le formulaire de commande client
- [ ] Vérifier qu'il n'y a que **2 boutons** : "Dès que possible" et "Choisir un créneau"
- [ ] Confirmer que le bouton "Dans 1h" n'existe plus

#### Test 1.2 : "Dès que possible" → Standard Grisé
- [ ] Cliquer sur "Dès que possible"
- [ ] Vérifier que la formule **Standard** est **grisée** (opacité 50%, cursor not-allowed)
- [ ] Vérifier que **Express** et **Flash** sont **actifs**
- [ ] Vérifier qu'on ne peut **pas cliquer** sur Standard

#### Test 1.3 : Créneau < 60 min → Standard Grisé
- [ ] Cliquer sur "Choisir un créneau"
- [ ] Sélectionner une date/heure dans **moins de 60 minutes**
- [ ] Vérifier que Standard est **grisé**
- [ ] Vérifier le **message d'alerte** : "La formule Standard n'est pas disponible pour un créneau dans moins d'1 heure"

#### Test 1.4 : Créneau ≥ 60 min → Standard Actif
- [ ] Cliquer sur "Choisir un créneau"
- [ ] Sélectionner une date/heure dans **plus de 60 minutes**
- [ ] Vérifier que Standard est **actif** (cliquable, couleurs normales)
- [ ] Vérifier qu'il n'y a **pas de message d'alerte**

#### Test 1.5 : Changement Dynamique
- [ ] Sélectionner "Dès que possible" (Standard grisé)
- [ ] Changer pour "Choisir un créneau" avec délai > 60 min
- [ ] Vérifier que Standard se **réactive automatiquement**
- [ ] Revenir à "Dès que possible"
- [ ] Vérifier que Standard se **grise à nouveau**

---

### 🟠 **Interface Admin** (`CreateOrderModal.tsx`)

#### Test 2.1 : Bouton "Dans 1h" Supprimé
- [ ] Ouvrir le modal de création de commande admin
- [ ] Vérifier qu'il n'y a que **2 boutons** : "Dès que possible" et "Choisir un créneau"

#### Test 2.2 : "Dès que possible" → Standard Grisé
- [ ] Cliquer sur "Dès que possible"
- [ ] Vérifier que Standard est **grisé**
- [ ] Vérifier que Express et Flash sont **actifs**

#### Test 2.3 : Créneau < 60 min → Standard Grisé
- [ ] Cliquer sur "Choisir un créneau"
- [ ] Sélectionner une date/heure dans **moins de 60 minutes**
- [ ] Vérifier que Standard est **grisé**

#### Test 2.4 : Créneau ≥ 60 min → Standard Actif
- [ ] Cliquer sur "Choisir un créneau"
- [ ] Sélectionner une date/heure dans **plus de 60 minutes**
- [ ] Vérifier que Standard est **actif**

#### Test 2.5 : Cohérence Client/Admin
- [ ] Comparer le comportement entre interface client et admin
- [ ] Vérifier que la logique est **identique**

---

### 🟢 **Page Commande Sans Compte** (`CommandeSansCompte.tsx`)

#### Test 3.1 : Bouton "Dans 1h" Supprimé
- [ ] Accéder à la page de commande sans compte
- [ ] Vérifier qu'il n'y a que **2 boutons** : "Dès que possible" et "Choisir un créneau"

#### Test 3.2 : "Dès que possible" → Standard Grisé
- [ ] Cliquer sur "Dès que possible"
- [ ] Vérifier que Standard est **grisé**

#### Test 3.3 : Créneau < 60 min → Standard Grisé + Message
- [ ] Cliquer sur "Choisir un créneau"
- [ ] Sélectionner une date/heure dans **moins de 60 minutes**
- [ ] Vérifier que Standard est **grisé**
- [ ] Vérifier le **message d'alerte**

#### Test 3.4 : Créneau ≥ 60 min → Standard Actif
- [ ] Sélectionner une date/heure dans **plus de 60 minutes**
- [ ] Vérifier que Standard est **actif**
- [ ] Vérifier qu'il n'y a **pas de message d'alerte**

---

### 🟣 **Wizard Admin** (Si utilisé)

#### Test 4.1 : StepSchedule - Bouton "Dans 1h" Supprimé
- [ ] Accéder au wizard de création de commande
- [ ] Aller à l'étape "Horaires"
- [ ] Vérifier qu'il n'y a que **2 options** : "Dès que possible" et "Choisir un créneau"

#### Test 4.2 : WizardSummary - Pas de référence "Dans 1h"
- [ ] Sélectionner différentes options
- [ ] Vérifier que le récapitulatif n'affiche jamais "Dans 1h"

---

## 🎨 Critères Visuels

### Formule Standard Grisée
- [ ] **Opacité** : 50%
- [ ] **Curseur** : `cursor-not-allowed`
- [ ] **Fond** : `bg-gray-50`
- [ ] **Bordure** : `border-gray-200`
- [ ] **Icône** : `text-gray-300`
- [ ] **Texte** : `text-gray-400`
- [ ] **Prix** : Non affiché

### Formule Standard Active
- [ ] **Opacité** : 100%
- [ ] **Curseur** : `cursor-pointer`
- [ ] **Fond** : `bg-[#FFCC00]/10` (si sélectionné) ou `bg-white`
- [ ] **Bordure** : `border-[#FFCC00]` (si sélectionné) ou `border-gray-100`
- [ ] **Icône** : `text-[#0B2D55]` (si sélectionné) ou `text-gray-400`
- [ ] **Texte** : `text-[#0B2D55]` (si sélectionné) ou `text-gray-500`
- [ ] **Prix** : Affiché

---

## 🔍 Tests de Cas Limites

### Cas Limite 1 : Exactement 60 minutes
- [ ] Sélectionner un créneau dans **exactement 60 minutes**
- [ ] Vérifier que Standard est **actif** (≥ 60 min)

### Cas Limite 2 : 59 minutes
- [ ] Sélectionner un créneau dans **59 minutes**
- [ ] Vérifier que Standard est **grisé** (< 60 min)

### Cas Limite 3 : Changement de Date/Heure
- [ ] Sélectionner un créneau > 60 min (Standard actif)
- [ ] Modifier pour < 60 min
- [ ] Vérifier que Standard se **grise automatiquement**

### Cas Limite 4 : Pas de Créneau Sélectionné
- [ ] Cliquer sur "Choisir un créneau"
- [ ] Ne pas sélectionner de date/heure
- [ ] Vérifier que Standard est **actif** (pas de restriction)

---

## 📱 Tests Responsive

### Desktop
- [ ] Tester sur écran large (≥ 1024px)
- [ ] Vérifier que la grille des formules s'affiche correctement

### Tablet
- [ ] Tester sur tablette (768px - 1023px)
- [ ] Vérifier que les boutons sont bien disposés

### Mobile
- [ ] Tester sur mobile (< 768px)
- [ ] Vérifier que les formules restent cliquables
- [ ] Vérifier que le message d'alerte est lisible

---

## 🌐 Tests Navigateurs

- [ ] **Chrome** : Tester toutes les fonctionnalités
- [ ] **Firefox** : Tester toutes les fonctionnalités
- [ ] **Safari** : Tester toutes les fonctionnalités
- [ ] **Edge** : Tester toutes les fonctionnalités

---

## ⚡ Tests de Performance

- [ ] Vérifier que le calcul du délai est **instantané**
- [ ] Vérifier qu'il n'y a **pas de lag** lors du changement d'option
- [ ] Vérifier que le `useEffect` ne cause **pas de re-renders excessifs**

---

## 🐛 Tests de Régression

- [ ] Vérifier que les formules **Express** et **Flash** fonctionnent toujours
- [ ] Vérifier que le **calcul de prix** fonctionne toujours
- [ ] Vérifier que la **soumission de commande** fonctionne toujours
- [ ] Vérifier que les **autres champs** du formulaire fonctionnent toujours

---

## 📊 Résultats

### Résumé
- **Total de tests** : _____ / _____
- **Tests réussis** : _____
- **Tests échoués** : _____

### Problèmes Identifiés
1. _____________________________
2. _____________________________
3. _____________________________

### Actions Correctives
1. _____________________________
2. _____________________________
3. _____________________________

---

## ✅ Validation Finale

- [ ] Tous les tests sont **passés**
- [ ] Aucun bug critique n'a été identifié
- [ ] L'UX est **fluide** et **intuitive**
- [ ] La logique est **cohérente** sur toutes les interfaces
- [ ] La documentation est **à jour**

---

**Date de validation** : _______________  
**Validé par** : _______________  
**Statut** : ⬜ En cours | ⬜ Validé | ⬜ À corriger

---

🎉 **Prêt pour la production !**
