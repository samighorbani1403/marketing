'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'

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

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Small delay to ensure page is mounted
    const timer = setTimeout(() => {
      fetchEmployees()
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const fetchEmployees = async () => {
    try {
      setError(null)
      const response = await fetch('/api/employees')
      
      if (!response.ok) {
        let errorMessage = 'خطا در دریافت کارمندان'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          // If response is not JSON, use default message
        }
        setError(errorMessage)
        setEmployees([])
        setIsLoading(false)
        return
      }

      const data = await response.json()
      
      // API returns { success: true, employees: [...] }
      if (data.success && Array.isArray(data.employees)) {
        setEmployees(data.employees)
        setError(null)
        setWarning(data.warning || null)
      } else if (Array.isArray(data.employees)) {
        // Fallback: some APIs return directly
        setEmployees(data.employees)
        setError(null)
        setWarning(null)
      } else {
        setEmployees([])
        setError('فرمت پاسخ نامعتبر است')
        setWarning(null)
      }
    } catch (error: any) {
      console.error('Error fetching employees:', error)
      setError(error?.message || 'خطا در اتصال به سرور. لطفاً مطمئن شوید که سرور در حال اجرا است.')
      setWarning(null)
      setEmployees([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleView = (id: string) => {
    router.push(`/admin/employees/${id}`)
  }

  const handleEdit = (id: string) => {
    router.push(`/admin/employees/edit/${id}`)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`آیا مطمئن هستید که می‌خواهید کارمند "${name}" را حذف کنید؟`)) {
      return
    }
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        alert('کارمند با موفقیت حذف شد')
        fetchEmployees()
      } else {
        const err = await res.json()
        alert(err.error || 'خطا در حذف کارمند')
      }
    } catch (error) {
      console.error('Error deleting employee:', error)
      alert('خطا در حذف کارمند')
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

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex overflow-hidden" dir="rtl">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  مدیریت کارمندان
                </h1>
                <p className="text-gray-400 mt-1">لیست و مدیریت اطلاعات کارمندان</p>
              </div>
              <a
                href="/admin/employees/new"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2 no-underline"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                ثبت کارمند جدید
              </a>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {warning && (
            <div className="mb-4 p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg text-yellow-300">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{warning}</span>
              </div>
            </div>
          )}
          {error && (
            <div className="mb-4 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
              <button 
                onClick={fetchEmployees}
                className="mt-3 px-4 py-2 bg-red-800 hover:bg-red-700 rounded text-sm transition-colors"
              >
                تلاش مجدد
              </button>
            </div>
          )}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-400">در حال بارگذاری...</p>
            </div>
          ) : employees.length === 0 && !error ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">کارمندی ثبت نشده است</div>
              <a
                href="/admin/employees/new"
                className="text-blue-400 hover:text-blue-300 no-underline"
              >
                اولین کارمند را ثبت کنید
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees.map(emp => (
                <div key={emp.id} className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all">
                  {/* Photo and Basic Info */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      {emp.photoDataUrl ? (
                        <img src={emp.photoDataUrl} alt={emp.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-xl font-bold">
                          {emp.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg">{emp.fullName}</h3>
                      {emp.position && (
                        <p className="text-gray-400 text-sm">{emp.position}</p>
                      )}
                      {emp.employeeNumber && (
                        <p className="text-gray-500 text-xs mt-1">شماره استخدامی: {emp.employeeNumber}</p>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4 text-sm">
                    {emp.phone && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {emp.phone}
                      </div>
                    )}
                    {emp.workType && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {getWorkTypeText(emp.workType)}
                      </div>
                    )}
                    {emp.maritalStatus && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {getMaritalStatusText(emp.maritalStatus)}
                        {emp.maritalStatus === 'married' && emp.childrenCount > 0 && ` (${emp.childrenCount} فرزند)`}
                      </div>
                    )}
                    {emp.salary && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        حقوق: {emp.salary.toLocaleString()} تومان
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-gray-800">
                    <button
                      onClick={() => handleView(emp.id)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105"
                    >
                      مشاهده
                    </button>
                    <button
                      onClick={() => handleEdit(emp.id)}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105"
                    >
                      ویرایش
                    </button>
                    <button
                      onClick={() => handleDelete(emp.id, emp.fullName)}
                      className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

