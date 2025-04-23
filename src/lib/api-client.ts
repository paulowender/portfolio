// API client for browser-side code

// Projects
export async function fetchProjects(userId?: string) {
  try {
    const url = userId ? `/api/projects?userId=${userId}` : '/api/projects';
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch projects');
    }

    const data = await response.json();
    return { data: data.projects, error: null };
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    return { data: null, error };
  }
}

export async function fetchFeaturedProjects() {
  try {
    const response = await fetch('/api/featured-projects');

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch featured projects');
    }

    const data = await response.json();
    return { data: data.projects, error: null };
  } catch (error: any) {
    console.error('Error fetching featured projects:', error);
    return { data: null, error };
  }
}

export async function fetchProject(id: string) {
  try {
    const response = await fetch(`/api/projects/${id}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch project');
    }

    const data = await response.json();
    return { data: data.project, error: null };
  } catch (error: any) {
    console.error('Error fetching project:', error);
    return { data: null, error };
  }
}

export async function createProjectApi(projectData: any) {
  try {
    const response = await fetch('/api/projects/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create project');
    }

    const data = await response.json();
    return { data: data.project, error: null };
  } catch (error: any) {
    console.error('Error creating project:', error);
    return { data: null, error };
  }
}

export async function updateProjectApi(id: string, projectData: any) {
  try {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update project');
    }

    const data = await response.json();
    return { data: data.project, error: null };
  } catch (error: any) {
    console.error('Error updating project:', error);
    return { data: null, error };
  }
}

export async function deleteProjectApi(id: string) {
  try {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete project');
    }

    return { error: null };
  } catch (error: any) {
    console.error('Error deleting project:', error);
    return { error };
  }
}
