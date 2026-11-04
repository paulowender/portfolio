'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Bot, Building2, CalendarDays, ChevronRight, FileText, FolderKanban, Home, LogOut, Mail, MessageSquareMore, Network, UserRound } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import type { RefObject } from 'react';

interface DashboardSidebarProps {
  expanded: boolean;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
  mobileTriggerRef: RefObject<HTMLButtonElement | null>;
}

export default function DashboardSidebar({ expanded, mobileOpen, onMobileOpenChange, mobileTriggerRef }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const t = useTranslations('sidebar');
  const navigation = [
    { name: t('dashboard'), href: '/dashboard', icon: Home },
    { name: t('projects'), href: '/dashboard/projects', icon: FolderKanban },
    { name: t('personalProfile'), href: '/dashboard/profile', icon: UserRound },
    { name: t('companyProfile'), href: '/dashboard/company', icon: Building2 },
    { name: t('calendar'), href: '/dashboard/calendar', icon: CalendarDays },
    { name: t('reminders'), href: '/dashboard/reminders', icon: FileText },
    {
      name: t('integrations'), href: '/dashboard/integrations', icon: Network,
      submenu: [
        { name: t('aiProviders'), href: '/dashboard/integrations/ai', icon: Bot },
        { name: t('messaging'), href: '/dashboard/integrations/evolution', icon: MessageSquareMore },
        { name: t('email'), href: '/dashboard/integrations/resend', icon: Mail },
        { name: 'NFS-e · Homologação', href: '/dashboard/integrations/nfse', icon: FileText },
      ],
    },
  ];

  const content = (isExpanded: boolean, onNavigate?: () => void) => (
    <div className="flex min-w-0 flex-1 flex-col p-3">
      <Link href="/dashboard" className={`flex h-14 items-center ${isExpanded ? 'gap-3 px-1.5' : 'justify-center'}`} onClick={onNavigate}>
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-base font-extrabold text-primary-foreground shadow-[0_8px_20px_rgba(0,0,0,0.35)]">W</span>
        {isExpanded ? <span className="min-w-0"><span className="block truncate text-sm font-semibold text-sidebar-foreground">Wender Tech</span><span className="block text-xs text-muted-foreground">Workspace</span></span> : null}
      </Link>

      <nav className="mt-6 flex-1 overflow-y-auto" aria-label={t('workspaceNavigation')}>
        <ul className="space-y-1.5">
          {navigation.map((item) => {
            const active = pathname === item.href || (item.submenu && item.submenu.some((subitem) => pathname === subitem.href));
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <Link href={item.href} title={!isExpanded ? item.name : undefined} onClick={onNavigate} className={`relative flex min-h-11 items-center rounded-xl transition-colors ${isExpanded ? 'gap-3 px-3' : 'justify-center px-0'} ${active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-muted-foreground hover:bg-accent hover:text-sidebar-foreground'}`}>
                  {active ? <span className="absolute -left-3 h-5 w-px rounded-full bg-primary" /> : null}
                  <Icon className="size-5 shrink-0" strokeWidth={1.8} />
                  {isExpanded ? <span className="truncate text-sm font-medium">{item.name}</span> : null}
                  {isExpanded && item.submenu ? <ChevronRight className="ml-auto size-4 text-muted-foreground" /> : null}
                </Link>
                {isExpanded && item.submenu && active ? (
                  <ul className="ml-5 mt-1.5 space-y-1 border-l border-sidebar-border pl-4">
                    {item.submenu.map((subitem) => {
                      const SubIcon = subitem.icon;
                      const subActive = pathname === subitem.href;
                      return <li key={subitem.name}><Link href={subitem.href} onClick={onNavigate} className={`flex min-h-10 items-center gap-2.5 rounded-lg px-3 text-sm transition-colors ${subActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}><SubIcon className="size-4 shrink-0" strokeWidth={1.8} /><span className="truncate">{subitem.name}</span></Link></li>;
                    })}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      </nav>

      <button type="button" onClick={() => signOut()} title={!isExpanded ? t('logout') : undefined} className={`mt-3 flex min-h-11 items-center rounded-xl text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive ${isExpanded ? 'gap-3 px-3' : 'justify-center px-0'}`}>
        <LogOut className="size-5 shrink-0" strokeWidth={1.8} />
        {isExpanded ? <span className="text-sm font-medium">{t('logout')}</span> : null}
      </button>
    </div>
  );

  return (
    <>
      <aside className={`fixed inset-y-0 left-0 z-40 hidden border-r border-sidebar-border bg-sidebar transition-[width] duration-300 lg:flex ${expanded ? 'w-[272px]' : 'w-20'}`}>
        {content(expanded)}
      </aside>
      <Dialog open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <DialogContent
          className="left-0 top-0 block h-dvh w-[272px] max-w-[272px] translate-x-0 translate-y-0 rounded-none border-y-0 border-l-0 bg-sidebar p-0 sm:max-w-[272px] lg:hidden"
          aria-describedby={undefined}
          onCloseAutoFocus={(event) => { event.preventDefault(); mobileTriggerRef.current?.focus(); }}
        >
          <DialogTitle className="sr-only">{t('workspaceNavigation')}</DialogTitle>
          <div className="flex h-full">{content(true, () => onMobileOpenChange(false))}</div>
        </DialogContent>
      </Dialog>
    </>
  );
}
