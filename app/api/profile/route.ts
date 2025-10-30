import { NextRequest, NextResponse } from 'next/server'

// In-memory mock profile
let profile: any = {
  id: '2',
  name: 'سامی قربانی',
  email: 'samighorbani1403@gmail.com',
  phone: '09123456789',
  position: 'بازاریاب',
  department: 'فروش',
  bio: 'کارشناس بازاریابی',
  avatarDataUrl: '',
}

export async function GET() {
  return NextResponse.json(profile)
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    // Basic validation
    if (!body.name || !body.email) {
      return NextResponse.json({ error: 'نام و ایمیل الزامی است' }, { status: 400 })
    }

    profile = {
      ...profile,
      name: String(body.name),
      email: String(body.email),
      phone: body.phone ? String(body.phone) : '',
      position: body.position ? String(body.position) : '',
      department: body.department ? String(body.department) : '',
      bio: body.bio ? String(body.bio) : '',
      avatarDataUrl: body.avatarDataUrl ? String(body.avatarDataUrl) : profile.avatarDataUrl,
    }

    return NextResponse.json({ success: true, profile })
  } catch (e) {
    return NextResponse.json({ error: 'خطا در به‌روزرسانی پروفایل' }, { status: 500 })
  }
}
