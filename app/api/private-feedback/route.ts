import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const feedbacks = await prisma.privateFeedback.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      feedbacks: feedbacks.map(fb => ({
        id: fb.id,
        employeeId: fb.employeeId,
        employeeName: fb.employeeName,
        employeePosition: fb.employeePosition,
        title: fb.title,
        message: fb.message,
        status: fb.status,
        managerReply: fb.managerReply,
        repliedAt: fb.repliedAt ? fb.repliedAt.toISOString() : null,
        createdAt: fb.createdAt.toISOString(),
        updatedAt: fb.updatedAt.toISOString()
      }))
    })

  } catch (error: any) {
    console.error('❌ Error fetching feedbacks:', error)
    return NextResponse.json(
      { error: 'خطا در دریافت نظرات' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      employeeId,
      employeeName,
      employeePosition,
      title,
      message
    } = body

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'متن نظر الزامی است' },
        { status: 400 }
      )
    }

    const feedback = await prisma.privateFeedback.create({
      data: {
        employeeId: employeeId || null,
        employeeName: employeeName || 'کارمند',
        employeePosition: employeePosition || null,
        title: title || null,
        message: message.trim()
      }
    })

    return NextResponse.json({
      success: true,
      feedback: {
        id: feedback.id,
        employeeName: feedback.employeeName,
        title: feedback.title,
        createdAt: feedback.createdAt.toISOString()
      }
    })

  } catch (error: any) {
    console.error('❌ Error creating feedback:', error)
    return NextResponse.json(
      { error: 'خطا در ثبت نظر' },
      { status: 500 }
    )
  }
}

