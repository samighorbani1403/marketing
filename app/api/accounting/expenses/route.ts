import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Check if Prisma client is available
    if (!prisma) {
      return NextResponse.json({
        success: true,
        expenses: [],
        warning: 'Prisma client is not initialized'
      })
    }

    // Check if monthlyExpense model exists
    if (!('monthlyExpense' in prisma)) {
      const availableModels = Object.keys(prisma).filter(key => !key.startsWith('$') && typeof prisma[key as keyof typeof prisma] === 'object')
      return NextResponse.json({
        success: true,
        expenses: [],
        warning: `مدل MonthlyExpense در Prisma Client وجود ندارد. لطفاً npx prisma generate اجرا کنید.`
      })
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    let where: any = {}

    if (month && year) {
      const startDate = new Date(`${year}-${month}-01`)
      const endDate = new Date(parseInt(year), parseInt(month), 0)
      where.expenseDate = {
        gte: startDate,
        lte: endDate
      }
    }

    const expenses = await (prisma as any).monthlyExpense.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      expenses: expenses.map((e: any) => ({
        id: e.id,
        title: e.title,
        expenseDate: e.expenseDate.toISOString(),
        amount: e.amount,
        paidBy: e.paidBy,
        createdAt: e.createdAt.toISOString()
      }))
    })

  } catch (error: any) {
    console.error('❌ Error fetching expenses:', error)
    
    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      return NextResponse.json({
        success: true,
        expenses: []
      })
    }

    return NextResponse.json(
      { error: 'خطا در دریافت هزینه‌ها' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      expenseDate,
      amount,
      paidBy
    } = body

    if (!title || !expenseDate || !amount) {
      return NextResponse.json(
        { error: 'عنوان، تاریخ و مبلغ هزینه الزامی است' },
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

    // Check if monthlyExpense model exists
    if (!('monthlyExpense' in prisma)) {
      const availableModels = Object.keys(prisma).filter(key => !key.startsWith('$') && typeof prisma[key as keyof typeof prisma] === 'object')
      return NextResponse.json(
        { 
          error: `مدل MonthlyExpense در Prisma Client وجود ندارد.\n\nمدل‌های موجود: ${availableModels.join(', ') || 'هیچ مدلی یافت نشد'}\n\nلطفاً:\n1. سرور را متوقف کنید (Ctrl+C)\n2. npx prisma generate اجرا کنید\n3. npx prisma db push اجرا کنید\n4. سرور را restart کنید`
        },
        { status: 500 }
      )
    }

    const expense = await (prisma as any).monthlyExpense.create({
      data: {
        title: title.trim(),
        expenseDate: new Date(expenseDate),
        amount: parseInt(amount),
        paidBy: paidBy || null
      }
    })

    return NextResponse.json({
      success: true,
      expense: {
        id: expense.id,
        title: expense.title,
        amount: expense.amount,
        createdAt: expense.createdAt.toISOString()
      }
    })

  } catch (error: any) {
    console.error('❌ Error creating expense:', error)
    
    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      return NextResponse.json(
        {
          error: 'جدول هزینه‌ها در دیتابیس وجود ندارد. لطفاً migration انجام دهید:\nnpx prisma db push'
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'خطا در ثبت هزینه' },
      { status: 500 }
    )
  }
}

