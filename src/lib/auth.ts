import { supabase } from './supabase';

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
}

export async function signUp(email: string, password: string, name: string) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });

  if (authError) return { data: null, error: authError };

  // Create user profile in users table
  if (authData.user) {
    const { error: profileError } = await supabase.from('users').insert({
      id: authData.user.id,
      email: email,
      name: name,
      created_at: new Date().toISOString(),
    });

    if (profileError) return { data: null, error: profileError };
  }

  return { data: authData, error: null };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return { user, error };
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();

  return { data, error };
}

export async function updateUserProfile(userId: string, updates: any) {
  const { data, error } = await supabase.from('users').update(updates).eq('id', userId);

  return { data, error };
}

export async function resetPasswordForEmail(email: string, redirectTo?: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectTo || `${window.location.origin}/reset-password`,
  });

  return { data, error };
}

export async function updateUserPassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({
    password,
  });

  return { data, error };
}
