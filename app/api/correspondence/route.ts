import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Check if Prisma client is available
    if (!prisma) {
      console.error('❌ Prisma client is not available')
      return NextResponse.json(
        { 
          success: true,
          correspondences: [],
          warning: 'Prisma client is not initialized. Please run: npx prisma generate'
        },
        { status: 200 }
      )
    }

    // Check if correspondence model exists
    if (!('correspondence' in prisma)) {
      console.error('❌ Correspondence model not found in Prisma')
      const availableModels = Object.keys(prisma).filter(key => !key.startsWith('$') && typeof prisma[key as keyof typeof prisma] === 'object')
      return NextResponse.json(
        { 
          success: true,
          correspondences: [],
          warning: `مدل Correspondence در Prisma Client وجود ندارد. مدل‌های موجود: ${availableModels.join(', ') || 'هیچ مدلی یافت نشد'}. لطفاً npx prisma generate اجرا کنید.`
        },
        { status: 200 }
      )
    }

    const correspondences = await (prisma as any).correspondence.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      correspondences: correspondences.map((corr: any) => ({
        id: corr.id,
        title: corr.title,
        fileName: corr.fileName,
        fileType: corr.fileType,
        fileSize: corr.fileSize,
        fileDataUrl: corr.fileDataUrl,
        senderId: corr.senderId,
        senderName: corr.senderName,
        recipientId: corr.recipientId,
        recipientName: corr.recipientName,
        message: corr.message,
        createdAt: corr.createdAt.toISOString(),
        updatedAt: corr.updatedAt.toISOString()
      }))
    })

  } catch (error: any) {
    console.error('❌ Error fetching correspondences:', error)
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      meta: error.meta
    })

    // Check for table not found
    if (error.code === 'P2021' || error.message?.includes('Table') || error.message?.includes('does not exist')) {
      return NextResponse.json(
        { 
          success: true,
          correspondences: [],
          warning: 'جدول مکاتبات در دیتابیس وجود ندارد. لطفاً migration انجام دهید: npx prisma db push'
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { error: 'خطا در دریافت مکاتبات' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      fileName,
      fileType,
      fileSize,
      fileDataUrl,
      senderId,
      senderName,
      recipientId,
      recipientName,
      message
    } = body

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'عنوان فایل الزامی است' },
        { status: 400 }
      )
    }

    if (!senderName || !senderName.trim()) {
      return NextResponse.json(
        { error: 'نام فرستنده الزامی است' },
        { status: 400 }
      )
    }

    // Check if Prisma client is available
    if (!prisma) {
      console.error('❌ Prisma client is not available')
      return NextResponse.json(
        { error: 'Prisma client is not initialized. Please run: npx prisma generate' },
        { status: 500 }
      )
    }

    // Check if correspondence model exists
    if (!('correspondence' in prisma)) {
      console.error('❌ Correspondence model not found in Prisma')
      const availableModels = Object.keys(prisma).filter(key => !key.startsWith('$') && typeof prisma[key as keyof typeof prisma] === 'object')
      console.error('Available Prisma models:', availableModels)
      
      return NextResponse.json(
        { 
          error: `مدل Correspondence در Prisma Client وجود ندارد.\n\nمدل‌های موجود: ${availableModels.join(', ') || 'هیچ مدلی یافت نشد'}\n\nلطفاً:\n1. سرور را متوقف کنید (Ctrl+C)\n2. npx prisma generate اجرا کنید\n3. npx prisma db push اجرا کنید\n4. سرور را restart کنید (npm run dev)`
        },
        { status: 500 }
      )
    }

    const correspondence = await (prisma as any).correspondence.create({
      data: {
        title: title.trim(),
        fileName: fileName || null,
        fileType: fileType || null,
        fileSize: fileSize ? parseInt(fileSize) : null,
        fileDataUrl: fileDataUrl || null,
        senderId: senderId || null,
        senderName: senderName.trim(),
        recipientId: recipientId || null,
        recipientName: recipientName || null,
        message: message ? message.trim() : null
      }
    })

    console.log('✅ Correspondence created successfully:', correspondence.id)

    return NextResponse.json({
      success: true,
      correspondence: {
        id: correspondence.id,
        title: correspondence.title,
        senderName: correspondence.senderName,
        recipientName: correspondence.recipientName,
        createdAt: correspondence.createdAt.toISOString()
      }
    })

  } catch (error: any) {
    console.error('❌ Error creating correspondence:', error)
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      meta: error.meta,
      stack: error.stack
    })

    // Check for table not found
    if (error.code === 'P2021' || error.message?.includes('Table') || error.message?.includes('does not exist')) {
      return NextResponse.json(
        {
          error: 'جدول مکاتبات در دیتابیس وجود ندارد. لطفاً migration انجام دهید:\nnpx prisma db push'
        },
        { status: 500 }
      )
    }

    // Check if it's the "Cannot read properties of undefined" error
    if (error.message?.includes('Cannot read properties') || error.message?.includes('undefined') || error.message?.includes('correspondence model not found')) {
      const availableModels = Object.keys(prisma).filter(key => !key.startsWith('$') && typeof prisma[key as keyof typeof prisma] === 'object')
      console.error('Available Prisma models:', availableModels)

      return NextResponse.json(
        {
          error: `مدل Correspondence در Prisma Client وجود ندارد.\n\nمدل‌های موجود: ${availableModels.join(', ') || 'هیچ مدلی یافت نشد'}\n\nلطفاً:\n1. سرور را متوقف کنید (Ctrl+C)\n2. npx prisma generate اجرا کنید\n3. npx prisma db push اجرا کنید\n4. سرور را restart کنید (npm run dev)`
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        error: error.message || 'خطا در ایجاد مکاتبه'
      },
      { status: 500 }
    )
  }
}

