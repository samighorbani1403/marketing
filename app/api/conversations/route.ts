import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const currentUserId = searchParams.get('currentUserId')

    if (!prisma) {
      return NextResponse.json({ conversations: [] }, { status: 200 })
    }

    const conversationsList: any[] = []

    // Get file-based conversations from Conversation model
    if ('conversation' in prisma) {
      let where: any = {}
      if (currentUserId) {
        where = {
          OR: [
            { senderId: currentUserId },
            { recipientId: currentUserId }
          ]
        }
      }

      const fileConversations = await (prisma as any).conversation.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      })

      conversationsList.push(...fileConversations.map((conv: any) => ({
        id: conv.id,
        title: conv.title || 'بدون عنوان',
        fileName: conv.fileName,
        fileType: conv.fileType,
        fileSize: conv.fileSize,
        recipientId: conv.recipientId,
        recipientName: conv.recipientName || 'کاربر',
        uploadedBy: conv.senderId,
        createdAt: conv.createdAt.toISOString()
      })))
    }

    // Get direct message conversations (unique pairs of users)
    if ('directMessage' in prisma && currentUserId) {
      // Get all unique conversation pairs involving current user
      const directMessages = await (prisma as any).directMessage.findMany({
        where: {
          OR: [
            { fromUserId: currentUserId },
            { toUserId: currentUserId }
          ]
        },
        orderBy: { createdAt: 'desc' },
        distinct: ['fromUserId', 'toUserId']
      })

      // Group messages by conversation pair
      const conversationPairs = new Map<string, any>()
      
      for (const msg of directMessages) {
        // Create a consistent key for the conversation pair
        const pairKey = [msg.fromUserId, msg.toUserId].sort().join('_')
        
        if (!conversationPairs.has(pairKey)) {
          const otherUserId = msg.fromUserId === currentUserId ? msg.toUserId : msg.fromUserId
          const otherUserName = msg.fromUserId === currentUserId ? msg.toUserName : msg.fromUserName
          
          // Get last message in this conversation
          const lastMessages = await (prisma as any).directMessage.findMany({
            where: {
              OR: [
                { fromUserId: currentUserId, toUserId: otherUserId },
                { fromUserId: otherUserId, toUserId: currentUserId }
              ]
            },
            orderBy: { createdAt: 'desc' },
            take: 1
          })

          const lastMsg = lastMessages[0]

          conversationPairs.set(pairKey, {
            id: `chat_${pairKey}`,
            title: `چت با ${otherUserName || 'کارمند'}`,
            fileName: lastMsg?.attachmentName || null,
            fileType: lastMsg?.attachmentType || null,
            fileSize: lastMsg?.attachmentSize || null,
            recipientId: otherUserId,
            recipientName: otherUserName || 'کارمند',
            uploadedBy: currentUserId,
            createdAt: lastMsg?.createdAt?.toISOString() || new Date().toISOString(),
            type: 'direct_message'
          })
        }
      }

      conversationsList.push(...Array.from(conversationPairs.values()))
    }

    // Sort all conversations by date (newest first)
    conversationsList.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return dateB - dateA
    })

    return NextResponse.json({ conversations: conversationsList })
  } catch (error: any) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json({ conversations: [] }, { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, fileName, fileType, fileSize, recipientId, uploadedBy, fileDataUrl } = body || {}

    if (!title || !fileName || !recipientId || !uploadedBy) {
      return NextResponse.json({ error: 'عنوان، فایل و مخاطب الزامی است' }, { status: 400 })
    }

    if (!prisma) {
      return NextResponse.json({ error: 'خطا در اتصال به دیتابیس' }, { status: 500 })
    }

    // Get recipient name
    let recipientName = 'کاربر'
    if ('employee' in prisma) {
      try {
        const employee = await prisma.employee.findUnique({
          where: { id: String(recipientId) },
          select: { fullName: true }
        })
        recipientName = employee?.fullName || 'کاربر'
      } catch {}
    }

    // Get sender name
    let senderName = 'کاربر'
    if ('employee' in prisma) {
      try {
        const employee = await prisma.employee.findUnique({
          where: { id: String(uploadedBy) },
          select: { fullName: true }
        })
        senderName = employee?.fullName || 'کاربر'
      } catch {}
    }

    // Save to database
    if ('conversation' in prisma) {
      const newConversation = await (prisma as any).conversation.create({
        data: {
          title: String(title),
          fileName: String(fileName),
          fileType: String(fileType || ''),
          fileSize: Number(fileSize || 0),
          fileDataUrl: fileDataUrl || null,
          senderId: String(uploadedBy),
          senderName,
          recipientId: String(recipientId),
          recipientName,
        }
      })

      return NextResponse.json({
        id: newConversation.id,
        title: newConversation.title,
        fileName: newConversation.fileName,
        fileType: newConversation.fileType,
        fileSize: newConversation.fileSize,
        recipientId: newConversation.recipientId,
        recipientName: newConversation.recipientName,
        uploadedBy: newConversation.senderId,
        createdAt: newConversation.createdAt.toISOString()
      })
    } else {
      // Fallback if model doesn't exist
      return NextResponse.json({ 
        error: 'مدل Conversation در دیتابیس وجود ندارد. لطفاً npx prisma db push اجرا کنید.' 
      }, { status: 500 })
    }
  } catch (e: any) {
    console.error('Error in POST conversation:', e)
    return NextResponse.json({ error: 'خطا در ثبت مکاتبه: ' + (e.message || 'خطای ناشناخته') }, { status: 500 })
  }
}
