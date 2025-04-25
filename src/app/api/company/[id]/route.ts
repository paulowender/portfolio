import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedClient } from '@/lib/auth-helper';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Authenticate the request
    const { user, error, status } = await getAuthenticatedClient(request);

    if (error) {
      return NextResponse.json({ error }, { status: status || 401 });
    }

    const userId = (await params).id;

    // If userId is provided, make sure it matches the authenticated user
    if (!user || (userId && userId !== user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized: Cannot access company profile of another user' },
        { status: 403 },
      );
    }

    // Get the company profile from the database
    const company = await prisma.company.findUnique({
      where: { userId },
    });

    if (!company) {
      return NextResponse.json({ error: 'Company profile not found' }, { status: 404 });
    }

    return NextResponse.json({ company });
  } catch (error: any) {
    console.error('Exception in GET /api/company/[id]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Authenticate the request
    const { user, error, status } = await getAuthenticatedClient(request);

    if (error) {
      return NextResponse.json({ error }, { status: status || 401 });
    }

    const userId = (await params).id;

    // If userId is provided, make sure it matches the authenticated user
    if (!user || (userId && userId !== user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized: Cannot update company profile of another user' },
        { status: 403 },
      );
    }

    // Parse the request body
    const body = await request.json();

    // Check if company profile exists
    const existingCompany = await prisma.company.findUnique({
      where: { userId },
    });

    let company;

    if (existingCompany) {
      // Update existing company profile
      company = await prisma.company.update({
        where: { userId },
        data: {
          name: body.name,
          description: body.description,
          mission: body.mission,
          vision: body.vision,
          founded: body.founded,
          services: body.services || [],
          address: body.address,
          phone: body.phone,
          email: body.email,
          website: body.website,
          logo: body.logo,
        },
      });
    } else {
      // Create new company profile
      company = await prisma.company.create({
        data: {
          name: body.name,
          description: body.description,
          mission: body.mission,
          vision: body.vision,
          founded: body.founded,
          services: body.services || [],
          address: body.address,
          phone: body.phone,
          email: body.email,
          website: body.website,
          logo: body.logo,
          userId,
        },
      });
    }

    return NextResponse.json({ company });
  } catch (error: any) {
    console.error('Exception in PUT /api/company/[id]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
