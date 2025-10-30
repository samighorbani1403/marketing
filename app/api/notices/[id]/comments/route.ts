import { NextRequest, NextResponse } from 'next/server'

// Mock in-memory comments
// Structure: { id, noticeId, userId, body, createdAt }
const comments: Array<{ id: string; noticeId: string; userId: string; body: string; createdAt: string }> = []

// Mock users directory
const users: Record<string, string> = {
  '1': 'مدیر سیستم',
  '2': 'سامی قربانی',
  '3': 'کاربر سوم',
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const noticeId = params.id
    const list = comments
      .filter(c => c.noticeId === noticeId)
      .map(c => ({ ...c, userName: users[c.userId] || 'کاربر' }))
    return NextResponse.json({ comments: list })
  } catch (e) {
    return NextResponse.json({ error: 'خطا در دریافت کامنت‌ها' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const noticeId = params.id
    const bodyJson = await request.json()
    const text: string = (bodyJson?.body || '').toString()

    if (!text.trim()) {
      return NextResponse.json({ error: 'متن نظر الزامی است' }, { status: 400 })
    }

    // In real app, get from auth; here we mock current userId as '2'
    const userId = bodyJson?.userId?.toString() || '2'

    const newComment = {
      id: Date.now().toString(),
      noticeId,
      userId,
      body: text,
      createdAt: new Date().toISOString(),
    }

    comments.push(newComment)

    return NextResponse.json({ ...newComment, userName: users[userId] || 'کاربر' })
  } catch (e) {
    return NextResponse.json({ error: 'خطا در ثبت کامنت' }, { status: 500 })
  }
}
