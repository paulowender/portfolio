// API client for browser-side code
import { supabase } from '@/lib/supabase';
import { apiCache } from '@/lib/cache';

// Projects
export async function fetchProjects(userId?: string) {
  try {
    // Create a cache key based on the userId
    const cacheKey = `projects_${userId || 'all'}`;

    // Check if we have cached data
    const cachedData = apiCache.get(cacheKey);
    if (cachedData) {
      console.log('Using cached projects data for user:', userId);
      return { data: cachedData, error: null };
    }

    console.log('Fetching projects for user:', userId);

    // Get the session token
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    if (!token) {
      console.error('No authentication token found');
      throw new Error('Authentication required. Please log in again.');
    }

    const url = userId ? `/api/projects?userId=${userId}` : '/api/projects';
    console.log('Fetching from URL:', url);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error response:', errorData);
      throw new Error(errorData.error || 'Failed to fetch projects');
    }

    const data = await response.json();
    console.log('Projects fetched successfully:', data.projects?.length || 0, 'projects');

    // Cache the result for 1 minute (60000 ms)
    apiCache.set(cacheKey, data.projects, 60000);

    return { data: data.projects, error: null };
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    return { data: null, error };
  }
}

export async function fetchFeaturedProjects() {
  try {
    console.log('Fetching featured projects');

    // Get the session token
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    if (!token) {
      console.error('No authentication token found');
      throw new Error('Authentication required. Please log in again.');
    }

    const response = await fetch('/api/featured-projects', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error response:', errorData);
      throw new Error(errorData.error || 'Failed to fetch featured projects');
    }

    const data = await response.json();
    console.log('Featured projects fetched successfully:', data.projects?.length || 0, 'projects');
    return { data: data.projects, error: null };
  } catch (error: any) {
    console.error('Error fetching featured projects:', error);
    return { data: null, error };
  }
}

export async function fetchProject(id: string) {
  try {
    console.log(`Fetching project with ID: ${id}`);

    // Get the session token
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    if (!token) {
      console.error('No authentication token found');
      throw new Error('Authentication required. Please log in again.');
    }

    const response = await fetch(`/api/projects/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error response:', errorData);
      throw new Error(errorData.error || 'Failed to fetch project');
    }

    const data = await response.json();
    console.log('Project fetched successfully:', data.project?.id);
    return { data: data.project, error: null };
  } catch (error: any) {
    console.error('Error fetching project:', error);
    return { data: null, error };
  }
}

export async function createProjectApi(projectData: any) {
  try {
    // Get the session token
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }

    const response = await fetch('/api/projects/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create project');
    }

    const data = await response.json();

    // Clear the projects cache for this user
    if (projectData.user && projectData.user.connect && projectData.user.connect.id) {
      apiCache.remove(`projects_${projectData.user.connect.id}`);
    }

    return { data: data.project, error: null };
  } catch (error: any) {
    console.error('Error creating project:', error);
    return { data: null, error };
  }
}

export async function updateProjectApi(id: string, projectData: any) {
  try {
    // Get the session token
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }

    const response = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update project');
    }

    const data = await response.json();

    // Clear any project caches that might exist
    // Since we don't know the user ID here, we'll get it from the response
    if (data.project && data.project.userId) {
      apiCache.remove(`projects_${data.project.userId}`);
    }

    return { data: data.project, error: null };
  } catch (error: any) {
    console.error('Error updating project:', error);
    return { data: null, error };
  }
}

export async function deleteProjectApi(id: string) {
  try {
    // First, get the project to know which user's cache to invalidate
    const { data: project } = await fetchProject(id);

    // Get the session token
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }

    const response = await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete project');
    }

    // Clear the cache for this user
    if (project && project.userId) {
      apiCache.remove(`projects_${project.userId}`);
    }

    return { error: null };
  } catch (error: any) {
    console.error('Error deleting project:', error);
    return { error };
  }
}

// User Profile Functions
export async function getUserProfile(userId: string) {
  try {
    console.log(`Fetching user profile with ID: ${userId}`);

    // Get the session token
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    if (!token) {
      console.error('No authentication token found');
      throw new Error('Authentication required. Please log in again.');
    }

    const response = await fetch(`/api/profile/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error response:', errorData);
      throw new Error(errorData.error || 'Failed to fetch user profile');
    }

    const data = await response.json();
    console.log('User profile fetched successfully:', data.profile?.id);
    return { data: data.profile, error: null };
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return { data: null, error };
  }
}

export async function updateUserProfile(userId: string, profileData: any) {
  try {
    // Get the session token
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }

    const response = await fetch(`/api/profile/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update user profile');
    }

    const data = await response.json();
    return { data: data.profile, error: null };
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return { data: null, error };
  }
}

// Company Profile Functions
export async function getCompanyProfile(userId: string) {
  try {
    console.log(`Fetching company profile for user: ${userId}`);

    // Get the session token
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    if (!token) {
      console.error('No authentication token found');
      throw new Error('Authentication required. Please log in again.');
    }

    const response = await fetch(`/api/company/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error response:', errorData);
      throw new Error(errorData.error || 'Failed to fetch company profile');
    }

    const data = await response.json();
    console.log('Company profile fetched successfully:', data.company?.id);
    return { data: data.company, error: null };
  } catch (error: any) {
    console.error('Error fetching company profile:', error);
    return { data: null, error };
  }
}

export async function updateCompanyProfile(userId: string, companyData: any) {
  try {
    // Get the session token
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }

    const response = await fetch(`/api/company/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(companyData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update company profile');
    }

    const data = await response.json();
    return { data: data.company, error: null };
  } catch (error: any) {
    console.error('Error updating company profile:', error);
    return { data: null, error };
  }
}
