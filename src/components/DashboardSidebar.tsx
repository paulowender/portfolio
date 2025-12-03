'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
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
import { useTranslations } from 'next-intl';

interface DashboardSidebarProps {
  expanded: boolean;
}

export default function DashboardSidebar({ expanded }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const t = useTranslations('sidebar');

  const navigation = [
    { name: t('dashboard'), href: '/dashboard', icon: HomeIcon },
    { name: t('projects'), href: '/dashboard/projects', icon: FolderIcon },
    { name: t('personalProfile'), href: '/dashboard/profile', icon: UserIcon },
    { name: t('companyProfile'), href: '/dashboard/company', icon: BuildingOfficeIcon },
    { name: t('calendar'), href: '/dashboard/calendar', icon: CalendarIcon },
    { name: t('reminders'), href: '/dashboard/reminders', icon: BellIcon },
    {
      name: t('integrations'),
      href: '/dashboard/integrations',
      icon: CubeIcon,
      submenu: [
        { name: t('aiProviders'), href: '/dashboard/integrations/ai' },
        { name: t('messaging'), href: '/dashboard/integrations/evolution' },
        { name: t('email'), href: '/dashboard/integrations/resend' },
      ],
    },
  ];

  return (
    <div
      className={`bg-gray-900 h-screen transition-all duration-300 ${expanded ? 'w-64' : 'w-20'
        } fixed left-0 top-0 z-30 transform ease-in-out overflow-y-auto border-r border-gray-800`}
    >
      <div className="flex h-16 items-center justify-between px-4">
        <Link href="/dashboard" className="text-white font-bold text-xl">
          {expanded ? 'Wender Tech' : 'WT'}
        </Link>
      </div>

      <nav className="mt-8">
        <ul className="space-y-2 px-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${pathname === item.href ||
                  (item.submenu && item.submenu.some((subitem) => pathname === subitem.href))
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
              >
                <item.icon className="h-6 w-6 flex-shrink-0" />
                {expanded && <span className="ml-3">{item.name}</span>}
              </Link>

              {/* Submenu */}
              {expanded && item.submenu && (
                <ul className="ml-8 mt-2 space-y-1">
                  {item.submenu.map((subitem) => (
                    <li key={subitem.name}>
                      <Link
                        href={subitem.href}
                        className={`flex items-center px-4 py-2 rounded-lg transition-colors ${pathname === subitem.href
                          ? 'bg-indigo-800 text-white'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                          }`}
                      >
                        <span className="text-sm">{subitem.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
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
          {expanded && <span className="ml-3">{t('logout')}</span>}
        </button>
      </div>
    </div>
  );
}
