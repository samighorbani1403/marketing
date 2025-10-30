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
  email?: string
  phone?: string
}

export default function InvoiceDetailsPage() {
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    if (params.id) {
      fetchInvoice(params.id as string)
    }
  }, [params.id])

  const fetchInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`)
      if (response.ok) {
        const data = await response.json()
        setInvoice(data.invoice)
        fetchClient(data.invoice.clientId)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      case 'sent':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'paid':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'overdue':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return 'پیش‌نویس'
      case 'sent':
        return 'ارسال شده'
      case 'paid':
        return 'پرداخت شده'
      case 'overdue':
        return 'سررسید گذشته'
      default:
        return 'نامشخص'
    }
  }

  const getTypeText = (type: string) => {
    return type === 'quotation' ? 'پیش فاکتور' : 'فاکتور'
  }

  const getTypeColor = (type: string) => {
    return type === 'quotation' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-orange-500/20 text-orange-400'
  }

  const generatePDF = () => {
    alert('قابلیت تولید PDF در نسخه بعدی اضافه خواهد شد')
  }

  const handleEdit = () => {
    router.push(`/invoices/edit/${invoice?.id}`)
  }

  const handleDelete = async () => {
    if (confirm('آیا مطمئن هستید که می‌خواهید این فاکتور را حذف کنید؟')) {
      try {
        const response = await fetch(`/api/invoices/${invoice?.id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          const result = await response.json()
          alert(`فاکتور "${result.deletedInvoice.number}" با موفقیت حذف شد`)
          router.push('/invoices')
        } else {
          const errorData = await response.json()
          alert('خطا در حذف فاکتور: ' + (errorData.error || 'خطای نامشخص'))
        }
      } catch (error) {
        console.error('Error deleting invoice:', error)
        alert('خطا در حذف فاکتور')
      }
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
                  {getTypeText(invoice.type)} - {invoice.number}
                </h1>
                <p className="text-gray-400 mt-1">جزئیات کامل فاکتور</p>
              </div>
              <div className="flex space-x-3 space-x-reverse">
                <button
                  onClick={generatePDF}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <svg className="w-5 h-5 inline-block ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  تولید PDF
                </button>
                <button
                  onClick={handleEdit}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <svg className="w-5 h-5 inline-block ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  ویرایش
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <svg className="w-5 h-5 inline-block ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  حذف
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Invoice Header */}
            <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Invoice Info */}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">اطلاعات فاکتور</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">شماره فاکتور:</span>
                      <span className="text-white font-medium">{invoice.number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">تاریخ:</span>
                      <span className="text-white">{invoice.date}</span>
                    </div>
                    {invoice.dueDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">سررسید:</span>
                        <span className="text-white">{invoice.dueDate}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-400">نوع:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(invoice.type)}`}>
                        {getTypeText(invoice.type)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">وضعیت:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                        {getStatusText(invoice.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Client Info */}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">اطلاعات مشتری</h2>
                  {client ? (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">نام:</span>
                        <span className="text-white font-medium">{client.name}</span>
                      </div>
                      {client.company && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">شرکت:</span>
                          <span className="text-white">{client.company}</span>
                        </div>
                      )}
                      {client.email && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">ایمیل:</span>
                          <span className="text-white">{client.email}</span>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">تلفن:</span>
                          <span className="text-white">{client.phone}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-400">در حال بارگذاری اطلاعات مشتری...</p>
                  )}
                </div>
              </div>
            </div>

            {/* Invoice Items */}
            <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">آیتم‌های فاکتور</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-right py-3 px-4 text-gray-400 font-medium">شرح</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-medium">تعداد</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">قیمت واحد</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">مجموع</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item) => (
                      <tr key={item.id} className="border-b border-gray-800">
                        <td className="py-3 px-4 text-white">{item.description}</td>
                        <td className="py-3 px-4 text-center text-gray-300">{item.quantity}</td>
                        <td className="py-3 px-4 text-left text-gray-300">{item.unitPrice.toLocaleString()} تومان</td>
                        <td className="py-3 px-4 text-left text-white font-medium">{item.total.toLocaleString()} تومان</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Invoice Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Financial Summary */}
              <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-6">خلاصه مالی</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">جمع کل:</span>
                    <span className="text-white">{invoice.subtotal.toLocaleString()} تومان</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">تخفیف:</span>
                    <span className="text-white">{invoice.discount.toLocaleString()} تومان</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">مالیات:</span>
                    <span className="text-white">{invoice.tax.toLocaleString()} تومان</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-700 pt-3">
                    <span className="text-white font-bold">مبلغ کل:</span>
                    <span className="text-white font-bold text-lg">{invoice.total.toLocaleString()} تومان</span>
                  </div>
                  {invoice.type === 'invoice' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-400">پرداخت شده:</span>
                        <span className="text-green-400">{invoice.paidAmount.toLocaleString()} تومان</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">باقی‌مانده:</span>
                        <span className={`${invoice.remainingAmount > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                          {invoice.remainingAmount.toLocaleString()} تومان
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Payment Progress */}
              {invoice.type === 'invoice' && (
                <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
                  <h2 className="text-2xl font-bold text-white mb-6">پیشرفت پرداخت</h2>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>پرداخت شده</span>
                      <span>{Math.round((invoice.paidAmount / invoice.total) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full"
                        style={{ width: `${(invoice.paidAmount / invoice.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  {invoice.payments.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-white mb-3">تاریخچه پرداخت‌ها</h3>
                      <div className="space-y-2">
                        {invoice.payments.map((payment) => (
                          <div key={payment.id} className="flex justify-between text-sm">
                            <span className="text-gray-400">{payment.date}</span>
                            <span className="text-green-400">{payment.amount.toLocaleString()} تومان</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notes and Terms */}
            {(invoice.notes || invoice.terms) && (
              <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {invoice.notes && (
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-4">یادداشت‌ها</h2>
                      <p className="text-gray-300">{invoice.notes}</p>
                    </div>
                  )}
                  {invoice.terms && (
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-4">شرایط و ضوابط</h2>
                      <p className="text-gray-300">{invoice.terms}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
