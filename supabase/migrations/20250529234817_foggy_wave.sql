-- First, drop existing constraints
ALTER TABLE course_progress DROP CONSTRAINT IF EXISTS course_progress_user_id_lesson_id_key;
ALTER TABLE course_progress DROP CONSTRAINT IF EXISTS course_progress_user_id_course_id_module_id_key;

-- Make module_id nullable
ALTER TABLE course_progress ALTER COLUMN module_id DROP NOT NULL;

-- Add lesson_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'course_progress' 
    AND column_name = 'lesson_id'
  ) THEN
    ALTER TABLE course_progress 
    ADD COLUMN lesson_id text NOT NULL;
  END IF;
END $$;

-- Create new unique constraint
ALTER TABLE course_progress
ADD CONSTRAINT course_progress_user_id_lesson_id_key 
UNIQUE (user_id, lesson_id);

-- Update RLS policies
DROP POLICY IF EXISTS "Users can manage their own progress" ON course_progress;
CREATE POLICY "Users can manage their own progress"
ON course_progress
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own progress" ON course_progress;
CREATE POLICY "Users can view their own progress"
ON course_progress
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);