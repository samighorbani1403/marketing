import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;

    // Update project flag
    const project = await prisma.project.update({
      where: { id: projectId },
      data: { sentToManager: true, status: 'submitted' }
    });

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        sentToManager: true,
        status: project.status
      }
    });
  } catch (error) {
    console.error('❌ Error sending project to manager:', error);
    return NextResponse.json(
      { error: 'خطا در ارسال پروژه به مدیر' },
      { status: 500 }
    );
  }
}


