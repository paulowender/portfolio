-- Add missing fields to reminders table
ALTER TABLE "reminders" ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT 'general';
ALTER TABLE "reminders" ADD COLUMN IF NOT EXISTS "priority" TEXT NOT NULL DEFAULT 'medium';
ALTER TABLE "reminders" ADD COLUMN IF NOT EXISTS "recurrence" TEXT;
ALTER TABLE "reminders" ADD COLUMN IF NOT EXISTS "recurrence_end_date" TIMESTAMP(3);
ALTER TABLE "reminders" ADD COLUMN IF NOT EXISTS "notify_email" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "reminders" ADD COLUMN IF NOT EXISTS "notify_whatsapp" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "reminders" ADD COLUMN IF NOT EXISTS "notify_before" INTEGER NOT NULL DEFAULT 60;
ALTER TABLE "reminders" ADD COLUMN IF NOT EXISTS "color" TEXT;
