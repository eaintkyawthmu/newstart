/*
  # Add concerns column to profiles table

  1. Changes
    - Add `concerns` column to `profiles` table
      - Type: text
      - Nullable: true
      - Default: null
    
  2. Purpose
    - Allow users to save their concerns and questions during onboarding
    - Support the WelcomeSetup component's profile saving functionality
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'concerns'
  ) THEN
    ALTER TABLE profiles ADD COLUMN concerns text;
  END IF;
END $$;