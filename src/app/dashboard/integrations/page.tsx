'use client';

import { motion } from 'framer-motion';

export default function IntegrationsPage() {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Integrations</h1>
        <p className="text-gray-400">
          Connect with third-party services and tools.
        </p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gray-800 rounded-lg p-12 text-center"
      >
        <div className="bg-purple-600/20 p-4 rounded-full inline-block mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          The integrations feature is currently under development. Soon you'll be able to connect with services like GitHub, Stripe, Google Calendar, and more to streamline your workflow.
        </p>
      </motion.div>
    </div>
  );
}
