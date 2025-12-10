# 🎯 PLAN D'IMPLÉMENTATION - Tâches Restantes

**Date de création**: 2025-12-07  
**Objectif**: Compléter toutes les fonctionnalités manquantes (hors paiements)

---

## 📋 PHASE 1: MOTEUR DE TARIFICATION DYNAMIQUE (2-3h)

### Étape 1.1: Mise à jour du moteur de pricing
**Fichier**: `src/utils/pricingEngineNew.ts`

```typescript
// Ajouter l'interface PricingConfig
export interface PricingConfig {
  bonValueEur: number;
  supplementPerKmBons: number;
}

// Modifier la signature de calculateOneConnexionPrice
export function calculateOneConnexionPrice(
  villeDepart: string,
  villeArrivee: string,
  distanceMeters: number,
  formule: FormuleNew = 'NORMAL',
  config?: PricingConfig  // ← NOUVEAU paramètre optionnel
): CalculTarifaireResult
```

### Étape 1.2: Migration SQL pour tariff_metadata
**Fichier**: `sql/add_tariff_metadata.sql`

```sql
-- Créer la table si elle n'existe pas
CREATE TABLE IF NOT EXISTS tariff_metadata (
  id BIGSERIAL PRIMARY KEY,
  key VARCHAR(100) NOT NULL UNIQUE,
  value VARCHAR(500) NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insérer les valeurs par défaut
INSERT INTO tariff_metadata (key, value, description) VALUES
  ('bon_value_eur', '5.5', 'Valeur d''un bon en EUR'),
  ('supplement_per_km_bons', '0.1', 'Supplément en bons par km (hors Paris)'),
  ('night_surcharge_percent', '20', 'Majoration de nuit en %'),
  ('weekend_surcharge_percent', '25', 'Majoration week-end en %')
ON CONFLICT (key) DO NOTHING;

-- Permissions
GRANT SELECT ON tariff_metadata TO authenticated;
GRANT UPDATE ON tariff_metadata TO authenticated;
```

### Étape 1.3: Mettre à jour tous les appels
**Fichiers à modifier**:
- `src/pages/CommandeSansCompte.tsx`
- `src/components/orders/QuickOrderForm.tsx`
- `src/components/admin/CreateOrderModal.tsx`
- Tous les fichiers utilisant `calculateOneConnexionPrice`

**Action**: Charger la config depuis Supabase avant le calcul

---

## 📋 PHASE 2: PAGE MOT DE PASSE OUBLIÉ (1-2h)

### Étape 2.1: Créer le composant
**Fichier**: `src/pages/ForgotPassword.tsx`

```typescript
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().email("Email invalide")
});

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = emailSchema.safeParse({ email });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      setSent(true);
      toast.success("Email de réinitialisation envoyé !");
    } catch (error: any) {
      toast.error("Erreur: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <Card className="w-full max-w-md p-8">
        {/* UI ici */}
      </Card>
    </div>
  );
}
```

### Étape 2.2: Mettre à jour les routes
**Fichier**: `src/pages/Index.tsx`

```typescript
// Remplacer la ligne Placeholder par:
<Route path="/forgot-password" element={<ForgotPassword />} />
```

---

## 📋 PHASE 3: VÉHICULES ET DOCUMENTS CHAUFFEURS (3-4h)

### Étape 3.1: Migration SQL - Table vehicles
**Fichier**: `sql/add_vehicles_table.sql`

```sql
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  plate_number VARCHAR(20) NOT NULL UNIQUE,
  vehicle_type VARCHAR(50), -- 'sedan', 'van', 'motorcycle'
  year INTEGER,
  color VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_vehicles_driver ON vehicles(driver_id);
CREATE INDEX idx_vehicles_plate ON vehicles(plate_number);
```

### Étape 3.2: Migration SQL - Table driver_documents
**Fichier**: `sql/add_driver_documents_table.sql`

```sql
CREATE TABLE IF NOT EXISTS driver_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL, -- 'license', 'insurance', 'registration'
  document_number VARCHAR(100),
  file_url TEXT,
  issue_date DATE,
  expiry_date DATE,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'expired'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_driver_docs_driver ON driver_documents(driver_id);
CREATE INDEX idx_driver_docs_expiry ON driver_documents(expiry_date);
```

### Étape 3.3: Mettre à jour Drivers.tsx
**Fichier**: `src/pages/admin/Drivers.tsx`

```typescript
// Dans fetchDrivers(), ajouter:
const { data: vehiclesData } = await supabase
  .from('vehicles')
  .select('*');

const { data: documentsData } = await supabase
  .from('driver_documents')
  .select('*');

// Mapper les données aux drivers
```

### Étape 3.4: Créer les composants de gestion
**Nouveaux fichiers**:
- `src/components/admin/drivers/VehicleForm.tsx`
- `src/components/admin/drivers/DocumentUpload.tsx`
- `src/components/admin/drivers/DocumentsList.tsx`

---

## 📋 PHASE 4: PAGES LÉGALES (2-3h)

### Étape 4.1: CGV
**Fichier**: `src/pages/CGV.tsx`

**Contenu à inclure**:
1. Objet et champ d'application
2. Tarifs et modalités de paiement
3. Conditions d'annulation
4. Responsabilités
5. Litiges et juridiction compétente

### Étape 4.2: Mentions Légales
**Fichier**: `src/pages/MentionsLegales.tsx`

**Contenu à inclure**:
1. Éditeur du site (One Connexion)
2. SIRET, adresse, téléphone
3. Directeur de publication
4. Hébergeur (Netlify/Vercel)
5. Propriété intellectuelle

### Étape 4.3: Politique de Cookies
**Fichier**: `src/pages/Cookies.tsx`

**Contenu à inclure**:
1. Qu'est-ce qu'un cookie
2. Cookies utilisés sur le site
3. Gestion des cookies
4. Cookies tiers (Google Analytics, etc.)

---

## 📋 PHASE 5: VALIDATIONS ET TESTS (2-3h)

### Étape 5.1: Tester AddressAutocomplete
- [ ] Vérifier la clé API LocationIQ
- [ ] Tester la recherche d'adresses
- [ ] Valider le calcul de distance
- [ ] Gérer les cas d'erreur

### Étape 5.2: Tester les emails
- [ ] Envoi de factures
- [ ] Relances de paiement
- [ ] Notifications de commande
- [ ] Vérifier les Edge Functions Supabase

### Étape 5.3: Tests de bout en bout
- [ ] Créer une commande (admin)
- [ ] Créer une commande (client)
- [ ] Créer une commande (invité)
- [ ] Modifier les tarifs dans Settings
- [ ] Vérifier que les nouveaux prix sont appliqués

---

## 📋 PHASE 6: APPLICATION CHAUFFEUR (Projet séparé - 40-60h)

### Étape 6.1: Setup du projet
- [ ] Initialiser React Native
- [ ] Configurer Supabase
- [ ] Setup navigation
- [ ] Authentification

### Étape 6.2: Fonctionnalités core
- [ ] Dashboard chauffeur
- [ ] Liste des commandes disponibles
- [ ] Acceptation/Refus de commandes
- [ ] Navigation GPS
- [ ] Mise à jour statut en temps réel

### Étape 6.3: Fonctionnalités avancées
- [ ] Historique des courses
- [ ] Statistiques et gains
- [ ] Notifications push
- [ ] Mode hors ligne

---

## 🎯 PLANNING ESTIMÉ

| Phase | Durée estimée | Priorité |
|-------|---------------|----------|
| Phase 1: Tarification dynamique | 2-3h | 🔴 HAUTE |
| Phase 2: Mot de passe oublié | 1-2h | 🔴 HAUTE |
| Phase 3: Véhicules & Documents | 3-4h | 🟡 MOYENNE |
| Phase 4: Pages légales | 2-3h | 🟡 MOYENNE |
| Phase 5: Validations & Tests | 2-3h | 🟢 BASSE |
| Phase 6: App Chauffeur | 40-60h | 🔵 PROJET MAJEUR |

**Total (hors App Chauffeur)**: 10-15 heures  
**Total (avec App Chauffeur)**: 50-75 heures

---

## 📝 CHECKLIST AVANT DÉPLOIEMENT

- [ ] Toutes les migrations SQL appliquées
- [ ] Variables d'environnement configurées
- [ ] Tests E2E passés
- [ ] Pages légales remplies
- [ ] Emails fonctionnels
- [ ] Tarification dynamique testée
- [ ] Documentation à jour
- [ ] Backup de la base de données

---

**Prêt à commencer ?** 🚀
