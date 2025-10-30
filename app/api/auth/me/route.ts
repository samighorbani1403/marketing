import { NextRequest, NextResponse } from 'next/server'

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

    // Simple test - if token exists, return user data
    if (token === 'test-token-123') {
      return NextResponse.json({
        id: '1',
        email: 'admin@admin.com',
        name: 'مدیر سیستم',
        createdAt: new Date().toISOString()
      })
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