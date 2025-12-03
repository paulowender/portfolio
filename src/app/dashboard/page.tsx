'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import Button from '@/components/Button';
import { FolderIcon, CalendarIcon, BellIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useProjects } from '@/hooks/usePortfolioQuery';
import { useReminders } from '@/hooks/useReminderQuery';
import PendingReminders from '@/components/dashboard/PendingReminders';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: projects, isLoading: projectsLoading } = useProjects(user?.id);
  const { data: reminders, isLoading: remindersLoading } = useReminders({ completed: false });
  const t = useTranslations('dashboard');

  // Count active reminders (not completed)
  const activeRemindersCount = reminders?.length || 0;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">{t('welcomeBack', { name: user?.name || '' })}</h1>
        <p className="text-gray-400 mb-8">
          {t('overview')}
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
            <h2 className="text-xl font-semibold">{t('projects')}</h2>
            <div className="bg-indigo-600/20 p-2 rounded-lg">
              <FolderIcon className="h-6 w-6 text-indigo-400" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">
            {projectsLoading ? '...' : projects?.length || 0}
          </p>
          <p className="text-gray-400 text-sm">{t('totalProjects')}</p>
          <div className="mt-4">
            <Link href="/dashboard/projects">
              <Button variant="outline" size="sm" className="w-full">
                {t('viewAll')}
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
            <h2 className="text-xl font-semibold">{t('upcoming')}</h2>
            <div className="bg-green-600/20 p-2 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-green-400" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">0</p>
          <p className="text-gray-400 text-sm">{t('scheduledAppointments')}</p>
          <div className="mt-4">
            <Link href="/dashboard/calendar">
              <Button variant="outline" size="sm" className="w-full">
                {t('viewCalendar')}
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
            <h2 className="text-xl font-semibold">{t('reminders')}</h2>
            <div className="bg-yellow-600/20 p-2 rounded-lg">
              <BellIcon className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">
            {remindersLoading ? '...' : activeRemindersCount}
          </p>
          <p className="text-gray-400 text-sm">{t('activeReminders')}</p>
          <div className="mt-4">
            <Link href="/dashboard/reminders">
              <Button variant="outline" size="sm" className="w-full">
                {t('viewReminders')}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Pending Reminders Section */}
      <div className="mb-8">
        <PendingReminders />
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{t('recentProjects')}</h2>
          <Link href="/dashboard/projects/new">
            <Button size="sm" icon={<PlusIcon className="h-5 w-5" />}>
              {t('addProject')}
            </Button>
          </Link>
        </div>

        {projectsLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    {t('project')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    {t('technologies')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    {t('featured')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {projects.slice(0, 5).map((project: any) => (
                  <tr key={project.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-700 rounded-md">
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
                        className={`px-2 py-1 text-xs rounded-full ${project.featured
                          ? 'bg-green-900 text-green-300'
                          : 'bg-gray-700 text-gray-300'
                          }`}
                      >
                        {project.featured ? t('yes') : t('no')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className="text-indigo-400 hover:text-indigo-300 mr-3"
                      >
                        {t('edit')}
                      </Link>
                      <button className="text-red-400 hover:text-red-300">{t('delete')}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-12 text-center">
            <h3 className="text-xl font-medium text-gray-300 mb-4">{t('noProjectsYet')}</h3>
            <p className="text-gray-400 mb-6">
              {t('startByAdding')}
            </p>
            <Link href="/dashboard/projects/new">
              <Button icon={<PlusIcon className="h-5 w-5" />}>{t('addFirstProject')}</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
