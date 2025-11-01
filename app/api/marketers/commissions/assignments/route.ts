import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    if (!prisma || !('commissionAssignment' in prisma)) {
      return NextResponse.json({
        success: true,
        assignments: []
      })
    }

    const { searchParams } = new URL(request.url)
    const marketerId = searchParams.get('marketerId')
    const commissionTypeId = searchParams.get('commissionTypeId')
    const isActive = searchParams.get('isActive')

    let where: any = {}
    if (marketerId) where.marketerId = marketerId
    if (commissionTypeId) where.commissionTypeId = commissionTypeId
    if (isActive === 'true') where.isActive = true

    const assignments = await (prisma as any).commissionAssignment.findMany({
      where,
      include: {
        commissionType: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      assignments: assignments.map((a: any) => ({
        id: a.id,
        commissionTypeId: a.commissionTypeId,
        commissionTypeName: a.commissionType?.name,
        marketerId: a.marketerId,
        marketerName: a.marketerName,
        factor: a.factor,
        factorValue: a.factorValue,
        additionalRate: a.additionalRate,
        isActive: a.isActive,
        createdAt: a.createdAt.toISOString()
      }))
    })
  } catch (error: any) {
    console.error('❌ Error fetching assignments:', error)
    return NextResponse.json({
      success: true,
      assignments: []
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      commissionTypeId,
      marketerId,
      marketerName,
      factor,
      factorValue,
      additionalRate,
      isActive
    } = body

    if (!commissionTypeId || !marketerName) {
      return NextResponse.json(
        { error: 'نوع پورسانت و نام بازاریاب الزامی است' },
        { status: 400 }
      )
    }

    if (!prisma || !('commissionAssignment' in prisma)) {
      return NextResponse.json(
        {
          error: `مدل CommissionAssignment در Prisma Client وجود ندارد.\n\nلطفاً:\n1. سرور را متوقف کنید (Ctrl+C)\n2. npx prisma generate اجرا کنید\n3. npx prisma db push اجرا کنید\n4. سرور را restart کنید`
        },
        { status: 500 }
      )
    }

    const assignment = await (prisma as any).commissionAssignment.create({
      data: {
        commissionTypeId,
        marketerId: marketerId || null,
        marketerName: marketerName.trim(),
        factor: factor || null,
        factorValue: factorValue || null,
        additionalRate: additionalRate ? parseFloat(additionalRate) : 0,
        isActive: isActive !== undefined ? isActive : true
      }
    })

    return NextResponse.json({
      success: true,
      assignment: {
        id: assignment.id,
        marketerName: assignment.marketerName,
        createdAt: assignment.createdAt.toISOString()
      }
    })
  } catch (error: any) {
    console.error('❌ Error creating assignment:', error)
    return NextResponse.json(
      { error: error.message || 'خطا در ثبت تخصیص' },
      { status: 500 }
    )
  }
}

