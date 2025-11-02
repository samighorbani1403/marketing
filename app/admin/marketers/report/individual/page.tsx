'use client'

import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import moment from 'moment-jalaali'

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
}

interface Share {
  id: string
  marketerName: string
  shareAmount: number
  period?: string
  paymentStatus: string
}

export default function IndividualReportPage() {
  const [performances, setPerformances] = useState<Performance[]>([])
  const [shares, setShares] = useState<Share[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMarketer, setSelectedMarketer] = useState('')
  const [filterPeriod, setFilterPeriod] = useState('')
  const [persianPeriod, setPersianPeriod] = useState('')

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
    if (selectedMarketer) {
      fetchData()
    }
  }, [selectedMarketer, filterPeriod])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const perfUrl = `/api/marketers/performance?marketerId=${selectedMarketer}${filterPeriod ? `&period=${filterPeriod}` : ''}`
      const shareUrl = `/api/marketers/shares?marketerId=${selectedMarketer}${filterPeriod ? `&period=${filterPeriod}` : ''}`
      
      const [perfRes, shareRes] = await Promise.all([
        fetch(perfUrl),
        fetch(shareUrl)
      ])

      if (perfRes.ok) {
        const perfData = await perfRes.json()
        if (perfData.success && perfData.performances) {
          setPerformances(perfData.performances)
        }
      }

      if (shareRes.ok) {
        const shareData = await shareRes.json()
        if (shareData.success && shareData.shares) {
          setShares(shareData.shares)
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount)
  }

  const totalSales = performances.reduce((sum, p) => sum + p.salesAmount, 0)
  const totalShares = shares.reduce((sum, s) => sum + s.shareAmount, 0)

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex overflow-hidden" dir="rtl">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
          <div className="px-6 py-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              گزارش بر اساس بازاریاب
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Filters */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">انتخاب بازاریاب</label>
                  <input
                    type="text"
                    value={selectedMarketer}
                    onChange={e => setSelectedMarketer(e.target.value)}
                    placeholder="نام بازاریاب را وارد کنید"
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">فیلتر دوره (شمسی)</label>
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
              </div>
            </div>

            {selectedMarketer && (
              <>
                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-700/50 rounded-xl p-4">
                    <div className="text-sm text-gray-300 mb-1">مجموع فروش</div>
                    <div className="text-2xl font-bold text-blue-400">{formatCurrency(totalSales)} تومان</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 border border-green-700/50 rounded-xl p-4">
                    <div className="text-sm text-gray-300 mb-1">مجموع سهم</div>
                    <div className="text-2xl font-bold text-green-400">{formatCurrency(totalShares)} تومان</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-700/50 rounded-xl p-4">
                    <div className="text-sm text-gray-300 mb-1">تعداد عملکردها</div>
                    <div className="text-2xl font-bold text-purple-400">{performances.length}</div>
                  </div>
                </div>

                {/* Performances */}
                <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6 mb-6">
                  <h2 className="text-xl font-bold text-white mb-4">عملکردها</h2>
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                  ) : performances.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">هیچ عملکردی یافت نشد</div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {performances.map(perf => (
                        <div key={perf.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                          <div className="text-white font-semibold mb-3">{perf.marketerName}</div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <div className="text-gray-400 text-xs mb-1">فروش</div>
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
                              <div>
                                <div className="text-gray-400 text-xs mb-1">نرخ تبدیل</div>
                                <div className="text-blue-400 font-medium">{perf.conversionRate.toFixed(2)}%</div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Shares */}
                <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">سهم‌ها</h2>
                  {shares.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">هیچ سهمی یافت نشد</div>
                  ) : (
                    <div className="space-y-3">
                      {shares.map(share => (
                        <div key={share.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-white font-semibold">{share.marketerName}</div>
                              <div className="text-sm text-gray-400 mt-1">
                                مبلغ: <span className="text-green-400">{formatCurrency(share.shareAmount)} تومان</span>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs ${
                              share.paymentStatus === 'paid' 
                                ? 'bg-green-900/40 text-green-300 border border-green-700/50' 
                                : 'bg-yellow-900/40 text-yellow-300 border border-yellow-700/50'
                            }`}>
                              {share.paymentStatus === 'paid' ? 'پرداخت شده' : 'در انتظار'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

