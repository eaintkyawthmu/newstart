/*
  # Create trigger for auth.users to profiles sync

  1. Purpose
    - Automatically create a profile entry when a new user signs up
    - Ensures every auth.users entry has a corresponding profiles entry
    - Copies email and created_at from auth.users to profiles

  2. Implementation
    - Create a trigger function that runs after INSERT on auth.users
    - Insert a new row into public.profiles with user data
*/

-- Function to handle new user creation in auth.users and insert into public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NEW.created_at, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the existing trigger if it exists to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger to run after a new user is inserted into auth.users
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();