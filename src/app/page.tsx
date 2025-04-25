'use client';

import { useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/landing/HeroSection';
import ServicesSection from '@/components/landing/ServicesSection';
import AboutSection from '@/components/landing/AboutSection';
import DeveloperSection from '@/components/landing/DeveloperSection';
import ProjectsSection from '@/components/landing/ProjectsSection';
import ContactSection from '@/components/landing/ContactSection';

export default function Home() {
  const projectsRef = useRef<HTMLElement>(null);

  const scrollToProjects = () => {
    projectsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <Navbar />

      {/* Hero Section */}
      <HeroSection scrollToProjects={scrollToProjects} />

      {/* Services Section */}
      <ServicesSection />

      {/* Projects Section */}
      <ProjectsSection innerRef={projectsRef} />

      {/* About Company Section */}
      <AboutSection />

      {/* About Developer Section */}
      <DeveloperSection />

      {/* Contact Section */}
      <ContactSection />

      <Footer />
    </main>
  );
}
