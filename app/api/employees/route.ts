import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Fetching employees...');

    // Check if Prisma client is available
    if (!prisma) {
      console.error('❌ Prisma client is not available');
      return NextResponse.json(
        { 
          success: true, 
          employees: [],
          warning: 'Prisma client is not initialized. Please run: npx prisma generate'
        },
        { status: 200 }
      );
    }

    const employees = await prisma.employee.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('✅ Employees fetched successfully:', employees.length);

    return NextResponse.json({
      success: true,
      employees: employees.map(employee => ({
        id: employee.id,
        fullName: employee.fullName,
        education: employee.education,
        birthDate: employee.birthDate ? employee.birthDate.toISOString().split('T')[0] : null,
        fatherName: employee.fatherName,
        nationalId: employee.nationalId,
        interviewDate: employee.interviewDate ? employee.interviewDate.toISOString().split('T')[0] : null,
        hireDate: employee.hireDate ? employee.hireDate.toISOString().split('T')[0] : null,
        phone: employee.phone,
        address: employee.address,
        employeeNumber: employee.employeeNumber,
        photoDataUrl: employee.photoDataUrl,
        maritalStatus: employee.maritalStatus,
        childrenCount: employee.childrenCount,
        religion: employee.religion,
        workType: employee.workType,
        salary: employee.salary,
        position: employee.position,
        employeeRank: employee.employeeRank,
        username: (employee as any).username || null,
        password: null, // Never return password
        terminationDate: (employee as any).terminationDate ? (employee as any).terminationDate.toISOString().split('T')[0] : null,
        terminationReason: (employee as any).terminationReason || null,
        createdAt: employee.createdAt.toISOString().split('T')[0]
      }))
    });

  } catch (error: any) {
    console.error('❌ Error fetching employees:', error);
    
    // Check for specific Prisma errors
    if (error.code === 'P2001' || error.message?.includes('does not exist')) {
      return NextResponse.json(
        { 
          success: true,
          employees: [],
          warning: 'جدول کارمندان در دیتابیس وجود ندارد. لطفاً migration انجام دهید: npx prisma db push'
        },
        { status: 200 }
      );
    }
    
    if (error.message?.includes('PrismaClient')) {
      return NextResponse.json(
        { 
          success: true,
          employees: [],
          warning: 'Prisma client نیاز به generate دارد. لطفاً اجرا کنید: npx prisma generate'
        },
        { status: 200 }
      );
    }

    // Return empty array instead of error so page can still load
    return NextResponse.json(
      { 
        success: true,
        employees: [],
        error: error?.message || 'خطا در دریافت کارمندان'
      },
      { status: 200 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.fullName || !body.fullName.trim()) {
      return NextResponse.json(
        { error: 'نام و نام خانوادگی الزامی است' },
        { status: 400 }
      );
    }

    const { 
      fullName,
      education,
      birthDate,
      fatherName,
      nationalId,
      interviewDate,
      hireDate,
      phone,
      address,
      employeeNumber,
      photoDataUrl,
      maritalStatus,
      childrenCount,
      religion,
      workType,
      salary,
      position,
      employeeRank,
      username,
      password,
      terminationDate,
      terminationReason
    } = body;

    console.log('📝 Creating new employee:', { fullName, employeeNumber, nationalId, username });

    // Check if Prisma client is available
    if (!prisma) {
      console.error('❌ Prisma client is not available');
      return NextResponse.json(
        { error: 'Prisma client is not initialized. Please run: npx prisma generate' },
        { status: 500 }
      );
    }

    // Hash password if provided
    let hashedPassword: string | null = null;
    if (password && password.trim()) {
      try {
        hashedPassword = await bcrypt.hash(password.trim(), 10);
        console.log('✅ Password hashed successfully');
      } catch (hashError) {
        console.error('❌ Error hashing password:', hashError);
        return NextResponse.json(
          { error: 'خطا در رمزگذاری رمز عبور' },
          { status: 500 }
        );
      }
    }

    // Try to access employee model - if it fails, we'll catch it below
    // Create employee in database with proper error handling
    let employee;
    try {
      // Check if employee property exists on prisma
      if (!('employee' in prisma)) {
        throw new Error('Prisma employee model not found. Model Employee does not exist in Prisma Client.');
      }

      employee = await prisma.employee.create({
        data: {
          fullName,
          education: education || null,
          birthDate: birthDate ? new Date(birthDate) : null,
          fatherName: fatherName || null,
          nationalId: nationalId || null,
          interviewDate: interviewDate ? new Date(interviewDate) : null,
          hireDate: hireDate ? new Date(hireDate) : null,
          phone: phone || null,
          address: address || null,
          employeeNumber: employeeNumber || null,
          photoDataUrl: photoDataUrl || null,
          maritalStatus: maritalStatus || 'single',
          childrenCount: childrenCount ? parseInt(childrenCount) : 0,
          religion: religion || null,
          workType: workType || 'full-time',
          salary: salary ? parseInt(salary) : null,
          position: position || null,
          employeeRank: employeeRank || null,
          username: username?.trim() || null,
          password: hashedPassword,
          terminationDate: terminationDate ? new Date(terminationDate) : null,
          terminationReason: terminationReason || null
        }
      });

      console.log('✅ Employee created successfully:', employee);

      return NextResponse.json({
        success: true,
        employee: {
          id: employee.id,
          fullName: employee.fullName,
          employeeNumber: employee.employeeNumber
        }
      });
    } catch (createError: any) {
      // Re-throw to be caught by outer catch block
      throw createError;
    }
  } catch (error: any) {
    console.error('❌ Error creating employee:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      meta: error.meta,
      stack: error.stack
    });
    
    // Check if it's the "Cannot read properties of undefined" error
    if (error.message?.includes('Cannot read properties') || error.message?.includes('undefined') || error.message?.includes('employee model not found')) {
      // List available models for debugging
      const availableModels = Object.keys(prisma).filter(key => !key.startsWith('$') && typeof prisma[key as keyof typeof prisma] === 'object');
      console.error('Available Prisma models:', availableModels);
      
      return NextResponse.json(
        { 
          error: `مدل Employee در Prisma Client وجود ندارد.\n\nمدل‌های موجود: ${availableModels.join(', ') || 'هیچ مدلی یافت نشد'}\n\nلطفاً:\n1. سرور را متوقف کنید (Ctrl+C)\n2. npx prisma generate اجرا کنید\n3. npx prisma db push اجرا کنید\n4. سرور را restart کنید (npm run dev)`
        },
        { status: 500 }
      );
    }
    
    // Check for Prisma client errors
    if (error.message?.includes('PrismaClient') || error.message?.includes('does not exist')) {
      return NextResponse.json(
        { 
          error: 'خطا در اتصال به دیتابیس. لطفاً مطمئن شوید که:\n1. Prisma client generate شده است: npx prisma generate\n2. جدول employees در دیتابیس وجود دارد: npx prisma db push'
        },
        { status: 500 }
      );
    }
    
    // Check for unique constraint violation
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'فیلد';
      let fieldName = 'فیلد';
      if (field === 'nationalId') fieldName = 'کد ملی';
      else if (field === 'employeeNumber') fieldName = 'شماره استخدامی';
      
      return NextResponse.json(
        { error: `${fieldName} قبلاً در سیستم ثبت شده است. لطفاً مقدار دیگری وارد کنید.` },
        { status: 400 }
      );
    }
    
    // Check for table not found
    if (error.code === 'P2001' || error.message?.includes('Table') || error.message?.includes('does not exist')) {
      return NextResponse.json(
        { 
          error: 'جدول کارمندان در دیتابیس وجود ندارد. لطفاً migration انجام دهید:\nnpx prisma db push'
        },
        { status: 500 }
      );
    }
    
    // Return detailed error message
    return NextResponse.json(
      { 
        error: error.message || 'خطا در ایجاد کارمند. لطفاً تمام فیلدهای الزامی را پر کنید.'
      },
      { status: 500 }
    );
  }
}

