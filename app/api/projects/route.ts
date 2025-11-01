import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Fetching projects...');
    
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const isAdmin = searchParams.get('admin') === 'true';

    // فیلتر بر اساس employeeId اگر وجود داشته باشد
    const where: any = {};
    if (employeeId) {
      where.employeeId = employeeId;
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('✅ Projects fetched successfully:', projects.length);

    return NextResponse.json({
      success: true,
      projects: projects.map(project => {
        const base = {
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
          employeeId: (project as any).employeeId || null,
          createdAt: project.createdAt.toISOString().split('T')[0]
        };
        
        // فقط برای مدیر: فیلدهای مالی را نمایش بده
        if (isAdmin) {
          return {
            ...base,
            employeeSalary: (project as any).employeeSalary || null,
            totalPrice: (project as any).totalPrice || null
          };
        }
        
        // برای کارمند: فیلدهای مالی را نشان نده
        return base;
      })
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
      status,
      employeeId,
      employeeSalary,
      totalPrice
    } = body;

    console.log('📝 Creating new project:', { name, client, budget, employeeId });

    // Create project in database
    const project = await prisma.project.create({
      data: {
        name,
        client,
        clientEmail: clientEmail || null,
        clientPhone: clientPhone || null,
        budget: parseInt(budget) || 0,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        description: description || null,
        priority: priority || 'medium',
        status: status || 'pending',
        progress: 0,
        sentToManager: false,
        employeeId: employeeId || null,
        employeeSalary: employeeSalary ? parseInt(employeeSalary) : null,
        totalPrice: totalPrice ? parseInt(totalPrice) : null
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
        progress: project.progress,
        employeeId: (project as any).employeeId || null
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