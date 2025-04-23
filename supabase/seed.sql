-- Sample data for testing the portfolio system
-- Run this after applying the initial schema migration

-- Insert a sample user (replace with your own user ID from auth.users)
-- Note: You should already have a user in the users table after signing up through the app
-- This is just an example of how to manually insert a user if needed
/*
INSERT INTO users (id, email, name, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000000', -- Replace with your actual user ID
  'user@example.com',
  'John Doe',
  NOW(),
  NOW()
);
*/

-- Insert sample projects (replace the user_id with your actual user ID)
INSERT INTO projects (
  title,
  description,
  image_url,
  live_url,
  github_url,
  technologies,
  featured,
  user_id,
  created_at,
  updated_at
)
VALUES
(
  'E-commerce Platform',
  'A full-featured e-commerce platform built with Next.js and Stripe integration. This project includes product listings, shopping cart, checkout process, and admin dashboard for managing products and orders.',
  'https://images.unsplash.com/photo-1557821552-17105176677c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  'https://example.com/ecommerce',
  'https://github.com/yourusername/ecommerce',
  ARRAY['Next.js', 'React', 'Stripe', 'Tailwind CSS', 'PostgreSQL'],
  TRUE,
  (SELECT id FROM users LIMIT 1), -- This will use the first user in the users table
  NOW(),
  NOW()
),
(
  'Task Management App',
  'A collaborative task management application with real-time updates. Features include task creation, assignment, due dates, comments, and status tracking. Built with React and Firebase for real-time functionality.',
  'https://images.unsplash.com/photo-1540350394557-8d14678e7f91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  'https://example.com/taskapp',
  'https://github.com/yourusername/taskapp',
  ARRAY['React', 'Firebase', 'Material UI', 'JavaScript'],
  TRUE,
  (SELECT id FROM users LIMIT 1),
  NOW(),
  NOW()
),
(
  'Portfolio Website',
  'A responsive portfolio website with dark mode and animations. This project showcases my work and skills using modern web technologies. Features include smooth scrolling, dark mode toggle, and contact form.',
  'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  'https://example.com/portfolio',
  'https://github.com/yourusername/portfolio',
  ARRAY['Next.js', 'Tailwind CSS', 'Framer Motion', 'TypeScript'],
  TRUE,
  (SELECT id FROM users LIMIT 1),
  NOW(),
  NOW()
),
(
  'Weather Dashboard',
  'A weather dashboard that displays current weather conditions and forecasts for multiple locations. Uses the OpenWeather API to fetch real-time weather data and displays it in an intuitive interface.',
  'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  'https://example.com/weather',
  'https://github.com/yourusername/weather',
  ARRAY['React', 'OpenWeather API', 'Chart.js', 'CSS'],
  FALSE,
  (SELECT id FROM users LIMIT 1),
  NOW(),
  NOW()
),
(
  'Blog Platform',
  'A full-featured blog platform with user authentication, markdown support, and comment system. Allows users to create, edit, and publish blog posts with rich text formatting and image uploads.',
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  'https://example.com/blog',
  'https://github.com/yourusername/blog',
  ARRAY['Next.js', 'MongoDB', 'NextAuth.js', 'Tailwind CSS'],
  FALSE,
  (SELECT id FROM users LIMIT 1),
  NOW(),
  NOW()
);

-- Insert sample reminders (replace the user_id with your actual user ID)
INSERT INTO reminders (
  title,
  description,
  due_date,
  completed,
  user_id,
  created_at,
  updated_at
)
VALUES
(
  'Client Invoice #1234',
  'Send invoice to ABC Company for the completed e-commerce project',
  NOW() + INTERVAL '7 days',
  FALSE,
  (SELECT id FROM users LIMIT 1),
  NOW(),
  NOW()
),
(
  'Renew Domain Name',
  'Renew example.com domain name before it expires',
  NOW() + INTERVAL '30 days',
  FALSE,
  (SELECT id FROM users LIMIT 1),
  NOW(),
  NOW()
),
(
  'Project Deadline',
  'Complete the dashboard redesign for XYZ Corp',
  NOW() + INTERVAL '14 days',
  FALSE,
  (SELECT id FROM users LIMIT 1),
  NOW(),
  NOW()
);

-- Insert sample appointments (replace the user_id with your actual user ID)
INSERT INTO appointments (
  title,
  description,
  start_time,
  end_time,
  location,
  user_id,
  created_at,
  updated_at
)
VALUES
(
  'Client Meeting',
  'Initial consultation with potential client about new project',
  NOW() + INTERVAL '2 days',
  NOW() + INTERVAL '2 days' + INTERVAL '1 hour',
  'Zoom Call',
  (SELECT id FROM users LIMIT 1),
  NOW(),
  NOW()
),
(
  'Project Kickoff',
  'Kickoff meeting for the new mobile app project',
  NOW() + INTERVAL '5 days',
  NOW() + INTERVAL '5 days' + INTERVAL '2 hours',
  'Client Office',
  (SELECT id FROM users LIMIT 1),
  NOW(),
  NOW()
),
(
  'Weekly Team Sync',
  'Regular team sync to discuss project progress',
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '7 days' + INTERVAL '30 minutes',
  'Google Meet',
  (SELECT id FROM users LIMIT 1),
  NOW(),
  NOW()
);
