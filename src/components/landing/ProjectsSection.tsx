'use client';

import { motion } from 'framer-motion';
import { usePortfolio } from '@/components/PortfolioData';
import Button from '@/components/Button';
import Link from 'next/link';
import Image from 'next/image';

interface ProjectsSectionProps {
  innerRef?: React.RefObject<HTMLElement | null>;
}

export default function ProjectsSection({ innerRef }: ProjectsSectionProps) {
  const { portfolioData, loading } = usePortfolio();

  return (
    <section ref={innerRef} id="projects" className="py-20 bg-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Projetos em Destaque</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Conheça alguns dos nossos projetos recentes. Cada projeto representa um desafio único e
            uma solução personalizada.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array(3)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="bg-gray-800 rounded-lg overflow-hidden shadow-lg animate-pulse"
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
          ) : portfolioData?.featuredProjects && portfolioData.featuredProjects.length > 0 ? (
            portfolioData.featuredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
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
                      <span className="text-gray-500">Sem imagem</span>
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
                        Acessar
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 text-sm"
                      >
                        GitHub
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <p className="text-gray-400">Nenhum projeto em destaque no momento.</p>
            </div>
          )}
        </div>

        {portfolioData?.featuredProjects && portfolioData.featuredProjects.length > 0 && (
          <div className="mt-12 text-center">
            <Button variant="outline">
              <Link href="/login">Ver Todos os Projetos</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
