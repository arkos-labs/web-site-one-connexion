# Guide d'application de la migration - Informations détaillées de commande

## 📋 Vue d'ensemble

Cette migration ajoute tous les champs nécessaires pour afficher les informations complètes d'une commande :
- ✅ Informations d'enlèvement (contact, téléphone, instructions, heure)
- ✅ Informations de livraison (contact, téléphone, instructions)
- ✅ Détails de la commande (type de colis, formule, planification, notes)
- ✅ Informations de facturation (société, SIRET, nom, adresse, email)

## 🚀 Méthode 1 : Utilisation du script automatique (Recommandé)

### Sur Windows (PowerShell)
```powershell
.\apply_detailed_fields_migration.ps1
```

### Sur Linux/Mac (Bash)
```bash
chmod +x apply_detailed_fields_migration.sh
./apply_detailed_fields_migration.sh
```

Le script vous demandera :
1. L'URL de votre projet Supabase
2. Le port (par défaut 5432)
3. Le nom de la base de données (par défaut postgres)
4. Le nom d'utilisateur (par défaut postgres)
5. Le mot de passe

## 🔧 Méthode 2 : Application manuelle via Supabase Dashboard

1. **Connectez-vous à votre projet Supabase**
   - Allez sur https://app.supabase.com
   - Sélectionnez votre projet

2. **Ouvrez l'éditeur SQL**
   - Dans le menu de gauche, cliquez sur "SQL Editor"
   - Cliquez sur "New query"

3. **Copiez le contenu du fichier de migration**
   - Ouvrez le fichier `sql/migrations/add_detailed_order_fields.sql`
   - Copiez tout le contenu

4. **Collez et exécutez**
   - Collez le contenu dans l'éditeur SQL
   - Cliquez sur "Run" ou appuyez sur Ctrl+Enter

5. **Vérifiez le résultat**
   - Vous devriez voir des messages de confirmation :
     ```
     ✅ Nouveaux champs ajoutés à la table orders
     ✅ Fonction create_guest_order_v2 mise à jour avec les nouveaux champs
     ```

## 🔧 Méthode 3 : Application manuelle via psql

Si vous avez `psql` installé :

```bash
# Remplacez les valeurs par vos informations de connexion
psql -h db.xxx.supabase.co -p 5432 -U postgres -d postgres -f sql/migrations/add_detailed_order_fields.sql
```

## ✅ Vérification de la migration

### Vérifier que les colonnes ont été ajoutées

Exécutez cette requête dans l'éditeur SQL de Supabase :

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN (
  'pickup_contact_name', 'pickup_contact_phone', 'pickup_instructions',
  'delivery_contact_name', 'delivery_contact_phone', 'delivery_instructions',
  'package_type', 'formula', 'schedule_type', 'notes',
  'billing_name', 'billing_address', 'billing_zip', 'billing_city',
  'billing_company', 'billing_siret', 'sender_email'
)
ORDER BY column_name;
```

Vous devriez voir 17 lignes (une pour chaque nouveau champ).

### Vérifier que la fonction a été mise à jour

```sql
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_name = 'create_guest_order_v2';
```

## 📖 Documentation complète

Pour plus de détails sur les modifications, consultez :
- `docs/affichage-informations-commande.md`

## 🎯 Résultat attendu

Après l'application de la migration :

1. **Page de détails de commande** (`/client/orders/:id`)
   - Affichage complet des informations d'enlèvement
   - Affichage complet des informations de livraison
   - Section "Détails de la commande" avec type de colis, formule, etc.
   - Section "Informations de facturation" (pour commandes sans compte)

2. **Bon de commande PDF**
   - Toutes les informations sont incluses dans le PDF
   - Sections clairement délimitées avec emojis
   - Format professionnel et lisible

3. **Nouvelles commandes**
   - Toutes les informations sont automatiquement enregistrées
   - Extraction automatique depuis les champs JSONB existants

## ⚠️ Notes importantes

- **Compatibilité ascendante** : Les anciennes commandes continuent de fonctionner
- **Champs optionnels** : Tous les nouveaux champs sont optionnels
- **Pas de perte de données** : Aucune donnée existante n'est modifiée
- **Affichage conditionnel** : Les sections vides ne s'affichent pas

## 🆘 En cas de problème

### Erreur : "permission denied"
Assurez-vous d'utiliser un utilisateur avec les droits suffisants (généralement `postgres`).

### Erreur : "column already exists"
La migration a déjà été appliquée. Vous pouvez ignorer cette erreur en toute sécurité.

### Erreur : "function already exists"
La fonction a déjà été mise à jour. Vous pouvez ignorer cette erreur en toute sécurité.

### Autres erreurs
Consultez les logs d'erreur et vérifiez :
1. Que vous êtes connecté à la bonne base de données
2. Que votre utilisateur a les droits nécessaires
3. Que le fichier de migration est complet et non corrompu

## 📞 Support

Pour toute question ou problème, consultez la documentation complète dans `docs/affichage-informations-commande.md`.
