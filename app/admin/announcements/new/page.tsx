'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'

interface Employee {
  id: string
  fullName: string
  position?: string
}

export default function AdminNewAnnouncementPage() {
  const router = useRouter()
  const [type, setType] = useState<'individual' | 'public'>('public')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [selectAll, setSelectAll] = useState(false)

  useEffect(() => {
    fetchEmployees()
  }, [])

  useEffect(() => {
    if (selectAll && employees.length > 0) {
      setSelectedEmployees(employees.map(emp => emp.id))
    } else if (!selectAll) {
      setSelectedEmployees([])
    }
  }, [selectAll, employees])

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees')
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.employees) {
          setEmployees(data.employees)
        }
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const handleEmployeeToggle = (employeeId: string) => {
    setSelectedEmployees(prev => {
      if (prev.includes(employeeId)) {
        return prev.filter(id => id !== employeeId)
      } else {
        return [...prev, employeeId]
      }
    })
    setSelectAll(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      return alert('عنوان اطلاعیه الزامی است')
    }

    if (!body.trim()) {
      return alert('محتوای اطلاعیه الزامی است')
    }

    if (type === 'individual' && selectedEmployees.length === 0) {
      return alert('لطفاً حداقل یک گیرنده انتخاب کنید')
    }

    setIsSaving(true)
    try {
      const recipientIds = type === 'individual' ? selectedEmployees.join(',') : null
      const recipientNames = type === 'individual' 
        ? selectedEmployees.map(id => {
            const emp = employees.find(e => e.id === id)
            return emp?.fullName || ''
          }).filter(Boolean).join(', ')
        : null

      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title,
          body,
          createdBy: 'مدیر سیستم',
          recipientIds,
          recipientNames
        })
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          alert(`اطلاعیه ${type === 'public' ? 'عمومی' : 'فردی'} با موفقیت ایجاد شد`)
          router.push('/admin')
        } else {
          alert(data.error || 'خطا در ایجاد اطلاعیه')
        }
      } else {
        const err = await res.json()
        const errorMsg = err.error || 'خطا در ایجاد اطلاعیه'
        alert(errorMsg.split('\n').join('\n'))
      }
    } catch (error) {
      console.error('Error creating announcement:', error)
      alert('خطا در اتصال به سرور')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex overflow-hidden" dir="rtl">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
          <div className="px-6 py-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              ایجاد اطلاعیه و اخبار شرکت
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type Selection */}
              <div>
                <label className="block text-sm text-gray-300 mb-3">نوع اطلاعیه <span className="text-red-400">*</span></label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="public"
                      checked={type === 'public'}
                      onChange={e => setType('public')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-white">عمومی</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="individual"
                      checked={type === 'individual'}
                      onChange={e => setType('individual')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-white">فردی</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {type === 'public' 
                    ? 'اطلاعیه عمومی برای همه بازاریابان و کارمندان قابل مشاهده است'
                    : 'اطلاعیه فردی فقط برای کارمندان انتخاب شده ارسال می‌شود'}
                </p>
              </div>

              {/* Recipient Selection (for individual) */}
              {type === 'individual' && (
                <div>
                  <label className="block text-sm text-gray-300 mb-3">انتخاب گیرنده <span className="text-red-400">*</span></label>
                  
                  {employees.length > 0 && (
                    <div className="mb-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={e => setSelectAll(e.target.checked)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-white font-semibold">انتخاب همه</span>
                      </label>
                    </div>
                  )}

                  <div className="max-h-64 overflow-y-auto border border-gray-700 rounded-lg p-4 bg-gray-800/50">
                    {employees.length === 0 ? (
                      <p className="text-gray-400 text-center py-4">هیچ کارمندی ثبت نشده است</p>
                    ) : (
                      <div className="space-y-2">
                        {employees.map(emp => (
                          <label key={emp.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-700/50 p-2 rounded">
                            <input
                              type="checkbox"
                              checked={selectedEmployees.includes(emp.id)}
                              onChange={() => handleEmployeeToggle(emp.id)}
                              className="w-4 h-4 text-blue-600"
                            />
                            <div className="flex-1">
                              <span className="text-white">{emp.fullName}</span>
                              {emp.position && (
                                <span className="text-gray-400 text-sm mr-2">({emp.position})</span>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {selectedEmployees.length > 0 && (
                    <p className="text-xs text-blue-400 mt-2">
                      {selectedEmployees.length} کارمند انتخاب شده
                    </p>
                  )}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">عنوان اطلاعیه <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="مثال: اطلاعیه مهم شرکت"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">محتوای اطلاعیه <span className="text-red-400">*</span></label>
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  required
                  rows={8}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="متن اطلاعیه را اینجا بنویسید..."
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => router.push('/admin')}
                  className="px-6 py-3 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isSaving ? 'در حال ارسال...' : 'ارسال اطلاعیه'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}

