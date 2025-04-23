import { supabase } from './supabase';

export async function getProjects(userId?: string) {
  let query = supabase.from('projects').select('*').order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  } else {
    // For public portfolio, only show featured projects
    query = query.eq('featured', true);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function getProject(id: string) {
  const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();

  return { data, error };
}

export async function createProject(projectData: any) {
  const { data, error } = await supabase.from('projects').insert(projectData).select();

  return { data, error };
}

export async function updateProject(id: string, updates: any) {
  const { data, error } = await supabase.from('projects').update(updates).eq('id', id).select();

  return { data, error };
}

export async function deleteProject(id: string) {
  const { error } = await supabase.from('projects').delete().eq('id', id);

  return { error };
}

export async function uploadProjectImage(file: File, userId: string) {
  const fileExt = file.name.split('.').pop();
  // Change the path structure to match RLS policy: userId is the first folder
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${userId}/project-images/${fileName}`;

  console.log('Uploading file to path:', filePath);

  try {
    // Get the current session to ensure we have the latest token
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error('No active session found');
      return { url: null, error: new Error('Authentication required') };
    }

    console.log('Got authenticated session, uploading file...');

    // Upload the file
    const { error } = await supabase.storage.from('portfolio').upload(filePath, file);

    if (error) {
      console.error('Upload error:', error);
      return { url: null, error };
    }

    // Get the public URL
    const { data } = supabase.storage.from('portfolio').getPublicUrl(filePath);

    console.log('Upload successful, URL:', data.publicUrl);
    return { url: data.publicUrl, error: null };
  } catch (err) {
    console.error('Exception during upload:', err);
    return { url: null, error: err as Error };
  }
}
