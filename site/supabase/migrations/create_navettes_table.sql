-- Create navettes table for recurring shuttle routes
CREATE TABLE IF NOT EXISTS navettes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Navette identification
  name TEXT NOT NULL DEFAULT 'Nouvelle Navette',

  -- Pickup/Departure point
  pickup_address TEXT NOT NULL,
  pickup_contact_name TEXT,
  pickup_contact_phone TEXT,
  pickup_notes TEXT,

  -- Dropoff/Arrival point
  dropoff_address TEXT NOT NULL,
  dropoff_contact_name TEXT,
  dropoff_contact_phone TEXT,
  dropoff_notes TEXT,

  -- Intermediate stops
  stops JSONB DEFAULT '[]',

  -- Schedule information
  days_of_week TEXT[] DEFAULT '{}',
  days_str TEXT,
  start_time TIME,
  end_time TIME,

  -- Service information
  status TEXT DEFAULT 'active',
  estimated_price DECIMAL(10, 2) DEFAULT 185.00,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS navettes_user_id_idx ON navettes(user_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS navettes_created_at_idx ON navettes(created_at DESC);

-- Enable RLS
ALTER TABLE navettes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Users can view their own navettes" ON navettes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own navettes" ON navettes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own navettes" ON navettes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own navettes" ON navettes
  FOR DELETE
  USING (auth.uid() = user_id);
