'use client';

import { motion } from 'framer-motion';
import { usePortfolio } from '@/components/PortfolioData';
import { FaLinkedin, FaGithub, FaTwitter, FaGlobe } from 'react-icons/fa';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function DeveloperSection() {
  const { portfolioData, loading } = usePortfolio();
  const t = useTranslations('developer');

  return (
    <section id="developer" className="border-y border-border bg-surface py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 max-w-2xl"
        >
          <h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">{t('title')}</h2>
          <p className="mt-4 text-muted-foreground">
            {t('subtitle', { company: portfolioData?.company?.name || 'Wender Tech' })}
          </p>
        </motion.div>

        <div className="grid items-center gap-12 md:grid-cols-[.72fr_1.28fr] lg:gap-20">
          <motion.div
            initial={false}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl border border-border-strong bg-card">
              {loading || !portfolioData?.user?.avatarUrl ? (
                <div className="w-full h-full bg-gray-700 animate-pulse"></div>
              ) : (
                <Image
                  width={256}
                  height={256}
                  src={portfolioData.user.avatarUrl}
                  alt={portfolioData.user.name}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          </motion.div>

          <motion.div
            initial={false}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="min-w-0"
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
                <p className="mb-6 mt-2 text-lg text-primary">
                  {portfolioData?.user?.title || t('defaultTitle')}
                </p>
                <p className="mb-6 max-w-3xl leading-7 text-muted-foreground">
                  {portfolioData?.user?.bio || t('defaultBio')}
                </p>
              </>
            )}

            <div className="mb-8">
              <h4 className="text-lg font-semibold mb-3">{t('skills')}</h4>
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
                  : (
                    portfolioData?.user?.skills || [
                      'React',
                      'Next.js',
                      'Node.js',
                      'TypeScript',
                      'Tailwind CSS',
                      'MongoDB',
                    ]
                  ).map((skill, index) => (
                    <span
                      key={index}
                      className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground"
                    >
                      {skill}
                    </span>
                  ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
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
