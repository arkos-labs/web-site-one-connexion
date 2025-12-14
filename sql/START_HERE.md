# 🚀 DÉMARRAGE RAPIDE - Réinitialisation Base de Données

## ⚡ Commencer Ici !

Vous voulez **supprimer toute la base de données** et repartir avec une architecture propre et optimisée.

---

## 📋 Étapes à Suivre

### 1️⃣ **Lire la Documentation**

Avant de commencer, lisez ces fichiers :

- 📖 **`GUIDE_RESET.md`** - Guide complet avec toutes les instructions
- 📖 **`NOUVELLE_ARCHITECTURE.md`** - Explication de la nouvelle architecture (si créé)

### 2️⃣ **Comprendre ce qui va être supprimé**

⚠️ **Le script va supprimer** :
- ✅ **TOUS les utilisateurs** de `auth.users` (admins, clients, chauffeurs)
- ✅ **TOUTES les tables** de la base de données
- ✅ **TOUS les triggers** et fonctions
- ✅ **TOUTES les données** (commandes, messages, etc.)

**Résultat** : Base de données **complètement vide** et prête à repartir de zéro.

### 3️⃣ **Sauvegarder (si nécessaire)**

⚠️ **IMPORTANT** : Si vous avez des données à conserver :

```sql
-- Ouvrir Supabase SQL Editor et exécuter :
CREATE TABLE backup_profiles AS SELECT * FROM profiles;
CREATE TABLE backup_orders AS SELECT * FROM orders;
CREATE TABLE backup_drivers AS SELECT * FROM drivers;
```

### 4️⃣ **Exécuter le Script**

1. Ouvrir **Supabase Dashboard** → **SQL Editor**
2. Créer une **nouvelle query**
3. Copier-coller le contenu de **`RESET_DATABASE.sql`**
4. Cliquer sur **Run** (▶️)
5. Attendre la fin de l'exécution (~30 secondes)

### 5️⃣ **Vérifier**

Exécuter le script de vérification **`VERIFICATION_RESET.sql`** :

```sql
-- Copier-coller le contenu de VERIFICATION_RESET.sql
-- Cliquer sur Run
```

**Résultat attendu** :
```
✅ 9 tables créées
✅ 0 utilisateurs
✅ 0 profils
✅ 1 trigger (handle_new_user)
✅ Plusieurs policies RLS
```

### 6️⃣ **Tester**

Créer un utilisateur test depuis votre application :

```typescript
// Inscription test
await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'test123',
  options: {
    data: {
      first_name: 'Test',
      last_name: 'User',
      role: 'client',
      company_name: 'Test Company'
    }
  }
});
```

Vérifier dans Supabase :
```sql
SELECT * FROM profiles WHERE email = 'test@example.com';
```

---

## 📊 Nouvelle Architecture

### Tables Principales

```
profiles (TABLE CENTRALE)
├── Tous les utilisateurs (admin, client, chauffeur)
├── Informations de base
└── Informations spécifiques par rôle

drivers
├── Infos opérationnelles des chauffeurs
├── Statut (online/offline)
└── Véhicule principal

driver_vehicles
└── Gestion multi-véhicules

driver_documents
└── Documents (permis, assurance, etc.)

orders
└── Commandes de livraison

conversations + messages
└── Messagerie unifiée

invoices
└── Factures

plaintes
└── Réclamations
```

---

## ✅ Checklist

- [ ] J'ai lu `GUIDE_RESET.md`
- [ ] J'ai sauvegardé mes données (si nécessaire)
- [ ] J'ai exécuté `RESET_DATABASE.sql`
- [ ] J'ai vérifié que les tables sont créées
- [ ] J'ai testé la création d'un utilisateur
- [ ] Tout fonctionne ✨

---

## 🎯 Résultat Final

Après avoir suivi ces étapes, vous aurez :

| Avant | Après |
|-------|-------|
| 15+ tables redondantes | 9 tables optimisées ✅ |
| 4 tables utilisateurs | 1 table centrale ✅ |
| Architecture complexe | Architecture simple ✅ |
| Requêtes lentes | Requêtes rapides ✅ |

---

## 🆘 Besoin d'Aide ?

### Problème : "Table already exists"
➡️ Le script supprime automatiquement les tables existantes. Si l'erreur persiste, exécutez d'abord :
```sql
DROP TABLE IF EXISTS profiles CASCADE;
```

### Problème : "Permission denied"
➡️ Vérifiez que vous êtes connecté en tant que propriétaire du projet Supabase.

### Problème : "Trigger not working"
➡️ Vérifiez que le trigger existe :
```sql
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'handle_new_user';
```

---

## 📞 Prochaines Étapes

Après la réinitialisation :

1. **Mettre à jour le code** :
   - Remplacer `admins` par `profiles` avec `role='admin'`
   - Remplacer `clients` par `profiles` avec `role='client'`
   - Simplifier les requêtes

2. **Tester les fonctionnalités** :
   - Inscription
   - Connexion
   - Création de commandes
   - Messagerie

3. **Développer l'interface admin** :
   - Validation des chauffeurs
   - Gestion des documents
   - Approbation/Refus

---

**Prêt ?** → Ouvrez `RESET_DATABASE.sql` dans Supabase SQL Editor et cliquez sur **Run** ! 🚀
