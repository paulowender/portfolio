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

// Function to extract file path from URL
export function extractFilePathFromUrl(url: string): string | null {
  try {
    // Parse the URL to get the pathname
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    // The path format is typically /storage/v1/object/portfolio/userId/project-images/filename
    // We want to extract userId/project-images/filename
    const parts = pathname.split('/');
    if (parts.length >= 5) {
      // Get the parts after 'portfolio'
      const portfolioIndex = parts.indexOf('portfolio');
      if (portfolioIndex !== -1 && portfolioIndex < parts.length - 1) {
        return parts.slice(portfolioIndex + 1).join('/');
      }
    }
    return null;
  } catch (error) {
    console.error('Error extracting file path from URL:', error);
    return null;
  }
}

// Function to delete a file from storage
export async function deleteProjectImage(imageUrl: string): Promise<{ error: Error | null }> {
  if (!imageUrl) {
    return { error: null }; // No image to delete
  }

  try {
    console.log('Attempting to delete image:', imageUrl);

    // Extract the file path from the URL
    const filePath = extractFilePathFromUrl(imageUrl);
    if (!filePath) {
      console.error('Could not extract file path from URL:', imageUrl);
      return { error: new Error('Invalid image URL format') };
    }

    console.log('Extracted file path:', filePath);

    // Get the current session
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error('No active session found');
      return { error: new Error('Authentication required') };
    }

    // Delete the file
    const { error } = await supabase.storage.from('portfolio').remove([filePath]);

    if (error) {
      console.error('Error deleting image:', error);
      return { error };
    }

    console.log('Image deleted successfully');
    return { error: null };
  } catch (err) {
    console.error('Exception during image deletion:', err);
    return { error: err as Error };
  }
}

export async function uploadProjectImage(file: File, userId: string) {
  const fileExt = file.name.split('.').pop();
  // Change the path structure to match RLS policy: userId is the first folder
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${userId}/project-images/${fileName}`;

  try {
    // Get the current session to ensure we have the latest token
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error('No active session found');
      return { url: null, error: new Error('Authentication required') };
    }

    console.log('Got authenticated session, uploading file...');

    // Set content type based on file extension
    let contentType;
    switch (fileExt?.toLowerCase()) {
      case 'png':
        contentType = 'image/png';
        break;
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
      case 'gif':
        contentType = 'image/gif';
        break;
      case 'webp':
        contentType = 'image/webp';
        break;
      default:
        contentType = 'application/octet-stream';
    }

    // Upload the file with content type
    const { error } = await supabase.storage.from('portfolio').upload(filePath, file, {
      contentType,
      cacheControl: '3600',
      upsert: false,
    });

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
