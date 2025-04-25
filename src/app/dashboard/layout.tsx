'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import DashboardSidebar from '@/components/DashboardSidebar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <DashboardSidebar expanded={expanded} />
      <div
        className={`${!expanded ? 'pl-20' : 'sm:pl-20 lg:pl-64'} transition-all duration-300  min-h-screen`}
      >
        <div
          className={`${!expanded ? 'pl-20' : 'sm:pl-20 lg:pl-64'} bg-gray-800 h-16 fixed top-0 left-0 right-0 z-20 transition-all duration-300 border-b border-gray-700`}
        >
          <div className="mx-auto px-4 flex items-center h-full">
            <button
              onClick={() => setExpanded(!expanded)}
              className="h-6 w-6 flex items-center justify-center text-gray-400 hover:text-white transition-colors duration-300 mr-2 cursor-pointer"
            >
              {expanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </button>
            <h1 className="text-xl font-bold">Dashboard</h1>
          </div>
        </div>
        <div className="p-6 pt-20">{children}</div>
      </div>
    </div>
  );
}
