'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface Employee {
  id: string
  fullName: string
  education?: string
  birthDate?: string
  fatherName?: string
  nationalId?: string
  interviewDate?: string
  hireDate?: string
  phone?: string
  address?: string
  employeeNumber?: string
  photoDataUrl?: string
  maritalStatus?: string
  childrenCount: number
  religion?: string
  workType?: string
  salary?: number
  position?: string
  employeeRank?: string
  createdAt: string
}

export default function AdminEmployeeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchEmployee(params.id as string)
    }
  }, [params.id])

  const fetchEmployee = async (id: string) => {
    try {
      setError(null)
      const response = await fetch(`/api/employees/${id}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'خطا در دریافت اطلاعات کارمند' }))
        setError(errorData.error || 'خطا در دریافت اطلاعات کارمند')
        setIsLoading(false)
        return
      }

      const data = await response.json()
      if (data.success && data.employee) {
        setEmployee(data.employee)
      } else {
        setError('کارمند یافت نشد')
      }
    } catch (error: any) {
      console.error('Error fetching employee:', error)
      setError('خطا در اتصال به سرور')
    } finally {
      setIsLoading(false)
    }
  }

  const getWorkTypeText = (type?: string) => {
    switch (type) {
      case 'full-time': return 'تمام وقت'
      case 'part-time': return 'پاره وقت'
      default: return type || '—'
    }
  }

  const getMaritalStatusText = (status?: string) => {
    switch (status) {
      case 'single': return 'مجرد'
      case 'married': return 'متأهل'
      default: return status || '—'
    }
  }

  const formatDate = (date?: string) => {
    if (!date) return '—'
    try {
      const d = new Date(date)
      return d.toLocaleDateString('fa-IR')
    } catch {
      return date
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex overflow-hidden" dir="rtl">
      <aside className="w-64 bg-gray-900/80 border-l border-gray-800 p-4 flex flex-col gap-2">
        <div className="text-white font-bold text-lg mb-2">پنل مدیریت</div>
        <a href="/admin" className="px-3 py-2 rounded hover:bg-gray-800/60 text-gray-300 no-underline">داشبورد</a>
        <a href="/admin/projects" className="px-3 py-2 rounded hover:bg-gray-800/60 text-gray-300 no-underline">پروژه‌ها</a>
        <a href="/admin/employees" className="px-3 py-2 rounded hover:bg-gray-800/60 text-gray-300 no-underline">کارمندان</a>
        <a href="/admin/requests" className="px-3 py-2 rounded hover:bg-gray-800/60 text-gray-300 no-underline flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>درخواست‌ها</span>
        </a>
        <a href="/admin/correspondence" className="px-3 py-2 rounded hover:bg-gray-800/60 text-gray-300 no-underline flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span>مکاتبات</span>
        </a>
      </aside>
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  مشاهده اطلاعات کارمند
                </h1>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push(`/admin/employees/edit/${params.id}`)}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  ویرایش
                </button>
                <button
                  onClick={() => router.push('/admin/employees')}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300"
                >
                  بازگشت
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-400">در حال بارگذاری...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="mb-4 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300">
                {error}
              </div>
              <button
                onClick={() => router.push('/admin/employees')}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                بازگشت به لیست
              </button>
            </div>
          ) : employee ? (
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
                {/* Photo and Basic Info */}
                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-800">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    {employee.photoDataUrl ? (
                      <img src={employee.photoDataUrl} alt={employee.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-4xl font-bold">
                        {employee.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-white mb-2">{employee.fullName}</h2>
                    {employee.position && (
                      <p className="text-xl text-gray-300 mb-2">{employee.position}</p>
                    )}
                    {employee.employeeNumber && (
                      <p className="text-gray-400">شماره استخدامی: {employee.employeeNumber}</p>
                    )}
                    {employee.employeeRank && (
                      <p className="text-gray-400">رتبه: {employee.employeeRank}</p>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Info */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white mb-4 border-b border-gray-800 pb-2">اطلاعات شخصی</h3>
                    
                    <div>
                      <label className="text-gray-400 text-sm">نام پدر</label>
                      <p className="text-white">{employee.fatherName || '—'}</p>
                    </div>
                    
                    <div>
                      <label className="text-gray-400 text-sm">کد ملی</label>
                      <p className="text-white">{employee.nationalId || '—'}</p>
                    </div>
                    
                    <div>
                      <label className="text-gray-400 text-sm">تاریخ تولد</label>
                      <p className="text-white">{formatDate(employee.birthDate)}</p>
                    </div>
                    
                    <div>
                      <label className="text-gray-400 text-sm">وضعیت تاهل</label>
                      <p className="text-white">
                        {getMaritalStatusText(employee.maritalStatus)}
                        {employee.maritalStatus === 'married' && employee.childrenCount > 0 && ` (${employee.childrenCount} فرزند)`}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-gray-400 text-sm">دین / مذهب</label>
                      <p className="text-white">{employee.religion || '—'}</p>
                    </div>
                  </div>

                  {/* Work Info */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white mb-4 border-b border-gray-800 pb-2">اطلاعات شغلی</h3>
                    
                    <div>
                      <label className="text-gray-400 text-sm">سمت</label>
                      <p className="text-white">{employee.position || '—'}</p>
                    </div>
                    
                    <div>
                      <label className="text-gray-400 text-sm">نحوه همکاری</label>
                      <p className="text-white">{getWorkTypeText(employee.workType)}</p>
                    </div>
                    
                    <div>
                      <label className="text-gray-400 text-sm">میزان تحصیلات</label>
                      <p className="text-white">{employee.education || '—'}</p>
                    </div>
                    
                    <div>
                      <label className="text-gray-400 text-sm">تاریخ مصاحبه</label>
                      <p className="text-white">{formatDate(employee.interviewDate)}</p>
                    </div>
                    
                    <div>
                      <label className="text-gray-400 text-sm">تاریخ استخدام</label>
                      <p className="text-white">{formatDate(employee.hireDate)}</p>
                    </div>
                    
                    <div>
                      <label className="text-gray-400 text-sm">حقوق دریافتی</label>
                      <p className="text-white">{employee.salary ? `${employee.salary.toLocaleString()} تومان` : '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mt-8 pt-8 border-t border-gray-800">
                  <h3 className="text-xl font-semibold text-white mb-4">اطلاعات تماس</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-400 text-sm">شماره تماس</label>
                      <p className="text-white">{employee.phone || '—'}</p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">آدرس</label>
                      <p className="text-white">{employee.address || '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="mt-6 pt-6 border-t border-gray-800 text-sm text-gray-400">
                  <p>تاریخ ایجاد: {formatDate(employee.createdAt)}</p>
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  )
}

