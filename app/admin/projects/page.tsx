'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminSidebar from '@/components/AdminSidebar'

interface Project {
  id: string
  name: string
  client: string
  status: string
  employeeId?: string | null
  employeeSalary?: number | null
  totalPrice?: number | null
  progress: number
  startDate?: string
  priority?: string
}

const employeeMap: Record<string, string> = {
  '1': 'مدیر سیستم',
  '2': 'سامی قربانی',
  '3': 'کارمند ۳',
}

export default function AdminProjectsList(){
  const [items, setItems] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/projects?admin=true')
      if (res.ok) {
        const data = await res.json()
        setItems(data.projects || [])
      }
    } finally { 
      setLoading(false) 
    }
  }

  const handleView = (id: string) => {
    router.push(`/projects/${id}`)
  }

  const handleEdit = (id: string) => {
    router.push(`/projects/edit/${id}`)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`آیا مطمئن هستید که می‌خواهید پروژه "${name}" را حذف کنید؟`)) {
      return
    }
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        alert('پروژه با موفقیت حذف شد')
        fetchData()
      } else {
        const err = await res.json()
        alert(err.error || 'خطا در حذف پروژه')
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('خطا در حذف پروژه')
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      'pending': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'in-progress': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'completed': 'bg-green-500/20 text-green-400 border-green-500/30',
      'on-hold': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    }
    const texts = {
      'pending': 'در انتظار',
      'in-progress': 'در حال انجام',
      'completed': 'تکمیل شده',
      'on-hold': 'متوقف شده',
    }
    return (
      <span className={`px-2 py-1 rounded text-xs border ${colors[status as keyof typeof colors] || colors.pending}`}>
        {texts[status as keyof typeof texts] || status}
      </span>
    )
  }

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null
    const colors = {
      'low': 'bg-green-500/20 text-green-400',
      'medium': 'bg-yellow-500/20 text-yellow-400',
      'high': 'bg-red-500/20 text-red-400',
    }
    const texts = {
      'low': 'کم',
      'medium': 'متوسط',
      'high': 'زیاد',
    }
    return (
      <span className={`px-2 py-1 rounded text-xs ${colors[priority as keyof typeof colors] || colors.medium}`}>
        {texts[priority as keyof typeof texts] || priority}
      </span>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex" dir="rtl">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                مدیریت پروژه‌ها
              </h1>
              <p className="text-gray-400 mt-1">تمام پروژه‌های ثبت شده</p>
            </div>
            <Link 
              href="/admin/projects/new" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              پروژه جدید
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">پروژه‌ای یافت نشد</div>
              <Link 
                href="/admin/projects/new"
                className="text-blue-400 hover:text-blue-300"
              >
                اولین پروژه را ایجاد کنید
              </Link>
            </div>
          ) : (
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-4 bg-gray-800/50 border-b border-gray-700 text-sm text-gray-400 font-medium">
                <div className="col-span-3">پروژه</div>
                <div className="col-span-2">کارمند</div>
                <div className="col-span-2">وضعیت</div>
                <div className="col-span-2">پیشرفت</div>
                <div className="col-span-3">عملیات</div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-gray-800">
                {items.map(p => (
                  <div key={p.id} className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-800/30 transition-colors">
                    {/* Project Info */}
                    <div className="col-span-3">
                      <div className="font-semibold text-white mb-1">{p.name}</div>
                      <div className="text-sm text-gray-400">{p.client}</div>
                      {p.startDate && (
                        <div className="text-xs text-gray-500 mt-1">
                          تاریخ شروع: {new Date(p.startDate).toLocaleDateString('fa-IR')}
                        </div>
                      )}
                    </div>

                    {/* Employee */}
                    <div className="col-span-2">
                      <div className="text-sm text-gray-300">
                        {p.employeeId ? employeeMap[p.employeeId] || 'نامشخص' : '—'}
                      </div>
                      {p.employeeSalary && (
                        <div className="text-xs text-gray-500 mt-1">
                          {p.employeeSalary.toLocaleString()} تومان
                        </div>
                      )}
                    </div>

                    {/* Status & Priority */}
                    <div className="col-span-2 flex flex-col gap-2">
                      {getStatusBadge(p.status)}
                      {getPriorityBadge(p.priority)}
                    </div>

                    {/* Progress */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                            style={{ width: `${p.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-300 min-w-[3rem]">{p.progress}%</span>
                      </div>
                      {p.totalPrice && (
                        <div className="text-xs text-gray-500 mt-1">
                          کل: {p.totalPrice.toLocaleString()} تومان
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="col-span-3 flex items-center gap-2">
                      <button
                        onClick={() => handleView(p.id)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        مشاهده
                      </button>
                      <button
                        onClick={() => handleEdit(p.id)}
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        ویرایش
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
