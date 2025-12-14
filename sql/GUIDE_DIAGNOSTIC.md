# 🔍 DIAGNOSTIC COMPLET - Mode d'emploi

## 🚀 EXÉCUTION

### 1️⃣ Ouvrir Supabase SQL Editor
🔗 https://supabase.com/dashboard/project/dnwqyjsxnfnmfxkpiwtl/sql

### 2️⃣ Exécuter le diagnostic

**Copiez tout le contenu de :**
```
sql/DIAGNOSTIC_COMPLET.sql
```

**Collez dans Supabase et cliquez sur "Run" ▶️**

### 3️⃣ Analyser les résultats

Le script va afficher **14 sections** de diagnostic.

---

## 📊 INTERPRÉTATION DES RÉSULTATS

### Section 1 : Tables existantes
✅ **Attendu :** profiles, drivers, clients, admins doivent exister
❌ **Si manquant :** Exécutez `fix_database.sql`

### Section 2-3 : Structure des tables
✅ **Attendu :** 
- `profiles` : colonnes id, role, email, first_name, last_name, phone
- `drivers` : colonnes user_id, first_name, last_name, email, phone, status, vehicle_type, vehicle_registration

❌ **Si différent :** Structure incorrecte, besoin de migration

### Section 4 : Triggers sur auth.users
✅ **Attendu :** 1 trigger `handle_new_user` AFTER INSERT
❌ **Si 0 triggers :** Exécutez `fix_database.sql`
❌ **Si plusieurs triggers :** Conflit, exécutez `fix_database.sql`

### Section 5 : Fonctions triggers
✅ **Attendu :** Fonction `handle_new_user` existe
❌ **Si manquante :** Exécutez `fix_database.sql`

### Section 6 : Fonction create_driver_user
✅ **Attendu :** Fonction existe avec SECURITY DEFINER
❌ **Si manquante :** Exécutez `FINAL_COMPLETE_DRIVER_SYSTEM.sql`

### Section 7 : Permissions RLS
✅ **Attendu :** 
- RLS activé sur drivers
- 4 policies : 
  - Drivers can view own data
  - Drivers can update own data
  - Admins can view all drivers
  - Admins can manage drivers

❌ **Si manquant :** Exécutez `FINAL_COMPLETE_DRIVER_SYSTEM.sql`

### Section 8-10 : Données
✅ **Attendu :** 
- Utilisateurs dans auth.users
- Profils correspondants dans profiles
- Chauffeurs dans drivers

❌ **Si incohérent :** Voir section 11

### Section 11 : Cohérence des données
✅ **Attendu :** Tous les checks = 0 (✅ OK)

❌ **Si > 0 :**
- "Utilisateurs sans profil" → Exécutez `fix_database.sql`
- "Chauffeurs sans entrée drivers" → Exécutez `fix_database.sql`
- "Chauffeurs dans table clients" → Exécutez `verify_no_drivers_in_clients.sql`

### Section 12 : Format des emails
✅ **Attendu :** Tous les emails = `xxx@driver.local`
❌ **Si `@driver.oneconnexion` :** Exécutez `fix_existing_drivers_email.sql`

### Section 13 : Détail test123
✅ **Attendu :** 3 lignes (auth.users, profiles, drivers)
❌ **Si < 3 lignes :** Chauffeur incomplet, recréez-le

### Section 14 : Erreurs potentielles
✅ **Attendu :** Aucune ligne retournée
❌ **Si des lignes :** Problèmes de doublons ou orphelins

---

## 🎯 ACTIONS SELON LES RÉSULTATS

### Scénario 1 : Triggers manquants ou multiples
```bash
→ Exécutez : sql/fix_database.sql
```

### Scénario 2 : Fonction create_driver_user manquante
```bash
→ Exécutez : sql/FINAL_COMPLETE_DRIVER_SYSTEM.sql
```

### Scénario 3 : Permissions RLS manquantes
```bash
→ Exécutez : sql/fix_drivers_rls.sql
```

### Scénario 4 : Données incohérentes
```bash
→ Exécutez : sql/fix_database.sql
→ Puis : sql/FINAL_COMPLETE_DRIVER_SYSTEM.sql
```

### Scénario 5 : Format email incorrect
```bash
→ Exécutez : sql/fix_existing_drivers_email.sql
```

### Scénario 6 : Chauffeurs dans clients
```bash
→ Exécutez : sql/verify_no_drivers_in_clients.sql
```

---

## 📋 CHECKLIST DE SANTÉ

Une base de données saine doit avoir :

- [ ] ✅ Table `profiles` existe
- [ ] ✅ Table `drivers` existe
- [ ] ✅ 1 trigger `handle_new_user` sur auth.users
- [ ] ✅ Fonction `handle_new_user` existe
- [ ] ✅ Fonction `create_driver_user` existe
- [ ] ✅ 4 policies RLS sur drivers
- [ ] ✅ 0 utilisateurs sans profil
- [ ] ✅ 0 chauffeurs sans entrée drivers
- [ ] ✅ 0 chauffeurs dans table clients
- [ ] ✅ Tous les emails = `@driver.local`
- [ ] ✅ Chauffeur test123 complet (3 tables)

---

## 🆘 SI TOUT EST ROUGE

**Exécutez dans l'ordre :**

```bash
1. sql/fix_database.sql
2. sql/FINAL_COMPLETE_DRIVER_SYSTEM.sql
3. sql/DIAGNOSTIC_COMPLET.sql (pour vérifier)
```

---

**Exécutez le diagnostic et partagez-moi les résultats ! 🔍**
