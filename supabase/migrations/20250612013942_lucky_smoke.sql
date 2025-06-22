/*
  # Fix Database Schema Issues

  1. New Tables and Columns
    - Add missing columns to profiles table
    - Create analytics_events table
    - Create subscription_tiers table
    - Create user_subscriptions table

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies

  3. Data
    - Insert default subscription tiers
*/

-- First, let's add the missing columns to the profiles table
DO $$ 
BEGIN
  -- Add role column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role text DEFAULT 'free' CHECK (role IN ('free', 'premium', 'admin', 'moderator'));
  END IF;

  -- Add subscription_status column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_status text DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'trialing', 'canceled', 'past_due'));
  END IF;

  -- Add premium_access_until column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'premium_access_until'
  ) THEN
    ALTER TABLE profiles ADD COLUMN premium_access_until timestamptz;
  END IF;

  -- Add premium_tier column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'premium_tier'
  ) THEN
    ALTER TABLE profiles ADD COLUMN premium_tier text;
  END IF;

  -- Add stripe_customer_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN stripe_customer_id text UNIQUE;
  END IF;

  -- Add total_spending column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'total_spending'
  ) THEN
    ALTER TABLE profiles ADD COLUMN total_spending numeric DEFAULT 0;
  END IF;

  -- Add last_active_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'last_active_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_active_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create analytics_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users,
  event_name text NOT NULL,
  properties jsonb DEFAULT '{}',
  session_id text,
  user_agent text,
  ip_address inet,
  created_at timestamptz DEFAULT now()
);

-- Create subscription_tiers table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscription_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  price_monthly numeric,
  price_yearly numeric,
  features jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_subscriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  tier_id uuid REFERENCES subscription_tiers,
  stripe_subscription_id text UNIQUE,
  status text NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, stripe_subscription_id)
);

-- Enable RLS on new tables
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can insert their own analytics events" ON analytics_events;
DROP POLICY IF EXISTS "Admins can view all analytics events" ON analytics_events;
DROP POLICY IF EXISTS "Anyone can view active subscription tiers" ON subscription_tiers;
DROP POLICY IF EXISTS "Admins can manage subscription tiers" ON subscription_tiers;
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON user_subscriptions;

-- Analytics events policies
CREATE POLICY "Users can insert their own analytics events"
  ON analytics_events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all analytics events"
  ON analytics_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Subscription tiers policies
CREATE POLICY "Anyone can view active subscription tiers"
  ON subscription_tiers
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage subscription tiers"
  ON subscription_tiers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- User subscriptions policies
CREATE POLICY "Users can view their own subscriptions"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
  ON user_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Insert default subscription tiers
INSERT INTO subscription_tiers (name, display_name, description, price_monthly, price_yearly, features) VALUES
  (
    'free',
    'Free',
    'Get started with basic financial guidance',
    0,
    0,
    '["Basic lessons", "Mini Angel chat", "Progress tracking"]'
  ),
  (
    'premium',
    'Premium',
    'Unlock all features and premium content',
    9.99,
    99.99,
    '["All lessons", "Premium courses", "Priority support", "Advanced analytics", "1-on-1 consultations"]'
  ),
  (
    'lifetime',
    'Lifetime',
    'One-time payment for lifetime access',
    null,
    299.99,
    '["All premium features", "Lifetime updates", "VIP support", "Exclusive content"]'
  )
ON CONFLICT (name) DO NOTHING;

-- Create helpful functions
CREATE OR REPLACE FUNCTION has_premium_access(user_id uuid)
RETURNS boolean AS $$
DECLARE
  user_profile profiles%ROWTYPE;
BEGIN
  SELECT * INTO user_profile FROM profiles WHERE id = user_id;
  
  IF user_profile.role = 'admin' THEN
    RETURN true;
  END IF;
  
  IF user_profile.subscription_status = 'active' AND 
     (user_profile.premium_access_until IS NULL OR user_profile.premium_access_until > now()) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);