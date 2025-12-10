# 🧪 Guide de Test - Modal Nouvelle Commande (Admin)

## 📋 Pré-requis

Avant de commencer les tests, assurez-vous que :

- ✅ Les policies RLS admin ont été appliquées (voir section "Application des Policies")
- ✅ Le serveur de développement est lancé (`npm run dev`)
- ✅ Vous êtes connecté en tant qu'administrateur
- ✅ Il existe au moins un client dans la base de données

## 🔧 Application des Policies RLS

### Option 1 : Via PowerShell (Automatique)

```powershell
.\apply_admin_policies.ps1
```

### Option 2 : Via Supabase Dashboard (Manuel)

1. Ouvrez le dashboard Supabase : https://app.supabase.com
2. Sélectionnez votre projet
3. Allez dans **SQL Editor**
4. Créez une nouvelle query
5. Copiez le contenu de `sql/admin_policies.sql`
6. Cliquez sur **Run**

### Vérification

Pour vérifier que les policies sont bien créées :

```sql
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
AND policyname LIKE '%Admin%'
ORDER BY tablename, policyname;
```

Vous devriez voir au moins :
- `Admins can view all clients`
- `Admins can insert clients`
- `Admins can view all orders`
- `Admins can insert orders`

---

## 🧪 Tests Fonctionnels

### Test 1 : Ouverture du Modal ✅

**Objectif** : Vérifier que le modal s'ouvre correctement

**Étapes** :
1. Connectez-vous en tant qu'admin
2. Allez dans **Dashboard Admin** → **Commandes**
3. Cliquez sur le bouton **"+ Nouvelle Commande"**

**Résultat attendu** :
- ✅ Le modal s'ouvre
- ✅ Le titre "Créer une commande (Admin)" est affiché
- ✅ La section "Sélectionner un client" est visible
- ✅ Le champ de recherche est présent
- ✅ Le bouton "+ Nouveau client" est visible

---

### Test 2 : Recherche de Client ✅

**Objectif** : Vérifier que la recherche de clients fonctionne

**Étapes** :
1. Dans le modal, cliquez sur le champ de recherche client
2. Tapez un nom de client existant (ex: "Jean")

**Résultat attendu** :
- ✅ Un dropdown s'affiche sous le champ
- ✅ Les clients correspondants apparaissent
- ✅ Chaque client affiche : Nom, Société (si présente), Email
- ✅ Aucune erreur dans la console

**En cas d'échec** :
- Vérifiez la console pour les erreurs
- Vérifiez que les policies RLS sont bien appliquées
- Vérifiez qu'il existe des clients dans la table `clients`

---

### Test 3 : Sélection d'un Client ✅

**Objectif** : Vérifier qu'un client peut être sélectionné

**Étapes** :
1. Recherchez un client (voir Test 2)
2. Cliquez sur un client dans la liste

**Résultat attendu** :
- ✅ Le dropdown se ferme
- ✅ Le client sélectionné s'affiche dans un encadré
- ✅ Le nom du client apparaît
- ✅ La société apparaît (si présente)
- ✅ L'email apparaît
- ✅ Un bouton "X" pour désélectionner est visible
- ✅ Le récapitulatif à droite affiche le nom du client

**Vérification du récapitulatif** :
```
📋 Récapitulatif
👤 CLIENT
[Nom du client]
[Société] (si présente)
```

---

### Test 4 : Désélection d'un Client ✅

**Objectif** : Vérifier qu'un client peut être désélectionné

**Étapes** :
1. Sélectionnez un client (voir Test 3)
2. Cliquez sur le bouton "X" à côté du client sélectionné

**Résultat attendu** :
- ✅ L'encadré du client disparaît
- ✅ Le champ de recherche redevient vide
- ✅ Le récapitulatif affiche "Aucun client sélectionné"

---

### Test 5 : Création d'un Nouveau Client (Inline) ✅

**Objectif** : Vérifier que la création d'un client fonctionne via le formulaire intégré

**Étapes** :
1. Dans l'étape "Enlèvement", cliquez sur le bouton **"+ Nouveau"** (à droite du label "Client")
2. Un formulaire s'ouvre **directement dans la page** (pas de popup)
3. Remplissez le formulaire :
   - Société : "Test Société Inline"
   - Contact : "Jean Inline"
   - Téléphone : "0600000000"
   - Email : "inline@test.com"
   - Adresse : "1 Rue Inline, 75000 Paris"
4. Cliquez sur le bouton **"Créer le client"** (icône disquette)

**Résultat attendu** :
- ✅ Un toast de succès s'affiche : "Client créé avec succès"
- ✅ Le formulaire inline se referme
- ✅ Le nouveau client est automatiquement sélectionné dans le dropdown
- ✅ Les champs "Nom du contact" et "Téléphone" de l'enlèvement sont pré-remplis
- ✅ Le récapitulatif à droite affiche le nouveau client
- ✅ Aucune erreur dans la console

**En cas d'échec** :
- Vérifiez la console pour les erreurs
- Vérifiez que la policy `Admins can insert clients` existe
- Vérifiez que l'email n'existe pas déjà

---

### Test 6 : Mise à Jour du Récapitulatif ✅

**Objectif** : Vérifier que le récapitulatif se met à jour en temps réel

**Étapes** :
1. Sélectionnez un client
2. Remplissez l'adresse d'enlèvement : "10 Rue de Paris, 75001 Paris"
3. Remplissez l'adresse de livraison : "20 Avenue des Champs, 92100 Boulogne"
4. Sélectionnez une formule (Standard, Express ou Flash)

**Résultat attendu** :
- ✅ Le récapitulatif affiche le client
- ✅ L'adresse d'enlèvement apparaît dans le récapitulatif
- ✅ L'adresse de livraison apparaît dans le récapitulatif
- ✅ La formule sélectionnée apparaît
- ✅ Le prix se calcule automatiquement (après 1 seconde)
- ✅ Le prix s'affiche en euros et en bons

**Format attendu du récapitulatif** :
```
📋 Récapitulatif

👤 CLIENT
[Nom du client]
[Société]

⏰ HORAIRE
Dès que possible

📍 RETRAIT
10 Rue de Paris, 75001 Paris

📍 LIVRAISON
20 Avenue des Champs, 92100 Boulogne

⚡ FORMULE
STANDARD

PRIX TOTAL
XX.XX€
X.XX bons × 5.50€
```

---

### Test 7 : Création de Commande Complète ✅

**Objectif** : Vérifier que la commande peut être créée

**Étapes** :
1. Sélectionnez un client
2. Remplissez toutes les informations :
   - Adresse d'enlèvement
   - Contact et téléphone enlèvement
   - Adresse de livraison
   - Contact et téléphone livraison
   - Type de colis
   - Formule
   - Horaire (Dès que possible / Dans 1h / Choisir un créneau)
3. Cliquez sur **"Créer la commande"**

**Résultat attendu** :
- ✅ La commande est créée
- ✅ Un message de succès s'affiche
- ✅ Le modal se ferme
- ✅ La liste des commandes se rafraîchit
- ✅ La nouvelle commande apparaît dans la liste

---

## 🐛 Débogage

### Problème : "Aucun client trouvé"

**Causes possibles** :
1. Policies RLS non appliquées
2. Table `clients` vide
3. Erreur de connexion Supabase

**Solutions** :
```sql
-- Vérifier les clients existants
SELECT id, first_name, last_name, email, company_name 
FROM clients 
LIMIT 10;

-- Vérifier les policies
SELECT * FROM pg_policies 
WHERE tablename = 'clients';
```

---

### Problème : "Erreur lors de la création du client"

**Causes possibles** :
1. Policy `Admins can insert clients` manquante
2. Email déjà existant
3. Champs requis manquants

**Solutions** :
```sql
-- Vérifier la policy d'insertion
SELECT * FROM pg_policies 
WHERE tablename = 'clients' 
AND cmd = 'INSERT';

-- Vérifier si l'email existe
SELECT * FROM clients WHERE email = 'test@example.com';
```

---

### Problème : "Le prix ne se calcule pas"

**Causes possibles** :
1. Adresses invalides
2. Ville non trouvée dans la table des tarifs
3. Erreur de géocodage

**Solutions** :
- Vérifiez la console pour les erreurs
- Utilisez des adresses complètes avec code postal
- Vérifiez que les villes sont dans la table `tariffs_cities`

---

## 📊 Checklist Complète

Avant de considérer le correctif comme terminé, vérifiez :

- [ ] Les policies RLS admin sont appliquées
- [ ] Le modal s'ouvre correctement
- [ ] La recherche de clients fonctionne
- [ ] Un client peut être sélectionné
- [ ] Un client peut être désélectionné
- [ ] Un nouveau client peut être créé
- [ ] Le nouveau client est automatiquement sélectionné
- [ ] Le récapitulatif se met à jour en temps réel
- [ ] Le prix se calcule automatiquement
- [ ] Une commande complète peut être créée
- [ ] Aucune erreur dans la console
- [ ] Le flow est fluide et intuitif

---

## 📝 Rapport de Test

### Environnement
- Date : _______________
- Navigateur : _______________
- Version : _______________

### Résultats
- [ ] Test 1 : Ouverture du Modal - ✅ / ❌
- [ ] Test 2 : Recherche de Client - ✅ / ❌
- [ ] Test 3 : Sélection d'un Client - ✅ / ❌
- [ ] Test 4 : Désélection d'un Client - ✅ / ❌
- [ ] Test 5 : Création d'un Nouveau Client - ✅ / ❌
- [ ] Test 6 : Mise à Jour du Récapitulatif - ✅ / ❌
- [ ] Test 7 : Création de Commande Complète - ✅ / ❌

### Notes
_______________________________________________
_______________________________________________
_______________________________________________
