# 🧪 GUIDE DE TEST COMPLET - One Connexion

**Date**: 2025-12-07  
**Version**: 1.0  
**Phase**: 5 - Validations & Tests

---

## 📋 TABLE DES MATIÈRES

1. [Tests Base de Données](#1-tests-base-de-données)
2. [Tests Authentification](#2-tests-authentification)
3. [Tests Admin Dashboard](#3-tests-admin-dashboard)
4. [Tests Client Dashboard](#4-tests-client-dashboard)
5. [Tests Commandes](#5-tests-commandes)
6. [Tests Tarification](#6-tests-tarification)
7. [Tests Véhicules & Documents](#7-tests-véhicules--documents)
8. [Tests Sécurité](#8-tests-sécurité)
9. [Tests Performance](#9-tests-performance)
10. [Checklist Finale](#10-checklist-finale)

---

## 1. TESTS BASE DE DONNÉES

### Test 1.1 : Vérification des tables

**Objectif** : S'assurer que toutes les tables sont créées

**Instructions** :
```sql
1. Va sur Supabase > SQL Editor
2. Copie le contenu de: sql/verify_database.sql
3. Exécute section par section
4. Vérifie les résultats
```

**Résultat attendu** :
```
✅ 9 tables créées minimum:
   - admins
   - clients
   - drivers
   - orders
   - invoices
   - messages
   - tariff_metadata (4 lignes)
   - vehicles
   - driver_documents
```

---

### Test 1.2 : Vérification RLS

**Objectif** : S'assurer que la sécurité est active

**Instructions** :
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Résultat attendu** :
```
✅ rowsecurity = true pour:
   - tariff_metadata
   - vehicles
   - driver_documents
   - orders
   - invoices
```

---

### Test 1.3 : Vérification des données de test

**Objectif** : Vérifier qu'il y a des données pour tester

**Instructions** :
```sql
SELECT 
    'Admins' as table_name, COUNT(*) FROM admins
UNION ALL
SELECT 'Clients', COUNT(*) FROM clients
UNION ALL
SELECT 'Drivers', COUNT(*) FROM drivers;
```

**Résultat attendu** :
```
✅ Au moins 1 admin
✅ Au moins 1 client
⚠️ Drivers peuvent être 0 (normal)
```

---

## 2. TESTS AUTHENTIFICATION

### Test 2.1 : Connexion Admin

**Objectif** : Vérifier que l'admin peut se connecter

**Instructions** :
```
1. Va sur http://localhost:8081/login
2. Email: cherkinicolas@gmail.com
3. Password: 25031997
4. Clique "Se connecter"
```

**Résultat attendu** :
```
✅ Redirection vers /admin/dashboard
✅ Menu admin visible à gauche
✅ Nom de l'admin affiché en haut
```

---

### Test 2.2 : Connexion Client

**Objectif** : Vérifier que le client peut se connecter

**Instructions** :
```
1. Déconnecte-toi (si connecté en admin)
2. Va sur http://localhost:8081/login
3. Email: keisha.khotothinu@gmail.com
4. Password: 25031997
5. Clique "Se connecter"
```

**Résultat attendu** :
```
✅ Redirection vers /client/dashboard
✅ Menu client visible à gauche
✅ Nom du client affiché en haut
```

---

### Test 2.3 : Mot de passe oublié

**Objectif** : Vérifier le flow de réinitialisation

**Instructions** :
```
1. Va sur http://localhost:8081/forgot-password
2. Entre un email valide
3. Clique "Envoyer le lien"
```

**Résultat attendu** :
```
✅ Message de succès affiché
✅ Texte: "Si un compte existe avec l'adresse..."
✅ Bouton "Retour à la connexion" fonctionne
```

---

## 3. TESTS ADMIN DASHBOARD

### Test 3.1 : Page Dashboard

**Objectif** : Vérifier que le dashboard admin se charge

**Instructions** :
```
1. Connecte-toi en admin
2. Va sur /admin/dashboard
```

**Résultat attendu** :
```
✅ Page se charge sans erreur
✅ Statistiques affichées (commandes, revenus, etc.)
✅ Graphiques visibles
✅ Activité récente affichée
```

---

### Test 3.2 : Page Commandes

**Objectif** : Vérifier la gestion des commandes

**Instructions** :
```
1. Va sur /admin/orders
2. Vérifie la liste des commandes
3. Clique sur une commande pour voir les détails
```

**Résultat attendu** :
```
✅ Liste des commandes affichée
✅ Filtres fonctionnent (statut, date)
✅ Recherche fonctionne
✅ Détails de commande s'affichent
```

---

### Test 3.3 : Page Chauffeurs

**Objectif** : Vérifier la gestion des chauffeurs

**Instructions** :
```
1. Va sur /admin/drivers
2. Vérifie la liste des chauffeurs
3. Clique sur "Ajouter un chauffeur"
```

**Résultat attendu** :
```
✅ Liste des chauffeurs affichée
✅ Colonnes: Nom, Email, Téléphone, Statut, Véhicule
✅ Modal de création s'ouvre
✅ Formulaire de création fonctionne
```

---

### Test 3.4 : Page Clients

**Objectif** : Vérifier la gestion des clients

**Instructions** :
```
1. Va sur /admin/clients
2. Vérifie la liste des clients
3. Clique sur un client pour voir les détails
```

**Résultat attendu** :
```
✅ Liste des clients affichée
✅ Pagination fonctionne
✅ Recherche fonctionne
✅ Détails client s'affichent
```

---

### Test 3.5 : Page Paramètres

**Objectif** : Vérifier la modification des tarifs

**Instructions** :
```
1. Va sur /admin/settings
2. Clique sur l'onglet "Tarifs"
3. Change "Valeur du Bon" de 5.5 à 6.0
4. Clique "Mettre à jour les tarifs"
```

**Résultat attendu** :
```
✅ Formulaire affiché avec 4 champs
✅ Valeurs actuelles chargées depuis DB
✅ Message de succès après sauvegarde
✅ Cache invalidé automatiquement
```

---

## 4. TESTS CLIENT DASHBOARD

### Test 4.1 : Page Dashboard Client

**Objectif** : Vérifier le dashboard client

**Instructions** :
```
1. Connecte-toi en client
2. Va sur /client/dashboard
```

**Résultat attendu** :
```
✅ Page se charge
✅ Statistiques personnelles affichées
✅ Commandes récentes visibles
✅ Bouton "Nouvelle commande" fonctionne
```

---

### Test 4.2 : Page Mes Commandes

**Objectif** : Vérifier l'historique des commandes

**Instructions** :
```
1. Va sur /client/orders
2. Vérifie la liste des commandes
3. Clique sur une commande
```

**Résultat attendu** :
```
✅ Liste des commandes du client
✅ Filtres par statut fonctionnent
✅ Détails de commande s'affichent
✅ Suivi en temps réel visible
```

---

### Test 4.3 : Page Factures

**Objectif** : Vérifier l'accès aux factures

**Instructions** :
```
1. Va sur /client/invoices
2. Vérifie la liste des factures
```

**Résultat attendu** :
```
✅ Liste des factures affichée
✅ Statut (payé/impayé) visible
✅ Bouton "Télécharger" fonctionne
✅ Montants corrects
```

---

## 5. TESTS COMMANDES

### Test 5.1 : Commande sans compte

**Objectif** : Créer une commande en tant qu'invité

**Instructions** :
```
1. Déconnecte-toi
2. Va sur /commande-sans-compte
3. Remplis le formulaire:
   - Départ: Paris
   - Arrivée: Versailles
   - Type: Colis
   - Nom: Test User
   - Email: test@example.com
   - Téléphone: 0612345678
4. Clique "Commander"
```

**Résultat attendu** :
```
✅ Prix calculé automatiquement
✅ Formules affichées (Standard, Express, Flash)
✅ Commande créée avec succès
✅ Numéro de suivi généré
```

---

### Test 5.2 : Calcul de prix dynamique

**Objectif** : Vérifier que les tarifs dynamiques fonctionnent

**Instructions** :
```
1. Modifie les tarifs dans /admin/settings (6.0€/bon)
2. Va sur /commande-sans-compte
3. Entre Paris → Versailles
4. Vérifie le prix calculé
```

**Résultat attendu** :
```
✅ Prix utilise 6.0€/bon (nouveau tarif)
✅ Exemple: 8 bons × 6.0€ = 48.00€
✅ Cache invalidé après modification
```

---

## 6. TESTS TARIFICATION

### Test 6.1 : Tarifs Paris → Banlieue

**Objectif** : Vérifier le calcul sans supplément

**Instructions** :
```
1. Va sur /commande-sans-compte
2. Départ: Paris
3. Arrivée: Versailles (18 km)
4. Vérifie le calcul
```

**Résultat attendu** :
```
✅ Prise en charge: 8 bons (Paris NORMAL)
✅ Supplément: 0 bon (Paris impliqué)
✅ Total: 8 bons = 44.00€ (avec tarif 5.5€)
```

---

### Test 6.2 : Tarifs Banlieue → Banlieue

**Objectif** : Vérifier le calcul avec supplément

**Instructions** :
```
1. Départ: Melun
2. Arrivée: Versailles (47 km)
3. Vérifie le calcul
```

**Résultat attendu** :
```
✅ Prise en charge: 25 bons (Melun NORMAL)
✅ Supplément: 4.7 bons (47 km × 0.1)
✅ Total: 29.7 bons = 163.35€
```

---

## 7. TESTS VÉHICULES & DOCUMENTS

### Test 7.1 : Ajouter un véhicule

**Objectif** : Créer un véhicule pour un chauffeur

**Instructions** :
```
1. Va sur Supabase > Table Editor > vehicles
2. Insert row:
   - driver_id: [ID d'un chauffeur]
   - brand: Peugeot
   - model: Partner
   - license_plate: AB-123-CD
   - vehicle_type: utilitaire
   - status: active
3. Va sur /admin/drivers
4. Vérifie que le véhicule s'affiche
```

**Résultat attendu** :
```
✅ Véhicule créé dans la DB
✅ Véhicule affiché dans la liste des chauffeurs
✅ Informations correctes (marque, modèle, plaque)
```

---

### Test 7.2 : Ajouter un document

**Objectif** : Créer un document pour un chauffeur

**Instructions** :
```
1. Va sur Supabase > Table Editor > driver_documents
2. Insert row:
   - driver_id: [même ID]
   - document_type: permis
   - document_name: Permis de conduire
   - file_url: https://example.com/permis.pdf
   - verification_status: approved
   - expiry_date: 2026-12-31
3. Va sur /admin/drivers
```

**Résultat attendu** :
```
✅ Document créé dans la DB
✅ Document affiché dans la liste
✅ Statut "Approuvé" visible
```

---

## 8. TESTS SÉCURITÉ

### Test 8.1 : Accès non autorisé (Admin)

**Objectif** : Vérifier que les clients ne peuvent pas accéder à l'admin

**Instructions** :
```
1. Connecte-toi en client
2. Essaie d'aller sur /admin/dashboard
```

**Résultat attendu** :
```
✅ Redirection vers /client/dashboard
✅ Message d'erreur ou accès refusé
```

---

### Test 8.2 : Accès non autorisé (Client)

**Objectif** : Vérifier que les admins ne peuvent pas accéder au client

**Instructions** :
```
1. Connecte-toi en admin
2. Essaie d'aller sur /client/dashboard
```

**Résultat attendu** :
```
✅ Redirection vers /admin/dashboard
✅ Ou message d'erreur
```

---

### Test 8.3 : RLS Tarifs

**Objectif** : Vérifier que seuls les admins peuvent modifier les tarifs

**Instructions** :
```
1. Connecte-toi en client
2. Ouvre la console du navigateur (F12)
3. Essaie de modifier un tarif:
   ```javascript
   const { data, error } = await supabase
     .from('tariff_metadata')
     .update({ value: '10.0' })
     .eq('key', 'bon_value_eur');
   console.log(error);
   ```
```

**Résultat attendu** :
```
✅ Erreur: "new row violates row-level security policy"
✅ Modification refusée
```

---

## 9. TESTS PERFORMANCE

### Test 9.1 : Temps de chargement

**Objectif** : Vérifier que les pages se chargent rapidement

**Instructions** :
```
1. Ouvre DevTools (F12) > Network
2. Recharge /admin/dashboard
3. Vérifie le temps de chargement
```

**Résultat attendu** :
```
✅ Page chargée en < 2 secondes
✅ Pas d'erreurs 404 ou 500
✅ Ressources chargées correctement
```

---

### Test 9.2 : Cache des tarifs

**Objectif** : Vérifier que le cache fonctionne

**Instructions** :
```
1. Va sur /commande-sans-compte
2. Entre une adresse (calcul de prix)
3. Ouvre Network tab
4. Rafraîchis et entre une autre adresse
5. Vérifie les requêtes à tariff_metadata
```

**Résultat attendu** :
```
✅ 1ère fois: Requête à tariff_metadata
✅ 2ème fois: Pas de requête (cache utilisé)
✅ Cache valide pendant 5 minutes
```

---

## 10. CHECKLIST FINALE

### Base de Données ✅
- [ ] Toutes les tables créées
- [ ] RLS activé sur tables sensibles
- [ ] Triggers updated_at fonctionnent
- [ ] Index créés pour performance
- [ ] Données de test présentes

### Authentification ✅
- [ ] Connexion admin fonctionne
- [ ] Connexion client fonctionne
- [ ] Mot de passe oublié fonctionne
- [ ] Déconnexion fonctionne
- [ ] Redirection selon rôle

### Admin Dashboard ✅
- [ ] Dashboard se charge
- [ ] Commandes affichées
- [ ] Chauffeurs affichés
- [ ] Clients affichés
- [ ] Paramètres modifiables
- [ ] Statistiques correctes

### Client Dashboard ✅
- [ ] Dashboard se charge
- [ ] Commandes affichées
- [ ] Factures affichées
- [ ] Profil modifiable
- [ ] Messages fonctionnent

### Commandes ✅
- [ ] Création sans compte fonctionne
- [ ] Calcul de prix correct
- [ ] Tarifs dynamiques appliqués
- [ ] Suivi en temps réel
- [ ] Statuts mis à jour

### Véhicules & Documents ✅
- [ ] Véhicules créés et affichés
- [ ] Documents créés et affichés
- [ ] Vérification admin possible
- [ ] Expiration détectée

### Sécurité ✅
- [ ] RLS empêche accès non autorisé
- [ ] Routes protégées par rôle
- [ ] Données sensibles sécurisées
- [ ] Pas de fuite d'information

### Performance ✅
- [ ] Pages < 2s de chargement
- [ ] Cache fonctionne
- [ ] Pas de requêtes inutiles
- [ ] Images optimisées

---

## 🎯 SCORE FINAL

**Calcul** :
```
Total de tests: 40
Tests réussis: ___
Score: (Tests réussis / 40) × 100 = ____%
```

**Objectif** : 95% minimum (38/40 tests)

---

## 📝 RAPPORT DE BUGS

Si tu trouves des bugs pendant les tests, note-les ici :

```
Bug #1:
- Description:
- Page:
- Étapes pour reproduire:
- Priorité: Haute/Moyenne/Basse

Bug #2:
...
```

---

**Phase 5 - Tests complétée !** 🎉
