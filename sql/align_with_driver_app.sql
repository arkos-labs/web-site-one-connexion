-- Align DB with Driver App (safe, idempotent)
-- Only normalizes status values. No schema changes.

-- Orders status normalization
update public.orders set status = 'assigned' where status = 'dispatched';
update public.orders set status = 'driver_refused' where status = 'refused';
update public.orders set status = 'cancelled' where status = 'canceled';
update public.orders set status = 'picked_up' where status = 'in_progress';

-- Drivers status normalization (if any legacy values exist)
update public.drivers set status = 'online' where status = 'available';
update public.drivers set status = 'busy' where status = 'working';
update public.drivers set status = 'offline' where status = 'inactive';

-- Optional sanity check
-- select status, count(*) from public.orders group by status order by count desc;
-- select status, count(*) from public.drivers group by status order by count desc;
