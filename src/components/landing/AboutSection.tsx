'use client';

import { motion } from 'framer-motion';
import { usePortfolio } from '@/components/PortfolioData';
import Button from '@/components/Button';
import ParallaxSection from '@/components/ParallaxSection';
import Link from 'next/link';

export default function AboutSection() {
  const { portfolioData, loading } = usePortfolio();

  return (
    <ParallaxSection bgImage="/images/about-bg.jpg" className="py-20" id="about">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {loading ? (
              <>
                <div className="h-10 bg-gray-700 animate-pulse rounded-md w-1/2 mb-6"></div>
                <div className="h-24 bg-gray-700 animate-pulse rounded-md mb-4"></div>
                <div className="h-24 bg-gray-700 animate-pulse rounded-md mb-4"></div>
                <div className="h-24 bg-gray-700 animate-pulse rounded-md mb-6"></div>
              </>
            ) : (
              <>
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">Sobre a {portfolioData?.company?.name || 'Wender Tech'}</h2>
                <p className="text-gray-300 mb-4">
                  {portfolioData?.company?.description || 
                    'Somos uma empresa especializada em desenvolvimento de software, focada em criar soluções digitais de alta qualidade para empresas e startups.'}
                </p>
                {portfolioData?.company?.mission && (
                  <p className="text-gray-300 mb-4">
                    <span className="font-bold">Nossa Missão:</span> {portfolioData.company.mission}
                  </p>
                )}
                {portfolioData?.company?.vision && (
                  <p className="text-gray-300 mb-4">
                    <span className="font-bold">Nossa Visão:</span> {portfolioData.company.vision}
                  </p>
                )}
                <p className="text-gray-300 mb-6">
                  {portfolioData?.company?.founded && `Fundada em ${portfolioData.company.founded}, a`} {portfolioData?.company?.name || 'Wender Tech'} tem se destacado no mercado por entregar projetos de qualidade, dentro do prazo e com excelente custo-benefício.
                </p>
              </>
            )}
            <Button>
              <Link href="/#contact">Entre em Contato</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative h-96 rounded-lg overflow-hidden"
          >
            <div className="absolute inset-0 bg-indigo-600/20 z-10 rounded-lg"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent z-10"></div>
            {loading || !portfolioData?.company?.logo ? (
              <div className="w-full h-full bg-gray-700 flex items-center justify-center animate-pulse">
                <span className="text-gray-500">Logo da Empresa</span>
              </div>
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <img 
                  src={portfolioData.company.logo} 
                  alt={`${portfolioData.company.name} Logo`} 
                  className="max-w-full max-h-full object-contain p-8"
                />
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </ParallaxSection>
  );
}
