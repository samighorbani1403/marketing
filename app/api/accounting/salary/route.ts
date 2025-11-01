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
          payments: [],
          warning: 'Prisma client is not initialized. Please run: npx prisma generate'
        },
        { status: 200 }
      )
    }

    // Check if salaryPayment model exists
    if (!('salaryPayment' in prisma)) {
      console.error('❌ SalaryPayment model not found in Prisma')
      const availableModels = Object.keys(prisma).filter(key => !key.startsWith('$') && typeof prisma[key as keyof typeof prisma] === 'object')
      return NextResponse.json(
        { 
          success: true,
          payments: [],
          warning: `مدل SalaryPayment در Prisma Client وجود ندارد. مدل‌های موجود: ${availableModels.join(', ') || 'هیچ مدلی یافت نشد'}. لطفاً npx prisma generate اجرا کنید.`
        },
        { status: 200 }
      )
    }

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const month = searchParams.get('month')
    const period = searchParams.get('period')

    let where: any = {}

    if (employeeId) {
      where.employeeId = employeeId
    }
    if (month) {
      where.month = month
    }
    if (period) {
      where.paymentPeriod = period
    }

    const payments = await (prisma as any).salaryPayment.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      payments: payments.map((p: any) => ({
        id: p.id,
        employeeId: p.employeeId,
        employeeName: p.employeeName,
        paymentPeriod: p.paymentPeriod,
        month: p.month,
        paymentDate: p.paymentDate.toISOString(),
        deductions: p.deductions,
        leaveDays: p.leaveDays,
        employeeRank: p.employeeRank,
        amount: p.amount,
        createdAt: p.createdAt.toISOString()
      }))
    })

  } catch (error: any) {
    console.error('❌ Error fetching salary payments:', error)
    
    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      return NextResponse.json({
        success: true,
        payments: []
      })
    }

    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات حقوق' },
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
      paymentPeriod,
      month,
      paymentDate,
      deductions,
      leaveDays,
      employeeRank,
      amount
    } = body

    if (!employeeName || !paymentPeriod || !amount) {
      return NextResponse.json(
        { error: 'نام کارمند، دوره پرداخت و مبلغ الزامی است' },
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

    // Check if salaryPayment model exists
    if (!('salaryPayment' in prisma)) {
      console.error('❌ SalaryPayment model not found in Prisma')
      const availableModels = Object.keys(prisma).filter(key => !key.startsWith('$') && typeof prisma[key as keyof typeof prisma] === 'object')
      console.error('Available Prisma models:', availableModels)
      
      return NextResponse.json(
        { 
          error: `مدل SalaryPayment در Prisma Client وجود ندارد.\n\nمدل‌های موجود: ${availableModels.join(', ') || 'هیچ مدلی یافت نشد'}\n\nلطفاً:\n1. سرور را متوقف کنید (Ctrl+C)\n2. npx prisma generate اجرا کنید\n3. npx prisma db push اجرا کنید\n4. سرور را restart کنید (npm run dev)`
        },
        { status: 500 }
      )
    }

    const payment = await (prisma as any).salaryPayment.create({
      data: {
        employeeId: employeeId || null,
        employeeName: employeeName.trim(),
        paymentPeriod,
        month: month || null,
        paymentDate: new Date(paymentDate),
        deductions: deductions ? parseInt(deductions) : 0,
        leaveDays: leaveDays ? parseInt(leaveDays) : 0,
        employeeRank: employeeRank || null,
        amount: parseInt(amount)
      }
    })

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        employeeName: payment.employeeName,
        amount: payment.amount,
        createdAt: payment.createdAt.toISOString()
      }
    })

  } catch (error: any) {
    console.error('❌ Error creating salary payment:', error)
    
    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      return NextResponse.json(
        {
          error: 'جدول حقوق در دیتابیس وجود ندارد. لطفاً migration انجام دهید:\nnpx prisma db push'
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'خطا در ثبت حقوق' },
      { status: 500 }
    )
  }
}

