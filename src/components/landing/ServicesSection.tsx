'use client';

import { motion } from 'framer-motion';
import { usePortfolio } from '@/components/PortfolioData';
import { FaCode, FaServer, FaMobile, FaDatabase } from 'react-icons/fa';

export default function ServicesSection() {
  const { portfolioData, loading } = usePortfolio();

  // Default services if none are provided
  const defaultServices = [
    {
      icon: <FaCode className="h-8 w-8" />,
      name: 'Desenvolvimento Frontend',
      description: 'React, Next.js, Vue.js, Tailwind CSS, Framer Motion',
    },
    {
      icon: <FaServer className="h-8 w-8" />,
      name: 'Desenvolvimento Backend',
      description: 'Node.js, Express, Python, Django, Ruby on Rails',
    },
    {
      icon: <FaMobile className="h-8 w-8" />,
      name: 'Desenvolvimento Mobile',
      description: 'React Native, Flutter, iOS, Android',
    },
    {
      icon: <FaDatabase className="h-8 w-8" />,
      name: 'Banco de Dados & DevOps',
      description: 'PostgreSQL, MongoDB, Firebase, Docker, AWS',
    },
  ];

  // Map company services to our service cards
  const getServiceIcon = (service: string) => {
    if (service.toLowerCase().includes('front')) return <FaCode className="h-8 w-8" />;
    if (service.toLowerCase().includes('back')) return <FaServer className="h-8 w-8" />;
    if (service.toLowerCase().includes('mobile')) return <FaMobile className="h-8 w-8" />;
    if (service.toLowerCase().includes('dados') || service.toLowerCase().includes('devops'))
      return <FaDatabase className="h-8 w-8" />;
    return <FaCode className="h-8 w-8" />;
  };

  const services = portfolioData?.company?.services?.length
    ? portfolioData.company.services.map((service) => ({
        icon: getServiceIcon(service),
        name: service,
        description: '',
      }))
    : defaultServices;

  return (
    <section id="services" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Nossos Serviços</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {portfolioData?.company?.description ||
              'Oferecemos soluções completas em desenvolvimento de software para atender às necessidades do seu negócio.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading
            ? Array(4)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className="bg-gray-800 p-6 rounded-lg text-center animate-pulse border border-gray-700"
                  >
                    <div className="bg-indigo-600/20 w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                    </div>
                    <div className="h-6 bg-gray-700 rounded mb-2 w-3/4 mx-auto"></div>
                    <div className="h-4 bg-gray-700 rounded w-full mx-auto"></div>
                  </div>
                ))
            : services.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gray-700/30 p-6 rounded-lg text-center border border-gray-700 hover:border-indigo-600 hover:scale-105 transition-transform duration-300"
                >
                  <div className="bg-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{service.name}</h3>
                  <p className="text-gray-400">{service.description}</p>
                </motion.div>
              ))}
        </div>
      </div>
    </section>
  );
}
