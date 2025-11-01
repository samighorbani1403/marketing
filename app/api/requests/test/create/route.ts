import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const testRequests = [
      // Leave requests - pending
      {
        type: 'leave',
        employeeName: 'علی احمدی',
        employeePosition: 'بازاریاب',
        leaveStartDate: new Date('2024-12-20'),
        leaveEndDate: new Date('2024-12-22'),
        leaveDays: 3,
        leaveReason: 'مسافرت شخصی با خانواده',
        leaveType: 'annual',
        status: 'pending'
      },
      {
        type: 'leave',
        employeeName: 'مریم رضایی',
        employeePosition: 'مدیر فروش',
        leaveStartDate: new Date('2024-12-25'),
        leaveEndDate: new Date('2024-12-25'),
        leaveDays: 1,
        leaveReason: 'مراسم عروسی',
        leaveType: 'annual',
        status: 'pending'
      },
      {
        type: 'leave',
        employeeName: 'محمد رضوی',
        employeePosition: 'طراح',
        leaveStartDate: new Date('2024-12-23'),
        leaveEndDate: new Date('2024-12-24'),
        leaveDays: 2,
        leaveReason: 'استراحت',
        leaveType: 'annual',
        status: 'pending'
      },
      {
        type: 'leave',
        employeeName: 'سارا نوری',
        employeePosition: 'مدیر بازاریابی',
        leaveStartDate: new Date('2024-12-26'),
        leaveEndDate: new Date('2024-12-27'),
        leaveDays: 2,
        leaveReason: 'سفر کاری',
        leaveType: 'annual',
        status: 'pending'
      },
      // Leave requests - approved
      {
        type: 'leave',
        employeeName: 'حسن کریمی',
        employeePosition: 'بازاریاب',
        leaveStartDate: new Date('2024-12-15'),
        leaveEndDate: new Date('2024-12-17'),
        leaveDays: 3,
        leaveReason: 'استراحت',
        leaveType: 'annual',
        status: 'approved',
        managerResponse: 'درخواست شما تایید شد. لطفاً قبل از شروع مرخصی کارهای خود را تحویل دهید.',
        respondedBy: 'مدیر سیستم'
      },
      {
        type: 'leave',
        employeeName: 'امیر حسینی',
        employeePosition: 'برنامه‌نویس',
        leaveStartDate: new Date('2024-12-10'),
        leaveEndDate: new Date('2024-12-10'),
        leaveDays: 1,
        leaveReason: 'روز تولد',
        leaveType: 'annual',
        status: 'approved',
        managerResponse: 'تایید شد. تولدت مبارک!',
        respondedBy: 'مدیر سیستم'
      },
      // Leave requests - rejected
      {
        type: 'leave',
        employeeName: 'فاطمه محمدی',
        employeePosition: 'منشی',
        leaveStartDate: new Date('2024-12-18'),
        leaveEndDate: new Date('2024-12-18'),
        leaveDays: 1,
        leaveReason: 'مراجعه به پزشک',
        leaveType: 'sick',
        status: 'rejected',
        managerResponse: 'متأسفانه به دلیل کمبود نیرو نمی‌توانم درخواست شما را تایید کنم. لطفاً تاریخ دیگری را انتخاب کنید.',
        respondedBy: 'مدیر سیستم'
      },
      {
        type: 'leave',
        employeeName: 'رضا عباسی',
        employeePosition: 'حسابدار',
        leaveStartDate: new Date('2024-12-28'),
        leaveEndDate: new Date('2024-12-30'),
        leaveDays: 3,
        leaveReason: 'مسافرت',
        leaveType: 'annual',
        status: 'rejected',
        managerResponse: 'درخواست شما به دلیل همزمانی با تعطیلات رد شد.',
        respondedBy: 'مدیر سیستم'
      },
      // Reference requests - pending
      {
        type: 'reference',
        employeeName: 'علی احمدی',
        employeePosition: 'بازاریاب',
        referencePurpose: 'اخذ وام مسکن',
        referenceText: 'کارمند ما آقای علی احمدی از تاریخ 1400/01/15 در این شرکت مشغول به کار است و اکنون درخواست معرفی نامه برای دریافت وام مسکن دارد.',
        status: 'pending'
      },
      {
        type: 'reference',
        employeeName: 'سارا نوری',
        employeePosition: 'مدیر بازاریابی',
        referencePurpose: 'ثبت شرکت',
        referenceText: 'خانم سارا نوری برای ثبت شرکت شخصی خود نیاز به معرفی نامه دارد.',
        status: 'pending'
      },
      {
        type: 'reference',
        employeeName: 'محمد رضوی',
        employeePosition: 'طراح',
        referencePurpose: 'دریافت گواهی کار',
        referenceText: 'آقای محمد رضوی درخواست معرفی نامه برای دریافت گواهی کار دارد.',
        status: 'pending'
      },
      // Reference requests - approved
      {
        type: 'reference',
        employeeName: 'مریم رضایی',
        employeePosition: 'مدیر فروش',
        referencePurpose: 'دریافت گواهی کار',
        referenceText: 'خانم مریم رضایی از تاریخ 1399/06/01 در سمت مدیر فروش در شرکت ما مشغول به کار است و در حال حاضر درخواست گواهی کار دارد.',
        status: 'approved',
        managerResponse: 'معرفی نامه آماده و ارسال شد.',
        respondedBy: 'مدیر سیستم'
      },
      {
        type: 'reference',
        employeeName: 'امیر حسینی',
        employeePosition: 'برنامه‌نویس',
        referencePurpose: 'دریافت وام خودرو',
        referenceText: 'آقای امیر حسینی برای دریافت وام خودرو نیاز به معرفی نامه دارد.',
        status: 'approved',
        managerResponse: 'تایید شد و معرفی نامه ارسال شد.',
        respondedBy: 'مدیر سیستم'
      },
      // Reference requests - rejected
      {
        type: 'reference',
        employeeName: 'حسن کریمی',
        employeePosition: 'بازاریاب',
        referencePurpose: 'دریافت گذرنامه',
        referenceText: 'آقای حسن کریمی درخواست معرفی نامه برای دریافت گذرنامه دارد.',
        status: 'rejected',
        managerResponse: 'لطفاً ابتدا مدارک هویتی خود را کامل کنید.',
        respondedBy: 'مدیر سیستم'
      },
      {
        type: 'reference',
        employeeName: 'رضا عباسی',
        employeePosition: 'حسابدار',
        referencePurpose: 'دریافت ویزا',
        referenceText: 'آقای رضا عباسی برای دریافت ویزا نیاز به معرفی نامه دارد.',
        status: 'rejected',
        managerResponse: 'درخواست شما نیاز به تایید مدیریت دارد.',
        respondedBy: 'مدیر سیستم'
      }
    ]

    const created = []
    const errors = []

    for (const req of testRequests) {
      try {
        const request = await prisma.request.create({
          data: {
            type: req.type,
            employeeName: req.employeeName,
            employeePosition: req.employeePosition || null,
            leaveStartDate: req.leaveStartDate || null,
            leaveEndDate: req.leaveEndDate || null,
            leaveDays: req.leaveDays || null,
            leaveReason: req.leaveReason || null,
            leaveType: req.leaveType || null,
            referencePurpose: req.referencePurpose || null,
            referenceText: req.referenceText || null,
            status: req.status,
            managerResponse: req.managerResponse || null,
            managerResponseDate: req.managerResponse ? new Date() : null,
            respondedBy: req.respondedBy || null
          }
        })
        created.push({
          id: request.id,
          employeeName: request.employeeName,
          type: request.type,
          status: request.status
        })
      } catch (error: any) {
        errors.push({
          employeeName: req.employeeName,
          error: error.message,
          code: error.code
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `${created.length} درخواست ایجاد شد`,
      created,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error: any) {
    console.error('❌ Error creating test requests:', error)
    return NextResponse.json(
      { 
        error: 'خطا در ایجاد درخواست‌های تستی',
        details: error.message || 'خطای ناشناخته'
      },
      { status: 500 }
    )
  }
}

