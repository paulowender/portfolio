'use client';

import { motion } from 'framer-motion';
import { BellIcon } from '@heroicons/react/24/outline';

export default function RemindersPage() {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Reminders</h1>
        <p className="text-gray-400">
          Set reminders for important dates and deadlines.
        </p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gray-800 rounded-lg p-12 text-center"
      >
        <div className="bg-yellow-600/20 p-4 rounded-full inline-block mb-6">
          <BellIcon className="h-12 w-12 text-yellow-400" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          The reminders feature is currently under development. Soon you'll be able to set reminders for important dates like contract renewals, invoice due dates, and project deadlines.
        </p>
      </motion.div>
    </div>
  );
}
