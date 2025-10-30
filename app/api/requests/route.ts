import { NextRequest, NextResponse } from 'next/server'

// In-memory mock store
// Request shape:
// { id, userId, type: 'leave'|'financial'|'letter', status: 'submitted'|'approved'|'rejected', createdAt,
//   payload: {...}, attachments?: [{name,type,size,dataUrl}] }
const requests: Array<any> = []

export async function GET() {
  // Return newest first
  return NextResponse.json({ requests: requests.slice().reverse() })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, type, payload, attachments } = body || {}

    if (!userId || !type) {
      return NextResponse.json({ error: 'کاربر و نوع درخواست الزامی است' }, { status: 400 })
    }

    if (!['leave','financial','letter'].includes(String(type))) {
      return NextResponse.json({ error: 'نوع درخواست نامعتبر است' }, { status: 400 })
    }

    // Basic validations per type
    if (type === 'leave') {
      if (!payload || !payload.leaveType || !payload.startDate) {
        return NextResponse.json({ error: 'نوع مرخصی و تاریخ شروع الزامی است' }, { status: 400 })
      }
    }
    if (type === 'financial') {
      if (!payload || !payload.title || !payload.body) {
        return NextResponse.json({ error: 'عنوان و متن درخواست مالی الزامی است' }, { status: 400 })
      }
    }
    if (type === 'letter') {
      if (!payload || !payload.organization) {
        return NextResponse.json({ error: 'سازمان مقصد الزامی است' }, { status: 400 })
      }
    }

    const item = {
      id: Date.now().toString(),
      userId: String(userId),
      type: String(type),
      status: 'submitted',
      createdAt: new Date().toISOString(),
      payload: payload || {},
      attachments: Array.isArray(attachments) ? attachments.map((a:any)=>({
        name: String(a.name), type: String(a.type), size: Number(a.size||0), dataUrl: a.dataUrl || null,
      })) : [],
    }

    requests.push(item)
    return NextResponse.json(item)
  } catch (e) {
    return NextResponse.json({ error: 'خطا در ثبت درخواست' }, { status: 500 })
  }
}
