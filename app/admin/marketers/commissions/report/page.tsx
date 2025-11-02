'use client'

import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import moment from 'moment-jalaali'

interface CommissionPayment {
  id: string
  marketerId?: string
  marketerName: string
  commissionTypeId?: string
  invoiceId?: string
  invoiceAmount?: number
  commissionAmount: number
  commissionRate?: number
  period?: string
  paymentDate?: string
  paymentStatus: string
  notes?: string
  createdAt: string
}

export default function CommissionReportPage() {
  const [payments, setPayments] = useState<CommissionPayment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filterMarketer, setFilterMarketer] = useState('')
  const [filterPeriod, setFilterPeriod] = useState('')
  const [persianPeriod, setPersianPeriod] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCommissionType, setFilterCommissionType] = useState('')

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

  const handlePeriodChange = (value: string) => {
    const filtered = value.replace(/[^0-9/]/g, '')
    setPersianPeriod(filtered)
    
    if (filtered.includes('/') && filtered.split('/').length === 2) {
      const gregorian = convertPersianMonthToGregorian(filtered)
      if (gregorian) {
        setFilterPeriod(gregorian)
      } else {
        setFilterPeriod('')
      }
    } else {
      setFilterPeriod('')
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [filterMarketer, filterPeriod, filterStatus, filterCommissionType])

  const fetchPayments = async () => {
    setIsLoading(true)
    try {
      let url = '/api/marketers/commissions/payments?'
      if (filterMarketer) url += `marketerId=${filterMarketer}&`
      if (filterPeriod) url += `period=${filterPeriod}&`
      if (filterStatus) url += `status=${filterStatus}&`
      if (filterCommissionType) url += `commissionTypeId=${filterCommissionType}&`
      
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-3 py-1 rounded-full text-xs bg-green-900/40 text-green-300 border border-green-700/50">پرداخت شده</span>
      case 'cancelled':
        return <span className="px-3 py-1 rounded-full text-xs bg-red-900/40 text-red-300 border border-red-700/50">لغو شده</span>
      default:
        return <span className="px-3 py-1 rounded-full text-xs bg-yellow-900/40 text-yellow-300 border border-yellow-700/50">در انتظار</span>
    }
  }

  const totalCommission = payments.reduce((sum, p) => sum + p.commissionAmount, 0)
  const paidCommission = payments.filter(p => p.paymentStatus === 'paid').reduce((sum, p) => sum + p.commissionAmount, 0)
  const pendingCommission = payments.filter(p => p.paymentStatus === 'pending').reduce((sum, p) => sum + p.commissionAmount, 0)

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex overflow-hidden" dir="rtl">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
          <div className="px-6 py-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              گزارش پورسانت
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Filters */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4">فیلترها</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">بازاریاب</label>
                  <input
                    type="text"
                    value={filterMarketer}
                    onChange={e => setFilterMarketer(e.target.value)}
                    placeholder="نام بازاریاب"
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">دوره (شمسی)</label>
                  <input
                    type="text"
                    value={persianPeriod}
                    onChange={e => handlePeriodChange(e.target.value)}
                    placeholder="1403/01"
                    pattern="\d{4}/\d{1,2}"
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    dir="ltr"
                  />
                  <p className="text-xs text-gray-500 mt-1">فرمت: سال/ماه (مثلاً: 1403/01)</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">وضعیت پرداخت</label>
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">همه</option>
                    <option value="pending">در انتظار</option>
                    <option value="paid">پرداخت شده</option>
                    <option value="cancelled">لغو شده</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">نوع پورسانت</label>
                  <input
                    type="text"
                    value={filterCommissionType}
                    onChange={e => setFilterCommissionType(e.target.value)}
                    placeholder="ID نوع پورسانت"
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-700/50 rounded-xl p-6">
                <div className="text-sm text-gray-300 mb-2">مجموع پورسانت</div>
                <div className="text-3xl font-bold text-blue-400">{formatCurrency(totalCommission)} تومان</div>
              </div>
              <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 border border-green-700/50 rounded-xl p-6">
                <div className="text-sm text-gray-300 mb-2">پرداخت شده</div>
                <div className="text-3xl font-bold text-green-400">{formatCurrency(paidCommission)} تومان</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 border border-yellow-700/50 rounded-xl p-6">
                <div className="text-sm text-gray-300 mb-2">در انتظار پرداخت</div>
                <div className="text-3xl font-bold text-yellow-400">{formatCurrency(pendingCommission)} تومان</div>
              </div>
            </div>

            {/* Payments Table */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">لیست پرداخت‌های پورسانت</h2>
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
                <div className="text-center py-12 text-gray-400">هیچ پرداختی یافت نشد</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-right p-4 text-sm text-gray-300">بازاریاب</th>
                        <th className="text-right p-4 text-sm text-gray-300">مبلغ فاکتور</th>
                        <th className="text-right p-4 text-sm text-gray-300">مبلغ پورسانت</th>
                        <th className="text-right p-4 text-sm text-gray-300">نرخ</th>
                        <th className="text-right p-4 text-sm text-gray-300">دوره</th>
                        <th className="text-right p-4 text-sm text-gray-300">تاریخ پرداخت</th>
                        <th className="text-right p-4 text-sm text-gray-300">وضعیت</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(payment => (
                        <tr key={payment.id} className="border-b border-gray-700/50 hover:bg-gray-800/30 transition">
                          <td className="p-4 text-white font-medium">{payment.marketerName}</td>
                          <td className="p-4 text-gray-300">
                            {payment.invoiceAmount ? `${formatCurrency(payment.invoiceAmount)} تومان` : '-'}
                          </td>
                          <td className="p-4 text-green-400 font-semibold">{formatCurrency(payment.commissionAmount)} تومان</td>
                          <td className="p-4 text-blue-400">
                            {payment.commissionRate ? `${payment.commissionRate}%` : '-'}
                          </td>
                          <td className="p-4 text-gray-300">{payment.period || '-'}</td>
                          <td className="p-4 text-gray-300">{formatDate(payment.paymentDate)}</td>
                          <td className="p-4">{getStatusBadge(payment.paymentStatus)}</td>
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

