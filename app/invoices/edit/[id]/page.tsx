'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface Payment {
  id: string
  amount: number
  method: string
  date: string
  reference?: string
}

interface Invoice {
  id: string
  clientId: string
  type: 'quotation' | 'invoice'
  number: string
  date: string
  dueDate?: string
  items: InvoiceItem[]
  payments: Payment[]
  subtotal: number
  discount: number
  tax: number
  total: number
  paidAmount: number
  remainingAmount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  notes: string
  terms: string
  createdAt: string
}

interface Client {
  id: string
  name: string
  company?: string
}

export default function EditInvoicePage() {
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    if (params.id) {
      fetchInvoice(params.id as string)
      fetchClients()
    }
  }, [params.id])

  const fetchInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`)
      if (response.ok) {
        const data = await response.json()
        setInvoice(data.invoice)
      } else {
        console.error('Failed to fetch invoice')
        router.push('/invoices')
      }
    } catch (error) {
      console.error('Error fetching invoice:', error)
      router.push('/invoices')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      if (response.ok) {
        const data = await response.json()
        setClients(data.clients)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    if (!invoice) return
    
    setInvoice({
      ...invoice,
      [field]: value
    })
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    if (!invoice) return
    
    const newItems = [...invoice.items]
    newItems[index] = {
      ...newItems[index],
      [field]: value
    }
    
    // Recalculate total for this item
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice
    }
    
    // Recalculate invoice totals
    const subtotal = newItems.reduce((sum, item) => sum + item.total, 0)
    const total = subtotal - invoice.discount + invoice.tax
    const remainingAmount = total - invoice.paidAmount
    
    setInvoice({
      ...invoice,
      items: newItems,
      subtotal,
      total,
      remainingAmount
    })
  }

  const addItem = () => {
    if (!invoice) return
    
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    }
    
    setInvoice({
      ...invoice,
      items: [...invoice.items, newItem]
    })
  }

  const removeItem = (index: number) => {
    if (!invoice) return
    
    const newItems = invoice.items.filter((_, i) => i !== index)
    const subtotal = newItems.reduce((sum, item) => sum + item.total, 0)
    const total = subtotal - invoice.discount + invoice.tax
    const remainingAmount = total - invoice.paidAmount
    
    setInvoice({
      ...invoice,
      items: newItems,
      subtotal,
      total,
      remainingAmount
    })
  }

  const handleSave = async () => {
    if (!invoice) return
    
    setIsSaving(true)
    
    try {
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoice),
      })

      if (response.ok) {
        alert('فاکتور با موفقیت ویرایش شد')
        router.push(`/invoices/${invoice.id}`)
      } else {
        const errorData = await response.json()
        alert('خطا در ویرایش فاکتور: ' + (errorData.error || 'خطای نامشخص'))
      }
    } catch (error) {
      console.error('Error updating invoice:', error)
      alert('خطا در ویرایش فاکتور')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">فاکتور یافت نشد</h2>
          <button
            onClick={() => router.push('/invoices')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            بازگشت به لیست فاکتورها
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex overflow-hidden" dir="rtl">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  ویرایش فاکتور - {invoice.number}
                </h1>
                <p className="text-gray-400 mt-1">ویرایش اطلاعات فاکتور</p>
              </div>
              <div className="flex space-x-3 space-x-reverse">
                <button
                  onClick={() => router.push(`/invoices/${invoice.id}`)}
                  className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  انصراف
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Basic Information */}
            <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">اطلاعات پایه</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">مشتری</label>
                  <select
                    value={invoice.clientId}
                    onChange={(e) => handleInputChange('clientId', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="">انتخاب مشتری</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name} {client.company && `(${client.company})`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">نوع</label>
                  <select
                    value={invoice.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="quotation">پیش فاکتور</option>
                    <option value="invoice">فاکتور</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">شماره فاکتور</label>
                  <input
                    type="text"
                    value={invoice.number}
                    onChange={(e) => handleInputChange('number', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">تاریخ</label>
                  <input
                    type="date"
                    value={invoice.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                {invoice.type === 'invoice' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">سررسید</label>
                    <input
                      type="date"
                      value={invoice.dueDate || ''}
                      onChange={(e) => handleInputChange('dueDate', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">وضعیت</label>
                  <select
                    value={invoice.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="draft">پیش‌نویس</option>
                    <option value="sent">ارسال شده</option>
                    <option value="paid">پرداخت شده</option>
                    <option value="overdue">سررسید گذشته</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Invoice Items */}
            <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">آیتم‌های فاکتور</h2>
                <button
                  onClick={addItem}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <svg className="w-5 h-5 inline-block ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  افزودن آیتم
                </button>
              </div>
              
              <div className="space-y-4">
                {invoice.items.map((item, index) => (
                  <div key={item.id} className="bg-gray-800/50 rounded-xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">شرح</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">تعداد</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">قیمت واحد</label>
                        <input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-white font-medium">
                        مجموع: {item.total.toLocaleString()} تومان
                      </div>
                      <button
                        onClick={() => removeItem(index)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-all duration-300"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">خلاصه مالی</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">تخفیف</label>
                  <input
                    type="number"
                    min="0"
                    value={invoice.discount}
                    onChange={(e) => {
                      const discount = parseInt(e.target.value) || 0
                      const total = invoice.subtotal - discount + invoice.tax
                      const remainingAmount = total - invoice.paidAmount
                      handleInputChange('discount', discount)
                      handleInputChange('total', total)
                      handleInputChange('remainingAmount', remainingAmount)
                    }}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">مالیات</label>
                  <input
                    type="number"
                    min="0"
                    value={invoice.tax}
                    onChange={(e) => {
                      const tax = parseInt(e.target.value) || 0
                      const total = invoice.subtotal - invoice.discount + tax
                      const remainingAmount = total - invoice.paidAmount
                      handleInputChange('tax', tax)
                      handleInputChange('total', total)
                      handleInputChange('remainingAmount', remainingAmount)
                    }}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">مبلغ کل</label>
                  <div className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white font-bold text-lg">
                    {invoice.total.toLocaleString()} تومان
                  </div>
                </div>
              </div>
            </div>

            {/* Notes and Terms */}
            <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">یادداشت‌ها</label>
                  <textarea
                    value={invoice.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">شرایط و ضوابط</label>
                  <textarea
                    value={invoice.terms}
                    onChange={(e) => handleInputChange('terms', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
