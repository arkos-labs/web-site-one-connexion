# Guide de dépannage - Dispatch

## Problème : "Statut bloqué ?" sur un chauffeur

### Symptômes
- Le chauffeur apparaît avec le badge "En Course" (bleu)
- Message "Statut bloqué ?" avec bouton "Libérer"
- Aucune course n'est affichée pour ce chauffeur

### Cause
Le chauffeur est marqué comme `busy` dans la base de données, mais aucune commande active n'est associée à son `user_id`.

### Solutions

#### Solution 1 : Utiliser le bouton "Libérer" dans l'interface
1. Cliquez sur le bouton **"Libérer"** à côté du message "Statut bloqué ?"
2. Le système remettra automatiquement le chauffeur à `'online'`

#### Solution 2 : Exécuter le script SQL de nettoyage
1. Ouvrez le fichier `sql/fix_driver_sync.sql`
2. Exécutez-le dans Supabase SQL Editor
3. Le script va :
   - Identifier les chauffeurs bloqués
   - Les remettre à `'online'`
   - Nettoyer les commandes orphelines

#### Solution 3 : Vérification manuelle dans Supabase
```sql
-- Voir les chauffeurs busy sans commande
SELECT d.*, COUNT(o.id) as orders
FROM drivers d
LEFT JOIN orders o ON o.driver_id = d.user_id 
  AND o.status IN ('assigned', 'dispatched', 'driver_accepted', 'in_progress')
WHERE d.status = 'busy'
GROUP BY d.id
HAVING COUNT(o.id) = 0;

-- Corriger manuellement
UPDATE drivers 
SET status = 'online' 
WHERE id = 'DRIVER_ID_ICI';
```

## Problème : Le chauffeur ne voit pas qu'il a accepté

### Vérifications
1. ✅ Le statut de la commande est bien `'driver_accepted'` ?
2. ✅ Le statut du chauffeur est bien `'busy'` ?
3. ✅ Le `driver_id` de la commande correspond au `user_id` du chauffeur ?

### Requête de diagnostic
```sql
SELECT 
    o.reference,
    o.status as order_status,
    o.driver_id,
    d.first_name,
    d.last_name,
    d.status as driver_status,
    d.user_id
FROM orders o
LEFT JOIN drivers d ON d.user_id = o.driver_id
WHERE o.status = 'driver_accepted';
```

## Problème : La course reste chez le chauffeur après retrait

### Cause probable
L'application mobile du chauffeur n'est pas à jour ou le Realtime ne fonctionne pas.

### Solutions
1. **Recharger l'app chauffeur** : Fermez et rouvrez l'application
2. **Vérifier Realtime** : Dans Supabase Dashboard → Database → Replication
   - Assurez-vous que la table `orders` a Realtime activé
3. **Vérifier les logs** : Console du navigateur pour voir les messages Realtime

## Prévention

### Bonnes pratiques
1. ✅ Toujours utiliser les fonctions du service (`assignOrderToDriver`, `unassignOrder`)
2. ✅ Ne jamais modifier directement le statut du chauffeur sans vérifier les commandes
3. ✅ Utiliser le bouton "Libérer" si un chauffeur semble bloqué

### Monitoring
Exécutez régulièrement ce script pour vérifier l'état :
```sql
-- État global du système
SELECT 
    d.status,
    COUNT(DISTINCT d.id) as nb_drivers,
    COUNT(o.id) as nb_orders
FROM drivers d
LEFT JOIN orders o ON o.driver_id = d.user_id 
    AND o.status IN ('assigned', 'dispatched', 'driver_accepted', 'in_progress')
GROUP BY d.status
ORDER BY d.status;
```

## Codes couleur dans le Dispatch

| Couleur | Badge | Signification |
|---------|-------|---------------|
| 🟢 Vert | "Disponible" | Chauffeur libre, prêt pour une course |
| 🔵 Bleu | "En Course" | Course assignée mais pas encore acceptée |
| 🟦 Teal | "✓ Acceptée" | Chauffeur a confirmé l'acceptation |
| 🟡 Jaune | "Statut bloqué ?" | Erreur de synchronisation - utiliser "Libérer" |

## Support

Si le problème persiste :
1. Vérifiez les logs de la console navigateur (F12)
2. Vérifiez les logs Supabase (Dashboard → Logs)
3. Exécutez `sql/fix_driver_sync.sql`
4. Contactez le support technique avec :
   - ID du chauffeur
   - Référence de la commande
   - Captures d'écran
