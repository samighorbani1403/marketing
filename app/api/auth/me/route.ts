import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'توکن یافت نشد' },
        { status: 401 }
      )
    }

    // Check if it's an admin token
    if (token === 'test-token-123') {
      return NextResponse.json({
        id: '1',
        email: 'admin@admin.com',
        name: 'مدیر سیستم',
        role: 'admin',
        createdAt: new Date().toISOString()
      })
    }

    // Check if it's an employee token
    if (token.startsWith('employee-token-')) {
      if (!prisma) {
        return NextResponse.json(
          { error: 'خطا در اتصال به دیتابیس' },
          { status: 500 }
        )
      }

      try {
        // Extract employee ID from token (format: employee-token-{id}-{timestamp})
        // Remove 'employee-token-' prefix
        const tokenWithoutPrefix = token.replace('employee-token-', '')
        // Split by '-' and get the first part (employee ID)
        // cuid() IDs don't contain dashes, so first part is always the employee ID
        const parts = tokenWithoutPrefix.split('-')
        const employeeId = parts[0] // First part is always the employee ID

        console.log('🔍 Extracting employee ID from token:', { 
          tokenPrefix: token.substring(0, 30) + '...', 
          employeeId,
          tokenParts: parts.length 
        })

        // Find employee in database
        if ('employee' in prisma) {
          const employee = await prisma.employee.findUnique({
            where: { id: employeeId },
            select: {
              id: true,
              username: true,
              fullName: true,
              position: true,
              employeeRank: true,
              photoDataUrl: true,
              createdAt: true
            }
          })

          if (employee) {
            console.log('✅ Employee found:', employee.fullName)
            return NextResponse.json({
              id: employee.id,
              username: employee.username,
              name: employee.fullName,
              position: employee.position,
              employeeRank: employee.employeeRank,
              photoDataUrl: employee.photoDataUrl,
              role: 'employee',
              createdAt: employee.createdAt.toISOString()
            })
          } else {
            console.log('❌ Employee not found with ID:', employeeId)
          }
        }
      } catch (dbError: any) {
        console.error('❌ Database error in /api/auth/me:', dbError)
        return NextResponse.json(
          { error: 'خطا در دریافت اطلاعات کاربر' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { error: 'توکن نامعتبر' },
      { status: 401 }
    )

  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: 'توکن نامعتبر' },
      { status: 401 }
    )
  }
}