'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'
import moment from 'moment-jalaali'

interface Employee {
  id: string
  fullName: string
  employeeRank?: string
}

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

export default function AdminSalaryPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [payments, setPayments] = useState<SalaryPayment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Form fields
  const [employeeId, setEmployeeId] = useState('')
  const [paymentPeriod, setPaymentPeriod] = useState('monthly')
  const [month, setMonth] = useState('')
  const [persianMonth, setPersianMonth] = useState('')
  const [paymentDate, setPaymentDate] = useState('')
  const [persianPaymentDate, setPersianPaymentDate] = useState('')
  const [deductions, setDeductions] = useState('')
  const [leaveDays, setLeaveDays] = useState('')
  const [employeeRank, setEmployeeRank] = useState('')
  const [amount, setAmount] = useState('')

  useEffect(() => {
    fetchEmployees()
    fetchPayments()
  }, [])

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

  const fetchPayments = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/accounting/salary')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!employeeId) {
      alert('لطفاً کارمند را انتخاب کنید')
      return
    }

    const selectedEmployee = employees.find(emp => emp.id === employeeId)
    if (!selectedEmployee) {
      alert('کارمند انتخاب شده معتبر نیست')
      return
    }

    if (!persianPaymentDate) {
      alert('لطفاً تاریخ پرداخت را وارد کنید')
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('لطفاً مبلغ پرداخت را وارد کنید')
      return
    }

    // Convert Persian payment date to Gregorian
    let gregorianPaymentDate: string
    try {
      const dateParts = persianPaymentDate.split('/')
      if (dateParts.length !== 3) {
        alert('فرمت تاریخ پرداخت صحیح نیست. لطفاً به فرمت 1403/01/15 وارد کنید')
        return
      }
      
      const jYear = parseInt(dateParts[0])
      const jMonth = parseInt(dateParts[1])
      const jDay = parseInt(dateParts[2])
      
      if (isNaN(jYear) || isNaN(jMonth) || isNaN(jDay)) {
        alert('لطفاً تاریخ پرداخت را به درستی وارد کنید')
        return
      }
      
      const m = moment(`${jYear}/${jMonth}/${jDay}`, 'jYYYY/jMM/jDD')
      if (!m.isValid()) {
        alert('تاریخ پرداخت وارد شده معتبر نیست')
        return
      }
      
      gregorianPaymentDate = m.format('YYYY-MM-DD')
    } catch (error) {
      alert('خطا در تبدیل تاریخ پرداخت. لطفاً تاریخ را به فرمت 1403/01/15 وارد کنید')
      return
    }

    // Convert Persian month to Gregorian (if provided)
    let gregorianMonth: string | null = null
    if (persianMonth) {
      try {
        const parts = persianMonth.split('/')
        if (parts.length === 2) {
          const jYear = parseInt(parts[0])
          const jMonth = parseInt(parts[1])
          
          if (!isNaN(jYear) && !isNaN(jMonth) && jMonth >= 1 && jMonth <= 12) {
            const m = moment(`${jYear}/${jMonth}/15`, 'jYYYY/jMM/jDD')
            if (m.isValid()) {
              const gYear = m.year()
              const gMonth = String(m.month() + 1).padStart(2, '0')
              gregorianMonth = `${gYear}-${gMonth}`
            }
          }
        }
      } catch {
        // Ignore month conversion errors
      }
    }

    setIsSaving(true)
    try {
      const res = await fetch('/api/accounting/salary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          employeeName: selectedEmployee.fullName,
          paymentPeriod,
          month: gregorianMonth,
          paymentDate: gregorianPaymentDate,
          deductions: deductions || 0,
          leaveDays: leaveDays || 0,
          employeeRank: employeeRank || selectedEmployee.employeeRank || null,
          amount
        })
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          alert('حقوق با موفقیت ثبت شد')
          // Reset form
          setEmployeeId('')
          setMonth('')
          setPersianMonth('')
          setPaymentDate('')
          setPersianPaymentDate('')
          setDeductions('')
          setLeaveDays('')
          setEmployeeRank('')
          setAmount('')
          fetchPayments()
        } else {
          alert(data.error || 'خطا در ثبت حقوق')
        }
      } else {
        const err = await res.json()
        alert(err.error || 'خطا در ثبت حقوق')
      }
    } catch (error) {
      console.error('Error saving salary:', error)
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

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex overflow-hidden" dir="rtl">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
          <div className="px-6 py-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              حقوق و مزایا
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Form */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4">ثبت پرداخت حقوق</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">انتخاب کارمند <span className="text-red-400">*</span></label>
                    <select
                      value={employeeId}
                      onChange={e => setEmployeeId(e.target.value)}
                      required
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">-- انتخاب کنید --</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">دوره پرداخت <span className="text-red-400">*</span></label>
                    <select
                      value={paymentPeriod}
                      onChange={e => setPaymentPeriod(e.target.value)}
                      required
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="monthly">ماهانه</option>
                      <option value="weekly">هفتگی</option>
                      <option value="biweekly">دو هفته‌ای</option>
                      <option value="daily">روزانه</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">انتخاب ماه (شمسی)</label>
                    <input
                      type="text"
                      value={persianMonth}
                      onChange={e => {
                        const value = e.target.value.replace(/[^0-9/]/g, '')
                        setPersianMonth(value)
                      }}
                      placeholder="1403/01"
                      pattern="\d{4}/\d{1,2}"
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      dir="ltr"
                    />
                    <p className="text-xs text-gray-500 mt-1">فرمت: سال/ماه (مثلاً: 1403/01)</p>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">تاریخ پرداخت (شمسی) <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      value={persianPaymentDate}
                      onChange={e => {
                        const value = e.target.value.replace(/[^0-9/]/g, '')
                        setPersianPaymentDate(value)
                      }}
                      placeholder="1403/01/15"
                      pattern="\d{4}/\d{1,2}/\d{1,2}"
                      required
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      dir="ltr"
                    />
                    <p className="text-xs text-gray-500 mt-1">فرمت: سال/ماه/روز (مثلاً: 1403/01/15)</p>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">کسر از حقوق</label>
                    <input
                      type="number"
                      value={deductions}
                      onChange={e => setDeductions(e.target.value)}
                      min="0"
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">مرخصی‌های این ماه</label>
                    <input
                      type="number"
                      value={leaveDays}
                      onChange={e => setLeaveDays(e.target.value)}
                      min="0"
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">رتبه‌بندی</label>
                    <input
                      type="text"
                      value={employeeRank}
                      onChange={e => setEmployeeRank(e.target.value)}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="مثال: ارشد"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">مبلغ پرداخت شده <span className="text-red-400">*</span></label>
                    <input
                      type="number"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      required
                      min="0"
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="مبلغ به تومان"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-500 hover:to-purple-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isSaving ? 'در حال ثبت...' : 'ثبت پرداخت'}
                  </button>
                </div>
              </form>
            </div>

            {/* Payments List */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">گزارش حقوق پرسنل</h2>
                <button
                  onClick={fetchPayments}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition"
                >
                  به‌روزرسانی
                </button>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  هیچ پرداختی ثبت نشده است
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

