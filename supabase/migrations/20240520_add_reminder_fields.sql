-- Add new fields to reminders table
ALTER TABLE reminders 
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'general',
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS recurrence VARCHAR(20) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS recurrence_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS notify_email BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS notify_whatsapp BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS notify_before INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS color VARCHAR(20) DEFAULT NULL;

-- Create index on category for faster filtering
CREATE INDEX IF NOT EXISTS idx_reminders_category ON reminders(category);

-- Create index on priority for faster filtering
CREATE INDEX IF NOT EXISTS idx_reminders_priority ON reminders(priority);

-- Update RLS policies to include new fields
DROP POLICY IF EXISTS "Users can view their own reminders" ON reminders;
DROP POLICY IF EXISTS "Users can create their own reminders" ON reminders;
DROP POLICY IF EXISTS "Users can update their own reminders" ON reminders;
DROP POLICY IF EXISTS "Users can delete their own reminders" ON reminders;

CREATE POLICY "Users can view their own reminders"
  ON reminders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own reminders"
  ON reminders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own reminders"
  ON reminders FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own reminders"
  ON reminders FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
