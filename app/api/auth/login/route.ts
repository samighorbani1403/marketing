import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log('🔍 Login attempt:', { email, password: password ? '***' : 'empty' })

    if (!email || !password) {
      console.log('❌ Missing email or password')
      return NextResponse.json(
        { error: 'ایمیل و رمز عبور الزامی است' },
        { status: 400 }
      )
    }

    // Simple test users for development
    const validUsers = [
      { id: '1', email: 'admin@admin.com', name: 'مدیر سیستم', password: '123456' },
      { id: '2', email: 'samighorbani1403@gmail.com', name: 'سامی قربانی', password: '123456' }
    ]

    const matched = validUsers.find(u => u.email === email && u.password === password)
    if (matched) {
      console.log('✅ Login successful!')
      
      const response = NextResponse.json({
        success: true,
        token: 'test-token-123',
        user: {
          id: matched.id,
          email: matched.email,
          name: matched.name
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

    console.log('❌ Invalid credentials')
    return NextResponse.json(
      { error: 'ایمیل یا رمز عبور اشتباه است' },
      { status: 401 }
    )

  } catch (error) {
    console.error('❌ Login error:', error)
    return NextResponse.json(
      { error: 'خطای داخلی سرور' },
      { status: 500 }
    )
  }
}