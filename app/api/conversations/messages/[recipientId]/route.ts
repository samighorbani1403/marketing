import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const getUserName = async (userId: string): Promise<string> => {
  if (!prisma || !('employee' in prisma)) {
    return 'کاربر'
  }

  try {
    const employee = await prisma.employee.findUnique({
      where: { id: userId },
      select: { fullName: true }
    })
    return employee?.fullName || 'کاربر'
  } catch {
    return 'کاربر'
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { recipientId: string } }
) {
  try {
    const rid = params.recipientId
    const { searchParams } = new URL(request.url)
    const currentUserId = searchParams.get('currentUserId')

    if (!prisma) {
      return NextResponse.json({ messages: [] }, { status: 200 })
    }

    if (!('directMessage' in prisma)) {
      // Fallback to empty if model doesn't exist yet
      return NextResponse.json({ messages: [] }, { status: 200 })
    }

    // Get messages where current user is either sender or recipient
    // This ensures both sides can see the conversation
    let where: any = {}
    if (currentUserId) {
      where = {
        OR: [
          { fromUserId: currentUserId, toUserId: rid },
          { fromUserId: rid, toUserId: currentUserId }
        ]
      }
    } else {
      // If no currentUserId, just get all messages to/from this recipient
      where = {
        OR: [
          { toUserId: rid },
          { fromUserId: rid }
        ]
      }
    }

    const messages = await (prisma as any).directMessage.findMany({
      where,
      orderBy: { createdAt: 'asc' }
    })

    const formattedMessages = messages.map((msg: any) => ({
      id: msg.id,
      fromUserId: msg.fromUserId,
      fromUserName: msg.fromUserName,
      toUserId: msg.toUserId,
      toUserName: msg.toUserName,
      message: msg.message || '',
      createdAt: msg.createdAt.toISOString(),
      attachment: msg.attachmentName ? {
        name: msg.attachmentName,
        type: msg.attachmentType || '',
        size: msg.attachmentSize || 0,
        dataUrl: msg.attachmentDataUrl || null,
        url: null
      } : undefined
    }))

    return NextResponse.json({ messages: formattedMessages })
  } catch (error: any) {
    console.error('Error fetching direct messages:', error)
    return NextResponse.json({ messages: [] }, { status: 200 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { recipientId: string } }
) {
  try {
    const rid = params.recipientId
    const body = await request.json()
    const { fromUserId, message, attachment } = body || {}

    const hasText = !!(message && String(message).trim())
    const hasAttachment = !!attachment && !!attachment.name && !!attachment.type && (attachment.dataUrl || attachment.url)

    if (!fromUserId || (!hasText && !hasAttachment)) {
      return NextResponse.json({ error: 'پیام یا فایل الزامی است' }, { status: 400 })
    }

    if (!prisma) {
      return NextResponse.json({ error: 'خطا در اتصال به دیتابیس' }, { status: 500 })
    }

    // Get user names from database
    const fromUserName = await getUserName(String(fromUserId))
    const toUserName = await getUserName(String(rid))

    // Check if directMessage model exists
    if (!('directMessage' in prisma)) {
      console.error('❌ DirectMessage model not found in Prisma')
      const availableModels = Object.keys(prisma).filter(key => !key.startsWith('$') && typeof prisma[key as keyof typeof prisma] === 'object')
      console.error('Available models:', availableModels)
      return NextResponse.json({ 
        error: `مدل DirectMessage در دیتابیس وجود ندارد. مدل‌های موجود: ${availableModels.join(', ')}. لطفاً سرور را متوقف کنید و npx prisma generate و npx prisma db push اجرا کنید.` 
      }, { status: 500 })
    }

    console.log('💬 Saving message to database:', {
      fromUserId: String(fromUserId),
      toUserId: String(rid),
      hasText,
      hasAttachment
    })

    // Save to database
    let savedMessage
    try {
      savedMessage = await (prisma as any).directMessage.create({
        data: {
          fromUserId: String(fromUserId),
          fromUserName,
          toUserId: String(rid),
          toUserName,
          message: hasText ? String(message) : '',
          attachmentName: hasAttachment ? String(attachment.name) : null,
          attachmentType: hasAttachment ? String(attachment.type) : null,
          attachmentSize: hasAttachment ? Number(attachment.size || 0) : null,
          attachmentDataUrl: hasAttachment ? (attachment.dataUrl || attachment.url || null) : null,
        }
      })
      console.log('✅ Message saved successfully:', savedMessage.id)
    } catch (dbError: any) {
      console.error('❌ Error saving message to database:', dbError)
      return NextResponse.json({ 
        error: 'خطا در ذخیره پیام در دیتابیس: ' + (dbError.message || 'خطای ناشناخته') 
      }, { status: 500 })
    }

    // Return formatted message
    const response = {
      id: savedMessage.id,
      fromUserId: savedMessage.fromUserId,
      fromUserName: savedMessage.fromUserName,
      toUserId: savedMessage.toUserId,
      toUserName: savedMessage.toUserName,
      message: savedMessage.message || '',
      createdAt: savedMessage.createdAt.toISOString(),
      attachment: savedMessage.attachmentName ? {
        name: savedMessage.attachmentName,
        type: savedMessage.attachmentType || '',
        size: savedMessage.attachmentSize || 0,
        dataUrl: savedMessage.attachmentDataUrl || null,
        url: null
      } : undefined
    }

    return NextResponse.json(response)
  } catch (e: any) {
    console.error('Error in POST direct message:', e)
    return NextResponse.json({ error: 'خطا در ارسال پیام: ' + (e.message || 'خطای ناشناخته') }, { status: 500 })
  }
}

