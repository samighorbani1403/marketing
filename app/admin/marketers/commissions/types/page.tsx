'use client'

import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/AdminSidebar'

interface CommissionType {
  id: string
  name: string
  productCategory?: string
  productName?: string
  commissionRate: number
  commissionType: string
  fixedAmount?: number
  minAmount?: number
  maxAmount?: number
  isActive: boolean
  assignmentsCount: number
  createdAt: string
}

export default function CommissionTypesPage() {
  const [types, setTypes] = useState<CommissionType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  
  // Form fields
  const [name, setName] = useState('')
  const [productCategory, setProductCategory] = useState('')
  const [productName, setProductName] = useState('')
  const [commissionRate, setCommissionRate] = useState('')
  const [commissionType, setCommissionType] = useState('percentage')
  const [fixedAmount, setFixedAmount] = useState('')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    fetchTypes()
  }, [])

  const fetchTypes = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/marketers/commissions/types')
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.types) {
          setTypes(data.types)
        }
      }
    } catch (error) {
      console.error('Error fetching types:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !commissionRate) {
      alert('لطفاً نام و نرخ پورسانت را وارد کنید')
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch('/api/marketers/commissions/types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          productCategory: productCategory || null,
          productName: productName || null,
          commissionRate,
          commissionType,
          fixedAmount: fixedAmount || null,
          minAmount: minAmount || null,
          maxAmount: maxAmount || null,
          isActive
        })
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          alert('نوع پورسانت با موفقیت ثبت شد')
          // Reset form
          setName('')
          setProductCategory('')
          setProductName('')
          setCommissionRate('')
          setCommissionType('percentage')
          setFixedAmount('')
          setMinAmount('')
          setMaxAmount('')
          setIsActive(true)
          setShowForm(false)
          fetchTypes()
        } else {
          alert(data.error || 'خطا در ثبت نوع پورسانت')
        }
      } else {
        const err = await res.json()
        alert(err.error || 'خطا در ثبت نوع پورسانت')
      }
    } catch (error) {
      console.error('Error saving type:', error)
      alert('خطا در اتصال به سرور')
    } finally {
      setIsSaving(false)
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
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              تعریف انواع پورسانت
            </h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-500 hover:to-purple-600 text-white rounded-lg font-medium transition-all"
            >
              {showForm ? 'بستن فرم' : 'افزودن نوع جدید'}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Form */}
            {showForm && (
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6 mb-6">
                <h2 className="text-xl font-bold text-white mb-4">ثبت نوع پورسانت جدید</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">نام نوع پورسانت <span className="text-red-400">*</span></label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        placeholder="مثلاً: پورسانت فروش محصول A"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-300 mb-2">دسته‌بندی محصول</label>
                      <input
                        type="text"
                        value={productCategory}
                        onChange={e => setProductCategory(e.target.value)}
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        placeholder="مثلاً: نرم‌افزار"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-300 mb-2">نام محصول</label>
                      <input
                        type="text"
                        value={productName}
                        onChange={e => setProductName(e.target.value)}
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        placeholder="نام محصول خاص"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-300 mb-2">نوع پورسانت <span className="text-red-400">*</span></label>
                      <select
                        value={commissionType}
                        onChange={e => setCommissionType(e.target.value)}
                        required
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      >
                        <option value="percentage">درصدی</option>
                        <option value="fixed">ثابت</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-300 mb-2">
                        {commissionType === 'percentage' ? 'نرخ پورسانت (درصد) <span className="text-red-400">*</span>' : 'مبلغ ثابت (تومان) <span className="text-red-400">*</span>'}
                      </label>
                      <input
                        type="number"
                        value={commissionType === 'percentage' ? commissionRate : fixedAmount}
                        onChange={e => commissionType === 'percentage' ? setCommissionRate(e.target.value) : setFixedAmount(e.target.value)}
                        required
                        min="0"
                        step={commissionType === 'percentage' ? '0.01' : '1'}
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        placeholder={commissionType === 'percentage' ? 'مثلاً: 5' : 'مثلاً: 100000'}
                      />
                    </div>

                    {commissionType === 'percentage' && (
                      <>
                        <div>
                          <label className="block text-sm text-gray-300 mb-2">حداقل مبلغ فروش (تومان)</label>
                          <input
                            type="number"
                            value={minAmount}
                            onChange={e => setMinAmount(e.target.value)}
                            min="0"
                            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-300 mb-2">حداکثر مبلغ فروش (تومان)</label>
                          <input
                            type="number"
                            value={maxAmount}
                            onChange={e => setMaxAmount(e.target.value)}
                            min="0"
                            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                            placeholder="0"
                          />
                        </div>
                      </>
                    )}

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
                      {isSaving ? 'در حال ثبت...' : 'ثبت نوع پورسانت'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Types List */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">لیست انواع پورسانت</h2>

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : types.length === 0 ? (
                <div className="text-center py-12 text-gray-400">هیچ نوع پورسانتی ثبت نشده است</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {types.map(type => (
                    <div key={type.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-blue-500/50 transition">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-semibold text-lg">{type.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          type.isActive 
                            ? 'bg-green-900/40 text-green-300 border border-green-700/50' 
                            : 'bg-gray-700/50 text-gray-400 border border-gray-600/50'
                        }`}>
                          {type.isActive ? 'فعال' : 'غیرفعال'}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        {type.productCategory && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">دسته‌بندی:</span>
                            <span className="text-white">{type.productCategory}</span>
                          </div>
                        )}
                        {type.productName && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">محصول:</span>
                            <span className="text-white">{type.productName}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">نوع:</span>
                          <span className="text-white">{type.commissionType === 'percentage' ? 'درصدی' : 'ثابت'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">
                            {type.commissionType === 'percentage' ? 'نرخ:' : 'مبلغ:'}
                          </span>
                          <span className="text-blue-400 font-semibold">
                            {type.commissionType === 'percentage' 
                              ? `${type.commissionRate}%` 
                              : `${formatCurrency(type.fixedAmount || 0)} تومان`}
                          </span>
                        </div>
                        {(type.minAmount || type.maxAmount) && (
                          <div className="text-xs text-gray-500">
                            محدوده: {type.minAmount ? formatCurrency(type.minAmount) : 'بدون حد'} - {type.maxAmount ? formatCurrency(type.maxAmount) : 'بدون حد'}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>تخصیص‌ها: {type.assignmentsCount}</span>
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

