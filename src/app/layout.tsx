import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/AuthContext';
import { PortfolioProvider } from '@/components/PortfolioData';

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark:bg-gray-900 dark:text-white`}
      >
        <AuthProvider>
          <PortfolioProvider>{children}</PortfolioProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
