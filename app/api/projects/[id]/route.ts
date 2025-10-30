import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    
    console.log('📋 Fetching project:', projectId);

    const project = await prisma.project.findUnique({
      where: {
        id: projectId
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: 'پروژه یافت نشد' },
        { status: 404 }
      );
    }

    console.log('✅ Project fetched successfully:', project.name);

    return NextResponse.json({
      success: true,
      project: {
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
      }
    });

  } catch (error) {
    console.error('❌ Error fetching project:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت پروژه' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
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
      status,
      progress
    } = body;

    console.log('📝 Updating project:', { projectId, name, client, budget });

    // Update project in database
    const project = await prisma.project.update({
      where: {
        id: projectId
      },
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
        status,
        progress: parseInt(progress) || 0
      }
    });

    console.log('✅ Project updated successfully:', project);

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
    console.error('❌ Error updating project:', error);
    return NextResponse.json(
      { error: 'خطا در ویرایش پروژه' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    
    console.log('🗑️ Deleting project:', projectId);

    // Delete project from database
    await prisma.project.delete({
      where: {
        id: projectId
      }
    });

    console.log('✅ Project deleted successfully:', projectId);

    return NextResponse.json({
      success: true,
      message: 'پروژه با موفقیت حذف شد'
    });

  } catch (error) {
    console.error('❌ Error deleting project:', error);
    return NextResponse.json(
      { error: 'خطا در حذف پروژه' },
      { status: 500 }
    );
  }
}
