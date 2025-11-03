import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, username, password } = body

    console.log('🔍 Login attempt:', { 
      email: email || 'empty', 
      username: username || 'empty', 
      password: password ? '***' : 'empty' 
    })

    if (!password) {
      console.log('❌ Missing password')
      return NextResponse.json(
        { error: 'رمز عبور الزامی است' },
        { status: 400 }
      )
    }

    if (!email && !username) {
      console.log('❌ Missing email or username')
      return NextResponse.json(
        { error: 'ایمیل یا نام کاربری الزامی است' },
        { status: 400 }
      )
    }

    // Simple test admin users for development
    const adminUsers = [
      { id: '1', email: 'admin@admin.com', name: 'مدیر سیستم', password: '123456' },
      { id: '2', email: 'samighorbani1403@gmail.com', name: 'سامی قربانی', password: '123456' }
    ]

    // Check if it's an admin user (by email)
    if (email) {
      const adminMatched = adminUsers.find(u => u.email === email && u.password === password)
      if (adminMatched) {
        console.log('✅ Admin login successful!')
        
        const response = NextResponse.json({
          success: true,
          token: 'test-token-123',
          user: {
            id: adminMatched.id,
            email: adminMatched.email,
            name: adminMatched.name,
            role: 'admin'
          }
        })

        // Set token in cookie
        response.cookies.set('token', 'test-token-123', {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 // 7 days
        })

        return response
      }
    }

    // Check employee login (by username or email in Employee table)
    if (!prisma) {
      console.error('❌ Prisma client is not available')
      return NextResponse.json(
        { error: 'خطا در اتصال به دیتابیس' },
        { status: 500 }
      )
    }

    try {
      // Check if employee model exists
      if (!('employee' in prisma)) {
        console.error('❌ Employee model not found')
        return NextResponse.json(
          { error: 'سیستم احراز هویت کارمندان در دسترس نیست' },
          { status: 500 }
        )
      }

      // Find employee by username or email (if email is provided, check it against username too)
      let employee;
      if (username) {
        employee = await prisma.employee.findUnique({
          where: { username: username.trim() }
        })
      } else if (email) {
        // Try to find by username (some employees might use email as username)
        employee = await prisma.employee.findUnique({
          where: { username: email.trim() }
        })
      }

      if (!employee) {
        console.log('❌ Employee not found')
        return NextResponse.json(
          { error: 'نام کاربری یا رمز عبور اشتباه است' },
          { status: 401 }
        )
      }

      // Check if employee has a password
      if (!employee.password) {
        console.log('❌ Employee has no password set')
        return NextResponse.json(
          { error: 'رمز عبور برای این کاربر تنظیم نشده است' },
          { status: 401 }
        )
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, employee.password)
      if (!isPasswordValid) {
        console.log('❌ Invalid password')
        return NextResponse.json(
          { error: 'نام کاربری یا رمز عبور اشتباه است' },
          { status: 401 }
        )
      }

      console.log('✅ Employee login successful!', { id: employee.id, username: employee.username })

      // Generate token (in production, use JWT)
      const token = `employee-token-${employee.id}-${Date.now()}`

      const response = NextResponse.json({
        success: true,
        token,
        user: {
          id: employee.id,
          username: employee.username,
          name: employee.fullName,
          role: 'employee'
        }
      })

      // Set token in cookie
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 // 7 days
      })

      return response

    } catch (dbError: any) {
      console.error('❌ Database error:', dbError)
      return NextResponse.json(
        { error: 'خطا در اتصال به دیتابیس' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('❌ Login error:', error)
    return NextResponse.json(
      { error: 'خطای داخلی سرور' },
      { status: 500 }
    )
  }
}