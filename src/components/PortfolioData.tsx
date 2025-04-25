'use client';

import { useState, useEffect } from 'react';

// Define the types for our portfolio data
type User = {
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

type Company = {
  id: string;
  name: string;
  description?: string;
  mission?: string;
  vision?: string;
  founded?: string;
  services?: string[];
  logo?: string;
  website?: string;
};

type Project = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  liveUrl?: string;
  githubUrl?: string;
  technologies: string[];
  featured: boolean;
};

type PortfolioData = {
  user: User;
  company: Company | null;
  featuredProjects: Project[];
};

// Create a context to share the portfolio data across components
import { createContext, useContext } from 'react';

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
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        const response = await fetch('/api/portfolio-data');
        
        if (!response.ok) {
          throw new Error('Failed to fetch portfolio data');
        }
        
        const data = await response.json();
        setPortfolioData(data);
      } catch (err: any) {
        console.error('Error fetching portfolio data:', err);
        setError(err.message || 'An error occurred while fetching portfolio data');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, []);

  return (
    <PortfolioContext.Provider value={{ portfolioData, loading, error }}>
      {children}
    </PortfolioContext.Provider>
  );
}
