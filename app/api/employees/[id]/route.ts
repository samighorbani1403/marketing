import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId = params.id;
    
    console.log('📋 Fetching employee:', employeeId);

    const employee = await prisma.employee.findUnique({
      where: {
        id: employeeId
      }
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'کارمند یافت نشد' },
        { status: 404 }
      );
    }

    console.log('✅ Employee fetched successfully:', employee.fullName);

    return NextResponse.json({
      success: true,
      employee: {
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
      }
    });

  } catch (error) {
    console.error('❌ Error fetching employee:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت کارمند' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId = params.id;
    const body = await request.json();
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

    console.log('📝 Updating employee:', { employeeId, fullName });

    // Build update data object
    const updateData: any = {
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
      username: username || null,
      terminationDate: terminationDate ? new Date(terminationDate) : null,
      terminationReason: terminationReason || null
    };

    // Only update password if provided
    if (password && password.trim()) {
      updateData.password = password.trim();
    }

    // Update employee in database
    const employee = await prisma.employee.update({
      where: {
        id: employeeId
      },
      data: updateData
    });

    console.log('✅ Employee updated successfully:', employee);

    return NextResponse.json({
      success: true,
      employee: {
        id: employee.id,
        fullName: employee.fullName,
        employeeNumber: employee.employeeNumber
      }
    });

  } catch (error: any) {
    console.error('❌ Error updating employee:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'کد ملی یا شماره استخدامی قبلاً ثبت شده است' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'خطا در به‌روزرسانی کارمند' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId = params.id;
    
    console.log('🗑️ Deleting employee:', employeeId);

    // Delete employee from database
    await prisma.employee.delete({
      where: {
        id: employeeId
      }
    });

    console.log('✅ Employee deleted successfully:', employeeId);

    return NextResponse.json({
      success: true,
      message: 'کارمند با موفقیت حذف شد'
    });

  } catch (error) {
    console.error('❌ Error deleting employee:', error);
    return NextResponse.json(
      { error: 'خطا در حذف کارمند' },
      { status: 500 }
    );
  }
}

