-- =====================================================
-- Ajouter les colonnes de tracking des refus à la table orders
-- =====================================================
-- Date: 2025-12-16
-- Description: Ajoute refusal_count et last_refused_by pour tracker les refus

-- 1. Ajouter la colonne refusal_count (compteur de refus)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS refusal_count INTEGER DEFAULT 0;

-- 2. Ajouter la colonne last_refused_by (nom du dernier chauffeur ayant refusé)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS last_refused_by TEXT;

-- 3. Vérifier que les colonnes ont été ajoutées
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('refusal_count', 'last_refused_by');
