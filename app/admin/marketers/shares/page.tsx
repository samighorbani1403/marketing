'use client'

import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/AdminSidebar'

interface Share {
  id: string
  marketerId?: string
  marketerName: string
  shareAmount: number
  sharePercentage?: number
  period?: string
  paymentDate: string
  paymentStatus: string
  notes?: string
  createdAt: string
}

export default function MarketersSharesPage() {
  const [shares, setShares] = useState<Share[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Form fields
  const [marketerId, setMarketerId] = useState('')
  const [marketerName, setMarketerName] = useState('')
  const [shareAmount, setShareAmount] = useState('')
  const [sharePercentage, setSharePercentage] = useState('')
  const [period, setPeriod] = useState('')
  const [paymentDate, setPaymentDate] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('pending')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchShares()
  }, [])

  const fetchShares = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/marketers/shares')
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.shares) {
          setShares(data.shares)
        }
      }
    } catch (error) {
      console.error('Error fetching shares:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!marketerName.trim() || !shareAmount) {
      alert('لطفاً نام بازاریاب و مبلغ سهم را وارد کنید')
      return
    }

    if (!paymentDate) {
      alert('لطفاً تاریخ پرداخت را وارد کنید')
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch('/api/marketers/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marketerId: marketerId || null,
          marketerName,
          shareAmount,
          sharePercentage: sharePercentage || null,
          period: period || null,
          paymentDate,
          paymentStatus,
          notes: notes || null
        })
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          alert('سهم با موفقیت ثبت شد')
          // Reset form
          setMarketerId('')
          setMarketerName('')
          setShareAmount('')
          setSharePercentage('')
          setPeriod('')
          setPaymentDate('')
          setPaymentStatus('pending')
          setNotes('')
          fetchShares()
        } else {
          alert(data.error || 'خطا در ثبت سهم')
        }
      } else {
        const err = await res.json()
        alert(err.error || 'خطا در ثبت سهم')
      }
    } catch (error) {
      console.error('Error saving share:', error)
      alert('خطا در اتصال به سرور')
    } finally {
      setIsSaving(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-3 py-1 rounded-full text-xs bg-green-900/40 text-green-300 border border-green-700/50">پرداخت شده</span>
      default:
        return <span className="px-3 py-1 rounded-full text-xs bg-yellow-900/40 text-yellow-300 border border-yellow-700/50">در انتظار پرداخت</span>
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex overflow-hidden" dir="rtl">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
          <div className="px-6 py-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              سهم دریافتی بازاریابان
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Form */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4">ثبت سهم جدید</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">نام بازاریاب <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      value={marketerName}
                      onChange={e => setMarketerName(e.target.value)}
                      required
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="نام بازاریاب"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">مبلغ سهم (تومان) <span className="text-red-400">*</span></label>
                    <input
                      type="number"
                      value={shareAmount}
                      onChange={e => setShareAmount(e.target.value)}
                      required
                      min="0"
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">درصد سهم</label>
                    <input
                      type="number"
                      value={sharePercentage}
                      onChange={e => setSharePercentage(e.target.value)}
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="درصد"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">دوره (ماه/سال)</label>
                    <input
                      type="month"
                      value={period}
                      onChange={e => setPeriod(e.target.value)}
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
                    <label className="block text-sm text-gray-300 mb-2">وضعیت پرداخت</label>
                    <select
                      value={paymentStatus}
                      onChange={e => setPaymentStatus(e.target.value)}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="pending">در انتظار پرداخت</option>
                      <option value="paid">پرداخت شده</option>
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
                    {isSaving ? 'در حال ثبت...' : 'ثبت سهم'}
                  </button>
                </div>
              </form>
            </div>

            {/* Shares List */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">لیست سهم‌ها</h2>
                <button
                  onClick={fetchShares}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition"
                >
                  به‌روزرسانی
                </button>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : shares.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  هیچ سهمی ثبت نشده است
                </div>
              ) : (
                <div className="space-y-3">
                  {shares.map(share => (
                    <div key={share.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-blue-500/50 transition">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-semibold text-lg mb-2">{share.marketerName}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-300">
                            <span>مبلغ: <span className="text-green-400 font-semibold">{formatCurrency(share.shareAmount)} تومان</span></span>
                            {share.sharePercentage && <span>درصد: {share.sharePercentage}%</span>}
                            {share.period && <span>دوره: {share.period}</span>}
                            <span>تاریخ: {formatDate(share.paymentDate)}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(share.paymentStatus)}
                        </div>
                      </div>
                      {share.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <div className="text-xs text-gray-400">{share.notes}</div>
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

