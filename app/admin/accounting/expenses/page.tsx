'use client'

import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import moment from 'moment-jalaali'

interface Expense {
  id: string
  title: string
  expenseDate: string
  amount: number
  paidBy?: string
  createdAt: string
}

export default function AdminExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Form fields
  const [title, setTitle] = useState('')
  const [expenseDate, setExpenseDate] = useState('')
  const [persianExpenseDate, setPersianExpenseDate] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState('')

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/accounting/expenses')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      alert('لطفاً عنوان هزینه را وارد کنید')
      return
    }

    if (!persianExpenseDate) {
      alert('لطفاً تاریخ هزینه را وارد کنید')
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('لطفاً مبلغ هزینه را وارد کنید')
      return
    }

    // Convert Persian date to Gregorian
    let gregorianExpenseDate: string
    try {
      const dateParts = persianExpenseDate.split('/')
      if (dateParts.length !== 3) {
        alert('فرمت تاریخ صحیح نیست. لطفاً به فرمت 1403/01/15 وارد کنید')
        return
      }
      
      const jYear = parseInt(dateParts[0])
      const jMonth = parseInt(dateParts[1])
      const jDay = parseInt(dateParts[2])
      
      if (isNaN(jYear) || isNaN(jMonth) || isNaN(jDay)) {
        alert('لطفاً تاریخ را به درستی وارد کنید')
        return
      }
      
      const m = moment(`${jYear}/${jMonth}/${jDay}`, 'jYYYY/jMM/jDD')
      if (!m.isValid()) {
        alert('تاریخ وارد شده معتبر نیست')
        return
      }
      
      gregorianExpenseDate = m.format('YYYY-MM-DD')
    } catch (error) {
      alert('خطا در تبدیل تاریخ. لطفاً تاریخ را به فرمت 1403/01/15 وارد کنید')
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch('/api/accounting/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          expenseDate: gregorianExpenseDate,
          amount,
          paidBy: paidBy.trim() || null
        })
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          alert('هزینه با موفقیت ثبت شد')
          // Reset form
          setTitle('')
          setExpenseDate('')
          setPersianExpenseDate('')
          setAmount('')
          setPaidBy('')
          fetchExpenses()
        } else {
          alert(data.error || 'خطا در ثبت هزینه')
        }
      } else {
        const err = await res.json()
        alert(err.error || 'خطا در ثبت هزینه')
      }
    } catch (error) {
      console.error('Error saving expense:', error)
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount)
  }

  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0)

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex overflow-hidden" dir="rtl">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
          <div className="px-6 py-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              ثبت هزینه‌های جاری ماهانه
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Form */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4">ثبت هزینه جدید</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-300 mb-2">عنوان هزینه <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      required
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="مثال: خرید ملزومات اداری"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">تاریخ هزینه (شمسی) <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      value={persianExpenseDate}
                      onChange={e => {
                        const value = e.target.value.replace(/[^0-9/]/g, '')
                        setPersianExpenseDate(value)
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
                    <label className="block text-sm text-gray-300 mb-2">مبلغ هزینه <span className="text-red-400">*</span></label>
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

                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-300 mb-2">پرداخت کننده</label>
                    <input
                      type="text"
                      value={paidBy}
                      onChange={e => setPaidBy(e.target.value)}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="نام شخصی که هزینه را پرداخت کرده"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-500 hover:to-purple-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isSaving ? 'در حال ثبت...' : 'ثبت هزینه'}
                  </button>
                </div>
              </form>
            </div>

            {/* Expenses List */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">گزارش هزینه‌های جاری</h2>
                  {expenses.length > 0 && (
                    <p className="text-sm text-gray-400 mt-1">
                      مجموع هزینه‌ها: <span className="text-green-400 font-semibold">{formatCurrency(totalAmount)} تومان</span>
                    </p>
                  )}
                </div>
                <button
                  onClick={fetchExpenses}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition"
                >
                  به‌روزرسانی
                </button>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : expenses.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  هیچ هزینه‌ای ثبت نشده است
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
          </div>
        </main>
      </div>
    </div>
  )
}

