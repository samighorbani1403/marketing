'use client'

import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import moment from 'moment-jalaali'

interface Absence {
  id: string
  employeeId?: string
  employeeName: string
  date: string
  reason: string
  notes?: string
  createdAt: string
}

export default function AbsencePage() {
  const [absences, setAbsences] = useState<Absence[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Form fields
  const [employeeId, setEmployeeId] = useState('')
  const [employeeName, setEmployeeName] = useState('')
  const [persianDate, setPersianDate] = useState('')
  const [reason, setReason] = useState('justified')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchAbsences()
  }, [])

  const fetchAbsences = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/attendance/absence')
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.absences) {
          setAbsences(data.absences)
        }
      }
    } catch (error) {
      console.error('Error fetching absences:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!employeeName.trim() || !persianDate || !reason) {
      alert('لطفاً نام کارمند، تاریخ و دلیل غیبت را وارد کنید')
      return
    }

    // Convert Persian date to Gregorian
    let gregorianDate: string
    try {
      // Parse Persian date (format: YYYY/MM/DD)
      const dateParts = persianDate.split('/')
      if (dateParts.length !== 3) {
        alert('فرمت تاریخ صحیح نیست. لطفاً به فرمت 1403/01/15 وارد کنید')
        return
      }
      
      const jYear = parseInt(dateParts[0])
      const jMonth = parseInt(dateParts[1])
      const jDay = parseInt(dateParts[2])
      
      if (isNaN(jYear) || isNaN(jMonth) || isNaN(jDay)) {
        alert('لطفاً تاریخ را به درستی وارد کنید')
        return
      }
      
      const m = moment(`${jYear}/${jMonth}/${jDay}`, 'jYYYY/jMM/jDD')
      if (!m.isValid()) {
        alert('تاریخ وارد شده معتبر نیست')
        return
      }
      
      gregorianDate = m.format('YYYY-MM-DD')
    } catch (error) {
      alert('خطا در تبدیل تاریخ. لطفاً تاریخ را به فرمت 1403/01/15 وارد کنید')
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch('/api/attendance/absence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: employeeId || null,
          employeeName,
          date: gregorianDate,
          reason,
          notes: notes || null
        })
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          alert('غیبت با موفقیت ثبت شد')
          // Reset form
          setEmployeeId('')
          setEmployeeName('')
          setPersianDate('')
          setReason('justified')
          setNotes('')
          fetchAbsences()
        } else {
          alert(data.error || 'خطا در ثبت غیبت')
        }
      } else {
        const err = await res.json()
        alert(err.error || 'خطا در ثبت غیبت')
      }
    } catch (error) {
      console.error('Error saving absence:', error)
      alert('خطا در اتصال به سرور')
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const m = moment(dateString, 'YYYY-MM-DD')
      if (m.isValid()) {
        return m.format('jYYYY/jMM/jDD')
      }
      return new Date(dateString).toLocaleDateString('fa-IR')
    } catch {
      return new Date(dateString).toLocaleDateString('fa-IR')
    }
  }

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'justified':
        return 'موجه'
      case 'unjustified':
        return 'غیرموجه'
      case 'medical':
        return 'پزشکی'
      default:
        return reason
    }
  }

  const getReasonBadge = (reason: string) => {
    switch (reason) {
      case 'justified':
        return <span className="px-3 py-1 rounded-full text-xs bg-green-900/40 text-green-300 border border-green-700/50">موجه</span>
      case 'unjustified':
        return <span className="px-3 py-1 rounded-full text-xs bg-red-900/40 text-red-300 border border-red-700/50">غیرموجه</span>
      case 'medical':
        return <span className="px-3 py-1 rounded-full text-xs bg-blue-900/40 text-blue-300 border border-blue-700/50">پزشکی</span>
      default:
        return <span className="px-3 py-1 rounded-full text-xs bg-gray-700/50 text-gray-400 border border-gray-600/50">{reason}</span>
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex overflow-hidden" dir="rtl">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
          <div className="px-6 py-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              ثبت غیبت
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Form */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4">ثبت غیبت جدید</h2>
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
                    <label className="block text-sm text-gray-300 mb-2">تاریخ غیبت (شمسی) <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      value={persianDate}
                      onChange={e => {
                        const value = e.target.value.replace(/[^0-9/]/g, '')
                        setPersianDate(value)
                      }}
                      placeholder="1403/01/15"
                      pattern="\d{4}/\d{1,2}/\d{1,2}"
                      required
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      dir="ltr"
                    />
                    <p className="text-xs text-gray-500 mt-1">فرمت: سال/ماه/روز (مثلاً: 1403/01/15)</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-300 mb-2">دلیل غیبت <span className="text-red-400">*</span></label>
                    <select
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                      required
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="justified">موجه</option>
                      <option value="unjustified">غیرموجه</option>
                      <option value="medical">پزشکی</option>
                    </select>
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
                    {isSaving ? 'در حال ثبت...' : 'ثبت غیبت'}
                  </button>
                </div>
              </form>
            </div>

            {/* Absences List */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">لیست غیبت‌ها</h2>
                <button
                  onClick={fetchAbsences}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition"
                >
                  به‌روزرسانی
                </button>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : absences.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  هیچ غیبتی ثبت نشده است
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {absences.map(absence => (
                    <div key={absence.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-blue-500/50 transition">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-semibold text-lg">{absence.employeeName}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                            {formatDate(absence.date)}
                          </span>
                          {getReasonBadge(absence.reason)}
                        </div>
                      </div>
                      {absence.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <div className="text-xs text-gray-400">{absence.notes}</div>
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

