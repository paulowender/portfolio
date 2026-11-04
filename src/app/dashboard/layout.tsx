'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import DashboardSidebar from '@/components/DashboardSidebar';
import LoadingSpinner from '@/components/LoadingSpinner';
import WorkspaceHeader from '@/components/dashboard/WorkspaceHeader';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)');
    const closeMobileNavigation = (event: MediaQueryListEvent) => {
      if (event.matches) setMobileOpen(false);
    };
    desktop.addEventListener('change', closeMobileNavigation);
    return () => desktop.removeEventListener('change', closeMobileNavigation);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0c0d12] text-foreground">
      <DashboardSidebar expanded={expanded} mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen} mobileTriggerRef={mobileTriggerRef} />
      <div
        className={`min-h-screen transition-[padding] duration-300 ${expanded ? 'lg:pl-[272px]' : 'lg:pl-20'}`}
      >
        <WorkspaceHeader
          expanded={expanded}
          mobileOpen={mobileOpen}
          onDesktopToggle={() => setExpanded((current) => !current)}
          onMobileToggle={() => setMobileOpen((current) => !current)}
          mobileTriggerRef={mobileTriggerRef}
          userName={user.name}
        />
        <main className="mx-auto w-full max-w-[1600px] px-4 pb-10 pt-[104px] sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
