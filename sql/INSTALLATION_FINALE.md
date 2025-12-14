# 🚀 INSTALLATION FINALE - Système Chauffeur

## ⚡ ACTION UNIQUE - 2 MINUTES

### 1️⃣ Ouvrir Supabase SQL Editor
🔗 https://supabase.com/dashboard/project/dnwqyjsxnfnmfxkpiwtl/sql

### 2️⃣ Exécuter UN SEUL script

**Copiez tout le contenu de :**
```
sql/FINAL_COMPLETE_DRIVER_SYSTEM.sql
```

**Collez dans Supabase et cliquez sur "Run" ▶️**

### 3️⃣ Vérifier le résultat

Vous devriez voir :
- ✅ Fonction create_driver_user existe
- ✅ 4 policies RLS créées
- ✅ Chauffeur test123 créé
- ✅ 0 chauffeurs dans clients

### 4️⃣ Tester la connexion chauffeur

**Application chauffeur :**
```bash
cd "c:\Users\CHERK\Desktop\projet\one-connexion-driver-80-main"
npm run dev
```

**Connectez-vous avec :**
- Identifiant : `test123`
- Mot de passe : `password123`

✅ **Ça devrait fonctionner !**

---

## 🎯 Créer un nouveau chauffeur depuis l'Admin

### 1️⃣ Lancer l'application Admin
```bash
cd "c:\Users\CHERK\Desktop\projet\one connexion fini"
npm run dev
```

### 2️⃣ Se connecter en Admin
- Email : `cherkinicolas@gmail.com`
- Mot de passe : `admin123`

### 3️⃣ Créer un chauffeur
1. Dashboard Admin → Chauffeurs
2. Cliquer sur "Nouveau Chauffeur"
3. Remplir le formulaire
4. Valider

### 4️⃣ Tester la connexion du nouveau chauffeur
Retournez sur l'app chauffeur et connectez-vous avec les identifiants créés

---

## ✅ C'est tout !

**Un seul script à exécuter :** `FINAL_COMPLETE_DRIVER_SYSTEM.sql`

**Tout est configuré :**
- ✅ Fonction RPC create_driver_user
- ✅ Permissions RLS
- ✅ Format email standardisé (@driver.local)
- ✅ Rôle 'driver' dans métadonnées
- ✅ Nettoyage des données incorrectes
- ✅ Chauffeur de test créé

**Prêt à utiliser ! 🎉**
