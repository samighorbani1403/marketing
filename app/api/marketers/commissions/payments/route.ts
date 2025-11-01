import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    if (!prisma || !('commissionPayment' in prisma)) {
      return NextResponse.json({
        success: true,
        payments: []
      })
    }

    const { searchParams } = new URL(request.url)
    const marketerId = searchParams.get('marketerId')
    const period = searchParams.get('period')
    const status = searchParams.get('status')
    const commissionTypeId = searchParams.get('commissionTypeId')

    let where: any = {}
    if (marketerId) where.marketerId = marketerId
    if (period) where.period = period
    if (status) where.paymentStatus = status
    if (commissionTypeId) where.commissionTypeId = commissionTypeId

    const payments = await (prisma as any).commissionPayment.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      payments: payments.map((p: any) => ({
        id: p.id,
        marketerId: p.marketerId,
        marketerName: p.marketerName,
        commissionTypeId: p.commissionTypeId,
        invoiceId: p.invoiceId,
        invoiceAmount: p.invoiceAmount,
        commissionAmount: p.commissionAmount,
        commissionRate: p.commissionRate,
        period: p.period,
        paymentDate: p.paymentDate?.toISOString() || null,
        paymentStatus: p.paymentStatus,
        notes: p.notes,
        createdAt: p.createdAt.toISOString()
      }))
    })
  } catch (error: any) {
    console.error('❌ Error fetching payments:', error)
    return NextResponse.json({
      success: true,
      payments: []
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      marketerId,
      marketerName,
      commissionTypeId,
      invoiceId,
      invoiceAmount,
      commissionAmount,
      commissionRate,
      period,
      paymentDate,
      paymentStatus,
      notes
    } = body

    if (!marketerName || !commissionAmount) {
      return NextResponse.json(
        { error: 'نام بازاریاب و مبلغ پورسانت الزامی است' },
        { status: 400 }
      )
    }

    if (!prisma || !('commissionPayment' in prisma)) {
      return NextResponse.json(
        {
          error: `مدل CommissionPayment در Prisma Client وجود ندارد.\n\nلطفاً:\n1. سرور را متوقف کنید (Ctrl+C)\n2. npx prisma generate اجرا کنید\n3. npx prisma db push اجرا کنید\n4. سرور را restart کنید`
        },
        { status: 500 }
      )
    }

    const payment = await (prisma as any).commissionPayment.create({
      data: {
        marketerId: marketerId || null,
        marketerName: marketerName.trim(),
        commissionTypeId: commissionTypeId || null,
        invoiceId: invoiceId || null,
        invoiceAmount: invoiceAmount ? parseInt(invoiceAmount) : null,
        commissionAmount: parseInt(commissionAmount),
        commissionRate: commissionRate ? parseFloat(commissionRate) : null,
        period: period || null,
        paymentDate: paymentDate ? new Date(paymentDate) : null,
        paymentStatus: paymentStatus || 'pending',
        notes: notes || null
      }
    })

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        marketerName: payment.marketerName,
        commissionAmount: payment.commissionAmount,
        createdAt: payment.createdAt.toISOString()
      }
    })
  } catch (error: any) {
    console.error('❌ Error creating payment:', error)
    return NextResponse.json(
      { error: error.message || 'خطا در ثبت پورسانت' },
      { status: 500 }
    )
  }
}

