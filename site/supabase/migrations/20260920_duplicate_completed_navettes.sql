-- 20260920_duplicate_completed_navettes.sql
-- Automate duplication of recurring navettes when they reach a terminal state (terminee, annulee)

CREATE OR REPLACE FUNCTION duplicate_completed_navette()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger on transition to a terminal state from a non-terminal state
  IF OLD.status NOT IN ('terminee', 'livree', 'delivered', 'annulee') 
     AND NEW.status IN ('terminee', 'livree', 'delivered', 'annulee') THEN
    
    -- Insert a new blank navette with the same static configuration
    INSERT INTO navettes (
      user_id,
      name,
      pickup_address,
      pickup_contact_name,
      pickup_contact_phone,
      pickup_notes,
      dropoff_address,
      dropoff_contact_name,
      dropoff_contact_phone,
      dropoff_notes,
      stops,
      days_of_week,
      days_str,
      start_time,
      end_time,
      estimated_price,
      status,
      driver_id,
      point_progress,
      picked_up_at,
      delivered_at,
      delivery_recipient,
      delivery_department,
      delivery_comment,
      delivery_photo_url
    ) VALUES (
      NEW.user_id,
      NEW.name,
      NEW.pickup_address,
      NEW.pickup_contact_name,
      NEW.pickup_contact_phone,
      NEW.pickup_notes,
      NEW.dropoff_address,
      NEW.dropoff_contact_name,
      NEW.dropoff_contact_phone,
      NEW.dropoff_notes,
      NEW.stops,
      NEW.days_of_week,
      NEW.days_str,
      NEW.start_time,
      NEW.end_time,
      NEW.estimated_price,
      'active', -- new status is active, ready to be dispatched
      NULL,     -- no driver assigned yet
      '{}'::jsonb, -- reset point progress
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_navette_completed ON navettes;
CREATE TRIGGER on_navette_completed
  AFTER UPDATE ON navettes
  FOR EACH ROW
  EXECUTE FUNCTION duplicate_completed_navette();
