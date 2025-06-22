/*
  # Add country of origin to profiles

  1. Changes
    - Add `country_of_origin` column to `profiles` table
      - Type: text
      - Nullable: true (to maintain compatibility with existing records)

  2. Notes
    - Using DO block to safely add column if it doesn't exist
    - No data migration needed as this is a new optional field
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'country_of_origin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN country_of_origin text;
  END IF;
END $$;