import { NextRequest, NextResponse } from 'next/server'

// In-memory direct messages per recipientId
// Each item: { id, fromUserId, fromUserName, toUserId, message, createdAt }
const directMessages: Record<string, Array<any>> = {}

const users: Record<string, string> = {
  '1': 'مدیر سیستم',
  '2': 'سامی قربانی',
  '3': 'کارمند ۳',
}

export async function GET(
  request: NextRequest,
  { params }: { params: { recipientId: string } }
) {
  const rid = params.recipientId
  const list = directMessages[rid] || []
  return NextResponse.json({ messages: list })
}

export async function POST(
  request: NextRequest,
  { params }: { params: { recipientId: string } }
) {
  try {
    const rid = params.recipientId
    const body = await request.json()
    const { fromUserId, message } = body || {}

    if (!fromUserId || !message || !String(message).trim()) {
      return NextResponse.json({ error: 'پیام نامعتبر است' }, { status: 400 })
    }

    const item = {
      id: Date.now().toString(),
      fromUserId: String(fromUserId),
      fromUserName: users[String(fromUserId)] || 'کاربر',
      toUserId: String(rid),
      message: String(message),
      createdAt: new Date().toISOString(),
    }

    if (!directMessages[rid]) directMessages[rid] = []
    directMessages[rid].push(item)

    return NextResponse.json(item)
  } catch (e) {
    return NextResponse.json({ error: 'خطا در ارسال پیام' }, { status: 500 })
  }
}

