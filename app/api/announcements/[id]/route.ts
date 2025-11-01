import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const announcementId = params.id
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    const announcement = await (prisma as any).announcement.findUnique({
      where: { id: announcementId },
      include: {
        comments: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    if (!announcement) {
      return NextResponse.json(
        { error: 'اطلاعیه یافت نشد' },
        { status: 404 }
      )
    }

    // Check if user has access to individual announcement
    if (announcement.type === 'individual' && userId) {
      const recipientIds = announcement.recipientIds?.split(',') || []
      if (!recipientIds.includes(userId)) {
        return NextResponse.json(
          { error: 'شما دسترسی به این اطلاعیه ندارید' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      announcement: {
        id: announcement.id,
        type: announcement.type,
        title: announcement.title,
        body: announcement.body,
        createdBy: announcement.createdBy,
        createdById: announcement.createdById,
        recipientIds: announcement.recipientIds,
        recipientNames: announcement.recipientNames,
        createdAt: announcement.createdAt.toISOString(),
        updatedAt: announcement.updatedAt.toISOString(),
        comments: announcement.comments?.map((comment: any) => ({
          id: comment.id,
          userId: comment.userId,
          userName: comment.userName,
          body: comment.body,
          isManagerReply: comment.isManagerReply,
          createdAt: comment.createdAt.toISOString()
        })) || []
      }
    })

  } catch (error: any) {
    console.error('❌ Error fetching announcement:', error)
    
    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      return NextResponse.json(
        { error: 'اطلاعیه یافت نشد' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعیه' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const announcementId = params.id

    // Check if announcement exists
    const announcement = await (prisma as any).announcement.findUnique({
      where: { id: announcementId }
    })

    if (!announcement) {
      return NextResponse.json(
        { error: 'اطلاعیه یافت نشد' },
        { status: 404 }
      )
    }

    // Delete announcement (comments will be deleted automatically due to cascade)
    await (prisma as any).announcement.delete({
      where: { id: announcementId }
    })

    return NextResponse.json({
      success: true,
      message: 'اطلاعیه با موفقیت حذف شد'
    })

  } catch (error: any) {
    console.error('❌ Error deleting announcement:', error)
    
    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      return NextResponse.json(
        { error: 'اطلاعیه یافت نشد' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'خطا در حذف اطلاعیه' },
      { status: 500 }
    )
  }
}
