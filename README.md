# Wender Tech - Portfolio & Project Management

Um sistema completo para desenvolvedores freelance gerenciarem seu portfólio, projetos, integrações e agendamentos.

## Features

- **Beautiful Portfolio Homepage**: Showcase your work with a modern, responsive design featuring parallax effects and animations
- **Project Management**: Create, edit, and delete projects to display in your portfolio
- **Authentication**: Secure login and registration system
- **Dashboard**: Manage your projects, appointments, and reminders
- **Dark Mode**: Built-in dark mode support
- **Responsive Design**: Looks great on all devices
- **Company Profile**: Manage your company information and branding
- **Personal Profile**: Customize your personal information and skills
- **PWA Support**: Progressive Web App for offline access
- **Optimized Performance**: Fast loading times and efficient caching

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS, Framer Motion
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **Storage**: Supabase Storage
- **Styling**: Tailwind CSS, Headless UI
- **State Management**: React Query, Context API
- **HTTP Client**: Axios with interceptors
- **PWA**: Next-PWA for offline support
- **Performance**: Bundle analyzer, code splitting, lazy loading

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (for database and authentication)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/devportfolio.git
   cd devportfolio
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with your Supabase and Prisma credentials:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   DATABASE_URL="postgresql://postgres:password@db.your-project-ref.supabase.co:5432/postgres"
   ```

4. Generate the Prisma client:

   ```bash
   npm run prisma:generate
   ```

5. Run the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

#### Option 1: Using Prisma (Recommended)

1. Create a new Supabase project
2. Get your Supabase URL, anon key, and database connection string from the project settings
3. Create a `.env.local` file based on the `.env.example` template and add your credentials
4. Generate the Prisma client:

   ```bash
   npm run prisma:generate
   ```

5. Generate the SQL schema from Prisma:

   ```bash
   npm run generate-schema
   ```

   This will create a SQL file in the `supabase` directory.

6. Run the generated SQL in the Supabase SQL Editor

#### Option 2: Using Raw SQL

1. Create a new Supabase project
2. Get your Supabase URL and anon key from the project settings
3. Create a `.env.local` file based on the `.env.example` template and add your Supabase credentials
4. Generate the SQL for database migration:

   ```bash
   npm run migrate
   ```

   This will output the SQL that you need to run in the Supabase SQL Editor.

5. (Optional) Generate the SQL for seeding the database with sample data:

   ```bash
   npm run seed
   ```

   This will output the SQL that you need to run in the Supabase SQL Editor.

6. Go to your Supabase project dashboard, navigate to the SQL Editor, and run the SQL scripts.

## Project Structure

```
/src
  /app                  # Next.js app directory
    /dashboard          # Dashboard pages
    /login              # Authentication pages
    /api                # API routes
  /components           # Reusable UI components
    /landing            # Landing page components
  /hooks                # Custom React hooks
  /lib                  # Utility functions and API clients
  /types                # TypeScript type definitions
/public                 # Static assets
  /icons                # PWA icons
/prisma                 # Prisma schema and migrations
/scripts                # Utility scripts
```

## Available Scripts

- `npm run dev` - Start the development server with Turbopack
- `npm run build` - Build the project for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run analyze` - Analyze the bundle size
- `npm run analyze:server` - Analyze the server bundle
- `npm run analyze:browser` - Analyze the browser bundle
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed the database with sample data
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:studio` - Open Prisma Studio
- `npm run build:production` - Build for production with production env vars
- `npm run start:production` - Start production server with production env vars
- `npm run build:staging` - Build for staging environment
- `npm run start:staging` - Start server in staging environment
- `npm run clean` - Remove the .next directory
- `npm run build:clean` - Clean and build
- `npm run build:production:clean` - Clean and build for production

## Performance Optimizations

The project includes several optimizations for best performance:

1. **React Query**: Efficient server state management with smart caching
2. **Axios with Interceptors**: Automatic authentication token management
3. **PWA**: Progressive Web App support with offline caching
4. **Image Optimization**: Automatic image processing for better performance
5. **Code Splitting**: Automatic code splitting for faster loading
6. **Prefetching**: Route prefetching for instant navigation
7. **Lazy Loading**: On-demand loading of heavy components

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
