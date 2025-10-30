'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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

export default function NewInvoicePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [client, setClient] = useState<any>(null)
  const [invoiceType, setInvoiceType] = useState<'quotation' | 'invoice'>('quotation')
  const [formData, setFormData] = useState({
    clientId: '',
    number: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: '',
    terms: '',
    discount: 0,
    tax: 9
  })
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }
  ])
  const [payments, setPayments] = useState<Payment[]>([])
  
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const clientId = searchParams.get('clientId')
    const type = searchParams.get('type') as 'quotation' | 'invoice'
    
    if (clientId) {
      setFormData(prev => ({ ...prev, clientId }))
      fetchClient(clientId)
    }
    
    if (type) {
      setInvoiceType(type)
    }
    
    // Generate invoice number
    generateInvoiceNumber(type || 'quotation')
  }, [searchParams])

  const fetchClient = async (clientId: string) => {
    try {
      const response = await fetch(`/api/clients/${clientId}`)
      if (response.ok) {
        const data = await response.json()
        setClient(data.client)
      }
    } catch (error) {
      console.error('Error fetching client:', error)
    }
  }

  const generateInvoiceNumber = (type: string) => {
    const prefix = type === 'quotation' ? 'QF' : 'INV'
    const timestamp = Date.now().toString().slice(-6)
    const number = `${prefix}-${timestamp}`
    setFormData(prev => ({ ...prev, number }))
  }

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(prevItems => 
      prevItems.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice
          }
          return updatedItem
        }
        return item
      })
    )
  }

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    }
    setItems(prevItems => [...prevItems, newItem])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(prevItems => prevItems.filter(item => item.id !== id))
    }
  }

  const addPayment = () => {
    const newPayment: Payment = {
      id: Date.now().toString(),
      amount: 0,
      method: 'cash',
      date: new Date().toISOString().split('T')[0],
      reference: ''
    }
    setPayments(prevPayments => [...prevPayments, newPayment])
  }

  const removePayment = (id: string) => {
    setPayments(prevPayments => prevPayments.filter(payment => payment.id !== id))
  }

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0)
  }

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal()
    return (subtotal * formData.discount) / 100
  }

  const calculateTax = () => {
    const subtotal = calculateSubtotal()
    const discount = calculateDiscount()
    return ((subtotal - discount) * formData.tax) / 100
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const discount = calculateDiscount()
    const tax = calculateTax()
    return subtotal - discount + tax
  }

  const calculatePaidAmount = () => {
    return payments.reduce((sum, payment) => sum + payment.amount, 0)
  }

  const calculateRemainingAmount = () => {
    return calculateTotal() - calculatePaidAmount()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const invoiceData = {
        ...formData,
        type: invoiceType,
        items,
        payments,
        subtotal: calculateSubtotal(),
        discount: calculateDiscount(),
        tax: calculateTax(),
        total: calculateTotal(),
        paidAmount: calculatePaidAmount(),
        remainingAmount: calculateRemainingAmount()
      }

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      })

      if (response.ok) {
        const data = await response.json()
        alert(`${invoiceType === 'quotation' ? 'پیش فاکتور' : 'فاکتور'} با موفقیت ایجاد شد`)
        router.push('/invoices')
      } else {
        const errorData = await response.json()
        alert('خطا در ایجاد فاکتور: ' + (errorData.error || 'خطای نامشخص'))
      }
    } catch (error) {
      console.error('Error creating invoice:', error)
      alert('خطا در ایجاد فاکتور')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/clients')
  }

  const generatePDF = () => {
    // This would integrate with a PDF generation library
    alert('قابلیت تولید PDF در نسخه بعدی اضافه خواهد شد')
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex overflow-hidden" dir="rtl">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4 space-x-reverse">
                <button
                  onClick={handleCancel}
                  className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {invoiceType === 'quotation' ? 'ایجاد پیش فاکتور' : 'ایجاد فاکتور'}
                  </h1>
                  <p className="text-gray-400 mt-1">
                    {client ? `برای: ${client.name}` : 'انتخاب مشتری'}
                  </p>
                </div>
              </div>
              <div className="flex space-x-3 space-x-reverse">
                <button
                  onClick={generatePDF}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <svg className="w-5 h-5 inline-block ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  تولید PDF
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Invoice Header */}
              <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                  <svg className="w-6 h-6 text-blue-400 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  اطلاعات {invoiceType === 'quotation' ? 'پیش فاکتور' : 'فاکتور'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">شماره {invoiceType === 'quotation' ? 'پیش فاکتور' : 'فاکتور'}</label>
                    <input
                      type="text"
                      value={formData.number}
                      onChange={(e) => setFormData({...formData, number: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">تاریخ</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      required
                    />
                  </div>
                  {invoiceType === 'invoice' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">تاریخ سررسید</label>
                      <input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">تخفیف (%)</label>
                    <input
                      type="number"
                      value={formData.discount}
                      onChange={(e) => setFormData({...formData, discount: parseFloat(e.target.value) || 0})}
                      min="0"
                      max="100"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">مالیات (%)</label>
                    <input
                      type="number"
                      value={formData.tax}
                      onChange={(e) => setFormData({...formData, tax: parseFloat(e.target.value) || 0})}
                      min="0"
                      max="100"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">یادداشت‌ها</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                    placeholder="یادداشت‌ها و توضیحات اضافی"
                  />
                </div>
              </div>

              {/* Invoice Items */}
              <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <svg className="w-6 h-6 text-green-400 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    آیتم‌های {invoiceType === 'quotation' ? 'پیش فاکتور' : 'فاکتور'}
                  </h2>
                  <button
                    type="button"
                    onClick={addItem}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105"
                  >
                    <svg className="w-4 h-4 inline-block ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    افزودن آیتم
                  </button>
                </div>
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-800/50 rounded-xl">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-1">توضیحات</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                          placeholder="توضیحات آیتم"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">تعداد</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          min="0"
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">قیمت واحد</label>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          min="0"
                          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        />
                      </div>
                      <div className="flex items-end">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-300 mb-1">مجموع</label>
                          <div className="px-3 py-2 bg-gray-700/30 border border-gray-600 rounded-lg text-white">
                            {item.total.toLocaleString()} تومان
                          </div>
                        </div>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="ml-2 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payments Section (for invoices only) */}
              {invoiceType === 'invoice' && (
                <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center">
                      <svg className="w-6 h-6 text-yellow-400 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      پیش پرداخت‌ها
                    </h2>
                    <button
                      type="button"
                      onClick={addPayment}
                      className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105"
                    >
                      <svg className="w-4 h-4 inline-block ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      افزودن پرداخت
                    </button>
                  </div>
                  <div className="space-y-4">
                    {payments.map((payment, index) => (
                      <div key={payment.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-800/50 rounded-xl">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">مبلغ</label>
                          <input
                            type="number"
                            value={payment.amount}
                            onChange={(e) => {
                              const updatedPayments = payments.map(p => 
                                p.id === payment.id ? { ...p, amount: parseFloat(e.target.value) || 0 } : p
                              )
                              setPayments(updatedPayments)
                            }}
                            min="0"
                            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">روش پرداخت</label>
                          <select
                            value={payment.method}
                            onChange={(e) => {
                              const updatedPayments = payments.map(p => 
                                p.id === payment.id ? { ...p, method: e.target.value } : p
                              )
                              setPayments(updatedPayments)
                            }}
                            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                          >
                            <option value="cash">نقدی</option>
                            <option value="bank">حواله بانکی</option>
                            <option value="card">کارت</option>
                            <option value="check">چک</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">تاریخ</label>
                          <input
                            type="date"
                            value={payment.date}
                            onChange={(e) => {
                              const updatedPayments = payments.map(p => 
                                p.id === payment.id ? { ...p, date: e.target.value } : p
                              )
                              setPayments(updatedPayments)
                            }}
                            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                          />
                        </div>
                        <div className="flex items-end">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-300 mb-1">شماره مرجع</label>
                            <input
                              type="text"
                              value={payment.reference || ''}
                              onChange={(e) => {
                                const updatedPayments = payments.map(p => 
                                  p.id === payment.id ? { ...p, reference: e.target.value } : p
                                )
                                setPayments(updatedPayments)
                              }}
                              className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                              placeholder="شماره مرجع"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removePayment(payment.id)}
                            className="ml-2 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invoice Summary */}
              <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                  <svg className="w-6 h-6 text-purple-400 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  خلاصه {invoiceType === 'quotation' ? 'پیش فاکتور' : 'فاکتور'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">مجموع آیتم‌ها:</span>
                      <span className="text-white font-medium">{calculateSubtotal().toLocaleString()} تومان</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">تخفیف ({formData.discount}%):</span>
                      <span className="text-red-400">-{calculateDiscount().toLocaleString()} تومان</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">مالیات ({formData.tax}%):</span>
                      <span className="text-blue-400">+{calculateTax().toLocaleString()} تومان</span>
                    </div>
                    <div className="border-t border-gray-600 pt-3">
                      <div className="flex justify-between">
                        <span className="text-white font-bold text-lg">مجموع کل:</span>
                        <span className="text-white font-bold text-lg">{calculateTotal().toLocaleString()} تومان</span>
                      </div>
                    </div>
                  </div>
                  
                  {invoiceType === 'invoice' && (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-300">مبلغ پرداخت شده:</span>
                        <span className="text-green-400 font-medium">{calculatePaidAmount().toLocaleString()} تومان</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">مبلغ باقی‌مانده:</span>
                        <span className={`font-medium ${calculateRemainingAmount() > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                          {calculateRemainingAmount().toLocaleString()} تومان
                        </span>
                      </div>
                      <div className="border-t border-gray-600 pt-3">
                        <div className="flex justify-between">
                          <span className="text-white font-bold">وضعیت:</span>
                          <span className={`font-bold ${
                            calculateRemainingAmount() === 0 ? 'text-green-400' : 
                            calculatePaidAmount() > 0 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {calculateRemainingAmount() === 0 ? 'پرداخت شده' : 
                             calculatePaidAmount() > 0 ? 'نیمه پرداخت' : 'پرداخت نشده'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 space-x-reverse">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
                >
                  {isLoading ? 'در حال ذخیره...' : `ایجاد ${invoiceType === 'quotation' ? 'پیش فاکتور' : 'فاکتور'}`}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
