'use client'

import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/AdminSidebar'

interface Bill {
  id: string
  billType: string
  period?: string
  startDate?: string
  endDate?: string
  paymentDate: string
  amount: number
  createdAt: string
}

const billTypes = [
  { value: 'rent', label: 'اجاره' },
  { value: 'building_charge', label: 'شارژ ساختمان' },
  { value: 'water', label: 'آب' },
  { value: 'electricity', label: 'برق' },
  { value: 'gas', label: 'گاز' },
  { value: 'phone', label: 'تلفن' }
]

export default function AdminBillsPage() {
  const [bills, setBills] = useState<Bill[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Form fields
  const [billType, setBillType] = useState('')
  const [period, setPeriod] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [paymentDate, setPaymentDate] = useState('')
  const [amount, setAmount] = useState('')

  useEffect(() => {
    fetchBills()
  }, [])

  const fetchBills = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/accounting/bills')
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.bills) {
          setBills(data.bills)
        }
      }
    } catch (error) {
      console.error('Error fetching bills:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!billType) {
      alert('لطفاً نوع قبض را انتخاب کنید')
      return
    }

    if (!paymentDate) {
      alert('لطفاً تاریخ پرداخت را وارد کنید')
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('لطفاً مبلغ پرداخت را وارد کنید')
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch('/api/accounting/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billType,
          period: period || null,
          startDate: startDate || null,
          endDate: endDate || null,
          paymentDate,
          amount
        })
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          alert('قبض با موفقیت ثبت شد')
          // Reset form
          setBillType('')
          setPeriod('')
          setStartDate('')
          setEndDate('')
          setPaymentDate('')
          setAmount('')
          fetchBills()
        } else {
          alert(data.error || 'خطا در ثبت قبض')
        }
      } else {
        const err = await res.json()
        alert(err.error || 'خطا در ثبت قبض')
      }
    } catch (error) {
      console.error('Error saving bill:', error)
      alert('خطا در اتصال به سرور')
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount)
  }

  const getBillTypeLabel = (type: string) => {
    return billTypes.find(bt => bt.value === type)?.label || type
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex overflow-hidden" dir="rtl">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
          <div className="px-6 py-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              ثبت قبوض شرکتی
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Form */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4">ثبت قبض جدید</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">نوع قبض <span className="text-red-400">*</span></label>
                    <select
                      value={billType}
                      onChange={e => setBillType(e.target.value)}
                      required
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">-- انتخاب کنید --</option>
                      {billTypes.map(bt => (
                        <option key={bt.value} value={bt.value}>{bt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">دوره قبض (ماه)</label>
                    <input
                      type="month"
                      value={period}
                      onChange={e => setPeriod(e.target.value)}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">از تاریخ</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">تا تاریخ</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">تاریخ پرداخت <span className="text-red-400">*</span></label>
                    <input
                      type="date"
                      value={paymentDate}
                      onChange={e => setPaymentDate(e.target.value)}
                      required
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
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
                    {isSaving ? 'در حال ثبت...' : 'ثبت قبض'}
                  </button>
                </div>
              </form>
            </div>

            {/* Bills List */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">لیست قبوض</h2>
                <button
                  onClick={fetchBills}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition"
                >
                  به‌روزرسانی
                </button>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : bills.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  هیچ قبضی ثبت نشده است
                </div>
              ) : (
                <div className="space-y-3">
                  {bills.map(bill => (
                    <div key={bill.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-blue-500/50 transition">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="px-4 py-2 bg-blue-900/40 text-blue-300 rounded-lg font-semibold">
                            {getBillTypeLabel(bill.billType)}
                          </div>
                          <div className="text-gray-300">
                            <div className="text-sm">مبلغ: <span className="text-green-400 font-semibold">{formatCurrency(bill.amount)} تومان</span></div>
                            {bill.period && <div className="text-xs text-gray-500">دوره: {bill.period}</div>}
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-400">
                          <div>تاریخ پرداخت: {formatDate(bill.paymentDate)}</div>
                          {bill.startDate && bill.endDate && (
                            <div className="text-xs">از {formatDate(bill.startDate)} تا {formatDate(bill.endDate)}</div>
                          )}
                        </div>
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

