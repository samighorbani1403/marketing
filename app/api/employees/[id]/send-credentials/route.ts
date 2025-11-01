import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId = params.id
    const body = await request.json()
    const { phone, username, password, fullName } = body

    // If password not provided, fetch from database
    let finalPassword = password
    if (!finalPassword || !finalPassword.trim()) {
      const employee = await prisma.employee.findUnique({
        where: { id: employeeId },
        select: { password: true, fullName: true, phone: true, username: true }
      })

      if (!employee) {
        return NextResponse.json(
          { error: 'کارمند یافت نشد' },
          { status: 404 }
        )
      }

      if (!employee.password) {
        return NextResponse.json(
          { error: 'رمز عبور برای این کارمند تعریف نشده است. لطفاً رمز عبور را وارد کنید.' },
          { status: 400 }
        )
      }

      finalPassword = employee.password
    }

    const finalPhone = phone || body.phone
    const finalUsername = username || body.username || body.employee?.username
    const finalFullName = fullName || body.fullName || body.employee?.fullName

    if (!finalPhone || !finalPhone.trim()) {
      return NextResponse.json(
        { error: 'شماره تماس کارمند الزامی است' },
        { status: 400 }
      )
    }

    if (!finalUsername || !finalUsername.trim()) {
      return NextResponse.json(
        { error: 'نام کاربری کارمند الزامی است' },
        { status: 400 }
      )
    }

    console.log('📱 Sending SMS credentials:', { phone: finalPhone, username: finalUsername, fullName: finalFullName })

    // Mock SMS sending - در واقعیت باید از سرویس پیامک استفاده کنید
    const smsMessage = `سلام ${finalFullName || 'کاربر عزیز'}
مشخصات ورود به پنل شما:
نام کاربری: ${finalUsername}
رمز عبور: ${finalPassword}

پنل آتامان`

    console.log('✅ SMS would be sent to:', finalPhone)
    console.log('Message:', smsMessage)

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      message: 'پیامک با موفقیت ارسال شد',
      sentTo: finalPhone
    })

  } catch (error: any) {
    console.error('❌ Error sending SMS:', error)
    return NextResponse.json(
      { error: 'خطا در ارسال پیامک' },
      { status: 500 }
    )
  }
}

