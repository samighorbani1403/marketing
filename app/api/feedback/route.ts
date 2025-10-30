import { NextRequest, NextResponse } from 'next/server'

// In-memory feedbacks
// { id, userId, userName, body, createdAt }
const feedbacks: Array<any> = []

const users: Record<string, string> = {
  '1': 'مدیر سیستم',
  '2': 'سامی قربانی',
  '3': 'کارمند ۳',
}

export async function GET() {
  const list = [...feedbacks].sort((a,b)=> (a.createdAt < b.createdAt ? 1 : -1))
  return NextResponse.json({ feedbacks: list })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, body: text } = body || {}
    if (!userId || !text || !String(text).trim()) {
      return NextResponse.json({ error: 'متن نظر الزامی است' }, { status: 400 })
    }
    const item = {
      id: Date.now().toString(),
      userId: String(userId),
      userName: users[String(userId)] || 'کاربر',
      body: String(text),
      createdAt: new Date().toISOString(),
    }
    feedbacks.push(item)
    return NextResponse.json(item)
  } catch (e) {
    return NextResponse.json({ error: 'خطا در ثبت نظر' }, { status: 500 })
  }
}
