-- Script de vérification après migration
-- Exécutez ce script dans Supabase SQL Editor pour vérifier que tout fonctionne

-- ============================================================================
-- 1. Vérifier que toutes les colonnes ont été ajoutées
-- ============================================================================

SELECT 
    '✅ Vérification des colonnes' as etape,
    COUNT(*) as colonnes_ajoutees
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN (
    'pickup_contact_name', 'pickup_contact_phone', 'pickup_instructions',
    'delivery_contact_name', 'delivery_contact_phone', 'delivery_instructions',
    'package_type', 'formula', 'schedule_type', 'notes',
    'billing_name', 'billing_address', 'billing_zip', 'billing_city',
    'billing_company', 'billing_siret', 'sender_email'
);
-- Résultat attendu : 17 colonnes

-- ============================================================================
-- 2. Afficher la liste des colonnes ajoutées
-- ============================================================================

SELECT 
    column_name,
    data_type,
    is_nullable
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

-- ============================================================================
-- 3. Vérifier que la fonction existe
-- ============================================================================

SELECT 
    '✅ Fonction create_guest_order_v2' as verification,
    CASE 
        WHEN COUNT(*) > 0 THEN 'Existe ✓'
        ELSE 'N''existe pas ✗'
    END as statut
FROM information_schema.routines
WHERE routine_name = 'create_guest_order_v2';

-- ============================================================================
-- 4. Statistiques sur les données migrées
-- ============================================================================

SELECT 
    '📊 Statistiques de migration' as titre,
    COUNT(*) as total_commandes,
    COUNT(pickup_contact_name) as avec_contact_enlevement,
    COUNT(delivery_contact_name) as avec_contact_livraison,
    COUNT(billing_company) as avec_facturation,
    COUNT(package_type) as avec_type_colis,
    COUNT(formula) as avec_formule
FROM orders;

-- ============================================================================
-- 5. Afficher un échantillon de données (dernières 5 commandes)
-- ============================================================================

SELECT 
    reference,
    pickup_contact_name,
    pickup_contact_phone,
    delivery_contact_name,
    delivery_contact_phone,
    package_type,
    formula,
    billing_company,
    created_at
FROM orders
ORDER BY created_at DESC
LIMIT 5;

-- ============================================================================
-- 6. Vérifier les commandes avec données complètes
-- ============================================================================

SELECT 
    '✅ Commandes avec données complètes' as verification,
    COUNT(*) as nombre
FROM orders
WHERE pickup_contact_name IS NOT NULL
  AND delivery_contact_name IS NOT NULL
  AND package_type IS NOT NULL;

-- ============================================================================
-- 7. Vérifier les commandes sans données (anciennes commandes)
-- ============================================================================

SELECT 
    '⚠️ Commandes sans nouvelles données' as verification,
    COUNT(*) as nombre
FROM orders
WHERE pickup_contact_name IS NULL
  AND delivery_contact_name IS NULL
  AND package_type IS NULL;

-- ============================================================================
-- RÉSUMÉ FINAL
-- ============================================================================

DO $$
DECLARE
    v_total INTEGER;
    v_with_pickup INTEGER;
    v_with_delivery INTEGER;
    v_with_billing INTEGER;
    v_columns INTEGER;
BEGIN
    -- Compter les colonnes
    SELECT COUNT(*) INTO v_columns
    FROM information_schema.columns 
    WHERE table_name = 'orders' 
    AND column_name IN (
        'pickup_contact_name', 'pickup_contact_phone', 'pickup_instructions',
        'delivery_contact_name', 'delivery_contact_phone', 'delivery_instructions',
        'package_type', 'formula', 'schedule_type', 'notes',
        'billing_name', 'billing_address', 'billing_zip', 'billing_city',
        'billing_company', 'billing_siret', 'sender_email'
    );
    
    -- Compter les commandes
    SELECT COUNT(*) INTO v_total FROM orders;
    SELECT COUNT(*) INTO v_with_pickup FROM orders WHERE pickup_contact_name IS NOT NULL;
    SELECT COUNT(*) INTO v_with_delivery FROM orders WHERE delivery_contact_name IS NOT NULL;
    SELECT COUNT(*) INTO v_with_billing FROM orders WHERE billing_company IS NOT NULL;
    
    RAISE NOTICE '╔════════════════════════════════════════════════════════╗';
    RAISE NOTICE '║         RÉSUMÉ DE LA VÉRIFICATION                      ║';
    RAISE NOTICE '╠════════════════════════════════════════════════════════╣';
    RAISE NOTICE '║ Colonnes ajoutées : % / 17                         ║', LPAD(v_columns::TEXT, 2);
    RAISE NOTICE '║ Total de commandes : %                             ║', LPAD(v_total::TEXT, 4);
    RAISE NOTICE '║ Avec contact enlèvement : %                        ║', LPAD(v_with_pickup::TEXT, 4);
    RAISE NOTICE '║ Avec contact livraison : %                         ║', LPAD(v_with_delivery::TEXT, 4);
    RAISE NOTICE '║ Avec facturation : %                               ║', LPAD(v_with_billing::TEXT, 4);
    RAISE NOTICE '╠════════════════════════════════════════════════════════╣';
    
    IF v_columns = 17 THEN
        RAISE NOTICE '║ ✅ Migration réussie !                                 ║';
    ELSE
        RAISE NOTICE '║ ⚠️  Migration incomplète - % colonnes manquantes      ║', 17 - v_columns;
    END IF;
    
    RAISE NOTICE '╚════════════════════════════════════════════════════════╝';
END $$;
