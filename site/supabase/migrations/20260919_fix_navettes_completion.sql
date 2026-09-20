-- Nettoyer les navettes non-dispatched qui sont marquées comme complétées ou terminées
UPDATE navettes
SET status = 'active',
    point_progress = '{}'::jsonb,
    picked_up_at = NULL,
    delivered_at = NULL,
    delivery_recipient = NULL,
    delivery_department = NULL,
    delivery_comment = NULL,
    delivery_photo_url = NULL
WHERE driver_id IS NULL
  AND (status IN ('terminee', 'delivered', 'livree')
    OR point_progress ->> 'last_completed_at' IS NOT NULL);
