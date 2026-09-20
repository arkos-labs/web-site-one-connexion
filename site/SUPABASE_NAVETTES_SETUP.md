# Navettes (Shuttles) - Supabase Setup Guide

## Overview
The navettes feature allows authenticated users to create and manage recurring shuttle routes. All data is stored in Supabase with Row-Level Security (RLS) to ensure users can only access their own navettes.

## Database Schema

### `navettes` Table
Stores information about recurring shuttle routes.

**Columns:**
- `id` (UUID, Primary Key) - Unique identifier
- `user_id` (UUID, Foreign Key) - References the authenticated user
- `name` (TEXT) - Name of the navette
- `pickup_address` (TEXT) - Starting address
- `pickup_contact_name` (TEXT) - Contact person at pickup
- `pickup_contact_phone` (TEXT) - Contact phone at pickup
- `pickup_notes` (TEXT) - Special instructions at pickup
- `dropoff_address` (TEXT) - Final destination address
- `dropoff_contact_name` (TEXT) - Contact person at dropoff
- `dropoff_contact_phone` (TEXT) - Contact phone at dropoff
- `dropoff_notes` (TEXT) - Special instructions at dropoff
- `stops` (JSONB) - Array of intermediate stops with structure:
  ```json
  [
    {
      "address": "123 Rue de Paris",
      "contactName": "John Doe",
      "contactPhone": "06 12 34 56 78",
      "notes": "Ring the bell"
    }
  ]
  ```
- `days_of_week` (TEXT[]) - Array of days (e.g., ['mon', 'tue', 'wed', 'thu', 'fri'])
- `days_str` (TEXT) - Human-readable days (e.g., "L, M, M, J, V")
- `start_time` (TIME) - Departure time (e.g., "08:30")
- `end_time` (TIME) - Arrival/deadline time (e.g., "12:00")
- `status` (TEXT) - Status of navette ('active', 'inactive')
- `estimated_price` (DECIMAL) - Estimated price per passage
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

## Setup Instructions

### Option 1: Using Supabase Dashboard (Manual)

1. Go to your Supabase project dashboard
2. Open the SQL Editor
3. Copy the SQL from `supabase/migrations/create_navettes_table.sql`
4. Paste it in the SQL Editor
5. Click "Run" to execute

### Option 2: Using Supabase CLI (Recommended)

If you have the Supabase CLI installed:

```bash
# Apply the migration
supabase migration up

# Or push to your project
supabase db push
```

### Option 3: Manual Table Creation

If you prefer to create the table step-by-step:

1. **Create the table:**
   ```sql
   CREATE TABLE navettes (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
     name TEXT NOT NULL DEFAULT 'Nouvelle Navette',
     pickup_address TEXT NOT NULL,
     pickup_contact_name TEXT,
     pickup_contact_phone TEXT,
     pickup_notes TEXT,
     dropoff_address TEXT NOT NULL,
     dropoff_contact_name TEXT,
     dropoff_contact_phone TEXT,
     dropoff_notes TEXT,
     stops JSONB DEFAULT '[]',
     days_of_week TEXT[] DEFAULT '{}',
     days_str TEXT,
     start_time TIME,
     end_time TIME,
     status TEXT DEFAULT 'active',
     estimated_price DECIMAL(10, 2) DEFAULT 185.00,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

2. **Create indexes:**
   ```sql
   CREATE INDEX navettes_user_id_idx ON navettes(user_id);
   CREATE INDEX navettes_created_at_idx ON navettes(created_at DESC);
   ```

3. **Enable RLS:**
   ```sql
   ALTER TABLE navettes ENABLE ROW LEVEL SECURITY;
   ```

4. **Create RLS policies:**
   ```sql
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
   ```

## Features

### User Experience
- **View navettes**: Authenticated users see a list of their scheduled shuttles
- **Create navette**: Users can create new recurring shuttle routes by:
  - Setting pickup and dropoff addresses
  - Adding contact information and notes at each location
  - Adding intermediate stops
  - Selecting days of the week
  - Setting start and end times
- **Real-time feedback**: Form shows loading state during submission
- **Error handling**: Users are notified of any submission errors

### Security
- **Row-Level Security (RLS)**: Each user can only see, create, update, or delete their own navettes
- **User isolation**: The `user_id` field is automatically set from the authenticated session
- **Data integrity**: Foreign key constraint ensures user references are valid

## Frontend Integration

The navettes feature is integrated in:
- **Page**: `/app/dashboard/navettes/page.tsx`
- **Components**:
  - Uses `AddressAutocomplete` for address selection
  - Displays loading state while fetching navettes
  - Shows form with validation feedback

### Key Files
- `app/dashboard/navettes/page.tsx` - Main navettes page with form and list
- `lib/supabase/client.ts` - Supabase client initialization

## Testing

### Create a Test Navette
1. Log in with an authenticated user
2. Navigate to `/dashboard/navettes`
3. Click "Nouvelle navette"
4. Fill in the form:
   - Pickup address: "123 Rue de Paris, 75001 Paris"
   - Dropoff address: "456 Avenue Lyon, 75004 Paris"
   - Contact info and notes (optional)
   - Add intermediate stops (optional)
   - Select days: L, M, M, J, V
   - Start time: 08:30
   - End time: 12:00
5. Click "Confirmer la navette"
6. Verify that the navette appears in the list

### Verify in Supabase
Run this query in the Supabase SQL Editor:
```sql
SELECT * FROM navettes WHERE user_id = 'your-user-id';
```

## Troubleshooting

### Navettes not saving
- Check that the `navettes` table exists in Supabase
- Verify RLS policies are enabled
- Check browser console for errors
- Ensure user is authenticated (`auth.uid()` is available)

### Can't see navettes list
- Verify the table has data
- Check that RLS policies are correct
- Clear browser cache and reload
- Check browser console for API errors

### Address autocomplete not working
- Ensure `AddressAutocomplete` component is properly imported
- Check that the component is receiving correct props

## Future Enhancements
- [ ] Edit existing navettes
- [ ] Delete navettes
- [ ] Change navette status (active/inactive)
- [ ] Duplicate navettes
- [ ] Export navettes to PDF
- [ ] Calendar view for navettes
- [ ] Driver assignment and tracking
