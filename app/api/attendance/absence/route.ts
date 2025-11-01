import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    if (!prisma || !('absence' in prisma)) {
      return NextResponse.json({
        success: true,
        absences: []
      })
    }

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const month = searchParams.get('month') // Format: YYYY-MM
    const reason = searchParams.get('reason')

    let where: any = {}
    if (employeeId) where.employeeId = employeeId
    if (reason) where.reason = reason
    if (month) {
      const [year, monthNum] = month.split('-')
      where.date = {
        gte: new Date(parseInt(year), parseInt(monthNum) - 1, 1),
        lt: new Date(parseInt(year), parseInt(monthNum), 1)
      }
    }

    const absences = await (prisma as any).absence.findMany({
      where,
      orderBy: { date: 'desc' }
    })

    return NextResponse.json({
      success: true,
      absences: absences.map((a: any) => ({
        id: a.id,
        employeeId: a.employeeId,
        employeeName: a.employeeName,
        date: a.date.toISOString(),
        reason: a.reason,
        notes: a.notes,
        createdAt: a.createdAt.toISOString()
      }))
    })
  } catch (error: any) {
    console.error('❌ Error fetching absences:', error)
    return NextResponse.json({
      success: true,
      absences: []
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
      reason,
      notes
    } = body

    if (!employeeName || !date || !reason) {
      return NextResponse.json(
        { error: 'نام کارمند، تاریخ و دلیل غیبت الزامی است' },
        { status: 400 }
      )
    }

    if (!['justified', 'unjustified', 'medical'].includes(reason)) {
      return NextResponse.json(
        { error: 'دلیل غیبت باید یکی از موارد موجه، غیرموجه یا پزشکی باشد' },
        { status: 400 }
      )
    }

    if (!prisma || !('absence' in prisma)) {
      return NextResponse.json(
        {
          error: `مدل Absence در Prisma Client وجود ندارد.\n\nلطفاً:\n1. سرور را متوقف کنید (Ctrl+C)\n2. npx prisma generate اجرا کنید\n3. npx prisma db push اجرا کنید\n4. سرور را restart کنید`
        },
        { status: 500 }
      )
    }

    const absence = await (prisma as any).absence.create({
      data: {
        employeeId: employeeId || null,
        employeeName: employeeName.trim(),
        date: new Date(date),
        reason: reason,
        notes: notes || null
      }
    })

    return NextResponse.json({
      success: true,
      absence: {
        id: absence.id,
        employeeName: absence.employeeName,
        date: absence.date.toISOString(),
        reason: absence.reason,
        createdAt: absence.createdAt.toISOString()
      }
    })
  } catch (error: any) {
    console.error('❌ Error creating absence:', error)
    return NextResponse.json(
      { error: error.message || 'خطا در ثبت غیبت' },
      { status: 500 }
    )
  }
}

