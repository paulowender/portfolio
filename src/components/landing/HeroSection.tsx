'use client';

import { motion } from 'framer-motion';
import { usePortfolio } from '@/components/PortfolioData';
import Button from '@/components/Button';
import { FaArrowDown } from 'react-icons/fa';
import ParallaxSection from '@/components/ParallaxSection';

interface HeroSectionProps {
  scrollToProjects: () => void;
}

export default function HeroSection({ scrollToProjects }: HeroSectionProps) {
  const { portfolioData, loading } = usePortfolio();

  return (
    <ParallaxSection
      bgImage="/images/hero-bg.jpg"
      className="h-screen flex flex-col justify-center items-center"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          {loading ? (
            <>
              <div className="h-12 w-3/4 bg-gray-700 animate-pulse rounded-md mb-6 mx-auto"></div>
              <div className="h-24 bg-gray-700 animate-pulse rounded-md mb-8"></div>
            </>
          ) : (
            <>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
                {portfolioData?.company?.name || 'Wender Tech'}
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                {portfolioData?.company?.description ||
                  'Desenvolvimento de soluções digitais de alta qualidade para empresas e startups. Especialistas em aplicações web e mobile com foco em resultados.'}
              </p>
            </>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={scrollToProjects}>
              Ver Projetos
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() =>
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              Fale Conosco
            </Button>
          </div>
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="flex justify-center items-center mt-8"
      >
        <button onClick={scrollToProjects} className="text-white animate-bounce">
          <FaArrowDown className="h-6 w-6" />
        </button>
      </motion.div>
    </ParallaxSection>
  );
}
