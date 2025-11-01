'use client'

import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/AdminSidebar'

interface CommissionType {
  id: string
  name: string
}

interface Assignment {
  id: string
  commissionTypeId: string
  commissionTypeName?: string
  marketerId?: string
  marketerName: string
  factor?: string
  factorValue?: string
  additionalRate: number
  isActive: boolean
  createdAt: string
}

export default function CommissionAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [types, setTypes] = useState<CommissionType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  
  // Form fields
  const [commissionTypeId, setCommissionTypeId] = useState('')
  const [marketerId, setMarketerId] = useState('')
  const [marketerName, setMarketerName] = useState('')
  const [factor, setFactor] = useState('')
  const [factorValue, setFactorValue] = useState('')
  const [additionalRate, setAdditionalRate] = useState('')
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    fetchAssignments()
    fetchTypes()
  }, [])

  const fetchAssignments = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/marketers/commissions/assignments')
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.assignments) {
          setAssignments(data.assignments)
        }
      }
    } catch (error) {
      console.error('Error fetching assignments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTypes = async () => {
    try {
      const res = await fetch('/api/marketers/commissions/types?isActive=true')
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.types) {
          setTypes(data.types)
        }
      }
    } catch (error) {
      console.error('Error fetching types:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!commissionTypeId || !marketerName.trim()) {
      alert('لطفاً نوع پورسانت و نام بازاریاب را انتخاب کنید')
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch('/api/marketers/commissions/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commissionTypeId,
          marketerId: marketerId || null,
          marketerName,
          factor: factor || null,
          factorValue: factorValue || null,
          additionalRate: additionalRate || 0,
          isActive
        })
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          alert('تخصیص با موفقیت ثبت شد')
          // Reset form
          setCommissionTypeId('')
          setMarketerId('')
          setMarketerName('')
          setFactor('')
          setFactorValue('')
          setAdditionalRate('')
          setIsActive(true)
          setShowForm(false)
          fetchAssignments()
        } else {
          alert(data.error || 'خطا در ثبت تخصیص')
        }
      } else {
        const err = await res.json()
        alert(err.error || 'خطا در ثبت تخصیص')
      }
    } catch (error) {
      console.error('Error saving assignment:', error)
      alert('خطا در اتصال به سرور')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex overflow-hidden" dir="rtl">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              تخصیص پورسانت
            </h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-500 hover:to-purple-600 text-white rounded-lg font-medium transition-all"
            >
              {showForm ? 'بستن فرم' : 'افزودن تخصیص جدید'}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Form */}
            {showForm && (
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6 mb-6">
                <h2 className="text-xl font-bold text-white mb-4">ثبت تخصیص جدید</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">نوع پورسانت <span className="text-red-400">*</span></label>
                      <select
                        value={commissionTypeId}
                        onChange={e => setCommissionTypeId(e.target.value)}
                        required
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      >
                        <option value="">انتخاب کنید</option>
                        {types.map(type => (
                          <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                      </select>
                    </div>

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
                      <label className="block text-sm text-gray-300 mb-2">فاکتور تخصیص</label>
                      <select
                        value={factor}
                        onChange={e => setFactor(e.target.value)}
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      >
                        <option value="">انتخاب کنید</option>
                        <option value="senior">ارشد</option>
                        <option value="monthly_target">هدف ماهانه</option>
                        <option value="experience">تجربه</option>
                        <option value="performance">عملکرد</option>
                        <option value="other">سایر</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-300 mb-2">مقدار فاکتور</label>
                      <input
                        type="text"
                        value={factorValue}
                        onChange={e => setFactorValue(e.target.value)}
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        placeholder="مقدار فاکتور"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-300 mb-2">نرخ اضافی (درصد)</label>
                      <input
                        type="number"
                        value={additionalRate}
                        onChange={e => setAdditionalRate(e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        placeholder="0"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="flex items-center gap-2 text-sm text-gray-300">
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={e => setIsActive(e.target.checked)}
                          className="w-4 h-4 bg-gray-800 border-gray-700 rounded"
                        />
                        فعال است
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-500 hover:to-purple-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isSaving ? 'در حال ثبت...' : 'ثبت تخصیص'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Assignments List */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">لیست تخصیص‌ها</h2>

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : assignments.length === 0 ? (
                <div className="text-center py-12 text-gray-400">هیچ تخصیصی ثبت نشده است</div>
              ) : (
                <div className="space-y-3">
                  {assignments.map(assignment => (
                    <div key={assignment.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-blue-500/50 transition">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-lg mb-2">{assignment.marketerName}</h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                            <span>نوع پورسانت: <span className="text-blue-400">{assignment.commissionTypeName || 'تعریف نشده'}</span></span>
                            {assignment.factor && (
                              <span>فاکتور: <span className="text-white">{assignment.factor}</span></span>
                            )}
                            {assignment.factorValue && (
                              <span>مقدار: <span className="text-white">{assignment.factorValue}</span></span>
                            )}
                            {assignment.additionalRate > 0 && (
                              <span>نرخ اضافی: <span className="text-green-400">{assignment.additionalRate}%</span></span>
                            )}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          assignment.isActive 
                            ? 'bg-green-900/40 text-green-300 border border-green-700/50' 
                            : 'bg-gray-700/50 text-gray-400 border border-gray-600/50'
                        }`}>
                          {assignment.isActive ? 'فعال' : 'غیرفعال'}
                        </span>
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

