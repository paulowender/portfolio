import type { Metadata } from 'next';
import { Geist_Mono, Manrope } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/AuthContext';
import { PortfolioProvider } from '@/components/PortfolioData';
import ReactQueryProvider from '@/lib/ReactQueryProvider';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { getLocale, getMessages } from 'next-intl/server';
import I18nProvider from '@/i18n/provider';

const manrope = Manrope({
  variable: '--font-manrope',
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
    <html lang={locale} className={`${manrope.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="apple-mobile-web-app-title" content="WenderTech" />
      </head>
      <body
        className="min-h-screen bg-background text-foreground antialiased"
      >
        <ReactQueryProvider>
          <AuthProvider>
            <I18nProvider locale={locale} messages={messages}>
              <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                forcedTheme="dark"
                enableSystem={false}
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
