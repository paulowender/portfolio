'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaEnvelope } from 'react-icons/fa';
import Button from '@/components/Button';
import { useAuth } from '@/lib/AuthContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { error } = await resetPassword(email);
      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred while sending the reset password email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <Link href="/" className="inline-block">
            <h2 className="text-3xl font-extrabold text-white">Wender Tech</h2>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-white">Reset your password</h2>
          <p className="mt-2 text-sm text-gray-400">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 bg-gray-800 py-8 px-4 shadow-lg sm:rounded-lg sm:px-10"
        >
          {error && (
            <div className="mb-4 bg-red-900/50 text-red-200 p-3 rounded-md text-sm">{error}</div>
          )}

          {success ? (
            <div className="text-center">
              <div className="mb-4 bg-green-900/50 text-green-200 p-3 rounded-md text-sm">
                Password reset email sent! Check your inbox for a link to reset your password.
              </div>
              <Link
                href="/login"
                className="text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Return to login
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Email address"
                  />
                </div>
              </div>

              <div>
                <Button type="submit" className="w-full" isLoading={loading}>
                  Send reset link
                </Button>
              </div>

              <div className="text-center mt-4">
                <Link
                  href="/login"
                  className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
