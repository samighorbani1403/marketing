import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Check if Prisma client is available
    if (!prisma) {
      return NextResponse.json({
        success: true,
        bills: [],
        warning: 'Prisma client is not initialized'
      })
    }

    // Check if companyBill model exists
    if (!('companyBill' in prisma)) {
      const availableModels = Object.keys(prisma).filter(key => !key.startsWith('$') && typeof prisma[key as keyof typeof prisma] === 'object')
      return NextResponse.json({
        success: true,
        bills: [],
        warning: `مدل CompanyBill در Prisma Client وجود ندارد. لطفاً npx prisma generate اجرا کنید.`
      })
    }

    const { searchParams } = new URL(request.url)
    const billType = searchParams.get('billType')
    const month = searchParams.get('month')

    let where: any = {}

    if (billType) {
      where.billType = billType
    }
    if (month) {
      where.period = month
    }

    const bills = await (prisma as any).companyBill.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      bills: bills.map((b: any) => ({
        id: b.id,
        billType: b.billType,
        period: b.period,
        startDate: b.startDate?.toISOString() || null,
        endDate: b.endDate?.toISOString() || null,
        paymentDate: b.paymentDate.toISOString(),
        amount: b.amount,
        createdAt: b.createdAt.toISOString()
      }))
    })

  } catch (error: any) {
    console.error('❌ Error fetching bills:', error)
    
    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      return NextResponse.json({
        success: true,
        bills: []
      })
    }

    return NextResponse.json(
      { error: 'خطا در دریافت قبوض' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      billType,
      period,
      startDate,
      endDate,
      paymentDate,
      amount
    } = body

    if (!billType || !amount) {
      return NextResponse.json(
        { error: 'نوع قبض و مبلغ الزامی است' },
        { status: 400 }
      )
    }

    // Check if Prisma client is available
    if (!prisma) {
      return NextResponse.json(
        { error: 'Prisma client is not initialized. Please run: npx prisma generate' },
        { status: 500 }
      )
    }

    // Check if companyBill model exists
    if (!('companyBill' in prisma)) {
      const availableModels = Object.keys(prisma).filter(key => !key.startsWith('$') && typeof prisma[key as keyof typeof prisma] === 'object')
      return NextResponse.json(
        { 
          error: `مدل CompanyBill در Prisma Client وجود ندارد.\n\nمدل‌های موجود: ${availableModels.join(', ') || 'هیچ مدلی یافت نشد'}\n\nلطفاً:\n1. سرور را متوقف کنید (Ctrl+C)\n2. npx prisma generate اجرا کنید\n3. npx prisma db push اجرا کنید\n4. سرور را restart کنید`
        },
        { status: 500 }
      )
    }

    const bill = await (prisma as any).companyBill.create({
      data: {
        billType,
        period: period || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        paymentDate: new Date(paymentDate),
        amount: parseInt(amount)
      }
    })

    return NextResponse.json({
      success: true,
      bill: {
        id: bill.id,
        billType: bill.billType,
        amount: bill.amount,
        createdAt: bill.createdAt.toISOString()
      }
    })

  } catch (error: any) {
    console.error('❌ Error creating bill:', error)
    
    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      return NextResponse.json(
        {
          error: 'جدول قبوض در دیتابیس وجود ندارد. لطفاً migration انجام دهید:\nnpx prisma db push'
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'خطا در ثبت قبض' },
      { status: 500 }
    )
  }
}

