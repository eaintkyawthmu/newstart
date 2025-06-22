/*
  # Create posts and user progress tables

  1. New Tables
    - `posts`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `category` (text)
      - `created_at` (timestamp)
    - `user_progress`
      - `user_id` (uuid, references auth.users)
      - `post_id` (uuid, references posts)
      - `completed` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to:
      - Read all posts
      - Read and write their own progress
*/

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  user_id uuid REFERENCES auth.users NOT NULL,
  post_id uuid REFERENCES posts NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to posts"
  ON posts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage their own progress"
  ON user_progress
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insert some initial posts
INSERT INTO posts (title, content, category) VALUES
  ('Getting Started with Personal Finance', 'Learn the basics of managing your personal finances...', 'basics'),
  ('Understanding Credit Scores', 'Your credit score is a crucial financial indicator...', 'credit'),
  ('Budgeting 101', 'Creating and maintaining a budget is essential...', 'budgeting'),
  ('Investment Fundamentals', 'Start your investment journey with these key concepts...', 'investing')
ON CONFLICT DO NOTHING;