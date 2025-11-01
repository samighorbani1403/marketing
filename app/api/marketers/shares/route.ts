import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    if (!prisma || !('marketerShare' in prisma)) {
      return NextResponse.json({
        success: true,
        shares: []
      })
    }

    const { searchParams } = new URL(request.url)
    const marketerId = searchParams.get('marketerId')
    const period = searchParams.get('period')
    const status = searchParams.get('status')

    let where: any = {}
    if (marketerId) where.marketerId = marketerId
    if (period) where.period = period
    if (status) where.paymentStatus = status

    const shares = await (prisma as any).marketerShare.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      shares: shares.map((s: any) => ({
        id: s.id,
        marketerId: s.marketerId,
        marketerName: s.marketerName,
        shareAmount: s.shareAmount,
        sharePercentage: s.sharePercentage,
        period: s.period,
        paymentDate: s.paymentDate.toISOString(),
        paymentStatus: s.paymentStatus,
        notes: s.notes,
        createdAt: s.createdAt.toISOString()
      }))
    })
  } catch (error: any) {
    console.error('❌ Error fetching shares:', error)
    return NextResponse.json({
      success: true,
      shares: []
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      marketerId,
      marketerName,
      shareAmount,
      sharePercentage,
      period,
      paymentDate,
      paymentStatus,
      notes
    } = body

    if (!marketerName || !shareAmount) {
      return NextResponse.json(
        { error: 'نام بازاریاب و مبلغ سهم الزامی است' },
        { status: 400 }
      )
    }

    if (!prisma || !('marketerShare' in prisma)) {
      return NextResponse.json(
        {
          error: `مدل MarketerShare در Prisma Client وجود ندارد.\n\nلطفاً:\n1. سرور را متوقف کنید (Ctrl+C)\n2. npx prisma generate اجرا کنید\n3. npx prisma db push اجرا کنید\n4. سرور را restart کنید`
        },
        { status: 500 }
      )
    }

    const share = await (prisma as any).marketerShare.create({
      data: {
        marketerId: marketerId || null,
        marketerName: marketerName.trim(),
        shareAmount: parseInt(shareAmount),
        sharePercentage: sharePercentage ? parseFloat(sharePercentage) : null,
        period: period || null,
        paymentDate: new Date(paymentDate),
        paymentStatus: paymentStatus || 'pending',
        notes: notes || null
      }
    })

    return NextResponse.json({
      success: true,
      share: {
        id: share.id,
        marketerName: share.marketerName,
        shareAmount: share.shareAmount,
        createdAt: share.createdAt.toISOString()
      }
    })
  } catch (error: any) {
    console.error('❌ Error creating share:', error)
    return NextResponse.json(
      { error: error.message || 'خطا در ثبت سهم' },
      { status: 500 }
    )
  }
}

