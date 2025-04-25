'use client';

import { createContext, useContext } from 'react';
import { usePortfolioData } from '@/hooks/usePortfolioQuery';

// Define the types for our portfolio data
export type User = {
  id: string;
  name: string;
  title?: string;
  bio?: string;
  location?: string;
  avatarUrl?: string;
  skills?: string[];
  linkedin?: string;
  github?: string;
  twitter?: string;
  website?: string;
};

export type Company = {
  id: string;
  name: string;
  description?: string;
  mission?: string;
  vision?: string;
  founded?: string;
  services?: string[];
  logo?: string;
  website?: string;
  address?: string;
  phone?: string;
  email?: string;
  userId?: string;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  liveUrl?: string;
  githubUrl?: string;
  technologies: string[];
  featured: boolean;
};

export type PortfolioData = {
  user: User;
  company: Company | null;
  featuredProjects: Project[];
};

// Create a context to share the portfolio data across components
const PortfolioContext = createContext<{
  portfolioData: PortfolioData | null;
  loading: boolean;
  error: string | null;
}>({
  portfolioData: null,
  loading: true,
  error: null,
});

export function usePortfolio() {
  return useContext(PortfolioContext);
}

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  // Usar o hook do React Query para buscar os dados do portfólio
  const { data, isLoading, error } = usePortfolioData();

  return (
    <PortfolioContext.Provider
      value={{
        portfolioData: data || null,
        loading: isLoading,
        error: error ? (error as Error).message : null,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}
