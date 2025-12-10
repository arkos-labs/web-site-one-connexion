# Affichage complet des informations de commande

## Objectif
Afficher toutes les informations détaillées d'une commande dans la page de détails et dans le bon de commande PDF, incluant :
- Informations d'enlèvement (adresse, contact, téléphone, heure, instructions)
- Informations de livraison (adresse, contact, téléphone, instructions)
- Détails de la commande (type de colis, formule, planification, notes)
- Informations de facturation (société, SIRET, nom, adresse, email)

## Modifications effectuées

### 1. Type `Order` (src/lib/supabase.ts)
Ajout des champs suivants à l'interface `Order` :

**Informations d'enlèvement :**
- `pickup_contact_name?: string` - Nom du contact pour l'enlèvement
- `pickup_contact_phone?: string` - Téléphone du contact pour l'enlèvement
- `pickup_instructions?: string` - Instructions spécifiques pour l'enlèvement

**Informations de livraison :**
- `delivery_contact_name?: string` - Nom du contact pour la livraison
- `delivery_contact_phone?: string` - Téléphone du contact pour la livraison
- `delivery_instructions?: string` - Instructions spécifiques pour la livraison

**Détails de la commande :**
- `package_type?: string` - Type de colis (document, petit colis, etc.)
- `formula?: string` - Formule de livraison (standard, express, flash)
- `schedule_type?: string` - Type de planification (asap, slot)
- `notes?: string` - Notes complémentaires

**Informations de facturation :**
- `billing_name?: string` - Nom à facturer
- `billing_address?: string` - Adresse de facturation
- `billing_zip?: string` - Code postal de facturation
- `billing_city?: string` - Ville de facturation
- `billing_company?: string` - Nom de l'entreprise
- `billing_siret?: string` - Numéro SIRET
- `sender_email?: string` - Email de l'expéditeur

### 2. Page de détails (src/pages/client/OrderDetail.tsx)
Refonte complète de l'affichage des informations :

**Section Informations d'enlèvement :**
- Adresse d'enlèvement
- Contact et téléphone
- Heure d'enlèvement (si planifiée)
- Instructions spécifiques

**Section Informations de livraison :**
- Adresse de livraison
- Contact et téléphone
- Instructions spécifiques

**Section Détails de la commande :**
- Type de colis
- Formule de livraison
- Type de planification
- Notes complémentaires

**Section Informations de facturation :**
- Société et SIRET
- Nom à facturer
- Email
- Adresse de facturation complète

### 3. Générateur PDF (src/lib/pdf-generator.ts)
Mise à jour du bon de commande PDF pour inclure toutes les informations :

**Structure du PDF :**
1. En-tête avec logo One Connexion
2. Référence de commande
3. Informations client
4. Détails de la commande (date, type, statut)
5. **📍 Informations d'enlèvement** (nouvelle section)
   - Adresse
   - Contact et téléphone
   - Heure d'enlèvement
   - Instructions
6. **📍 Informations de livraison** (nouvelle section)
   - Adresse
   - Contact et téléphone
   - Instructions
7. **📦 Détails de la commande** (nouvelle section)
   - Type de colis
   - Formule
   - Type de planification
   - Notes complémentaires
8. **💳 Informations de facturation** (nouvelle section, pour commandes sans compte)
   - Société et SIRET
   - Nom
   - Email
   - Adresse complète
9. Prix total
10. Pied de page

### 4. Migration SQL (sql/migrations/add_detailed_order_fields.sql)
Ajout des nouveaux champs à la table `orders` et mise à jour de la fonction `create_guest_order_v2` :

**Nouveaux champs dans la table `orders` :**
```sql
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS pickup_contact_name TEXT,
ADD COLUMN IF NOT EXISTS pickup_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS pickup_instructions TEXT,
ADD COLUMN IF NOT EXISTS delivery_contact_name TEXT,
ADD COLUMN IF NOT EXISTS delivery_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS delivery_instructions TEXT,
ADD COLUMN IF NOT EXISTS package_type TEXT,
ADD COLUMN IF NOT EXISTS formula TEXT,
ADD COLUMN IF NOT EXISTS schedule_type TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS billing_name TEXT,
ADD COLUMN IF NOT EXISTS billing_address TEXT,
ADD COLUMN IF NOT EXISTS billing_zip TEXT,
ADD COLUMN IF NOT EXISTS billing_city TEXT,
ADD COLUMN IF NOT EXISTS billing_company TEXT,
ADD COLUMN IF NOT EXISTS billing_siret TEXT,
ADD COLUMN IF NOT EXISTS sender_email TEXT;
```

**Fonction `create_guest_order_v2` mise à jour :**
- Extraction automatique des informations de contact depuis les JSONB `p_expediteur` et `p_destinataire`
- Extraction des informations de facturation depuis le JSONB `p_facturation`
- Détermination automatique du `schedule_type` basé sur `p_scheduled_pickup_time`
- Insertion de toutes les nouvelles colonnes

## Comment appliquer la migration

1. **Exécuter la migration SQL :**
   ```bash
   # Connectez-vous à votre base de données Supabase
   # Puis exécutez le fichier de migration
   psql -h <votre-host> -U postgres -d postgres -f sql/migrations/add_detailed_order_fields.sql
   ```

2. **Vérifier que les colonnes ont été ajoutées :**
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
   );
   ```

3. **Vérifier que la fonction a été mise à jour :**
   ```sql
   SELECT routine_name, routine_definition
   FROM information_schema.routines
   WHERE routine_name = 'create_guest_order_v2';
   ```

## Utilisation

### Affichage dans la page de détails
Les informations s'affichent automatiquement si elles sont présentes dans la commande. Les sections vides ne sont pas affichées.

### Génération du bon de commande PDF
Lors du téléchargement du bon de commande, toutes les informations disponibles sont incluses dans le PDF.

### Création d'une nouvelle commande
Le service `guestOrderService.ts` envoie déjà toutes les informations nécessaires. La fonction SQL `create_guest_order_v2` les extrait et les stocke dans les nouveaux champs.

## Notes importantes

1. **Compatibilité ascendante :** Tous les nouveaux champs sont optionnels (`DEFAULT NULL`), donc les anciennes commandes continuent de fonctionner.

2. **Affichage conditionnel :** Les sections ne s'affichent que si les données sont présentes, évitant ainsi les sections vides.

3. **Extraction automatique :** Les informations de contact et de facturation sont extraites automatiquement des champs JSONB existants lors de la création de la commande.

4. **Format du PDF :** Le PDF utilise des emojis (📍, 📦, 💳) pour une meilleure lisibilité et des sections clairement délimitées.

## Exemple de données

Voici un exemple de commande avec toutes les informations :

```json
{
  "reference": "CMD-20251206-1234",
  "pickup_address": "123 Rue de Paris, 75001 Paris",
  "pickup_contact_name": "Jean Dupont",
  "pickup_contact_phone": "06 12 34 56 78",
  "pickup_instructions": "Code A123, 2ème étage",
  "scheduled_pickup_time": "2025-12-06T14:30:00Z",
  
  "delivery_address": "456 Avenue des Champs, 92100 Boulogne",
  "delivery_contact_name": "Marie Martin",
  "delivery_contact_phone": "06 98 76 54 32",
  "delivery_instructions": "Interphone B, laisser à l'accueil",
  
  "package_type": "Document / Pli",
  "formula": "express",
  "schedule_type": "slot",
  "notes": "Urgent - Contrat à signer",
  
  "billing_company": "Ma Société SAS",
  "billing_siret": "12345678900012",
  "billing_name": "Service Comptabilité",
  "billing_address": "10 rue de la Paix",
  "billing_zip": "75000",
  "billing_city": "Paris",
  "sender_email": "jean.dupont@email.com"
}
```
