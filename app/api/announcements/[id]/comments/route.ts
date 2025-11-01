import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const announcementId = params.id

    const comments = await (prisma as any).announcementComment.findMany({
      where: {
        announcementId
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      comments: comments.map((comment: any) => ({
        id: comment.id,
        announcementId: comment.announcementId,
        userId: comment.userId,
        userName: comment.userName,
        body: comment.body,
        isManagerReply: comment.isManagerReply,
        createdAt: comment.createdAt.toISOString()
      }))
    })

  } catch (error: any) {
    console.error('❌ Error fetching comments:', error)
    
    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      return NextResponse.json({
        success: true,
        comments: []
      })
    }

    return NextResponse.json(
      { error: 'خطا در دریافت نظرات' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const announcementId = params.id
    const body = await request.json()
    const { userId, userName, body: commentBody, isManagerReply } = body

    if (!userName || !commentBody) {
      return NextResponse.json(
        { error: 'نام کاربر و متن نظر الزامی است' },
        { status: 400 }
      )
    }

    const comment = await (prisma as any).announcementComment.create({
      data: {
        announcementId,
        userId: userId || null,
        userName: userName.trim(),
        body: commentBody.trim(),
        isManagerReply: isManagerReply || false
      }
    })

    return NextResponse.json({
      success: true,
      comment: {
        id: comment.id,
        announcementId: comment.announcementId,
        userId: comment.userId,
        userName: comment.userName,
        body: comment.body,
        isManagerReply: comment.isManagerReply,
        createdAt: comment.createdAt.toISOString()
      }
    })

  } catch (error: any) {
    console.error('❌ Error creating comment:', error)
    
    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      return NextResponse.json(
        {
          error: 'جدول نظرات در دیتابیس وجود ندارد. لطفاً migration انجام دهید:\nnpx prisma db push'
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'خطا در ثبت نظر' },
      { status: 500 }
    )
  }
}

