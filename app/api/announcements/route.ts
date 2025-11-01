import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')

    let where: any = {}

    if (type === 'public') {
      where.type = 'public'
    } else if (type === 'individual' && userId) {
      where.type = 'individual'
      where.OR = [
        { recipientIds: { contains: userId } },
        { recipientIds: userId }
      ]
    } else if (userId) {
      // Return both public and individual for this user
      where.OR = [
        { type: 'public' },
        { type: 'individual', recipientIds: { contains: userId } },
        { type: 'individual', recipientIds: userId }
      ]
    }

    const announcements = await (prisma as any).announcement.findMany({
      where,
      include: {
        comments: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      announcements: announcements.map((ann: any) => ({
        id: ann.id,
        type: ann.type,
        title: ann.title,
        body: ann.body,
        createdBy: ann.createdBy,
        createdById: ann.createdById,
        recipientIds: ann.recipientIds,
        recipientNames: ann.recipientNames,
        createdAt: ann.createdAt.toISOString(),
        updatedAt: ann.updatedAt.toISOString(),
        commentsCount: ann.comments?.length || 0
      }))
    })

  } catch (error: any) {
    console.error('❌ Error fetching announcements:', error)
    
    // Fallback to empty array if table doesn't exist
    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      return NextResponse.json({
        success: true,
        announcements: []
      })
    }

    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعیه‌ها' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json()
    const {
      type,
      title,
      body,
      createdBy,
      createdById,
      recipientIds,
      recipientNames
    } = requestBody

    if (!type || !title || !body) {
      return NextResponse.json(
        { error: 'نوع، عنوان و محتوای اطلاعیه الزامی است' },
        { status: 400 }
      )
    }

    if (type === 'individual' && (!recipientIds || !recipientIds.trim())) {
      return NextResponse.json(
        { error: 'برای اطلاعیه فردی باید گیرنده انتخاب شود' },
        { status: 400 }
      )
    }

    const announcement = await (prisma as any).announcement.create({
      data: {
        type,
        title: title.trim(),
        body: body.trim(),
        createdBy: createdBy || 'مدیر سیستم',
        createdById: createdById || null,
        recipientIds: type === 'individual' ? recipientIds : null,
        recipientNames: type === 'individual' ? recipientNames : null
      }
    })

    return NextResponse.json({
      success: true,
      announcement: {
        id: announcement.id,
        type: announcement.type,
        title: announcement.title,
        createdAt: announcement.createdAt.toISOString()
      }
    })

  } catch (error: any) {
    console.error('❌ Error creating announcement:', error)
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      meta: error.meta
    })

    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      return NextResponse.json(
        {
          error: 'جدول اطلاعیه‌ها در دیتابیس وجود ندارد. لطفاً migration انجام دهید:\nnpx prisma db push'
        },
        { status: 500 }
      )
    }

    if (error.message?.includes('Cannot read properties') || error.message?.includes('undefined')) {
      const availableModels = Object.keys(prisma).filter(key => !key.startsWith('$') && typeof prisma[key as keyof typeof prisma] === 'object')
      return NextResponse.json(
        {
          error: `مدل Announcement در Prisma Client وجود ندارد.\n\nمدل‌های موجود: ${availableModels.join(', ')}\n\nلطفاً:\n1. سرور را متوقف کنید (Ctrl+C)\n2. npx prisma generate اجرا کنید\n3. npx prisma db push اجرا کنید\n4. سرور را restart کنید`
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        error: error.message || 'خطا در ایجاد اطلاعیه'
      },
      { status: 500 }
    )
  }
}

