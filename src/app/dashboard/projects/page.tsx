'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { fetchProjects, deleteProjectApi } from '@/lib/api-client';
import Button from '@/components/Button';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    // Skip if already fetching or no user
    if (isFetching || !user) {
      if (!user) {
        setLoading(false);
        setError('Please log in to view your projects');
      }
      return;
    }

    const loadProjects = async () => {
      try {
        setError(null);
        setLoading(true);
        setIsFetching(true);

        console.log('Loading projects for user:', user.id);
        const { data, error } = await fetchProjects(user.id);

        if (error) {
          console.error('Error loading projects:', error);
          setError(error.message || 'Failed to load projects');
        } else if (data) {
          console.log('Projects loaded successfully:', data.length);
          setProjects(data);
        } else {
          console.log('No projects found');
          setProjects([]);
        }
      } catch (err: any) {
        console.error('Exception loading projects:', err);
        setError(err.message || 'An unexpected error occurred');
      } finally {
        setLoading(false);
        setIsFetching(false);
      }
    };

    loadProjects();
  }, [user, isFetching]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      setDeleteLoading(id);
      setError(null);

      try {
        const { error } = await deleteProjectApi(id);

        if (error) {
          console.error('Error deleting project:', error);
          setError(error.message || 'Failed to delete project');
        } else {
          console.log('Project deleted successfully:', id);
          // Update the local state immediately for a responsive UI
          setProjects(projects.filter((project: any) => project.id !== id));

          // The cache will be invalidated by deleteProjectApi, so we don't need to do anything else
        }
      } catch (err: any) {
        console.error('Exception deleting project:', err);
        setError(err.message || 'An unexpected error occurred');
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-gray-400">Manage the projects displayed in your portfolio.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/dashboard/projects/new">
            <Button icon={<PlusIcon className="h-5 w-5" />}>Add Project</Button>
          </Link>
        </motion.div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-red-900/50 text-red-200 p-4 rounded-md mb-6"
        >
          {error}
        </motion.div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : projects.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-800 rounded-lg overflow-hidden"
        >
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Project
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Technologies
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Featured
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {projects.map((project: any) => (
                <tr key={project.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-700 rounded-md overflow-hidden">
                        {project.imageUrl && (
                          <Image
                            width={100}
                            height={100}
                            src={project.imageUrl}
                            alt={project.title}
                            className="h-10 w-10 object-cover"
                          />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{project.title}</div>
                        <div className="text-sm text-gray-400">
                          {project.description.substring(0, 50)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.slice(0, 3).map((tech: string) => (
                        <span
                          key={tech}
                          className="px-2 py-1 text-xs bg-gray-700 rounded-full text-gray-300"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-gray-700 rounded-full text-gray-300">
                          +{project.technologies.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        project.featured
                          ? 'bg-green-900 text-green-300'
                          : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      {project.featured ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    <Link
                      href={`/dashboard/projects/${project.id}`}
                      className="text-indigo-400 hover:text-indigo-300 mr-3 inline-flex items-center"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(project.id)}
                      disabled={deleteLoading === project.id}
                      className="text-red-400 hover:text-red-300 inline-flex items-center"
                    >
                      {deleteLoading === project.id ? (
                        <div className="animate-spin h-4 w-4 mr-1 border-t-2 border-b-2 border-red-400 rounded-full"></div>
                      ) : (
                        <TrashIcon className="h-4 w-4 mr-1" />
                      )}
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-800 rounded-lg p-12 text-center"
        >
          <h3 className="text-xl font-medium text-gray-300 mb-4">No projects yet</h3>
          <p className="text-gray-400 mb-6">
            Start by adding your first project to showcase in your portfolio.
          </p>
          <Link href="/dashboard/projects/new">
            <Button icon={<PlusIcon className="h-5 w-5" />}>Add Your First Project</Button>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
