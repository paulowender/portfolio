# Supabase Database Setup

This directory contains the database schema and migration files for the DevPortfolio application.

## Database Schema

The database consists of the following tables:

1. **users** - Stores user profile information

   - id (UUID, PK)
   - email (TEXT, UNIQUE)
   - name (TEXT)
   - avatar_url (TEXT, nullable)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

2. **projects** - Stores portfolio projects

   - id (UUID, PK)
   - title (TEXT)
   - description (TEXT)
   - image_url (TEXT, nullable)
   - live_url (TEXT, nullable)
   - github_url (TEXT, nullable)
   - technologies (TEXT[])
   - featured (BOOLEAN)
   - user_id (UUID, FK to users.id)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

3. **reminders** - Stores reminders for important dates (future feature)

   - id (UUID, PK)
   - title (TEXT)
   - description (TEXT, nullable)
   - due_date (TIMESTAMP)
   - completed (BOOLEAN)
   - user_id (UUID, FK to users.id)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

4. **appointments** - Stores calendar appointments (future feature)
   - id (UUID, PK)
   - title (TEXT)
   - description (TEXT, nullable)
   - start_time (TIMESTAMP)
   - end_time (TIMESTAMP)
   - location (TEXT, nullable)
   - user_id (UUID, FK to users.id)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

## Row Level Security (RLS)

The database uses Row Level Security to ensure that users can only access their own data:

- Users can only view and edit their own profile
- Users can only view, create, update, and delete their own projects
- Featured projects are publicly viewable
- Users can only view, create, update, and delete their own reminders and appointments

## Storage

The application uses Supabase Storage for storing project images:

- A storage bucket named "portfolio" is created
- Images are organized by user ID
- Public access is allowed for reading images
- Only authenticated users can upload, update, or delete their own images

## How to Apply Migrations

1. Create a `.env.local` file in the root directory with the following variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. Generate the SQL for migration:

   ```bash
   npm run migrate
   ```

3. Copy the generated SQL and run it in the Supabase SQL Editor.

## Seeding the Database

To populate the database with sample data:

1. Make sure you've applied the migrations first
2. Generate the SQL for seeding:

   ```bash
   npm run seed
   ```

3. Copy the generated SQL and run it in the Supabase SQL Editor.

This will add sample projects, reminders, and appointments to your database.

## Manual Setup in Supabase Dashboard

If you prefer to set up the database manually:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `migrations/20240423_initial_schema.sql`
4. Paste and execute the SQL in the editor

## Storage Bucket Setup

1. In your Supabase dashboard, go to Storage
2. Create a new bucket named "portfolio"
3. Set the bucket to public
4. Configure the bucket policies as defined in the migration file
