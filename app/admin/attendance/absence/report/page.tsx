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
}

interface MonthlyReport {
  employeeName: string
  totalCount: number
  justifiedCount: number
  unjustifiedCount: number
  medicalCount: number
  entries: Absence[]
}

export default function AbsenceReportPage() {
  const [reports, setReports] = useState<MonthlyReport[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filterMonth, setFilterMonth] = useState('')
  const [persianMonth, setPersianMonth] = useState('')

  const convertPersianMonthToGregorian = (persianMonthStr: string): string => {
    try {
      const parts = persianMonthStr.split('/')
      if (parts.length !== 2) {
        return ''
      }
      
      const jYear = parseInt(parts[0])
      const jMonth = parseInt(parts[1])
      
      if (isNaN(jYear) || isNaN(jMonth) || jMonth < 1 || jMonth > 12) {
        return ''
      }
      
      // Create a date in the middle of the Persian month and convert to Gregorian
      const m = moment(`${jYear}/${jMonth}/15`, 'jYYYY/jMM/jDD')
      if (!m.isValid()) {
        return ''
      }
      
      const gYear = m.year()
      const gMonth = String(m.month() + 1).padStart(2, '0')
      return `${gYear}-${gMonth}`
    } catch {
      return ''
    }
  }

  // Set default month to current Persian month
  useEffect(() => {
    if (!persianMonth) {
      const now = moment()
      const year = now.jYear()
      const month = String(now.jMonth() + 1).padStart(2, '0')
      const persianMonthStr = `${year}/${month}`
      setPersianMonth(persianMonthStr)
      
      // Convert to Gregorian and fetch report
      const gregorian = convertPersianMonthToGregorian(persianMonthStr)
      if (gregorian) {
        setFilterMonth(gregorian)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (filterMonth) {
      fetchReport()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMonth])

  const handleMonthChange = (value: string) => {
    const filtered = value.replace(/[^0-9/]/g, '')
    setPersianMonth(filtered)
    
    if (filtered.includes('/') && filtered.split('/').length === 2) {
      const gregorian = convertPersianMonthToGregorian(filtered)
      if (gregorian) {
        setFilterMonth(gregorian)
      }
    }
  }

  const fetchReport = async () => {
    if (!filterMonth) {
      if (!persianMonth) {
        alert('لطفاً ماه را وارد کنید')
        return
      }
      
      const gregorian = convertPersianMonthToGregorian(persianMonth)
      if (!gregorian) {
        alert('فرمت ماه صحیح نیست. لطفاً به فرمت 1403/01 وارد کنید')
        return
      }
      setFilterMonth(gregorian)
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/attendance/absence?month=${filterMonth}`)
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.absences) {
          // Group by employee
          const grouped: { [key: string]: MonthlyReport } = {}
          
          for (let i = 0; i < data.absences.length; i++) {
            const a = data.absences[i] as Absence
            if (!grouped[a.employeeName]) {
              grouped[a.employeeName] = {
                employeeName: a.employeeName,
                totalCount: 0,
                justifiedCount: 0,
                unjustifiedCount: 0,
                medicalCount: 0,
                entries: []
              }
            }
            grouped[a.employeeName].totalCount++
            if (a.reason === 'justified') grouped[a.employeeName].justifiedCount++
            else if (a.reason === 'unjustified') grouped[a.employeeName].unjustifiedCount++
            else if (a.reason === 'medical') grouped[a.employeeName].medicalCount++
            grouped[a.employeeName].entries.push(a)
          }

          setReports(Object.values(grouped))
        }
      }
    } catch (error) {
      console.error('Error fetching report:', error)
    } finally {
      setIsLoading(false)
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

  const getReasonBadge = (reason: string) => {
    switch (reason) {
      case 'justified':
        return <span className="px-2 py-1 rounded text-xs bg-green-900/40 text-green-300 border border-green-700/50">موجه</span>
      case 'unjustified':
        return <span className="px-2 py-1 rounded text-xs bg-red-900/40 text-red-300 border border-red-700/50">غیرموجه</span>
      case 'medical':
        return <span className="px-2 py-1 rounded text-xs bg-blue-900/40 text-blue-300 border border-blue-700/50">پزشکی</span>
      default:
        return <span className="px-2 py-1 rounded text-xs bg-gray-700/50 text-gray-400">{reason}</span>
    }
  }

  const grandTotal = reports.reduce((sum, r) => sum + r.totalCount, 0)
  const grandJustified = reports.reduce((sum, r) => sum + r.justifiedCount, 0)
  const grandUnjustified = reports.reduce((sum, r) => sum + r.unjustifiedCount, 0)
  const grandMedical = reports.reduce((sum, r) => sum + r.medicalCount, 0)

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex overflow-hidden" dir="rtl">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
          <div className="px-6 py-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              گزارش کل غیبت‌ها
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Filter */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-300 mb-2">انتخاب ماه (شمسی) <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={persianMonth}
                    onChange={e => handleMonthChange(e.target.value)}
                    placeholder="1403/01"
                    pattern="\d{4}/\d{1,2}"
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    dir="ltr"
                  />
                  <p className="text-xs text-gray-500 mt-1">فرمت: سال/ماه (مثلاً: 1403/01)</p>
                </div>
                <div className="pt-6">
                  <button
                    onClick={fetchReport}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-500 hover:to-purple-600 text-white rounded-lg font-medium transition-all"
                  >
                    نمایش گزارش
                  </button>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            {reports.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-700/50 rounded-xl p-4">
                  <div className="text-sm text-gray-300 mb-1">مجموع کل غیبت‌ها</div>
                  <div className="text-2xl font-bold text-purple-400">{grandTotal}</div>
                </div>
                <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 border border-green-700/50 rounded-xl p-4">
                  <div className="text-sm text-gray-300 mb-1">موجه</div>
                  <div className="text-2xl font-bold text-green-400">{grandJustified}</div>
                </div>
                <div className="bg-gradient-to-br from-red-900/40 to-red-800/20 border border-red-700/50 rounded-xl p-4">
                  <div className="text-sm text-gray-300 mb-1">غیرموجه</div>
                  <div className="text-2xl font-bold text-red-400">{grandUnjustified}</div>
                </div>
                <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-700/50 rounded-xl p-4">
                  <div className="text-sm text-gray-300 mb-1">پزشکی</div>
                  <div className="text-2xl font-bold text-blue-400">{grandMedical}</div>
                </div>
              </div>
            )}

            {/* Reports */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">گزارش بر اساس کارمند</h2>
              
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  {persianMonth ? 'داده‌ای برای این ماه یافت نشد' : 'لطفاً ماه را انتخاب کنید'}
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report, idx) => (
                    <div key={idx} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-white font-semibold text-lg mb-2">{report.employeeName}</h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <span className="text-gray-300">کل: <span className="text-purple-400 font-semibold">{report.totalCount}</span></span>
                            <span className="text-gray-300">موجه: <span className="text-green-400 font-semibold">{report.justifiedCount}</span></span>
                            <span className="text-gray-300">غیرموجه: <span className="text-red-400 font-semibold">{report.unjustifiedCount}</span></span>
                            <span className="text-gray-300">پزشکی: <span className="text-blue-400 font-semibold">{report.medicalCount}</span></span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Detail Table */}
                      <div className="mt-4 overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-700">
                              <th className="text-right p-2 text-xs text-gray-400">تاریخ</th>
                              <th className="text-right p-2 text-xs text-gray-400">دلیل</th>
                              <th className="text-right p-2 text-xs text-gray-400">یادداشت</th>
                            </tr>
                          </thead>
                          <tbody>
                            {report.entries.map(entry => (
                              <tr key={entry.id} className="border-b border-gray-700/30 hover:bg-gray-800/30">
                                <td className="p-2 text-gray-300 text-sm">{formatDate(entry.date)}</td>
                                <td className="p-2">{getReasonBadge(entry.reason)}</td>
                                <td className="p-2 text-gray-400 text-xs">{entry.notes || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
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
