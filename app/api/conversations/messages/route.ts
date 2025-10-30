import { NextRequest, NextResponse } from 'next/server'

// In-memory group messages
// { id, userId, userName, message, createdAt, attachment? }
const messages: Array<any> = []

const users: Record<string, string> = {
  '1': 'مدیر سیستم',
  '2': 'سامی قربانی',
  '3': 'کارمند ۳',
}

export async function GET() {
  return NextResponse.json({ messages })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, message, attachment } = body || {}

    const hasText = !!(message && String(message).trim())
    const hasAttachment = !!attachment && !!attachment.name && !!attachment.type && (attachment.dataUrl || attachment.url)

    if (!userId || (!hasText && !hasAttachment)) {
      return NextResponse.json({ error: 'پیام نامعتبر است' }, { status: 400 })
    }

    const item = {
      id: Date.now().toString(),
      userId: String(userId),
      userName: users[String(userId)] || 'کاربر',
      message: hasText ? String(message) : '',
      createdAt: new Date().toISOString(),
      attachment: hasAttachment ? {
        name: String(attachment.name),
        type: String(attachment.type),
        size: Number(attachment.size || 0),
        // For mock: inline base64/url kept in memory
        dataUrl: attachment.dataUrl || null,
        url: attachment.url || null,
      } : undefined
    }

    messages.push(item)
    return NextResponse.json(item)
  } catch (e) {
    return NextResponse.json({ error: 'خطا در ارسال پیام' }, { status: 500 })
  }
}
