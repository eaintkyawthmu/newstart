-- Add completed_lesson_tasks column to course_progress table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'course_progress' AND column_name = 'completed_lesson_tasks'
  ) THEN
    ALTER TABLE course_progress ADD COLUMN completed_lesson_tasks text[] DEFAULT '{}';
  END IF;
END $$;

-- Update RLS policy for course_progress to allow users to update this new column
DROP POLICY IF EXISTS "Users can manage their own progress" ON course_progress;
CREATE POLICY "Users can manage their own progress"
  ON course_progress
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for performance on new column (optional, but good for tracking)
CREATE INDEX IF NOT EXISTS idx_course_progress_completed_lesson_tasks ON course_progress USING GIN (completed_lesson_tasks);