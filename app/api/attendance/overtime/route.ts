import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    if (!prisma || !('overtime' in prisma)) {
      return NextResponse.json({
        success: true,
        overtimes: []
      })
    }

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const month = searchParams.get('month') // Format: YYYY-MM

    let where: any = {}
    if (employeeId) where.employeeId = employeeId
    if (month) {
      const [year, monthNum] = month.split('-')
      where.date = {
        gte: new Date(parseInt(year), parseInt(monthNum) - 1, 1),
        lt: new Date(parseInt(year), parseInt(monthNum), 1)
      }
    }

    const overtimes = await (prisma as any).overtime.findMany({
      where,
      orderBy: { date: 'desc' }
    })

    return NextResponse.json({
      success: true,
      overtimes: overtimes.map((o: any) => ({
        id: o.id,
        employeeId: o.employeeId,
        employeeName: o.employeeName,
        date: o.date.toISOString(),
        hours: o.hours,
        notes: o.notes,
        createdAt: o.createdAt.toISOString()
      }))
    })
  } catch (error: any) {
    console.error('❌ Error fetching overtimes:', error)
    return NextResponse.json({
      success: true,
      overtimes: []
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      employeeId,
      employeeName,
      date,
      hours,
      notes
    } = body

    if (!employeeName || !date || !hours) {
      return NextResponse.json(
        { error: 'نام کارمند، تاریخ و ساعت اضافه کاری الزامی است' },
        { status: 400 }
      )
    }

    if (!prisma || !('overtime' in prisma)) {
      return NextResponse.json(
        {
          error: `مدل Overtime در Prisma Client وجود ندارد.\n\nلطفاً:\n1. سرور را متوقف کنید (Ctrl+C)\n2. npx prisma generate اجرا کنید\n3. npx prisma db push اجرا کنید\n4. سرور را restart کنید`
        },
        { status: 500 }
      )
    }

    const overtime = await (prisma as any).overtime.create({
      data: {
        employeeId: employeeId || null,
        employeeName: employeeName.trim(),
        date: new Date(date),
        hours: parseFloat(hours),
        notes: notes || null
      }
    })

    return NextResponse.json({
      success: true,
      overtime: {
        id: overtime.id,
        employeeName: overtime.employeeName,
        date: overtime.date.toISOString(),
        hours: overtime.hours,
        createdAt: overtime.createdAt.toISOString()
      }
    })
  } catch (error: any) {
    console.error('❌ Error creating overtime:', error)
    return NextResponse.json(
      { error: error.message || 'خطا در ثبت اضافه کاری' },
      { status: 500 }
    )
  }
}

