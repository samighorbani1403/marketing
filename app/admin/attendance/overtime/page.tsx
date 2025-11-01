'use client'

import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/AdminSidebar'

interface Overtime {
  id: string
  employeeId?: string
  employeeName: string
  date: string
  hours: number
  notes?: string
  createdAt: string
}

export default function OvertimePage() {
  const [overtimes, setOvertimes] = useState<Overtime[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Form fields
  const [employeeId, setEmployeeId] = useState('')
  const [employeeName, setEmployeeName] = useState('')
  const [date, setDate] = useState('')
  const [hours, setHours] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchOvertimes()
  }, [])

  const fetchOvertimes = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/attendance/overtime')
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.overtimes) {
          setOvertimes(data.overtimes)
        }
      }
    } catch (error) {
      console.error('Error fetching overtimes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!employeeName.trim() || !date || !hours) {
      alert('لطفاً نام کارمند، تاریخ و ساعت اضافه کاری را وارد کنید')
      return
    }

    const hoursNum = parseFloat(hours)
    if (isNaN(hoursNum) || hoursNum <= 0) {
      alert('لطفاً ساعت اضافه کاری را به صورت عدد مثبت وارد کنید')
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch('/api/attendance/overtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: employeeId || null,
          employeeName,
          date,
          hours: hoursNum,
          notes: notes || null
        })
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          alert('اضافه کاری با موفقیت ثبت شد')
          // Reset form
          setEmployeeId('')
          setEmployeeName('')
          setDate('')
          setHours('')
          setNotes('')
          fetchOvertimes()
        } else {
          alert(data.error || 'خطا در ثبت اضافه کاری')
        }
      } else {
        const err = await res.json()
        alert(err.error || 'خطا در ثبت اضافه کاری')
      }
    } catch (error) {
      console.error('Error saving overtime:', error)
      alert('خطا در اتصال به سرور')
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR')
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex overflow-hidden" dir="rtl">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
          <div className="px-6 py-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              ثبت اضافه کاری
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Form */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4">ثبت اضافه کاری جدید</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">نام کارمند <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      value={employeeName}
                      onChange={e => setEmployeeName(e.target.value)}
                      required
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="نام کارمند"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">تاریخ <span className="text-red-400">*</span></label>
                    <input
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      required
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">ساعت اضافه کاری <span className="text-red-400">*</span></label>
                    <input
                      type="number"
                      value={hours}
                      onChange={e => setHours(e.target.value)}
                      required
                      min="0.5"
                      step="0.5"
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="مثلاً: 2 یا 2.5"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-300 mb-2">یادداشت‌ها</label>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      rows={3}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="یادداشت‌های اضافی..."
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-500 hover:to-purple-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isSaving ? 'در حال ثبت...' : 'ثبت اضافه کاری'}
                  </button>
                </div>
              </form>
            </div>

            {/* Overtimes List */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">لیست اضافه کاری‌ها</h2>
                <button
                  onClick={fetchOvertimes}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition"
                >
                  به‌روزرسانی
                </button>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : overtimes.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  هیچ اضافه کاری ثبت نشده است
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {overtimes.map(overtime => (
                    <div key={overtime.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-blue-500/50 transition">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-semibold text-lg">{overtime.employeeName}</h3>
                        <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                          {formatDate(overtime.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="text-gray-400 text-xs mb-1">ساعت اضافه کاری</div>
                          <div className="text-blue-400 font-bold text-xl">{overtime.hours} ساعت</div>
                        </div>
                      </div>
                      {overtime.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <div className="text-xs text-gray-400">{overtime.notes}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

