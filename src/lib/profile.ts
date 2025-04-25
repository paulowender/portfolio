import { supabase } from './supabase';

// Upload profile image to storage
export async function uploadProfileImage(file: File, userId: string) {
  try {
    // Create a unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    // Ensure the path starts with userId to comply with RLS policies
    const filePath = `${userId}/profile-images/${fileName}`;

    console.log('Uploading profile image to path:', filePath);

    // Get the current session to ensure we have the latest token
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error('No active session found');
      return { url: null, error: new Error('Authentication required') };
    }

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

    // Upload the file
    const { data, error } = await supabase.storage.from('portfolio').upload(filePath, file, {
      contentType,
      cacheControl: '3600',
      upsert: true,
    });

    if (error) {
      console.error('Error uploading profile image:', error);
      return { url: null, error };
    }

    // Get the public URL
    const { data: urlData } = supabase.storage.from('portfolio').getPublicUrl(filePath);

    console.log('Profile image uploaded successfully, URL:', urlData.publicUrl);
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
    const fileName = `company-${Date.now()}.${fileExt}`;
    // Ensure the path starts with userId to comply with RLS policies
    const filePath = `${userId}/company-images/${fileName}`;

    console.log('Uploading company logo to path:', filePath);

    // Get the current session to ensure we have the latest token
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error('No active session found');
      return { url: null, error: new Error('Authentication required') };
    }

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

    // Upload the file
    const { data, error } = await supabase.storage.from('portfolio').upload(filePath, file, {
      contentType,
      cacheControl: '3600',
      upsert: true,
    });

    if (error) {
      console.error('Error uploading company logo:', error);
      return { url: null, error };
    }

    // Get the public URL
    const { data: urlData } = supabase.storage.from('portfolio').getPublicUrl(filePath);

    console.log('Company logo uploaded successfully, URL:', urlData.publicUrl);
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
    // The URL format is typically like: https://xxx.supabase.co/storage/v1/object/public/portfolio/userId/profile-images/filename
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    // Find the position of 'portfolio' in the path
    const parts = pathname.split('/');
    const portfolioIndex = parts.indexOf('portfolio');

    if (portfolioIndex === -1 || portfolioIndex >= parts.length - 1) {
      console.error('Invalid URL format:', url);
      return { error: new Error('Invalid URL format') };
    }

    // Extract the path after 'portfolio'
    const filePath = parts.slice(portfolioIndex + 1).join('/');
    console.log('Deleting file at path:', filePath);

    // Delete the file
    const { error } = await supabase.storage.from('portfolio').remove([filePath]);

    if (error) {
      console.error('Error deleting profile image:', error);
      return { error };
    }

    console.log('Profile image deleted successfully');
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
    // The URL format is typically like: https://xxx.supabase.co/storage/v1/object/public/portfolio/userId/company-images/filename
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    // Find the position of 'portfolio' in the path
    const parts = pathname.split('/');
    const portfolioIndex = parts.indexOf('portfolio');

    if (portfolioIndex === -1 || portfolioIndex >= parts.length - 1) {
      console.error('Invalid URL format:', url);
      return { error: new Error('Invalid URL format') };
    }

    // Extract the path after 'portfolio'
    const filePath = parts.slice(portfolioIndex + 1).join('/');
    console.log('Deleting file at path:', filePath);

    // Delete the file
    const { error } = await supabase.storage.from('portfolio').remove([filePath]);

    if (error) {
      console.error('Error deleting company logo:', error);
      return { error };
    }

    console.log('Company logo deleted successfully');
    return { error: null };
  } catch (error) {
    console.error('Exception deleting company logo:', error);
    return { error };
  }
}
