import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const employeeId = searchParams.get('employeeId')
    const position = searchParams.get('position')

    const where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (type) {
      where.type = type
    }
    
    if (employeeId) {
      where.employeeId = employeeId
    }
    
    if (position) {
      where.employeePosition = position
    }

    const requests = await prisma.request.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      requests: requests.map(req => ({
        id: req.id,
        type: req.type,
        employeeId: req.employeeId,
        employeeName: req.employeeName,
        employeePosition: req.employeePosition,
        status: req.status,
        leaveStartDate: req.leaveStartDate ? req.leaveStartDate.toISOString() : null,
        leaveEndDate: req.leaveEndDate ? req.leaveEndDate.toISOString() : null,
        leaveDays: req.leaveDays,
        leaveReason: req.leaveReason,
        leaveType: req.leaveType,
        referencePurpose: req.referencePurpose,
        referenceText: req.referenceText,
        managerResponse: req.managerResponse,
        managerResponseDate: req.managerResponseDate ? req.managerResponseDate.toISOString() : null,
        respondedBy: req.respondedBy,
        createdAt: req.createdAt.toISOString(),
        updatedAt: req.updatedAt.toISOString()
      }))
    })

  } catch (error: any) {
    console.error('❌ Error fetching requests:', error)
    return NextResponse.json(
      { error: 'خطا در دریافت درخواست‌ها' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      type,
      employeeId,
      employeeName,
      employeePosition,
      leaveStartDate,
      leaveEndDate,
      leaveDays,
      leaveReason,
      leaveType,
      referencePurpose,
      referenceText
    } = body

    if (!type || !employeeName) {
      return NextResponse.json(
        { error: 'نوع درخواست و نام کارمند الزامی است' },
        { status: 400 }
      )
    }

    const request = await prisma.request.create({
      data: {
        type,
        employeeId: employeeId || null,
        employeeName,
        employeePosition: employeePosition || null,
        leaveStartDate: leaveStartDate ? new Date(leaveStartDate) : null,
        leaveEndDate: leaveEndDate ? new Date(leaveEndDate) : null,
        leaveDays: leaveDays ? parseInt(leaveDays) : null,
        leaveReason: leaveReason || null,
        leaveType: leaveType || null,
        referencePurpose: referencePurpose || null,
        referenceText: referenceText || null
      }
    })

    return NextResponse.json({
      success: true,
      request: {
        id: request.id,
        type: request.type,
        employeeName: request.employeeName,
        status: request.status,
        createdAt: request.createdAt.toISOString()
      }
    })

  } catch (error: any) {
    console.error('❌ Error creating request:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    })
    return NextResponse.json(
      { 
        error: 'خطا در ایجاد درخواست',
        details: error.message || 'خطای ناشناخته'
      },
      { status: 500 }
    )
  }
}
