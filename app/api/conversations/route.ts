import { NextRequest, NextResponse } from 'next/server'

// In-memory conversations
// { id, title, fileName, fileType, fileSize, recipientId, recipientName, uploadedBy, createdAt }
const conversations: Array<any> = []

const users: Record<string, string> = {
  '1': 'مدیر سیستم',
  '2': 'سامی قربانی',
  '3': 'کارمند ۳',
}

export async function GET() {
  // newest first
  const list = [...conversations].sort((a,b)=> (a.createdAt < b.createdAt ? 1 : -1))
  return NextResponse.json({ conversations: list })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, fileName, fileType, fileSize, recipientId, uploadedBy } = body || {}

    if (!title || !fileName || !recipientId || !uploadedBy) {
      return NextResponse.json({ error: 'عنوان، فایل و مخاطب الزامی است' }, { status: 400 })
    }

    const newItem = {
      id: Date.now().toString(),
      title: String(title),
      fileName: String(fileName),
      fileType: String(fileType || ''),
      fileSize: Number(fileSize || 0),
      recipientId: String(recipientId),
      recipientName: users[String(recipientId)] || 'کاربر',
      uploadedBy: String(uploadedBy),
      createdAt: new Date().toISOString(),
    }

    conversations.push(newItem)

    return NextResponse.json(newItem)
  } catch (e) {
    return NextResponse.json({ error: 'خطا در ثبت مکاتبه' }, { status: 500 })
  }
}
