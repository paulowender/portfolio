import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/AuthContext';
import { PortfolioProvider } from '@/components/PortfolioData';
import ReactQueryProvider from '@/lib/ReactQueryProvider';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { getLocale, getMessages } from 'next-intl/server';
import I18nProvider from '@/i18n/provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Wender Tech - Soluções em Desenvolvimento de Software',
  description:
    'Desenvolvimento de aplicações web e mobile de alta qualidade para empresas e startups',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-title" content="WenderTech" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark:bg-gray-900 dark:text-white`}
      >
        <ReactQueryProvider>
          <AuthProvider>
            <I18nProvider locale={locale} messages={messages}>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <PortfolioProvider>{children}</PortfolioProvider>
              </ThemeProvider>
              <Toaster position="top-right" />
            </I18nProvider>
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
