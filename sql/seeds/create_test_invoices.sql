-- Script to create test invoices for keisha.khotothinu@gmail.com

DO $$
DECLARE
    v_client_id UUID;
    v_ref_prefix TEXT := 'INV-TEST-';
BEGIN
    -- Get client ID
    SELECT id INTO v_client_id FROM public.clients WHERE email = 'keisha.khotothinu@gmail.com';

    IF v_client_id IS NULL THEN
        RAISE NOTICE 'Client with email keisha.khotothinu@gmail.com not found. Please create the client first.';
        RETURN;
    END IF;

    -- 3 Pending Invoices (Non payées)
    INSERT INTO public.invoices (reference, client_id, amount_ht, amount_tva, amount_ttc, status, due_date, created_at)
    VALUES
    (v_ref_prefix || 'PEND-1-' || floor(random() * 10000)::text, v_client_id, 100.00, 20.00, 120.00, 'pending', NOW() + INTERVAL '30 days', NOW()),
    (v_ref_prefix || 'PEND-2-' || floor(random() * 10000)::text, v_client_id, 250.50, 50.10, 300.60, 'pending', NOW() + INTERVAL '15 days', NOW()),
    (v_ref_prefix || 'PEND-3-' || floor(random() * 10000)::text, v_client_id, 75.00, 15.00, 90.00, 'pending', NOW() + INTERVAL '45 days', NOW());

    -- 5 Overdue Invoices (En retard)
    INSERT INTO public.invoices (reference, client_id, amount_ht, amount_tva, amount_ttc, status, due_date, created_at)
    VALUES
    (v_ref_prefix || 'OVER-1-' || floor(random() * 10000)::text, v_client_id, 300.00, 60.00, 360.00, 'overdue', NOW() - INTERVAL '10 days', NOW() - INTERVAL '40 days'),
    (v_ref_prefix || 'OVER-2-' || floor(random() * 10000)::text, v_client_id, 450.00, 90.00, 540.00, 'overdue', NOW() - INTERVAL '5 days', NOW() - INTERVAL '35 days'),
    (v_ref_prefix || 'OVER-3-' || floor(random() * 10000)::text, v_client_id, 1200.00, 240.00, 1440.00, 'overdue', NOW() - INTERVAL '20 days', NOW() - INTERVAL '50 days'),
    (v_ref_prefix || 'OVER-4-' || floor(random() * 10000)::text, v_client_id, 85.00, 17.00, 102.00, 'overdue', NOW() - INTERVAL '3 days', NOW() - INTERVAL '33 days'),
    (v_ref_prefix || 'OVER-5-' || floor(random() * 10000)::text, v_client_id, 600.00, 120.00, 720.00, 'overdue', NOW() - INTERVAL '60 days', NOW() - INTERVAL '90 days');

    -- 1 Paid Invoice (Payée)
    INSERT INTO public.invoices (reference, client_id, amount_ht, amount_tva, amount_ttc, status, due_date, paid_date, created_at)
    VALUES
    (v_ref_prefix || 'PAID-1-' || floor(random() * 10000)::text, v_client_id, 500.00, 100.00, 600.00, 'paid', NOW() - INTERVAL '100 days', NOW() - INTERVAL '95 days', NOW() - INTERVAL '120 days');

    RAISE NOTICE 'Invoices created successfully for client %', v_client_id;
END $$;
