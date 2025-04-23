"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  FaCode,
  FaServer,
  FaMobile,
  FaDatabase,
  FaArrowDown,
} from "react-icons/fa";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import ProjectCard from "@/components/ProjectCard";
import ParallaxSection from "@/components/ParallaxSection";

// Mock data for projects (will be replaced with real data from Supabase)
const projects = [
  {
    id: "1",
    title: "E-commerce Platform",
    description:
      "A full-featured e-commerce platform built with Next.js and Stripe integration.",
    image_url: "/images/projects/ecommerce.jpg",
    live_url: "https://example.com",
    github_url: "https://github.com",
    technologies: ["Next.js", "React", "Stripe", "Tailwind CSS"],
  },
  {
    id: "2",
    title: "Task Management App",
    description:
      "A collaborative task management application with real-time updates.",
    image_url: "/images/projects/task-app.jpg",
    live_url: "https://example.com",
    github_url: "https://github.com",
    technologies: ["React", "Firebase", "Material UI"],
  },
  {
    id: "3",
    title: "Portfolio Website",
    description:
      "A responsive portfolio website with dark mode and animations.",
    image_url: "/images/projects/portfolio.jpg",
    live_url: "https://example.com",
    github_url: "https://github.com",
    technologies: ["Next.js", "Tailwind CSS", "Framer Motion"],
  },
];

export default function Home() {
  const targetRef = useRef<HTMLDivElement>(null);

  const scrollToProjects = () => {
    targetRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <Navbar />

      {/* Hero Section with Parallax */}
      <ParallaxSection
        bgImage="/images/hero-bg.jpg"
        className="h-screen flex items-center"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              Freelance Developer Portfolio & Management System
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Showcase your work, manage your projects, and keep track of
              important dates all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" onClick={scrollToProjects}>
                View Projects
              </Button>
              <Button size="lg" variant="outline">
                <Link href="/login">Get Started</Link>
              </Button>
            </div>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <button
            onClick={scrollToProjects}
            className="text-white animate-bounce"
          >
            <FaArrowDown className="h-6 w-6" />
          </button>
        </motion.div>
      </ParallaxSection>

      {/* Projects Section */}
      <section ref={targetRef} id="projects" className="py-20 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Featured Projects
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Check out some of my recent work. Each project represents a unique
              challenge and solution.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button variant="outline">
              <Link href="/login">View All Projects</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">My Skills</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              I specialize in building modern web applications with the latest
              technologies.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gray-800 p-6 rounded-lg text-center"
            >
              <div className="bg-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCode className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Frontend Development</h3>
              <p className="text-gray-400">
                React, Next.js, Vue.js, Tailwind CSS, Framer Motion
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gray-800 p-6 rounded-lg text-center"
            >
              <div className="bg-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaServer className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Backend Development</h3>
              <p className="text-gray-400">
                Node.js, Express, Python, Django, Ruby on Rails
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gray-800 p-6 rounded-lg text-center"
            >
              <div className="bg-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaMobile className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Mobile Development</h3>
              <p className="text-gray-400">
                React Native, Flutter, iOS, Android
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-gray-800 p-6 rounded-lg text-center"
            >
              <div className="bg-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaDatabase className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Database & DevOps</h3>
              <p className="text-gray-400">
                PostgreSQL, MongoDB, Firebase, Docker, AWS
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <ParallaxSection
        bgImage="/images/about-bg.jpg"
        className="py-20"
        id="about"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">About Me</h2>
              <p className="text-gray-300 mb-4">
                I'm a freelance developer with over 5 years of experience
                building web and mobile applications for clients around the
                world.
              </p>
              <p className="text-gray-300 mb-4">
                My approach combines technical expertise with a deep
                understanding of user experience and business needs. I believe
                in creating solutions that not only look great but also deliver
                real value.
              </p>
              <p className="text-gray-300 mb-6">
                When I'm not coding, you can find me hiking, reading, or
                experimenting with new technologies.
              </p>
              <Button>
                <Link href="/#contact">Get in Touch</Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative h-96 rounded-lg overflow-hidden"
            >
              <div className="absolute inset-0 bg-indigo-600/20 z-10 rounded-lg"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent z-10"></div>
              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                <span className="text-gray-500">Profile Image</span>
              </div>
            </motion.div>
          </div>
        </div>
      </ParallaxSection>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Get in Touch
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Have a project in mind? Let's discuss how I can help bring your
              ideas to life.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                ></textarea>
              </div>
              <div>
                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
