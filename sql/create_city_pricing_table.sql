-- ============================================================================
-- ONE CONNEXION - MIGRATION TARIFAIRE
-- ============================================================================
-- Script de création de la table city_pricing
-- Cette table remplace l'objet en dur PRISES_EN_CHARGE dans pricingEngine.ts
-- 
-- @version 1.0
-- @date 2025-12-19
-- ============================================================================

-- Suppression de la table si elle existe déjà (pour réinitialisation)
DROP TABLE IF EXISTS public.city_pricing CASCADE;

-- Création de la table city_pricing
CREATE TABLE public.city_pricing (
    -- Clé primaire
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Nom de la ville (unique, normalisé en majuscules avec tirets)
    city_name TEXT NOT NULL UNIQUE,
    
    -- Code postal (optionnel pour l'instant, peut être ajouté plus tard)
    zip_code TEXT,
    
    -- Les 5 tarifs de prise en charge (en bons)
    price_normal NUMERIC(10, 2) NOT NULL CHECK (price_normal >= 0),
    price_express NUMERIC(10, 2) NOT NULL CHECK (price_express >= 0),
    price_urgence NUMERIC(10, 2) NOT NULL CHECK (price_urgence >= 0),
    price_vl_normal NUMERIC(10, 2) NOT NULL CHECK (price_vl_normal >= 0),
    price_vl_express NUMERIC(10, 2) NOT NULL CHECK (price_vl_express >= 0),
    
    -- Métadonnées
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index pour améliorer les performances de recherche
CREATE INDEX idx_city_pricing_city_name ON public.city_pricing(city_name);

-- Commentaires sur la table et les colonnes
COMMENT ON TABLE public.city_pricing IS 'Tarifs de prise en charge par ville pour le moteur de pricing One Connexion';
COMMENT ON COLUMN public.city_pricing.city_name IS 'Nom de la ville normalisé (MAJUSCULES, sans accents, tirets)';
COMMENT ON COLUMN public.city_pricing.zip_code IS 'Code postal de la ville (optionnel)';
COMMENT ON COLUMN public.city_pricing.price_normal IS 'Tarif NORMAL en bons';
COMMENT ON COLUMN public.city_pricing.price_express IS 'Tarif EXPRESS en bons';
COMMENT ON COLUMN public.city_pricing.price_urgence IS 'Tarif URGENCE en bons';
COMMENT ON COLUMN public.city_pricing.price_vl_normal IS 'Tarif VL_NORMAL en bons';
COMMENT ON COLUMN public.city_pricing.price_vl_express IS 'Tarif VL_EXPRESS en bons';

-- Fonction de mise à jour automatique du timestamp
CREATE OR REPLACE FUNCTION update_city_pricing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER trigger_update_city_pricing_timestamp
    BEFORE UPDATE ON public.city_pricing
    FOR EACH ROW
    EXECUTE FUNCTION update_city_pricing_updated_at();

-- ============================================================================
-- POLITIQUES RLS (Row Level Security)
-- ============================================================================

-- Activer RLS sur la table
ALTER TABLE public.city_pricing ENABLE ROW LEVEL SECURITY;

-- Politique : Lecture publique (tous les utilisateurs peuvent lire)
CREATE POLICY "city_pricing_select_policy"
    ON public.city_pricing
    FOR SELECT
    USING (true);

-- Politique : Seuls les admins peuvent insérer/modifier/supprimer
-- (Vérifie la présence de l'utilisateur dans la table admins)
CREATE POLICY "city_pricing_admin_policy"
    ON public.city_pricing
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admins WHERE user_id = auth.uid()
        )
    );

-- ============================================================================
-- FONCTION UTILITAIRE : Recherche de ville
-- ============================================================================

-- Fonction pour rechercher une ville par nom (avec normalisation)
CREATE OR REPLACE FUNCTION public.find_city_pricing(search_city TEXT)
RETURNS TABLE (
    id UUID,
    city_name TEXT,
    zip_code TEXT,
    price_normal NUMERIC,
    price_express NUMERIC,
    price_urgence NUMERIC,
    price_vl_normal NUMERIC,
    price_vl_express NUMERIC
) AS $$
BEGIN
    -- Normaliser le nom de la ville recherchée
    search_city := UPPER(
        REGEXP_REPLACE(
            REGEXP_REPLACE(
                UNACCENT(search_city),
                '''', '-', 'g'
            ),
            '\s+', '-', 'g'
        )
    );
    
    -- Recherche exacte d'abord
    RETURN QUERY
    SELECT 
        cp.id,
        cp.city_name,
        cp.zip_code,
        cp.price_normal,
        cp.price_express,
        cp.price_urgence,
        cp.price_vl_normal,
        cp.price_vl_express
    FROM public.city_pricing cp
    WHERE cp.city_name = search_city
    LIMIT 1;
    
    -- Si aucun résultat, recherche partielle
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT 
            cp.id,
            cp.city_name,
            cp.zip_code,
            cp.price_normal,
            cp.price_express,
            cp.price_urgence,
            cp.price_vl_normal,
            cp.price_vl_express
        FROM public.city_pricing cp
        WHERE cp.city_name LIKE '%' || search_city || '%'
           OR search_city LIKE '%' || cp.city_name || '%'
        LIMIT 1;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Activer l'extension unaccent si elle n'est pas déjà activée
CREATE EXTENSION IF NOT EXISTS unaccent;

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================
