import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    if (!prisma || !('commissionType' in prisma)) {
      return NextResponse.json({
        success: true,
        types: []
      })
    }

    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('isActive')

    let where: any = {}
    if (isActive === 'true') where.isActive = true

    const types = await (prisma as any).commissionType.findMany({
      where,
      include: {
        assignments: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      types: types.map((t: any) => ({
        id: t.id,
        name: t.name,
        productCategory: t.productCategory,
        productName: t.productName,
        commissionRate: t.commissionRate,
        commissionType: t.commissionType,
        fixedAmount: t.fixedAmount,
        minAmount: t.minAmount,
        maxAmount: t.maxAmount,
        isActive: t.isActive,
        assignmentsCount: t.assignments?.length || 0,
        createdAt: t.createdAt.toISOString()
      }))
    })
  } catch (error: any) {
    console.error('❌ Error fetching commission types:', error)
    return NextResponse.json({
      success: true,
      types: []
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      productCategory,
      productName,
      commissionRate,
      commissionType,
      fixedAmount,
      minAmount,
      maxAmount,
      isActive
    } = body

    if (!name || !commissionRate || !commissionType) {
      return NextResponse.json(
        { error: 'نام، نرخ و نوع پورسانت الزامی است' },
        { status: 400 }
      )
    }

    if (!prisma || !('commissionType' in prisma)) {
      return NextResponse.json(
        {
          error: `مدل CommissionType در Prisma Client وجود ندارد.\n\nلطفاً:\n1. سرور را متوقف کنید (Ctrl+C)\n2. npx prisma generate اجرا کنید\n3. npx prisma db push اجرا کنید\n4. سرور را restart کنید`
        },
        { status: 500 }
      )
    }

    const type = await (prisma as any).commissionType.create({
      data: {
        name: name.trim(),
        productCategory: productCategory || null,
        productName: productName || null,
        commissionRate: parseFloat(commissionRate),
        commissionType: commissionType,
        fixedAmount: fixedAmount ? parseInt(fixedAmount) : null,
        minAmount: minAmount ? parseInt(minAmount) : null,
        maxAmount: maxAmount ? parseInt(maxAmount) : null,
        isActive: isActive !== undefined ? isActive : true
      }
    })

    return NextResponse.json({
      success: true,
      type: {
        id: type.id,
        name: type.name,
        createdAt: type.createdAt.toISOString()
      }
    })
  } catch (error: any) {
    console.error('❌ Error creating commission type:', error)
    return NextResponse.json(
      { error: error.message || 'خطا در ثبت نوع پورسانت' },
      { status: 500 }
    )
  }
}

