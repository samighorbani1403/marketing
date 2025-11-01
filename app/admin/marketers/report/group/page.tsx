'use client'

import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/AdminSidebar'

interface GroupedData {
  marketerName: string
  totalSales: number
  totalShares: number
  performanceCount: number
  shareCount: number
}

export default function GroupReportPage() {
  const [groupedData, setGroupedData] = useState<GroupedData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filterPeriod, setFilterPeriod] = useState('')

  useEffect(() => {
    fetchGroupData()
  }, [filterPeriod])

  const fetchGroupData = async () => {
    setIsLoading(true)
    try {
      const perfUrl = `/api/marketers/performance${filterPeriod ? `?period=${filterPeriod}` : ''}`
      const shareUrl = `/api/marketers/shares${filterPeriod ? `?period=${filterPeriod}` : ''}`
      
      const [perfRes, shareRes] = await Promise.all([
        fetch(perfUrl),
        fetch(shareUrl)
      ])

      const performances: any[] = []
      const shares: any[] = []

      if (perfRes.ok) {
        const perfData = await perfRes.json()
        if (perfData.success && perfData.performances) {
          performances.push(...perfData.performances)
        }
      }

      if (shareRes.ok) {
        const shareData = await shareRes.json()
        if (shareData.success && shareData.shares) {
          shares.push(...shareData.shares)
        }
      }

      // Group data by marketer
      const grouped: { [key: string]: GroupedData } = {}
      
      performances.forEach(p => {
        if (!grouped[p.marketerName]) {
          grouped[p.marketerName] = {
            marketerName: p.marketerName,
            totalSales: 0,
            totalShares: 0,
            performanceCount: 0,
            shareCount: 0
          }
        }
        grouped[p.marketerName].totalSales += p.salesAmount
        grouped[p.marketerName].performanceCount++
      })

      shares.forEach(s => {
        if (!grouped[s.marketerName]) {
          grouped[s.marketerName] = {
            marketerName: s.marketerName,
            totalSales: 0,
            totalShares: 0,
            performanceCount: 0,
            shareCount: 0
          }
        }
        grouped[s.marketerName].totalShares += s.shareAmount
        grouped[s.marketerName].shareCount++
      })

      setGroupedData(Object.values(grouped))
    } catch (error) {
      console.error('Error fetching group data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount)
  }

  const grandTotalSales = groupedData.reduce((sum, d) => sum + d.totalSales, 0)
  const grandTotalShares = groupedData.reduce((sum, d) => sum + d.totalShares, 0)

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex overflow-hidden" dir="rtl">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
          <div className="px-6 py-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              گزارش گیری گروهی
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Filter */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-300 mb-2">فیلتر دوره</label>
                  <input
                    type="month"
                    value={filterPeriod}
                    onChange={e => setFilterPeriod(e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="pt-6">
                  <button
                    onClick={fetchGroupData}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-500 hover:to-purple-600 text-white rounded-lg font-medium transition-all"
                  >
                    به‌روزرسانی
                  </button>
                </div>
              </div>
            </div>

            {/* Grand Totals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-700/50 rounded-xl p-6">
                <div className="text-sm text-gray-300 mb-2">مجموع کل فروش‌ها</div>
                <div className="text-3xl font-bold text-blue-400">{formatCurrency(grandTotalSales)} تومان</div>
              </div>
              <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 border border-green-700/50 rounded-xl p-6">
                <div className="text-sm text-gray-300 mb-2">مجموع کل سهم‌ها</div>
                <div className="text-3xl font-bold text-green-400">{formatCurrency(grandTotalShares)} تومان</div>
              </div>
            </div>

            {/* Grouped Data Table */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">گزارش گروهی بازاریابان</h2>
              
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : groupedData.length === 0 ? (
                <div className="text-center py-12 text-gray-400">هیچ داده‌ای یافت نشد</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-right p-4 text-sm text-gray-300">بازاریاب</th>
                        <th className="text-right p-4 text-sm text-gray-300">مجموع فروش</th>
                        <th className="text-right p-4 text-sm text-gray-300">مجموع سهم</th>
                        <th className="text-right p-4 text-sm text-gray-300">تعداد عملکرد</th>
                        <th className="text-right p-4 text-sm text-gray-300">تعداد سهم</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedData.map((data, idx) => (
                        <tr key={idx} className="border-b border-gray-700/50 hover:bg-gray-800/30 transition">
                          <td className="p-4 text-white font-medium">{data.marketerName}</td>
                          <td className="p-4 text-green-400 font-semibold">{formatCurrency(data.totalSales)} تومان</td>
                          <td className="p-4 text-blue-400 font-semibold">{formatCurrency(data.totalShares)} تومان</td>
                          <td className="p-4 text-gray-300">{data.performanceCount}</td>
                          <td className="p-4 text-gray-300">{data.shareCount}</td>
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

