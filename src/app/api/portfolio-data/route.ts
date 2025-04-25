import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Get the first user (assuming there's only one user in the system for now)
    const user = await prisma.user.findFirst({
      include: {
        company: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'No user found' }, { status: 404 });
    }

    // Get featured projects
    const projects = await prisma.project.findMany({
      where: {
        featured: true,
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 6,
    });

    // Prepare the response data
    const portfolioData = {
      user: {
        id: user.id,
        name: user.name,
        title: user.title,
        bio: user.bio,
        location: user.location,
        avatarUrl: user.avatarUrl,
        skills: user.skills,
        linkedin: user.linkedin,
        github: user.github,
        twitter: user.twitter,
        website: user.website,
        phone: user.phone,
        email: user.email,
      },
      company: user.company
        ? {
            id: user.company.id,
            name: user.company.name,
            description: user.company.description,
            mission: user.company.mission,
            vision: user.company.vision,
            founded: user.company.founded,
            services: user.company.services,
            logo: user.company.logo,
            website: user.company.website,
            address: user.company.address,
            phone: user.company.phone,
            email: user.company.email,
          }
        : null,
      featuredProjects: projects,
    };

    return NextResponse.json(portfolioData);
  } catch (error: any) {
    console.error('Exception in GET /api/portfolio-data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
