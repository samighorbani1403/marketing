'use client'

import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import moment from 'moment-jalaali'

interface SalaryPayment {
  id: string
  employeeId?: string
  employeeName: string
  paymentPeriod: string
  month?: string
  paymentDate: string
  deductions: number
  leaveDays: number
  employeeRank?: string
  amount: number
  createdAt: string
}

export default function SalaryReportPage() {
  const [payments, setPayments] = useState<SalaryPayment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filterMonth, setFilterMonth] = useState('')
  const [persianFilterMonth, setPersianFilterMonth] = useState('')
  const [filterEmployee, setFilterEmployee] = useState('')

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

  const handleMonthChange = (value: string) => {
    const filtered = value.replace(/[^0-9/]/g, '')
    setPersianFilterMonth(filtered)
    
    if (filtered.includes('/') && filtered.split('/').length === 2) {
      const gregorian = convertPersianMonthToGregorian(filtered)
      if (gregorian) {
        setFilterMonth(gregorian)
      } else {
        setFilterMonth('')
      }
    } else {
      setFilterMonth('')
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [filterMonth, filterEmployee])

  const fetchPayments = async () => {
    setIsLoading(true)
    try {
      let url = '/api/accounting/salary?'
      if (filterMonth) url += `month=${filterMonth}&`
      if (filterEmployee) url += `employeeId=${filterEmployee}&`
      
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.payments) {
          setPayments(data.payments)
        }
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
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

  const formatPeriod = (periodStr?: string) => {
    if (!periodStr) return '-'
    try {
      // Check if it's in Gregorian format (YYYY-MM)
      if (periodStr.match(/^\d{4}-\d{2}$/)) {
        const parts = periodStr.split('-')
        const year = parseInt(parts[0])
        const month = parseInt(parts[1])
        const m = moment(`${year}-${month}-15`, 'YYYY-MM-DD')
        if (m.isValid()) {
          return m.format('jYYYY/jMM')
        }
      }
      return periodStr
    } catch {
      return periodStr
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount)
  }

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0)
  const totalDeductions = payments.reduce((sum, p) => sum + p.deductions, 0)

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex overflow-hidden" dir="rtl">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
          <div className="px-6 py-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              گزارش حقوق پرسنل
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Filters */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6 mb-6">
              <div className="flex gap-4 flex-wrap">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">فیلتر بر اساس ماه (شمسی)</label>
                  <input
                    type="text"
                    value={persianFilterMonth}
                    onChange={e => handleMonthChange(e.target.value)}
                    placeholder="1403/01"
                    pattern="\d{4}/\d{1,2}"
                    className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    dir="ltr"
                  />
                  <p className="text-xs text-gray-500 mt-1">فرمت: سال/ماه (مثلاً: 1403/01)</p>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setFilterMonth('')
                      setPersianFilterMonth('')
                      setFilterEmployee('')
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition"
                  >
                    پاک کردن فیلترها
                  </button>
                </div>
              </div>
            </div>

            {/* Summary */}
            {payments.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-700/50 rounded-xl p-4">
                  <div className="text-blue-300 text-sm mb-1">تعداد پرداخت‌ها</div>
                  <div className="text-2xl font-bold text-white">{payments.length}</div>
                </div>
                <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 border border-green-700/50 rounded-xl p-4">
                  <div className="text-green-300 text-sm mb-1">مجموع حقوق</div>
                  <div className="text-2xl font-bold text-white">{formatCurrency(totalAmount)} تومان</div>
                </div>
                <div className="bg-gradient-to-br from-red-900/40 to-red-800/20 border border-red-700/50 rounded-xl p-4">
                  <div className="text-red-300 text-sm mb-1">مجموع کسورات</div>
                  <div className="text-2xl font-bold text-white">{formatCurrency(totalDeductions)} تومان</div>
                </div>
              </div>
            )}

            {/* Report Table */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  هیچ پرداختی یافت نشد
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="px-4 py-3 text-gray-300 text-sm font-semibold">کارمند</th>
                        <th className="px-4 py-3 text-gray-300 text-sm font-semibold">دوره</th>
                        <th className="px-4 py-3 text-gray-300 text-sm font-semibold">ماه</th>
                        <th className="px-4 py-3 text-gray-300 text-sm font-semibold">تاریخ پرداخت</th>
                        <th className="px-4 py-3 text-gray-300 text-sm font-semibold">کسر</th>
                        <th className="px-4 py-3 text-gray-300 text-sm font-semibold">مرخصی</th>
                        <th className="px-4 py-3 text-gray-300 text-sm font-semibold">رتبه</th>
                        <th className="px-4 py-3 text-gray-300 text-sm font-semibold">مبلغ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(payment => (
                        <tr key={payment.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                          <td className="px-4 py-3 text-white">{payment.employeeName}</td>
                          <td className="px-4 py-3 text-gray-300">
                            {payment.paymentPeriod === 'monthly' ? 'ماهانه' :
                             payment.paymentPeriod === 'weekly' ? 'هفتگی' :
                             payment.paymentPeriod === 'biweekly' ? 'دو هفته‌ای' : 'روزانه'}
                          </td>
                          <td className="px-4 py-3 text-gray-300">{payment.month ? formatPeriod(payment.month) : '—'}</td>
                          <td className="px-4 py-3 text-gray-300">{formatDate(payment.paymentDate)}</td>
                          <td className="px-4 py-3 text-gray-300">{formatCurrency(payment.deductions)}</td>
                          <td className="px-4 py-3 text-gray-300">{payment.leaveDays} روز</td>
                          <td className="px-4 py-3 text-gray-300">{payment.employeeRank || '—'}</td>
                          <td className="px-4 py-3 text-green-400 font-semibold">{formatCurrency(payment.amount)} تومان</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

