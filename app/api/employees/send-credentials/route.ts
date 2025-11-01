import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, username, password, fullName, employeeId } = body

    if (!phone || !username || !password) {
      return NextResponse.json(
        { error: 'شماره تماس، نام کاربری و رمز عبور الزامی است' },
        { status: 400 }
      )
    }

    console.log('📱 Sending SMS credentials:', { phone, username, fullName, employeeId })

    // Mock SMS sending - در واقعیت باید از سرویس پیامک استفاده کنید
    // برای مثال: Kavenegar, SMS.ir, یا هر سرویس دیگری
    const smsMessage = `سلام ${fullName || 'کاربر عزیز'}
مشخصات ورود به پنل شما:
نام کاربری: ${username}
رمز عبور: ${password}

پنل آتامان`

    // در اینجا می‌توانید از سرویس پیامک واقعی استفاده کنید
    // مثال با Kavenegar:
    // const response = await fetch('https://api.kavenegar.com/v1/API_KEY/sms/send.json', {
    //   method: 'POST',
    //   body: new URLSearchParams({
    //     receptor: phone,
    //     message: smsMessage
    //   })
    // })

    // برای حال حاضر، فقط log می‌کنیم
    console.log('✅ SMS would be sent to:', phone)
    console.log('Message:', smsMessage)

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      message: 'پیامک با موفقیت ارسال شد',
      sentTo: phone
    })

  } catch (error: any) {
    console.error('❌ Error sending SMS:', error)
    return NextResponse.json(
      { error: 'خطا در ارسال پیامک' },
      { status: 500 }
    )
  }
}

