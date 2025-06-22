/*
  # Add profile setup form fields

  1. New Columns
    - `ssn_last_four` (text) - Last 4 digits of SSN
    - `id_last_four` (text) - Last 4 digits of ID/Driver's License
    - `phone_number` (text) - U.S. phone number
    - `street_address` (text) - Current U.S. address
    - `has_ssn` (boolean) - SSN application status
    - `has_phone` (boolean) - Phone number status
    - `has_housing` (boolean) - Housing status
    - `concerns` (text) - User concerns/questions

  2. Notes
    - All columns are nullable to maintain compatibility with existing records
    - Using DO block to safely add columns if they don't exist
*/

DO $$ 
BEGIN
  -- Add SSN last 4 digits
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'ssn_last_four'
  ) THEN
    ALTER TABLE profiles ADD COLUMN ssn_last_four text;
  END IF;

  -- Add ID/Driver's License last 4 digits
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'id_last_four'
  ) THEN
    ALTER TABLE profiles ADD COLUMN id_last_four text;
  END IF;

  -- Add phone number
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone_number text;
  END IF;

  -- Add street address
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'street_address'
  ) THEN
    ALTER TABLE profiles ADD COLUMN street_address text;
  END IF;

  -- Add SSN status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'has_ssn'
  ) THEN
    ALTER TABLE profiles ADD COLUMN has_ssn boolean DEFAULT false;
  END IF;

  -- Add phone status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'has_phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN has_phone boolean DEFAULT false;
  END IF;

  -- Add housing status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'has_housing'
  ) THEN
    ALTER TABLE profiles ADD COLUMN has_housing boolean DEFAULT false;
  END IF;

  -- Add concerns/questions field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'concerns'
  ) THEN
    ALTER TABLE profiles ADD COLUMN concerns text;
  END IF;
END $$;