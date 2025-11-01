// Script to create test requests
const baseUrl = 'http://localhost:3001'

const testRequests = [
  // Leave requests
  {
    type: 'leave',
    employeeName: 'علی احمدی',
    employeePosition: 'بازاریاب',
    leaveStartDate: '2024-12-20',
    leaveEndDate: '2024-12-22',
    leaveDays: 3,
    leaveReason: 'مسافرت شخصی با خانواده',
    leaveType: 'annual'
  },
  {
    type: 'leave',
    employeeName: 'مریم رضایی',
    employeePosition: 'مدیر فروش',
    leaveStartDate: '2024-12-25',
    leaveEndDate: '2024-12-25',
    leaveDays: 1,
    leaveReason: 'مراسم عروسی',
    leaveType: 'annual'
  },
  {
    type: 'leave',
    employeeName: 'حسن کریمی',
    employeePosition: 'بازاریاب',
    leaveStartDate: '2024-12-15',
    leaveEndDate: '2024-12-17',
    leaveDays: 3,
    leaveReason: 'استراحت',
    leaveType: 'annual'
  },
  {
    type: 'leave',
    employeeName: 'فاطمه محمدی',
    employeePosition: 'منشی',
    leaveStartDate: '2024-12-18',
    leaveEndDate: '2024-12-18',
    leaveDays: 1,
    leaveReason: 'مراجعه به پزشک',
    leaveType: 'sick'
  },
  {
    type: 'leave',
    employeeName: 'محمد رضوی',
    employeePosition: 'طراح',
    leaveStartDate: '2024-12-23',
    leaveEndDate: '2024-12-24',
    leaveDays: 2,
    leaveReason: 'استراحت',
    leaveType: 'annual'
  },
  // Reference requests
  {
    type: 'reference',
    employeeName: 'علی احمدی',
    employeePosition: 'بازاریاب',
    referencePurpose: 'اخذ وام مسکن',
    referenceText: 'کارمند ما آقای علی احمدی از تاریخ 1400/01/15 در این شرکت مشغول به کار است و اکنون درخواست معرفی نامه برای دریافت وام مسکن دارد.'
  },
  {
    type: 'reference',
    employeeName: 'مریم رضایی',
    employeePosition: 'مدیر فروش',
    referencePurpose: 'دریافت گواهی کار',
    referenceText: 'خانم مریم رضایی از تاریخ 1399/06/01 در سمت مدیر فروش در شرکت ما مشغول به کار است و در حال حاضر درخواست گواهی کار دارد.'
  },
  {
    type: 'reference',
    employeeName: 'حسن کریمی',
    employeePosition: 'بازاریاب',
    referencePurpose: 'دریافت گذرنامه',
    referenceText: 'آقای حسن کریمی درخواست معرفی نامه برای دریافت گذرنامه دارد.'
  },
  {
    type: 'reference',
    employeeName: 'فاطمه محمدی',
    employeePosition: 'منشی',
    referencePurpose: 'ثبت شرکت',
    referenceText: 'خانم فاطمه محمدی برای ثبت شرکت شخصی خود نیاز به معرفی نامه دارد.'
  }
]

async function createRequests() {
  console.log('🚀 شروع ایجاد درخواست‌های تستی...\n')
  
  let successCount = 0
  let failCount = 0

  for (let i = 0; i < testRequests.length; i++) {
    const req = testRequests[i]
    try {
      const response = await fetch(`${baseUrl}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(req)
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        console.log(`✅ ${i + 1}. درخواست ${req.type === 'leave' ? 'مرخصی' : 'معرفی نامه'} برای ${req.employeeName} ایجاد شد`)
        successCount++
      } else {
        console.error(`❌ ${i + 1}. خطا در ایجاد درخواست برای ${req.employeeName}:`, data.error || 'خطای ناشناخته')
        failCount++
      }
    } catch (error) {
      console.error(`❌ ${i + 1}. خطا در اتصال برای ${req.employeeName}:`, error.message)
      failCount++
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  
  console.log(`\n✨ نتیجه: ${successCount} موفق، ${failCount} ناموفق`)
  console.log('💡 می‌توانید به http://localhost:3001/admin/requests مراجعه کنید.')
}

// Check if fetch is available
if (typeof fetch === 'undefined') {
  console.error('❌ این اسکریپت نیاز به Node.js 18+ دارد که از fetch پشتیبانی می‌کند.')
  process.exit(1)
}

createRequests().catch(console.error)

