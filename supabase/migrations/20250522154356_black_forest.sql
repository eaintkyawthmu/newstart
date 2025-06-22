/*
  # Create knowledge library schema

  1. New Tables
    - `posts`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `category` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `user_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `post_id` (uuid, references posts)
      - `completed` (boolean)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to:
      - Read all posts
      - Track their own progress
*/

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  post_id uuid REFERENCES posts NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read posts"
  ON posts
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can track their own progress"
  ON user_progress
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insert initial posts
INSERT INTO posts (title, content, category) VALUES
  (
    'Understanding Emergency Funds',
    'An emergency fund is your financial safety net. It should cover 3-6 months of expenses and be easily accessible. Start small by saving $500-$1000, then build up gradually.',
    'basics'
  ),
  (
    'Budgeting 101',
    'A budget is a plan for your money. Use the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings and debt repayment. Track every expense to understand your spending patterns.',
    'budgeting'
  ),
  (
    'Credit Score Essentials',
    'Your credit score affects your financial opportunities. The five main factors are: payment history (35%), credit utilization (30%), credit history length (15%), credit mix (10%), and new credit (10%).',
    'credit'
  ),
  (
    'Tax Filing Basics',
    'Understanding taxes is crucial. Keep records of income, deductions, and credits. Common deductions include mortgage interest, charitable donations, and educational expenses.',
    'taxes'
  ),
  (
    'Investment Fundamentals',
    'Investing helps grow wealth over time. Start with low-cost index funds, diversify your portfolio, and reinvest dividends. Time in the market beats timing the market.',
    'investing'
  );