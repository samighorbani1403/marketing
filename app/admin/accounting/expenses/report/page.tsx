'use client'

import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/AdminSidebar'

interface Expense {
  id: string
  title: string
  expenseDate: string
  amount: number
  paidBy?: string
  createdAt: string
}

export default function ExpensesReportPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filterMonth, setFilterMonth] = useState('')
  const [filterYear, setFilterYear] = useState('')

  useEffect(() => {
    fetchExpenses()
  }, [filterMonth, filterYear])

  const fetchExpenses = async () => {
    setIsLoading(true)
    try {
      let url = '/api/accounting/expenses?'
      if (filterMonth && filterYear) {
        url += `month=${filterMonth}&year=${filterYear}`
      }
      
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.expenses) {
          setExpenses(data.expenses)
        }
      }
    } catch (error) {
      console.error('Error fetching expenses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount)
  }

  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0)

  // Group by paidBy
  const groupedByPaidBy = expenses.reduce((acc: any, exp) => {
    const key = exp.paidBy || 'نامشخص'
    if (!acc[key]) {
      acc[key] = { total: 0, count: 0, items: [] }
    }
    acc[key].total += exp.amount
    acc[key].count += 1
    acc[key].items.push(exp)
    return acc
  }, {})

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex overflow-hidden" dir="rtl">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
          <div className="px-6 py-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              گزارش هزینه‌های جاری
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Filters */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6 mb-6">
              <div className="flex gap-4 flex-wrap">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">ماه</label>
                  <input
                    type="number"
                    value={filterMonth}
                    onChange={e => setFilterMonth(e.target.value)}
                    min="1"
                    max="12"
                    placeholder="ماه (1-12)"
                    className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">سال</label>
                  <input
                    type="number"
                    value={filterYear}
                    onChange={e => setFilterYear(e.target.value)}
                    min="1400"
                    placeholder="سال"
                    className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setFilterMonth('')
                      setFilterYear('')
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition"
                  >
                    پاک کردن فیلترها
                  </button>
                </div>
              </div>
            </div>

            {/* Summary */}
            {expenses.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 border border-green-700/50 rounded-xl p-4">
                  <div className="text-green-300 text-sm mb-1">تعداد هزینه‌ها</div>
                  <div className="text-2xl font-bold text-white">{expenses.length}</div>
                </div>
                <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-700/50 rounded-xl p-4">
                  <div className="text-blue-300 text-sm mb-1">مجموع هزینه‌ها</div>
                  <div className="text-2xl font-bold text-white">{formatCurrency(totalAmount)} تومان</div>
                </div>
              </div>
            )}

            {/* Expenses List */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4">لیست هزینه‌ها</h2>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : expenses.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  هیچ هزینه‌ای یافت نشد
                </div>
              ) : (
                <div className="space-y-3">
                  {expenses.map(expense => (
                    <div key={expense.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-blue-500/50 transition">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-semibold mb-1">{expense.title}</h3>
                          <div className="text-sm text-gray-400">
                            تاریخ: {formatDate(expense.expenseDate)}
                            {expense.paidBy && <span className="mr-4">• پرداخت کننده: {expense.paidBy}</span>}
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="text-xl font-bold text-green-400">{formatCurrency(expense.amount)}</div>
                          <div className="text-xs text-gray-500">تومان</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Grouped by PaidBy */}
            {Object.keys(groupedByPaidBy).length > 0 && (
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">گروه‌بندی بر اساس پرداخت کننده</h2>
                <div className="space-y-4">
                  {Object.entries(groupedByPaidBy).map(([paidBy, data]: [string, any]) => (
                    <div key={paidBy} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-semibold">{paidBy}</h3>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-400">{formatCurrency(data.total)} تومان</div>
                          <div className="text-xs text-gray-500">{data.count} هزینه</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

