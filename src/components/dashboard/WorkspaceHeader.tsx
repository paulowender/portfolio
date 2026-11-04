'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, ExternalLink, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { RefObject } from 'react';

interface WorkspaceHeaderProps {
  expanded: boolean;
  mobileOpen: boolean;
  onDesktopToggle: () => void;
  onMobileToggle: () => void;
  mobileTriggerRef: RefObject<HTMLButtonElement | null>;
  userName?: string | null;
}

export default function WorkspaceHeader({ expanded, mobileOpen, onDesktopToggle, onMobileToggle, mobileTriggerRef, userName }: WorkspaceHeaderProps) {
  const pathname = usePathname() || '/dashboard';
  const sidebar = useTranslations('sidebar');
  const dashboard = useTranslations('dashboard');

  const section = pathname.includes('/projects')
    ? sidebar('projects')
    : pathname.includes('/profile')
      ? sidebar('personalProfile')
      : pathname.includes('/company')
        ? sidebar('companyProfile')
        : pathname.includes('/calendar')
          ? sidebar('calendar')
          : pathname.includes('/reminders')
            ? sidebar('reminders')
            : pathname.includes('/integrations')
              ? sidebar('integrations')
              : dashboard('overviewLabel');

  const initials = userName
    ?.split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'WT';

  return (
    <header
      className={`fixed inset-x-0 top-0 z-20 h-[72px] border-b border-border bg-[#0c0d12]/95 backdrop-blur-sm transition-[padding] duration-300 ${
        expanded ? 'lg:pl-[272px]' : 'lg:pl-20'
      }`}
    >
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            ref={mobileTriggerRef}
            type="button"
            onClick={onMobileToggle}
            className="grid size-11 shrink-0 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
            aria-label={mobileOpen ? dashboard('collapseNavigation') : dashboard('expandNavigation')}
            aria-expanded={mobileOpen}
          >
            <Menu className="size-5" />
          </button>
          <button
            type="button"
            onClick={onDesktopToggle}
            className="hidden size-11 shrink-0 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:grid"
            aria-label={expanded ? dashboard('collapseNavigation') : dashboard('expandNavigation')}
            aria-expanded={expanded}
          >
            {expanded ? (
              <PanelLeftClose className="size-5" />
            ) : (
              <PanelLeftOpen className="size-5" />
            )}
          </button>
          <nav aria-label={dashboard('breadcrumbLabel')} className="flex min-w-0 items-center gap-2 text-sm">
            <span className="hidden text-muted-foreground sm:inline">Workspace</span>
            <span className="hidden text-[#5f5a69] sm:inline">/</span>
            <span className="truncate font-medium text-foreground">{section}</span>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="hidden min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:flex"
          >
            {dashboard('viewPortfolio')}
            <ExternalLink className="size-4" />
          </Link>
          <Link
            href="/dashboard/reminders"
            className="grid size-10 place-items-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:border-[#4a4658] hover:text-foreground"
            aria-label={dashboard('notifications')}
          >
            <Bell className="size-4" />
          </Link>
          <div className="grid size-10 place-items-center rounded-full border border-[#413c50] bg-[#26222f] text-xs font-semibold text-[#ddd4f7]" aria-label={userName || 'Wender Tech'}>
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
