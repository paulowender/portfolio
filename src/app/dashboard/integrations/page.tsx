'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import {
  CpuChipIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

export default function IntegrationsPage() {
  const { user } = useAuth();

  const integrations = [
    {
      id: 'ai',
      name: 'AI Providers',
      description:
        'Connect to OpenAI, Anthropic, Groq, and OpenRouter to use AI features throughout the application.',
      icon: CpuChipIcon,
      href: '/dashboard/integrations/ai',
      isAvailable: true,
      badges: ['New'],
    },
    {
      id: 'evolution',
      name: 'Evolution API',
      description: 'Connect to Evolution API v2 for WhatsApp automation and client communication.',
      icon: ChatBubbleLeftRightIcon,
      href: '/dashboard/integrations/evolution',
      isAvailable: true,
      badges: ['New'],
    },
    {
      id: 'calendar',
      name: 'Calendar Services',
      description:
        'Connect to Google Calendar, Microsoft Outlook, or Apple Calendar to sync your appointments.',
      icon: CalendarDaysIcon,
      href: '/dashboard/integrations/calendar',
      isAvailable: false,
      badges: ['Coming Soon'],
    },
    {
      id: 'payment',
      name: 'Payment Processors',
      description:
        'Connect to Stripe, PayPal, or other payment processors to manage invoices and payments.',
      icon: CreditCardIcon,
      href: '/dashboard/integrations/payment',
      isAvailable: false,
      badges: ['Coming Soon'],
    },
    {
      id: 'email',
      name: 'Email Services',
      description:
        'Connect to email services to send notifications, invoices, and other communications.',
      icon: EnvelopeIcon,
      href: '/dashboard/integrations/email',
      isAvailable: false,
      badges: ['Coming Soon'],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">Integrations</h1>
        <p className="text-gray-400 mb-8">
          Connect your favorite services to enhance your workflow.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className={`bg-gray-800 rounded-lg p-6 border border-gray-700 transition-all ${
                integration.isAvailable ? 'hover:border-indigo-500 cursor-pointer' : 'opacity-70'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-900 rounded-lg flex items-center justify-center">
                    <integration.icon className="h-6 w-6 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-semibold">{integration.name}</h3>
                </div>
                <div className="flex space-x-2">
                  {integration.badges.map((badge) => (
                    <span
                      key={badge}
                      className={`px-2 py-1 text-xs rounded-full ${
                        badge === 'New'
                          ? 'bg-green-900 text-green-300 border border-green-700'
                          : 'bg-blue-900 text-blue-300 border border-blue-700'
                      }`}
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-gray-400 mb-4">{integration.description}</p>

              {integration.isAvailable ? (
                <Link
                  href={integration.href}
                  className="flex items-center text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <span>Configure</span>
                  <ArrowRightIcon className="h-4 w-4 ml-1" />
                </Link>
              ) : (
                <span className="text-gray-500">Coming soon</span>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
