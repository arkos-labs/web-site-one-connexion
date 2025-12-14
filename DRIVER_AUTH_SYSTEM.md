# 🚀 Système d'Inscription Chauffeur - Modèle Uber

## 📋 Vue d'ensemble

Ce système permet aux chauffeurs de s'inscrire via l'application web avec un **vrai email** et un **numéro de téléphone**. Leur compte reste en **attente de validation** jusqu'à ce qu'un administrateur l'approuve.

---

## 🔄 Flux d'Inscription

### 1. **Inscription Chauffeur (Application Web)**

Le chauffeur s'inscrit via la page d'inscription avec les informations suivantes :
- ✅ **Nom complet**
- ✅ **Email professionnel** (vrai email, plus d'identifiant fictif)
- ✅ **Téléphone**
- ✅ **Mot de passe**

**Changements importants :**
- ❌ **Supprimé** : Champ "Identifiant" (ex: CHAUFF01)
- ✅ **Ajouté** : Email réel + Téléphone
- ✅ Le `driver_id` sera généré **par l'admin** lors de la validation

### 2. **Validation Administrative**

Après l'inscription :
1. Le compte est créé avec le statut `status = 'pending'`
2. L'administrateur reçoit une notification (à implémenter)
3. L'admin peut :
   - ✅ **Approuver** : `status = 'approved'` + génération du `driver_id`
   - ❌ **Refuser** : `status = 'rejected'`

### 3. **Connexion Chauffeur (Application Mobile)**

Lors de la connexion :
1. Le chauffeur entre son **identifiant** (généré par l'admin) + **mot de passe**
2. Le système vérifie le `status` dans la table `profiles`
3. **Logique de sécurité** :
   - Si `status = 'pending'` → ❌ **Connexion refusée** + Message : "Votre dossier est en cours de validation"
   - Si `status = 'rejected'` → ❌ **Connexion refusée** + Message : "Votre demande a été refusée"
   - Si `status = 'approved'` → ✅ **Connexion autorisée** → Redirection vers le Dashboard

---

## 🗄️ Structure de la Base de Données

### Table `profiles` (Modifiée)

```sql
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY,
    role TEXT DEFAULT 'client',
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,                    -- ✅ NOUVEAU
    status TEXT DEFAULT 'pending', -- ✅ NOUVEAU (pending, approved, rejected)
    driver_id TEXT UNIQUE,         -- ✅ NOUVEAU (généré par l'admin)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Trigger `handle_new_user` (Modifié)

Le trigger a été mis à jour pour :
- Récupérer le `phone` depuis les métadonnées
- Définir `status = 'pending'` pour les chauffeurs
- Définir `status = 'approved'` pour les clients/admins
- Laisser `driver_id = NULL` (sera rempli par l'admin)

---

## 📝 Fichiers Modifiés

### Application Web (`one connexion fini`)

1. **`sql/update_driver_flow.sql`** ✅
   - Ajout des colonnes `status`, `driver_id`, `phone`
   - Mise à jour du trigger `handle_new_user`

2. **`src/pages/auth/AuthPage.tsx`** ✅
   - Suppression du champ "Identifiant" pour les chauffeurs
   - Ajout des champs "Email" et "Téléphone"
   - Vérification du `status` lors du login
   - Déconnexion automatique si `status = 'pending'` ou `'rejected'`

### Application Mobile (`one-connexion-driver-80-main`)

1. **`sql/update_driver_flow.sql`** ✅
   - Même script SQL que l'application web

2. **`src/pages/Login.tsx`** ✅
   - Ajout de la vérification du `status` après l'authentification
   - Déconnexion automatique si le compte n'est pas validé
   - Messages d'erreur clairs pour l'utilisateur

3. **`TODO.md`** ✅
   - Ajout de la tâche complétée

---

## 🔐 Logique de Sécurité

### Lors du Login (Application Mobile)

```typescript
// 1. Authentification Supabase
const { data: authData } = await supabase.auth.signInWithPassword({
  email: `${username}@driver.local`,
  password: password,
});

// 2. Vérification du statut
const { data: profileData } = await supabase
  .from('profiles')
  .select('status')
  .eq('id', authData.user.id)
  .single();

// 3. Bloquer si non validé
if (profileData.status === 'pending') {
  await supabase.auth.signOut();
  // Afficher message d'erreur
  return;
}

// 4. Continuer si approuvé
if (profileData.status === 'approved') {
  // Charger le profil chauffeur
  // Rediriger vers le dashboard
}
```

---

## 📌 Prochaines Étapes

### 1. **Exécuter le Script SQL** ⏳
```bash
# Dans Supabase SQL Editor
# Exécuter : sql/update_driver_flow.sql
```

### 2. **Interface Admin (À développer)** 🚧
- Page de gestion des demandes d'inscription
- Liste des chauffeurs en attente (`status = 'pending'`)
- Boutons "Approuver" / "Refuser"
- Génération automatique du `driver_id` lors de l'approbation
- Envoi d'email de notification au chauffeur

### 3. **Notifications Email** 🚧
- Email de confirmation d'inscription (chauffeur)
- Email de validation (admin)
- Email d'approbation (chauffeur)
- Email de refus (chauffeur)

---

## ✅ Avantages de ce Système

1. **Sécurité renforcée** : Validation manuelle par l'admin
2. **Emails réels** : Communication directe avec les chauffeurs
3. **Traçabilité** : Historique des statuts
4. **Flexibilité** : Possibilité de refuser ou suspendre un compte
5. **Conformité** : Respect des bonnes pratiques (modèle Uber)

---

## 🎯 Résumé des Changements

| Avant | Après |
|-------|-------|
| Inscription avec identifiant fictif (CHAUFF01) | Inscription avec email réel |
| Connexion immédiate | Connexion après validation admin |
| Pas de téléphone | Téléphone obligatoire |
| Pas de statut | Statut : pending / approved / rejected |
| `driver_id` créé par le chauffeur | `driver_id` généré par l'admin |

---

**Date de mise à jour** : 2025-12-13  
**Version** : 1.0  
**Statut** : ✅ Implémenté (En attente d'exécution SQL)
