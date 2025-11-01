import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json({
        success: true,
        performances: [],
        warning: 'Prisma client is not initialized'
      })
    }

    if (!('marketerPerformance' in prisma)) {
      const availableModels = Object.keys(prisma).filter(key => !key.startsWith('$') && typeof prisma[key as keyof typeof prisma] === 'object')
      return NextResponse.json({
        success: true,
        performances: [],
        warning: `مدل MarketerPerformance در Prisma Client وجود ندارد. لطفاً npx prisma generate اجرا کنید.`
      })
    }

    const { searchParams } = new URL(request.url)
    const marketerId = searchParams.get('marketerId')
    const period = searchParams.get('period')

    let where: any = {}
    if (marketerId) where.marketerId = marketerId
    if (period) where.period = period

    const performances = await (prisma as any).marketerPerformance.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      performances: performances.map((p: any) => ({
        id: p.id,
        marketerId: p.marketerId,
        marketerName: p.marketerName,
        period: p.period,
        salesCount: p.salesCount,
        salesAmount: p.salesAmount,
        newClients: p.newClients,
        campaignsCount: p.campaignsCount,
        conversionRate: p.conversionRate,
        notes: p.notes,
        createdAt: p.createdAt.toISOString()
      }))
    })
  } catch (error: any) {
    console.error('❌ Error fetching performances:', error)
    return NextResponse.json({
      success: true,
      performances: []
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      marketerId,
      marketerName,
      period,
      salesCount,
      salesAmount,
      newClients,
      campaignsCount,
      conversionRate,
      notes
    } = body

    if (!marketerName) {
      return NextResponse.json(
        { error: 'نام بازاریاب الزامی است' },
        { status: 400 }
      )
    }

    if (!prisma) {
      return NextResponse.json(
        { error: 'Prisma client is not initialized' },
        { status: 500 }
      )
    }

    if (!('marketerPerformance' in prisma)) {
      const availableModels = Object.keys(prisma).filter(key => !key.startsWith('$') && typeof prisma[key as keyof typeof prisma] === 'object')
      return NextResponse.json(
        {
          error: `مدل MarketerPerformance در Prisma Client وجود ندارد.\n\nلطفاً:\n1. سرور را متوقف کنید (Ctrl+C)\n2. npx prisma generate اجرا کنید\n3. npx prisma db push اجرا کنید\n4. سرور را restart کنید`
        },
        { status: 500 }
      )
    }

    const performance = await (prisma as any).marketerPerformance.create({
      data: {
        marketerId: marketerId || null,
        marketerName: marketerName.trim(),
        period: period || null,
        salesCount: salesCount ? parseInt(salesCount) : 0,
        salesAmount: salesAmount ? parseInt(salesAmount) : 0,
        newClients: newClients ? parseInt(newClients) : 0,
        campaignsCount: campaignsCount ? parseInt(campaignsCount) : 0,
        conversionRate: conversionRate ? parseFloat(conversionRate) : null,
        notes: notes || null
      }
    })

    return NextResponse.json({
      success: true,
      performance: {
        id: performance.id,
        marketerName: performance.marketerName,
        createdAt: performance.createdAt.toISOString()
      }
    })
  } catch (error: any) {
    console.error('❌ Error creating performance:', error)
    return NextResponse.json(
      { error: error.message || 'خطا در ثبت عملکرد' },
      { status: 500 }
    )
  }
}

