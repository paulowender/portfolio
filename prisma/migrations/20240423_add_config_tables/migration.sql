-- Add new fields to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "title" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "bio" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "location" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "website" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "linkedin" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "github" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "twitter" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "skills" TEXT[] DEFAULT '{}';

-- CreateTable
CREATE TABLE IF NOT EXISTS "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "description" TEXT,
    "mission" TEXT,
    "vision" TEXT,
    "founded" TEXT,
    "services" TEXT[],
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ai_configs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "default_provider" TEXT NOT NULL DEFAULT 'openai',
    "default_model" TEXT NOT NULL DEFAULT 'gpt-3.5-turbo',
    "openai_api_key" TEXT,
    "openai_enabled" BOOLEAN NOT NULL DEFAULT false,
    "openai_model" TEXT,
    "anthropic_api_key" TEXT,
    "anthropic_enabled" BOOLEAN NOT NULL DEFAULT false,
    "anthropic_model" TEXT,
    "groq_api_key" TEXT,
    "groq_enabled" BOOLEAN NOT NULL DEFAULT false,
    "groq_model" TEXT,
    "openrouter_api_key" TEXT,
    "openrouter_enabled" BOOLEAN NOT NULL DEFAULT false,
    "openrouter_model" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "messaging_configs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "evolution_api_key" TEXT,
    "evolution_base_url" TEXT,
    "evolution_enabled" BOOLEAN NOT NULL DEFAULT false,
    "evolution_instance" TEXT,
    "resend_api_key" TEXT,
    "resend_enabled" BOOLEAN NOT NULL DEFAULT false,
    "resend_from_email" TEXT,
    "resend_from_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messaging_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "companies_user_id_key" ON "companies"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ai_configs_user_id_key" ON "ai_configs"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "messaging_configs_user_id_key" ON "messaging_configs"("user_id");

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_configs" ADD CONSTRAINT "ai_configs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messaging_configs" ADD CONSTRAINT "messaging_configs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create policies for companies table
CREATE POLICY "Users can view their own company"
  ON "companies" FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create their own company"
  ON "companies" FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own company"
  ON "companies" FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own company"
  ON "companies" FOR DELETE
  TO authenticated
  USING (user_id = auth.uid()::text);

-- Create policies for ai_configs table
CREATE POLICY "Users can view their own AI config"
  ON "ai_configs" FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create their own AI config"
  ON "ai_configs" FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own AI config"
  ON "ai_configs" FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own AI config"
  ON "ai_configs" FOR DELETE
  TO authenticated
  USING (user_id = auth.uid()::text);

-- Create policies for messaging_configs table
CREATE POLICY "Users can view their own messaging config"
  ON "messaging_configs" FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create their own messaging config"
  ON "messaging_configs" FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own messaging config"
  ON "messaging_configs" FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own messaging config"
  ON "messaging_configs" FOR DELETE
  TO authenticated
  USING (user_id = auth.uid()::text);

-- Enable Row Level Security
ALTER TABLE "companies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai_configs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "messaging_configs" ENABLE ROW LEVEL SECURITY;
