-- Add driver_accepted_at to orders if missing
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS driver_accepted_at timestamptz;

-- Optional: index for faster filtering (if needed)
CREATE INDEX IF NOT EXISTS idx_orders_driver_accepted_at ON public.orders(driver_accepted_at);
