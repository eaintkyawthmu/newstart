/*
  # Verify and enhance user_type setup in profiles table

  1. Database Schema Verification
    - Confirm `profiles` table has `user_type` field
    - Ensure proper constraints are in place
    - Add index for performance

  2. Data Integrity
    - Ensure existing users have default user_type
    - Add proper validation constraints
*/

-- Verify the profiles table has the user_type field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'user_type'
  ) THEN
    ALTER TABLE profiles ADD COLUMN user_type TEXT DEFAULT 'immigrant';
  END IF;
END $$;

-- Ensure the check constraint exists for user_type validation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'user_type_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT user_type_check 
    CHECK (user_type = ANY (ARRAY['immigrant'::text, 'nonImmigrant'::text]));
  END IF;
END $$;

-- Add index for user_type if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'profiles' AND indexname = 'idx_profiles_user_type'
  ) THEN
    CREATE INDEX idx_profiles_user_type ON profiles(user_type);
  END IF;
END $$;

-- Update any existing profiles that don't have a user_type set
UPDATE profiles 
SET user_type = 'immigrant' 
WHERE user_type IS NULL;

-- Make user_type NOT NULL after setting defaults
ALTER TABLE profiles ALTER COLUMN user_type SET NOT NULL;