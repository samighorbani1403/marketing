import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = params.id

    const req = await prisma.request.findUnique({
      where: { id: requestId }
    })

    if (!req) {
      return NextResponse.json(
        { error: 'درخواست یافت نشد' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      request: {
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
      }
    })

  } catch (error: any) {
    console.error('❌ Error fetching request:', error)
    return NextResponse.json(
      { error: 'خطا در دریافت درخواست' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = params.id
    const body = await request.json()
    const { status, managerResponse, respondedBy } = body

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'وضعیت نامعتبر است' },
        { status: 400 }
      )
    }

    const updateData: any = {
      status,
      managerResponseDate: new Date()
    }

    if (managerResponse) {
      updateData.managerResponse = managerResponse
    }

    if (respondedBy) {
      updateData.respondedBy = respondedBy
    }

    const req = await prisma.request.update({
      where: { id: requestId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      request: {
        id: req.id,
        status: req.status,
        managerResponse: req.managerResponse,
        managerResponseDate: req.managerResponseDate?.toISOString()
      }
    })

  } catch (error: any) {
    console.error('❌ Error updating request:', error)
    return NextResponse.json(
      { error: 'خطا در به‌روزرسانی درخواست' },
      { status: 500 }
    )
  }
}

