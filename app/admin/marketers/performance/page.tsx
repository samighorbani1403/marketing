'use client'

import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/AdminSidebar'

interface Performance {
  id: string
  marketerId?: string
  marketerName: string
  period?: string
  salesCount: number
  salesAmount: number
  newClients: number
  campaignsCount: number
  conversionRate?: number
  notes?: string
  createdAt: string
}

export default function MarketersPerformancePage() {
  const [performances, setPerformances] = useState<Performance[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Form fields
  const [marketerId, setMarketerId] = useState('')
  const [marketerName, setMarketerName] = useState('')
  const [period, setPeriod] = useState('')
  const [salesCount, setSalesCount] = useState('')
  const [salesAmount, setSalesAmount] = useState('')
  const [newClients, setNewClients] = useState('')
  const [campaignsCount, setCampaignsCount] = useState('')
  const [conversionRate, setConversionRate] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchPerformances()
  }, [])

  const fetchPerformances = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/marketers/performance')
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.performances) {
          setPerformances(data.performances)
        }
      }
    } catch (error) {
      console.error('Error fetching performances:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!marketerName.trim()) {
      alert('لطفاً نام بازاریاب را وارد کنید')
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch('/api/marketers/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marketerId: marketerId || null,
          marketerName,
          period: period || null,
          salesCount: salesCount || 0,
          salesAmount: salesAmount || 0,
          newClients: newClients || 0,
          campaignsCount: campaignsCount || 0,
          conversionRate: conversionRate || null,
          notes: notes || null
        })
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          alert('عملکرد با موفقیت ثبت شد')
          // Reset form
          setMarketerId('')
          setMarketerName('')
          setPeriod('')
          setSalesCount('')
          setSalesAmount('')
          setNewClients('')
          setCampaignsCount('')
          setConversionRate('')
          setNotes('')
          fetchPerformances()
        } else {
          alert(data.error || 'خطا در ثبت عملکرد')
        }
      } else {
        const err = await res.json()
        alert(err.error || 'خطا در ثبت عملکرد')
      }
    } catch (error) {
      console.error('Error saving performance:', error)
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

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex overflow-hidden" dir="rtl">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
          <div className="px-6 py-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              عملکرد بازاریابان
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Form */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4">ثبت عملکرد جدید</h2>
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
                    <label className="block text-sm text-gray-300 mb-2">دوره (ماه/سال)</label>
                    <input
                      type="month"
                      value={period}
                      onChange={e => setPeriod(e.target.value)}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">تعداد فروش</label>
                    <input
                      type="number"
                      value={salesCount}
                      onChange={e => setSalesCount(e.target.value)}
                      min="0"
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">مبلغ فروش (تومان)</label>
                    <input
                      type="number"
                      value={salesAmount}
                      onChange={e => setSalesAmount(e.target.value)}
                      min="0"
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">مشتریان جدید</label>
                    <input
                      type="number"
                      value={newClients}
                      onChange={e => setNewClients(e.target.value)}
                      min="0"
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">تعداد کمپین‌ها</label>
                    <input
                      type="number"
                      value={campaignsCount}
                      onChange={e => setCampaignsCount(e.target.value)}
                      min="0"
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">نرخ تبدیل (درصد)</label>
                    <input
                      type="number"
                      value={conversionRate}
                      onChange={e => setConversionRate(e.target.value)}
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="0"
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
                    {isSaving ? 'در حال ثبت...' : 'ثبت عملکرد'}
                  </button>
                </div>
              </form>
            </div>

            {/* Performances List */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">لیست عملکردها</h2>
                <button
                  onClick={fetchPerformances}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition"
                >
                  به‌روزرسانی
                </button>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : performances.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  هیچ عملکردی ثبت نشده است
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {performances.map(perf => (
                    <div key={perf.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-blue-500/50 transition">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-semibold text-lg">{perf.marketerName}</h3>
                        {perf.period && (
                          <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">{perf.period}</span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-gray-400 text-xs mb-1">تعداد فروش</div>
                          <div className="text-white font-medium">{perf.salesCount}</div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-xs mb-1">مبلغ فروش</div>
                          <div className="text-green-400 font-medium">{formatCurrency(perf.salesAmount)} تومان</div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-xs mb-1">مشتریان جدید</div>
                          <div className="text-white font-medium">{perf.newClients}</div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-xs mb-1">کمپین‌ها</div>
                          <div className="text-white font-medium">{perf.campaignsCount}</div>
                        </div>
                        {perf.conversionRate && (
                          <div className="col-span-2">
                            <div className="text-gray-400 text-xs mb-1">نرخ تبدیل</div>
                            <div className="text-blue-400 font-medium">{perf.conversionRate.toFixed(2)}%</div>
                          </div>
                        )}
                      </div>
                      {perf.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <div className="text-xs text-gray-400">{perf.notes}</div>
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

