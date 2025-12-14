-- ============================================================================
-- ✅ VÉRIFICATION APRÈS RESET
-- ============================================================================
-- Ce script permet de vérifier que le reset s'est bien passé
-- ============================================================================

-- ============================================================================
-- 1. VÉRIFIER QUE LES ANCIENNES TABLES SONT SUPPRIMÉES
-- ============================================================================

SELECT '=== ❌ TABLES QUI DEVRAIENT ÊTRE SUPPRIMÉES ===' as check;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admins') 
        THEN '❌ admins existe encore'
        ELSE '✅ admins supprimée'
    END as admins_check,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients') 
        THEN '❌ clients existe encore'
        ELSE '✅ clients supprimée'
    END as clients_check,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contact_messages') 
        THEN '❌ contact_messages existe encore'
        ELSE '✅ contact_messages supprimée'
    END as contact_messages_check,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'support_messages') 
        THEN '❌ support_messages existe encore'
        ELSE '✅ support_messages supprimée'
    END as support_messages_check,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'threads') 
        THEN '❌ threads existe encore'
        ELSE '✅ threads supprimée'
    END as threads_check;

-- ============================================================================
-- 2. VÉRIFIER LES NOUVELLES TABLES
-- ============================================================================

SELECT '=== ✅ NOUVELLES TABLES ===' as check;

SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as nb_colonnes,
    CASE 
        WHEN table_name = 'profiles' THEN '⭐ Table centrale'
        WHEN table_name = 'drivers' THEN '🚗 Infos chauffeurs'
        WHEN table_name = 'driver_vehicles' THEN '🚙 Véhicules'
        WHEN table_name = 'driver_documents' THEN '📄 Documents'
        WHEN table_name = 'orders' THEN '📦 Commandes'
        WHEN table_name = 'conversations' THEN '💬 Conversations'
        WHEN table_name = 'messages' THEN '✉️ Messages'
        WHEN table_name = 'invoices' THEN '💰 Factures'
        WHEN table_name = 'plaintes' THEN '⚠️ Réclamations'
        ELSE '❓ Autre'
    END as description
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY 
    CASE table_name
        WHEN 'profiles' THEN 1
        WHEN 'drivers' THEN 2
        WHEN 'driver_vehicles' THEN 3
        WHEN 'driver_documents' THEN 4
        WHEN 'orders' THEN 5
        WHEN 'conversations' THEN 6
        WHEN 'messages' THEN 7
        WHEN 'invoices' THEN 8
        WHEN 'plaintes' THEN 9
        ELSE 10
    END;

-- ============================================================================
-- 3. VÉRIFIER LE NOMBRE DE TABLES
-- ============================================================================

SELECT '=== 📊 STATISTIQUES ===' as check;

SELECT 
    COUNT(*) as total_tables,
    CASE 
        WHEN COUNT(*) = 9 THEN '✅ Nombre correct (9 tables)'
        WHEN COUNT(*) < 9 THEN '❌ Manque des tables (' || COUNT(*) || '/9)'
        ELSE '⚠️ Trop de tables (' || COUNT(*) || '/9)'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE';

-- ============================================================================
-- 4. VÉRIFIER LES UTILISATEURS
-- ============================================================================

SELECT '=== 👥 UTILISATEURS ===' as check;

SELECT 
    COUNT(*) as total_users,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Aucun utilisateur (base vide)'
        ELSE '⚠️ ' || COUNT(*) || ' utilisateur(s) présent(s)'
    END as status
FROM auth.users;

-- ============================================================================
-- 5. VÉRIFIER LES DONNÉES DANS PROFILES
-- ============================================================================

SELECT '=== 📋 PROFILS ===' as check;

SELECT 
    COUNT(*) as total_profiles,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Aucun profil (base vide)'
        ELSE '⚠️ ' || COUNT(*) || ' profil(s) présent(s)'
    END as status
FROM public.profiles;

-- ============================================================================
-- 6. VÉRIFIER LE TRIGGER
-- ============================================================================

SELECT '=== ⚙️ TRIGGER ===' as check;

SELECT 
    trigger_name,
    event_object_table,
    '✅ Trigger configuré' as status
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
AND trigger_name = 'handle_new_user';

-- Si aucun résultat, afficher un message
SELECT 
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM information_schema.triggers 
            WHERE trigger_name = 'handle_new_user'
        ) 
        THEN '❌ Trigger handle_new_user manquant !'
        ELSE '✅ Trigger OK'
    END as trigger_check;

-- ============================================================================
-- 7. VÉRIFIER LES POLICIES RLS
-- ============================================================================

SELECT '=== 🔒 POLICIES RLS ===' as check;

SELECT 
    tablename,
    COUNT(*) as nb_policies,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Protégée'
        ELSE '⚠️ Aucune policy'
    END as status
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- ============================================================================
-- 8. VÉRIFIER LES INDEX
-- ============================================================================

SELECT '=== 📇 INDEX ===' as check;

SELECT 
    tablename,
    COUNT(*) as nb_index
FROM pg_indexes
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- ============================================================================
-- 9. RÉSUMÉ FINAL
-- ============================================================================

SELECT '=== 🎯 RÉSUMÉ FINAL ===' as check;

SELECT 
    '✅ Tables créées' as item,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') || '/9' as valeur
UNION ALL
SELECT 
    '✅ Utilisateurs' as item,
    (SELECT COUNT(*) FROM auth.users)::text || ' (devrait être 0)' as valeur
UNION ALL
SELECT 
    '✅ Profils' as item,
    (SELECT COUNT(*) FROM public.profiles)::text || ' (devrait être 0)' as valeur
UNION ALL
SELECT 
    '✅ Trigger' as item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'handle_new_user')
        THEN 'Configuré ✅'
        ELSE 'Manquant ❌'
    END as valeur
UNION ALL
SELECT 
    '✅ Policies RLS' as item,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public')::text || ' policies' as valeur;

-- ============================================================================
-- 10. RECOMMANDATIONS
-- ============================================================================

SELECT '=== 💡 RECOMMANDATIONS ===' as check;

SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') = 9
        AND (SELECT COUNT(*) FROM auth.users) = 0
        AND EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'handle_new_user')
        THEN '🎉 PARFAIT ! La base est propre et prête à l''emploi. Vous pouvez créer votre premier utilisateur.'
        
        WHEN (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') < 9
        THEN '❌ ERREUR : Il manque des tables. Ré-exécutez RESET_DATABASE.sql'
        
        WHEN (SELECT COUNT(*) FROM auth.users) > 0
        THEN '⚠️ ATTENTION : Il reste des utilisateurs. La base n''est pas complètement vide.'
        
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'handle_new_user')
        THEN '❌ ERREUR : Le trigger handle_new_user est manquant. Ré-exécutez RESET_DATABASE.sql'
        
        ELSE '⚠️ Vérifiez les résultats ci-dessus pour identifier les problèmes.'
    END as recommandation;

-- ============================================================================
-- RÉSULTAT ATTENDU
-- ============================================================================
-- ✅ 9 tables créées
-- ✅ 0 utilisateurs
-- ✅ 0 profils
-- ✅ Trigger configuré
-- ✅ Policies RLS actives
-- ✅ Index créés
-- ============================================================================
