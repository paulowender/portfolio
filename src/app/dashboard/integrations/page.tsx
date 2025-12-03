'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  CpuChipIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';

export default function IntegrationsPage() {
  const t = useTranslations('integrationsPage');

  const integrations = [
    {
      id: 'ai',
      nameKey: 'aiProviders',
      descriptionKey: 'aiProvidersDescription',
      icon: CpuChipIcon,
      href: '/dashboard/integrations/ai',
      isAvailable: true,
      badgeKey: 'new',
    },
    {
      id: 'messaging',
      nameKey: 'messagingServices',
      descriptionKey: 'messagingServicesDescription',
      icon: ChatBubbleLeftRightIcon,
      href: '/dashboard/integrations/evolution',
      isAvailable: true,
      badgeKey: 'new',
    },
    {
      id: 'calendar',
      nameKey: 'calendarServices',
      descriptionKey: 'calendarServicesDescription',
      icon: CalendarDaysIcon,
      href: '/dashboard/integrations/calendar',
      isAvailable: false,
      badgeKey: 'comingSoon',
    },
    {
      id: 'payment',
      nameKey: 'paymentProcessors',
      descriptionKey: 'paymentProcessorsDescription',
      icon: CreditCardIcon,
      href: '/dashboard/integrations/payment',
      isAvailable: false,
      badgeKey: 'comingSoon',
    },
    {
      id: 'email',
      nameKey: 'emailServices',
      descriptionKey: 'emailServicesDescription',
      icon: EnvelopeIcon,
      href: '/dashboard/integrations/resend',
      isAvailable: true,
      badgeKey: 'new',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-gray-400 mb-8">{t('description')}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className={`bg-gray-800 rounded-lg p-6 border border-gray-700 transition-all ${integration.isAvailable ? 'hover:border-indigo-500 cursor-pointer' : 'opacity-70'
                }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-900 rounded-lg flex items-center justify-center">
                    <integration.icon className="h-6 w-6 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-semibold">{t(integration.nameKey)}</h3>
                </div>
                <div className="flex space-x-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${integration.badgeKey === 'new'
                      ? 'bg-green-900 text-green-300 border border-green-700'
                      : 'bg-blue-900 text-blue-300 border border-blue-700'
                      }`}
                  >
                    {t(integration.badgeKey)}
                  </span>
                </div>
              </div>

              <p className="text-gray-400 mb-4">{t(integration.descriptionKey)}</p>

              {integration.isAvailable ? (
                <Link
                  href={integration.href}
                  className="flex items-center text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <span>{t('configure')}</span>
                  <ArrowRightIcon className="h-4 w-4 ml-1" />
                </Link>
              ) : (
                <span className="text-gray-500">{t('comingSoon')}</span>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
