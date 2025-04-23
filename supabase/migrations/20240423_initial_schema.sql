-- Create schema for the portfolio system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  live_url TEXT,
  github_url TEXT,
  technologies TEXT[] NOT NULL DEFAULT '{}',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);

-- Create index on featured for faster queries on the homepage
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured) WHERE featured = TRUE;

-- Create reminders table (for future use)
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);

-- Create index on due_date for faster queries
CREATE INDEX IF NOT EXISTS idx_reminders_due_date ON reminders(due_date);

-- Create appointments table (for future use)
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);

-- Create index on start_time for faster queries
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);

-- Create storage bucket for project images
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Public Access to Project Images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolio');

CREATE POLICY "Users can upload their own images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'portfolio' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update their own images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'portfolio' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'portfolio' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Set up RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- Create policies for projects table
CREATE POLICY "Anyone can view featured projects"
  ON projects FOR SELECT
  USING (featured = TRUE);

CREATE POLICY "Users can view all their own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for reminders table
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

-- Create policies for appointments table
CREATE POLICY "Users can view their own appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own appointments"
  ON appointments FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_reminders_updated_at
  BEFORE UPDATE ON reminders
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Note: User accounts should be created through the Supabase Authentication UI
-- The trigger we created earlier will automatically insert users into the public.users table
