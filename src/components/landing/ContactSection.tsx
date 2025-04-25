'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePortfolio } from '@/components/PortfolioData';
import Button from '@/components/Button';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe } from 'react-icons/fa';

export default function ContactSection() {
  const { portfolioData, loading } = usePortfolio();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [formStatus, setFormStatus] = useState<{
    submitted: boolean;
    success: boolean;
    message: string;
  }>({
    submitted: false,
    success: false,
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setFormStatus({
        submitted: true,
        success: true,
        message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.',
      });
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
      setSubmitting(false);
    }, 1500);
  };

  return (
    <section id="contact" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Entre em Contato</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Tem um projeto em mente? Vamos conversar sobre como podemos ajudar a transformar suas ideias em realidade.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <div className="bg-gray-800 rounded-lg p-8">
              <h3 className="text-2xl font-bold mb-6">Informações de Contato</h3>
              
              <div className="space-y-6">
                {(portfolioData?.company?.address || loading) && (
                  <div className="flex items-start">
                    <div className="bg-indigo-600/20 p-3 rounded-lg mr-4">
                      <FaMapMarkerAlt className="h-6 w-6 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium mb-1">Endereço</h4>
                      {loading ? (
                        <div className="h-6 bg-gray-700 animate-pulse rounded w-full"></div>
                      ) : (
                        <p className="text-gray-400">{portfolioData?.company?.address}</p>
                      )}
                    </div>
                  </div>
                )}
                
                {(portfolioData?.company?.phone || loading) && (
                  <div className="flex items-start">
                    <div className="bg-indigo-600/20 p-3 rounded-lg mr-4">
                      <FaPhone className="h-6 w-6 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium mb-1">Telefone</h4>
                      {loading ? (
                        <div className="h-6 bg-gray-700 animate-pulse rounded w-full"></div>
                      ) : (
                        <p className="text-gray-400">{portfolioData?.company?.phone}</p>
                      )}
                    </div>
                  </div>
                )}
                
                {(portfolioData?.company?.email || loading) && (
                  <div className="flex items-start">
                    <div className="bg-indigo-600/20 p-3 rounded-lg mr-4">
                      <FaEnvelope className="h-6 w-6 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium mb-1">Email</h4>
                      {loading ? (
                        <div className="h-6 bg-gray-700 animate-pulse rounded w-full"></div>
                      ) : (
                        <p className="text-gray-400">{portfolioData?.company?.email}</p>
                      )}
                    </div>
                  </div>
                )}
                
                {(portfolioData?.company?.website || loading) && (
                  <div className="flex items-start">
                    <div className="bg-indigo-600/20 p-3 rounded-lg mr-4">
                      <FaGlobe className="h-6 w-6 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium mb-1">Website</h4>
                      {loading ? (
                        <div className="h-6 bg-gray-700 animate-pulse rounded w-full"></div>
                      ) : (
                        <p className="text-gray-400">
                          <a 
                            href={portfolioData?.company?.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-indigo-400 transition-colors"
                          >
                            {portfolioData?.company?.website}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-gray-800 rounded-lg p-8">
              <h3 className="text-2xl font-bold mb-6">Envie uma Mensagem</h3>
              
              {formStatus.submitted ? (
                <div className={`p-4 rounded-lg mb-6 ${formStatus.success ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'}`}>
                  {formStatus.message}
                </div>
              ) : null}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                      Nome
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1">
                    Assunto
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                    Mensagem
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    disabled={submitting}
                  ></textarea>
                </div>
                <div>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                        Enviando...
                      </div>
                    ) : (
                      'Enviar Mensagem'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
