'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  FolderIcon,
  CalendarIcon,
  BellIcon,
  CubeIcon,
  UserIcon,
  BuildingOfficeIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';

export default function DashboardSidebar() {
  const [expanded, setExpanded] = useState(true);
  const pathname = usePathname();
  const { signOut } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Projects', href: '/dashboard/projects', icon: FolderIcon },
    { name: 'Personal Profile', href: '/dashboard/profile', icon: UserIcon },
    { name: 'Company Profile', href: '/dashboard/company', icon: BuildingOfficeIcon },
    { name: 'Calendar', href: '/dashboard/calendar', icon: CalendarIcon },
    { name: 'Reminders', href: '/dashboard/reminders', icon: BellIcon },
    { name: 'Integrations', href: '/dashboard/integrations', icon: CubeIcon },
  ];

  return (
    <div
      className={`bg-gray-900 h-screen transition-all duration-300 ${
        expanded ? 'w-64' : 'w-20'
      } fixed left-0 top-0 z-30`}
    >
      <div className="flex h-16 items-center justify-between px-4">
        {expanded ? (
          <Link href="/dashboard" className="text-white font-bold text-xl">
            DevPortfolio
          </Link>
        ) : (
          <Link href="/dashboard" className="text-white font-bold text-xl">
            DP
          </Link>
        )}
        <button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {expanded ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            )}
          </svg>
        </button>
      </div>

      <nav className="mt-8">
        <ul className="space-y-2 px-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  pathname === item.href
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="h-6 w-6 flex-shrink-0" />
                {expanded && <span className="ml-3">{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="absolute bottom-0 w-full p-4">
        <button
          onClick={() => signOut()}
          className="flex items-center w-full px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
        >
          <ArrowLeftOnRectangleIcon className="h-6 w-6 flex-shrink-0" />
          {expanded && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </div>
  );
}
