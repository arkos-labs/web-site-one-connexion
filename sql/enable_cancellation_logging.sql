-- -----------------------------------------------------------------------------
-- ENABLE CLIENT CANCELLATION & AUTOMATIC LOGGING
-- -----------------------------------------------------------------------------

-- 1. RLS: Allow Clients to Cancel their own orders
-- We allow UPDATE only if they own the order. 
-- Ideally we'd restrict columns, but Supabase RLS is row-based.
-- We trust the frontend logic, but we could add a CHECK constraint if needed.

DROP POLICY IF EXISTS "Clients cancel own orders" ON public.orders;

CREATE POLICY "Clients cancel own orders" ON public.orders
FOR UPDATE
TO authenticated
USING (
    -- Can update if they are the client linked to the order
    client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
    OR
    -- OR if they are the user who created it (guest/direct)
    user_id = auth.uid()
)
WITH CHECK (
    -- Optional: Ensure they are setting status to cancelled
    status = 'cancelled'
);


-- 2. AUTOMATIC LOGGING (Trigger)
-- This ensures that ANY status change (by Admin, Client, or Driver) is logged in order_events.
-- This way, the Admin will see "Client cancelled order" in the history.

CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
    v_actor_role TEXT;
    v_description TEXT;
BEGIN
    -- Only log if status changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        
        -- 1. Determine who did it
        -- We try to fetch the role of the current user
        SELECT role INTO v_actor_role 
        FROM public.profiles 
        WHERE id = auth.uid();

        -- Default to 'system' if unknown (or server-side operation)
        IF v_actor_role IS NULL THEN
            v_actor_role := 'system';
        END IF;

        -- 2. Build description
        v_description := 'Statut modifié : ' || OLD.status || ' ➔ ' || NEW.status;
        
        -- Add reason if cancelled
        IF NEW.status = 'cancelled' AND NEW.cancellation_reason IS NOT NULL THEN
            v_description := v_description || '. Raison : ' || NEW.cancellation_reason;
        END IF;

        -- 3. Insert Event
        INSERT INTO public.order_events (
            order_id, 
            event_type, 
            description, 
            actor_type, 
            metadata
        )
        VALUES (
            NEW.id, 
            'status_change', 
            v_description, 
            v_actor_role,
            jsonb_build_object(
                'old_status', OLD.status,
                'new_status', NEW.status,
                'fee', NEW.cancellation_fee
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Trigger
DROP TRIGGER IF EXISTS on_order_status_change ON public.orders;
CREATE TRIGGER on_order_status_change
AFTER UPDATE ON public.orders
FOR EACH ROW EXECUTE PROCEDURE public.log_order_status_change();
