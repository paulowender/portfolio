'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Disclosure } from '@headlessui/react';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname() || '/';
  const { user } = useAuth();
  const t = useTranslations('navbar');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: t('home'), href: '/' },
    { name: t('services'), href: '/#services' },
    { name: t('projects'), href: '/#projects' },
    { name: t('about'), href: '/#about' },
    { name: t('contact'), href: '/#contact' },
  ];
  const destination = user ? '/dashboard' : '/login';
  const destinationLabel = user ? t('dashboard') : t('login');

  return (
    <Disclosure
      as="nav"
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${scrolled ? 'border-border bg-background/88 backdrop-blur-xl' : 'border-transparent bg-background/45 backdrop-blur-sm'}`}
    >
      {({ open }) => (
        <>
          <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="inline-flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <span className="flex size-10 items-center justify-center rounded-full border border-border-strong bg-secondary font-semibold text-foreground">W</span>
              <span className="font-semibold tracking-[-0.025em] text-foreground">Wender Tech</span>
            </Link>

            <div className="hidden items-center gap-1 md:flex">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href} className={`min-h-10 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${pathname === item.href ? 'text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}>
                  {item.name}
                </Link>
              ))}
              <div className="ml-2"><LanguageSwitcher /></div>
              <Link href={destination} className="ml-2 inline-flex min-h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                {destinationLabel}
              </Link>
            </div>

            <Disclosure.Button className="inline-flex size-11 items-center justify-center rounded-xl border border-border bg-secondary text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden">
              <span className="sr-only">{t('openMenu')}</span>
              {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
            </Disclosure.Button>
          </div>

          <Disclosure.Panel className="border-t border-border bg-background/96 px-4 pb-5 pt-3 backdrop-blur-xl md:hidden">
            <div className="mx-auto max-w-7xl space-y-1">
              {navigation.map((item) => (
                <Disclosure.Button key={item.name} as={Link} href={item.href} className="block min-h-11 rounded-xl px-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                  {item.name}
                </Disclosure.Button>
              ))}
              <div className="px-3 py-2"><LanguageSwitcher /></div>
              <Disclosure.Button as={Link} href={destination} className="mt-2 block min-h-11 rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground">
                {destinationLabel}
              </Disclosure.Button>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
