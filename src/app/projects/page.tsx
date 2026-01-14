'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import axiosClient from '@/lib/axios-client';

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  liveUrl?: string;
  githubUrl?: string;
  technologies: string[];
}

export default function ProjectsPage() {
  const t = useTranslations('projects');
  const tCommon = useTranslations('common');

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        // Using public API to get all projects
        const response = await axiosClient.get('/api/public/projects');
        if (response.data && response.data.projects) {
          setProjects(response.data.projects);
        }
      } catch (error) {
        console.error('Failed to fetch projects', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Navbar />

      <div className="flex-grow pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">{t('allProjects')}</h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">{t('allProjectsDescription')}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              Array(6)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className="bg-gray-800 rounded-lg overflow-hidden shadow-lg animate-pulse border border-gray-700"
                  >
                    <div className="h-48 bg-gray-700"></div>
                    <div className="p-6">
                      <div className="h-6 bg-gray-700 rounded mb-4 w-3/4"></div>
                      <div className="h-20 bg-gray-700 rounded mb-4"></div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {Array(3)
                          .fill(0)
                          .map((_, i) => (
                            <div key={i} className="h-6 w-16 bg-gray-700 rounded-full"></div>
                          ))}
                      </div>
                    </div>
                  </div>
                ))
            ) : projects.length > 0 ? (
              projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-700 hover:border-indigo-600 hover:scale-105 transition-transform duration-300"
                >
                  <div className="h-48 bg-gray-700 relative">
                    {project.imageUrl ? (
                      <Image
                        src={project.imageUrl}
                        width={1920}
                        height={1080}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-gray-500">{tCommon('noImage')}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-white">{project.title}</h3>
                    <p className="text-gray-400 mb-4">
                      {project.description.length > 100
                        ? `${project.description.substring(0, 100)}...`
                        : project.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.slice(0, 3).map((tech) => (
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
                    <div className="flex space-x-3">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:text-indigo-300 text-sm"
                        >
                          {t('viewLive')}
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:text-indigo-300 text-sm"
                        >
                          {t('viewCode')}
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-400">{t('noProjects')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
