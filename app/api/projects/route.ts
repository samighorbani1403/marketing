import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Fetching projects...');

    const projects = await prisma.project.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('✅ Projects fetched successfully:', projects.length);

    return NextResponse.json({
      success: true,
      projects: projects.map(project => ({
        id: project.id,
        name: project.name,
        client: project.client,
        clientEmail: project.clientEmail,
        clientPhone: project.clientPhone,
        budget: project.budget,
        startDate: project.startDate.toISOString().split('T')[0],
        endDate: project.endDate ? project.endDate.toISOString().split('T')[0] : null,
        description: project.description,
        priority: project.priority,
        status: project.status,
        progress: project.progress,
        sentToManager: (project as any).sentToManager ?? false,
        createdAt: project.createdAt.toISOString().split('T')[0]
      }))
    });

  } catch (error) {
    console.error('❌ Error fetching projects:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت پروژه‌ها' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      client, 
      clientEmail, 
      clientPhone, 
      budget, 
      startDate, 
      endDate, 
      description, 
      priority, 
      status 
    } = body;

    console.log('📝 Creating new project:', { name, client, budget });

    // Create project in database
    const project = await prisma.project.create({
      data: {
        name,
        client,
        clientEmail: clientEmail || null,
        clientPhone: clientPhone || null,
        budget: parseInt(budget),
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        description: description || null,
        priority,
        status: status || 'pending',
        progress: 0,
        sentToManager: false
      }
    });

    console.log('✅ Project created successfully:', project);

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        client: project.client,
        status: project.status,
        budget: project.budget,
        progress: project.progress
      }
    });

  } catch (error) {
    console.error('❌ Error creating project:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد پروژه' },
      { status: 500 }
    );
  }
}