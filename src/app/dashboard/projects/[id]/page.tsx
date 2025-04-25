'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { fetchProject, updateProjectApi } from '@/lib/api-client';
import { uploadProjectImage, deleteProjectImage } from '@/lib/projects';
import Button from '@/components/Button';
import TagInput from '@/components/TagInput';
import { XMarkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth();
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technologies: [] as string[],
    github_url: '',
    live_url: '',
    featured: false,
    image_url: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProject = async () => {
      if (user && id) {
        console.log('Loading project with ID:', id);

        try {
          const { data, error } = await fetchProject(id);

          if (error) {
            console.error('Error fetching project:', error);
            setError('Failed to load project: ' + (error.message || 'Unknown error'));
            setFetchLoading(false);
            return;
          }

          if (!data) {
            console.error('No project data returned');
            setError('Project not found');
            setFetchLoading(false);
            return;
          }

          console.log('Project data loaded:', data);

          setFormData({
            title: data.title,
            description: data.description,
            technologies: data.technologies?.length > 0 ? data.technologies : [],
            github_url: data.githubUrl || '',
            live_url: data.liveUrl || '',
            featured: data.featured || false,
            image_url: data.imageUrl || '',
          });

          if (data.imageUrl) {
            setImagePreview(data.imageUrl);
          }

          console.log('Form data set successfully');
        } catch (err) {
          console.error('Exception loading project:', err);
          setError('An unexpected error occurred');
        } finally {
          setFetchLoading(false);
        }
      } else {
        console.log('Waiting for user or ID...', { user: !!user, id });
        if (!user) {
          setFetchLoading(false);
          setError('Please log in to edit this project');
        }
      }
    };

    loadProject();
  }, [user, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  const handleTechnologiesChange = (technologies: string[]) => {
    setFormData({ ...formData, technologies });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form...');

    if (!user) {
      console.error('No user found');
      setError('You must be logged in to update a project');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Technologies are already filtered by the TagInput component
      console.log('Technologies:', formData.technologies);

      let imageUrl = formData.image_url;

      // Handle image changes
      if (imageFile) {
        console.log('Uploading new image...');

        // If there's an existing image and we're replacing it, delete the old one
        if (formData.image_url) {
          console.log('Deleting old image:', formData.image_url);
          const { error: deleteError } = await deleteProjectImage(formData.image_url);

          if (deleteError) {
            console.warn('Failed to delete old image:', deleteError);
            // Continue with upload even if delete fails
          } else {
            console.log('Old image deleted successfully');
          }
        }

        // Upload the new image
        const { url, error: uploadError } = await uploadProjectImage(imageFile, user.id);

        if (uploadError) {
          console.error('Image upload error:', uploadError);
          throw new Error('Failed to upload image: ' + (uploadError.message || 'Unknown error'));
        }

        imageUrl = url;
        console.log('New image uploaded successfully:', url);
      }

      // Update project with API client
      console.log('Updating project with ID:', id);
      const { data, error } = await updateProjectApi(id, {
        title: formData.title,
        description: formData.description,
        technologies: formData.technologies,
        githubUrl: formData.github_url,
        liveUrl: formData.live_url,
        featured: formData.featured,
        imageUrl: imageUrl,
      });

      if (error) {
        console.error('Project update error:', error);
        throw error;
      }

      console.log('Project updated successfully:', data);
      router.push('/dashboard/projects');
    } catch (err: any) {
      console.error('Exception during project update:', err);
      setError(err.message || 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Edit Project</h1>
        <p className="text-gray-400">Update your project details.</p>
      </motion.div>

      {error && <div className="mb-6 bg-red-900/50 text-red-200 p-4 rounded-md">{error}</div>}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gray-800 rounded-lg p-6"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
              Project Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Technologies *</label>
            <TagInput
              value={formData.technologies}
              onChange={handleTechnologiesChange}
              placeholder="Type a technology and press Enter (e.g., React, Node.js)"
            />
            <p className="mt-1 text-xs text-gray-400">
              Type a technology and press Enter to add it. Click the X to remove.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="github_url" className="block text-sm font-medium text-gray-300 mb-1">
                GitHub URL
              </label>
              <input
                type="url"
                id="github_url"
                name="github_url"
                value={formData.github_url}
                onChange={handleChange}
                placeholder="https://github.com/username/repo"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="live_url" className="block text-sm font-medium text-gray-300 mb-1">
                Live URL
              </label>
              <input
                type="url"
                id="live_url"
                name="live_url"
                value={formData.live_url}
                onChange={handleChange}
                placeholder="https://example.com"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Project Image</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
              {imagePreview ? (
                <div className="space-y-2 text-center">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mx-auto h-32 w-auto object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                      setFormData({ ...formData, image_url: '' });
                    }}
                    className="text-red-400 hover:text-red-300 text-sm font-medium"
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <div className="space-y-1 text-center">
                  <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-400">
                    <label
                      htmlFor="image"
                      className="relative cursor-pointer bg-gray-700 rounded-md font-medium text-indigo-400 hover:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                    >
                      <span className="px-2 py-1">Upload a file</span>
                      <input
                        id="image"
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              name="featured"
              checked={formData.featured}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded bg-gray-700"
            />
            <label htmlFor="featured" className="ml-2 block text-sm text-gray-300">
              Feature this project on your portfolio homepage
            </label>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push('/dashboard/projects')}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              Update Project
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
