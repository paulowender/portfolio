# DevPortfolio - Freelance Developer Portfolio System

A comprehensive portfolio and project management system for freelance developers built with Next.js, React, Tailwind CSS, and Supabase.

## Features

- **Beautiful Portfolio Homepage**: Showcase your work with a modern, responsive design featuring parallax effects and animations
- **Project Management**: Create, edit, and delete projects to display in your portfolio
- **Authentication**: Secure login and registration system
- **Dashboard**: Manage your projects, appointments, and reminders
- **Dark Mode**: Built-in dark mode support
- **Responsive Design**: Looks great on all devices

## Future Features

- Calendar for appointment scheduling
- Reminders for important dates (contracts, invoices, etc.)
- Third-party integrations
- User profile management
- Email notifications

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Framer Motion
- **Authentication**: NextAuth.js, Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **Storage**: Supabase Storage
- **Styling**: Tailwind CSS, Headless UI

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

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

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
  /lib                  # Utility functions and API clients
  /types                # TypeScript type definitions
/public                 # Static assets
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
