/*
  # Add profile fields for user onboarding

  1. Changes
    - Add new columns to profiles table:
      - immigration_year (integer)
      - marital_status (text)
      - dependents (integer)
      - employment_status (text)
      - monthly_income (integer)
*/

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS immigration_year integer,
ADD COLUMN IF NOT EXISTS marital_status text,
ADD COLUMN IF NOT EXISTS dependents integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS employment_status text,
ADD COLUMN IF NOT EXISTS monthly_income integer DEFAULT 0;