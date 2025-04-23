'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { fetchProjects } from '@/lib/api-client';
import Button from '@/components/Button';
import { FolderIcon, CalendarIcon, BellIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (user) {
        const { data, error } = await fetchProjects(user.id);
        if (data) {
          setProjects(data);
        }
        setLoading(false);
      }
    };

    fetch();
  }, [user]);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}</h1>
        <p className="text-gray-400 mb-8">
          Here's an overview of your portfolio and upcoming tasks.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gray-800 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Projects</h2>
            <div className="bg-indigo-600/20 p-2 rounded-lg">
              <FolderIcon className="h-6 w-6 text-indigo-400" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">{loading ? '...' : projects.length}</p>
          <p className="text-gray-400 text-sm">Total projects</p>
          <div className="mt-4">
            <Link href="/dashboard/projects">
              <Button variant="outline" size="sm" className="w-full">
                View All
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-800 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Upcoming</h2>
            <div className="bg-green-600/20 p-2 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-green-400" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">0</p>
          <p className="text-gray-400 text-sm">Scheduled appointments</p>
          <div className="mt-4">
            <Link href="/dashboard/calendar">
              <Button variant="outline" size="sm" className="w-full">
                View Calendar
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gray-800 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Reminders</h2>
            <div className="bg-yellow-600/20 p-2 rounded-lg">
              <BellIcon className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">0</p>
          <p className="text-gray-400 text-sm">Active reminders</p>
          <div className="mt-4">
            <Link href="/dashboard/reminders">
              <Button variant="outline" size="sm" className="w-full">
                View Reminders
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recent Projects</h2>
          <Link href="/dashboard/projects/new">
            <Button size="sm" icon={<PlusIcon className="h-5 w-5" />}>
              Add Project
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : projects.length > 0 ? (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
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
                {projects.slice(0, 5).map((project: any) => (
                  <tr key={project.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-700 rounded-md"></div>
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
                        className="text-indigo-400 hover:text-indigo-300 mr-3"
                      >
                        Edit
                      </Link>
                      <button className="text-red-400 hover:text-red-300">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-12 text-center">
            <h3 className="text-xl font-medium text-gray-300 mb-4">No projects yet</h3>
            <p className="text-gray-400 mb-6">
              Start by adding your first project to showcase in your portfolio.
            </p>
            <Link href="/dashboard/projects/new">
              <Button icon={<PlusIcon className="h-5 w-5" />}>Add Your First Project</Button>
            </Link>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/dashboard/projects/new" className="block">
            <div className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors">
              <div className="bg-indigo-600/20 p-3 rounded-lg inline-block mb-4">
                <PlusIcon className="h-6 w-6 text-indigo-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Add Project</h3>
              <p className="text-gray-400 text-sm">
                Create a new project to showcase in your portfolio.
              </p>
            </div>
          </Link>

          <Link href="/dashboard/calendar" className="block">
            <div className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors">
              <div className="bg-green-600/20 p-3 rounded-lg inline-block mb-4">
                <CalendarIcon className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Schedule</h3>
              <p className="text-gray-400 text-sm">Manage your appointments and meetings.</p>
            </div>
          </Link>

          <Link href="/dashboard/reminders" className="block">
            <div className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors">
              <div className="bg-yellow-600/20 p-3 rounded-lg inline-block mb-4">
                <BellIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Reminders</h3>
              <p className="text-gray-400 text-sm">
                Set reminders for important dates and deadlines.
              </p>
            </div>
          </Link>

          <Link href="/dashboard/integrations" className="block">
            <div className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors">
              <div className="bg-purple-600/20 p-3 rounded-lg inline-block mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Integrations</h3>
              <p className="text-gray-400 text-sm">Connect with third-party services and tools.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
