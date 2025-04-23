import { supabase } from './supabase';

export async function getProjects(userId?: string) {
  let query = supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
  
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
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();
  
  return { data, error };
}

export async function createProject(projectData: any) {
  const { data, error } = await supabase
    .from('projects')
    .insert(projectData)
    .select();
  
  return { data, error };
}

export async function updateProject(id: string, updates: any) {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select();
  
  return { data, error };
}

export async function deleteProject(id: string) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);
  
  return { error };
}

export async function uploadProjectImage(file: File, userId: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `project-images/${fileName}`;
  
  const { error } = await supabase.storage
    .from('portfolio')
    .upload(filePath, file);
  
  if (error) return { url: null, error };
  
  const { data } = supabase.storage
    .from('portfolio')
    .getPublicUrl(filePath);
  
  return { url: data.publicUrl, error: null };
}
