-- -----------------------------------------------------------------------------
-- PROMOTE USER TO ADMIN
-- User: cherkinicolas@gmail.com
-- UID: c64cd4c2-3950-4b3a-a376-4f2734624a8a
-- -----------------------------------------------------------------------------

DO $$
DECLARE
    v_user_id UUID := 'c64cd4c2-3950-4b3a-a376-4f2734624a8a';
    v_email TEXT := 'cherkinicolas@gmail.com';
BEGIN
    -- 1. Update PROFILE role
    UPDATE public.profiles 
    SET role = 'admin' 
    WHERE id = v_user_id;
    
    -- 2. Ensure entry in ADMINS table
    IF NOT EXISTS (SELECT 1 FROM public.admins WHERE user_id = v_user_id) THEN
        INSERT INTO public.admins (user_id, email, role, status, first_name, last_name)
        VALUES (v_user_id, v_email, 'super_admin', 'active', 'Nicolas', 'Cherki');
        RAISE NOTICE 'User promoted to Admin (created new admin entry)';
    ELSE
        UPDATE public.admins 
        SET status = 'active', role = 'super_admin' 
        WHERE user_id = v_user_id;
        RAISE NOTICE 'User promoted to Admin (updated existing entry)';
    END IF;

    -- 3. Optional: Remove from clients/drivers to avoid confusion (though not strictly necessary if useAuth checks admins first)
    -- DELETE FROM public.clients WHERE user_id = v_user_id;
    -- DELETE FROM public.drivers WHERE user_id = v_user_id;
    
END $$;
