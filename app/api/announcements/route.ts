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
      // recipientIds is comma-separated string like "id1,id2,id3"
      // We need to check if userId is in this string
      where.OR = [
        { recipientIds: { contains: userId } },
        { recipientIds: userId },
        // Also check if it starts with userId, (for first item)
        // ends with userId (for last item), or contains ,userId, (for middle item)
        { recipientIds: { startsWith: userId + ',' } },
        { recipientIds: { endsWith: ',' + userId } }
      ]
    } else if (userId) {
      // Return both public and individual for this user
      where.OR = [
        { type: 'public' },
        {
          AND: [
            { type: 'individual' },
            {
              OR: [
                { recipientIds: { contains: userId } },
                { recipientIds: userId },
                { recipientIds: { startsWith: userId + ',' } },
                { recipientIds: { endsWith: ',' + userId } }
              ]
            }
          ]
        }
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

    if (!prisma) {
      console.error('❌ Prisma client is not available')
      return NextResponse.json(
        { error: 'خطا در اتصال به دیتابیس' },
        { status: 500 }
      )
    }

    // Check if announcement model exists
    if (!('announcement' in prisma)) {
      console.error('❌ Announcement model not found in Prisma')
      const availableModels = Object.keys(prisma).filter(key => !key.startsWith('$') && typeof prisma[key as keyof typeof prisma] === 'object')
      return NextResponse.json(
        { 
          error: `مدل Announcement در دیتابیس وجود ندارد. مدل‌های موجود: ${availableModels.join(', ')}. لطفاً سرور را متوقف کنید و npx prisma generate و npx prisma db push اجرا کنید.` 
        },
        { status: 500 }
      )
    }

    console.log('📢 Creating announcement:', {
      type,
      title: title.trim(),
      hasBody: !!body.trim(),
      recipientIds,
      recipientNames
    })

    let announcement
    try {
      announcement = await (prisma as any).announcement.create({
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

      console.log('✅ Announcement created successfully:', announcement.id)

      return NextResponse.json({
        success: true,
        announcement: {
          id: announcement.id,
          type: announcement.type,
          title: announcement.title,
          createdAt: announcement.createdAt.toISOString()
        }
      })
    } catch (dbError: any) {
      console.error('❌ Error creating announcement in database:', dbError)
      return NextResponse.json(
        { 
          error: 'خطا در ذخیره اطلاعیه در دیتابیس: ' + (dbError.message || 'خطای ناشناخته')
        },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('❌ Error in POST announcement:', error)
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      meta: error.meta
    })

    // This catch block should not be reached if database operations are wrapped in inner try-catch
    return NextResponse.json(
      { 
        error: error.message || 'خطا در ایجاد اطلاعیه'
      },
      { status: 500 }
    )
  }
}

