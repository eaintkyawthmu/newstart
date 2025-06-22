/*
  # Add onboarding checklist fields to profiles

  1. Changes
    - Add checklist_items column to store completed tasks
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'checklist_items'
  ) THEN
    ALTER TABLE profiles ADD COLUMN checklist_items text[] DEFAULT '{}';
  END IF;
END $$;