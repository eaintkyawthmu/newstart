/*
  # Add user_type field to profiles table

  1. Schema Changes
    - Add `user_type` column to `profiles` table
    - Set default value to 'immigrant' for existing users
    - Add check constraint to ensure valid values

  2. Security
    - No RLS changes needed (inherits existing policies)
    - Users can update their own user_type through existing policies

  3. Data Migration
    - Existing users will default to 'immigrant' type
    - New users will be prompted to select their type during onboarding
*/

-- Add user_type column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'user_type'
  ) THEN
    ALTER TABLE profiles ADD COLUMN user_type text DEFAULT 'immigrant';
  END IF;
END $$;

-- Add check constraint for valid user types
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'profiles_user_type_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_user_type_check 
    CHECK (user_type IN ('immigrant', 'nonImmigrant'));
  END IF;
END $$;

-- Create index for user_type for better query performance
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'idx_profiles_user_type'
  ) THEN
    CREATE INDEX idx_profiles_user_type ON profiles(user_type);
  END IF;
END $$;