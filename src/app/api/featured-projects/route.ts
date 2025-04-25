import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get featured projects
    const projects = await prisma.project.findMany({
      where: {
        featured: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 6,
    });
    console.log('projects', projects);
    return NextResponse.json({ projects });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
