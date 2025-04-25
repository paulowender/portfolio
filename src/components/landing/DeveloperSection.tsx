'use client';

import { motion } from 'framer-motion';
import { usePortfolio } from '@/components/PortfolioData';
import { FaLinkedin, FaGithub, FaTwitter, FaGlobe } from 'react-icons/fa';

export default function DeveloperSection() {
  const { portfolioData, loading } = usePortfolio();

  return (
    <section id="developer" className="py-20 bg-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Conheça o Desenvolvedor</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            A pessoa por trás dos projetos da {portfolioData?.company?.name || 'Wender Tech'}
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row items-center gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:w-1/3"
          >
            <div className="relative w-64 h-64 mx-auto rounded-full overflow-hidden border-4 border-indigo-600">
              {loading || !portfolioData?.user?.avatarUrl ? (
                <div className="w-full h-full bg-gray-700 animate-pulse"></div>
              ) : (
                <img
                  src={portfolioData.user.avatarUrl}
                  alt={portfolioData.user.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:w-2/3"
          >
            {loading ? (
              <>
                <div className="h-10 bg-gray-700 animate-pulse rounded-md w-1/2 mb-2"></div>
                <div className="h-6 bg-gray-700 animate-pulse rounded-md w-1/3 mb-6"></div>
                <div className="h-24 bg-gray-700 animate-pulse rounded-md mb-6"></div>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-bold mb-2">{portfolioData?.user?.name || 'Wender'}</h3>
                <p className="text-indigo-400 text-xl mb-6">{portfolioData?.user?.title || 'Desenvolvedor Full Stack'}</p>
                <p className="text-gray-300 mb-6">
                  {portfolioData?.user?.bio ||
                    'Desenvolvedor apaixonado por criar soluções digitais de alta qualidade. Com experiência em desenvolvimento web e mobile, estou sempre em busca de novos desafios e aprendizados.'}
                </p>
              </>
            )}

            <div className="mb-8">
              <h4 className="text-lg font-semibold mb-3">Habilidades</h4>
              <div className="flex flex-wrap gap-2">
                {loading
                  ? Array(6)
                      .fill(0)
                      .map((_, index) => (
                        <div
                          key={index}
                          className="px-3 py-1 bg-gray-700 animate-pulse rounded-full w-20 h-8"
                        ></div>
                      ))
                  : (portfolioData?.user?.skills || [
                      'React',
                      'Next.js',
                      'Node.js',
                      'TypeScript',
                      'Tailwind CSS',
                      'MongoDB',
                    ]).map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-900/50 text-indigo-300 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
              </div>
            </div>

            <div className="flex space-x-4">
              {portfolioData?.user?.linkedin && (
                <a
                  href={portfolioData.user.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaLinkedin className="h-6 w-6" />
                </a>
              )}
              {portfolioData?.user?.github && (
                <a
                  href={portfolioData.user.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaGithub className="h-6 w-6" />
                </a>
              )}
              {portfolioData?.user?.twitter && (
                <a
                  href={portfolioData.user.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaTwitter className="h-6 w-6" />
                </a>
              )}
              {portfolioData?.user?.website && (
                <a
                  href={portfolioData.user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaGlobe className="h-6 w-6" />
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
