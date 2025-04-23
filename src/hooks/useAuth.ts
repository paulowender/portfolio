'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getUser() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Error getting user:', error);
          setError(error.message);
        } else {
          setUser(user);
        }
      } catch (err: any) {
        console.error('Exception in getUser:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    // Get initial user
    getUser();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Clean up subscription
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return { user, loading, error };
}
