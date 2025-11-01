import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const feedbackId = params.id
    const body = await request.json()
    const { status, managerReply } = body

    const updateData: any = {
      status: status || 'read'
    }

    if (managerReply && managerReply.trim()) {
      updateData.managerReply = managerReply.trim()
      updateData.repliedAt = new Date()
      updateData.status = 'replied'
    }

    const feedback = await prisma.privateFeedback.update({
      where: { id: feedbackId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      feedback: {
        id: feedback.id,
        status: feedback.status,
        managerReply: feedback.managerReply,
        repliedAt: feedback.repliedAt?.toISOString()
      }
    })

  } catch (error: any) {
    console.error('❌ Error updating feedback:', error)
    return NextResponse.json(
      { error: 'خطا در به‌روزرسانی نظر' },
      { status: 500 }
    )
  }
}

