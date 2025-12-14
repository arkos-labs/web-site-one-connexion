# ⚡ NOUVEAU SCRIPT - Nettoyage COMPLET

## 🆕 Fichier créé

**`1_RESET_CHAUFFEURS_COMPLET.sql`**

Ce script supprime **TOUTES** les données liées aux chauffeurs dans **TOUTES** les tables :
- ✅ `auth.users`
- ✅ `public.profiles`
- ✅ `public.drivers`
- ✅ `public.orders` (commandes des chauffeurs)
- ✅ `public.vehicles` (véhicules)
- ✅ `public.driver_documents` (documents)
- ✅ `public.driver_positions` (positions GPS)
- ✅ `public.driver_earnings` (revenus)
- ✅ Tous les triggers
- ✅ Toutes les policies
- ✅ Toutes les fonctions

---

## 🚀 EXÉCUTION

### 1️⃣ Ouvrir Supabase
https://supabase.com/dashboard/project/dnwqyjsxnfnmfxkpiwtl/sql

### 2️⃣ Exécuter le nouveau script

**Ouvrez :**
```
c:\Users\CHERK\Desktop\projet\one connexion fini\sql\1_RESET_CHAUFFEURS_COMPLET.sql
```

**Copiez tout :**
- Ctrl + A
- Ctrl + C

**Exécutez dans Supabase :**
- Collez (Ctrl + V)
- Cliquez sur "Run"

### 3️⃣ Vérifier le résultat

Vous devriez voir :
- ✅ Chauffeurs dans auth.users : 0
- ✅ Profils chauffeurs : 0
- ✅ Entrées dans drivers : 0
- ✅ Commandes de chauffeurs : 0
- ✅ Aucun trigger
- ✅ Aucune policy

---

## 📋 PUIS CONTINUER AVEC

### 2️⃣ `2_SETUP_CHAUFFEURS_PROPRE.sql`
Reconstruit le système proprement

### 3️⃣ `3_VERIFICATION_FINALE.sql`
Vérifie que tout fonctionne

---

**Exécutez `1_RESET_CHAUFFEURS_COMPLET.sql` maintenant ! 🚀**
