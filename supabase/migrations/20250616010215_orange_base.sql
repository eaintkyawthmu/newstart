/*
  # Add completed_lesson_tasks to course_progress

  1. Changes
    - Add `completed_lesson_tasks` column to `course_progress` table
      - Type: text[]
      - Default: '{}'
    - Update RLS policies to allow users to manage their own completed tasks

  2. Purpose
    - Enable granular tracking of individual task completion within lessons
    - Support the new action-oriented learning experience
*/

-- Add completed_lesson_tasks column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'course_progress' 
    AND column_name = 'completed_lesson_tasks'
  ) THEN
    ALTER TABLE course_progress ADD COLUMN completed_lesson_tasks text[] DEFAULT '{}';
  END IF;
END $$;

-- Update RLS policies to allow users to manage their own completed_lesson_tasks
DROP POLICY IF EXISTS "Users can manage their own progress" ON course_progress;
CREATE POLICY "Users can manage their own progress"
ON course_progress
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);