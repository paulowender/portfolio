import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with a function to handle SSG/SSR scenarios
const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // During static site generation or server-side rendering with missing env vars,
  // return a dummy client that won't throw errors during build
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === 'undefined') {
      // We're in a server context (build time or SSR) without proper env vars
      console.warn('Supabase URL or anon key missing during SSR/SSG. Using dummy client.');

      // Return a mock client for build/SSR that won't throw errors
      return {
        auth: {
          getSession: () => Promise.resolve({ data: { session: null }, error: null }),
          getUser: () => Promise.resolve({ data: { user: null }, error: null }),
          signInWithPassword: () => Promise.resolve({ data: null, error: null }),
          signUp: () => Promise.resolve({ data: null, error: null }),
          signOut: () => Promise.resolve({ error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        },
        from: () => ({
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: null, error: null }),
            }),
          }),
          insert: () => Promise.resolve({ data: null, error: null }),
          update: () => Promise.resolve({ data: null, error: null }),
          delete: () => Promise.resolve({ data: null, error: null }),
        }),
        storage: {
          from: () => ({
            upload: () => Promise.resolve({ data: null, error: null }),
            getPublicUrl: () => ({ data: { publicUrl: '' } }),
            remove: () => Promise.resolve({ data: null, error: null }),
          }),
        },
      } as any;
    }
  }

  // For client-side or when env vars are available, create a real client
  return createClient(supabaseUrl || '', supabaseAnonKey || '');
};

export const supabase = createSupabaseClient();

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          title: string;
          description: string;
          image_url: string | null;
          live_url: string | null;
          github_url: string | null;
          technologies: string[];
          featured: boolean;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          image_url?: string | null;
          live_url?: string | null;
          github_url?: string | null;
          technologies: string[];
          featured?: boolean;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          image_url?: string | null;
          live_url?: string | null;
          github_url?: string | null;
          technologies?: string[];
          featured?: boolean;
          user_id?: string;
          created_at?: string;
        };
      };
    };
  };
};
