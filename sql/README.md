# 🚀 SCRIPT UNIQUE - Installation complète du système chauffeur

## ⚡ UN SEUL SCRIPT À EXÉCUTER

### 🔗 Ouvrir Supabase SQL Editor
https://supabase.com/dashboard/project/dnwqyjsxnfnmfxkpiwtl/sql

### 📝 Quel script exécuter ?

**Vous avez 2 options selon votre situation :**

---

## Option 1️⃣ : Installation complète (RECOMMANDÉ)

**Si vous installez pour la première fois OU si vous voulez tout réinitialiser**

**Exécutez :**
```
sql/FINAL_COMPLETE_DRIVER_SYSTEM.sql
```

**Ce script fait :**
- ✅ Crée la fonction `create_driver_user`
- ✅ Configure les permissions RLS
- ✅ Nettoie les données incorrectes
- ✅ Crée un chauffeur de test
- ✅ Vérifie que tout fonctionne

---

## Option 2️⃣ : Réparation d'urgence (Si erreur 500)

**Si vous avez l'erreur "Database error querying schema"**

**Exécutez :**
```
sql/fix_database.sql
```

**Ce script fait :**
- ✅ Répare les triggers défaillants
- ✅ Crée les profils manquants
- ✅ Résout l'erreur 500
- ✅ Ne touche PAS aux données existantes

**Puis exécutez aussi :**
```
sql/FINAL_COMPLETE_DRIVER_SYSTEM.sql
```

---

## 🎯 Ordre recommandé si vous avez des problèmes

```bash
1. fix_database.sql          # Répare les triggers
2. FINAL_COMPLETE_DRIVER_SYSTEM.sql  # Configure le système chauffeur
```

---

## ✅ Après l'exécution

### Tester la connexion chauffeur

**Application chauffeur :**
```bash
cd "c:\Users\CHERK\Desktop\projet\one-connexion-driver-80-main"
npm run dev
```

**Connectez-vous avec :**
- Identifiant : `test123`
- Mot de passe : `password123`

### Créer un nouveau chauffeur

**Application admin :**
```bash
cd "c:\Users\CHERK\Desktop\projet\one connexion fini"
npm run dev
```

1. Se connecter en admin
2. Dashboard Admin → Chauffeurs → "Nouveau Chauffeur"
3. Remplir le formulaire
4. Tester la connexion du nouveau chauffeur

---

## 📋 Checklist complète

- [ ] Script(s) exécuté(s) dans Supabase
- [ ] Fonction `create_driver_user` existe
- [ ] Trigger `handle_new_user` créé
- [ ] Permissions RLS configurées
- [ ] Chauffeur test123 créé
- [ ] Connexion test123 réussie
- [ ] Création nouveau chauffeur depuis admin réussie
- [ ] Connexion nouveau chauffeur réussie

---

## 🆘 En cas de problème

### Erreur 500 "Database error"
→ Exécutez `sql/fix_database.sql`

### Chauffeur ne peut pas se connecter
→ Vérifiez le format email dans Supabase :
```sql
SELECT email FROM auth.users WHERE email LIKE '%@driver.%';
```
Doit afficher `xxx@driver.local` (PAS `@driver.oneconnexion`)

### Chauffeur créé dans table clients
→ Exécutez `sql/verify_no_drivers_in_clients.sql`

---

## 📚 Documentation complète

- `URGENCE_FIX_500.md` - Résoudre l'erreur 500
- `INSTALLATION_FINALE.md` - Guide d'installation
- `DEPANNAGE_CONNEXION.md` - Problèmes de connexion
- `FIX_CRITICAL_NO_DRIVERS_IN_CLIENTS.md` - Chauffeurs dans clients

---

**Commencez par exécuter le(s) script(s) dans Supabase ! 🚀**
