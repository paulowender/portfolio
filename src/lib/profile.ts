import { supabase } from './supabase';

// Upload profile image to storage
export async function uploadProfileImage(file: File, userId: string) {
  try {
    // Create a unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `profiles/${fileName}`;

    // Upload the file
    const { data, error } = await supabase.storage
      .from('portfolio')
      .upload(filePath, file, {
        upsert: true,
      });

    if (error) {
      console.error('Error uploading profile image:', error);
      return { url: null, error };
    }

    // Get the public URL
    const { data: urlData } = supabase.storage.from('portfolio').getPublicUrl(filePath);

    return { url: urlData.publicUrl, error: null };
  } catch (error) {
    console.error('Exception uploading profile image:', error);
    return { url: null, error };
  }
}

// Upload company logo to storage
export async function uploadCompanyLogo(file: File, userId: string) {
  try {
    // Create a unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `company-${userId}-${Date.now()}.${fileExt}`;
    const filePath = `companies/${fileName}`;

    // Upload the file
    const { data, error } = await supabase.storage
      .from('portfolio')
      .upload(filePath, file, {
        upsert: true,
      });

    if (error) {
      console.error('Error uploading company logo:', error);
      return { url: null, error };
    }

    // Get the public URL
    const { data: urlData } = supabase.storage.from('portfolio').getPublicUrl(filePath);

    return { url: urlData.publicUrl, error: null };
  } catch (error) {
    console.error('Exception uploading company logo:', error);
    return { url: null, error };
  }
}

// Delete profile image from storage
export async function deleteProfileImage(url: string) {
  try {
    // Extract the file path from the URL
    const path = url.split('/').slice(-2).join('/');
    
    // Delete the file
    const { error } = await supabase.storage.from('portfolio').remove([path]);
    
    if (error) {
      console.error('Error deleting profile image:', error);
      return { error };
    }
    
    return { error: null };
  } catch (error) {
    console.error('Exception deleting profile image:', error);
    return { error };
  }
}

// Delete company logo from storage
export async function deleteCompanyLogo(url: string) {
  try {
    // Extract the file path from the URL
    const path = url.split('/').slice(-2).join('/');
    
    // Delete the file
    const { error } = await supabase.storage.from('portfolio').remove([path]);
    
    if (error) {
      console.error('Error deleting company logo:', error);
      return { error };
    }
    
    return { error: null };
  } catch (error) {
    console.error('Exception deleting company logo:', error);
    return { error };
  }
}
